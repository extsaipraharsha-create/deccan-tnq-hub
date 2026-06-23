import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { i as pickDailyDose, r as greeting } from "./constants-Cjp7GOIu.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as ClipboardCheck, M as FolderKanban, i as Trophy, n as Users, q as BookOpen } from "../_libs/lucide-react.mjs";
import { d as StatusPill, i as EmptyState, r as Card, t as Badge, u as StatCard } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-LPRVxKC7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { role, profile } = useAuth();
	const firstName = (profile?.name ?? profile?.email ?? "there").split(/[ @]/)[0];
	const dose = (0, import_react.useMemo)(() => pickDailyDose(profile?.id), [profile?.id]);
	const heroTitle = role === "super_admin" ? "Platform control center." : role === "tnq_team" ? "Your team at a glance." : "Your learning journey.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-mono text-primary italic text-lg",
				children: [
					greeting(),
					", ",
					firstName,
					"."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-5xl sm:text-6xl font-bold tracking-tight text-foreground",
				children: heroTitle
			})] }),
			role === "contributor" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContributorDash, { dose }),
			role === "tnq_team" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmeDash, { dose }),
			role === "super_admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDash, { dose }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualityByProject, { role })
		]
	});
}
function QualityByProject({ role }) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [scoresByProj, setScoresByProj] = (0, import_react.useState)({});
	const [mineByProj, setMineByProj] = (0, import_react.useState)({});
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: ps } = await supabase.from("projects").select("id,name,status,audience_type,version,tasking_live,sme_owner_id,emoji_icon,current_owner_ids");
			const { data: sc } = await supabase.from("quality_scores").select("project_id,contributor_id,score");
			const { data: profs } = await supabase.from("profiles").select("id,name,email");
			const byProj = {};
			const byMine = {};
			(sc ?? []).forEach((s) => {
				if (!s.project_id) return;
				(byProj[s.project_id] ||= []).push(Number(s.score));
				if (s.contributor_id === user?.id) (byMine[s.project_id] ||= []).push(Number(s.score));
			});
			setProjects(ps ?? []);
			setScoresByProj(byProj);
			setMineByProj(byMine);
			setProfiles(profs ?? []);
		})();
	}, [user?.id]);
	const visible = (0, import_react.useMemo)(() => {
		if (role === "tnq_team") return projects.filter((p) => p.sme_owner_id === user?.id || (p.current_owner_ids ?? []).includes(user?.id ?? ""));
		if (role === "contributor") return projects.filter((p) => (mineByProj[p.id]?.length ?? 0) > 0);
		return projects;
	}, [
		projects,
		role,
		user?.id,
		mineByProj
	]);
	function rowTone(p, avg) {
		if (!p.tasking_live) return "bg-muted/40";
		if (avg == null) return "";
		if (avg >= 80) return "bg-emerald-50";
		if (avg >= 60) return "bg-amber-50";
		return "bg-rose-50";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase",
			children: "Quality by project"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/quality",
			className: "font-mono text-[11px] tracking-wider text-primary uppercase hover:underline",
			children: "Open tracker →"
		})]
	}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No projects to show" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground border-b border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: "Project"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: "Audience"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: "Ver"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: "Tasking"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: "Owner"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-2",
						children: role === "contributor" ? "My Score" : "Avg Score"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "divide-y divide-border",
				children: visible.map((p) => {
					const arr = role === "contributor" ? mineByProj[p.id] : scoresByProj[p.id];
					const avg = arr?.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;
					const owner = profiles.find((x) => x.id === p.sme_owner_id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						onClick: () => navigate({
							to: "/projects/$id",
							params: { id: p.id },
							search: { tab: "quality" }
						}),
						className: `cursor-pointer hover:opacity-90 ${rowTone(p, avg)}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2.5 font-medium text-foreground",
								children: [
									p.emoji_icon ?? "📁",
									" ",
									p.name
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "info",
									children: p.audience_type ?? "N/A"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 font-mono text-xs",
								children: p.version ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: p.status === "active" ? "success" : p.status === "paused" ? "warn" : "default",
									children: p.status
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${p.tasking_live ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`,
									children: p.tasking_live ? "YES" : "NO"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 text-xs text-muted-foreground",
								children: owner?.name ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 font-mono font-bold",
								children: avg != null ? avg.toFixed(1) : "—"
							})
						]
					}, p.id);
				})
			})]
		})
	})] });
}
function ContributorDash({ dose }) {
	const { user } = useAuth();
	const [stats, setStats] = (0, import_react.useState)({
		done: 0,
		total: 0,
		lastScore: 0,
		projectCount: 0
	});
	(0, import_react.useEffect)(() => {
		if (!user) return;
		(async () => {
			const [{ data: prog }, { data: scores }, { data: contrib }] = await Promise.all([
				supabase.from("contributor_progress").select("status").eq("contributor_id", user.id),
				supabase.from("quality_scores").select("score").eq("contributor_id", user.id).order("review_date", { ascending: false }).limit(1),
				supabase.from("contributors").select("projects").eq("id", user.id).maybeSingle()
			]);
			setStats({
				done: prog?.filter((p) => p.status === "complete").length ?? 0,
				total: prog?.length ?? 0,
				lastScore: scores?.[0]?.score ?? 0,
				projectCount: contrib?.projects?.length ?? 0
			});
		})();
	}, [user]);
	const pct = stats.total > 0 ? Math.round(stats.done / stats.total * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { items: [
			{
				label: "Backend connected",
				tone: "ok"
			},
			{
				label: `${pct}% onboarding complete`,
				tone: pct >= 50 ? "ok" : "warn"
			},
			{
				label: `${stats.projectCount} active project${stats.projectCount === 1 ? "" : "s"}`,
				tone: "ok"
			}
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Modules done",
					value: stats.done,
					suffix: `of ${stats.total}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Onboarding %",
					value: pct,
					suffix: "percent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Last score",
					value: stats.lastScore || "0.0",
					suffix: "/100"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Projects",
					value: stats.projectCount,
					suffix: "assigned"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase",
						children: "My learning path"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/my-learning",
						className: "font-mono text-[11px] tracking-wider text-primary uppercase hover:underline",
						children: "Continue →"
					})]
				}), stats.total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No learning path yet",
					subtitle: "Your SME hasn't assigned a Learning Path yet.",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-8 w-8" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground",
					children: "Your structured learning journey awaits."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3",
				children: "Daily dose"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm italic text-foreground/80 leading-relaxed",
				children: [
					"\"",
					dose,
					"\""
				]
			})] })]
		})
	] });
}
function SmeDash({ dose }) {
	const { user } = useAuth();
	const [stats, setStats] = (0, import_react.useState)({
		projects: 0,
		contributors: 0,
		openIssues: 0,
		avgScore: 0
	});
	(0, import_react.useEffect)(() => {
		if (!user) return;
		(async () => {
			const [{ count: projCount }, { data: contribs }] = await Promise.all([supabase.from("projects").select("id", {
				count: "exact",
				head: true
			}).eq("sme_owner_id", user.id), supabase.from("contributors").select("id").eq("sme_id", user.id)]);
			const ids = (contribs ?? []).map((c) => c.id);
			let openIssues = 0, avg = 0;
			if (ids.length) {
				const { count: ic } = await supabase.from("quality_issues").select("id", {
					count: "exact",
					head: true
				}).in("contributor_id", ids).eq("status", "open");
				openIssues = ic ?? 0;
				const { data: sc } = await supabase.from("quality_scores").select("score").in("contributor_id", ids);
				if (sc?.length) avg = Math.round(sc.reduce((a, b) => a + Number(b.score), 0) / sc.length * 10) / 10;
			}
			setStats({
				projects: projCount ?? 0,
				contributors: ids.length,
				openIssues,
				avgScore: avg
			});
		})();
	}, [user]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { items: [
			{
				label: "Backend connected",
				tone: "ok"
			},
			{
				label: `${stats.contributors} contributors`,
				tone: "ok"
			},
			{
				label: `${stats.openIssues} open issues`,
				tone: stats.openIssues > 0 ? "warn" : "ok"
			}
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "My projects",
					value: stats.projects,
					suffix: "active"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Contributors",
					value: stats.contributors,
					suffix: "assigned"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Open issues",
					value: stats.openIssues,
					suffix: stats.openIssues === 1 ? "ticket" : "tickets"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Avg quality",
					value: stats.avgScore || "0.0",
					suffix: "/100"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3",
					children: "My contributors"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No contributors yet",
					subtitle: "Assigned contributors will appear here.",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-8 w-8" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3",
				children: "Daily dose"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm italic text-foreground/80 leading-relaxed",
				children: [
					"\"",
					dose,
					"\""
				]
			})] })]
		})
	] });
}
function AdminDash({ dose }) {
	const [stats, setStats] = (0, import_react.useState)({
		projects: 0,
		projTotal: 0,
		members: 0,
		openIssues: 0,
		pending: 0,
		onboardingPct: 0,
		avgScore: 0
	});
	const [roles, setRoles] = (0, import_react.useState)({});
	const [projects, setProjects] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		(async () => {
			const [activeProj, totalProj, members, issues, pending, allRoles, prog, scores, projs, profs] = await Promise.all([
				supabase.from("projects").select("id", {
					count: "exact",
					head: true
				}).eq("status", "active"),
				supabase.from("projects").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("profiles").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("quality_issues").select("id", {
					count: "exact",
					head: true
				}).eq("status", "open"),
				supabase.from("user_roles").select("id", {
					count: "exact",
					head: true
				}).eq("role", "pending"),
				supabase.from("user_roles").select("role,status"),
				supabase.from("contributor_progress").select("status"),
				supabase.from("quality_scores").select("score"),
				supabase.from("projects").select("id,name,sme_owner_id,status").limit(8),
				supabase.from("profiles").select("id,name,email")
			]);
			const total = prog.data?.length ?? 0;
			const done = prog.data?.filter((p) => p.status === "complete").length ?? 0;
			const onb = total ? Math.round(done / total * 100) : 0;
			const avg = scores.data?.length ? Math.round(scores.data.reduce((a, b) => a + Number(b.score), 0) / scores.data.length * 10) / 10 : 0;
			const profMap = new Map((profs.data ?? []).map((p) => [p.id, p.name ?? p.email]));
			setProjects((projs.data ?? []).map((p) => ({
				name: p.name,
				sme: profMap.get(p.sme_owner_id) ?? "Unassigned",
				score: null,
				status: p.status
			})));
			const roleCounts = {
				super_admin: 0,
				tnq_team: 0,
				viewer: 0,
				contributor: 0,
				pending: 0
			};
			(allRoles.data ?? []).forEach((r) => {
				const k = r.status === "pending" ? "pending" : r.role;
				roleCounts[k] = (roleCounts[k] ?? 0) + 1;
			});
			setRoles(roleCounts);
			setStats({
				projects: activeProj.count ?? 0,
				projTotal: totalProj.count ?? 0,
				members: members.count ?? 0,
				openIssues: issues.count ?? 0,
				pending: pending.count ?? 0,
				onboardingPct: onb,
				avgScore: avg
			});
		})();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { items: [
			{
				label: "Backend connected",
				tone: "ok"
			},
			{
				label: `${stats.members} users online today`,
				tone: "ok"
			},
			{
				label: `${stats.openIssues} open issues`,
				tone: stats.openIssues > 0 ? "warn" : "ok"
			},
			{
				label: "Maintenance mode: off",
				tone: "ok"
			}
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Active projects",
					value: stats.projects,
					suffix: `of ${stats.projTotal}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Team members",
					value: stats.members,
					suffix: "global"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Onboarding %",
					value: stats.onboardingPct.toFixed(1)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Avg quality",
					value: stats.avgScore.toFixed(1)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-4",
				children: "Team by role"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: [
					{
						key: "super_admin",
						label: "SUPER ADMIN",
						cls: "bg-foreground text-background"
					},
					{
						key: "tnq_team",
						label: "TNQ TEAM",
						cls: "bg-orange-100 text-orange-800"
					},
					{
						key: "viewer",
						label: "VIEWER",
						cls: "bg-sky-100 text-sky-800"
					},
					{
						key: "contributor",
						label: "CONTRIBUTOR",
						cls: "bg-violet-100 text-violet-800"
					},
					{
						key: "pending",
						label: "PENDING",
						cls: "bg-amber-100 text-amber-800"
					}
				].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded ${r.cls}`,
						children: r.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-digital text-xl text-foreground",
						children: roles[r.key] ?? 0
					})]
				}, r.key))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-4",
					children: "Project health matrix"
				}), projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No projects yet",
					subtitle: "Create a project to see health metrics.",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-8 w-8" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1fr_1fr_80px_80px] gap-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase pb-2 border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Project" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "SME" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Score" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Status" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: projects.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[1fr_1fr_80px_80px] gap-2 py-2.5 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-foreground truncate",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-muted-foreground truncate",
								children: p.sme
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-foreground",
								children: p.score ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase ${p.status === "active" ? "bg-emerald-100 text-emerald-800" : p.status === "paused" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`,
								children: p.status
							}) })
						]
					}, i))
				})] })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase",
						children: "Wall of excellence"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No recognitions yet",
					subtitle: "Celebrate teammates from the admin console.",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-8 w-8" })
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase",
						children: "Pending actions"
					})]
				}), stats.pending > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [
						stats.pending,
						" user(s) awaiting approval.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin/users",
							className: "text-primary hover:underline",
							children: "Review →"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "All clear",
					subtitle: "No pending approvals.",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-8 w-8" })
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase mb-3",
					children: "Daily dose"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm italic text-foreground/80 leading-relaxed",
					children: [
						"\"",
						dose,
						"\""
					]
				})] })
			]
		})
	] });
}
//#endregion
export { Dashboard as component };
