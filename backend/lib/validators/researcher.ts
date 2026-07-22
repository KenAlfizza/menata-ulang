import { z } from 'zod';
import { cuidRule, imageRule } from "./common.ts";

/**
 * Zod validation schemas for researcher endpoints.
 */
/**
 * Params schema
 * Validates the `id` path parameter (e.g. /research/:id)
 */
export const researcherParamsSchema = z.object({
    id: cuidRule,
});

/**
 * Research creation schema
 */
export const researcherCreateSchema = z.object({
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
 * Research patch schema
 * Partial version allowing optional updates
 */
export const researcherPatchSchema = z.object({
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
        
    published: z
        .preprocess((val) => {
            if (val === "true" || val === true) return true;
            if (val === "false" || val === false) return false;
            return val;
        }, z.boolean())
        .optional(),
});

/**
 * Research page patch schema
 * Partial version allowing optional updates
 */
export const researcherPagePatchSchema = z.object({    
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
});


/**
 * Research list query schema
 * Validates pagination and filtering for /my-research/
 */
export const researcherListQuerySchema = z.object({
    search: z.string().max(100).optional(),
    sort: z.enum(["title", "updatedAt"]).default("updatedAt").optional(),
    order: z.enum(["asc", "desc"]).default("desc").optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});
