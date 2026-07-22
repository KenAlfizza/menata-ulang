import z from "zod";
import { imageRule } from "./common.ts";

/**
 * Params schema
 * Validates the `id` path parameter (e.g. /story/:id)
 */
export const imageUploadSchema = z.object({
    image: imageRule
});
