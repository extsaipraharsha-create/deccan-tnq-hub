import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { t as ScrollText } from "./scroll-text-C83h-5Hq.mjs";
import { c as PageHeader, i as EmptyState, o as Input, r as Card, t as Badge } from "./ui-BR57aP_a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-DtMbSeyo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TONE = {
	created: "success",
	updated: "info",
	deleted: "danger",
	login: "default",
	role_changed: "warn",
	grant_added: "success",
	grant_revoked: "warn"
};
function AuditPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data } = await supabase.from("activity_log").select("*").order("timestamp", { ascending: false }).limit(500);
			setRows(data ?? []);
			setLoading(false);
		})();
	}, []);
	const filtered = (0, import_react.useMemo)(() => {
		const t = q.toLowerCase();
		return rows.filter((r) => !t || r.action.toLowerCase().includes(t) || (r.target ?? "").toLowerCase().includes(t) || r.action_type.includes(t));
	}, [rows, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Admin · Audit log",
		subtitle: "Most recent 500 events.",
		right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			placeholder: "Search…",
			value: q,
			onChange: (e) => setQ(e.target.value),
			className: "w-64"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "h-10 w-10" }),
		title: "No activity yet"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y divide-border -m-5",
		children: filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: TONE[r.action_type] ?? "default",
					children: r.action_type
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium text-foreground",
							children: r.action
						}),
						r.target && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground truncate",
							children: r.target
						}),
						r.details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-1 text-xs text-muted-foreground bg-muted/40 rounded p-2 overflow-x-auto",
							children: JSON.stringify(r.details, null, 2)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground whitespace-nowrap",
					children: new Date(r.timestamp).toLocaleString()
				})
			]
		}, r.id))
	}) })] });
}
//#endregion
export { AuditPage as component };
