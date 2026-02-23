import { zValidator } from "@hono/zod-validator";
import { type ZodType } from "zod";

/** Zod Validator function with error messages for each field error */
export const validate = <T extends ZodType>(target: "json" | "query" | "param" | "header" | "form", schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const error = result.error.issues.reduce((acc, issue) => {
        const key = issue.path[0] as string;
        acc[key] = issue.message;
        return acc;
      }, {} as Record<string, string>);

      return c.json({ error }, 400);
    }
  });