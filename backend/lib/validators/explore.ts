import z from "zod";

export const exploreParamSchema  = z.object({
    slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores")
    }
)