"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuth();
  const router = useRouter();
  
  // Added: A secondary gatekeeper state to handle state transition frames safely
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    // Only make decisions once the AuthProvider has finished its initialization/refresh check
    if (!isLoading) {
      if (!accessToken) {
        console.warn("Guard: No access token found. Bouncing back to login.");
        router.push("/login");
      } else {
        // Token confirmed! Safe to unlock the dashboard layout view
        setIsAuthorized(true);
      }
    }
  }, [accessToken, isLoading, router]);

  // Render the loading wall while checking cookies OR waiting for state synchronization
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Memuat sesi...</p>
      </div>
    );
  }

  // Once authorized, cleanly render children components without race condition drops
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main>{children}</main>
    </div>
  );
}