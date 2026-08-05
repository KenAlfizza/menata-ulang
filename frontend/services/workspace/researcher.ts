const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { PaginatedResult } from "../../types/common.ts";
import { getFullImageUrl } from "../../utils/url.ts";
import { authFetch } from "../auth.ts";
import { WorkspaceResearchRecord } from "@/types/workspace";
import { ApiError, ApiErrorResponse } from "@/types/error.ts";

/**
 * Fetch the recently edited research
 * @param accessToken
 * @returns The three most recently edited stories by the user
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchRecentResearches(
    accessToken: string
): Promise<WorkspaceResearchRecord[]> {
    const response = await authFetch(
        `${API_BASE_URL}/researcher/my-researches/recent`, 
        accessToken, 
        { method: "GET" }, 
    );

    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }

    // Update image URL
    const transformedItems = body.items.map((item: WorkspaceResearchRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : null
    }));

    return transformedItems;
}

/**
 * Fetch researches for the author workspace with support for pagination, sorting, and filtering.
 * @param accessToken - The user's auth token
 * @param params - Optional object containing page, limit, sort, order, and filter
 * @returns An object containing the list of researches and pagination metadata
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchMyResearches(
    accessToken: string,
    params: {
        page?: number;
        limit?: number;
        sort?: "title" | "updatedAt";
        order?: "asc" | "desc";
        filter?: string;
    } = {}
): Promise<PaginatedResult<WorkspaceResearchRecord>> {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.order) queryParams.append("order", params.order);
    if (params.filter) queryParams.append("filter", params.filter);

    const response = await authFetch(
        `${API_BASE_URL}/researcher/my-researches?${queryParams.toString()}`,
        accessToken,
        { method: "GET" }
    );

    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }
        
    // Update image URL
    const transformedItems = body.items.map((item: WorkspaceResearchRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : null
    }));
    
    // Return the data to be used by the UI (e.g., Shadcn Pagination)
    return {
        items: transformedItems,
        total: body.total,
        totalPages: body.totalPages,
        page: body.page,
        limit: body.limit
    };
}