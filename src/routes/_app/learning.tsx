import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import {
  PageHeader,
  Card,
  EmptyState,
  Input,
  Select,
  Button,
  Modal,
  Field,
  Badge,
} from "@/components/tnq/ui";
import { SortableList, SortableItem, useStoredOrder } from "@/components/tnq/Sortable";
import {
  FlaskConical,
  GraduationCap,
  Plus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Pencil,
  MoreVertical,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// ----- Types -----
type Project = { id: string; name: string; audience_type: string | null; status: string | null };
type Profile = { id: string; name: string | null; email: string | null };

type Playground = {
  id: string;
  project_id: string | null;
  name: string;
  version_number: string | null;
  is_live: boolean;
  live_since: string | null;
  access_url: string | null;
  content_url: string | null;
  dashboard_url: string | null;
  last_updated: string;
  last_updated_by: string | null;
  display_order: number;
};

type LPItem = {
  id: string;
  project_id: string;
  name: string;
  version: string;
  is_live: boolean;
  live_since: string | null;
  user_url: string | null;
  production_url: string | null;
  last_updated: string;
  last_updated_by: string | null;
  display_order: number;
};

type TabKey = "playgrounds" | "learning_paths";

// ----- Helpers -----
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const truncate = (s: string | null | undefined, n = 28) =>
  !s ? "" : s.length > n ? s.slice(0, n) + "…" : s;

// ----- Reusable cell components -----
function LinkCell({
  url,
  canEdit,
  onSave,
}: {
  url: string | null;
  canEdit: boolean;
  onSave: (next: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(url ?? "");
  useEffect(() => {
    setVal(url ?? "");
  }, [url]);
  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="https://…"
          className="h-7 text-xs min-w-[160px]"
        />
        <Button
          size="sm"
          onClick={async () => {
            await onSave(val.trim());
            setEditing(false);
          }}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setVal(url ?? "");
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {url ? (
        <>
          <span className="text-xs text-muted-foreground" title={url}>
            {truncate(url)}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </>
      ) : (
        <span className="text-xs text-muted-foreground">— Not set</span>
      )}
      {canEdit && (
        <button
          onClick={() => setEditing(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function InlineText({
  value,
  canEdit,
  onSave,
  className = "",
}: {
  value: string;
  canEdit: boolean;
  onSave: (next: string) => Promise<void>;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => {
    setVal(value);
  }, [value]);
  if (!canEdit) return <span className={className}>{value}</span>;
  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-7 text-xs" />
        <Button
          size="sm"
          onClick={async () => {
            await onSave(val.trim() || value);
            setEditing(false);
          }}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setVal(value);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <button onClick={() => setEditing(true)} className={`text-left hover:underline ${className}`}>
      {value}
    </button>
  );
}

function LivePill({
  isLive,
  since,
  canToggle,
  onToggle,
}: {
  isLive: boolean;
  since: string | null;
  canToggle: boolean;
  onToggle: () => void;
}) {
  const pill = (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
        isLive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-muted-foreground"}`}
      />
      {isLive ? "LIVE" : "NOT LIVE"}
    </span>
  );
  return (
    <div className="flex flex-col gap-0.5">
      {canToggle ? <button onClick={onToggle}>{pill}</button> : pill}
      {isLive && since && (
        <span className="text-[10px] text-muted-foreground">since {fmtDate(since)}</span>
      )}
    </div>
  );
}

function RowMenu({
  canDelete,
  onEditName,
  onDelete,
}: {
  canDelete: boolean;
  onEditName: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 text-muted-foreground hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-36 rounded-lg border border-border bg-card shadow-pop py-1">
            <button
              onClick={() => {
                setOpen(false);
                onEditName();
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent"
            >
              Edit Name
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-accent flex items-center gap-1.5"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ===================================================================
function WorkspacePage() {
  const { role, user, profile } = useAuth();
  const canWrite = role === "super_admin" || role === "tnq_team";
  const canDelete = role === "super_admin";
  const isContributor = role === "contributor";

  const [tab, setTab] = useState<TabKey>("playgrounds");
  const [projects, setProjects] = useState<Project[]>([]);
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [lpItems, setLpItems] = useState<LPItem[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [liveFilter, setLiveFilter] = useState<"all" | "live" | "not_live">("all");
  const [versionFilter, setVersionFilter] = useState("");

  // modals
  const [addPlayOpen, setAddPlayOpen] = useState(false);
  const [addLPOpen, setAddLPOpen] = useState(false);

  // assigned project ids for contributors
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[] | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: pjs }, { data: pgs }, { data: lps }, { data: pfs }] = await Promise.all([
      supabase.from("projects").select("id,name,audience_type,status").order("name"),
      supabase
        .from("playgrounds")
        .select(
          "id,project_id,name,version_number,is_live,live_since,access_url,content_url,dashboard_url,last_updated,last_updated_by,display_order",
        ),
      (supabase as any).from("learning_path_items").select("*"),
      supabase.from("profiles").select("id,name,email"),
    ]);
    setProjects((pjs as Project[]) ?? []);
    setPlaygrounds((pgs as Playground[]) ?? []);
    setLpItems((lps as LPItem[]) ?? []);
    setProfiles((pfs as Profile[]) ?? []);
    setAssignedProjectIds(null);
    setLoading(false);
  }
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user?.id, role]);

  const profileName = (id: string | null) => {
    if (!id) return "—";
    const p = profiles.find((x) => x.id === id);
    return p?.name || p?.email || "—";
  };

  async function logActivity(action: string, payload: any) {
    if (!user) return;
    await supabase.from("activity_log").insert({
      user_id: user.id,
      action,
      action_type: tab === "playgrounds" ? "playground_update" : "learning_path_update",
      target: payload?.id ?? null,
      field_changed: payload?.field ?? null,
      new_value: payload?.name ?? null,
    } as any);
  }

  // ----- Project groups based on current tab + filters -----
  const visibleProjects = useMemo(() => {
    let list = projects;
    if (isContributor && assignedProjectIds) {
      list = list.filter((p) => assignedProjectIds.includes(p.id));
    }
    if (projectFilter) list = list.filter((p) => p.id === projectFilter);
    return list;
  }, [projects, projectFilter, isContributor, assignedProjectIds]);

  const itemsForProject = (pid: string): (Playground | LPItem)[] => {
    const rows =
      tab === "playgrounds"
        ? playgrounds.filter((r) => r.project_id === pid)
        : lpItems.filter((r) => r.project_id === pid);
    return (rows as any[]).filter((r) => {
      if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (liveFilter === "live" && !r.is_live) return false;
      if (liveFilter === "not_live" && r.is_live) return false;
      if (versionFilter) {
        const v = (tab === "playgrounds" ? r.version_number : r.version) ?? "";
        if (!v.toLowerCase().includes(versionFilter.toLowerCase())) return false;
      }
      return true;
    });
  };

  // Group-level project ordering (per user, per tab) — localStorage
  const allProjectIds = visibleProjects.map((p) => p.id);
  const orderKey = `tnq:workspace:${tab}:${user?.id ?? "anon"}`;
  const [groupOrder, setGroupOrder] = useStoredOrder(orderKey, allProjectIds);
  const orderedProjects = useMemo(() => {
    const map = new Map(visibleProjects.map((p) => [p.id, p]));
    const out: Project[] = [];
    groupOrder.forEach((id) => {
      const p = map.get(id);
      if (p) out.push(p);
    });
    visibleProjects.forEach((p) => {
      if (!groupOrder.includes(p.id)) out.push(p);
    });
    return out;
  }, [visibleProjects, groupOrder]);

  // Drop empty groups when searching/filtering
  const groupsToRender = orderedProjects.filter((p) => {
    if (q || liveFilter !== "all" || versionFilter) return itemsForProject(p.id).length > 0;
    return true;
  });

  // ----- Update helpers -----
  async function updatePlay(id: string, patch: Partial<Playground>, fieldLabel: string) {
    const next = {
      ...patch,
      last_updated: new Date().toISOString(),
      last_updated_by: user?.id ?? null,
    };
    const { error } = await supabase.from("playgrounds").update(next).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    const item = playgrounds.find((x) => x.id === id);
    const proj = projects.find((p) => p.id === item?.project_id);
    await logActivity("playground.update", {
      id,
      field: fieldLabel,
      name: item?.name,
      project: proj?.name,
    });
    load();
  }

  async function updateLP(id: string, patch: Partial<LPItem>, fieldLabel: string) {
    const next = {
      ...patch,
      last_updated: new Date().toISOString(),
      last_updated_by: user?.id ?? null,
    };
    const { error } = await (supabase as any).from("learning_path_items").update(next).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    const item = lpItems.find((x) => x.id === id);
    const proj = projects.find((p) => p.id === item?.project_id);
    await logActivity("learning_path.update", {
      id,
      field: fieldLabel,
      name: item?.name,
      project: proj?.name,
    });
    load();
  }

  async function deletePlay(id: string) {
    if (!confirm("Delete this playground?")) return;
    const { error } = await supabase.from("playgrounds").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  }
  async function deleteLP(id: string) {
    if (!confirm("Delete this learning path?")) return;
    const { error } = await (supabase as any).from("learning_path_items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  }

  // ----- Add new version helpers -----
  async function addPlayVersion(src: Playground) {
    const nextV = bumpVersion(src.version_number ?? "V1");
    const { error } = await supabase.from("playgrounds").insert({
      project_id: src.project_id,
      name: src.name,
      version_number: nextV,
      is_live: false,
      created_by: user?.id ?? null,
      last_updated_by: user?.id ?? null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Added ${nextV}`);
    load();
  }
  async function addLPVersion(src: LPItem) {
    const nextV = bumpVersion(src.version ?? "V1");
    const { error } = await (supabase as any).from("learning_path_items").insert({
      project_id: src.project_id,
      name: src.name,
      version: nextV,
      is_live: false,
      created_by: user?.id ?? null,
      last_updated_by: user?.id ?? null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Added ${nextV}`);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Workspace"
        subtitle="Playgrounds and Learning Paths, grouped by project"
        right={
          canWrite ? (
            <Button
              onClick={() => (tab === "playgrounds" ? setAddPlayOpen(true) : setAddLPOpen(true))}
            >
              <Plus className="h-4 w-4" />{" "}
              {tab === "playgrounds" ? "Add Playground" : "Add Learning Path"}
            </Button>
          ) : undefined
        }
      />

      {/* Search + Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or project…"
              className="pl-8"
            />
          </div>
          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-auto"
          >
            <option value="">All projects</option>
            {visibleProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select
            value={liveFilter}
            onChange={(e) => setLiveFilter(e.target.value as any)}
            className="w-auto"
          >
            <option value="all">All statuses</option>
            <option value="live">Live</option>
            <option value="not_live">Not Live</option>
          </Select>
          <Input
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            placeholder="Version…"
            className="w-28"
          />
        </div>
      </Card>

      {/* Tabs — desktop */}
      <div className="hidden sm:flex gap-1 border-b border-border mb-4">
        <TabBtn
          active={tab === "playgrounds"}
          onClick={() => setTab("playgrounds")}
          icon={<FlaskConical className="h-4 w-4" />}
          label="Playgrounds"
        />
        <TabBtn
          active={tab === "learning_paths"}
          onClick={() => setTab("learning_paths")}
          icon={<GraduationCap className="h-4 w-4" />}
          label="Learning Paths"
        />
      </div>
      {/* Tabs — mobile dropdown */}
      <div className="sm:hidden mb-4">
        <Select value={tab} onChange={(e) => setTab(e.target.value as TabKey)}>
          <option value="playgrounds">🧪 Playgrounds</option>
          <option value="learning_paths">🎓 Learning Paths</option>
        </Select>
      </div>

      {loading ? (
        <Card>
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : groupsToRender.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              tab === "playgrounds" ? (
                <FlaskConical className="h-10 w-10" />
              ) : (
                <GraduationCap className="h-10 w-10" />
              )
            }
            title={
              tab === "playgrounds" ? "No playgrounds added yet." : "No learning paths added yet."
            }
            subtitle={
              canWrite
                ? `Add your first ${tab === "playgrounds" ? "playground" : "learning path"} to get started.`
                : "Nothing here yet."
            }
          />
          {canWrite && (
            <div className="text-center mt-2">
              <Button
                onClick={() => (tab === "playgrounds" ? setAddPlayOpen(true) : setAddLPOpen(true))}
              >
                <Plus className="h-4 w-4" />{" "}
                {tab === "playgrounds" ? "Add Playground" : "Add Learning Path"}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <SortableList
          ids={groupsToRender.map((p) => p.id)}
          onReorder={(next) => {
            const rest = groupOrder.filter((id) => !next.includes(id));
            setGroupOrder([...next, ...rest]);
          }}
        >
          <div className="space-y-3">
            {groupsToRender.map((p) => (
              <SortableItem key={p.id} id={p.id}>
                {(handle) => (
                  <ProjectGroup
                    handle={canWrite ? handle : null}
                    project={p}
                    tab={tab}
                    items={itemsForProject(p.id)}
                    canWrite={canWrite}
                    canDelete={canDelete}
                    profileName={profileName}
                    onUpdatePlay={updatePlay}
                    onUpdateLP={updateLP}
                    onDeletePlay={deletePlay}
                    onDeleteLP={deleteLP}
                    onAddPlayVersion={addPlayVersion}
                    onAddLPVersion={addLPVersion}
                  />
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <AddPlaygroundModal
        open={addPlayOpen}
        onClose={() => setAddPlayOpen(false)}
        projects={projects}
        userId={user?.id ?? null}
        onSaved={() => {
          setAddPlayOpen(false);
          load();
        }}
      />
      <AddLPModal
        open={addLPOpen}
        onClose={() => setAddLPOpen(false)}
        projects={projects}
        userId={user?.id ?? null}
        onSaved={() => {
          setAddLPOpen(false);
          load();
        }}
      />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function bumpVersion(v: string): string {
  const m = v.match(/^V?(\d+)(?:\.(\d+))?$/i);
  if (!m) return v + ".1";
  const major = parseInt(m[1], 10);
  return `V${major + 1}`;
}

// ----- Project group -----
function ProjectGroup({
  handle,
  project,
  tab,
  items,
  canWrite,
  canDelete,
  profileName,
  onUpdatePlay,
  onUpdateLP,
  onDeletePlay,
  onDeleteLP,
  onAddPlayVersion,
  onAddLPVersion,
}: {
  handle: ReactNode | null;
  project: Project;
  tab: TabKey;
  items: (Playground | LPItem)[];
  canWrite: boolean;
  canDelete: boolean;
  profileName: (id: string | null) => string;
  onUpdatePlay: (id: string, patch: Partial<Playground>, field: string) => Promise<void>;
  onUpdateLP: (id: string, patch: Partial<LPItem>, field: string) => Promise<void>;
  onDeletePlay: (id: string) => Promise<void>;
  onDeleteLP: (id: string) => Promise<void>;
  onAddPlayVersion: (src: Playground) => Promise<void>;
  onAddLPVersion: (src: LPItem) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
        {handle}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-muted-foreground hover:text-foreground"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <Link
          to="/projects/$id"
          params={{ id: project.id }}
          className="flex items-center gap-2 font-semibold text-foreground hover:underline"
        >
          {project.name}
        </Link>
        {project.audience_type && <Badge tone="info">{project.audience_type}</Badge>}
        {project.status && (
          <Badge tone={project.status === "active" ? "success" : "default"}>{project.status}</Badge>
        )}
        {!open && (
          <span className="text-xs text-muted-foreground ml-auto">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {open &&
        (items.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No items in this project yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === "playgrounds" ? (
              <PlaygroundTable
                items={items as Playground[]}
                canWrite={canWrite}
                canDelete={canDelete}
                profileName={profileName}
                onUpdate={onUpdatePlay}
                onDelete={onDeletePlay}
                onAddVersion={onAddPlayVersion}
              />
            ) : (
              <LPTable
                items={items as LPItem[]}
                canWrite={canWrite}
                canDelete={canDelete}
                profileName={profileName}
                onUpdate={onUpdateLP}
                onDelete={onDeleteLP}
                onAddVersion={onAddLPVersion}
              />
            )}
          </div>
        ))}
    </Card>
  );
}

// ----- Playground table -----
function PlaygroundTable({
  items,
  canWrite,
  canDelete,
  profileName,
  onUpdate,
  onDelete,
  onAddVersion,
}: {
  items: Playground[];
  canWrite: boolean;
  canDelete: boolean;
  profileName: (id: string | null) => string;
  onUpdate: (id: string, patch: Partial<Playground>, field: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddVersion: (src: Playground) => Promise<void>;
}) {
  return (
    <table className="w-full min-w-[1000px] text-sm">
      <thead className="bg-muted/20 text-[10px] font-mono font-bold tracking-[0.14em] uppercase text-muted-foreground">
        <tr>
          <th className="text-left px-4 py-2">Name</th>
          <th className="text-left px-4 py-2">Live</th>
          <th className="text-left px-4 py-2">Version</th>
          <th className="text-left px-4 py-2">Playground Link</th>
          <th className="text-left px-4 py-2">Content Link</th>
          <th className="text-left px-4 py-2">Dashboard Link</th>
          <th className="text-left px-4 py-2">Last Updated</th>
          {canWrite && <th className="text-left px-4 py-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id} className="border-t border-border align-top">
            <td className="px-4 py-3">
              <InlineText
                value={r.name}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { name: v }, "name")}
                className="font-medium text-foreground"
              />
            </td>
            <td className="px-4 py-3">
              <LivePill
                isLive={r.is_live}
                since={r.live_since}
                canToggle={canWrite}
                onToggle={() =>
                  onUpdate(
                    r.id,
                    {
                      is_live: !r.is_live,
                      live_since: !r.is_live ? new Date().toISOString() : r.live_since,
                    },
                    "is_live",
                  )
                }
              />
            </td>
            <td className="px-4 py-3">
              <InlineText
                value={r.version_number ?? "V1"}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { version_number: v }, "version")}
                className="font-mono text-xs"
              />
            </td>
            <td className="px-4 py-3">
              <LinkCell
                url={r.access_url}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { access_url: v || null } as any, "playground_url")}
              />
            </td>
            <td className="px-4 py-3">
              <LinkCell
                url={r.content_url}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { content_url: v || null }, "content_url")}
              />
            </td>
            <td className="px-4 py-3">
              <LinkCell
                url={r.dashboard_url}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { dashboard_url: v || null }, "dashboard_url")}
              />
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
              {fmtDate(r.last_updated)} by {profileName(r.last_updated_by)}
            </td>
            {canWrite && (
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onAddVersion(r)}>
                    <Plus className="h-3 w-3" /> Version
                  </Button>
                  <RowMenu
                    canDelete={canDelete}
                    onEditName={() => {
                      const v = prompt("New name", r.name);
                      if (v && v.trim()) onUpdate(r.id, { name: v.trim() }, "name");
                    }}
                    onDelete={() => onDelete(r.id)}
                  />
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ----- LP table -----
function LPTable({
  items,
  canWrite,
  canDelete,
  profileName,
  onUpdate,
  onDelete,
  onAddVersion,
}: {
  items: LPItem[];
  canWrite: boolean;
  canDelete: boolean;
  profileName: (id: string | null) => string;
  onUpdate: (id: string, patch: Partial<LPItem>, field: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddVersion: (src: LPItem) => Promise<void>;
}) {
  return (
    <table className="w-full min-w-[900px] text-sm">
      <thead className="bg-muted/20 text-[10px] font-mono font-bold tracking-[0.14em] uppercase text-muted-foreground">
        <tr>
          <th className="text-left px-4 py-2">Name</th>
          <th className="text-left px-4 py-2">Live</th>
          <th className="text-left px-4 py-2">Version</th>
          <th className="text-left px-4 py-2">User Link</th>
          <th className="text-left px-4 py-2">Production Link</th>
          <th className="text-left px-4 py-2">Last Updated</th>
          {canWrite && <th className="text-left px-4 py-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id} className="border-t border-border align-top">
            <td className="px-4 py-3">
              <InlineText
                value={r.name}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { name: v }, "name")}
                className="font-medium text-foreground"
              />
            </td>
            <td className="px-4 py-3">
              <LivePill
                isLive={r.is_live}
                since={r.live_since}
                canToggle={canWrite}
                onToggle={() =>
                  onUpdate(
                    r.id,
                    {
                      is_live: !r.is_live,
                      live_since: !r.is_live ? new Date().toISOString() : r.live_since,
                    },
                    "is_live",
                  )
                }
              />
            </td>
            <td className="px-4 py-3">
              <InlineText
                value={r.version ?? "V1"}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { version: v }, "version")}
                className="font-mono text-xs"
              />
            </td>
            <td className="px-4 py-3">
              <LinkCell
                url={r.user_url}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { user_url: v || null }, "user_url")}
              />
            </td>
            <td className="px-4 py-3">
              <LinkCell
                url={r.production_url}
                canEdit={canWrite}
                onSave={(v) => onUpdate(r.id, { production_url: v || null }, "production_url")}
              />
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
              {fmtDate(r.last_updated)} by {profileName(r.last_updated_by)}
            </td>
            {canWrite && (
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onAddVersion(r)}>
                    <Plus className="h-3 w-3" /> Version
                  </Button>
                  <RowMenu
                    canDelete={canDelete}
                    onEditName={() => {
                      const v = prompt("New name", r.name);
                      if (v && v.trim()) onUpdate(r.id, { name: v.trim() }, "name");
                    }}
                    onDelete={() => onDelete(r.id)}
                  />
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ----- Add modals -----
function AddPlaygroundModal({
  open,
  onClose,
  projects,
  userId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  userId: string | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    project_id: "",
    name: "",
    version: "V1",
    is_live: false,
    access_url: "",
    content_url: "",
    dashboard_url: "",
  });
  useEffect(() => {
    if (open)
      setForm({
        project_id: "",
        name: "",
        version: "V1",
        is_live: false,
        access_url: "",
        content_url: "",
        dashboard_url: "",
      });
  }, [open]);
  async function save() {
    if (!form.project_id) {
      toast.error("Project required");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    const { error } = await supabase.from("playgrounds").insert({
      project_id: form.project_id,
      name: form.name.trim(),
      version_number: form.version || "V1",
      is_live: form.is_live,
      live_since: form.is_live ? new Date().toISOString() : null,
      access_url: form.access_url || null,
      content_url: form.content_url || null,
      dashboard_url: form.dashboard_url || null,
      created_by: userId,
      last_updated_by: userId,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Playground added");
    onSaved();
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Playground"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Create</Button>
        </>
      }
    >
      <Field label="Project">
        <Select
          value={form.project_id}
          onChange={(e) => setForm({ ...form, project_id: e.target.value })}
        >
          <option value="">— Select project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Playground Name">
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Version">
        <Input
          value={form.version}
          onChange={(e) => setForm({ ...form, version: e.target.value })}
        />
      </Field>
      <Field label="Live Status">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_live}
            onChange={(e) => setForm({ ...form, is_live: e.target.checked })}
          />
          Mark as Live
        </label>
      </Field>
      <Field label="Playground Link">
        <Input
          value={form.access_url}
          onChange={(e) => setForm({ ...form, access_url: e.target.value })}
          placeholder="https://…"
        />
      </Field>
      <Field label="Content Link">
        <Input
          value={form.content_url}
          onChange={(e) => setForm({ ...form, content_url: e.target.value })}
          placeholder="https://…"
        />
      </Field>
      <Field label="Dashboard Link">
        <Input
          value={form.dashboard_url}
          onChange={(e) => setForm({ ...form, dashboard_url: e.target.value })}
          placeholder="https://…"
        />
      </Field>
    </Modal>
  );
}

function AddLPModal({
  open,
  onClose,
  projects,
  userId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  userId: string | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    project_id: "",
    name: "",
    version: "V1",
    is_live: false,
    user_url: "",
    production_url: "",
  });
  useEffect(() => {
    if (open)
      setForm({
        project_id: "",
        name: "",
        version: "V1",
        is_live: false,
        user_url: "",
        production_url: "",
      });
  }, [open]);
  async function save() {
    if (!form.project_id) {
      toast.error("Project required");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    const { error } = await (supabase as any).from("learning_path_items").insert({
      project_id: form.project_id,
      name: form.name.trim(),
      version: form.version || "V1",
      is_live: form.is_live,
      live_since: form.is_live ? new Date().toISOString() : null,
      user_url: form.user_url || null,
      production_url: form.production_url || null,
      created_by: userId,
      last_updated_by: userId,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Learning path added");
    onSaved();
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Learning Path"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Create</Button>
        </>
      }
    >
      <Field label="Project">
        <Select
          value={form.project_id}
          onChange={(e) => setForm({ ...form, project_id: e.target.value })}
        >
          <option value="">— Select project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Learning Path Name">
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Version">
        <Input
          value={form.version}
          onChange={(e) => setForm({ ...form, version: e.target.value })}
        />
      </Field>
      <Field label="Live Status">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_live}
            onChange={(e) => setForm({ ...form, is_live: e.target.checked })}
          />
          Mark as Live
        </label>
      </Field>
      <Field label="User Link">
        <Input
          value={form.user_url}
          onChange={(e) => setForm({ ...form, user_url: e.target.value })}
          placeholder="https://…"
        />
      </Field>
      <Field label="Production Link">
        <Input
          value={form.production_url}
          onChange={(e) => setForm({ ...form, production_url: e.target.value })}
          placeholder="https://…"
        />
      </Field>
    </Modal>
  );
}

export const Route = createFileRoute("/_app/learning")({ component: WorkspacePage });
