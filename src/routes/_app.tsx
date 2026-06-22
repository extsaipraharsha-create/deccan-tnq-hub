import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/tnq/AppShell";
import { useAuth } from "@/lib/tnq/auth-context";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { loading, session, role, status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (status === "suspended") {
      navigate({ to: "/suspended", replace: true });
      return;
    }
    if (!role || role === "pending") {
      navigate({ to: "/pending", replace: true });
      return;
    }
  }, [loading, session, role, status, navigate]);

  if (loading || !session || !role || role === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
