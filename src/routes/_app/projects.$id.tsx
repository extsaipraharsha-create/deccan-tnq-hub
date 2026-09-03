/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { useAutoRefresh } from "@/lib/tnq/use-auto-refresh";
import {
  Card,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
  Field,
  Modal,
  EmptyState,
} from "@/components/tnq/ui";
import {
  ArrowLeft,
  Pencil,
  Plus,
  ExternalLink,
  FileText,
  FlaskConical,
  Rocket,
  GraduationCap,
  Radio,
  Link2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  given_name: string | null;
  domain: string | null;
  description: string | null;
  sme_owner_id: string | null;
  status: "active" | "paused" | "completed";
  audience_type: string | null;
  version: string | null;
  emoji_icon: string | null;
  current_owner_ids: string[] | null;
  previous_owner_ids: string[] | null;
  tasking_live?: boolean;
  last_updated?: string | null;
  last_updated_by?: string | null;
};
type ProjectLink = {
  id: string;
  project_id: string;
  link_type: string;
  label: string;
  url: string;
  updated_at: string;
};
type Profile = { id: string; name: string | null; email: string | null; photo_url: string | null };
type CoOwner = {
  id: string;
  project_id: string;
  user_id: string;
  working_on: string | null;
};
type Playground = { id: string; name: string; is_live: boolean; access_url: string | null };
type LPItem = { id: string; name: string; is_live: boolean; user_url: string | null };

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

const LINK_SLOTS: { type: string; label: string; icon: any }[] = [
  { type: "project_doc", label: "Project Document", icon: FileText },
  { type: "playground_user", label: "Playground (User)", icon: FlaskConical },
  { type: "playground_prod", label: "Playground (Production)", icon: Rocket },
  { type: "learning_path_user", label: "Learning Path (User)", icon: GraduationCap },
  { type: "learning_path_prod", label: "Learning Path (Production)", icon: Radio },
];

function Avatar({ p, size = 28 }: { p?: Profile | null; size?: number }) {
  if (!p) return null;
  const init = (p.name ?? p.email ?? "?").slice(0, 1).toUpperCase();
  return p.photo_url ? (
    <img
      src={p.photo_url}
      alt=""
      title={p.name ?? p.email ?? ""}
      className="rounded-full border-2 border-card"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      title={p.name ?? p.email ?? ""}
      className="rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground border-2 border-card"
      style={{ width: size, height: size }}
    >
      {init}
    </div>
  );
}

