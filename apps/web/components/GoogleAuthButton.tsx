"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { env } from "~/env.js";
import { Button } from "~/components/ui/button";

type GoogleCodeResponse = {
  code?: string;
};

type GoogleCodeClient = {
  requestCode: () => void;
};

type GoogleCodeClientConfig = {
  client_id: string;
  scope: string;
  ux_mode: "popup";
  callback: (response: GoogleCodeResponse) => void | Promise<void>;
  error_callback?: (error: unknown) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient;
        };
      };
    };
  }
}

type GoogleAuthButtonProps = {
  label?: string;
  onSuccess: (code: string) => Promise<void> | void;
  onError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
};

const GOOGLE_SCRIPT_ID = "google-identity-services";

const GoogleAuthButton = ({
  label = "Continue with Google",
  onSuccess,
  onError,
  className,
  disabled,
}: GoogleAuthButtonProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientRef = useRef<GoogleCodeClient | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (window.google && env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID) {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || !window.google) {
      return;
    }

    clientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: async (response) => {
        if (!response.code) {
          onError?.("Google did not return an authorization code.");
          return;
        }

        setIsSubmitting(true);
        try {
          await onSuccessRef.current(response.code);
        } catch (error) {
          onError?.(error instanceof Error ? error.message : "Google authentication failed.");
        } finally {
          setIsSubmitting(false);
        }
      },
      error_callback: () => {
        onError?.("Google sign-in was cancelled or failed to load.");
      },
    });
  }, [isScriptLoaded, onError]);

  const handleClick = () => {
    clientRef.current?.requestCode();
  };

  const isDisabled = disabled || !isScriptLoaded || !env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

  return (
    <>
      <Script
        id={GOOGLE_SCRIPT_ID}
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <Button
        type="button"
        variant="outline"
        className={className}
        onClick={handleClick}
        disabled={isDisabled || isSubmitting}
      >
        {isSubmitting ? "Connecting..." : label}
      </Button>
    </>
  );
};

export default GoogleAuthButton;
