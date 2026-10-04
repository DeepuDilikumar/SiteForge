export type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "invalid_input"
  | "limit_reached"
  | "pro_required"
  | "rate_limited"
  | "ai_failed"
  | "places_failed"
  | "server_error";

export type ApiError = { code: ErrorCode; message: string };
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
