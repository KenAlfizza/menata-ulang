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
   * If no directory is provided, files are stored in the default `uploads` folder.
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

    return filePath;
  }

  /**
   * Delete a file from disk.
   *
   * @param key The file path (key) returned during the save operation.
   *
   * Behavior: Removes the file from the filesystem using the provided path.
   * If the file does not exist, an error may be thrown by the filesystem.
   */
  async delete(key: string): Promise<void> {
    await Deno.remove(key);
  }
}