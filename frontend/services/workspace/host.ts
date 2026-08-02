import { WorkspacePodcastRecord } from "@/types/workspace.ts";
import { ApiError, ApiErrorResponse } from "@/types/error.ts";
import { authFetch } from "@/services/auth.ts";
import { getFullFileUrl } from "../../utils/url.ts";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND;

/**
 * Fetch the recently edited podcasts
 * @param accessToken
 * @returns The three most recently edited podcasts by the user
 * @throws If the backend returns a non-2xx response.
 */
export async function fetchRecentPodcasts(
    accessToken: string
): Promise<WorkspacePodcastRecord[]> {
    const response = await authFetch(
        `${API_BASE_URL}/host/podcasts/recent`, 
        accessToken, 
        { method: "GET" }, 
    );

    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }

    // Update image URL
    const transformedItems = body.items.map((item: WorkspacePodcastRecord) => ({
        ...item,
        imageUrl: item.imageUrl ? getFullFileUrl(item.imageUrl) : null,
        audioUrl: item.audioUrl ? getFullFileUrl(item.audioUrl) : null,
    }));

    return transformedItems;
}