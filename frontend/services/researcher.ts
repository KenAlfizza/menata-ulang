const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { ResearchRecord, UpdateResearchData } from "../types/research.ts";
import { getFullImageUrl } from "../utils/url.ts";
import { authFetch } from "./auth.ts";

/**
 * Creates a new research via the API
 * @param accessToken - The user's authentication token
 * @param researchData - The research details including title, slug, description, and optional image
 * @returns The created research object or throws an error
 */
export async function createResearch(accessToken: string, researchData: {
    title: string;
    slug: string;
    description?: string;
    image?: File;
}): Promise<ResearchRecord> {
    const formData = new FormData();
    Object.entries(researchData).forEach(([key, val]) => val && formData.append(key, val));

    const response = await authFetch(`${API_BASE_URL}/researcher/research`, accessToken, {
        method: "POST",
        body: formData,
    });

    const body = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }

    return body.research;
}

/**
 * Retrieves a research by ID via the API
 * @param accessToken - The user's authentication token
 * @param researchId - The UUID of the research
 * @returns The research object
 */
export async function retrieveResearch(
    accessToken: string,
    researchId: string
): Promise<ResearchRecord> {

    const response = await authFetch(
        `${API_BASE_URL}/researcher/research/${researchId}`,
        accessToken,
        {
            method: "GET",
        }
    );

    const body = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }
    
    if (body.research.imageUrl) {
        body.research.imageUrl = getFullImageUrl(body.research.imageUrl);
    }

    return body.research;
}

/**
 * Updates a research by ID via the API
 * @param accessToken - The user's authentication token
 * @param researchId - The UUID of the research
 * @param updateData - The partial fields to update
 * @returns The updated research object
 */
export async function updateResearch(
    accessToken: string,
    researchId: string,
    updateData: UpdateResearchData
): Promise<ResearchRecord> {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, val]) => val && formData.append(key, val));

    const response = await authFetch(
        `${API_BASE_URL}/researcher/research/${researchId}`,
        accessToken,
        {
            method: "PATCH",
            body: formData,
        }
    );

    const body = await response.json();

    if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : JSON.stringify(body.error));
    }

    if (body.research?.imageUrl) {
        body.research.imageUrl = getFullImageUrl(body.research.imageUrl);
    }

    return body.research;
}

/**
 * Updates the publish status of a research entry via the API
 * @param accessToken - The user's authentication token
 * @param researchId - The unique identifier of the research
 * @param published - The target publish state
 * @returns The updated research object
 */
export async function setResearchPublishStatus(
    accessToken: string,
    researchId: string,
    published: boolean
): Promise<ResearchRecord> {
    const formData = new FormData();
    formData.append("published", String(published));

    const response = await authFetch(
        `${API_BASE_URL}/researcher/research/${researchId}/publish`,
        accessToken,
        {
            method: "PATCH",
            body: formData,
        }
    );

    const body = await response.json();

    if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : JSON.stringify(body.error));
    }

    if (body.research?.imageUrl) {
        body.research.imageUrl = getFullImageUrl(body.research.imageUrl);
    }

    return body.research;
}