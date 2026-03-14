import { zValidator } from "@hono/zod-validator";
import { type ZodType } from "zod";

/**
 * Zod-based request validator middleware.
 *
 * @template T The Zod schema type.
 * @param target The part of the request to validate: "json", "query", "param", "header", or "form".
 * @param schema The Zod schema to validate against.
 *
 * Behavior: Uses `@hono/zod-validator` to validate request data. If validation
 * fails, collects all field errors into an object keyed by field name and returns
 * a 400 response with the error messages. Logs the full validation result to console.
 *
 * Returns:
 * - Middleware function compatible with Hono.
 */
export const validate = <T extends ZodType>(target: "json" | "query" | "param" | "header" | "form", schema: T) =>
  zValidator(target, schema, (result, c) => {
    console.log(result);
    if (!result.success) {
      const error = result.error.issues.reduce((acc, issue) => {
        const key = issue.path[0] as string;
        acc[key] = issue.message;
        return acc;
      }, {} as Record<string, string>);

      return c.json({ error }, 400);
    }
  });