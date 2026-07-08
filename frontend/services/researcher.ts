const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { Data } from "@puckeditor/core";
import { authFetch } from "./auth.ts";
import { ResearchRecord } from "../types/research.ts";

/**
 * Creates a new research page record.
 */
export async function createResearch(
  title: string,
  slug: string,
  description: string,
  accessToken: string
): Promise<ResearchRecord> {
  // Slug sanitized on backend, but following your established pattern 
  // of client-side consistency:
  const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

  const response = await authFetch(`${API_BASE_URL}/researcher/`, accessToken, {
    method: "POST",
    body: JSON.stringify({ title, slug: sanitizedSlug, description }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create research page");
  }

  const json = await response.json();
  return json.research;
}

/**
 * Updates an existing research page (Puck data, metadata, or publish status).
 */
export async function updateResearch(
  pageId: string,
  updateData: { data?: Data; published?: boolean; title?: string; description?: string },
  accessToken: string
): Promise<ResearchRecord> {
  const response = await authFetch(`${API_BASE_URL}/researcher/page/${pageId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update research page: ${pageId}`);
  }

  const json = await response.json();
  return json.page;
}