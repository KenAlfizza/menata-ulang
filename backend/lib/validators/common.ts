import { z } from 'zod';
/** Zod validation rules reused in multiple validators **/

/**
 * Id validation rule
 * - Must be a non-empty string
 * - Transforms to an integer
 * - Must be a positive number
 * Usages:
 * - GET, PATCH, DELETE endpoints
 */

export const idRule = z.string()
    .min(1, "Id is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid id");