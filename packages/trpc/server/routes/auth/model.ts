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
