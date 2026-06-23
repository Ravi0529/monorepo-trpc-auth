"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";

const Home = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, router]);
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h1 className="text-3xl">Streamyst - Stream in Style</h1>
        <h2>Server Status: Healthy</h2>
      </div>
    </main>
  );
};

export default Home;
