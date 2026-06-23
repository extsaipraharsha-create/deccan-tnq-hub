import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { E as LibraryBig, I as ExternalLink, o as Trash2, v as Plus } from "../_libs/lucide-react.mjs";
import { a as Field, c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BU3fdnmk.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-u0ZsM342.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"external_link",
	"project_doc",
	"team_sheet",
	"template"
];
function ResourcesPage() {
	const { role, user } = useAuth();
	const canWrite = role === "super_admin" || role === "tnq_team";
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({});
	async function load() {
		setLoading(true);
		const { data } = await supabase.from("resources").select("*").order("date", { ascending: false });
		setItems(data ?? []);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	function startCreate() {
		setForm({
			name: "",
			category: "external_link",
			url: "",
			file_type: "",
			tagsInput: "",
			visible_to: [
				"super_admin",
				"tnq_team",
				"contributor"
			]
		});
		setOpen(true);
	}
	async function save() {
		if (!form.name?.trim() || !form.url?.trim()) {
			toast.error("Name and URL are required");
			return;
		}
		const tags = (form.tagsInput ?? "").split(",").map((t) => t.trim()).filter(Boolean);
		const { error } = await supabase.from("resources").insert({
			name: form.name.trim(),
			category: form.category ?? "external_link",
			url: form.url.trim(),
			file_type: form.file_type || null,
			tags,
			visible_to: form.visible_to ?? [
				"super_admin",
				"tnq_team",
				"contributor"
			],
			uploaded_by: user?.id ?? null
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Resource added");
		setOpen(false);
		load();
	}
	async function remove(r) {
		if (!confirm(`Delete "${r.name}"?`)) return;
		const { error } = await supabase.from("resources").delete().eq("id", r.id);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Deleted");
		load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Resources",
			subtitle: `${items.length} items · guidelines, videos, docs, links`,
			right: canWrite ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: startCreate,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add resource"]
			}) : void 0
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryBig, { className: "h-10 w-10" }),
			title: "No resources yet",
			subtitle: canWrite ? "Add the first resource for your team." : "Nothing here yet."
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-foreground",
						children: r.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: r.category
					})]
				}),
				r.tags && r.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-1",
					children: r.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded",
						children: t
					}, t))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: r.url,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }), " Open"]
					}), canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => remove(r),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				})
			] }, r.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open,
			onClose: () => setOpen(false),
			title: "Add resource",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Add"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.name ?? "",
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Category",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: form.category ?? "external_link",
						onChange: (e) => setForm({
							...form,
							category: e.target.value
						}),
						children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c,
							children: c
						}, c))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "URL",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.url ?? "",
						onChange: (e) => setForm({
							...form,
							url: e.target.value
						}),
						placeholder: "https://…"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "File type (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.file_type ?? "",
						onChange: (e) => setForm({
							...form,
							file_type: e.target.value
						}),
						placeholder: "pdf, mp4, doc…"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Tags (comma separated)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.tagsInput ?? "",
						onChange: (e) => setForm({
							...form,
							tagsInput: e.target.value
						}),
						placeholder: "onboarding, qa, style-guide"
					})
				})
			]
		})
	] });
}
//#endregion
export { ResourcesPage as component };
