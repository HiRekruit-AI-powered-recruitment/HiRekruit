import { createContext, useContext, useState, useEffect } from "react";
import Loader from "../components/Loader";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function (call after successful login)
  const login = async (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        refreshUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
