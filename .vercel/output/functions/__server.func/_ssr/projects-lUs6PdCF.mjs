import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CYFV1vtm.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as FolderKanban, f as Search, o as Trash2, v as Plus, y as Pencil } from "../_libs/lucide-react.mjs";
import { a as Field, f as Textarea, i as EmptyState, l as Select, n as Button, o as Input, r as Card, s as Modal, t as Badge } from "./ui-BU3fdnmk.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-lUs6PdCF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"active",
	"paused",
	"completed"
];
var AUDIENCES = [
	"Contract",
	"Freelancers",
	"Internal Temporary",
	"Mixed",
	"N/A"
];
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
function Avatars({ ids, smes }) {
	if (!ids?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex -space-x-2",
		children: [ids.slice(0, 4).map((id) => {
			const s = smes.find((x) => x.id === id);
			const initial = (s?.name ?? s?.email ?? "?").slice(0, 1).toUpperCase();
			return s?.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: s.photo_url,
				alt: "",
				title: s?.name ?? s?.email ?? "",
				className: "h-7 w-7 rounded-full border-2 border-card"
			}, id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				title: s?.name ?? s?.email ?? "",
				className: "h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[11px] font-bold text-foreground",
				children: initial
			}, id);
		}), ids.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground",
			children: ["+", ids.length - 4]
		})]
	});
}
function ProjectsPage() {
	const { role, user } = useAuth();
	const canWrite = role === "super_admin" || role === "tnq_team";
	const [items, setItems] = (0, import_react.useState)([]);
	const [smes, setSmes] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({});
	const [tab, setTab] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)("");
	async function load() {
		setLoading(true);
		const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
		setItems(data ?? []);
		const { data: smeRoles } = await supabase.from("user_roles").select("user_id").in("role", ["super_admin", "tnq_team"]);
		const ids = (smeRoles ?? []).map((r) => r.user_id);
		if (ids.length) {
			const { data: profs } = await supabase.from("profiles").select("id,name,email,photo_url").in("id", ids);
			setSmes(profs ?? []);
		}
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	function startCreate() {
		setEditing(null);
		setForm({
			name: "",
			given_name: "",
			emoji_icon: "📁",
			domain: "",
			description: "",
			status: "active",
			sme_owner_id: user?.id ?? null,
			audience_type: "N/A",
			version: "V1",
			current_owner_ids: user?.id ? [user.id] : [],
			previous_owner_ids: [],
			links: "",
			auditing_status: "not_live"
		});
		setOpen(true);
	}
	function startEdit(p) {
		setEditing(p);
		setForm(p);
		setOpen(true);
	}
	async function save() {
		if (!form.name?.trim()) {
			toast.error("Name is required");
			return;
		}
		const payload = {
			name: form.name.trim(),
			given_name: form.given_name || null,
			domain: form.domain || null,
			description: form.description || null,
			sme_owner_id: form.sme_owner_id || null,
			status: form.status ?? "active",
			audience_type: form.audience_type || null,
			version: form.version || null,
			emoji_icon: form.emoji_icon || "📁",
			current_owner_ids: form.current_owner_ids ?? [],
			previous_owner_ids: form.previous_owner_ids ?? [],
			links: form.links?.trim() || null,
			auditing_status: form.auditing_status ?? "not_live",
			updated_by: user?.id ?? null,
			last_updated_by: user?.id ?? null
		};
		if (editing) for (const f of [
			"name",
			"given_name",
			"status",
			"audience_type",
			"version",
			"sme_owner_id",
			"description",
			"links",
			"auditing_status"
		]) {
			const oldV = editing[f] ?? "";
			const newV = payload[f] ?? "";
			if (String(oldV) !== String(newV)) await supabase.from("activity_log").insert({
				user_id: user?.id ?? "",
				action: "field_updated",
				action_type: "project_update",
				target: editing.id,
				field_changed: f,
				old_value: String(oldV),
				new_value: String(newV)
			});
		}
		const res = editing ? await supabase.from("projects").update(payload).eq("id", editing.id) : await supabase.from("projects").insert(payload);
		if (res.error) {
			toast.error(res.error.message);
			return;
		}
		if (!editing && res.data?.[0]?.id) await supabase.from("activity_log").insert({
			user_id: user?.id ?? "",
			action: "project_created",
			action_type: "project_update",
			target: res.data[0].id
		});
		toast.success(editing ? "Project updated" : "Project created");
		setOpen(false);
		load();
	}
	async function remove(p) {
		if (!confirm(`Delete project "${p.name}"?`)) return;
		const { error } = await supabase.from("projects").delete().eq("id", p.id);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Deleted");
		load();
	}
	const visible = (0, import_react.useMemo)(() => {
		let v = items;
		if (tab !== "all") v = v.filter((p) => p.status === tab);
		if (q.trim()) {
			const t = q.toLowerCase();
			v = v.filter((p) => p.name.toLowerCase().includes(t) || (p.given_name ?? "").toLowerCase().includes(t));
		}
		return v;
	}, [
		items,
		tab,
		q
	]);
	const TABS = [
		{
			key: "all",
			label: "ALL PROJECTS"
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
	];
	function toggleId(field, id) {
		const cur = form[field] ?? [];
		setForm({
			...form,
			[field]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-soft",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(t.key),
					className: `font-mono text-[11px] font-bold tracking-[0.18em] px-4 py-2 rounded-full transition-colors ${tab === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`,
					children: t.label
				}, t.key))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search projects…",
						className: "w-64 pl-8"
					})]
				}), canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: startCreate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New project"]
				})]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) }) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-10 w-10" }),
			title: "No projects to show.",
			subtitle: canWrite ? "Create your first project to get started." : "Nothing here yet."
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
									children: "Auditing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Link"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Current Owners"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-3",
									children: "Previous Owners"
								}),
								canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-3" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: visible.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-accent/40 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/projects/$id",
										params: { id: p.id },
										className: "flex items-center gap-3 group",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xl",
											children: p.emoji_icon ?? "📁"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-foreground group-hover:text-primary",
											children: p.name
										}), p.given_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: p.given_name
										})] })]
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
									className: "px-3 py-3 font-mono text-xs text-foreground",
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
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: p.auditing_status === "live" ? "success" : "default",
										children: p.auditing_status === "live" ? "Live" : "Not Live"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 max-w-[220px]",
									children: p.links ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: p.links,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "text-xs text-primary underline truncate inline-block max-w-full align-bottom",
										title: p.links,
										children: p.links
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "—"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatars, {
										ids: p.current_owner_ids ?? [],
										smes
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatars, {
										ids: p.previous_owner_ids ?? [],
										smes
									})
								}),
								canWrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-3 text-right whitespace-nowrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => startEdit(p),
										className: "p-1.5 text-muted-foreground hover:text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => remove(p),
										className: "p-1.5 text-muted-foreground hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								})
							]
						}, p.id))
					})]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
			open,
			onClose: () => setOpen(false),
			title: editing ? "Edit project" : "New project",
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: editing ? "Save" : "Create"
			})] }),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Emoji",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.emoji_icon ?? "📁",
							onChange: (e) => setForm({
								...form,
								emoji_icon: e.target.value
							}),
							maxLength: 4
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Version",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.version ?? "",
							onChange: (e) => setForm({
								...form,
								version: e.target.value
							}),
							placeholder: "V1"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Project Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.name ?? "",
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						placeholder: "e.g. Agent Mode"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Given Name / Client Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.given_name ?? "",
						onChange: (e) => setForm({
							...form,
							given_name: e.target.value
						}),
						placeholder: "e.g. OpenAI Assistants Project"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Audience Type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: form.audience_type ?? "N/A",
							onChange: (e) => setForm({
								...form,
								audience_type: e.target.value
							}),
							children: AUDIENCES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: a,
								children: a
							}, a))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: form.status ?? "active",
							onChange: (e) => setForm({
								...form,
								status: e.target.value
							}),
							children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								children: STATUS_LABEL[s]
							}, s))
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Link (URL)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.links ?? "",
							onChange: (e) => setForm({
								...form,
								links: e.target.value
							}),
							placeholder: "https://…"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Auditing",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.auditing_status ?? "not_live",
							onChange: (e) => setForm({
								...form,
								auditing_status: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "live",
								children: "Live"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "not_live",
								children: "Not Live"
							})]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "SME Owner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.sme_owner_id ?? "",
						onChange: (e) => setForm({
							...form,
							sme_owner_id: e.target.value || null
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— Unassigned —"
						}), smes.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name ?? s.email
						}, s.id))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Current Owner(s)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5 p-2 border border-border rounded-lg max-h-32 overflow-y-auto",
						children: smes.map((s) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggleId("current_owner_ids", s.id),
								className: `text-xs px-2 py-1 rounded-full border ${(form.current_owner_ids ?? []).includes(s.id) ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-accent"}`,
								children: s.name ?? s.email
							}, s.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Previous Owner(s)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5 p-2 border border-border rounded-lg max-h-32 overflow-y-auto",
						children: smes.map((s) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggleId("previous_owner_ids", s.id),
								className: `text-xs px-2 py-1 rounded-full border ${(form.previous_owner_ids ?? []).includes(s.id) ? "bg-muted-foreground text-background border-muted-foreground" : "border-border text-foreground hover:bg-accent"}`,
								children: s.name ?? s.email
							}, s.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Description",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: form.description ?? "",
						onChange: (e) => setForm({
							...form,
							description: e.target.value
						})
					})
				})
			]
		})
	] });
}
//#endregion
export { ProjectsPage as component };
