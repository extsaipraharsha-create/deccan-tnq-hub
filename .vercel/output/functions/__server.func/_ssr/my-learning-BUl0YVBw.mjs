import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CYFV1vtm.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { K as Check, j as GraduationCap } from "../_libs/lucide-react.mjs";
import { c as PageHeader, i as EmptyState, n as Button, r as Card, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-learning-BUl0YVBw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MyLearningPage() {
	const { user } = useAuth();
	const [path, setPath] = (0, import_react.useState)(null);
	const [modules, setModules] = (0, import_react.useState)([]);
	const [progress, setProgress] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	async function load() {
		if (!user) return;
		setLoading(true);
		const { data: c } = await supabase.from("contributors").select("learning_path_id").eq("id", user.id).maybeSingle();
		const pid = c?.learning_path_id;
		if (!pid) {
			setLoading(false);
			return;
		}
		const [{ data: p }, { data: m }, { data: pr }] = await Promise.all([
			supabase.from("learning_paths").select("id,name").eq("id", pid).maybeSingle(),
			supabase.from("learning_path_modules").select("*").eq("learning_path_id", pid).order("order_index"),
			supabase.from("contributor_progress").select("module_id,status").eq("contributor_id", user.id)
		]);
		setPath(p);
		setModules(m ?? []);
		setProgress(pr ?? []);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [user]);
	async function complete(moduleId) {
		if (!user) return;
		await supabase.from("contributor_progress").upsert({
			contributor_id: user.id,
			module_id: moduleId,
			status: "complete",
			completed_at: (/* @__PURE__ */ new Date()).toISOString()
		}, { onConflict: "contributor_id,module_id" });
		load();
	}
	const isDone = (mid) => progress.find((p) => p.module_id === mid)?.status === "complete";
	const done = modules.filter((m) => isDone(m.id)).length;
	const pct = modules.length ? Math.round(done / modules.length * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "My learning",
		subtitle: path?.name ?? "No learning path assigned"
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	}) }) : !path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-10 w-10" }),
		title: "No path yet",
		subtitle: "Your SME hasn't assigned a learning path."
	}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: "Progress"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground",
				children: [
					done,
					"/",
					modules.length,
					" · ",
					pct,
					"%"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 h-2 bg-muted rounded-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full bg-primary transition-all",
				style: { width: `${pct}%` }
			})
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: modules.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-medium text-foreground",
					children: [
						m.order_index + 1,
						". ",
						m.title
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						m.type,
						" ",
						m.estimated_minutes && `· ${m.estimated_minutes} min`
					]
				})]
			}), isDone(m.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: "success",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }), " Done"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: () => complete(m.id),
				children: "Mark complete"
			})]
		}) }, m.id))
	})] })] });
}
//#endregion
export { MyLearningPage as component };
