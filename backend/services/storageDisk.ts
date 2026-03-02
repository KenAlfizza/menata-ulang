import { join } from "jsr:@std/path";
import { StorageProvider } from "./storageInterface.ts";

export class StorageDisk implements StorageProvider {
  private uploadDir: string;

  constructor(uploadDir = "uploads") {
    this.uploadDir = uploadDir;
  }

  async save(file: File, subDir = ""): Promise<string> {
    const targetDir = join(this.uploadDir, subDir);
    await Deno.mkdir(targetDir, { recursive: true });

    // Sanitize filename with a UUID to prevent collisions/attacks
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const filePath = join(targetDir, fileName);

    const bytes = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(filePath, bytes);

    return filePath;
  }

  async delete(key: string): Promise<void> {
    await Deno.remove(key);
  }
}