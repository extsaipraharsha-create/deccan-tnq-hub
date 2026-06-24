import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as Link } from "./link-BK4eFRk-.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { t as Users } from "./users-CGso1lf2.mjs";
import { i as EmptyState, o as Input, r as Card, t as Badge } from "./ui-BR57aP_a.mjs";
import { t as Search } from "./search-Ctzh3K4X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-BfF_9AT6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_TONE = {
	active: "success",
	paused: "warn",
	completed: "default"
};
var STATUS_LABEL = {
	active: "Live",
	paused: "Planning",
	completed: "Inactive"
};
function TeamPage() {
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		(async () => {
			const [{ data: p }, { data: r }, { data: pr }] = await Promise.all([
				supabase.from("profiles").select("id,name,email,photo_url"),
				supabase.from("user_roles").select("user_id,role,status"),
				supabase.from("projects").select("*")
			]);
			setProfiles(p ?? []);
			setRoles(r ?? []);
			setProjects(pr ?? []);
			setLoading(false);
		})();
	}, []);
	const smes = (0, import_react.useMemo)(() => {
		const smeIds = new Set(roles.filter((r) => r.role === "super_admin" || r.role === "tnq_team").map((r) => r.user_id));
		return profiles.filter((p) => smeIds.has(p.id));
	}, [profiles, roles]);
	const rows = (0, import_react.useMemo)(() => {
		return smes.map((sme) => {
			let projs = projects.filter((p) => p.sme_owner_id === sme.id || (p.current_owner_ids ?? []).includes(sme.id));
			if (filter !== "all") projs = projs.filter((p) => p.status === filter);
			return {
				sme,
				projects: projs
			};
		}).filter((row) => {
			if (filter !== "all" && row.projects.length === 0) return false;
			if (!q.trim()) return true;
			const t = q.toLowerCase();
			return (row.sme.name ?? "").toLowerCase().includes(t) || (row.sme.email ?? "").toLowerCase().includes(t) || row.projects.some((p) => p.name.toLowerCase().includes(t));
		});
	}, [
		smes,
		projects,
		filter,
		q
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft",
			children: [
				{
					key: "all",
					label: "ALL SMES"
				},
				{
					key: "active",
					label: "LIVE"
				},
				{
					key: "paused",
					label: "PLANNING"
				},
				{
					key: "completed",
					label: "INACTIVE"
				}
			].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setFilter(t.key),
				className: `font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors ${filter === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
				children: t.label
			}, t.key))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search SME or project…",
				className: "w-72 pl-8"
			})]
		})]
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-8 text-center text-sm text-muted-foreground",
		children: "Loading…"
	}) }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-10 w-10" }),
		title: "No SMEs to show"
	}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "!p-0 overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted/40 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3",
								children: "SME"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Projects"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Audience"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Version"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Status"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: rows.map(({ sme, projects: projs }) => {
						const init = (sme.name ?? sme.email ?? "?").slice(0, 1).toUpperCase();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-accent/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [sme.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: sme.photo_url,
											alt: "",
											className: "h-8 w-8 rounded-full"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground",
											children: init
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium text-foreground",
											children: sme.name ?? "—"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: sme.email
										})] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: projs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "— None"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1.5",
										children: projs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/projects/$id",
											params: { id: p.id },
											className: "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/60 hover:bg-foreground hover:text-background text-xs font-medium transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.emoji_icon ?? "📁" }), p.name]
										}, p.id))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1",
										children: projs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "info",
											children: p.audience_type ?? "N/A"
										}, p.id))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1 font-mono text-xs text-foreground",
										children: projs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "px-1.5 py-0.5 bg-muted/60 rounded",
											children: p.version ?? "—"
										}, p.id))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1",
										children: projs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: STATUS_TONE[p.status],
											children: STATUS_LABEL[p.status]
										}, p.id))
									})
								})
							]
						}, sme.id);
					})
				})]
			})
		})
	})] });
}
//#endregion
export { TeamPage as component };
