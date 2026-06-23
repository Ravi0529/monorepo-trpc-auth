import { userService } from "../../services";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
} from "./model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { setAuthenticationCookie } from "../../utils/cookie";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
        summary: "Create a new user with email and password",
        description: "Creates a new user account using the provided email and password.",
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { firstName, lastName, email, password, avatarUrl } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({
        firstName,
        lastName,
        email,
        password,
        avatarUrl,
      });

      setAuthenticationCookie(ctx, token);

      return { id };
    }),
});
