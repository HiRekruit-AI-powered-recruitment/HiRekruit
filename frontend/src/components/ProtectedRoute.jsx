import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

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
