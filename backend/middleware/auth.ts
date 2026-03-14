import { createMiddleware } from 'hono/factory';
import { verifyToken } from "../lib/jwt.ts";
import type { AppVariables } from "../types.ts";

/**
 * Authentication middleware - Verify access token
 *
 * Middleware: None.
 * Authorization: Requires a valid access token in the `Authorization` header.
 *
 * Accepted headers: `Authorization: Bearer <access_token>`.
 * Behavior: Extract the access token from the Authorization header and verify
 * its validity. If the token is valid, the decoded payload is attached to the
 * request context (`c.set("user", payload)`) so downstream handlers can access
 * authenticated user information. If the token is missing, invalid, or expired,
 * the request is rejected with an unauthorized response.
 *
 * Responses:
 * - 401: missing, invalid, or expired access token
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
