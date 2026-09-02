/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

// Live count of review requests assigned to the current user and still
// pending — drives the nav badge next to Work Log.
export function usePendingReviewCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { count: c } = await (supabase as any)
        .from("work_log_review_requests")
        .select("id", { count: "exact", head: true })
        .eq("reviewer_id", user.id)
        .eq("status", "pending");
      if (!cancelled) setCount(c ?? 0);
    };
    load();
    const ch = supabase
      .channel("pending-review-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_log_review_requests" },
        load,
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [user]);

  return count;
}
