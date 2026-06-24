"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    accessToken: string | null;
    isLoading: boolean;
    setToken: (token: string | null) => void;
    refreshSession: () => Promise<string | null>;
    logout: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

/**
 * AuthProvider
 *
 * Manages the application's authentication state. Provides an in-memory
 * access token derived from an httpOnly refresh token cookie, so the token
 * survives neither page reloads nor XSS — the cookie is invisible to JS and
 * the access token is never written to localStorage or sessionStorage.
 *
 * On every mount (including URL-bar reloads), silently exchanges the cookie
 * for a fresh access token. While that exchange is in flight, `isLoading` is
 * true so protected pages can show a loading state instead of flashing or
 * redirecting prematurely.
 *
 * Also runs a proactive renewal loop every 10 minutes while a session is
 * active, staying safely ahead of the backend's 15-minute expiry window.
 *
 * Place this once at the root of your app (e.g. `app/layout.tsx`):
 * ```tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    /**
     * Sends the httpOnly refresh token cookie to the backend and stores the
     * returned access token in memory. Returns the new token on success, or
     * null if the cookie is absent or invalid (i.e. the session has expired).
     */
    const refreshSession = useCallback(async (): Promise<string | null> => {
        try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            setAccessToken(null);
            return null;
        }

        const { token: newAccessToken } = await response.json();
        setAccessToken(newAccessToken);
        return newAccessToken;
        } catch (error) {
        console.error("Silent refresh failed:", error);
        setAccessToken(null);
        return null;
        }
    }, []);

    /**
     * Invalidates the session on the backend, then clears the in-memory access
     * token and redirects to /login. The backend call is made first so the
     * refresh token cookie is revoked server-side before local state is cleared.
     * Also passes the current access token in the Authorization header so the
     * backend can blacklist it immediately.
     *
     * Returns `{ success: true }` on success, or `{ success: false, error }` if
     * the backend call fails — in which case local state is intentionally left
     * intact so the user is not silently logged out on a transient network error.
     */
    const logout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: {
                "Content-Type": "application/json",
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                },
            });

            if (!response.ok) {
                return {
                success: false,
                error:
                    response.status === 500
                    ? "Gagal keluar. Terjadi kesalahan pada server internal."
                    : "Gagal keluar. Terjadi kesalahan pada sistem.",
                };
            }

            setAccessToken(null);
            router.push("/login");
            return { success: true };
        } catch {
            return { success: false, error: "Tidak dapat terhubung ke server backend." };
        }
    }, [accessToken, router]);

    useEffect(() => {
        refreshSession().finally(() => setIsLoading(false));
    }, [refreshSession]);

    useEffect(() => {
        if (!accessToken) return;
        const interval = setInterval(() => refreshSession(), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [accessToken, refreshSession]);

    return (
        <AuthContext.Provider
            value={{ accessToken, isLoading, setToken: setAccessToken, refreshSession, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth
 *
 * Returns the current auth context. Must be called inside a component that is
 * a descendant of `AuthProvider`.
 *
 * ```tsx
 * const { accessToken, isLoading, logout } = useAuth();
 * ```
 *
 * @throws If called outside of an `AuthProvider` tree.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}