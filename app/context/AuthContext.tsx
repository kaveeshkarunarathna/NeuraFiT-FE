"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "../lib/api";
import type { User, AuthResponse, RegisterData, LoginData, UpdateProfileData } from "../lib/api";

// ── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  accessToken: "nf_access_token",
  refreshToken: "nf_refresh_token",
  user: "nf_user",
} as const;

function persist(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEYS.accessToken, auth.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, auth.refreshToken);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user));
}

function clearStorage() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!accessToken;
  const isOnboarded = !!user?.fitnessGoal;

  

  // Listen for background token refreshes from api.ts
  useEffect(() => {
    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setAccessToken(customEvent.detail);
    };
    window.addEventListener("token_refreshed", handleTokenRefreshed);
    return () => {
      window.removeEventListener("token_refreshed", handleTokenRefreshed);
    };
  }, []);

  const handleAuth = useCallback((response: AuthResponse) => {
    persist(response);
    setUser(response.user);
    setAccessToken(response.accessToken);
  }, []);

  const registerFn = useCallback(
    async (data: RegisterData) => {
      const response = await api.register(data);
      handleAuth(response);
      router.push("/onboarding");
    },
    [handleAuth, router]
  );

  const loginFn = useCallback(
    async (data: LoginData) => {
      const response = await api.login(data);
      handleAuth(response);

      // If user hasn't completed onboarding, redirect there
      if (!response.user.fitnessGoal) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    },
    [handleAuth, router]
  );

  const logoutFn = useCallback(async () => {
    try {
      if (accessToken) await api.logout(accessToken);
    } catch {
      // Ignore — still clear local session
    }
    clearStorage();
    setUser(null);
    setAccessToken(null);
    router.push("/");
  }, [accessToken, router]);

  const updateUserFn = useCallback(
    async (data: UpdateProfileData) => {
      if (!user || !accessToken) throw new Error("Not authenticated");
      const updated = await api.updateProfile(user.id, accessToken, data);
      setUser(updated);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
    },
    [user, accessToken]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        isOnboarded,
        login: loginFn,
        register: registerFn,
        logout: logoutFn,
        updateUser: updateUserFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
