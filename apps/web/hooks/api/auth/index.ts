import { trpc } from "~/trpc/client";

export const useSignUp = () => {
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createuserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation();

  return {
    createUserWithEmailAndPasswordAsync,
    createuserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
