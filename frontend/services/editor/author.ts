const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { Data } from "@puckeditor/core";
import { StoryPageRecord } from "../../types/page.ts";
import { authFetch } from "../auth.ts";

/**
 * Retrieves a story page by ID via the API
 * @param accessToken - The user's authentication token
 * @param storyId - The UUID of the story
 * @returns The story object
 */
export async function retrieveStoryPage(
    accessToken: string,
    pageId: string
): Promise<StoryPageRecord> {

    const response = await authFetch(
        `${API_BASE_URL}/author/story/page/${pageId}`,
        accessToken,
        {
            method: "GET",
        }
    );

    const body = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }
    return body.storyPage;
}

/**
 * Update a story page by ID via the API
 * @param accessToken - The user's authentication token
 * @param storyId - The UUID of the story
 * @returns The story object
 */
export async function updateStoryPage(
    accessToken: string,
    pageId: string,
    puckData: Data,
): Promise<StoryPageRecord> {

    const response = await authFetch(
        `${API_BASE_URL}/author/story/page/${pageId}`,
        accessToken,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ puckData })
        }
    );

    const body = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }
    return body.storyPage;
}
