import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { t as Settings } from "./settings-5CGmtTn0.mjs";
import { a as Field, c as PageHeader, i as EmptyState, n as Button, o as Input, r as Card } from "./ui-BR57aP_a.mjs";
import { t as Plus } from "./plus-CGaL89cu.mjs";
import { t as Trash2 } from "./trash-2-D9F9yPwj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BPovhzvs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [k, setK] = (0, import_react.useState)("");
	const [v, setV] = (0, import_react.useState)("");
	async function load() {
		setLoading(true);
		const { data } = await supabase.from("settings").select("*").order("key");
		setRows(data ?? []);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function add() {
		if (!k.trim()) return;
		await supabase.from("settings").upsert({
			key: k.trim(),
			value: v
		}, { onConflict: "key" });
		setK("");
		setV("");
		load();
	}
	async function save(r) {
		await supabase.from("settings").update({ value: r.value }).eq("id", r.id);
	}
	async function remove(id) {
		if (!confirm("Delete this setting?")) return;
		await supabase.from("settings").delete().eq("id", id);
		load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Admin · System settings",
			subtitle: "Key/value configuration. Changes are saved per row."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Key",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: k,
							onChange: (e) => setK(e.target.value),
							placeholder: "e.g. maintenance_mode"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Value",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: v,
							onChange: (e) => setV(e.target.value),
							placeholder: "e.g. true"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: add,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground p-4",
			children: "Loading…"
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-10 w-10" }),
			title: "No settings yet",
			subtitle: "Add your first key/value above."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_auto] gap-2 items-center p-2 rounded-lg border border-border bg-background",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-sm",
						children: r.key
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: r.value ?? "",
						onChange: (e) => setRows(rows.map((x) => x.id === r.id ? {
							...x,
							value: e.target.value
						} : x))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => save(r),
						children: "Save"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => remove(r.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				]
			}, r.id))
		}) })
	] });
}
//#endregion
export { SettingsPage as component };
