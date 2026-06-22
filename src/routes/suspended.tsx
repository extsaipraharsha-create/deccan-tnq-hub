import { createFileRoute } from "@tanstack/react-router";
import { Ban } from "lucide-react";
import { useAuth } from "@/lib/tnq/auth-context";

export const Route = createFileRoute("/suspended")({ component: Suspended });

function Suspended() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-soft">
        <div className="mx-auto h-14 w-14 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
          <Ban className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">Account Suspended</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account has been suspended. Contact an administrator.
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
