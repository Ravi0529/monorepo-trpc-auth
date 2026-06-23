import { db, eq } from "@repo/database";
import bcryptjs from "bcryptjs";
import * as JWT from "jsonwebtoken";

import { usersTable } from "@repo/database/schema";
import { googleOAuth2Client } from "../clients/google-oauth";
import {
  createUserWithEmailAndPasswordInput,
  CreateUserWithEmailAndPasswordInputType,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  signInUserWithEmailAndPasswordInput,
  SignInUserWithEmailAndPasswordInputType,
  GetLoggedInUserInfoOutputType,
} from "./model";
import { env } from "../env";

import { logger } from "@repo/logger";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType> {
    try {
      const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType;
      return verificationResult;
    } catch (error) {
      logger.error("Error verifying user token:", error);
      throw new Error("Invalid or expired token");
    }
  }

  public async getUserById(id: string): Promise<GetLoggedInUserInfoOutputType> {
    const users = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    const user = users[0];

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? undefined,
    };
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    try {
      const { firstName, lastName, email, password, avatarUrl } =
        await createUserWithEmailAndPasswordInput.parseAsync(payload);

      if (!firstName || !lastName || !email || !password) {
        logger.error("Missing required fields for user creation");
        throw new Error("Missing required fields for user creation");
      }

      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        logger.warn(`User with email ${email} already exists`);
        throw new Error("User with this email already exists");
      }

      if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
        logger.error(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        );
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        );
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      const userInsertResult = await db
        .insert(usersTable)
        .values({
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          avatarUrl,
        })
        .returning({ id: usersTable.id });

      if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) {
        logger.error("Failed to create user, no ID returned");
        throw new Error("Failed to create user");
      }

      const userId = userInsertResult[0].id;
      const { token } = await this.generateUserToken({ id: userId });

      logger.info(`User created with email: ${email}, ID: ${userInsertResult[0].id}`);
      return {
        id: userId,
        token,
      };
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    try {
      const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);

      const existingUser = await this.getUserByEmail(email);
      if (!existingUser) {
        logger.warn(`User with email ${email} not found`);
        throw new Error("User with this email does not exist");
      }

      if (!existingUser.passwordHash) {
        logger.error(`Invalid Authentication method for user with email ${email}`);
        throw new Error("Invalid Authentication method for this user");
      }

      const isPasswordValid = await bcryptjs.compare(password, existingUser.passwordHash);
      if (!isPasswordValid) {
        logger.warn(`Invalid password for user with email ${email}`);
        throw new Error("Invalid email or password");
      }

      const { token } = await this.generateUserToken({ id: existingUser.id });

      logger.info(`User signed in with email: ${email}, ID: ${existingUser.id}`);
      return {
        id: existingUser.id,
        token,
      };
    } catch (error) {
      logger.error("Error signing in user:", error);
      throw error;
    }
  }

  public async verifyAndDecodeUserToken(token: string) {
    try {
      const { id } = await this.verifyUserToken(token);
      logger.info(`User token verified for user ID: ${id}`);

      return { id };
    } catch (error) {
      logger.error("Error verifying and decoding user token:", error);
      throw error;
    }
  }
}

export default UserService;
