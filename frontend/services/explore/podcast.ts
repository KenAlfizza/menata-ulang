import { publicFetch } from "../public.ts";
import { ExplorePodcastRecord, ExplorePodcastSummary } from "@/types/explore/podcast.ts"
import { ApiError } from "@/types/error.ts";
import { getFullFileUrl } from "@/utils/url.ts";
import { ExploreFilter } from "@/types/explore/explore.ts";
import { PaginatedResult } from "@/types/common.ts";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
/**
 * Helper function to process and prepare a PodcastRecord from the backend response.
 * This handles converting stored file paths to full public URLs for both images and audio.
 * 
 * @param body - The raw response object containing the podcast data.
 * @returns The processed PodcastRecord with full URLs.
 */
function processPodcastSummaryResponse(body: ExplorePodcastSummary) {
    if (!body) {
        throw new Error("Podcast record data is missing or undefined.");
    }

    // Safely check and assign URLs if they exist
    if (body.imageUrl) {
        body.imageUrl = getFullFileUrl(body.imageUrl);
    }
    if (body.audioUrl) {
        body.audioUrl = getFullFileUrl(body.audioUrl);
    }

    return body;
}

function processPodcastResponse(body: ExplorePodcastRecord) {
    if (!body) {
        throw new Error("Podcast record data is missing or undefined.");
    }

    // Safely check and assign URLs if they exist
    if (body.imageUrl) {
        body.imageUrl = getFullFileUrl(body.imageUrl);
    }
    if (body.audioUrl) {
        body.audioUrl = getFullFileUrl(body.audioUrl);
    }

    return body;
}


/**
 * Fetch a single podcast record by its slug using ApiError handling.
 */
export async function getPodcast(slug: string): Promise<ExplorePodcastRecord> {
    const response = await publicFetch(`${API_BASE_URL}/explore/podcast/${slug}`, { method: "GET" });

    if (!response.ok) {
        let errorResponse;
        try {
            errorResponse = await response.json();
        } catch {
            errorResponse = {
                success: false,
                error: {
                    message: `Failed to fetch podcast: ${response.statusText}`,
                    code: "UNKNOWN_ERROR",
                },
            };
        }
        // Throw the structured ApiError
        throw new ApiError(errorResponse, response.status);
    }

    const data = await response.json();
    return processPodcastResponse(data.data);
}

/**
 * Fetch a paginated explore feed for podcasts with optional query filters.
 */
export async function getPodcasts(params?: ExploreFilter): Promise<PaginatedResult<ExplorePodcastSummary>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.order) queryParams.append("order", params.order);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/explore/podcast${queryString ? `?${queryString}` : ""}`;

    const response = await publicFetch(url, { method: "GET" });

    if (!response.ok) {
        let errorResponse;
        try {
            errorResponse = await response.json();
        } catch {
            errorResponse = {
                success: false,
                error: {
                    message: `Failed to fetch podcasts: ${response.statusText}`,
                    code: "UNKNOWN_ERROR",
                },
            };
        }
        throw new ApiError(errorResponse, response.status);
    }

    const data = await response.json();
    return {
        items: data.items.map((item: ExplorePodcastSummary) => processPodcastSummaryResponse(item)),
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
    };
}

/**
 * Fetch a single most popular podcast record
 */
export async function getPodcastPopular(): Promise<ExplorePodcastSummary> {
    const response = await publicFetch(`${API_BASE_URL}/explore/podcast/popular`, { method: "GET" });

    if (!response.ok) {
        let errorResponse;
        try {
            errorResponse = await response.json();
        } catch {
            errorResponse = {
                success: false,
                error: {
                    message: `Failed to fetch podcast: ${response.statusText}`,
                    code: "UNKNOWN_ERROR",
                },
            };
        }
        // Throw the structured ApiError
        throw new ApiError(errorResponse, response.status);
    }

    const data = await response.json();
    return processPodcastSummaryResponse(data.data);
}