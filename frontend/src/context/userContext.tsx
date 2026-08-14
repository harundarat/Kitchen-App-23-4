import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { ApiError, api, getErrorMessage } from "../services/api";
import {
  notifySessionChanged,
  subscribeToSessionChanges,
  subscribeToSessionInvalidations,
} from "../services/sessionRecovery";
import type { SessionUser } from "../types/api";

const SESSION_ERROR_TOAST_ID = "session-refresh-error";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface SessionRefreshResult {
  user: SessionUser | null;
  error: Error | null;
}

export interface SessionRefreshOptions {
  signal?: AbortSignal;
  notifyOtherTabs?: boolean;
}

interface UserContextValue {
  user: SessionUser | null;
  status: SessionStatus;
  sessionError: Error | null;
  isLogged: boolean;
  isUser: boolean;
  isAdmin: boolean;
  refreshSession: (
    options?: SessionRefreshOptions,
  ) => Promise<SessionRefreshResult>;
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
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const userRef = useRef<SessionUser | null>(null);
  const confirmedPrincipalRef = useRef<string | null | undefined>(undefined);
  const requestedRefreshGeneration = useRef(0);
  const pendingRefresh = useRef<
    { generation: number; signal?: AbortSignal } | undefined
  >(undefined);
  const refreshDrain = useRef<Promise<SessionRefreshResult> | null>(null);
  const activationNeedsRefresh = useRef(false);

  const commitPrincipal = useCallback((nextUser: SessionUser | null) => {
    const nextPrincipal = nextUser
      ? `${nextUser.role}\u0000${nextUser.id}\u0000${nextUser.username}`
      : null;
    const previousPrincipal = confirmedPrincipalRef.current;

    if (
      previousPrincipal !== undefined &&
      previousPrincipal !== nextPrincipal
    ) {
      setSessionEpoch((current) => current + 1);
    }

    confirmedPrincipalRef.current = nextPrincipal;
    userRef.current = nextUser;
    setUser(nextUser);
  }, []);

  const performSessionRefresh = useCallback(
    async (
      generation: number,
      signal?: AbortSignal,
    ): Promise<SessionRefreshResult> => {
      if (signal?.aborted) return { user: userRef.current, error: null };

      try {
        const data = await api.get<{ user: SessionUser }>("/auth", { signal });
        if (signal?.aborted) return { user: userRef.current, error: null };
        if (generation !== requestedRefreshGeneration.current) {
          return { user: userRef.current, error: null };
        }

        commitPrincipal(data.user);
        setStatus("authenticated");
        setSessionError(null);
        toast.dismiss(SESSION_ERROR_TOAST_ID);
        return { user: data.user, error: null };
      } catch (error) {
        if (signal?.aborted) return { user: userRef.current, error: null };
        if (generation !== requestedRefreshGeneration.current) {
          return {
            user: userRef.current,
            error: error instanceof Error ? error : null,
          };
        }

        const isAnonymous = error instanceof ApiError && error.status === 401;
        if (isAnonymous) {
          commitPrincipal(null);
          setStatus("anonymous");
          setSessionError(null);
          toast.dismiss(SESSION_ERROR_TOAST_ID);
          return { user: null, error: null };
        }

        const sessionFailure =
          error instanceof Error
            ? error
            : new Error("Tidak dapat terhubung ke server");
        const confirmedUser = userRef.current;
        if (!confirmedUser) setStatus("anonymous");
        setSessionError(sessionFailure);
        if (confirmedUser) activationNeedsRefresh.current = true;
        toast.error(getErrorMessage(error, "Tidak dapat terhubung ke server"), {
          id: SESSION_ERROR_TOAST_ID,
        });
        return { user: confirmedUser, error: sessionFailure };
      }
    },
    [commitPrincipal],
  );

  const refreshSession = useCallback(
    (options: SessionRefreshOptions = {}) => {
      if (options.notifyOtherTabs) notifySessionChanged();

      const generation = ++requestedRefreshGeneration.current;
      pendingRefresh.current = { generation, signal: options.signal };
      setStatus("loading");
      setSessionError(null);

      if (!refreshDrain.current) {
        const drain = async (): Promise<SessionRefreshResult> => {
          let result: SessionRefreshResult = {
            user: userRef.current,
            error: null,
          };

          while (pendingRefresh.current) {
            const request = pendingRefresh.current;
            pendingRefresh.current = undefined;
            result = await performSessionRefresh(
              request.generation,
              request.signal,
            );
          }

          return result;
        };

        refreshDrain.current = drain().finally(() => {
          refreshDrain.current = null;
        });
      }

      return refreshDrain.current;
    },
    [performSessionRefresh],
  );

  const revalidateAfterExternalChange = useCallback(() => {
    activationNeedsRefresh.current = false;
    void refreshSession().then((result) => {
      if (result.error) activationNeedsRefresh.current = true;
    });
  }, [refreshSession]);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    return subscribeToSessionInvalidations(user.role, () => {
      revalidateAfterExternalChange();
    });
  }, [revalidateAfterExternalChange, status, user]);

  useEffect(
    () => subscribeToSessionChanges(revalidateAfterExternalChange),
    [revalidateAfterExternalChange],
  );

  useEffect(() => {
    activationNeedsRefresh.current =
      document.visibilityState === "hidden" || !document.hasFocus();

    const markInactive = () => {
      activationNeedsRefresh.current = true;
    };
    const revalidateOnActivation = () => {
      if (
        !activationNeedsRefresh.current ||
        document.visibilityState === "hidden"
      ) {
        return;
      }
      revalidateAfterExternalChange();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") markInactive();
      else revalidateOnActivation();
    };

    window.addEventListener("blur", markInactive);
    window.addEventListener("focus", revalidateOnActivation);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", markInactive);
      window.removeEventListener("focus", revalidateOnActivation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [revalidateAfterExternalChange]);

  useEffect(() => {
    const controller = new AbortController();
    void refreshSession({ signal: controller.signal });
    return () => controller.abort();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    if (user) {
      await api.post(user.role === "admin" ? "/admin/logout" : "/auth/logout");
    }
    ++requestedRefreshGeneration.current;
    pendingRefresh.current = undefined;
    commitPrincipal(null);
    setStatus("anonymous");
    setSessionError(null);
    activationNeedsRefresh.current = false;
    toast.dismiss(SESSION_ERROR_TOAST_ID);
    notifySessionChanged();
  }, [commitPrincipal, user]);

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

  return (
    <UserContext.Provider value={value}>
      <Fragment key={sessionEpoch}>{children}</Fragment>
    </UserContext.Provider>
  );
}
