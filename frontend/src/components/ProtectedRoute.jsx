import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
