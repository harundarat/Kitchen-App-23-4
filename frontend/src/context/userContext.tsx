import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { toast } from "react-hot-toast";
import { ApiError, api, getErrorMessage } from "../services/api";
import type { SessionUser } from "../types/api";

interface UserContextValue {
  user: SessionUser | null;
  setUser: Dispatch<SetStateAction<SessionUser | null>>;
  isLogged: boolean | null;
  setIsLogged: Dispatch<SetStateAction<boolean | null>>;
  refreshSession: () => Promise<void>;
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
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const data = await api.get<{ user: SessionUser }>("/auth");
      setIsLogged(true);
      setUser(data.user);
    } catch (error) {
      setIsLogged(false);
      setUser(null);
      if (!(error instanceof ApiError) || error.status !== 401) {
        toast.error(getErrorMessage(error, "Tidak dapat terhubung ke server"));
      }
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({ user, setUser, isLogged, setIsLogged, refreshSession }),
    [isLogged, refreshSession, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
