import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { I as ExternalLink, N as FolderInput, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { a as Field, c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sources-BLMgPeDP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SourcesPage() {
	const { user } = useAuth();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		contributor_id: "",
		project_id: "",
		source_type: "doc",
		url: ""
	});
	async function load() {
		setLoading(true);
		const [{ data: s }, { data: p }, { data: pr }] = await Promise.all([
			supabase.from("admin_sources").select("*").order("created_at", { ascending: false }),
			supabase.from("projects").select("id,name").order("name"),
			supabase.from("profiles").select("id,name,email").order("name")
		]);
		setRows(s ?? []);
		setProjects(p ?? []);
		setProfiles(pr ?? []);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function add() {
		if (!form.url.trim()) return;
		await supabase.from("admin_sources").insert({
			contributor_id: form.contributor_id || null,
			project_id: form.project_id || null,
			source_type: form.source_type,
			url: form.url.trim(),
			uploaded_by: user?.id ?? null
		});
		setOpen(false);
		setForm({
			contributor_id: "",
			project_id: "",
			source_type: "doc",
			url: ""
		});
		load();
	}
	async function remove(id) {
		if (!confirm("Delete this source?")) return;
		await supabase.from("admin_sources").delete().eq("id", id);
		load();
	}
	const name = (id) => profiles.find((p) => p.id === id)?.name ?? profiles.find((p) => p.id === id)?.email ?? "—";
	const proj = (id) => projects.find((p) => p.id === id)?.name ?? "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Admin · Sources",
			subtitle: "External reference links per project or contributor.",
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add source"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderInput, { className: "h-10 w-10" }),
			title: "No sources yet",
			subtitle: "Add references contributors can use."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border -m-5",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: r.source_type ?? "link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: r.url ?? "#",
							target: "_blank",
							rel: "noreferrer",
							className: "text-sm font-medium text-primary hover:underline truncate inline-flex items-center gap-1",
							children: [
								r.url,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								proj(r.project_id),
								" · ",
								name(r.contributor_id)
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => remove(r.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			}, r.id))
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open,
			onClose: () => setOpen(false),
			title: "Add source",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: add,
				children: "Add"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "URL",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.url,
						onChange: (e) => setForm({
							...form,
							url: e.target.value
						}),
						placeholder: "https://…"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Type",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.source_type,
						onChange: (e) => setForm({
							...form,
							source_type: e.target.value
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "doc",
								children: "Document"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "sheet",
								children: "Sheet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "video",
								children: "Video"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "link",
								children: "Link"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Project (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.project_id,
						onChange: (e) => setForm({
							...form,
							project_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Contributor (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.contributor_id,
						onChange: (e) => setForm({
							...form,
							contributor_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name ?? p.email
						}, p.id))]
					})
				})
			]
		})
	] });
}
//#endregion
export { SourcesPage as component };
