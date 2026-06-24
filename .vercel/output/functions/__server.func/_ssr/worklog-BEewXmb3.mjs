import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CYFV1vtm.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { K as Check, R as Download, b as MessageSquare, d as Send, f as Search, o as Trash2, t as X, y as Pencil } from "../_libs/lucide-react.mjs";
import { f as Textarea, i as EmptyState, l as Select, n as Button, o as Input, r as Card, t as Badge } from "./ui-BU3fdnmk.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/worklog-BEewXmb3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	{
		key: "working_on",
		label: "Working On",
		tone: "info"
	},
	{
		key: "need_help",
		label: "Need Help",
		tone: "warn"
	},
	{
		key: "completed",
		label: "Completed",
		tone: "success"
	},
	{
		key: "blocked",
		label: "Blocked",
		tone: "danger"
	},
	{
		key: "review_needed",
		label: "Review Needed",
		tone: "default"
	}
];
var TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.key, t.label]));
var TYPE_TONE = Object.fromEntries(TYPES.map((t) => [t.key, t.tone]));
function fmtTime(iso) {
	return new Date(iso).toLocaleTimeString(void 0, {
		hour: "numeric",
		minute: "2-digit"
	});
}
function fmtDateOnly(iso) {
	return new Date(iso).toLocaleDateString(void 0, {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}
function dayKey(iso) {
	const d = new Date(iso);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthKey(iso) {
	const d = new Date(iso);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
var TODAY = dayKey((/* @__PURE__ */ new Date()).toISOString());
function WorkLogPage() {
	const { user, role } = useAuth();
	const isAdmin = role === "super_admin";
	const canPost = role === "super_admin" || role === "tnq_team";
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [content, setContent] = (0, import_react.useState)("");
	const [projectId, setProjectId] = (0, import_react.useState)("");
	const [entryType, setEntryType] = (0, import_react.useState)("working_on");
	const [filterType, setFilterType] = (0, import_react.useState)("all");
	const [filterUser, setFilterUser] = (0, import_react.useState)("");
	const [filterProject, setFilterProject] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [dateMode, setDateMode] = (0, import_react.useState)("all");
	const [dateValue, setDateValue] = (0, import_react.useState)("");
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editContent, setEditContent] = (0, import_react.useState)("");
	const [editType, setEditType] = (0, import_react.useState)("working_on");
	const sb = supabase;
	async function load() {
		const [{ data: e }, { data: p }, { data: pr }] = await Promise.all([
			sb.from("work_log_entries").select("*").order("created_at", { ascending: false }),
			supabase.from("profiles").select("id,name,email,photo_url"),
			supabase.from("projects").select("id,name,emoji_icon")
		]);
		setEntries(e ?? []);
		setProfiles(p ?? []);
		setProjects(pr ?? []);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel("worklog-table").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "work_log_entries"
		}, () => {
			sb.from("work_log_entries").select("*").order("created_at", { ascending: false }).then(({ data }) => setEntries(data ?? []));
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, []);
	async function post() {
		const t = content.trim();
		if (!t) return;
		if (t.length > 500) return toast.error("Max 500 characters");
		const { error } = await sb.from("work_log_entries").insert({
			user_id: user.id,
			content: t,
			project_id: projectId || null,
			entry_type: entryType
		});
		if (error) return toast.error(error.message);
		await supabase.from("activity_log").insert({
			user_id: user?.id ?? "",
			action: "worklog_post",
			action_type: "work_log",
			details: { type: entryType }
		});
		setContent("");
		setProjectId("");
		setEntryType("working_on");
		toast.success("Posted");
	}
	function startEdit(e) {
		setEditId(e.id);
		setEditContent(e.content);
		setEditType(e.entry_type);
	}
	async function saveEdit(id) {
		const { error } = await sb.from("work_log_entries").update({
			content: editContent,
			entry_type: editType
		}).eq("id", id);
		if (error) return toast.error(error.message);
		setEditId(null);
		toast.success("Updated");
	}
	async function remove(id) {
		if (!confirm("Delete this entry?")) return;
		const { error } = await sb.from("work_log_entries").delete().eq("id", id);
		if (error) return toast.error(error.message);
		toast.success("Deleted");
	}
	const filtered = (0, import_react.useMemo)(() => {
		return entries.filter((e) => {
			if (filterType !== "all" && e.entry_type !== filterType) return false;
			if (filterUser && e.user_id !== filterUser) return false;
			if (filterProject && e.project_id !== filterProject) return false;
			if (search && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
			if (dateMode === "day" && dateValue && dayKey(e.created_at) !== dateValue) return false;
			if (dateMode === "month" && dateValue && monthKey(e.created_at) !== dateValue) return false;
			return true;
		});
	}, [
		entries,
		filterType,
		filterUser,
		filterProject,
		search,
		dateMode,
		dateValue
	]);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const e of filtered) {
			const d = dayKey(e.created_at);
			const k = `${e.user_id}|${d}`;
			const g = map.get(k) ?? {
				key: k,
				user_id: e.user_id,
				day: d,
				entries: []
			};
			g.entries.push(e);
			map.set(k, g);
		}
		const out = [];
		for (const g of map.values()) {
			g.entries.sort((a, b) => b.created_at.localeCompare(a.created_at));
			if (g.day === TODAY) g.entries = g.entries.slice(0, 1);
			out.push(g);
		}
		out.sort((a, b) => a.day === b.day ? 0 : a.day < b.day ? 1 : -1);
		return out;
	}, [filtered]);
	const maxCols = Math.max(1, ...groups.map((g) => g.entries.length));
	function exportCsv() {
		const csv = [[
			"#",
			"Name",
			"Date",
			...Array.from({ length: maxCols }, (_, i) => `Entry ${i + 1}`)
		], ...groups.map((g, i) => {
			const author = profiles.find((p) => p.id === g.user_id);
			const name = author?.name ?? author?.email ?? "";
			const cells = Array.from({ length: maxCols }, (_, idx) => {
				const e = g.entries[idx];
				if (!e) return "";
				const proj = projects.find((p) => p.id === e.project_id)?.name ?? "";
				return `[${TYPE_LABEL[e.entry_type]}] ${e.content}${proj ? ` (${proj})` : ""} @ ${fmtTime(e.created_at)}`.replace(/"/g, "\"\"");
			});
			return [
				String(i + 1),
				name,
				fmtDateOnly(g.day + "T00:00:00"),
				...cells
			];
		})].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `worklog-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		a.click();
	}
	if (!canPost && role !== "contributor") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "Restricted" }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		canPost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase mb-2",
					children: "What are you working on?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: content,
					onChange: (e) => setContent(e.target.value.slice(0, 500)),
					placeholder: "e.g. Reviewing Playground content for Agent Mode project…",
					className: "min-h-[90px]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: projectId,
							onChange: (e) => setProjectId(e.target.value),
							className: "!w-auto !h-8 !text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "— Project (optional) —"
							}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: p.id,
								children: [
									p.emoji_icon ?? "📁",
									" ",
									p.name
								]
							}, p.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: entryType,
							onChange: (e) => setEntryType(e.target.value),
							className: "!w-auto !h-8 !text-xs",
							children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: t.key,
								children: t.label
							}, t.key))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `font-mono text-xs ${content.length > 480 ? "text-destructive" : "text-muted-foreground"}`,
							children: [content.length, "/500"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: post,
							disabled: !content.trim(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Post Update"]
						})]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search content…",
							className: "w-56 pl-8"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: filterUser,
						onChange: (e) => setFilterUser(e.target.value),
						className: "!w-auto !h-9 !text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All people"
						}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name ?? p.email
						}, p.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: filterProject,
						onChange: (e) => setFilterProject(e.target.value),
						className: "!w-auto !h-9 !text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All projects"
						}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: filterType,
						onChange: (e) => setFilterType(e.target.value),
						className: "!w-auto !h-9 !text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All categories"
						}), TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: t.key,
							children: t.label
						}, t.key))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: dateMode,
						onChange: (e) => {
							setDateMode(e.target.value);
							setDateValue("");
						},
						className: "!w-auto !h-9 !text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All dates"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "day",
								children: "By day"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "month",
								children: "By month"
							})
						]
					}),
					dateMode === "day" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: dateValue,
						onChange: (e) => setDateValue(e.target.value),
						className: "!h-9 !text-xs !w-auto"
					}),
					dateMode === "month" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "month",
						value: dateValue,
						onChange: (e) => setDateValue(e.target.value),
						className: "!h-9 !text-xs !w-auto"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				size: "sm",
				onClick: exportCsv,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export CSV"]
			})]
		}),
		groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-10 w-10" }),
			title: "No work log entries",
			subtitle: "Post your first update above."
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
									className: "text-left px-4 py-3 w-12",
									children: "#"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3 whitespace-nowrap",
									children: "Date"
								}),
								Array.from({ length: maxCols }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
									className: "text-left px-3 py-3 min-w-[260px]",
									children: ["Entry ", i + 1]
								}, i))
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: groups.map((g, i) => {
							const author = profiles.find((p) => p.id === g.user_id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-accent/30 align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-mono text-xs text-muted-foreground",
										children: i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [author?.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: author.photo_url,
												alt: "",
												className: "h-7 w-7 rounded-full"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold",
												children: (author?.name ?? author?.email ?? "?")[0]?.toUpperCase()
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground whitespace-nowrap",
												children: author?.name ?? author?.email ?? "—"
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono",
										children: [fmtDateOnly(g.day + "T00:00:00"), g.day === TODAY && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] text-primary mt-0.5",
											children: "Today · latest only"
										})]
									}),
									Array.from({ length: maxCols }, (_, idx) => {
										const e = g.entries[idx];
										if (!e) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-3 text-xs text-muted-foreground",
											children: "—"
										}, idx);
										const proj = projects.find((p) => p.id === e.project_id);
										const editable = isAdmin || e.user_id === user?.id;
										const editing = editId === e.id;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 py-3 min-w-[260px] max-w-[360px]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between gap-2 mb-1",
													children: [editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
														value: editType,
														onChange: (ev) => setEditType(ev.target.value),
														className: "!h-7 !text-xs",
														children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: t.key,
															children: t.label
														}, t.key))
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														tone: TYPE_TONE[e.entry_type],
														children: TYPE_LABEL[e.entry_type]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-muted-foreground whitespace-nowrap",
														children: fmtTime(e.created_at)
													})]
												}),
												editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													value: editContent,
													onChange: (ev) => setEditContent(ev.target.value),
													className: "min-h-[60px]"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "whitespace-pre-wrap text-foreground text-sm",
													children: e.content
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-1.5 flex items-center justify-between gap-2",
													children: [proj ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium",
														children: [
															proj.emoji_icon ?? "📁",
															" ",
															proj.name
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] text-muted-foreground",
														children: "—"
													}), editable && (editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => saveEdit(e.id),
															className: "p-1 text-emerald-600 hover:text-emerald-700",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => setEditId(null),
															className: "p-1 text-muted-foreground hover:text-foreground",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
														})]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => startEdit(e),
															className: "p-1 text-muted-foreground hover:text-foreground",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => remove(e.id),
															className: "p-1 text-muted-foreground hover:text-destructive",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
														})]
													}))]
												})
											]
										}, idx);
									})
								]
							}, g.key);
						})
					})]
				})
			})
		})
	] });
}
//#endregion
export { WorkLogPage as component };
