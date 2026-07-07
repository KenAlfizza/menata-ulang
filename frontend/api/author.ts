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

/**
 * Fetch stories for the author workspace with support for pagination, sorting, and filtering.
 * @param accessToken - The user's auth token
 * @param params - Optional object containing page, limit, sort, order, and filter
 * @returns An object containing the list of stories and pagination metadata
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchMyStories(
    accessToken: string,
    params: {
        page?: number;
        limit?: number;
        sort?: "title" | "updatedAt";
        order?: "asc" | "desc";
        filter?: string;
    } = {}
): Promise<{ 
    stories: RecentStoryRecord[]; 
    totalCount: number; 
    totalPages: number; 
    page: number;
    limit: number 
}> {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.order) queryParams.append("order", params.order);
    if (params.filter) queryParams.append("filter", params.filter);

    const response = await authFetch(
        `${API_BASE_URL}/author/my-stories/?${queryParams.toString()}`,
        accessToken,
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status} ${response.statusText}`);
    }

    // Capture the full response object
    const data = await response.json();
    
    // Return the data to be used by the UI (e.g., Shadcn Pagination)
    return {
        stories: data.stories,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit
    };
}