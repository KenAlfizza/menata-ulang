import { z } from 'zod';

/** Zod validation schema
 * The schemas used for story enpoint
 */

/**
 * Id validation rule
 *
 * Validates the `:id` route parameter. Accepts a non-empty string, then
 * transforms it to an integer and verifies it's a positive number.
 *
 * Usage: use in `paramsSchema` to validate route path parameters.
 */
const idRule = z.string()
    .min(1, "Id is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid id");

/**
 * Image validation rule
 *
 * Validates uploaded `File` objects:
 * - non-empty
 * - maximum size 5MB
 * - MIME type one of JPEG, PNG, WebP
 *
 * Note: runtime must provide `File` (Deno/file API environment compatibility).
 */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const imageRule = z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is empty")
    .refine((f) => f.size <= MAX_SIZE, "Max 5MB")
    .refine((f) => ACCEPTED_TYPES.includes(f.type), "Only JPEG, PNG, WebP");


/**
 * Params schema
 *
 * Validates route parameters. Currently only `id` is required for story
 * routes and is validated with `idRule`.
 */
export const paramsSchema = z.object({
    id: idRule,
});

/**
 * Story creation schema
 *
 * Schema for creating a new story. All fields are required for POST
 * requests. `published` is coerced to boolean to accept string form values
 * coming from form submissions.
 */
export const storySchema = z.object({
    title: z.string(),
    description: z.string(),
    text: z.string(),
    image: imageRule,
    published: z.coerce.boolean(),
});

/**
 * Story patch schema
 *
 * Partial version of `storySchema` intended for PATCH requests. All fields
 * are optional so clients may send only the fields they want to update.
 */
export const storyPatchSchema = storySchema.partial();

/**
 * GET list query schema
 *
 * Validates optional query params for listing stories: `page`, `limit`, and
 * `search`. `page` and `limit` are coerced to numbers to accept form/query
 * string values.
 */
export const listQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
});

