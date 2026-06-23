import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { M as FolderKanban } from "../_libs/lucide-react.mjs";
import { c as PageHeader, i as EmptyState, r as Card, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-projects-CRnIQlvB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MyProjectsPage() {
	const { user } = useAuth();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		(async () => {
			const { data: c } = await supabase.from("contributors").select("projects").eq("id", user.id).maybeSingle();
			const ids = c?.projects ?? [];
			if (ids.length === 0) {
				setLoading(false);
				return;
			}
			const { data: p } = await supabase.from("projects").select("id,name,description,status").in("id", ids);
			setRows(p ?? []);
			setLoading(false);
		})();
	}, [user]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "My projects",
		subtitle: "Projects you are assigned to"
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	}) }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-10 w-10" }),
		title: "No projects assigned",
		subtitle: "Ask your SME to add you to a project."
	}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
		children: rows.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold text-foreground",
				children: p.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: p.status === "active" ? "success" : p.status === "paused" ? "warn" : "default",
				children: p.status
			})]
		}), p.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: p.description
		})] }, p.id))
	})] });
}
//#endregion
export { MyProjectsPage as component };
