import { Data } from "@puckeditor/core";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * `StoryPage` model returned by the backend.
 * Aligned with the Prisma schema fields in `prisma/schema.prisma`.
 */
interface StoryPageRecord {
  id: string;
  title: string;
  slug: string;
  puckData: Data;
  authorId: string;
  published: boolean;
}

/**
 * Authenticated fetch wrapper used by all story service functions.
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
function authFetch(url: string, accessToken: string, options: RequestInit = {}): Promise<Response> {
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

/**
 * Creates a new story page record on the backend.
 *
 * The slug is sanitized on the frontend before sending to match the backend's
 * own sanitization logic — lowercased and stripped of any characters outside
 * `[a-z0-9-_]`. A collision-proof slug should be passed by the caller (e.g.
 * `draft-${Date.now()}-${randomSuffix}`) to avoid Prisma unique constraint
 * errors from React StrictMode's double-invoke behaviour in development.
 *
 * @param title - The display title of the new page.
 * @param slug - The URL-safe identifier for the page. Will be sanitized.
 * @param accessToken - The in-memory access token from `useAuth()`.
 * @returns The newly created `StoryPageRecord` including its generated CUID.
 * @throws If the backend returns a non-2xx response.
 */
export async function createStoryPage(
  title: string,
  slug: string,
  accessToken: string
): Promise<StoryPageRecord> {
  const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

  const response = await authFetch(`${API_BASE_URL}/story/page`, accessToken, {
    method: "POST",
    body: JSON.stringify({ title, slug: sanitizedSlug }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create new page entry");
  }

  const json = await response.json();
  return json.page; // Backend returns { message, ok, page }
}

/**
 * Persists the current Puck layout to an existing story page record.
 *
 * Sends a `PATCH` request with the full `puckData` JSON. The backend expects
 * the body shape `{ data: Data, published?: boolean }` — the `published` flag
 * is omitted here, leaving the backend's existing value unchanged.
 *
 * @param pageId - The CUID of the page record to update.
 * @param puckData - The full Puck `Data` object representing the current layout.
 * @param accessToken - The in-memory access token from `useAuth()`.
 * @throws If the backend returns a non-2xx response.
 */
export async function saveStoryPageData(
  pageId: string,
  puckData: Data,
  accessToken: string
): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/story/page/${pageId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ data: puckData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to save page data for ID: ${pageId}`);
  }
}

/**
 * Fetches the Puck layout data for an existing story page.
 *
 * The backend returns `{ ok: true, page: { ..., puckData: Data } }`.
 * Only the `puckData` field is extracted and returned — the caller receives
 * the layout directly and is not exposed to the full page record shape.
 *
 * @param pageId - The CUID of the page record to load.
 * @param accessToken - The in-memory access token from `useAuth()`.
 * @returns The Puck `Data` object stored against the page record.
 * @throws If the backend returns a non-2xx response.
 */
export async function loadStoryPageData(
  pageId: string,
  accessToken: string           
): Promise<Data> {
  const response = await authFetch(`${API_BASE_URL}/story/page/${pageId}`, accessToken, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to load page data for ID: ${pageId}`);
  }

  const json = await response.json();
  return json.page.puckData as Data;
}