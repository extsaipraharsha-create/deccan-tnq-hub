/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

type Step = {
  key: string;
  path: string;
  targetTestId: string;
  tooltip: string;
  position: "below" | "right" | "center" | "belowForm";
};

const STORAGE_KEY = "tnq_tour_v2_complete";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getTooltipStyle(
  position: Step["position"],
  rect: DOMRect | null,
): React.CSSProperties {
  if (!rect) return { left: 24, top: 24 };

  const margin = 12;
  const centerX = rect.left + rect.width / 2;

  switch (position) {
    case "below": {
      const top = rect.bottom + margin;
      const left = centerX;
      return {
        top,
        left,
        transform: "translateX(-50%)",
        maxWidth: 340,
      };
    }
    case "belowForm": {
      const top = rect.bottom + margin;
      const left = rect.left;
      return {
        top,
        left: clamp(left, margin, window.innerWidth - 360),
        transform: "none",
        maxWidth: 360,
      };
    }
    case "right": {
      const top = rect.top;
      const left = rect.right + margin;
      return {
        top,
        left,
        transform: "none",
        maxWidth: 360,
      };
    }
    case "center":
    default: {
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -50%)",
        maxWidth: 360,
      };
    }
  }
}

export function GuidedTour({ enabled }: { enabled: boolean }) {
  const navigate = useNavigate();
  const steps: Step[] = useMemo(
    () => [
      {
        key: "dashboard-cards",
        path: "/dashboard",
        targetTestId: "tour-dashboard-stat-cards",
        tooltip: "These cards show your platform health at a glance",
        position: "below",
      },
      {
        key: "dashboard-sidebar",
        path: "/dashboard",
        targetTestId: "tour-sidebar-nav",
        tooltip:
          "Navigate between sections using the sidebar. Your role determines what you can see.",
        position: "right",
      },
      {
        key: "projects-list",
        path: "/projects",
        targetTestId: "tour-projects-list",
        tooltip: "All your AI projects live here. Click any project to see full details.",
        position: "center",
      },
      {
        key: "worklog-post-form",
        path: "/worklog",
        targetTestId: "tour-worklog-post-form",
        tooltip:
          "Log what you are working on here. Use P0-P3 priority levels to flag urgency.",
        position: "belowForm",
      },
      {
        key: "quality-main",
        path: "/quality",
        targetTestId: "tour-quality-main",
        tooltip:
          "Track quality scores and issues here. Link your Google Sheet for live sync.",
        position: "center",
      },
      {
        key: "resources-grid",
        path: "/resources",
        targetTestId: "tour-resources-grid",
        tooltip:
          "Upload files or paste links to share resources with your team.",
        position: "center",
      },
    ],
    [],
  );

  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const current = steps[stepIndex];

  useEffect(() => {
    if (!enabled) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (done === "true") return;

    // First-time users auto-start.
    setOpen(true);
    setStepIndex(0);
  }, [enabled]);

  useEffect(() => {
    if (!open) return;

    const s = steps[stepIndex];
    if (!s) return;

    // Navigate first, then measure.
    if (window.location.pathname !== s.path) {
      navigate({ to: s.path as any });
      return;
    }

    const measure = () => {
      const el = document.querySelector(`[data-tour-id="${s.targetTestId}"]`) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      setRect(el.getBoundingClientRect());
    };

    // Wait a tick for route content.
    const t = window.setTimeout(measure, 50);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, stepIndex, navigate, steps]);

  function closeAndMarkComplete() {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    setOpen(true);
    setStepIndex(0);
  }

  // Expose restart via global event so sidebar/profile can call it without prop drilling.
  useEffect(() => {
    const handler = () => restart();
    window.addEventListener("tnq:tour_start", handler);
    return () => window.removeEventListener("tnq:tour_start", handler);
  }, []);

  if (!open || !current) return null;

  const tooltipStyle = getTooltipStyle(current.position, rect);

  const prevDisabled = stepIndex === 0;
  const nextDisabled = stepIndex >= steps.length - 1;

  return (
    <div className="fixed inset-0 z-9999">
      <div className="absolute inset-0 bg-black/50" />

      {rect && (
        <div
          className="absolute rounded-xl border-2 border-white/80 shadow-[0_0_0_6px_rgba(255,255,255,0.15)]"
          style={{
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="absolute z-10000 bg-card border border-border rounded-2xl shadow-pop p-4"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm text-foreground/90 leading-relaxed">{current.tooltip}</div>
          <button
            onClick={closeAndMarkComplete}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            disabled={prevDisabled}
            onClick={() => setStepIndex((i) => clamp(i - 1, 0, steps.length - 1))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          <div className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            {stepIndex + 1}/{steps.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeAndMarkComplete}
              className="px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted text-sm"
            >
              Skip
            </button>
            <button
              disabled={nextDisabled}
              onClick={() => setStepIndex((i) => clamp(i + 1, 0, steps.length - 1))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

