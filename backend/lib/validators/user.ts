import { z } from "zod";

/** Zod validation schemas 
 * The schemas used for user functions
*/

/** Zod validation schema for user update */
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});


/** Zod validation schema for id params */ 
export const paramsSchema = z.object({
  id: z.string().min(1, "Id is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid id"),
});