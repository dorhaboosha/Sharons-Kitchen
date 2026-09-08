import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthUser, LoginResponse, MeResponse } from "@sharons-kitchen/shared";
import { apiFetch, setUnauthorizedHandler } from "../services/apiClient";
import { clearToken, getToken, setToken } from "../services/auth";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  /** The signed-in operator, once `status === "authenticated"`. */
  user: AuthUser | null;
  /** Exchange credentials for a session; resolves on success, throws on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Revoke the session server-side and drop back to the login screen. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? "checking" : "unauthenticated",
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  // Any 401 anywhere in the app drops us back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // On load, if a token was remembered, confirm it still resolves to a user.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    apiFetch<MeResponse>("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    setUser(res.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Network hiccup or an already-dead session — clear locally regardless.
    }
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
