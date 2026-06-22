// services/pages.ts
import { Data } from "@puckeditor/core";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL


// Page interface
interface PageRecord {
    id: string;
    title: string;
    data: Data;
}

/**
 * Create a new page call to the backend
 * @param title 
 * @returns 
 */
export async function createPage(title: string): Promise<PageRecord> {
    const response = await fetch(`${API_BASE_URL}/create-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
    });

    if (!response.ok) throw new Error("Failed to create new page entry");
    return response.json();
}

/**
 * Saves layout changes to existing page record by CUID
 */
export async function savePageData(pageId: string, puckData: Data): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/save-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pageId, data: puckData }),
    });

    if (!response.ok) throw new Error(`Failed to save page data for ID: ${pageId}`);
}

/**
 * Loads Puck editor page layout data from the database
 */
export async function loadPageData(pageId: string): Promise<Data> {
    const response = await fetch(`${API_BASE_URL}/story/get-page?id=${pageId}`);

    if (!response.ok) {
        throw new Error(`Failed to load page data for ID: ${pageId}`);
    }

    const json = await response.json();
    return json.data as Data; // Typecast directly to Puck's schema
}


