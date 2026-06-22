import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { AppRole, ProfileRow, RoleRow, UserStatus } from "./types";

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  status: UserStatus | null;
  profile: ProfileRow | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadFor(userId: string) {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role,status,assigned_sme_id,user_id")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);
    const role = (r as RoleRow | null)?.role ?? "pending";
    const status = (r as RoleRow | null)?.status ?? "pending";
    setRole(role);
    setStatus(status);
    setProfile(p as ProfileRow | null);
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (data.session?.user) await loadFor(data.session.user.id);
    else {
      setRole(null);
      setStatus(null);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      // initial session load (required after OAuth redirect)
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) await loadFor(data.session.user.id);
      else {
        setRole(null);
        setStatus(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(sess);
        if (sess?.user) {
          loadFor(sess.user.id);
        }
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
        setRole(null);
        setStatus(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setStatus(null);
    setProfile(null);
  }

  return (
    <Ctx.Provider
      value={{
        loading,
        session,
        user: session?.user ?? null,
        role,
        status,
        profile,
        refresh,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
