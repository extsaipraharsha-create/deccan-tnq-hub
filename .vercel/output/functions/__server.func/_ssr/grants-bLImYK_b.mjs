import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CYFV1vtm.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { O as KeyRound, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { a as Field, c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grants-bLImYK_b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GrantsPage() {
	const { user } = useAuth();
	const [grants, setGrants] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		user_id: "",
		resource_type: "project",
		resource_id: "",
		permission: "view_only"
	});
	async function load() {
		setLoading(true);
		const [{ data: g }, { data: p }] = await Promise.all([supabase.from("resource_grants").select("*").order("granted_at", { ascending: false }), supabase.from("profiles").select("id,name,email").order("name")]);
		setGrants(g ?? []);
		setProfiles(p ?? []);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function add() {
		if (!form.user_id || !form.resource_id) return;
		await supabase.from("resource_grants").insert({
			...form,
			permission: form.permission,
			granted_by: user?.id ?? null
		});
		setOpen(false);
		setForm({
			user_id: "",
			resource_type: "project",
			resource_id: "",
			permission: "view_only"
		});
		load();
	}
	async function revoke(id) {
		if (!confirm("Revoke this grant?")) return;
		await supabase.from("resource_grants").delete().eq("id", id);
		load();
	}
	const who = (id) => profiles.find((p) => p.id === id)?.name ?? profiles.find((p) => p.id === id)?.email ?? id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Admin · Resource grants",
			subtitle: "Explicit access to projects, playgrounds, or learning paths.",
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Grant access"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		}) : grants.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-10 w-10" }),
			title: "No grants yet"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border -m-5",
			children: grants.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: who(g.user_id)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground font-mono truncate",
							children: [
								g.resource_type,
								" · ",
								g.resource_id
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: g.permission
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => revoke(g.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			}, g.id))
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open,
			onClose: () => setOpen(false),
			title: "Grant access",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: add,
				children: "Grant"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "User",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.user_id,
						onChange: (e) => setForm({
							...form,
							user_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select user…"
						}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name ?? p.email
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Resource type",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.resource_type,
						onChange: (e) => setForm({
							...form,
							resource_type: e.target.value
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "project",
								children: "Project"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "playground",
								children: "Playground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "learning_path",
								children: "Learning Path"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "resource",
								children: "Resource"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Resource ID",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.resource_id,
						onChange: (e) => setForm({
							...form,
							resource_id: e.target.value
						}),
						placeholder: "uuid…"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Permission",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.permission,
						onChange: (e) => setForm({
							...form,
							permission: e.target.value
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "view_only",
								children: "View only"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "can_edit",
								children: "Can edit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "can_upload",
								children: "Can upload"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "full_access",
								children: "Full access"
							})
						]
					})
				})
			]
		})
	] });
}
//#endregion
export { GrantsPage as component };
