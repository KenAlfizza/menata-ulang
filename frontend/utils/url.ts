const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

/**
 * Ensures the image URL is absolute by prepending the API base URL
 * if the image path is relative.
 */
export function getFullImageUrl(imagePath?: string | null): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    
    // Ensure we prepend '/files' to reach your static file Hono instance
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    
    // Assuming API_BASE_URL points to the domain/port where your Hono server is running
    return `${API_BASE_URL}/files/${cleanPath}`;
}

/**
 * Ensures the image URL is absolute by prepending the API base URL
 * if the file path is relative.
 */
export function getFullFileUrl(imagePath?: string | null): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    
    // Ensure we prepend '/files' to reach your static file Hono instance
    const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    
    // Assuming API_BASE_URL points to the domain/port where your Hono server is running
    return `${API_BASE_URL}/files/${cleanPath}`;
}