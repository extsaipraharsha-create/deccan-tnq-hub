import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as Shield } from "./shield-hpH4Svj8.mjs";
import { c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, t as Badge } from "./ui-BR57aP_a.mjs";
import { n as toast } from "./dist-tXmvIPPR.mjs";
import { t as Search } from "./search-Ctzh3K4X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-Cf4ig34q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"super_admin",
	"tnq_team",
	"contributor",
	"pending"
];
function UsersPage() {
	const { role } = useAuth();
	const isAdmin = role === "super_admin";
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [filterRole, setFilterRole] = (0, import_react.useState)("all");
	async function load() {
		setLoading(true);
		const { data: roles } = await supabase.from("user_roles").select("user_id,role,status").order("created_at", { ascending: false });
		const ids = (roles ?? []).map((r) => r.user_id);
		const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,name,email,photo_url").in("id", ids) : { data: [] };
		const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
		setRows((roles ?? []).map((r) => ({
			...r,
			profile: pmap.get(r.user_id) ?? null
		})));
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		const matchQ = !q || (r.profile?.name ?? "").toLowerCase().includes(q.toLowerCase()) || (r.profile?.email ?? "").toLowerCase().includes(q.toLowerCase());
		const matchR = filterRole === "all" || r.role === filterRole;
		return matchQ && matchR;
	}), [
		rows,
		q,
		filterRole
	]);
	async function updateRow(user_id, patch) {
		const { error } = await supabase.from("user_roles").update(patch).eq("user_id", user_id);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Updated");
		setRows((rs) => rs.map((r) => r.user_id === user_id ? {
			...r,
			...patch
		} : r));
	}
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, { title: "Admin · Users" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-10 w-10" }),
		title: "Admins only",
		subtitle: "You need super_admin to manage users."
	}) })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Admin · Users",
		subtitle: `${rows.length} total · approve pending users, change roles, suspend access`
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "!p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 flex flex-wrap gap-2 border-b border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search by name or email…",
						className: "pl-8"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filterRole,
					onChange: (e) => setFilterRole(e.target.value),
					className: "w-44",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All roles"
					}), ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: r,
						children: r
					}, r))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: load,
					children: "Refresh"
				})
			]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-10 text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-10 w-10" }),
			title: "No users match"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted/30 text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 font-medium",
								children: "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 font-medium",
								children: "Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 font-medium",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2 font-medium text-right",
								children: "Actions"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [r.profile?.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: r.profile.photo_url,
									alt: "",
									className: "h-8 w-8 rounded-full"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium",
									children: (r.profile?.name ?? "?")[0]?.toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-foreground",
									children: r.profile?.name ?? "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: r.profile?.email ?? "—"
								})] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: r.role,
								onChange: (e) => updateRow(r.user_id, { role: e.target.value }),
								className: "w-36",
								children: ROLES.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: x,
									children: x
								}, x))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: r.status === "active" ? "success" : r.status === "pending" ? "warn" : "danger",
								children: r.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-right space-x-2",
							children: [r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => updateRow(r.user_id, {
									status: "active",
									role: r.role === "pending" ? "contributor" : r.role
								}),
								children: "Approve"
							}), r.status !== "suspended" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "danger",
								onClick: () => updateRow(r.user_id, { status: "suspended" }),
								children: "Suspend"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => updateRow(r.user_id, { status: "active" }),
								children: "Reactivate"
							})]
						})
					]
				}, r.user_id)) })]
			})
		})]
	})] });
}
//#endregion
export { UsersPage as component };
