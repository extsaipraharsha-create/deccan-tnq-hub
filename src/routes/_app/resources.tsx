import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { LibraryBig, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Resource = {
  id: string;
  name: string;
  category: "external_link" | "project_doc" | "team_sheet" | "template";
  tags: string[] | null;
  url: string;
  file_type: string | null;
  visible_to: string[] | null;
  date: string;
};

const CATEGORIES: Resource["category"][] = [
  "external_link",
  "project_doc",
  "team_sheet",
  "template",
];

function ResourcesPage() {
  const { role, user } = useAuth();
  const canWrite = role === "super_admin" || role === "tnq_team";
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Resource> & { tagsInput?: string }>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("date", { ascending: false });
    setItems((data as Resource[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setForm({
      name: "",
      category: "external_link",
      url: "",
      file_type: "",
      tagsInput: "",
      visible_to: ["super_admin", "tnq_team", "contributor"],
    });
    setOpen(true);
  }
  async function save() {
    if (!form.name?.trim() || !form.url?.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    const tags = (form.tagsInput ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const { error } = await supabase.from("resources").insert({
      name: form.name.trim(),
      category: form.category ?? "external_link",
      url: form.url.trim(),
      file_type: form.file_type || null,
      tags,
      visible_to: form.visible_to ?? ["super_admin", "tnq_team", "contributor"],
      uploaded_by: user?.id ?? null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Resource added");
    setOpen(false);
    load();
  }
  async function remove(r: Resource) {
    if (!confirm(`Delete "${r.name}"?`)) return;
    const { error } = await supabase.from("resources").delete().eq("id", r.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    load();
  }

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle={`${items.length} items · guidelines, videos, docs, links`}
        right={
          canWrite ? (
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" /> Add resource
            </Button>
          ) : undefined
        }
      />
      {loading ? (
        <Card>
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<LibraryBig className="h-10 w-10" />}
            title="No resources yet"
            subtitle={canWrite ? "Add the first resource for your team." : "Nothing here yet."}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{r.name}</h3>
                <Badge tone="info">{r.category}</Badge>
              </div>
              {r.tags && r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Open
                </a>
                {canWrite && (
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add resource"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Add</Button>
          </>
        }
      >
        <Field label="Name">
          <Input
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <Select
            value={form.category ?? "external_link"}
            onChange={(e) => setForm({ ...form, category: e.target.value as Resource["category"] })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="URL">
          <Input
            value={form.url ?? ""}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://…"
          />
        </Field>
        <Field label="File type (optional)">
          <Input
            value={form.file_type ?? ""}
            onChange={(e) => setForm({ ...form, file_type: e.target.value })}
            placeholder="pdf, mp4, doc…"
          />
        </Field>
        <Field label="Tags (comma separated)">
          <Input
            value={form.tagsInput ?? ""}
            onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
            placeholder="onboarding, qa, style-guide"
          />
        </Field>
      </Modal>
    </div>
  );
}

export const Route = createFileRoute("/_app/resources")({ component: ResourcesPage });
