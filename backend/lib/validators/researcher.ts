import { z } from 'zod';

/**
 * Zod validation schemas for researcher endpoints.
 */

/**
 * CUID2 ID validation
 * Assuming your researcher ID is a string (CUID2)
 */
const idRule = z.string().min(1, "Id is required");

/**
 * Params schema
 * Validates the `id` path parameter (e.g. /page/:id)
 */
export const paramsSchema = z.object({
    id: idRule,
});

/**
 * Researcher creation schema
 */
export const researchSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(100, "Title must be 100 characters or fewer"),
    description: z.string()
        .min(1, "Description is required")
        .max(500, "Description must be 500 characters or fewer"),
    slug: z.string()
        .min(1, "Slug is required")
        .max(100, "Slug must be 100 characters or fewer")
        .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores"),
});

/**
 * Researcher patch schema
 * Partial version allowing optional updates
 */
export const researchPatchSchema = z.object({
    data: z.any().optional(), // Puck layout data
    published: z.boolean().optional(),
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(500).optional(),
});

/**
 * Researcher list query schema
 * Validates pagination and filtering for /my-researches/
 */
export const researchListQuerySchema = z.object({
    filter: z.string().max(100).optional(),
    sort: z.enum(["title", "updatedAt"]).default("updatedAt").optional(),
    order: z.enum(["asc", "desc"]).default("desc").optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});