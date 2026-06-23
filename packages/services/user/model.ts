import { z } from "zod";

export const createUserWithEmailAndPasswordInput = z.object({
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

export type CreateUserWithEmailAndPasswordInputType = z.infer<
  typeof createUserWithEmailAndPasswordInput
>;

export const generateUserTokenPayload = z.object({
  id: z.string().describe("Unique identifier of the user"),
});

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;

export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().max(255).describe("Email address of the user"),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .describe("Password for the user account"),
});

export type SignInUserWithEmailAndPasswordInputType = z.infer<
  typeof signInUserWithEmailAndPasswordInput
>;
