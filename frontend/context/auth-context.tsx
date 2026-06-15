"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean; // Added to prevent flashing protected pages on boot
  setToken: (token: string | null) => void;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public pages that don't require an active session
const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const setToken = (token: string | null) => {
    setAccessToken(token);
  };

  // REFRESH TOKEN LOGIC
  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      // Hitting your POST /refresh endpoint. Browser carries the secure cookie automatically.
      const response = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      // HANDLE BACKEND REFUSALS (HTTP 401 / 500)
      if (!response.ok) {
        setAccessToken(null);
        
        // If it's a validation/idle failure (401), boot them out to login if on a protected route
        if (response.status === 401) {
          console.warn("Session invalid or idle timeout reached:", result.error);
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push("/login");
          }
        }
        return null;
      }

      // SUCCESS (HTTP 200)
      const newAccessToken = result.token;
      setAccessToken(newAccessToken);
      return newAccessToken;

    } catch (error) {
      console.error("Failed to silently refresh session:", error);
      return null;
    }
  }, [pathname, router]);

  // LOGOUT LOGIC
  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    setAccessToken(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return { 
          success: false, 
          error: response.status === 500 
            ? "Gagal keluar. Terjadi kesalahan pada server internal." 
            : "Gagal keluar. Terjadi kesalahan pada sistem." 
        };
      }

      router.push("/login");
      return { success: true };
    } catch {
      return { success: false, error: "Tidak dapat terhubung ke server backend." };
    }
  };

  // SILENT REFRESH ON MOUNT
  // Runs once when the application boots up to check if an HttpOnly session cookie exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken) {
        setIsLoading(false);
        return;
      }
        await refreshSession();
        setIsLoading(false);
    };

    initializeAuth();
  }, [refreshSession]);

  // 15-MINUTE IDLE WINDOW / TOKEN EXPIRY LOOP
  // Proactively asks the server for a fresh access token every 10 minutes 
  // to stay safely ahead of your backend's 15-minute idle limit.
  useEffect(() => {
    if (!accessToken) return;

    const intervalTime = 10 * 60 * 1000; // 10 minutes
    const interval = setInterval(() => {
      console.log("Proactively renewing access token session...");
      refreshSession();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [accessToken, refreshSession]);

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, setToken, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an Auth Provider");
  return context;
}