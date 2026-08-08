import z from "zod";

export const exploreParamSchema  = z.object({
    slug: z.string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-_]+$/, "Slug can only contain lowercase letters, numbers, hyphens, and underscores")
    }
);

export const exploreQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().optional(),
    sort: z.enum(["title", "updatedAt"]).optional().default("title"),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
});