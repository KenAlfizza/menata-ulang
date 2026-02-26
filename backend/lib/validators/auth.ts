import { z } from "zod";

/** Zod validation schemas 
 * The schemas used for auth functions
*/

/** Atomic schemas */
const nameRule = z.string().min(1, "Name is required");
const emailRule = z.email("Invalid email address").min(1, "Email is required");
const passwordRule = z.string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
;

/** Registration schema */
export const registerSchema = z.object({
    email: emailRule,
    password: passwordRule,
    name: nameRule
});

/** Login schema */
export const loginSchema = z.object({
    email: emailRule,
    password: passwordRule,
});

/** Forgot password */
export const forgotSchema = z.object({
    email: emailRule,
});

/** Reset password schema */
export const resetSchema = z.object({
    token: z.string(),
    password: passwordRule,
});