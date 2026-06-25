import { and, db, eq } from "@repo/database";
import bcryptjs from "bcryptjs";
import * as JWT from "jsonwebtoken";

import { accountsTable, usersTable } from "@repo/database/schema";
import { googleOAuth2Client } from "../clients/google-oauth";
import {
  authenticateWithGoogleInput,
  AuthenticateWithGoogleInputType,
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

  private async getAccountByProviderAndAccountId(provider: string, providerAccountId: string) {
    const result = await db
      .select()
      .from(accountsTable)
      .where(
        and(
          eq(accountsTable.provider, provider),
          eq(accountsTable.providerAccountId, providerAccountId),
        ),
      );

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

  public async authenticateWithGoogle(payload: AuthenticateWithGoogleInputType) {
    try {
      const { code } = await authenticateWithGoogleInput.parseAsync(payload);

      const { tokens } = await googleOAuth2Client.getToken(code);
      const idToken = tokens.id_token;

      if (!idToken) {
        logger.error("Google OAuth exchange did not return an ID token");
        throw new Error("Google authentication failed");
      }

      const ticket = await googleOAuth2Client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_OAUTH_CLIENT_ID,
      });

      const profile = ticket.getPayload();
      if (!profile?.sub || !profile.email) {
        logger.error("Google OAuth payload was missing required profile information");
        throw new Error("Google authentication failed");
      }

      if (profile.email_verified !== true) {
        logger.warn(`Google email address is not verified for ${profile.email}`);
        throw new Error("Google account email is not verified");
      }

      const provider = "google";
      const providerAccountId = profile.sub;
      const email = profile.email;
      const avatarUrl = profile.picture ?? undefined;
      const emailLocalPart = email.split("@")[0] ?? "google";
      const nameParts = profile.name?.trim().split(/\s+/).filter(Boolean) ?? [];
      const firstName = profile.given_name?.trim() || nameParts[0] || emailLocalPart || "Google";
      const lastName =
        profile.family_name?.trim() ||
        (nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined) ||
        "User";

      const existingAccount = await this.getAccountByProviderAndAccountId(
        provider,
        providerAccountId,
      );
      if (existingAccount) {
        const { token } = await this.generateUserToken({ id: existingAccount.userId });
        logger.info(
          `Google user signed in through existing account: ${email}, ID: ${existingAccount.userId}`,
        );
        return {
          id: existingAccount.userId,
          token,
        };
      }

      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        return await db.transaction(async (tx) => {
          await tx.insert(accountsTable).values({
            userId: existingUser.id,
            provider,
            providerAccountId,
          });

          const { token } = await this.generateUserToken({ id: existingUser.id });
          logger.info(`Google account linked to existing user: ${email}, ID: ${existingUser.id}`);
          return {
            id: existingUser.id,
            token,
          };
        });
      }

      return await db.transaction(async (tx) => {
        const createdUserResult = await tx
          .insert(usersTable)
          .values({
            firstName,
            lastName,
            email,
            avatarUrl,
          })
          .returning({ id: usersTable.id });

        const createdUser = createdUserResult[0];
        if (!createdUser?.id) {
          logger.error("Failed to create Google user, no ID returned");
          throw new Error("Failed to create Google user");
        }

        await tx.insert(accountsTable).values({
          userId: createdUser.id,
          provider,
          providerAccountId,
        });

        const { token } = await this.generateUserToken({ id: createdUser.id });
        logger.info(`Google user created: ${email}, ID: ${createdUser.id}`);
        return {
          id: createdUser.id,
          token,
        };
      });
    } catch (error) {
      logger.error("Error authenticating Google user:", error);
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
