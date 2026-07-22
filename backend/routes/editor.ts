import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { authMiddleware } from "../middleware/auth.ts";

import { validate } from "../lib/validators/index.ts";

import { editorService } from "../services/editorService.ts";
import { imageUploadSchema } from "../lib/validators/editor.ts";

const editor = new Hono<{ Variables: AppVariables }>();

/**
 * POST /upload-image - Uploads a standalone image for the Puck Editor
 * 
 * Middleware: `authMiddleware`, `validate("form", imageUploadSchema)`.
 * Behaviour: Saves an image to the configured storage provider and returns a permanent URL. Verifies user role (AUTHOR/SUPERUSER).
 * 
 * Request Body (Validated):
 * - file (File, required) - The image file to be uploaded.
 * 
 * Responses:
 * - 200: success
 * - 400: bad request (no file provided)
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
editor.post("/upload-image", authMiddleware, validate("form", imageUploadSchema), async (c) => {
    const { id: userId, role } = c.get("user");
    
    // Role verification
    if (role !== "AUTHOR" && role !== "SUPERUSER") {
        return c.json({ success: false, error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
    }

    // Extract the validated file from the form data
    const { image } = c.req.valid("form");
    
    // Call the EditorService
    const result = await editorService.uploadImage(userId, image);
    
    if (!result.success) {
        // Map service errors to appropriate HTTP status codes
        let status: 400 | 401 | 404 | 500 = 500;
        let message = "Internal error";

        switch (result.error) {
            case 'UNAUTHORIZED':
                status = 401;
                message = "Unauthorized";
                break;
            case 'BAD_REQUEST':
                status = 400;
                message = "Bad request - valid image file is required";
                break;
            case 'NOT_FOUND':
                status = 404;
                message = "Resource not found";
                break;
            case 'INTERNAL_ERROR':
            default:
                status = 500;
                message = "Internal server error";
                break;
        }

        return c.json({ 
            success: false, 
            error: { 
                message,
                code: result.error 
            } 
        }, status);
    }
    
    // Return the imageUrl dynamically to the frontend Puck editor
    return c.json({ 
        success: true, 
        imageUrl: result.data.imageUrl 
    }, 200);
});

export default editor;