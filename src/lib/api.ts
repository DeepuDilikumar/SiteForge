import { NextResponse } from "next/server";
import type { z } from "zod";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import type { ErrorCode, Result } from "@/lib/result";

const STATUS: Record<ErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  invalid_input: 400,
  limit_reached: 402,
  pro_required: 402,
  rate_limited: 429,
  ai_failed: 502,
  places_failed: 502,
  server_error: 500,
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<Result<T>>({ ok: true, data }, init);
}

export function fail(code: ErrorCode, message: string) {
  return NextResponse.json<Result<never>>({ ok: false, error: { code, message } }, { status: STATUS[code] });
}

export class HttpError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError("unauthorized", "Sign in to continue.");
  return user;
}

export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new HttpError("invalid_input", "The request body must be JSON.");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new HttpError("invalid_input", issue ? `${issue.path.join(".") || "Input"}: ${issue.message}` : "Invalid input.");
  }
  return parsed.data;
}

/** Wrap a route handler so thrown HttpErrors become typed results and nothing leaks a stack trace. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof HttpError) return fail(error.code, error.message);
      console.error(error);
      return fail("server_error", "Something went wrong on our side. Try again in a moment.");
    }
  };
}
