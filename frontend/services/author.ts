const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { StoryRecord, UpdateStoryData } from "../types/story.ts";
import { getFullImageUrl } from "../utils/url.ts";
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
        throw new Error(JSON.stringify(body.error));
    }

    return body.story;
}

/**
 * Retrieves a story by ID via the API
 * @param accessToken - The user's authentication token
 * @param storyId - The UUID of the story
 * @returns The story object
 */
export async function retrieveStory(
    accessToken: string,
    storyId: string
): Promise<StoryRecord> {

    const response = await authFetch(
        `${API_BASE_URL}/author/story/${storyId}`,
        accessToken,
        {
            method: "GET",
        }
    );

    const body = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }
    
    if (body.story.imageUrl) {
        body.story.imageUrl = getFullImageUrl(body.story.imageUrl);
    }

    return body.story;
}

/**
 * Updates a story by ID via the API
 * @param accessToken - The user's authentication token
 * @param storyId - The UUID of the story
 * @param updateData - The partial fields to update
 * @returns The updated story object
 */
export async function updateStory(
    accessToken: string,
    storyId: string,
    updateData: {
        title?: string;
        description?: string,
        slug?: string;
        image?: File;
    }
): Promise<StoryRecord> {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
            formData.append(key, val);
        }
    });

    const response = await authFetch(
        `${API_BASE_URL}/author/story/${storyId}`,
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

    if (body.story?.imageUrl) {
        body.story.imageUrl = getFullImageUrl(body.story.imageUrl);
    }

    return body.story;
}