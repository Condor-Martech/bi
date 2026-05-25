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

/** Legacy pagination envelope: notifications and a few other endpoints use this shape. */
export interface Paged<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}
