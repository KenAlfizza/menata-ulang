import { publicFetch } from "../public.ts";
import { ExplorePodcastRecord } from "../../types/explore.ts";
import { ApiError } from "../../types/error.ts";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
    return data.data;
}