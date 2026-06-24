import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as Link } from "./link-BK4eFRk-.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
import { t as FileText } from "./file-text-D4bTzwnC.mjs";
import { t as FlaskConical } from "./flask-conical-9VaZdSYp.mjs";
import { t as GraduationCap } from "./graduation-cap-DXjx-gRt.mjs";
import { a as Field, i as EmptyState, n as Button, o as Input, p as X, r as Card, s as Modal, t as Badge } from "./ui-BR57aP_a.mjs";
import { t as Plus } from "./plus-CGaL89cu.mjs";
import { n as toast } from "./dist-tXmvIPPR.mjs";
import { t as ExternalLink } from "./external-link-CGPQ5RRN.mjs";
import { t as Pencil } from "./pencil-hrizh8d5.mjs";
import { t as Check } from "./check-DaOJ8gbF.mjs";
import { n as useParams } from "./useParams-C6vAigTq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects._id-BQGK5TE2.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowLeft = createLucideIcon("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Link2 = createLucideIcon("link-2", [
	["path", {
		d: "M9 17H7A5 5 0 0 1 7 7h2",
		key: "8i5ue5"
	}],
	["path", {
		d: "M15 7h2a5 5 0 1 1 0 10h-2",
		key: "1b9ql8"
	}],
	["line", {
		x1: "8",
		x2: "16",
		y1: "12",
		y2: "12",
		key: "1jonct"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Radio = createLucideIcon("radio", [
	["path", {
		d: "M16.247 7.761a6 6 0 0 1 0 8.478",
		key: "1fwjs5"
	}],
	["path", {
		d: "M19.075 4.933a10 10 0 0 1 0 14.134",
		key: "ehdyv1"
	}],
	["path", {
		d: "M4.925 19.067a10 10 0 0 1 0-14.134",
		key: "1q22gi"
	}],
	["path", {
		d: "M7.753 16.239a6 6 0 0 1 0-8.478",
		key: "r2q7qm"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "2",
		key: "1c9p78"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Rocket = createLucideIcon("rocket", [
	["path", {
		d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
		key: "qeys4"
	}],
	["path", {
		d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09",
		key: "u4xsad"
	}],
	["path", {
		d: "M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z",
		key: "676m9"
	}],
	["path", {
		d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05",
		key: "92ym6u"
	}]
]);
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
var LINK_SLOTS = [
	{
		type: "project_doc",
		label: "Project Document",
		icon: FileText
	},
	{
		type: "playground_user",
		label: "Playground (User)",
		icon: FlaskConical
	},
	{
		type: "playground_prod",
		label: "Playground (Production)",
		icon: Rocket
	},
	{
		type: "learning_path_user",
		label: "Learning Path (User)",
		icon: GraduationCap
	},
	{
		type: "learning_path_prod",
		label: "Learning Path (Production)",
		icon: Radio
	}
];
function Avatar({ p, size = 28 }) {
	if (!p) return null;
	const init = (p.name ?? p.email ?? "?").slice(0, 1).toUpperCase();
	return p.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: p.photo_url,
		alt: "",
		title: p.name ?? p.email ?? "",
		className: "rounded-full border-2 border-card",
		style: {
			width: size,
			height: size
		}
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		title: p.name ?? p.email ?? "",
		className: "rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground border-2 border-card",
		style: {
			width: size,
			height: size
		},
		children: init
	});
}
function OwnerList({ ids, profiles }) {
	if (!ids?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "— None"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: ids.map((id) => {
			const p = profiles.find((x) => x.id === id);
			if (!p) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					p,
					size: 24
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium text-foreground",
					children: p.name ?? p.email
				})]
			}, id);
		})
	});
}
function ProjectDetail() {
	const { id } = useParams({ from: "/_app/projects/$id" });
	const { role, user } = useAuth();
	const [project, setProject] = (0, import_react.useState)(null);
	const [links, setLinks] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [editHeader, setEditHeader] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [given, setGiven] = (0, import_react.useState)("");
	const [editLink, setEditLink] = (0, import_react.useState)(null);
	const [contribs, setContribs] = (0, import_react.useState)([]);
	const [issues, setIssues] = (0, import_react.useState)([]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const canWrite = role === "super_admin" || role === "tnq_team" || project?.sme_owner_id === user?.id;
	async function load() {
		setLoading(true);
		const { data: p } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
		setProject(p);
		setName(p?.name ?? "");
		setGiven(p?.given_name ?? "");
		const { data: l } = await supabase.from("project_links").select("*").eq("project_id", id);
		setLinks(l ?? []);
		const { data: pr } = await supabase.from("profiles").select("id,name,email,photo_url");
		setProfiles(pr ?? []);
		const { data: c } = await supabase.from("contributors").select("*").contains("projects", [id]);
		setContribs(c ?? []);
		const { data: q } = await supabase.from("quality_issues").select("*").eq("project_id", id).order("date", { ascending: false });
		setIssues(q ?? []);
		const { data: a } = await supabase.from("activity_log").select("*").eq("target", id).order("timestamp", { ascending: false }).limit(100);
		setActivity(a ?? []);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [id]);
	async function saveHeader() {
		if (!name.trim()) {
			toast.error("Name required");
			return;
		}
		const changes = [];
		if ((project?.name ?? "") !== name.trim()) changes.push({
			field: "name",
			old: project?.name ?? "",
			next: name.trim()
		});
		if ((project?.given_name ?? "") !== given.trim()) changes.push({
			field: "given_name",
			old: project?.given_name ?? "",
			next: given.trim()
		});
		const { error } = await supabase.from("projects").update({
			name: name.trim(),
			given_name: given.trim() || null,
			updated_by: user?.id ?? null
		}).eq("id", id);
		if (error) return toast.error(error.message);
		for (const c of changes) await supabase.from("activity_log").insert({
			user_id: user?.id ?? "",
			action: "field_updated",
			action_type: "project_update",
			target: id,
			field_changed: c.field,
			old_value: c.old,
			new_value: c.next
		});
		toast.success("Updated");
		setEditHeader(false);
		load();
	}
	async function saveLink() {
		if (!editLink) return;
		if (!editLink.url.trim()) {
			toast.error("URL required");
			return;
		}
		const payload = {
			project_id: id,
			link_type: editLink.type,
			label: editLink.label || editLink.type,
			url: editLink.url.trim(),
			updated_by: user?.id ?? null
		};
		const tbl = supabase.from("project_links");
		const res = editLink.existing ? await tbl.update(payload).eq("id", editLink.existing.id) : await tbl.insert({
			...payload,
			added_by: user?.id ?? null
		});
		if (res.error) return toast.error(res.error.message);
		toast.success("Link saved");
		await supabase.from("activity_log").insert({
			user_id: user?.id ?? "",
			action: editLink.existing ? "link_updated" : "link_added",
			action_type: "project_link",
			target: id,
			details: { type: editLink.type }
		});
		setEditLink(null);
		load();
	}
	async function removeLink(l) {
		if (!confirm("Delete this link?")) return;
		const { error } = await supabase.from("project_links").delete().eq("id", l.id);
		if (error) return toast.error(error.message);
		toast.success("Removed");
		load();
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-12 text-center text-sm text-muted-foreground",
		children: "Loading…"
	}) });
	if (!project) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Project not found" }) });
	const owner = profiles.find((p) => p.id === project.sme_owner_id);
	const currentOwners = project.current_owner_ids ?? [];
	const previousOwners = project.previous_owner_ids ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/projects",
			className: "inline-flex items-center gap-1 text-xs font-mono tracking-[0.16em] text-muted-foreground hover:text-foreground mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3" }), " ALL PROJECTS"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 flex items-start justify-between gap-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-5xl",
					children: project.emoji_icon ?? "📁"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0",
					children: editHeader ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "Project name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: given,
								onChange: (e) => setGiven(e.target.value),
								placeholder: "Given name / client"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: saveHeader,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), " Save"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setEditHeader(false),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
								})]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-4xl font-bold tracking-tight text-foreground flex items-center gap-2",
							children: [project.name, canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setEditHeader(true),
								className: "text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
							})]
						}),
						project.given_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-base text-muted-foreground mt-1",
							children: [
								"Client:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground/80",
									children: project.given_name
								})
							]
						}),
						project.last_updated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1 font-mono",
							children: [
								"Last updated:",
								" ",
								new Date(project.last_updated).toLocaleString(void 0, {
									day: "2-digit",
									month: "short",
									year: "numeric",
									hour: "numeric",
									minute: "2-digit"
								}),
								project.last_updated_by && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" by ", profiles.find((p) => p.id === project.last_updated_by)?.name ?? "—"] })
							]
						})
					] })
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-8 gap-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5",
						children: "Audience"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: project.audience_type ?? "N/A"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: STATUS_TONE[project.status],
						children: STATUS_LABEL[project.status]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5",
						children: "Version"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm font-bold text-foreground",
						children: project.version ?? "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[200px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5",
							children: "Current Owners"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnerList, {
							ids: currentOwners,
							profiles
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[200px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-1.5",
							children: "Previous Owners"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnerList, {
							ids: previousOwners,
							profiles
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft w-fit",
			children: [
				{
					key: "overview",
					label: "OVERVIEW"
				},
				{
					key: "links",
					label: "LINKS"
				},
				{
					key: "contributors",
					label: "CONTRIBUTORS"
				},
				{
					key: "quality",
					label: "QUALITY"
				},
				{
					key: "activity",
					label: "ACTIVITY"
				}
			].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab(t.key),
				className: `font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors ${tab === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
				children: t.label
			}, t.key))
		}),
		tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-2",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-foreground whitespace-pre-wrap",
					children: project.description || "No description yet."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-2",
				children: "SME Owner"
			}), owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					p: owner,
					size: 32
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium text-foreground",
					children: owner.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: owner.email
				})] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-muted-foreground",
				children: "Unassigned"
			})] })]
		}),
		tab === "links" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: [
				LINK_SLOTS.map((slot) => {
					const existing = links.find((l) => l.link_type === slot.type);
					const Icon = slot.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 text-foreground" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground",
									children: existing?.label ?? slot.label
								}), existing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: existing.url,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "text-xs text-muted-foreground hover:text-primary truncate block max-w-[260px]",
									children: existing.url
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground italic",
									children: "— Not set"
								})]
							})]
						}), canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setEditLink({
								type: slot.type,
								label: existing?.label ?? slot.label,
								url: existing?.url ?? "",
								existing
							}),
							className: "text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2",
						children: existing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: existing.url,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
							children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
						}) : canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setEditLink({
								type: slot.type,
								label: slot.label,
								url: ""
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Link"]
						})
					})] }, slot.type);
				}),
				links.filter((l) => l.link_type === "custom").map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-5 w-5 text-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-foreground",
								children: l.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: l.url,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "text-xs text-muted-foreground hover:text-primary truncate block max-w-[260px]",
								children: l.url
							})]
						})]
					}), canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setEditLink({
								type: "custom",
								label: l.label,
								url: l.url,
								existing: l
							}),
							className: "text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => removeLink(l),
							className: "text-muted-foreground hover:text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: l.url,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
						children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
					})
				})] }, l.id)),
				canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-dashed flex items-center justify-center cursor-pointer hover:bg-accent/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setEditLink({
							type: "custom",
							label: "",
							url: ""
						}),
						className: "text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add additional link"]
					})
				})
			]
		}),
		tab === "contributors" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "!p-0 overflow-hidden",
			children: contribs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-8 text-center text-sm text-muted-foreground",
				children: "No contributors on this project."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted/40 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3",
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Onboarding"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Score"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "SME"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: contribs.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "hover:bg-accent/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-foreground",
								children: c.name ?? c.email ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: c.onboarding_status === "complete" ? "success" : "warn",
									children: c.onboarding_status ?? "pending"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-mono",
								children: c.avg_score ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-muted-foreground",
								children: profiles.find((p) => p.id === c.sme_id)?.name ?? "—"
							})
						]
					}, c.id))
				})]
			})
		}),
		tab === "quality" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase mb-1",
				children: "Open Issues"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-digital text-4xl",
				children: issues.length.toString().padStart(2, "0")
			})] }), issues.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No quality issues" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "!p-0 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/40 border-b border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-5 py-3",
									children: "Issue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Severity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Status"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: issues.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3",
								children: i.title ?? i.description ?? "Issue"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "warn",
									children: i.severity ?? "—"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: i.status ?? "open" })
							})
						] }, i.id))
					})]
				})
			})]
		}),
		tab === "activity" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "!p-0 overflow-hidden",
			children: activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-8 text-center text-sm text-muted-foreground",
				children: "No activity logged."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted/40 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3",
								children: "When"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Action"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Field"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-3",
								children: "Change"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: activity.map((a) => {
						const u = profiles.find((p) => p.id === a.user_id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-xs text-muted-foreground whitespace-nowrap",
								children: new Date(a.timestamp).toLocaleString(void 0, {
									day: "2-digit",
									month: "short",
									year: "numeric",
									hour: "numeric",
									minute: "2-digit"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: u?.name ?? u?.email ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-mono text-xs",
								children: a.action
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-mono text-xs text-muted-foreground",
								children: a.field_changed ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-xs",
								children: a.field_changed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground line-through",
										children: a.old_value || "∅"
									}),
									" ",
									"→",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground font-medium",
										children: a.new_value || "∅"
									})
								] }) : "—"
							})
						] }, a.id);
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: !!editLink,
			onClose: () => setEditLink(null),
			title: editLink?.existing ? "Edit link" : "Add link",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setEditLink(null),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: saveLink,
				children: "Save"
			})] }),
			children: editLink && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Label",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: editLink.label,
					onChange: (e) => setEditLink({
						...editLink,
						label: e.target.value
					}),
					placeholder: "Display name"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "URL",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: editLink.url,
					onChange: (e) => setEditLink({
						...editLink,
						url: e.target.value
					}),
					placeholder: "https://…"
				})
			})] })
		})
	] });
}
//#endregion
export { ProjectDetail as component };
