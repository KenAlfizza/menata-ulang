/**
 * Authenticated fetch wrapper.
 *
 * Attaches the two auth artifacts required by the backend on every request:
 * - `credentials: "include"` — sends the httpOnly refresh token cookie.
 * - `Authorization: Bearer <token>` — sends the in-memory access token.
 *
 * Callers pass `accessToken` from `useAuth()` at the call site rather than
 * reading it here, keeping this function free of React context dependencies
 * and safe to call outside of components (e.g. in tests or server actions).
 *
 * @param url - The full endpoint URL to fetch.
 * @param accessToken - The in-memory access token from `useAuth()`.
 * @param options - Standard `RequestInit` options merged on top of the defaults.
 */
export function authFetch(url: string, accessToken: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
}