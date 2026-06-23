import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as CSS, i as closestCenter, l as useSensor, r as PointerSensor, t as DndContext, u as useSensors } from "../_libs/@dnd-kit/core+[...].mjs";
import { A as GripVertical, G as ChevronDown, I as ExternalLink, L as EllipsisVertical, P as FlaskConical, W as ChevronRight, f as Search, j as GraduationCap, o as Trash2, v as Plus, y as Pencil } from "../_libs/lucide-react.mjs";
import { a as Field, c as PageHeader, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BU3fdnmk.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as verticalListSortingStrategy, i as useSortable, n as arrayMove, r as horizontalListSortingStrategy, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learning-CZ_Gb50p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useStoredOrder(key, defaultOrder) {
	const [order, setOrder] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return defaultOrder;
		try {
			const s = localStorage.getItem(key);
			if (!s) return defaultOrder;
			const valid = JSON.parse(s).filter((x) => defaultOrder.includes(x));
			defaultOrder.forEach((x) => {
				if (!valid.includes(x)) valid.push(x);
			});
			return valid;
		} catch {
			return defaultOrder;
		}
	});
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(key, JSON.stringify(order));
		} catch {}
	}, [key, order]);
	return [order, setOrder];
}
function SortableItem({ id, children, handleClass = "" }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? .6 : 1,
			zIndex: isDragging ? 10 : "auto"
		},
		children: children(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			ref: setNodeRef,
			...attributes,
			...listeners,
			className: `cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors ${handleClass}`,
			"aria-label": "Drag to reorder",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-4 w-4" })
		}))
	});
}
function SortableList({ ids, onReorder, children, axis = "y" }) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	function onDragEnd(e) {
		const { active, over } = e;
		if (!over || active.id === over.id) return;
		const oldIdx = ids.indexOf(String(active.id));
		const newIdx = ids.indexOf(String(over.id));
		if (oldIdx < 0 || newIdx < 0) return;
		onReorder(arrayMove(ids, oldIdx, newIdx));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
		sensors,
		collisionDetection: closestCenter,
		onDragEnd,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
			items: ids,
			strategy: axis === "y" ? verticalListSortingStrategy : horizontalListSortingStrategy,
			children
		})
	});
}
var fmtDate = (iso) => {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
};
var truncate = (s, n = 28) => !s ? "" : s.length > n ? s.slice(0, n) + "…" : s;
function LinkCell({ url, canEdit, onSave }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [val, setVal] = (0, import_react.useState)(url ?? "");
	(0, import_react.useEffect)(() => {
		setVal(url ?? "");
	}, [url]);
	if (editing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: val,
				onChange: (e) => setVal(e.target.value),
				placeholder: "https://…",
				className: "h-7 text-xs min-w-[160px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: async () => {
					await onSave(val.trim());
					setEditing(false);
				},
				children: "Save"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => {
					setVal(url ?? "");
					setEditing(false);
				},
				children: "Cancel"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1.5",
		children: [url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			title: url,
			children: truncate(url)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
			children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: "— Not set"
		}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setEditing(true),
			className: "text-muted-foreground hover:text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
		})]
	});
}
function InlineText({ value, canEdit, onSave, className = "" }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [val, setVal] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		setVal(value);
	}, [value]);
	if (!canEdit) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: value
	});
	if (editing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: val,
				onChange: (e) => setVal(e.target.value),
				className: "h-7 text-xs"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: async () => {
					await onSave(val.trim() || value);
					setEditing(false);
				},
				children: "Save"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => {
					setVal(value);
					setEditing(false);
				},
				children: "Cancel"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => setEditing(true),
		className: `text-left hover:underline ${className}`,
		children: value
	});
}
function LivePill({ isLive, since, canToggle, onToggle }) {
	const pill = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${isLive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-muted-foreground"}` }), isLive ? "LIVE" : "NOT LIVE"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-0.5",
		children: [canToggle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: onToggle,
			children: pill
		}) : pill, isLive && since && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-[10px] text-muted-foreground",
			children: ["since ", fmtDate(since)]
		})]
	});
}
function RowMenu({ canDelete, onEditName, onDelete }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setOpen((v) => !v),
			className: "p-1 text-muted-foreground hover:text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-10",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 top-7 z-20 w-36 rounded-lg border border-border bg-card shadow-pop py-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => {
					setOpen(false);
					onEditName();
				},
				className: "w-full text-left px-3 py-1.5 text-xs hover:bg-accent",
				children: "Edit Name"
			}), canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setOpen(false);
					onDelete();
				},
				className: "w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-accent flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" }), " Delete"]
			})]
		})] })]
	});
}
function WorkspacePage() {
	const { role, user, profile } = useAuth();
	const canWrite = role === "super_admin" || role === "tnq_team";
	const canDelete = role === "super_admin";
	const isContributor = role === "contributor";
	const [tab, setTab] = (0, import_react.useState)("playgrounds");
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [playgrounds, setPlaygrounds] = (0, import_react.useState)([]);
	const [lpItems, setLpItems] = (0, import_react.useState)([]);
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [projectFilter, setProjectFilter] = (0, import_react.useState)("");
	const [liveFilter, setLiveFilter] = (0, import_react.useState)("all");
	const [versionFilter, setVersionFilter] = (0, import_react.useState)("");
	const [addPlayOpen, setAddPlayOpen] = (0, import_react.useState)(false);
	const [addLPOpen, setAddLPOpen] = (0, import_react.useState)(false);
	const [assignedProjectIds, setAssignedProjectIds] = (0, import_react.useState)(null);
	async function load() {
		setLoading(true);
		const [{ data: pjs }, { data: pgs }, { data: lps }, { data: pfs }] = await Promise.all([
			supabase.from("projects").select("id,name,audience_type,status").order("name"),
			supabase.from("playgrounds").select("id,project_id,name,version_number,is_live,live_since,access_url,content_url,dashboard_url,last_updated,last_updated_by,display_order"),
			supabase.from("learning_path_items").select("*"),
			supabase.from("profiles").select("id,name,email")
		]);
		setProjects(pjs ?? []);
		setPlaygrounds(pgs ?? []);
		setLpItems(lps ?? []);
		setProfiles(pfs ?? []);
		setAssignedProjectIds(null);
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [user?.id, role]);
	const profileName = (id) => {
		if (!id) return "—";
		const p = profiles.find((x) => x.id === id);
		return p?.name || p?.email || "—";
	};
	async function logActivity(action, payload) {
		if (!user) return;
		await supabase.from("activity_log").insert({
			user_id: user.id,
			action,
			action_type: tab === "playgrounds" ? "playground_update" : "learning_path_update",
			target: payload?.id ?? null,
			field_changed: payload?.field ?? null,
			new_value: payload?.name ?? null
		});
	}
	const visibleProjects = (0, import_react.useMemo)(() => {
		let list = projects;
		if (isContributor && assignedProjectIds) list = list.filter((p) => assignedProjectIds.includes(p.id));
		if (projectFilter) list = list.filter((p) => p.id === projectFilter);
		return list;
	}, [
		projects,
		projectFilter,
		isContributor,
		assignedProjectIds
	]);
	const itemsForProject = (pid) => {
		return (tab === "playgrounds" ? playgrounds.filter((r) => r.project_id === pid) : lpItems.filter((r) => r.project_id === pid)).filter((r) => {
			if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
			if (liveFilter === "live" && !r.is_live) return false;
			if (liveFilter === "not_live" && r.is_live) return false;
			if (versionFilter) {
				if (!((tab === "playgrounds" ? r.version_number : r.version) ?? "").toLowerCase().includes(versionFilter.toLowerCase())) return false;
			}
			return true;
		});
	};
	const allProjectIds = visibleProjects.map((p) => p.id);
	const [groupOrder, setGroupOrder] = useStoredOrder(`tnq:workspace:${tab}:${user?.id ?? "anon"}`, allProjectIds);
	const groupsToRender = (0, import_react.useMemo)(() => {
		const map = new Map(visibleProjects.map((p) => [p.id, p]));
		const out = [];
		groupOrder.forEach((id) => {
			const p = map.get(id);
			if (p) out.push(p);
		});
		visibleProjects.forEach((p) => {
			if (!groupOrder.includes(p.id)) out.push(p);
		});
		return out;
	}, [visibleProjects, groupOrder]).filter((p) => {
		if (q || liveFilter !== "all" || versionFilter) return itemsForProject(p.id).length > 0;
		return true;
	});
	async function updatePlay(id, patch, fieldLabel) {
		const next = {
			...patch,
			last_updated: (/* @__PURE__ */ new Date()).toISOString(),
			last_updated_by: user?.id ?? null
		};
		const { error } = await supabase.from("playgrounds").update(next).eq("id", id);
		if (error) {
			toast.error(error.message);
			return;
		}
		const item = playgrounds.find((x) => x.id === id);
		const proj = projects.find((p) => p.id === item?.project_id);
		await logActivity("playground.update", {
			id,
			field: fieldLabel,
			name: item?.name,
			project: proj?.name
		});
		load();
	}
	async function updateLP(id, patch, fieldLabel) {
		const next = {
			...patch,
			last_updated: (/* @__PURE__ */ new Date()).toISOString(),
			last_updated_by: user?.id ?? null
		};
		const { error } = await supabase.from("learning_path_items").update(next).eq("id", id);
		if (error) {
			toast.error(error.message);
			return;
		}
		const item = lpItems.find((x) => x.id === id);
		const proj = projects.find((p) => p.id === item?.project_id);
		await logActivity("learning_path.update", {
			id,
			field: fieldLabel,
			name: item?.name,
			project: proj?.name
		});
		load();
	}
	async function deletePlay(id) {
		if (!confirm("Delete this playground?")) return;
		const { error } = await supabase.from("playgrounds").delete().eq("id", id);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Deleted");
		load();
	}
	async function deleteLP(id) {
		if (!confirm("Delete this learning path?")) return;
		const { error } = await supabase.from("learning_path_items").delete().eq("id", id);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Deleted");
		load();
	}
	async function addPlayVersion(src) {
		const nextV = bumpVersion(src.version_number ?? "V1");
		const { error } = await supabase.from("playgrounds").insert({
			project_id: src.project_id,
			name: src.name,
			version_number: nextV,
			is_live: false,
			created_by: user?.id ?? null,
			last_updated_by: user?.id ?? null
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success(`Added ${nextV}`);
		load();
	}
	async function addLPVersion(src) {
		const nextV = bumpVersion(src.version ?? "V1");
		const { error } = await supabase.from("learning_path_items").insert({
			project_id: src.project_id,
			name: src.name,
			version: nextV,
			is_live: false,
			created_by: user?.id ?? null,
			last_updated_by: user?.id ?? null
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success(`Added ${nextV}`);
		load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Workspace",
			subtitle: "Playgrounds and Learning Paths, grouped by project",
			right: canWrite ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => tab === "playgrounds" ? setAddPlayOpen(true) : setAddLPOpen(true),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					" ",
					tab === "playgrounds" ? "Add Playground" : "Add Learning Path"
				]
			}) : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[200px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search name or project…",
							className: "pl-8"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: projectFilter,
						onChange: (e) => setProjectFilter(e.target.value),
						className: "w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All projects"
						}), visibleProjects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: liveFilter,
						onChange: (e) => setLiveFilter(e.target.value),
						className: "w-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "live",
								children: "Live"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "not_live",
								children: "Not Live"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: versionFilter,
						onChange: (e) => setVersionFilter(e.target.value),
						placeholder: "Version…",
						className: "w-28"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden sm:flex gap-1 border-b border-border mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
				active: tab === "playgrounds",
				onClick: () => setTab("playgrounds"),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "h-4 w-4" }),
				label: "Playgrounds"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
				active: tab === "learning_paths",
				onClick: () => setTab("learning_paths"),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4" }),
				label: "Learning Paths"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sm:hidden mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: tab,
				onChange: (e) => setTab(e.target.value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "playgrounds",
					children: "🧪 Playgrounds"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "learning_paths",
					children: "🎓 Learning Paths"
				})]
			})
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) }) : groupsToRender.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: tab === "playgrounds" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "h-10 w-10" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-10 w-10" }),
			title: tab === "playgrounds" ? "No playgrounds added yet." : "No learning paths added yet.",
			subtitle: canWrite ? `Add your first ${tab === "playgrounds" ? "playground" : "learning path"} to get started.` : "Nothing here yet."
		}), canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-center mt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => tab === "playgrounds" ? setAddPlayOpen(true) : setAddLPOpen(true),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					" ",
					tab === "playgrounds" ? "Add Playground" : "Add Learning Path"
				]
			})
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableList, {
			ids: groupsToRender.map((p) => p.id),
			onReorder: (next) => {
				const rest = groupOrder.filter((id) => !next.includes(id));
				setGroupOrder([...next, ...rest]);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: groupsToRender.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableItem, {
					id: p.id,
					children: (handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectGroup, {
						handle: canWrite ? handle : null,
						project: p,
						tab,
						items: itemsForProject(p.id),
						canWrite,
						canDelete,
						profileName,
						onUpdatePlay: updatePlay,
						onUpdateLP: updateLP,
						onDeletePlay: deletePlay,
						onDeleteLP: deleteLP,
						onAddPlayVersion: addPlayVersion,
						onAddLPVersion: addLPVersion
					})
				}, p.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddPlaygroundModal, {
			open: addPlayOpen,
			onClose: () => setAddPlayOpen(false),
			projects,
			userId: user?.id ?? null,
			onSaved: () => {
				setAddPlayOpen(false);
				load();
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddLPModal, {
			open: addLPOpen,
			onClose: () => setAddLPOpen(false),
			projects,
			userId: user?.id ?? null,
			onSaved: () => {
				setAddLPOpen(false);
				load();
			}
		})
	] });
}
function TabBtn({ active, onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
		children: [
			icon,
			" ",
			label
		]
	});
}
function bumpVersion(v) {
	const m = v.match(/^V?(\d+)(?:\.(\d+))?$/i);
	if (!m) return v + ".1";
	return `V${parseInt(m[1], 10) + 1}`;
}
function ProjectGroup({ handle, project, tab, items, canWrite, canDelete, profileName, onUpdatePlay, onUpdateLP, onDeletePlay, onDeleteLP, onAddPlayVersion, onAddLPVersion }) {
	const [open, setOpen] = (0, import_react.useState)(true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "!p-0 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border",
			children: [
				handle,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen((v) => !v),
					className: "text-muted-foreground hover:text-foreground",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/projects/$id",
					params: { id: project.id },
					className: "flex items-center gap-2 font-semibold text-foreground hover:underline",
					children: project.name
				}),
				project.audience_type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: project.audience_type
				}),
				project.status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: project.status === "active" ? "success" : "default",
					children: project.status
				}),
				!open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground ml-auto",
					children: [
						items.length,
						" item",
						items.length === 1 ? "" : "s"
					]
				})
			]
		}), open && (items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-6 text-center text-sm text-muted-foreground",
			children: "No items in this project yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: tab === "playgrounds" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaygroundTable, {
				items,
				canWrite,
				canDelete,
				profileName,
				onUpdate: onUpdatePlay,
				onDelete: onDeletePlay,
				onAddVersion: onAddPlayVersion
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LPTable, {
				items,
				canWrite,
				canDelete,
				profileName,
				onUpdate: onUpdateLP,
				onDelete: onDeleteLP,
				onAddVersion: onAddLPVersion
			})
		}))]
	});
}
function PlaygroundTable({ items, canWrite, canDelete, profileName, onUpdate, onDelete, onAddVersion }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
		className: "w-full min-w-[1000px] text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
			className: "bg-muted/20 text-[10px] font-mono font-bold tracking-[0.14em] uppercase text-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Version"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Playground Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Content Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Dashboard Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Last Updated"
				}),
				canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Actions"
				})
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "border-t border-border align-top",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineText, {
						value: r.name,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { name: v }, "name"),
						className: "font-medium text-foreground"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePill, {
						isLive: r.is_live,
						since: r.live_since,
						canToggle: canWrite,
						onToggle: () => onUpdate(r.id, {
							is_live: !r.is_live,
							live_since: !r.is_live ? (/* @__PURE__ */ new Date()).toISOString() : r.live_since
						}, "is_live")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineText, {
						value: r.version_number ?? "V1",
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { version_number: v }, "version"),
						className: "font-mono text-xs"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkCell, {
						url: r.access_url,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { access_url: v || null }, "playground_url")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkCell, {
						url: r.content_url,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { content_url: v || null }, "content_url")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkCell, {
						url: r.dashboard_url,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { dashboard_url: v || null }, "dashboard_url")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap",
					children: [
						fmtDate(r.last_updated),
						" by ",
						profileName(r.last_updated_by)
					]
				}),
				canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onAddVersion(r),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Version"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMenu, {
							canDelete,
							onEditName: () => {
								const v = prompt("New name", r.name);
								if (v && v.trim()) onUpdate(r.id, { name: v.trim() }, "name");
							},
							onDelete: () => onDelete(r.id)
						})]
					})
				})
			]
		}, r.id)) })]
	});
}
function LPTable({ items, canWrite, canDelete, profileName, onUpdate, onDelete, onAddVersion }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
		className: "w-full min-w-[900px] text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
			className: "bg-muted/20 text-[10px] font-mono font-bold tracking-[0.14em] uppercase text-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Version"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "User Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Production Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Last Updated"
				}),
				canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "text-left px-4 py-2",
					children: "Actions"
				})
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "border-t border-border align-top",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineText, {
						value: r.name,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { name: v }, "name"),
						className: "font-medium text-foreground"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePill, {
						isLive: r.is_live,
						since: r.live_since,
						canToggle: canWrite,
						onToggle: () => onUpdate(r.id, {
							is_live: !r.is_live,
							live_since: !r.is_live ? (/* @__PURE__ */ new Date()).toISOString() : r.live_since
						}, "is_live")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineText, {
						value: r.version ?? "V1",
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { version: v }, "version"),
						className: "font-mono text-xs"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkCell, {
						url: r.user_url,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { user_url: v || null }, "user_url")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkCell, {
						url: r.production_url,
						canEdit: canWrite,
						onSave: (v) => onUpdate(r.id, { production_url: v || null }, "production_url")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap",
					children: [
						fmtDate(r.last_updated),
						" by ",
						profileName(r.last_updated_by)
					]
				}),
				canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => onAddVersion(r),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Version"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowMenu, {
							canDelete,
							onEditName: () => {
								const v = prompt("New name", r.name);
								if (v && v.trim()) onUpdate(r.id, { name: v.trim() }, "name");
							},
							onDelete: () => onDelete(r.id)
						})]
					})
				})
			]
		}, r.id)) })]
	});
}
function AddPlaygroundModal({ open, onClose, projects, userId, onSaved }) {
	const [form, setForm] = (0, import_react.useState)({
		project_id: "",
		name: "",
		version: "V1",
		is_live: false,
		access_url: "",
		content_url: "",
		dashboard_url: ""
	});
	(0, import_react.useEffect)(() => {
		if (open) setForm({
			project_id: "",
			name: "",
			version: "V1",
			is_live: false,
			access_url: "",
			content_url: "",
			dashboard_url: ""
		});
	}, [open]);
	async function save() {
		if (!form.project_id) {
			toast.error("Project required");
			return;
		}
		if (!form.name.trim()) {
			toast.error("Name required");
			return;
		}
		const { error } = await supabase.from("playgrounds").insert({
			project_id: form.project_id,
			name: form.name.trim(),
			version_number: form.version || "V1",
			is_live: form.is_live,
			live_since: form.is_live ? (/* @__PURE__ */ new Date()).toISOString() : null,
			access_url: form.access_url || null,
			content_url: form.content_url || null,
			dashboard_url: form.dashboard_url || null,
			created_by: userId,
			last_updated_by: userId
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Playground added");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open,
		onClose,
		title: "Add Playground",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			onClick: onClose,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: save,
			children: "Create"
		})] }),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Project",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: form.project_id,
					onChange: (e) => setForm({
						...form,
						project_id: e.target.value
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "— Select project —"
					}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: p.id,
						children: p.name
					}, p.id))]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Playground Name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.name,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Version",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.version,
					onChange: (e) => setForm({
						...form,
						version: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Live Status",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.is_live,
						onChange: (e) => setForm({
							...form,
							is_live: e.target.checked
						})
					}), "Mark as Live"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Playground Link",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.access_url,
					onChange: (e) => setForm({
						...form,
						access_url: e.target.value
					}),
					placeholder: "https://…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Content Link",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.content_url,
					onChange: (e) => setForm({
						...form,
						content_url: e.target.value
					}),
					placeholder: "https://…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Dashboard Link",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.dashboard_url,
					onChange: (e) => setForm({
						...form,
						dashboard_url: e.target.value
					}),
					placeholder: "https://…"
				})
			})
		]
	});
}
function AddLPModal({ open, onClose, projects, userId, onSaved }) {
	const [form, setForm] = (0, import_react.useState)({
		project_id: "",
		name: "",
		version: "V1",
		is_live: false,
		user_url: "",
		production_url: ""
	});
	(0, import_react.useEffect)(() => {
		if (open) setForm({
			project_id: "",
			name: "",
			version: "V1",
			is_live: false,
			user_url: "",
			production_url: ""
		});
	}, [open]);
	async function save() {
		if (!form.project_id) {
			toast.error("Project required");
			return;
		}
		if (!form.name.trim()) {
			toast.error("Name required");
			return;
		}
		const { error } = await supabase.from("learning_path_items").insert({
			project_id: form.project_id,
			name: form.name.trim(),
			version: form.version || "V1",
			is_live: form.is_live,
			live_since: form.is_live ? (/* @__PURE__ */ new Date()).toISOString() : null,
			user_url: form.user_url || null,
			production_url: form.production_url || null,
			created_by: userId,
			last_updated_by: userId
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Learning path added");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open,
		onClose,
		title: "Add Learning Path",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			onClick: onClose,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: save,
			children: "Create"
		})] }),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Project",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: form.project_id,
					onChange: (e) => setForm({
						...form,
						project_id: e.target.value
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "— Select project —"
					}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: p.id,
						children: p.name
					}, p.id))]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Learning Path Name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.name,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Version",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.version,
					onChange: (e) => setForm({
						...form,
						version: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Live Status",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.is_live,
						onChange: (e) => setForm({
							...form,
							is_live: e.target.checked
						})
					}), "Mark as Live"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "User Link",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.user_url,
					onChange: (e) => setForm({
						...form,
						user_url: e.target.value
					}),
					placeholder: "https://…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Production Link",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.production_url,
					onChange: (e) => setForm({
						...form,
						production_url: e.target.value
					}),
					placeholder: "https://…"
				})
			})
		]
	});
}
//#endregion
export { WorkspacePage as component };
