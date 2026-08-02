import { Hono } from 'hono';
import { serveFile } from "jsr:@std/http/file-server";
import { join } from "jsr:@std/path";

const files = new Hono();

// Use an absolute path and a rewrite rule to ensure it targets 'storage/...'
const storagePath = join(Deno.cwd(), "storage");

// files.use("/*", serveStatic({ 
//     root: storagePath,
//     // This forces the path to look inside the 'storage' folder 
//     // by removing the '/files' prefix from the URL
//     rewriteRequestPath: (path) => path.replace(/^\/files/, '')
// }));


files.get("/*", async (c) => {
    // Strip the '/files' prefix from the incoming URL path
    const targetPath = c.req.path.replace(/^\/files/, '');
    
    // Construct the absolute path to the requested file
    const filePath = join(storagePath, targetPath);

    try {
        // serveFile automatically handles Range headers, 206 Partial Content,
        // content-types, and caching headers required by HTML5 media elements.
        return await serveFile(c.req.raw, filePath);
    } catch {
        return c.text("File not found", 404);
    }
});

export default files;