/**
 * Public fetch wrapper.
 *
 * This function is used for public routes that do not require an access token.
 * It attaches only the standard auth artifact required by the backend:
 * - `credentials: "include"` — sends the httpOnly refresh token cookie.
 * 
 * Note: It does NOT attach an `Authorization` header, as the backend expects a 401
 * only when an access token is explicitly provided but missing/invalid for protected routes.
 *
 * @param url - The full endpoint URL to fetch.
 * @param options - Standard `RequestInit` options.
 */
export function publicFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
        ...options.headers,
    };

    // Only set Content-Type for non-FormData bodies.
    if (!isFormData) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    return fetch(url, {
        ...options,
        credentials: "include", // Critical: Ensures the refresh token cookie is sent to the backend
        headers,
    });
}