function OwnerList({ ids, profiles }: { ids: string[]; profiles: Profile[] }) {
  if (!ids?.length) return <span className="text-xs text-muted-foreground">— None</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const p = profiles.find((x) => x.id === id);
        if (!p) return null;
        return (
          <div key={id} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
            <Avatar p={p} size={24} />
            <span className="text-xs font-medium text-foreground">{p.name ?? p.email}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProjectDetail() {
  const { id } = useParams({ from: "/_app/projects/$id" });
  const { role, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<
    "overview" | "links" | "workspace" | "contributors" | "quality" | "activity"
  >("overview");
  const [editHeader, setEditHeader] = useState(false);
  const [name, setName] = useState("");
  const [given, setGiven] = useState("");
  const [editLink, setEditLink] = useState<{
    type: string;
    label: string;
    url: string;
    existing?: ProjectLink;
  } | null>(null);
  const [contribs, setContribs] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [learningPaths, setLearningPaths] = useState<LPItem[]>([]);
  const [addCoOwner, setAddCoOwner] = useState<{ userId: string; workingOn: string } | null>(
    null,
  );
  const loadedOnce = useRef(false);

  const canWrite =
    role === "super_admin" || role === "tnq_team" || project?.sme_owner_id === user?.id;

  async function load() {
    if (!loadedOnce.current) setLoading(true);
    const { data: p } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    setProject(p as any);
    setName((p as any)?.name ?? "");
    setGiven((p as any)?.given_name ?? "");
    const { data: l } = await (supabase.from("project_links" as any) as any)
      .select("*")
      .eq("project_id", id);
    setLinks((l as any) ?? []);
    const { data: pr } = await supabase.from("profiles").select("id,name,email,photo_url");
    setProfiles((pr as any) ?? []);
    const { data: co } = await (supabase.from("project_co_owners" as any) as any)
      .select("*")
      .eq("project_id", id);
    setCoOwners((co as any) ?? []);
    const { data: c } = await (supabase.from("contributors") as any)
      .select("*")
      .contains("projects", [id]);
    setContribs(c ?? []);
    const { data: q } = await supabase
      .from("quality_issues")
      .select("*")
      .eq("project_id", id)
      .order("date", { ascending: false });
    setIssues(q ?? []);
    const { data: a } = await supabase
      .from("activity_log")
      .select("*")
      .eq("target", id)
      .order("timestamp", { ascending: false })
      .limit(100);
    setActivity(a ?? []);
    const { data: pg } = await (supabase as any)
      .from("playgrounds")
      .select("id,name,is_live,access_url")
      .eq("project_id", id);
    setPlaygrounds((pg as any) ?? []);
    const { data: lp } = await (supabase as any)
      .from("learning_path_items")
      .select("id,name,is_live,user_url")
      .eq("project_id", id);
    setLearningPaths((lp as any) ?? []);
    setLoading(false);
    loadedOnce.current = true;
  }
  useEffect(() => {
    loadedOnce.current = false;
    load();
  }, [id]);
  // Skip auto-refetch while the header form is open so it can't clobber
  // unsaved edits to name/given name mid-type.
  useAutoRefresh(() => {
    if (!editHeader) load();
  });

  async function saveHeader() {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    const changes: { field: string; old: string; next: string }[] = [];
    if ((project?.name ?? "") !== name.trim())
      changes.push({ field: "name", old: project?.name ?? "", next: name.trim() });
    if ((project?.given_name ?? "") !== given.trim())
      changes.push({ field: "given_name", old: project?.given_name ?? "", next: given.trim() });
    const { error } = await supabase
      .from("projects")
      .update({
        name: name.trim(),
        given_name: given.trim() || null,
        updated_by: user?.id ?? null,
      } as any)
      .eq("id", id);
    if (error) return toast.error(error.message);
    if (changes.length > 0) {
      await supabase.from("activity_log").insert(
        changes.map((c) => ({
          user_id: user?.id ?? "",
          action: "field_updated",
          action_type: "project_update",
          target: id,
          field_changed: c.field,
          old_value: c.old,
          new_value: c.next,
        })) as any,
      );
    }
    toast.success("Updated");
    setEditHeader(false);
    load();
  }

  async function saveLink() {
    if (!editLink) return;
    if (!editLink.url.trim()) {
      toast.error("URL required");
      return;
    }
    const payload: any = {
      project_id: id,
      link_type: editLink.type,
      label: editLink.label || editLink.type,
      url: editLink.url.trim(),
      updated_by: user?.id ?? null,
    };
    const tbl = supabase.from("project_links" as any) as any;
    const res = editLink.existing
      ? await tbl.update(payload).eq("id", editLink.existing.id)
      : await tbl.insert({ ...payload, added_by: user?.id ?? null });
    if (res.error) return toast.error(res.error.message);
    toast.success("Link saved");
    await supabase.from("activity_log").insert({
      user_id: user?.id ?? "",
      action: editLink.existing ? "link_updated" : "link_added",
      action_type: "project_link",
      target: id,
      details: { type: editLink.type },
    } as any);
    setEditLink(null);
    load();
  }

  async function removeLink(l: ProjectLink) {
    if (!confirm("Delete this link?")) return;
    const { error } = await (supabase.from("project_links" as any) as any).delete().eq("id", l.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }

  async function saveCoOwner() {
    if (!addCoOwner?.userId) {
      toast.error("Select a person");
      return;
    }
    const { error } = await (supabase.from("project_co_owners" as any) as any).insert({
      project_id: id,
      user_id: addCoOwner.userId,
      working_on: addCoOwner.workingOn.trim() || null,
    });
    if (error) return toast.error(error.message);
    await supabase.from("activity_log").insert({
      user_id: user?.id ?? "",
      action: "co_owner_added",
      action_type: "project_update",
      target: id,
    } as any);
    toast.success("Co-owner added");
    setAddCoOwner(null);
    load();
  }

  async function removeCoOwner(co: CoOwner) {
    if (!confirm("Remove this co-owner?")) return;
    const { error } = await (supabase.from("project_co_owners" as any) as any)
      .delete()
      .eq("id", co.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }

  if (loading)
    return (
      <Card>
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      </Card>
    );
  if (!project)
    return (
      <Card>
        <EmptyState title="Project not found" />
      </Card>
    );

  const owner = profiles.find((p) => p.id === project.sme_owner_id);
  const currentOwners = project.current_owner_ids ?? [];
  const previousOwners = project.previous_owner_ids ?? [];

  const TABS: { key: typeof tab; label: string }[] = [
    { key: "overview", label: "OVERVIEW" },
    { key: "links", label: "LINKS" },
    { key: "workspace", label: "WORKSPACE" },
    { key: "contributors", label: "CONTRIBUTORS" },
    { key: "quality", label: "QUALITY" },
    { key: "activity", label: "ACTIVITY" },
  ];

  return (
    <div>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-xs font-mono tracking-[0.16em] text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> ALL PROJECTS
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <span className="text-5xl">{project.emoji_icon ?? "📁"}</span>
          <div className="min-w-0">
            {editHeader ? (
              <div className="space-y-2 max-w-md">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Project name"
                />
                <Input
                  value={given}
                  onChange={(e) => setGiven(e.target.value)}
                  placeholder="Given name / client"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveHeader}>
                    <Check className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditHeader(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {project.name}
                  {canWrite && (
                    <button
                      onClick={() => setEditHeader(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </h1>
                {project.given_name && (
                  <p className="text-base text-muted-foreground mt-1">
                    Client:{" "}
                    <span className="font-medium text-foreground/80">{project.given_name}</span>
                  </p>
                )}
                {project.last_updated && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Last updated:{" "}
                    {new Date(project.last_updated).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {project.last_updated_by && (
                      <> by {profiles.find((p) => p.id === project.last_updated_by)?.name ?? "—"}</>
                    )}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info chips row */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5">
              Audience
            </div>
            <Badge tone="info">{project.audience_type ?? "N/A"}</Badge>
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5">
              Status
            </div>
            <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
          </div>
          <div>
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5">
              Version
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {project.version ?? "—"}
            </span>
          </div>
          <div className="min-w-50">
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5">
              Current Owners
            </div>
            <OwnerList ids={currentOwners} profiles={profiles} />
          </div>
          <div className="min-w-50">
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5">
              Previous Owners
            </div>
            <OwnerList ids={previousOwners} profiles={profiles} />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors ${
              tab === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-2">
              Description
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {project.description || "No description yet."}
            </p>
          </Card>
          <Card>
            <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-2">
              SME Owner
            </div>
            {owner ? (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar p={owner} size={32} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{owner.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{owner.email}</div>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
          </Card>

          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                User Analytics
              </div>
              {canWrite && (
                <button
                  onClick={() => {
                    const existing = links.find((l) => l.link_type === "user_analytics");
                    setEditLink({
                      type: "user_analytics",
                      label: "User Analytics",
                      url: existing?.url ?? "",
                      existing,
                    });
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {(() => {
              const analytics = links.find((l) => l.link_type === "user_analytics");
              return analytics ? (
                <a
                  href={analytics.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  {analytics.url} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground italic">— Not set</span>
              );
            })()}
          </Card>

          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Co-Owners
              </div>
              {canWrite && (
                <Button size="sm" variant="secondary" onClick={() => setAddCoOwner({ userId: "", workingOn: "" })}>
                  <Plus className="h-3.5 w-3.5" /> Add Co-Owner
                </Button>
              )}
            </div>
            {coOwners.length === 0 ? (
              <span className="text-sm text-muted-foreground">— None</span>
            ) : (
              <div className="space-y-2">
                {coOwners.map((co) => {
                  const p = profiles.find((x) => x.id === co.user_id);
                  return (
                    <div
                      key={co.id}
                      className="flex items-center justify-between gap-3 bg-muted/40 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar p={p} size={28} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {p?.name ?? p?.email ?? "Unknown"}
                          </div>
                          {co.working_on && (
                            <div className="text-xs text-muted-foreground truncate">
                              {co.working_on}
                            </div>
                          )}
                        </div>
                      </div>
                      {canWrite && (
                        <button
                          onClick={() => removeCoOwner(co)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "links" && (
        <div className="grid gap-4 md:grid-cols-2">
          {LINK_SLOTS.map((slot) => {
            const existing = links.find((l) => l.link_type === slot.type);
            const Icon = slot.icon;
            return (
              <Card key={slot.type}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">
                        {existing?.label ?? slot.label}
                      </div>
                      {existing ? (
                        <a
                          href={existing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary truncate block max-w-65"
                        >
                          {existing.url}
                        </a>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">— Not set</div>
                      )}
                    </div>
                  </div>
                  {canWrite && (
                    <button
                      onClick={() =>
                        setEditLink({
                          type: slot.type,
                          label: existing?.label ?? slot.label,
                          url: existing?.url ?? "",
                          existing,
                        })
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  {existing ? (
                    <a
                      href={existing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    canWrite && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditLink({ type: slot.type, label: slot.label, url: "" })}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Link
                      </Button>
                    )
                  )}
                </div>
              </Card>
            );
          })}

          {/* Custom additional links */}
          {links
            .filter((l) => l.link_type === "custom")
            .map((l) => (
              <Card key={l.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Link2 className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{l.label}</div>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary truncate block max-w-65"
                      >
                        {l.url}
                      </a>
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setEditLink({ type: "custom", label: l.label, url: l.url, existing: l })
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeLink(l)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))}

          {canWrite && (
            <Card className="border-dashed flex items-center justify-center cursor-pointer hover:bg-accent/40">
              <button
                onClick={() => setEditLink({ type: "custom", label: "", url: "" })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add additional link
              </button>
            </Card>
          )}
        </div>
      )}

      {tab === "workspace" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-primary" />
              <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                Playgrounds
              </div>
            </div>
            {playgrounds.length === 0 ? (
              <EmptyState
                title="No playgrounds yet"
                subtitle="Add one from the Workspace page."
                icon={<FlaskConical className="h-8 w-8" />}
              />
            ) : (
              <div className="space-y-2">
                {playgrounds.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 bg-muted/40 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                      <span
                        className={`font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${p.is_live ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                      >
                        {p.is_live ? "LIVE" : "NOT LIVE"}
                      </span>
                    </div>
                    {p.access_url && (
                      <a
                        href={p.access_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <div className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                Learning Paths
              </div>
            </div>
            {learningPaths.length === 0 ? (
              <EmptyState
                title="No learning paths yet"
                subtitle="Add one from the Workspace page."
                icon={<GraduationCap className="h-8 w-8" />}
              />
            ) : (
              <div className="space-y-2">
                {learningPaths.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 bg-muted/40 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{l.name}</div>
                      <span
                        className={`font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${l.is_live ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                      >
                        {l.is_live ? "LIVE" : "NOT LIVE"}
                      </span>
                    </div>
                    {l.user_url && (
                      <a
                        href={l.user_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "contributors" && (
        <Card className="p-0! overflow-hidden">
          {contribs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No contributors on this project.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-3 py-3">Onboarding</th>
                    <th className="text-left px-3 py-3">Score</th>
                    <th className="text-left px-3 py-3">SME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contribs.map((c: any) => (
                    <tr key={c.id} className="hover:bg-accent/40">
                      <td className="px-5 py-3 text-foreground">{c.name ?? c.email ?? "—"}</td>
                      <td className="px-3 py-3">
                        <Badge tone={c.onboarding_status === "complete" ? "success" : "warn"}>
                          {c.onboarding_status ?? "pending"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-mono">{c.avg_score ?? "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {profiles.find((p) => p.id === c.sme_id)?.name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "quality" && (
        <div className="grid gap-4">
          <Card>
            <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1">
              Open Issues
            </div>
            <div className="font-digital text-4xl">{issues.length.toString().padStart(2, "0")}</div>
          </Card>
          {issues.length === 0 ? (
            <Card>
              <EmptyState title="No quality issues" />
            </Card>
          ) : (
            <Card className="p-0! overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                      <th className="text-left px-5 py-3">Issue</th>
                      <th className="text-left px-3 py-3">Severity</th>
                      <th className="text-left px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {issues.map((i: any) => (
                      <tr key={i.id}>
                        <td className="px-5 py-3">{i.title ?? i.description ?? "Issue"}</td>
                        <td className="px-3 py-3">
                          <Badge tone="warn">{i.severity ?? "—"}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge>{i.status ?? "open"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "activity" && (
        <Card className="p-0! overflow-hidden">
          {activity.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No activity logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                    <th className="text-left px-5 py-3">When</th>
                    <th className="text-left px-3 py-3">User</th>
                    <th className="text-left px-3 py-3">Action</th>
                    <th className="text-left px-3 py-3">Field</th>
                    <th className="text-left px-3 py-3">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activity.map((a: any) => {
                    const u = profiles.find((p) => p.id === a.user_id);
                    return (
                      <tr key={a.id}>
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(a.timestamp).toLocaleString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">{u?.name ?? u?.email ?? "—"}</td>
                        <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{a.action}</td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {a.field_changed ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-xs max-w-xs">
                          {a.field_changed ? (
                            <span className="block truncate" title={`${a.old_value || "∅"} → ${a.new_value || "∅"}`}>
                              <span className="text-muted-foreground line-through">
                                {a.old_value || "∅"}
                              </span>{" "}
                              →{" "}
                              <span className="text-foreground font-medium">
                                {a.new_value || "∅"}
                              </span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={!!editLink}
        onClose={() => setEditLink(null)}
        title={editLink?.existing ? "Edit link" : "Add link"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditLink(null)}>
              Cancel
            </Button>
            <Button onClick={saveLink}>Save</Button>
          </>
        }
      >
        {editLink && (
          <>
            <Field label="Label">
              <Input
                value={editLink.label}
                onChange={(e) => setEditLink({ ...editLink, label: e.target.value })}
                placeholder="Display name"
              />
            </Field>
            <Field label="URL">
              <Input
                value={editLink.url}
                onChange={(e) => setEditLink({ ...editLink, url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          </>
        )}
      </Modal>

      <Modal
        open={!!addCoOwner}
        onClose={() => setAddCoOwner(null)}
        title="Add co-owner"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddCoOwner(null)}>
              Cancel
            </Button>
            <Button onClick={saveCoOwner}>Save</Button>
          </>
        }
      >
        {addCoOwner && (
          <>
            <Field label="Person">
              <Select
                value={addCoOwner.userId}
                onChange={(e) => setAddCoOwner({ ...addCoOwner, userId: e.target.value })}
              >
                <option value="">Select…</option>
                {profiles
                  .filter((p) => !coOwners.some((co) => co.user_id === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? p.email}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Working on" hint="Optional — what they're contributing">
              <Input
                value={addCoOwner.workingOn}
                onChange={(e) => setAddCoOwner({ ...addCoOwner, workingOn: e.target.value })}
                placeholder="e.g. Content review"
              />
            </Field>
          </>
        )}
      </Modal>
    </div>
  );
}

export const Route = createFileRoute("/_app/projects/$id")({ component: ProjectDetail });
