import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Hourglass } from "lucide-react";
import { useAuth } from "@/lib/tnq/auth-context";

export const Route = createFileRoute("/pending")({ component: Pending });

function Pending() {
  const { loading, session, role, status, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (status === "suspended") navigate({ to: "/suspended", replace: true });
    else if (role && role !== "pending") navigate({ to: "/dashboard", replace: true });
  }, [loading, session, role, status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-soft">
        <div className="mx-auto h-14 w-14 rounded-full bg-warning/15 flex items-center justify-center text-warning">
          <Hourglass className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">Access Pending</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account has been created but hasn't been granted access yet. Contact a TnQ admin.
        </p>
        <button
          onClick={signOut}
          className="mt-6 rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
