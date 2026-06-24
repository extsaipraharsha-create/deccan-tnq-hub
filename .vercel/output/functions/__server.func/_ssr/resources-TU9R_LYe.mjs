import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
import { a as Field, c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BR57aP_a.mjs";
import { t as Plus } from "./plus-CGaL89cu.mjs";
import { t as Trash2 } from "./trash-2-D9F9yPwj.mjs";
import { n as toast } from "./dist-tXmvIPPR.mjs";
import { t as ExternalLink } from "./external-link-CGPQ5RRN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-TU9R_LYe.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LibraryBig = createLucideIcon("library-big", [
	["rect", {
		width: "8",
		height: "18",
		x: "3",
		y: "3",
		rx: "1",
		key: "oynpb5"
	}],
	["path", {
		d: "M7 3v18",
		key: "bbkbws"
	}],
	["path", {
		d: "M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z",
		key: "1qboyk"
	}]
]);
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
