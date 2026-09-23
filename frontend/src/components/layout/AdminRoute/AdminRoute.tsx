import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import { ADMIN_EMAIL } from "../../../constants/admin";

export default function AdminRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div role="status">Verificando sessão...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.email === ADMIN_EMAIL ? <Outlet /> : <Navigate to="/" replace />;
}
