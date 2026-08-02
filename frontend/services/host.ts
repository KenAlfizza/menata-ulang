const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { ApiError, ApiErrorResponse } from "../types/error.ts";
import { PodcastRecord } from "../types/podcast.ts";
import { getFullFileUrl } from "../utils/url.ts";
import { authFetch } from "./auth.ts";

/**
 * Creates a new podcast via the API
 * @param accessToken - The user's authentication token
 * @param podcastData - The podcast details including title, slug, description, transcript, image, and audio
 * @returns The created podcast object or throws an error
 */
export async function createPodcast(accessToken: string, podcastData: {
    title: string;
    slug: string;
    description?: string;
    transcript?: string;
    image?: File;
    audio?: File;
}): Promise<PodcastRecord> {
    const formData = new FormData();
    Object.entries(podcastData).forEach(([key, val]) => val && formData.append(key, val));

    const response = await authFetch(`${API_BASE_URL}/host/podcast`, accessToken, {
        method: "POST",
        body: formData,
    });

    const body = await response.json();

    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }

    if (body.podcast.imageUrl) {
        body.podcast.imageUrl = getFullFileUrl(body.podcast.imageUrl);
    }

    if (body.podcast.audioUrl) {
        body.podcast.audioUrl = getFullFileUrl(body.podcast.audioUrl);
    }

    return body.podcast;
}