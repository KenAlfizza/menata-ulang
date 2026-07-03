const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { authFetch } from "./auth.ts";

/**
 * Recent Story model returned by backend
 */
export interface RecentStoryRecord {
    id: string,
    title: string,
    imageUrl: string,
    published: boolean,
    updatedAt: string,
}

/**
 * Fetch the recently edited stories
 * @param accessToken
 * @returns The three most recently edited stories by the user
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchRecentStories(
    accessToken: string
): Promise<RecentStoryRecord[]> {
    const response = await authFetch(
        `${API_BASE_URL}/author/my-stories/recent`, 
        accessToken, 
        { method: "GET" }, 
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch recent stories: ${response.status} ${response.statusText}`);
    }
    const { stories } = await response.json();
    return stories;
}
