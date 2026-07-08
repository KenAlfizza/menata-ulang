const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { authFetch } from "../auth.ts";
import { WorkspaceResearchRecord } from "@/types/workspace";

/**
 * Fetch the recently edited research
 * @param accessToken
 * @returns The three most recently edited stories by the user
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchRecentStories(
    accessToken: string
): Promise<WorkspaceResearchRecord[]> {
    const response = await authFetch(
        `${API_BASE_URL}/author/my-researches/recent`, 
        accessToken, 
        { method: "GET" }, 
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch recent researches: ${response.status} ${response.statusText}`);
    }
    const { researches } = await response.json();
    return researches;
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
): Promise<{ 
    researches: WorkspaceResearchRecord[]; 
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
        `${API_BASE_URL}/author/my-researches/?${queryParams.toString()}`,
        accessToken,
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch researches: ${response.status} ${response.statusText}`);
    }

    // Capture the full response object
    const data = await response.json();
    
    // Return the data to be used by the UI (e.g., Shadcn Pagination)
    return {
        researches: data.researches,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit
    };
}

