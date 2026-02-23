import { createMiddleware } from 'hono/factory';
import { verifyToken } from "../lib/jwt.ts";
import type { AppVariables } from "../types.ts";

/**
 * Authentication middleware to verify user
 */
export const authMiddleware = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    // Get the auth header
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    // Get the access token
    const token = authHeader.replace("Bearer ", "");
    try {
        // Verify the token
        const payload = await verifyToken(token);
        // Set user to containt the payload
        c.set("user", payload);
        // Move to the next task
        await next();
    } catch {
        // Token expired or invalid
        return c.json({ error: "Invalid or expired token" }, 401);
    }
});
