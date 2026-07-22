const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { WorkspaceStoryRecord } from "@/types/workspace.ts";
import { authFetch } from "../auth.ts";
import { PaginatedResult } from "../../types/common.ts";
import { getFullImageUrl } from "../../utils/url.ts";

/**
 * Fetch the recently edited stories
 * @param accessToken
 * @returns The three most recently edited stories by the user
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchRecentStories(
    accessToken: string
): Promise<WorkspaceStoryRecord[]> {
    const response = await authFetch(
        `${API_BASE_URL}/author/my-stories/recent`, 
        accessToken, 
        { method: "GET" }, 
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch recent stories: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Update image URL
    const transformedItems = data.items.map((item: WorkspaceStoryRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : null
    }));

    console.log("Image URL being sent to next/image:", transformedItems[0].imageUrl);
    return transformedItems;
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
        page?: number,
        limit?: number,
        sort?: "title" | "updatedAt",
        order?: "asc" | "desc",
        search?: string,
    } = {}
): Promise<PaginatedResult<WorkspaceStoryRecord>> {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.order) queryParams.append("order", params.order);
    if (params.search) queryParams.append("filter", params.search);

    console.log("Params: ", queryParams.toString());

    const response = await authFetch(
        `${API_BASE_URL}/author/my-stories?${queryParams.toString()}`,
        accessToken,
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status} ${response.statusText}`);
    }

    // Capture the full response object
    const data = await response.json();
    
    // Update image URL
    const transformedItems = data.items.map((item: WorkspaceStoryRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : null
    }));
    
    // Return the data to be used by the UI (e.g., Shadcn Pagination)
    return {
        items: transformedItems,
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit
    };
}