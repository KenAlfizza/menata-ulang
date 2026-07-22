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
    .trim()
    .min(1, "Id is required")
    .max(20, "Id is too long")
    .refine(val => !isNaN(parseInt(val, 10)), "Id must be a number")
    .refine(val => parseInt(val, 10) > 0, "Id must be positive")
    .transform(val => parseInt(val, 10));

/**
 * UUIDv7 validation rule
 * - Must be a non-empty string
 * Usages:
 * - GET, PATCH, DELETE endpoints
 */
export const uuidRule = z.uuidv7();


/**
 * Max words validation rule
 * @param max 
 * @param message
 * Validates the text provided is less than or equal to the max words
 */
export const maxWordRule = (max: number, message?: string) =>
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