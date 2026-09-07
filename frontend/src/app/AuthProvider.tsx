import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, setUnauthorizedHandler } from "../services/apiClient";
import { clearToken, getToken, setToken } from "../services/auth";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  /** Verify a password against the API; resolves on success, throws on failure. */
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? "checking" : "unauthenticated",
  );

  // Any 401 anywhere in the app drops us back to the login gate.
  useEffect(() => {
    setUnauthorizedHandler(() => setStatus("unauthenticated"));
    return () => setUnauthorizedHandler(null);
  }, []);

  // On load, if a token was remembered, confirm it still works.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    apiFetch("/api/auth/status")
      .then(() => !cancelled && setStatus("authenticated"))
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (password: string) => {
    setToken(password);
    try {
      await apiFetch("/api/auth/status");
      setStatus("authenticated");
    } catch (err) {
      clearToken();
      setStatus("unauthenticated");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setStatus("unauthenticated");
  }, []);

  return <AuthContext.Provider value={{ status, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
