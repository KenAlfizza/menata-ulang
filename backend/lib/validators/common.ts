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
    .trim() // Explicitly remove whitespace
    .min(1, "Id is required")
    .transform((val) => {
        const parsed = parseInt(val, 10);
        // Ensure it's a valid finite integer
        if (isNaN(parsed)) throw new Error("Invalid id format");
        return parsed;
    })
    .refine((val) => val > 0, "Id must be a positive number");

/**
 * UUIDv7 validation rule
 * - Must be a non-empty string
 * Usages:
 * - GET, PATCH, DELETE endpoints
 */
export const uuidRule = z.uuidv7();