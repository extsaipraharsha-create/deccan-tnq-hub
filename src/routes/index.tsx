import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/tnq/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
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
    navigate({ to: "/dashboard", replace: true });
  }, [loading, session, role, status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
    </div>
  );
}
