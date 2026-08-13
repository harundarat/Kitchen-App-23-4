import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { ApiError, api, getErrorMessage } from "../services/api";
import type { SessionUser } from "../types/api";

const SESSION_ERROR_TOAST_ID = "session-refresh-error";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface SessionRefreshResult {
  user: SessionUser | null;
  error: Error | null;
}

interface UserContextValue {
  user: SessionUser | null;
  status: SessionStatus;
  sessionError: Error | null;
  isLogged: boolean;
  isUser: boolean;
  isAdmin: boolean;
  refreshSession: (signal?: AbortSignal) => Promise<SessionRefreshResult>;
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
    if (signal?.aborted) return { user: null, error: null };
    setStatus("loading");
    setSessionError(null);
    try {
      const data = await api.get<{ user: SessionUser }>("/auth", { signal });
      if (signal?.aborted) return { user: null, error: null };
      setUser(data.user);
      setStatus("authenticated");
      toast.dismiss(SESSION_ERROR_TOAST_ID);
      return { user: data.user, error: null };
    } catch (error) {
      if (signal?.aborted) return { user: null, error: null };

      const isAnonymous = error instanceof ApiError && error.status === 401;
      const sessionFailure = isAnonymous
        ? null
        : error instanceof Error
          ? error
          : new Error("Tidak dapat terhubung ke server");

      setUser(null);
      setStatus("anonymous");
      setSessionError(sessionFailure);

      if (sessionFailure) {
        toast.error(getErrorMessage(error, "Tidak dapat terhubung ke server"), {
          id: SESSION_ERROR_TOAST_ID,
        });
      } else {
        toast.dismiss(SESSION_ERROR_TOAST_ID);
      }

      return { user: null, error: sessionFailure };
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
    toast.dismiss(SESSION_ERROR_TOAST_ID);
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
