const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
import { authFetch } from "../auth.ts";
import { getFullImageUrl } from "../../utils/url.ts";

/**
 * Upload a standalone image via the Editor API
 * @param accessToken - The user's authentication token
 * @param file - The image file to be uploaded
 * @returns An object containing the permanent imageUrl
 */
export async function uploadImage(
    accessToken: string,
    image: File,
): Promise<{ imageUrl: string }> {
    
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append("image", image);

    const response = await authFetch(
        `${API_BASE_URL}/editor/upload-image`,
        accessToken,
        {
            method: "POST",
            // Note: Do NOT set "Content-Type" to "application/json" or "multipart/form-data" manually.
            // When passing FormData, fetch automatically sets the correct Content-Type with the boundary string.
            body: formData
        }
    );
    const body = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(body.error));
    }
    return { imageUrl: getFullImageUrl(body.imageUrl) || "" };
}