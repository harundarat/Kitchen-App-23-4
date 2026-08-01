import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { api, getErrorMessage } from "../services/api";
export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(null);
  useEffect(() => {
    api
      .get("/auth")
      .then((data) => {
        setIsLogged(true);
        setUser(data);
      })
      .catch((error) => {
        setIsLogged(false);
        toast.error(getErrorMessage(error, "Tidak dapat terhubung ke server"));
      });
  }, [isLogged]);

  return (
    <UserContext.Provider value={{ user, setUser, isLogged, setIsLogged }}>
      {children}
    </UserContext.Provider>
  );
}
