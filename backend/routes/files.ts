import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { join } from "jsr:@std/path";

const files = new Hono();

// Use an absolute path and a rewrite rule to ensure it targets 'storage/...'
const storagePath = join(Deno.cwd(), "storage");

files.use("/*", serveStatic({ 
    root: storagePath,
    // This forces the path to look inside the 'storage' folder 
    // by removing the '/files' prefix from the URL
    rewriteRequestPath: (path) => path.replace(/^\/files/, '')
}));

export default files;