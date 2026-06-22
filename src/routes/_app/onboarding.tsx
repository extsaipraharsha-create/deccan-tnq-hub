import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Badge } from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { CheckCircle2, Circle } from "lucide-react";

const STAGES = [
  { n: 1, title: "Account created", desc: "Sign in with Google" },
  { n: 2, title: "SME assigned", desc: "Your subject matter expert" },
  { n: 3, title: "Project assigned", desc: "Your first project" },
  { n: 4, title: "Learning path started", desc: "Begin your training" },
  { n: 5, title: "Ready to contribute", desc: "Onboarding complete" },
];

function OnboardingPage() {
  const { user } = useAuth();
  const [stage, setStage] = useState(1);
  const [status, setStatus] = useState("not_started");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("contributors")
      .select("onboarding_stage,onboarding_status")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      setStage((data as any).onboarding_stage);
      setStatus((data as any).onboarding_status);
    } else {
      await supabase
        .from("contributors")
        .insert({ id: user.id, onboarding_stage: 1, onboarding_status: "not_started" });
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [user]);

  async function advance() {
    if (!user) return;
    const next = Math.min(5, stage + 1);
    const ns = next >= 5 ? "complete" : "in_progress";
    await supabase
      .from("contributors")
      .update({ onboarding_stage: next, onboarding_status: ns })
      .eq("id", user.id);
    setStage(next);
    setStatus(ns);
  }

  return (
    <div>
      <PageHeader
        title="Onboarding"
        subtitle="Track your ramp-up"
        right={<Badge tone={status === "complete" ? "success" : "info"}>{status}</Badge>}
      />
      <Card>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <ol className="space-y-4">
            {STAGES.map((s) => {
              const done = stage > s.n || (stage === s.n && status === "complete");
              const current = stage === s.n && status !== "complete";
              return (
                <li
                  key={s.n}
                  className={`flex items-start gap-3 p-3 rounded-lg ${current ? "bg-primary/5 border border-primary/20" : ""}`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <Circle
                      className={`h-5 w-5 mt-0.5 ${current ? "text-primary" : "text-muted-foreground"}`}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  {current && stage < 5 && (
                    <Button size="sm" onClick={advance}>
                      Mark done
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
export const Route = createFileRoute("/_app/onboarding")({ component: OnboardingPage });
