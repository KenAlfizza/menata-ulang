// components/auth-guard.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * AuthGuard
 *
 * A client-side route protection wrapper. Wrap any page component with this
 * to ensure it is only rendered for authenticated users.
 *
 * Behaviour:
 * - While the auth context is bootstrapping (silent refresh on mount), renders
 *   a loading screen to prevent the protected page from flashing to the user.
 * - Once loading is complete, redirects to /login if no access token is present.
 * - If a valid access token exists, renders children normally.
 *
 * Usage:
 * ```tsx
 * export default function ProtectedPage() {
 *   return (
 *     <AuthGuard>
 *       <PageContent />
 *     </AuthGuard>
 *   );
 * }
 * ```
 *
 * @param children - The page content to render if the user is authenticated.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.replace("/login");
    }
  }, [isLoading, accessToken, router]);

  if (isLoading) return (
    <div className="w-full h-screen bg-[#1A1A2E] flex items-center justify-center text-white gap-3">
      <span>Loading...</span>
    </div>
  );

  if (!accessToken) return null;

  return <>{children}</>;
}