import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// A user is "active" - eligible to appear in any picker (mention
// autocomplete, reviewer/owner/SME/contributor/point-of-contact
// assignment, filter-by-person, navigation search) - when they have a
// user_roles row with role !== "pending" and status === "active". Anyone
// else (no row at all, still pending, or suspended) keeps their name
// everywhere that's pure historical display (who authored/gave/owns an
// existing record); they just disappear from pickers. One shared
// definition so every page agrees on what "removed" means, instead of
// each one drifting its own filter.
export function useActiveUserIds(): Set<string> {
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("user_roles").select("user_id,role,status");
      if (cancelled) return;
      const rows = (data as { user_id: string; role: string; status: string }[]) ?? [];
      setActiveUserIds(
        new Set(
          rows.filter((r) => r.role !== "pending" && r.status === "active").map((r) => r.user_id),
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return activeUserIds;
}

export function useActiveProfiles<T extends { id: string }>(profiles: T[]): T[] {
  const activeUserIds = useActiveUserIds();
  return useMemo(() => profiles.filter((p) => activeUserIds.has(p.id)), [profiles, activeUserIds]);
}
