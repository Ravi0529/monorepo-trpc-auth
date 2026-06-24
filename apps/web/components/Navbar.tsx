"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";

import { useUser } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

const Navbar = () => {
  const { user, isLoading } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = Boolean(user?.id);
  const isDarkTheme = (resolvedTheme ?? "light") === "dark";

  const toggleTheme = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

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
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : null}
        </div>

        <nav className="flex items-center justify-center gap-2">
          {isLoading ? (
            <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>

        <div className="flex min-w-0 items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative shrink-0"
            disabled={!mounted}
          >
            <SunMedium
              className={cn(
                "size-4 transition-all",
                mounted && isDarkTheme ? "scale-0 rotate-90" : "scale-100 rotate-0",
              )}
            />
            <MoonStar
              className={cn(
                "absolute size-4 transition-all",
                mounted && isDarkTheme ? "scale-100 rotate-0" : "scale-0 -rotate-90",
              )}
            />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
