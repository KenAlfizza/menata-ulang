import { publicFetch } from "../public.ts";
import { ExplorePodcastRecord } from "../../types/explore.ts";
import { ApiError } from "../../types/error.ts";
import { getFullFileUrl } from "../../utils/url.ts";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
/**
 * Helper function to process and prepare a PodcastRecord from the backend response.
 * This handles converting stored file paths to full public URLs for both images and audio.
 * 
 * @param body - The raw response object containing the podcast data.
 * @returns The processed PodcastRecord with full URLs.
 */
function processPodcastResponse(body: ExplorePodcastRecord): ExplorePodcastRecord {
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