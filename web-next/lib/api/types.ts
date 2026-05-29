/**
 * Shared API error / response types. Used by both the server fetcher
 * (`lib/api/server.ts`) and the browser fetcher (`lib/api/client.ts`).
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiAuthError extends ApiError {
  constructor(payload: unknown, message = "Unauthorized") {
    super(401, payload, message);
    this.name = "ApiAuthError";
  }
}

/**
 * Extracts a human-readable error message from a NestJS error payload.
 * Shape: `{ statusCode, message: string | string[], error }`. Falls back to
 * a generic string when the payload doesn't carry a usable message.
 */
export function extractApiMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (Array.isArray(msg) && msg.length > 0) {
      return msg.filter((m): m is string => typeof m === "string").join(", ") || fallback;
    }
    const err = (payload as { error?: unknown }).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return fallback;
}

/** Legacy pagination envelope: notifications and a few other endpoints use this shape. */
export interface Paged<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}
