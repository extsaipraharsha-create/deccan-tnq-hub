import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { PageHeader, Card, EmptyState, Input, Select, Badge, Button } from "@/components/tnq/ui";
import { Shield, Search } from "lucide-react";
import { toast } from "sonner";
import type { AppRole, UserStatus } from "@/lib/tnq/types";

type Row = {
  user_id: string;
  role: AppRole;
  status: UserStatus;
  profile: { name: string | null; email: string | null; photo_url: string | null } | null;
};

const ROLES: AppRole[] = ["super_admin", "tnq_team", "contributor", "pending"];
const STATUSES: UserStatus[] = ["active", "pending", "suspended"];

function UsersPage() {
  const { role } = useAuth();
  const isAdmin = role === "super_admin";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  async function load() {
    setLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id,role,status")
      .order("created_at", { ascending: false });
    const ids = (roles ?? []).map((r) => r.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id,name,email,photo_url").in("id", ids)
      : { data: [] as any[] };
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    setRows((roles ?? []).map((r: any) => ({ ...r, profile: pmap.get(r.user_id) ?? null })));
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchQ =
          !q ||
          (r.profile?.name ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (r.profile?.email ?? "").toLowerCase().includes(q.toLowerCase());
        const matchR = filterRole === "all" || r.role === filterRole;
        return matchQ && matchR;
      }),
    [rows, q, filterRole],
  );

  async function updateRow(user_id: string, patch: Partial<Pick<Row, "role" | "status">>) {
    const { error } = await supabase.from("user_roles").update(patch).eq("user_id", user_id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Updated");
    setRows((rs) => rs.map((r) => (r.user_id === user_id ? { ...r, ...patch } : r)));
  }

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Admin · Users" />
        <Card>
          <EmptyState
            icon={<Shield className="h-10 w-10" />}
            title="Admins only"
            subtitle="You need super_admin to manage users."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin · Users"
        subtitle={`${rows.length} total · approve pending users, change roles, suspend access`}
      />
      <Card className="!p-0">
        <div className="p-4 flex flex-wrap gap-2 border-b border-border">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-8"
            />
          </div>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-44"
          >
            <option value="all">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Shield className="h-10 w-10" />} title="No users match" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.user_id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.profile?.photo_url ? (
                          <img src={r.profile.photo_url} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {(r.profile?.name ?? "?")[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {r.profile?.name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.profile?.email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={r.role}
                        onChange={(e) => updateRow(r.user_id, { role: e.target.value as AppRole })}
                        className="w-36"
                      >
                        {ROLES.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          r.status === "active"
                            ? "success"
                            : r.status === "pending"
                              ? "warn"
                              : "danger"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {r.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateRow(r.user_id, {
                              status: "active",
                              role: r.role === "pending" ? "contributor" : r.role,
                            })
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {r.status !== "suspended" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateRow(r.user_id, { status: "suspended" })}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateRow(r.user_id, { status: "active" })}
                        >
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_app/admin/users")({ component: UsersPage });
