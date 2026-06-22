import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Textarea,
  Field,
  Modal,
  Badge,
  EmptyState,
} from "@/components/tnq/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { Plus, Target, AlertCircle, Power } from "lucide-react";
import { toast } from "sonner";

interface Prof {
  id: string;
  name: string | null;
  email: string | null;
  photo_url?: string | null;
}
interface Score {
  id: string;
  contributor_id: string;
  project_id: string | null;
  score: number;
  review_date: string;
  notes: string | null;
}
interface Issue {
  id: string;
  contributor_id: string | null;
  issue: string;
  status: string;
  date: string;
  project_id: string | null;
}
interface Proj {
  id: string;
  name: string;
  status: string;
  audience_type: string | null;
  version: string | null;
  tasking_live: boolean;
  current_owner_ids: string[] | null;
  emoji_icon: string | null;
}

const STATUS_TONE: Record<string, "success" | "warn" | "default"> = {
  active: "success",
  paused: "warn",
  completed: "default",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Live",
  paused: "Planning",
  completed: "Inactive",
};

function scoreTone(s: number | null): "success" | "warn" | "danger" | "default" {
  if (s == null) return "default";
  if (s >= 80) return "success";
  if (s >= 60) return "warn";
  return "danger";
}

function QualityPage() {
  const { user, role } = useAuth();
  const canWrite = role === "super_admin" || role === "tnq_team";
  const [scores, setScores] = useState<Score[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [projects, setProjects] = useState<Proj[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [openScore, setOpenScore] = useState(false);
  const [openIssue, setOpenIssue] = useState(false);
  const [s, setS] = useState({ contributor_id: "", project_id: "", score: "85", notes: "" });
  const [i, setI] = useState({ contributor_id: "", project_id: "", issue: "" });

  async function load() {
    const [{ data: sc }, { data: is }, { data: pr }, { data: pj }] = await Promise.all([
      supabase.from("quality_scores").select("*").order("review_date", { ascending: false }),
      supabase.from("quality_issues").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("id,name,email,photo_url"),
      supabase
        .from("projects")
        .select("id,name,status,audience_type,version,tasking_live,current_owner_ids,emoji_icon")
        .order("name"),
    ]);
    setScores((sc as any) ?? []);
    setIssues((is as any) ?? []);
    setProfiles((pr as any) ?? []);
    setProjects((pj as any) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  const projectStats = useMemo(() => {
    return projects.map((p) => {
      const ps = scores.filter((x) => x.project_id === p.id);
      const avg = ps.length
        ? Math.round((ps.reduce((a, b) => a + Number(b.score), 0) / ps.length) * 10) / 10
        : null;
      const open = issues.filter((x) => x.project_id === p.id && x.status === "open").length;
      const last = ps[0]?.review_date ?? null;
      return { ...p, avg, open, lastReview: last };
    });
  }, [projects, scores, issues]);

  async function addScore() {
    if (!s.contributor_id) return;
    await supabase.from("quality_scores").insert({
      contributor_id: s.contributor_id,
      project_id: s.project_id || activeTab !== "all" ? s.project_id || activeTab : null,
      score: Number(s.score),
      notes: s.notes || null,
      reviewed_by: user?.id ?? null,
    } as any);
    setOpenScore(false);
    setS({ contributor_id: "", project_id: "", score: "85", notes: "" });
    load();
  }
  async function addIssue() {
    if (!i.issue.trim()) return;
    await supabase.from("quality_issues").insert({
      contributor_id: i.contributor_id || null,
      project_id: i.project_id || (activeTab !== "all" ? activeTab : null),
      issue: i.issue,
      sme_id: user?.id ?? null,
    } as any);
    setOpenIssue(false);
    setI({ contributor_id: "", project_id: "", issue: "" });
    load();
  }
  async function toggleIssue(id: string, st: string) {
    await supabase
      .from("quality_issues")
      .update({ status: st === "open" ? "resolved" : "open" })
      .eq("id", id);
    load();
  }
  async function toggleTasking(p: Proj) {
    if (!canWrite) return;
    const next = !p.tasking_live;
    const { error } = await supabase
      .from("projects")
      .update({ tasking_live: next, updated_by: user?.id ?? null } as any)
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    await supabase.from("activity_log").insert({
      user_id: user?.id ?? "",
      action: "tasking_toggled",
      action_type: "project_update",
      target: p.id,
      field_changed: "tasking_live",
      old_value: String(p.tasking_live),
      new_value: String(next),
    } as any);
    toast.success(`Tasking ${next ? "live" : "paused"} for ${p.name}`);
    load();
  }

  const name = (id: string | null) => profiles.find((p) => p.id === id)?.name ?? "—";
  const ownerNames = (ids: string[] | null) =>
    !ids?.length ? "—" : ids.map((id) => profiles.find((p) => p.id === id)?.name ?? "?").join(", ");

  const activeProject = activeTab !== "all" ? projectStats.find((p) => p.id === activeTab) : null;
  const tabScores = activeProject
    ? scores.filter((x) => x.project_id === activeProject.id)
    : scores;
  const tabIssues = activeProject
    ? issues.filter((x) => x.project_id === activeProject.id)
    : issues;

  return (
    <div>
      <PageHeader
        title="Quality tracker"
        subtitle="Per-project quality, scores and issues."
        right={
          canWrite && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setOpenIssue(true)}>
                <AlertCircle className="h-4 w-4" /> Raise issue
              </Button>
              <Button onClick={() => setOpenScore(true)}>
                <Plus className="h-4 w-4" /> Log score
              </Button>
            </div>
          )
        }
      />

      {/* Project Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${
            activeTab === "all"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ALL PROJECTS
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className={`font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${
              activeTab === p.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.emoji_icon ?? "📁"} {p.name.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === "all" ? (
        <Card className="!p-0 overflow-hidden">
          {projectStats.length === 0 ? (
            <EmptyState title="No projects yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                    <th className="text-left px-5 py-3">Project</th>
                    <th className="text-left px-3 py-3">Audience</th>
                    <th className="text-left px-3 py-3">Version</th>
                    <th className="text-left px-3 py-3">Status</th>
                    <th className="text-left px-3 py-3">Tasking Live</th>
                    <th className="text-left px-3 py-3">Current Owners</th>
                    <th className="text-left px-3 py-3">Avg Score</th>
                    <th className="text-left px-3 py-3">Open Issues</th>
                    <th className="text-left px-3 py-3">Last Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectStats.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/40">
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setActiveTab(p.id)}
                          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                        >
                          <span className="text-lg">{p.emoji_icon ?? "📁"}</span> {p.name}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone="info">{p.audience_type ?? "N/A"}</Badge>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{p.version ?? "—"}</td>
                      <td className="px-3 py-3">
                        <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleTasking(p)}
                          disabled={!canWrite}
                          className={`font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded inline-flex items-center gap-1 ${
                            p.tasking_live
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          } ${canWrite ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
                        >
                          <Power className="h-3 w-3" /> {p.tasking_live ? "YES" : "NO"}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                        {ownerNames(p.current_owner_ids)}
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={scoreTone(p.avg)}>
                          {p.avg != null ? p.avg.toFixed(1) : "—"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-mono">{p.open}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {p.lastReview ? new Date(p.lastReview).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        activeProject && (
          <div className="space-y-4">
            {/* Project header row */}
            <Card>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeProject.emoji_icon ?? "📁"}</span>
                  <div>
                    <div className="text-xl font-bold text-foreground">{activeProject.name}</div>
                    <Link
                      to="/projects/$id"
                      params={{ id: activeProject.id }}
                      className="text-xs text-primary hover:underline"
                    >
                      Open project →
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    Audience
                  </div>
                  <Badge tone="info">{activeProject.audience_type ?? "N/A"}</Badge>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    Version
                  </div>
                  <span className="font-mono font-bold">{activeProject.version ?? "—"}</span>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    Status
                  </div>
                  <Badge tone={STATUS_TONE[activeProject.status]}>
                    {STATUS_LABEL[activeProject.status]}
                  </Badge>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    Tasking Live
                  </div>
                  <button
                    onClick={() => toggleTasking(activeProject)}
                    disabled={!canWrite}
                    className={`font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded inline-flex items-center gap-1 ${
                      activeProject.tasking_live
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    <Power className="h-3 w-3" /> {activeProject.tasking_live ? "YES" : "NO"}
                  </button>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    Avg Score
                  </div>
                  <Badge tone={scoreTone(activeProject.avg)}>
                    {activeProject.avg != null ? activeProject.avg.toFixed(1) : "—"}
                  </Badge>
                </div>
                <div className="min-w-[200px]">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
                    Current Owners
                  </div>
                  <div className="text-sm">{ownerNames(activeProject.current_owner_ids)}</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Contributor scores
                </h2>
                {tabScores.length === 0 ? (
                  <EmptyState title="No scores logged yet" />
                ) : (
                  <ul className="space-y-2 max-h-[480px] overflow-y-auto">
                    {tabScores.map((x) => (
                      <li
                        key={x.id}
                        className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{name(x.contributor_id)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(x.review_date).toLocaleDateString()}
                          </div>
                          {x.notes && <div className="text-xs mt-1">{x.notes}</div>}
                        </div>
                        <Badge tone={scoreTone(Number(x.score))}>
                          {Number(x.score).toFixed(1)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card>
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Issues
                </h2>
                {tabIssues.length === 0 ? (
                  <EmptyState title="No issues raised" />
                ) : (
                  <ul className="space-y-2 max-h-[480px] overflow-y-auto">
                    {tabIssues.map((x) => (
                      <li
                        key={x.id}
                        className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="text-sm">{x.issue}</div>
                          <div className="text-xs text-muted-foreground">
                            {name(x.contributor_id)} · {new Date(x.date).toLocaleDateString()}
                          </div>
                        </div>
                        <button onClick={() => toggleIssue(x.id, x.status)}>
                          <Badge tone={x.status === "open" ? "warn" : "success"}>{x.status}</Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )
      )}

      <Modal
        open={openScore}
        onClose={() => setOpenScore(false)}
        title="Log quality score"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenScore(false)}>
              Cancel
            </Button>
            <Button onClick={addScore}>Save</Button>
          </>
        }
      >
        <Field label="Contributor">
          <Select
            value={s.contributor_id}
            onChange={(e) => setS({ ...s, contributor_id: e.target.value })}
          >
            <option value="">Select…</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Project">
          <Select
            value={s.project_id || (activeTab !== "all" ? activeTab : "")}
            onChange={(e) => setS({ ...s, project_id: e.target.value })}
          >
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Score (0–100)">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={s.score}
            onChange={(e) => setS({ ...s, score: e.target.value })}
          />
        </Field>
        <Field label="Notes">
          <Textarea value={s.notes} onChange={(e) => setS({ ...s, notes: e.target.value })} />
        </Field>
      </Modal>

      <Modal
        open={openIssue}
        onClose={() => setOpenIssue(false)}
        title="Raise issue"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenIssue(false)}>
              Cancel
            </Button>
            <Button onClick={addIssue}>Save</Button>
          </>
        }
      >
        <Field label="Issue">
          <Textarea value={i.issue} onChange={(e) => setI({ ...i, issue: e.target.value })} />
        </Field>
        <Field label="Contributor (optional)">
          <Select
            value={i.contributor_id}
            onChange={(e) => setI({ ...i, contributor_id: e.target.value })}
          >
            <option value="">—</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Project">
          <Select
            value={i.project_id || (activeTab !== "all" ? activeTab : "")}
            onChange={(e) => setI({ ...i, project_id: e.target.value })}
          >
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>
    </div>
  );
}
export const Route = createFileRoute("/_app/quality")({ component: QualityPage });
