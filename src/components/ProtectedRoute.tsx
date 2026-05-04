import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { AppRole, useAuth, dashboardPathFor } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  allow?: AppRole[];
}

export default function ProtectedRoute({ children, allow }: Props) {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  if (allow && allow.length && !allow.some((r) => roles.includes(r))) {
    return <Navigate to={dashboardPathFor(roles)} replace />;
  }

  return <>{children}</>;
}