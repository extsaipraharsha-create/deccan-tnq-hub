import { o as __toESM } from "./_runtime.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./_ssr/auth-context-Vm_M2PsG.mjs";
import { n as ROLE_LABEL, t as ROLE_ACCENT } from "./_ssr/constants-Cjp7GOIu.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as motion } from "./_libs/framer-motion.mjs";
import { B as ClipboardCheck, C as Lock, D as LayoutDashboard, F as FileText, M as FolderKanban, P as FlaskConical, Q as Activity, S as LogOut, T as Library, X as Award, a as TrendingUp, b as MessageSquare, c as Sparkles, j as GraduationCap, l as Shield, n as Users, p as ScrollText, q as BookOpen, r as UsersRound, u as Settings, x as Megaphone, z as Diamond } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BEQGXh6A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = {
	contributor: [
		{
			label: "OVERVIEW",
			items: [{
				label: "Dashboard",
				to: "/dashboard",
				icon: LayoutDashboard
			}]
		},
		{
			label: "MY LEARNING",
			items: [
				{
					label: "My Learning Path",
					to: "/my-learning",
					icon: BookOpen
				},
				{
					label: "My Playground",
					to: "/my-playground",
					icon: FlaskConical
				},
				{
					label: "My Progress",
					to: "/my-progress",
					icon: TrendingUp
				}
			]
		},
		{
			label: "MY WORK",
			items: [{
				label: "My Projects",
				to: "/my-projects",
				icon: FolderKanban
			}, {
				label: "My Scores",
				to: "/my-scores",
				icon: Award
			}]
		},
		{
			label: "CONTENT",
			items: [{
				label: "Resources",
				to: "/resources",
				icon: Library
			}, {
				label: "Newcomers",
				to: "/newcomers",
				icon: GraduationCap
			}]
		}
	],
	tnq_team: [
		{
			label: "OVERVIEW",
			items: [{
				label: "Dashboard",
				to: "/dashboard",
				icon: LayoutDashboard
			}, {
				label: "Work Log",
				to: "/worklog",
				icon: MessageSquare
			}]
		},
		{
			label: "OPERATIONS",
			items: [
				{
					label: "My Projects",
					to: "/projects",
					icon: FolderKanban
				},
				{
					label: "Quality Reviews",
					to: "/quality",
					icon: ClipboardCheck
				},
				{
					label: "Onboarding",
					to: "/onboarding",
					icon: Activity
				},
				{
					label: "Newcomers",
					to: "/newcomers",
					icon: GraduationCap
				}
			]
		},
		{
			label: "TEAM MANAGEMENT",
			items: [{
				label: "Team Directory",
				to: "/team",
				icon: UsersRound
			}, {
				label: "Contributors",
				to: "/contributors",
				icon: Users
			}]
		},
		{
			label: "CONTENT",
			items: [{
				label: "Workspace",
				to: "/learning",
				icon: BookOpen
			}, {
				label: "Resources",
				to: "/resources",
				icon: Library
			}]
		}
	],
	super_admin: [
		{
			label: "OVERVIEW",
			items: [{
				label: "Dashboard",
				to: "/dashboard",
				icon: LayoutDashboard
			}]
		},
		{
			label: "OPERATIONS",
			items: [
				{
					label: "All Projects",
					to: "/projects",
					icon: FolderKanban
				},
				{
					label: "Work Log",
					to: "/worklog",
					icon: MessageSquare
				},
				{
					label: "Workspace",
					to: "/learning",
					icon: BookOpen
				},
				{
					label: "Quality Overview",
					to: "/quality",
					icon: ClipboardCheck
				},
				{
					label: "Newcomers",
					to: "/newcomers",
					icon: GraduationCap
				}
			]
		},
		{
			label: "TEAM MANAGEMENT",
			items: [{
				label: "Team Directory",
				to: "/team",
				icon: UsersRound
			}, {
				label: "Contributor Management",
				to: "/contributors",
				icon: Users
			}]
		},
		{
			label: "CONTENT",
			items: [{
				label: "Resources",
				to: "/resources",
				icon: Library
			}]
		},
		{
			label: "ADMIN CONSOLE",
			admin: true,
			items: [{
				label: "Admin Panel",
				to: "/admin/users",
				icon: Settings
			}]
		}
	],
	pending: []
};
var ADMIN_SUB = [
	{
		label: "Users & Roles",
		to: "/admin/users",
		icon: Shield
	},
	{
		label: "Resource Grants",
		to: "/admin/grants",
		icon: FileText
	},
	{
		label: "Announcements",
		to: "/admin/announcements",
		icon: Megaphone
	},
	{
		label: "Sources",
		to: "/admin/sources",
		icon: Lock
	},
	{
		label: "Audit Log",
		to: "/admin/audit",
		icon: ScrollText
	},
	{
		label: "Settings",
		to: "/admin/settings",
		icon: Settings
	}
];
function Sidebar() {
	const { role, profile, signOut } = useAuth();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const effRole = role && role !== "pending" ? role : "contributor";
	const sections = NAV[effRole];
	const accent = ROLE_ACCENT[effRole];
	const initials = (profile?.name ?? profile?.email ?? "?").slice(0, 1).toUpperCase();
	const [adminOpen, setAdminOpen] = (0, import_react.useState)(pathname.startsWith("/admin"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "w-[260px] shrink-0 flex flex-col bg-surface border-r border-border h-screen sticky top-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-xl bg-foreground flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Diamond, {
						className: "h-5 w-5 text-primary",
						strokeWidth: 2.2
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[13px] font-bold tracking-[0.14em] text-foreground leading-tight",
						children: "DECCAN AI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] tracking-[0.2em] text-muted-foreground",
						children: "TNQ HUB"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 overflow-y-auto px-3 pb-4 space-y-5",
				children: sections.map((section) => section.admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setAdminOpen((s) => !s),
					className: "w-full flex items-center justify-between px-2 mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-primary uppercase",
					children: [section.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: adminOpen ? "−" : "+"
					})]
				}), adminOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-0.5",
					children: ADMIN_SUB.map((item) => {
						const active = pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-accent hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }), item.label]
						}, item.to);
					})
				})] }, section.label) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase",
					children: section.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-0.5",
					children: section.items.map((item) => {
						const active = pathname === item.to || pathname.startsWith(item.to + "/");
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-foreground text-background font-medium" : "text-foreground/80 hover:bg-accent hover:text-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }), item.label]
						}, item.to);
					})
				})] }, section.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-3 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
						style: { background: accent },
						children: initials
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium text-foreground truncate",
							children: profile?.name ?? profile?.email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase",
							children: ROLE_LABEL[effRole]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: signOut,
						className: "text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
					})
				]
			})
		]
	});
}
var TITLES = {
	"/dashboard": "DASHBOARD",
	"/my-learning": "MY LEARNING",
	"/my-playground": "MY PLAYGROUND",
	"/my-progress": "MY PROGRESS",
	"/my-projects": "MY PROJECTS",
	"/my-scores": "MY SCORES",
	"/projects": "ALL PROJECTS",
	"/contributors": "CONTRIBUTOR MANAGEMENT",
	"/quality": "QUALITY OVERVIEW",
	"/onboarding": "ONBOARDING",
	"/learning": "WORKSPACE",
	"/resources": "RESOURCES",
	"/team": "TEAM DIRECTORY",
	"/admin/users": "USERS & ROLES",
	"/admin/grants": "RESOURCE GRANTS",
	"/admin/announcements": "ANNOUNCEMENTS",
	"/admin/sources": "SOURCES",
	"/admin/audit": "AUDIT LOG",
	"/admin/settings": "SETTINGS",
	"/worklog": "WORK LOG"
};
function Topbar() {
	const { role } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "h-[68px] sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border flex items-center justify-between gap-4 px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4 min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-mono text-sm font-bold tracking-[0.2em] text-foreground truncate",
					children: TITLES[useRouterState({ select: (s) => s.location.pathname })] ?? "TNQ HUB"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-border",
					children: "|"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs tracking-[0.2em] text-muted-foreground",
					children: "TNQ_HUB_V1.0"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden md:flex items-center gap-2 h-9 pl-3 pr-2 rounded-full border border-border bg-card text-sm text-muted-foreground shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Quick jump"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/60 text-foreground",
						children: "⌘K"
					})
				]
			}), role && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 h-9 px-3 rounded-full font-mono text-[11px] font-bold tracking-[0.15em] text-white bg-primary shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3.5 w-3.5" }),
					ROLE_LABEL[role],
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-1 h-1.5 w-1.5 rounded-full bg-white/90" })
				]
			})]
		})]
	});
}
function AppShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex w-full bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Topbar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.main, {
				initial: {
					opacity: 0,
					y: 6
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .2 },
				className: "flex-1 px-5 py-6 lg:px-8 overflow-x-hidden",
				children
			})]
		})]
	});
}
function AppLayout() {
	const { loading, session, role, status } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!session) {
			navigate({
				to: "/login",
				replace: true
			});
			return;
		}
		if (status === "suspended") {
			navigate({
				to: "/suspended",
				replace: true
			});
			return;
		}
		if (!role || role === "pending") {
			navigate({
				to: "/pending",
				replace: true
			});
			return;
		}
	}, [
		loading,
		session,
		role,
		status,
		navigate
	]);
	if (loading || !session || !role || role === "pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AppLayout as component };
