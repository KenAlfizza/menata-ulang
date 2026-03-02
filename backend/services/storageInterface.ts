export interface StorageProvider {
    /** Saves a file and returns the public URL or file path */
    save(file: File, subDir?: string): Promise<string>;
    /** Deletes a file from storage */
    delete(key: string): Promise<void>;
}