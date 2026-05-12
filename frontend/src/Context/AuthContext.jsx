import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [companyData, setCompanyData] = useState(() => {
    const savedCompany = localStorage.getItem("companyData");
    return savedCompany ? JSON.parse(savedCompany) : null;
  });
  
  // Set isLoading to false initially so the UI renders immediately based on localStorage
  const [isLoading, setIsLoading] = useState(false);

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
        setCompanyData(data.company);
        
        // Update local storage with fresh data
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.company) {
          localStorage.setItem("companyData", JSON.stringify(data.company));
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCompanyData(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        localStorage.removeItem("companyData");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      setCompanyData(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("companyData");
    } finally {
      setIsLoading(false);
    }
  };

  // Login function (call after successful login)
  const login = async (userData, companyDataParam = null) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    
    if (companyDataParam) {
      setCompanyData(companyDataParam);
      localStorage.setItem("companyData", JSON.stringify(companyDataParam));
    }
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
      setCompanyData(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("companyData");
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
        companyData,
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
