import { createContext, useState, useEffect } from "react";
import { additionalInfo as getAddInfo } from "../services/getAdditionalInfo";

export const AdditionalInfoContext = createContext();

export function AdditionalInfoProvider({ children }) {
  const [additionalInfo, setAditioinalInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddInfo = async () => {
      try {
        setLoading(true);
        const data = await getAddInfo();
        setAditioinalInfo(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddInfo();
  }, []);

  return (
    <AdditionalInfoContext.Provider value={{ additionalInfo, loading }}>
      {children}
    </AdditionalInfoContext.Provider>
  );
}
