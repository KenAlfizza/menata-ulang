import { join } from "path";
import { StorageProvider } from "./storageInterface.ts";
import { extname } from "path";

export class StorageDisk implements StorageProvider {
    private uploadDir: string;

    /**
     * Create a disk storage provider.
     *
     * @param uploadDir Base directory where uploaded files will be stored.
     * Behavior: Initializes the storage provider with a base upload directory.
     * If no directory is provided, files are stored in the default `storage` folder.
     */
    constructor(uploadDir = "storage") {
        this.uploadDir = uploadDir;
    }

    /**
     * Save a file to disk.
     *
     * @param file The file object to store.
     * @param subDir Optional subdirectory within the upload directory.
     *
     * Behavior: Ensures the target directory exists, generates a sanitized
     * filename using a UUID prefix to prevent collisions or malicious filenames,
     * writes the file to disk, and returns the full file path where it was saved.
     *
     * Returns:
     * - string: The path of the saved file.
     */
    async save(file: File, subDir = ""): Promise<string> {
        const targetDir = join(this.uploadDir, subDir);
        await Deno.mkdir(targetDir, { recursive: true });

        // Sanitize filename with a UUID to prevent collisions/attacks
        const fileExt = extname(file.name);
        const fileName = `${crypto.randomUUID() + fileExt}`;
        const filePath = join(targetDir, fileName);

        const bytes = new Uint8Array(await file.arrayBuffer());
        await Deno.writeFile(filePath, bytes);

        return join(subDir, fileName).replace(/\\/g, '/');;
    }

    /**
     * Deletes a file from disk.
     *
     * @param key The file path (key) returned during the save operation.
     * @behavior Attempts to remove the file. If the file does not exist, 
     * it gracefully logs a warning instead of throwing an error.
     */
    async delete(key: string): Promise<void> {
        try {
            const filePath = join(this.uploadDir, key);
            // Deno.remove throws if the path does not exist
            await Deno.remove(filePath);
        } catch (error) {
            // Check if the error is due to the file being missing
            if (error instanceof Deno.errors.NotFound) {
                console.warn(`Storage Cleanup: File not found at ${key}, skipping.`);
            } else {
                // Re-throw if it's a different error (e.g., permission issues)
                throw error;
            }
        }
    }
};