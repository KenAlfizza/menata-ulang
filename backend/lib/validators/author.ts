import { z } from 'zod';
import { imageRule } from "./common.ts";

/**
 * Zod validation schemas for author endpoints.
 */

/**
 * CUID2 ID validation
 */
const idRule = z.string().min(1, "Id is required");

/**
 * Params schema
 * Validates the `id` path parameter (e.g. /story/:id)
 */
export const storyParamsSchema = z.object({
    id: idRule,
});

/**
 * Story creation schema
 */
export const storyCreateSchema = z.object({
    slug: z.string()
        .min(1, "Slug is required")
        .max(100, "Slug must be 100 characters or fewer")
        .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores"),
    title: z.string()
        .min(1, "Title is required")
        .max(100, "Title must be 100 characters or fewer"),
    description: z.string()
        .min(1, "Description is required")
        .max(500, "Description must be 500 characters or fewer"),
    image: imageRule.optional(),
});

/**
 * Story patch schema
 * Partial version allowing optional updates
 */
export const storyPatchSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(100)
        // Cleaned up regex to correctly enforce characters throughout the whole string
        .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores")
        .optional(),
        
    title: z.string().min(1).max(100).optional(),
    
    description: z.string().min(1).max(500).optional(),
    
    image: imageRule.optional(),
    
    puckData: z
        .preprocess((val) => {
            if (typeof val === "string" && val.trim() !== "") {
                try {
                    return JSON.parse(val);
                } catch {
                    return val; // Pass through to trigger validation failure naturally
                }
            }
            return val;
        }, z.any())
        .optional(),
        
    published: z
        .preprocess((val) => {
            if (val === "true" || val === true) return true;
            if (val === "false" || val === false) return false;
            return val;
        }, z.boolean())
        .optional(),
});


/**
 * Story list query schema
 * Validates pagination and filtering for /my-stories/
 */
export const storyListQuerySchema = z.object({
    search: z.string().max(100).optional(),
    sort: z.enum(["title", "updatedAt"]).default("updatedAt").optional(),
    order: z.enum(["asc", "desc"]).default("desc").optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});