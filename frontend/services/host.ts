const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { ApiError, ApiErrorResponse } from "../types/error.ts";
import { PodcastRecord, UpdatePodcastData } from "../types/podcast.ts";
import { getFullFileUrl } from "../utils/url.ts";
import { authFetch } from "./auth.ts";

/**
 * Helper function to process and prepare a PodcastRecord from the backend response.
 * This handles converting stored file paths to full public URLs for both images and audio.
 * 
 * @param body - The raw response object containing the podcast data.
 * @returns The processed PodcastRecord with full URLs.
 */
function processPodcastResponse(body: PodcastRecord): PodcastRecord {
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

    return processPodcastResponse(body.podcast);
}

/**
 * Retrieves a single podcast by its ID via the API
 * @param accessToken - The user's authentication token
 * @param id - The unique identifier of the podcast to retrieve
 * @returns The podcast object or throws an error
 */
export async function retrievePodcast(accessToken: string, id: string): Promise<PodcastRecord> {
    const response = await authFetch(`${API_BASE_URL}/host/podcast/${id}`, accessToken, {
        method: "GET",
    });

    const body = await response.json();
    console.log(body)

    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }

    return processPodcastResponse(body.podcast);
}

/**
 * Updates an existing podcast via the API
 * @param accessToken - The user's authentication token
 * @param id - The unique identifier of the podcast to update
 * @param updateData - Optional podcast fields to update (title, slug, description, transcript, published, image, audio)
 * @returns The updated podcast object or throws an error
 */
export async function updatePodcast(
    accessToken: string,
    id: string,
    updateData: UpdatePodcastData
): Promise<PodcastRecord> {
    const formData = new FormData();
    
    // Append only the fields that are provided
    Object.entries(updateData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
            formData.append(key, val);
        }
    });

    const response = await authFetch(`${API_BASE_URL}/host/podcast/${id}`, accessToken, {
        method: "PATCH",
        body: formData,
    });

    const body = await response.json();

    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }

    return processPodcastResponse(body.podcast);
}


/**
 * Deletes a podcast via the API (Soft Delete)
 * @param accessToken - The user's authentication token
 * @param id - The unique identifier of the podcast to delete
 * @returns Resolves to void on success. Throws an ApiError on failure.
 */
export async function deletePodcast(
    accessToken: string,
    id: string
): Promise<void> {
    const response = await authFetch(`${API_BASE_URL}/host/podcast/${id}`, accessToken, {
        method: "DELETE",
    });

    const body = await response.json();

    if (!response.ok) {
        throw new ApiError(body as ApiErrorResponse, response.status);
    }
    
    return Promise.resolve();
}
