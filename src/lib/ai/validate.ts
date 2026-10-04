import type { z } from "zod";
import { AiError } from "./types";

export type JsonGenerator = (prompt: string) => Promise<string>;

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

function describeIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `- ${issue.path.join(".") || "(root)"}: ${issue.message}`).join("\n");
}

/**
 * Ask the model for JSON and validate it. On a validation failure, retry once with the
 * validation errors appended to the prompt; if that also fails, throw an AiError.
 */
export async function generateValidated<T>(
  schema: z.ZodType<T>,
  prompt: string,
  generate: JsonGenerator,
): Promise<T> {
  let lastProblem = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const fullPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour previous answer was rejected for these reasons:\n${lastProblem}\nReturn corrected JSON only.`;
    let raw: string;
    try {
      raw = await generate(fullPrompt);
    } catch (error) {
      throw new AiError(error instanceof Error ? error.message : "The AI provider did not respond.", "provider_error");
    }
    let data: unknown;
    try {
      data = parseJson(raw);
    } catch {
      lastProblem = "- The answer was not valid JSON.";
      continue;
    }
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    lastProblem = describeIssues(result.error);
  }
  throw new AiError(`The AI returned copy that did not pass validation:\n${lastProblem}`, "invalid_output");
}
