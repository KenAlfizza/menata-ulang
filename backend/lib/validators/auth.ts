import { z } from "zod";

/**
 * Zod validation schemas for authentication endpoints.
 *
 * Behavior: Enforces type safety, input validation, and password security rules
 * for user registration, login, password reset, and forgot-password requests.
 */

/** Atomic validation rules */

/**
 * Name validation rule.
 * - Must be a non-empty string.
 */
const nameRule = z.string().min(1, "Name is required");

/**
 * Email validation rule.
 * - Must be a valid email address.
 * - Cannot be empty.
 */
const emailRule = z
  .email("Invalid email address")
  .min(1, "Email is required");

/**
 * Password validation rule.
 * - Must be 8–64 characters long.
 * - Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
 */
const passwordRule = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be less than 64 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/** Registration schema */
/**
 * Validates payload for user registration.
 * Fields: `email`, `password`, `name`
 */
export const registerSchema = z.object({
  email: emailRule,
  password: passwordRule,
  name: nameRule
});

/** Login schema */
/**
 * Validates payload for user login.
 * Fields: `email`, `password`
 */
export const loginSchema = z.object({
  email: emailRule,
  password: passwordRule,
});

/** Forgot password schema */
/**
 * Validates payload for requesting a password reset.
 * Fields: `email`
 */
export const forgotSchema = z.object({
  email: emailRule,
});

/** Reset password schema */
/**
 * Validates payload for resetting a password.
 * Fields: `token`, `password`
 */
export const resetSchema = z.object({
  token: z.string(),
  password: passwordRule,
});
