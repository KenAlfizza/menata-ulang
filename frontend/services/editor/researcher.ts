const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

import { Data } from "@puckeditor/core";
import { ResearchPageRecord } from "../../types/page.ts";
import { authFetch } from "../auth.ts";
import { ApiError, ApiErrorResponse } from "@/types/error.ts"

/**
 * Retrieves a research page by ID via the API
 * @param accessToken - The user's authentication token
 * @param pageId - The UUID of the research page
 * @returns The research page object
 */
export async function retrieveResearchPage(
    accessToken: string,
    pageId: string
): Promise<ResearchPageRecord> {

    const response = await authFetch(
        `${API_BASE_URL}/researcher/research/page/${pageId}`,
        accessToken,
        {
            method: "GET",
        }
    );

    const body = await response.json();
    if (!response.ok) {
        // Pass both the parsed JSON body and the HTTP response status header
        throw new ApiError(body as ApiErrorResponse, response.status);
    }
    return body.researchPage;
}

/**
 * Update a research page by ID via the API
 * @param accessToken - The user's authentication token
 * @param pageId - The UUID of the research page
 * @param puckData - The Puck editor data
 * @returns The research page object
 */
export async function updateResearchPage(
    accessToken: string,
    pageId: string,
    puckData: Data,
): Promise<ResearchPageRecord> {

    const response = await authFetch(
        `${API_BASE_URL}/researcher/research/page/${pageId}`,
        accessToken,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ puckData })
        }
    );

    const body = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }
    return body.researchPage;
}