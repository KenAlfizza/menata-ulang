import { z } from "zod";

/** Zod validation schemas 
 * The schemas used for auth functions
*/

/** Registration schema */
export const registerSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    name: z.string().min(1, "Name is required"),    
});

/** Login schema */
export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string(),
});

/** Forgot password */
export const forgotSchema = z.object({
    email: z.email("Invalid email address"),
});

/** Reset password schema */
export const resetSchema = z.object({
    token: z.string(),
    password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})