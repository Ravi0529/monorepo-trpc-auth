import { trpc } from "~/trpc/client";

export const useSignUp = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createuserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate(); // cache-in validation
    },
  });

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

export const useSignIn = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate(); // cache-in validation
    },
  });

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUser = () => {
  const {
    data: user,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery(undefined, {
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  return {
    user: error ? undefined : user,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };
};

export const useLogout = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: logoutAsync,
    mutate: logout,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.logout.useMutation({
    onMutate: async () => {
      await utils.auth.getLoggedInUserInfo.cancel();
      utils.auth.getLoggedInUserInfo.setData(undefined, undefined);
    },
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
    onSettled: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    logoutAsync,
    logout,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useGoogleAuth = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: authenticateWithGoogleAsync,
    mutate: authenticateWithGoogle,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.authenticateWithGoogle.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    authenticateWithGoogleAsync,
    authenticateWithGoogle,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
