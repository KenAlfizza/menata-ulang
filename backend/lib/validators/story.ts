import { z } from 'zod';

const STORY_MAX_WORD = 500;
const RESEARCH_MAX_WORD = 750;

/**
 * Zod validation schemas for story endpoints.
 *
 * Behavior: Enforces type safety, input validation, and constraints for
 * story-related requests including creation, updates, route parameters, 
 * and query parameters.
 */

/**
 * Id validation rule
 *
 * Validates the `:id` route parameter:
 * - Must be a non-empty string
 * - Transforms to an integer
 * - Must be a positive number
 *
 * Usage: Use in `paramsSchema` to validate route path parameters.
 */
const idRule = z.string()
    .min(1, "Id is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid id");

/**
 * Image validation rule
 *
 * Validates uploaded `File` objects:
 * - Non-empty
 * - Maximum size 5MB
 * - MIME type one of JPEG, PNG, WebP
 *
 * Note: Runtime must provide `File` (Deno/file API environment compatibility).
 */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const imageRule = z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is empty")
    .refine((f) => f.size <= MAX_SIZE, "Max 5MB")
    .refine((f) => ACCEPTED_TYPES.includes(f.type), "Only JPEG, PNG, WebP");

/**
 * Max words validation rule
 * @param max 
 * @param message
 * Validates the text provided is less than or equal to the max words
 */
const maxWords = (max: number, message?: string) =>
  z.string().refine(
    (val) => {
      const trimmed = val.trim();
      if (trimmed === '') return true; // Empty string has 0 words
      return trimmed.split(/\s+/).length <= max;
    },
    {
      message: message || `Must be ${max} words or less`
    }
  );

/**
 * Params schema
 *
 * Validates route parameters for story endpoints. Currently only `id`
 * is required and validated with `idRule`.
 */
export const paramsSchema = z.object({
    id: idRule,
});

/**
 * Story creation schema
 *
 * Schema for creating a new story. All fields are required:
 * - title: string (max 100 chars)
 * - description: string (max 200 chars)
 * - text: string (max 500 words)
 * - image: File
 * - published: boolean (coerced from string if necessary)
 * - researchText: string (max 500 words)
 *
 * Behavior: Ensures that all necessary fields for story creation are valid.
 */
export const storySchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or fewer"),
    description: z.string().max(200, "Description must be 200 characters or fewer"),
    text: maxWords(STORY_MAX_WORD, `Story text must be ${STORY_MAX_WORD} words or less`),
    image: imageRule,
    published: z.string().transform(val => val === "true"),
    researchText: maxWords(RESEARCH_MAX_WORD, `Research text must be ${RESEARCH_MAX_WORD} words or less`),
});

/**
 * Story patch schema
 *
 * Partial version of `storySchema` intended for PATCH requests.
 * All fields are optional so clients may send only the fields they
 * want to update.
 */
export const storyPatchSchema = storySchema.partial();

/**
 * GET list query schema
 *
 * Validates optional query parameters for listing stories:
 * - page: integer >= 1
 * - limit: integer 1-100
 * - search: optional string (max 100 chars) 
 *
 * Behavior: Coerces `page` and `limit` from strings to numbers to
 * support query string values.
 */
export const listQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().max(100, "Search keyword must be 100 characters or fewer").optional(),
});