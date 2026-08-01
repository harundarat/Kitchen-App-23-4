import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { additionalInfo as getAddInfo } from "../services/getAdditionalInfo";
import type { AdditionalInfo } from "../types/api";

interface AdditionalInfoContextValue {
  additionalInfo: AdditionalInfo | null;
  loading: boolean;
}

export const AdditionalInfoContext =
  createContext<AdditionalInfoContextValue | null>(null);

export function useAdditionalInfo(): AdditionalInfoContextValue {
  const context = useContext(AdditionalInfoContext);
  if (!context) {
    throw new Error(
      "useAdditionalInfo must be used within AdditionalInfoProvider",
    );
  }
  return context;
}

export function AdditionalInfoProvider({ children }: { children: ReactNode }) {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdditionalInfo() {
      try {
        setLoading(true);
        setAdditionalInfo(await getAddInfo());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAdditionalInfo();
  }, []);

  return (
    <AdditionalInfoContext.Provider value={{ additionalInfo, loading }}>
      {children}
    </AdditionalInfoContext.Provider>
  );
}
