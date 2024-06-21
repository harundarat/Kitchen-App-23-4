import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(null);
  useEffect(() => {
    axios
      .get("/auth")
      .then(({ data }) => {
        setIsLogged(true);
        setUser(data);
      })
      .catch((error) => {
        setIsLogged(false);
        console.error(error.response?.data.error);
        if (error.code === "ERR_NETWORK") {
          toast.error(error.message);
          return;
        }
      });
  }, [isLogged]);

  return (
    <UserContext.Provider value={{ user, setUser, isLogged, setIsLogged }}>
      {children}
    </UserContext.Provider>
  );
}
