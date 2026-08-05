import { useEffect, useRef } from "react";

// Keeps pages showing shared/team data current without a manual refresh:
// re-runs `refetch` on an interval and whenever the tab regains focus or
// becomes visible again, so edits made elsewhere (or by teammates) show up.
export function useAutoRefresh(refetch: () => void, intervalMs = 20000) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    const tick = () => refetchRef.current();
    const id = window.setInterval(tick, intervalMs);
    const onFocus = () => tick();
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);
}
