const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { PaginatedResult } from "../../types/common.ts";
import { WorkspacePodcastRecord } from "@/types/workspace.ts";
import { ApiError, ApiErrorResponse } from "@/types/error.ts";
import { authFetch } from "@/services/auth.ts";
import { getFullFileUrl } from "../../utils/url.ts";

/**
 * Fetch the recently edited podcasts
 * @param accessToken
 * @returns The three most recently edited podcasts by the user
 * @throws If the backend returns a non-2xx response.
 */
export async function retrieveRecentPodcasts(
    accessToken: string
): Promise<PaginatedResult<WorkspacePodcastRecord>> {
    const response = await authFetch(
        `${API_BASE_URL}/host/my-podcasts/recent`, 
        accessToken, 
        { method: "GET" }, 
    );

    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }
    // Handle hono wrapper
    const data = body.data ?? body;
    
    // Update image URL
    const transformedItems = data.items.map((item: WorkspacePodcastRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullFileUrl(item.imageUrl) : null,
        audioUrl: item.audioUrl ? getFullFileUrl(item.audioUrl) : null,
    }));
    console.log("data", transformedItems)
    return transformedItems;
}

/**
 * Fetch podcasts for the host workspace with support for pagination, sorting, and filtering.
 * @param accessToken - The user's auth token
 * @param params - Optional object containing page, limit, sort, order, search, and published status
 * @returns An object containing the list of podcasts and pagination metadata
 * @throws If the backend returns a non-2xx response.
 */
export async function retrieveMyPodcasts(
    accessToken: string,
    params: {
        page?: number;
        limit?: number;
        sort?: "title" | "updatedAt";
        order?: "asc" | "desc";
        search?: string;
        published?: boolean;
    } = {}
): Promise<PaginatedResult<WorkspacePodcastRecord>> {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append("page", params.page.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.order) queryParams.append("order", params.order);
    if (params.search) queryParams.append("search", params.search);
    if (params.published !== undefined) queryParams.append("published", params.published.toString());

    const queryString = queryParams.toString();

    const response = await authFetch(
        `${API_BASE_URL}/host/my-podcasts?${queryString}`, 
        accessToken,
        { method: "GET" }
    );

    const body = await response.json();

    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }

    // Handle potential data wrapper (e.g., if Hono wraps response inside `body.data`)
    const sourceData = body.data ?? body;

    // Update image and audio URLs
    const transformedItems = sourceData.items.map((item: WorkspacePodcastRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullFileUrl(item.imageUrl) : null,
        audioUrl: item.audioUrl ? getFullFileUrl(item.audioUrl) : null,
    }));

    // Return the formatted result to be used by the UI (e.g., Shadcn Pagination)
    return {
        items: transformedItems,
        total: sourceData.total,
        page: sourceData.page,
        limit: sourceData.limit,
        totalPages: sourceData.totalPages,
    };
}