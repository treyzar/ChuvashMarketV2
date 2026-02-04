import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser } from "../api/auth.js";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "cm_access_token";
const REFRESH_TOKEN_KEY = "cm_refresh_token";

const getInitialToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(getInitialToken);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(accessToken);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    fetchCurrentUser()
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        // токен устарел или невалиден
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const saveTokens = (access, refresh) => {
    if (access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      setAccessToken(access);
    }
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading: isLoading,
        user,
        saveTokens,
        clearTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

