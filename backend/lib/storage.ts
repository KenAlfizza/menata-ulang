import { StorageProvider } from "../services/storageInterface.ts";

/** 
 * Silently delete a file
 * @param url   : file url to delete
 * @param label : file label (old file or uploaded file)
 */
export const silentDelete = async (storage: StorageProvider, url: string, label: string) => {
    try {
        await storage.delete(url);
    } catch (error) {
        console.error(`Failed deleting ${label}: ${url}`, error);
    }
}