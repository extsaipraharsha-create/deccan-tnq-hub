import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [session, loading, navigate]);

  async function handleGoogle() {
    setSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error("Sign-in failed", { description: error.message });
        setSigningIn(false);
      }
    } catch (e) {
      toast.error("Sign-in failed", {
        description: e instanceof Error ? e.message : String(e),
      });
      setSigningIn(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top, oklch(0.27 0.06 257), oklch(0.16 0.04 257))",
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-card rounded-2xl shadow-pop border border-border p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--color-role-contributor), var(--color-role-sme))",
            }}
          >
            D
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Deccan AI</div>
            <div className="text-lg font-semibold text-foreground -mt-0.5">TnQ Hub</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your @deccan.ai account.</p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogle}
          disabled={signingIn}
          className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
        >
          <GoogleIcon />
          {signingIn ? "Signing in…" : "Continue with Google"}
        </motion.button>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Access is restricted to Deccan AI employees.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-2 1.4-4.4 2.2-6.9 2.2-5.3 0-9.7-3-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5c4.2-3.9 6.9-9.5 6.9-15.7 0-1.2-.1-2.3-.3-2.5z"
      />
    </svg>
  );
}
