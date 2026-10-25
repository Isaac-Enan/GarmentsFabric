import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { UserRole } from "@/features/auth/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerifiedCompany?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireVerifiedCompany = false,
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (
    requireVerifiedCompany &&
    user.role !== "ADMIN" &&
    user.role !== "HUB_STAFF" &&
    user.company?.verification_status !== "APPROVED"
  ) {
    return <Navigate to="/approval-pending" replace />;
  }

  return <>{children}</>;
};
