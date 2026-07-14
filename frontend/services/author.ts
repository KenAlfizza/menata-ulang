const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { StoryRecord } from "../types/story.ts";
import { authFetch } from "./auth.ts";

/**
 * Creates a new story via the API
 * @param accessToken - The user's authentication token
 * @param storyData - The story details including title, slug, description, and optional image
 * @returns The created story object or throws an error
 */
export async function createStory(accessToken: string, storyData: {
    title: string;
    slug: string;
    description?: string;
    image?: File;
}): Promise<StoryRecord> {
    const formData = new FormData();
    Object.entries(storyData).forEach(([key, val]) => val && formData.append(key, val));

    const response = await authFetch(`${API_BASE_URL}/author/story`, accessToken, {
        method: "POST",
        body: formData,
    });

    const body = await response.json();

    if (!response.ok) {
        // Standardized throw: the UI can now just look for body.error
        throw new Error(JSON.stringify(body.error));
    }

    return body.story;
}