import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CYFV1vtm.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as UsersRound } from "../_libs/lucide-react.mjs";
import { c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contributors-Csv_9ipO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContributorsPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [smes, setSmes] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	async function load() {
		setLoading(true);
		const [{ data: c }, { data: p }, { data: ur }] = await Promise.all([
			supabase.from("contributors").select("*"),
			supabase.from("profiles").select("id,name,email"),
			supabase.from("user_roles").select("user_id,role").in("role", ["tnq_team", "super_admin"])
		]);
		const pmap = new Map((p ?? []).map((x) => [x.id, x]));
		setProfiles(p ?? []);
		setSmes((ur ?? []).map((x) => pmap.get(x.user_id)).filter(Boolean));
		setRows((c ?? []).map((r) => ({
			...r,
			name: pmap.get(r.id)?.name,
			email: pmap.get(r.id)?.email
		})));
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function assignSme(id, sme_id) {
		await supabase.from("contributors").update({ sme_id: sme_id || null }).eq("id", id);
		setRows(rows.map((r) => r.id === id ? {
			...r,
			sme_id: sme_id || null
		} : r));
	}
	async function setStage(id, stage) {
		const status = stage >= 5 ? "complete" : stage > 1 ? "in_progress" : "not_started";
		await supabase.from("contributors").update({
			onboarding_stage: stage,
			onboarding_status: status
		}).eq("id", id);
		setRows(rows.map((r) => r.id === id ? {
			...r,
			onboarding_stage: stage,
			onboarding_status: status
		} : r));
	}
	const filtered = (0, import_react.useMemo)(() => {
		const t = q.toLowerCase();
		return rows.filter((r) => !t || (r.name ?? "").toLowerCase().includes(t) || (r.email ?? "").toLowerCase().includes(t));
	}, [rows, q]);
	const smeName = (id) => profiles.find((p) => p.id === id)?.name ?? "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Contributors",
		subtitle: `${rows.length} total`,
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
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "h-10 w-10" }),
		title: "No contributors yet",
		subtitle: "Approve users with the contributor role from Admin → Users."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto -m-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-muted/40 text-xs uppercase text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Contributor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "SME"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Stage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left p-3",
						children: "Last active"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: r.name ?? "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: r.email
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: r.sme_id ?? "",
							onChange: (e) => assignSme(r.id, e.target.value),
							className: "w-48",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unassigned"
							}), smes.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s.id,
								children: s.name ?? s.email
							}, s.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mt-1",
							children: smeName(r.sme_id)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setStage(r.id, Math.max(1, r.onboarding_stage - 1)),
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 text-center font-medium",
									children: r.onboarding_stage
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setStage(r.id, Math.min(5, r.onboarding_stage + 1)),
									children: "+"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: r.onboarding_status === "complete" ? "success" : r.onboarding_status === "in_progress" ? "info" : "default",
							children: r.onboarding_status
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "p-3 text-xs text-muted-foreground",
						children: r.last_active_at ? new Date(r.last_active_at).toLocaleDateString() : "—"
					})
				]
			}, r.id)) })]
		})
	}) })] });
}
//#endregion
export { ContributorsPage as component };
