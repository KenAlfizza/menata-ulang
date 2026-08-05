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
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    ...options.headers,
  };

  // Only set Content-Type for non-FormData bodies. For FormData, the browser
  // must generate its own Content-Type with the multipart boundary — setting
  // it manually (or leaving a hardcoded application/json) breaks the upload.
  if (!isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}