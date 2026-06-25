import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  firstName: z.string().min(1).max(80).describe("First name of the user"),
  lastName: z.string().min(1).max(80).describe("Last name of the user"),
  email: z.email().max(255).describe("Email address of the user"),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .describe("Password for the user account"),
  avatarUrl: z.string().url().max(2048).optional().describe("URL of the user's avatar image"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("The unique identifier of the newly created user"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().max(255).describe("Email address of the user"),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .describe("Password for the user account"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("The unique identifier of the newly created user"),
});

export const authenticateWithGoogleInputModel = z.object({
  code: z.string().min(1).describe("Google OAuth authorization code"),
});

export const authenticateWithGoogleOutputModel = z.object({
  id: z.string().describe("The unique identifier of the authenticated user"),
});

export const getLoggedInUserInfoInputModel = z
  .undefined()
  .describe("No input required for this endpoint");

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("The unique identifier of the user"),
  firstName: z.string().min(1).max(80).describe("First name of the user"),
  lastName: z.string().min(1).max(80).describe("Last name of the user"),
  email: z.email().max(255).describe("Email address of the user"),
  avatarUrl: z.string().url().max(2048).optional().describe("URL of the user's avatar image"),
});

export const logoutOutputModel = z.object({
  success: z.boolean().describe("Indicates whether the logout operation was successful"),
});
