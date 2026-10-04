import { GoogleGenAI } from "@google/genai";
import { OUTREACH_SYSTEM, SITE_COPY_SYSTEM, outreachPrompt, sectionPrompt, siteCopyPrompt } from "./prompts";
import {
  emailDraftSchema,
  sectionSchema,
  siteContentSchema,
  whatsappDraftSchema,
  type OutreachDraft,
  type SectionId,
  type SectionPatch,
  type SiteContent,
} from "./schemas";
import type { CopyProvider, OutreachInput, SectionCopyInput, SiteCopyInput } from "./types";
import { generateValidated, type JsonGenerator } from "./validate";

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
const REQUEST_TIMEOUT_MS = 25_000;

export class GeminiCopyProvider implements CopyProvider {
  readonly kind = "gemini" as const;
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model || DEFAULT_GEMINI_MODEL;
  }

  private generator(systemInstruction: string, temperature: number): JsonGenerator {
    return async (prompt) => {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature,
          abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      });
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response.");
      return text;
    };
  }

  async generateSiteContent(input: SiteCopyInput): Promise<SiteContent> {
    return generateValidated(
      siteContentSchema,
      siteCopyPrompt(input.business, input.template, input.tone),
      this.generator(SITE_COPY_SYSTEM, 0.7),
    );
  }

  async regenerateSection<S extends SectionId>(input: SectionCopyInput<S>): Promise<SectionPatch[S]> {
    return generateValidated(
      sectionSchema(input.section),
      sectionPrompt(input.business, input.template, input.tone, input.section, input.current),
      this.generator(SITE_COPY_SYSTEM, 0.9),
    );
  }

  async draftOutreach(input: OutreachInput): Promise<OutreachDraft> {
    const generate = this.generator(OUTREACH_SYSTEM, 0.6);
    const prompt = outreachPrompt(input);
    if (input.channel === "whatsapp") {
      const { body } = await generateValidated(whatsappDraftSchema, prompt, generate);
      return { subject: null, body };
    }
    return generateValidated(emailDraftSchema, prompt, generate);
  }
}
