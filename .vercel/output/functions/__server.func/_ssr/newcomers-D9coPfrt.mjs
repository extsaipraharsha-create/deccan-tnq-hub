import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as GraduationCap } from "./graduation-cap-DXjx-gRt.mjs";
import { a as Field, c as PageHeader, f as Textarea, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BR57aP_a.mjs";
import { t as Plus } from "./plus-CGaL89cu.mjs";
import { n as toast } from "./dist-tXmvIPPR.mjs";
import { t as ExternalLink } from "./external-link-CGPQ5RRN.mjs";
import { t as Pencil } from "./pencil-hrizh8d5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/newcomers-D9coPfrt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fmtDate(iso) {
	if (!iso) return "—";
	return new Date(iso).toLocaleString(void 0, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function NewcomersPage() {
	const { user, role } = useAuth();
	const canWrite = role === "super_admin" || role === "tnq_team";
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [resources, setResources] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({});
	async function load() {
		const [{ data: p }, { data: pr }, { data: r }] = await Promise.all([
			supabase.from("projects").select("id,name,emoji_icon,audience_type").order("name"),
			supabase.from("profiles").select("id,name,email,photo_url"),
			supabase.from("newcomer_resources").select("*")
		]);
		setProjects(p ?? []);
		setProfiles(pr ?? []);
		setResources(r ?? []);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const rows = (0, import_react.useMemo)(() => {
		return projects.filter((p) => tab === "all" || p.id === tab).map((p) => ({
			project: p,
			res: resources.find((r) => r.project_id === p.id) ?? null
		}));
	}, [
		projects,
		resources,
		tab
	]);
	function startEdit(projectId) {
		const existing = resources.find((r) => r.project_id === projectId);
		setForm(existing ? { ...existing } : { project_id: projectId });
		setOpen(true);
	}
	async function save() {
		if (!form.project_id) return toast.error("Select a project");
		const payload = {
			project_id: form.project_id,
			poc_user_id: form.poc_user_id || null,
			doc_label: form.doc_label || null,
			doc_url: form.doc_url || null,
			video_label: form.video_label || null,
			video_url: form.video_url || null,
			notes: form.notes || null,
			last_updated_by: user?.id ?? null
		};
		const tbl = supabase.from("newcomer_resources");
		const existing = resources.find((r) => r.project_id === form.project_id);
		const res = existing ? await tbl.update(payload).eq("id", existing.id) : await tbl.insert(payload);
		if (res.error) return toast.error(res.error.message);
		await supabase.from("activity_log").insert({
			user_id: user?.id ?? "",
			action: existing ? "newcomer_updated" : "newcomer_added",
			action_type: "newcomer_resources",
			target: form.project_id
		});
		toast.success("Saved");
		setOpen(false);
		setForm({});
		load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Newcomers",
			subtitle: "Onboarding resources for each project in one place.",
			right: canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => {
					setForm({});
					setOpen(true);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add / Edit info"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit max-w-full overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab("all"),
				className: `font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${tab === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
				children: "ALL PROJECTS"
			}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setTab(p.id),
				className: `font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${tab === p.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
				children: [
					p.emoji_icon ?? "📁",
					" ",
					p.name.toUpperCase()
				]
			}, p.id))]
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-10 w-10" }),
			title: "No projects yet"
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "!p-0 overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/40 border-b border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-5 py-3",
									children: "Project"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "POC"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Documentation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Video"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Notes"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Last Updated"
								}),
								canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-3 w-20" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: rows.map(({ project: p, res: r }) => {
							const poc = profiles.find((x) => x.id === r?.poc_user_id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-accent/30 align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-lg",
												children: p.emoji_icon ?? "📁"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground",
												children: p.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: "info",
												children: p.audience_type ?? "N/A"
											})] })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: poc ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [poc.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: poc.photo_url,
												alt: "",
												className: "h-7 w-7 rounded-full"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold",
												children: (poc.name ?? poc.email ?? "?")[0]?.toUpperCase()
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-foreground font-medium",
												children: poc.name ?? poc.email
											})]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "— Not added"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: r?.doc_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: r.doc_url,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "inline-flex items-center gap-1 text-primary hover:underline",
											children: [
												r.doc_label ?? "Doc",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "— Not added"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: r?.video_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: r.video_url,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "inline-flex items-center gap-1 text-primary hover:underline",
											children: [
												r.video_label ?? "Video",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "— Not added"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 max-w-[260px]",
										children: r?.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-foreground text-xs",
											children: r.notes
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "— Not added"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap",
										children: fmtDate(r?.last_updated)
									}),
									canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => startEdit(p.id),
											className: "p-1.5 text-muted-foreground hover:text-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
										})
									})
								]
							}, p.id);
						})
					})]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open,
			onClose: () => setOpen(false),
			title: "Newcomer info",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Save"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Project",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.project_id ?? "",
						onChange: (e) => setForm({
							...form,
							project_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select project…"
						}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Point of contact",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.poc_user_id ?? "",
						onChange: (e) => setForm({
							...form,
							poc_user_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— Unassigned —"
						}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name ?? p.email
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Doc label",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.doc_label ?? "",
							onChange: (e) => setForm({
								...form,
								doc_label: e.target.value
							}),
							placeholder: "e.g. Onboarding Doc"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Doc URL",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.doc_url ?? "",
							onChange: (e) => setForm({
								...form,
								doc_url: e.target.value
							}),
							placeholder: "https://…"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Video label",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.video_label ?? "",
							onChange: (e) => setForm({
								...form,
								video_label: e.target.value
							}),
							placeholder: "e.g. Walkthrough"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Video URL",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.video_url ?? "",
							onChange: (e) => setForm({
								...form,
								video_url: e.target.value
							}),
							placeholder: "https://…"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Additional notes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: form.notes ?? "",
						onChange: (e) => setForm({
							...form,
							notes: e.target.value
						})
					})
				})
			]
		})
	] });
}
//#endregion
export { NewcomersPage as component };
