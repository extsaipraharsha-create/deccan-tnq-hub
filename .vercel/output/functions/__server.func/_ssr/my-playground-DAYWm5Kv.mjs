import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { F as FileText, I as ExternalLink, J as Beaker } from "../_libs/lucide-react.mjs";
import { c as PageHeader, i as EmptyState, r as Card, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-playground-DAYWm5Kv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MyPlaygroundPage() {
	const { user } = useAuth();
	const [pg, setPg] = (0, import_react.useState)(null);
	const [docs, setDocs] = (0, import_react.useState)([]);
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		(async () => {
			const { data: c } = await supabase.from("contributors").select("playground_id").eq("id", user.id).maybeSingle();
			const pid = c?.playground_id;
			if (!pid) {
				setLoading(false);
				return;
			}
			const [{ data: p }, { data: d }, { data: i }] = await Promise.all([
				supabase.from("playgrounds").select("id,name,status,progress_percent,description,access_url").eq("id", pid).maybeSingle(),
				supabase.from("playground_documents").select("id,name,type,url,uploaded_at").eq("playground_id", pid).order("uploaded_at", { ascending: false }),
				supabase.from("playground_content_items").select("id,component_name,status,notes").eq("playground_id", pid).order("last_updated", { ascending: false })
			]);
			setPg(p);
			setDocs(d ?? []);
			setItems(i ?? []);
			setLoading(false);
		})();
	}, [user]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "My playground",
		subtitle: pg?.name ?? "No playground assigned"
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	}) }) : !pg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Beaker, { className: "h-10 w-10" }),
		title: "No playground yet",
		subtitle: "Your SME will provision one."
	}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [pg.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: pg.description
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: pg.status
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [pg.progress_percent, "% complete"]
					})]
				})]
			}), pg.access_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: pg.access_url,
				target: "_blank",
				rel: "noreferrer",
				className: "text-sm text-primary inline-flex items-center gap-1 hover:underline",
				children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 h-2 bg-muted rounded-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full bg-primary",
				style: { width: `${pg.progress_percent}%` }
			})
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 md:grid-cols-2 gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "font-semibold mb-3 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), " Documents"]
		}), docs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-8 w-8" }),
			title: "No documents"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between border-b border-border pb-2 last:border-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: d.url,
					target: "_blank",
					rel: "noreferrer",
					className: "text-sm text-primary hover:underline inline-flex items-center gap-1 truncate",
					children: [
						d.name,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: d.type ?? "file"
				})]
			}, d.id))
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-semibold mb-3",
			children: "Components"
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No components yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between border-b border-border pb-2 last:border-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: i.component_name
				}), i.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: i.notes
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: i.status === "completed" ? "success" : i.status === "in_progress" ? "info" : i.status === "needs_revision" ? "warn" : "default",
					children: i.status
				})]
			}, i.id))
		})] })]
	})] })] });
}
//#endregion
export { MyPlaygroundPage as component };
