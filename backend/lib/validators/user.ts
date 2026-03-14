import { z } from "zod";

/**
 * Zod validation schemas for user-related operations.
 *
 * Behavior: These schemas enforce input validation and transformations for
 * user update requests and route parameters, ensuring type safety and
 * preventing invalid data from reaching business logic.
 */

/**
 * Schema for updating user information.
 *
 * Fields:
 * - name: Optional string. Must be at least 1 character if provided.
 *
 * Behavior: Validates user update payloads to ensure the `name` field, if
 * present, is not empty.
 */
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

/**
 * Schema for validating route parameters containing an ID.
 *
 * Fields:
 * - id: Required string from route parameters. Parsed into an integer.
 *
 * Behavior: Transforms the string `id` parameter to a number and ensures
 * it is a positive integer. Throws an error if invalid.
 */
export const paramsSchema = z.object({
  id: z.string().min(1, "Id is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid id"),
});

