import { StorageProvider } from "../services/storageInterface.ts";

import { StorageDisk } from "../services/storageDisk.ts";
// import { S3Provider } from "../services/s3Provider.ts"; // hypothetical

const isProduction = Deno.env.get("DENO_ENV") === "production" || 
                     Deno.env.get("DENO_REGION") !== undefined;

// Factory function to get the correct provider
function getStorageProvider(): StorageProvider {
  if (isProduction) {
    // In production, return your configured S3/Cloudflare provider
    // return new S3Provider({ 
    //   bucket: Deno.env.get("S3_BUCKET")!,
    //   region: Deno.env.get("S3_REGION")! 
    // });
  }
  // Default to local disk for development
  return new StorageDisk();
}

// Export a single instance (Singleton)
export const storage = getStorageProvider();


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
