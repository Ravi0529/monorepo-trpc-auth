"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";

import { useUser } from "~/hooks/api/auth";
import { Switch } from "~/components/ui/switch";

const Navbar = () => {
  const { user, isLoading } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = Boolean(user?.id);
  const isDarkTheme = (resolvedTheme ?? "light") === "dark";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] uppercase text-foreground"
          >
            Nav
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Dashboard
            </Link>
          ) : null}
        </div>

        <nav className="flex items-center justify-center gap-2">
          {isLoading ? (
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <div className="flex min-w-0 items-center justify-end">
          <div className="flex items-center gap-2">
            <SunMedium className="size-4 text-muted-foreground" aria-hidden="true" />
            <Switch
              checked={mounted ? isDarkTheme : false}
              onCheckedChange={(checked) => {
                setTheme(checked ? "dark" : "light");
              }}
              aria-label="Toggle theme"
              disabled={!mounted}
            />
            <MoonStar className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
