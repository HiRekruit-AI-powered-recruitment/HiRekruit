import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Not authenticated - redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Authenticated - render protected content
  return children;
}
