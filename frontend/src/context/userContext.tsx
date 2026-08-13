import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, api } from "../services/api";
import type { SessionUser } from "../types/api";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

interface UserContextValue {
  user: SessionUser | null;
  status: SessionStatus;
  sessionError: Error | null;
  isLogged: boolean;
  isUser: boolean;
  isAdmin: boolean;
  refreshSession: (signal?: AbortSignal) => Promise<void>;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser must be used within UserContextProvider");
  return context;
}

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [sessionError, setSessionError] = useState<Error | null>(null);

  const refreshSession = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    setStatus("loading");
    setSessionError(null);
    try {
      const data = await api.get<{ user: SessionUser }>("/auth", { signal });
      if (signal?.aborted) return;
      setUser(data.user);
      setStatus("authenticated");
    } catch (error) {
      if (
        signal?.aborted ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        return;
      }
      setUser(null);
      setStatus("anonymous");
      setSessionError(
        error instanceof ApiError && error.status === 401
          ? null
          : error instanceof Error
            ? error
            : new Error("Tidak dapat terhubung ke server"),
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshSession(controller.signal);
    return () => controller.abort();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    if (user) {
      await api.post(user.role === "admin" ? "/admin/logout" : "/auth/logout");
    }
    setUser(null);
    setStatus("anonymous");
    setSessionError(null);
  }, [user]);

  const isLogged = status === "authenticated";
  const isUser = isLogged && user?.role === "user";
  const isAdmin = isLogged && user?.role === "admin";

  const value = useMemo(
    () => ({
      user,
      status,
      sessionError,
      isLogged,
      isUser,
      isAdmin,
      refreshSession,
      logout,
    }),
    [
      isAdmin,
      isLogged,
      isUser,
      logout,
      refreshSession,
      sessionError,
      status,
      user,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
