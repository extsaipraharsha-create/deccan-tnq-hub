import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as Link } from "./link-BK4eFRk-.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
import { a as Field, c as PageHeader, f as Textarea, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BR57aP_a.mjs";
import { t as Plus } from "./plus-CGaL89cu.mjs";
import { n as toast } from "./dist-tXmvIPPR.mjs";
import { n as Target, t as CircleAlert } from "./target-DCjL86yQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quality-8rVJpLTd.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Power = createLucideIcon("power", [["path", {
	d: "M12 2v10",
	key: "mnfbl"
}], ["path", {
	d: "M18.4 6.6a9 9 0 1 1-12.77.04",
	key: "obofu9"
}]]);
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
function scoreTone(s) {
	if (s == null) return "default";
	if (s >= 80) return "success";
	if (s >= 60) return "warn";
	return "danger";
}
function QualityPage() {
	const { user, role } = useAuth();
	const canWrite = role === "super_admin" || role === "tnq_team";
	const [scores, setScores] = (0, import_react.useState)([]);
	const [issues, setIssues] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	const [openScore, setOpenScore] = (0, import_react.useState)(false);
	const [openIssue, setOpenIssue] = (0, import_react.useState)(false);
	const [s, setS] = (0, import_react.useState)({
		contributor_id: "",
		project_id: "",
		score: "85",
		notes: ""
	});
	const [i, setI] = (0, import_react.useState)({
		contributor_id: "",
		project_id: "",
		issue: ""
	});
	async function load() {
		const [{ data: sc }, { data: is }, { data: pr }, { data: pj }] = await Promise.all([
			supabase.from("quality_scores").select("*").order("review_date", { ascending: false }),
			supabase.from("quality_issues").select("*").order("date", { ascending: false }),
			supabase.from("profiles").select("id,name,email,photo_url"),
			supabase.from("projects").select("id,name,status,audience_type,version,tasking_live,current_owner_ids,emoji_icon").order("name")
		]);
		setScores(sc ?? []);
		setIssues(is ?? []);
		setProfiles(pr ?? []);
		setProjects(pj ?? []);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const projectStats = (0, import_react.useMemo)(() => {
		return projects.map((p) => {
			const ps = scores.filter((x) => x.project_id === p.id);
			const avg = ps.length ? Math.round(ps.reduce((a, b) => a + Number(b.score), 0) / ps.length * 10) / 10 : null;
			const open = issues.filter((x) => x.project_id === p.id && x.status === "open").length;
			const last = ps[0]?.review_date ?? null;
			return {
				...p,
				avg,
				open,
				lastReview: last
			};
		});
	}, [
		projects,
		scores,
		issues
	]);
	async function addScore() {
		if (!s.contributor_id) return;
		await supabase.from("quality_scores").insert({
			contributor_id: s.contributor_id,
			project_id: s.project_id || activeTab !== "all" ? s.project_id || activeTab : null,
			score: Number(s.score),
			notes: s.notes || null,
			reviewed_by: user?.id ?? null
		});
		setOpenScore(false);
		setS({
			contributor_id: "",
			project_id: "",
			score: "85",
			notes: ""
		});
		load();
	}
	async function addIssue() {
		if (!i.issue.trim()) return;
		await supabase.from("quality_issues").insert({
			contributor_id: i.contributor_id || null,
			project_id: i.project_id || (activeTab !== "all" ? activeTab : null),
			issue: i.issue,
			sme_id: user?.id ?? null
		});
		setOpenIssue(false);
		setI({
			contributor_id: "",
			project_id: "",
			issue: ""
		});
		load();
	}
	async function toggleIssue(id, st) {
		await supabase.from("quality_issues").update({ status: st === "open" ? "resolved" : "open" }).eq("id", id);
		load();
	}
	async function toggleTasking(p) {
		if (!canWrite) return;
		const next = !p.tasking_live;
		const { error } = await supabase.from("projects").update({
			tasking_live: next,
			updated_by: user?.id ?? null
		}).eq("id", p.id);
		if (error) return toast.error(error.message);
		await supabase.from("activity_log").insert({
			user_id: user?.id ?? "",
			action: "tasking_toggled",
			action_type: "project_update",
			target: p.id,
			field_changed: "tasking_live",
			old_value: String(p.tasking_live),
			new_value: String(next)
		});
		toast.success(`Tasking ${next ? "live" : "paused"} for ${p.name}`);
		load();
	}
	const name = (id) => profiles.find((p) => p.id === id)?.name ?? "—";
	const ownerNames = (ids) => !ids?.length ? "—" : ids.map((id) => profiles.find((p) => p.id === id)?.name ?? "?").join(", ");
	const activeProject = activeTab !== "all" ? projectStats.find((p) => p.id === activeTab) : null;
	const tabScores = activeProject ? scores.filter((x) => x.project_id === activeProject.id) : scores;
	const tabIssues = activeProject ? issues.filter((x) => x.project_id === activeProject.id) : issues;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Quality tracker",
			subtitle: "Per-project quality, scores and issues.",
			right: canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => setOpenIssue(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }), " Raise issue"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setOpenScore(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Log score"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit max-w-full overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setActiveTab("all"),
				className: `font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${activeTab === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
				children: "ALL PROJECTS"
			}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setActiveTab(p.id),
				className: `font-mono text-[11px] font-bold tracking-[0.16em] px-4 py-2 rounded-full whitespace-nowrap ${activeTab === p.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
				children: [
					p.emoji_icon ?? "📁",
					" ",
					p.name.toUpperCase()
				]
			}, p.id))]
		}),
		activeTab === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "!p-0 overflow-hidden",
			children: projectStats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No projects yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
									children: "Audience"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Version"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Tasking Live"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Current Owners"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Avg Score"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Open Issues"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Last Review"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: projectStats.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-accent/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setActiveTab(p.id),
										className: "flex items-center gap-2 font-semibold text-foreground hover:text-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-lg",
												children: p.emoji_icon ?? "📁"
											}),
											" ",
											p.name
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "info",
										children: p.audience_type ?? "N/A"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono text-xs",
									children: p.version ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: STATUS_TONE[p.status],
										children: STATUS_LABEL[p.status]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => toggleTasking(p),
										disabled: !canWrite,
										className: `font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded inline-flex items-center gap-1 ${p.tasking_live ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"} ${canWrite ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "h-3 w-3" }),
											" ",
											p.tasking_live ? "YES" : "NO"
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-xs text-muted-foreground max-w-[180px] truncate",
									children: ownerNames(p.current_owner_ids)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: scoreTone(p.avg),
										children: p.avg != null ? p.avg.toFixed(1) : "—"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono",
									children: p.open
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-xs text-muted-foreground",
									children: p.lastReview ? new Date(p.lastReview).toLocaleDateString() : "—"
								})
							]
						}, p.id))
					})]
				})
			})
		}) : activeProject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-8 gap-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-3xl",
							children: activeProject.emoji_icon ?? "📁"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xl font-bold text-foreground",
							children: activeProject.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/projects/$id",
							params: { id: activeProject.id },
							className: "text-xs text-primary hover:underline",
							children: "Open project →"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
						children: "Audience"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: activeProject.audience_type ?? "N/A"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
						children: "Version"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono font-bold",
						children: activeProject.version ?? "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: STATUS_TONE[activeProject.status],
						children: STATUS_LABEL[activeProject.status]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
						children: "Tasking Live"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => toggleTasking(activeProject),
						disabled: !canWrite,
						className: `font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded inline-flex items-center gap-1 ${activeProject.tasking_live ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "h-3 w-3" }),
							" ",
							activeProject.tasking_live ? "YES" : "NO"
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
						children: "Avg Score"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: scoreTone(activeProject.avg),
						children: activeProject.avg != null ? activeProject.avg.toFixed(1) : "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[200px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
							children: "Current Owners"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: ownerNames(activeProject.current_owner_ids)
						})]
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-semibold mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-4 w-4" }), " Contributor scores"]
				}), tabScores.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No scores logged yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 max-h-[480px] overflow-y-auto",
					children: tabScores.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-sm",
									children: name(x.contributor_id)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: new Date(x.review_date).toLocaleDateString()
								}),
								x.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs mt-1",
									children: x.notes
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: scoreTone(Number(x.score)),
							children: Number(x.score).toFixed(1)
						})]
					}, x.id))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-semibold mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }), " Issues"]
				}), tabIssues.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No issues raised" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 max-h-[480px] overflow-y-auto",
					children: tabIssues.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm",
								children: x.issue
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									name(x.contributor_id),
									" · ",
									new Date(x.date).toLocaleDateString()
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => toggleIssue(x.id, x.status),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: x.status === "open" ? "warn" : "success",
								children: x.status
							})
						})]
					}, x.id))
				})] })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open: openScore,
			onClose: () => setOpenScore(false),
			title: "Log quality score",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpenScore(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: addScore,
				children: "Save"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Contributor",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: s.contributor_id,
						onChange: (e) => setS({
							...s,
							contributor_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select…"
						}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name ?? p.email
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Project",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: s.project_id || (activeTab !== "all" ? activeTab : ""),
						onChange: (e) => setS({
							...s,
							project_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Score (0–100)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: "0",
						max: "100",
						step: "0.1",
						value: s.score,
						onChange: (e) => setS({
							...s,
							score: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: s.notes,
						onChange: (e) => setS({
							...s,
							notes: e.target.value
						})
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open: openIssue,
			onClose: () => setOpenIssue(false),
			title: "Raise issue",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpenIssue(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: addIssue,
				children: "Save"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Issue",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: i.issue,
						onChange: (e) => setI({
							...i,
							issue: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Contributor (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: i.contributor_id,
						onChange: (e) => setI({
							...i,
							contributor_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name ?? p.email
						}, p.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Project",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: i.project_id || (activeTab !== "all" ? activeTab : ""),
						onChange: (e) => setI({
							...i,
							project_id: e.target.value
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})
				})
			]
		})
	] });
}
//#endregion
export { QualityPage as component };
