"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { BadgeInfo, Mail, ShieldCheck, User, UserCircle2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useUser } from "~/hooks/api/auth";

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.trim().charAt(0) ?? ""}${lastName?.trim().charAt(0) ?? ""}`.toUpperCase() || "U";

const DashboardPage = () => {
  const router = useRouter();
  const { user, isLoading, isFetching, error } = useUser();

  useEffect(() => {
    if (!isLoading && !isFetching && (!user || error)) {
      router.replace("/login");
    }
  }, [error, isFetching, isLoading, router, user]);

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCircle2 className="h-5 w-5" />
              Dashboard
            </CardTitle>
            <CardDescription>Loading your account details...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-5 w-40 animate-pulse rounded" />
                <div className="bg-muted h-4 w-56 animate-pulse rounded" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-muted h-20 animate-pulse rounded-lg" />
              <div className="bg-muted h-20 animate-pulse rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = getInitials(user.firstName, user.lastName);
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserCircle2 className="h-5 w-5" />
            Dashboard
          </CardTitle>
          <CardDescription>Here is your basic profile information.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-16">
              <AvatarImage src={user.avatarUrl} alt={fullName} />
              <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <User className="h-5 w-5" />
                {fullName}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                First Name
              </div>
              <p className="text-sm text-muted-foreground">{user.firstName}</p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Last Name
              </div>
              <p className="text-sm text-muted-foreground">{user.lastName}</p>
            </div>

            <div className="rounded-lg border p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="rounded-lg border p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Avatar
              </div>
              <p className="text-sm text-muted-foreground">
                {user.avatarUrl ? "Profile image is set." : "No avatar uploaded. Using initials."}
              </p>
            </div>

            <div className="rounded-lg border p-4 sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <BadgeInfo className="h-4 w-4" />
                User ID
              </div>
              <p className="text-sm text-muted-foreground">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
