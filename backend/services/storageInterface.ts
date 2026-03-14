/**
 * StorageProvider - Interface for file storage implementations
 *
 * Behavior: Defines a common contract for storage backends used to manage
 * uploaded files. Implementations may store files on local disk, cloud
 * storage (e.g., S3), or other services, but must provide methods for
 * saving and deleting files.
 */
export interface StorageProvider {
    /** Saves a file and returns the public URL or file path */
    save(file: File, subDir?: string): Promise<string>;
    /** Deletes a file from storage */
    delete(key: string): Promise<void>;
}