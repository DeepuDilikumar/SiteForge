import type { Result } from "@/lib/result";

/** Fetch a JSON route handler and always get a typed Result back, even on network failure. */
export async function api<T>(url: string, init?: { method?: string; body?: unknown }): Promise<Result<T>> {
  try {
    const response = await fetch(url, {
      method: init?.method ?? (init?.body ? "POST" : "GET"),
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
    const body = (await response.json().catch(() => null)) as Result<T> | null;
    if (body && typeof body === "object" && "ok" in body) return body;
    return { ok: false, error: { code: "server_error", message: "The server sent an unexpected response. Try again." } };
  } catch {
    return { ok: false, error: { code: "server_error", message: "We couldn't reach the server. Check your connection and try again." } };
  }
}
