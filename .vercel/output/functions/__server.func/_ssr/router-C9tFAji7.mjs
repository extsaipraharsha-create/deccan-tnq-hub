import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as AuthProvider } from "./auth-context-Czyyay-D.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C9tFAji7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Cc-Hohmv.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong. Try refreshing or head home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$28 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Deccan AI TnQ Hub" },
			{
				name: "description",
				content: "Internal Training & Quality management platform for Deccan AI."
			},
			{
				property: "og:title",
				content: "Deccan AI TnQ Hub"
			},
			{
				property: "og:description",
				content: "Internal Training & Quality management platform."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$28.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "bottom-right",
			richColors: true
		})] })
	});
}
var $$splitComponentImporter$27 = () => import("./suspended-DcJxl07K.mjs");
var Route$27 = createFileRoute("/suspended")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = () => import("./pending-BnO5FDyE.mjs");
var Route$26 = createFileRoute("/pending")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./maintenance-7YFEHNFq.mjs");
var Route$25 = createFileRoute("/maintenance")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./login-Cey24laX.mjs");
var Route$24 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("../_app-OtQ0-H0J.mjs");
var Route$23 = createFileRoute("/_app")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./routes-B1Xrku0B.mjs");
var Route$22 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./worklog-IE-rnJgK.mjs");
var Route$21 = createFileRoute("/_app/worklog")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./team-BGpMxsgk.mjs");
var Route$20 = createFileRoute("/_app/team")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./resources-u0ZsM342.mjs");
var Route$19 = createFileRoute("/_app/resources")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./quality-bXN4LOcm.mjs");
var Route$18 = createFileRoute("/_app/quality")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./projects-BHBv_0AO.mjs");
var Route$17 = createFileRoute("/_app/projects")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./onboarding-BBkndrjg.mjs");
var Route$16 = createFileRoute("/_app/onboarding")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./newcomers-BPx9GLmj.mjs");
var Route$15 = createFileRoute("/_app/newcomers")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./my-scores-BViEI62s.mjs");
var Route$14 = createFileRoute("/_app/my-scores")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./my-projects-CRnIQlvB.mjs");
var Route$13 = createFileRoute("/_app/my-projects")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./my-progress-BTX3xfxR.mjs");
var Route$12 = createFileRoute("/_app/my-progress")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./my-playground-DAYWm5Kv.mjs");
var Route$11 = createFileRoute("/_app/my-playground")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./my-learning-ClZ3E9dG.mjs");
var Route$10 = createFileRoute("/_app/my-learning")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./learning-CZ_Gb50p.mjs");
var Route$9 = createFileRoute("/_app/learning")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./dashboard-LPRVxKC7.mjs");
var Route$8 = createFileRoute("/_app/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./contributors-A4mNtt_B.mjs");
var Route$7 = createFileRoute("/_app/contributors")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./projects._id-CokpKc75.mjs");
var Route$6 = createFileRoute("/_app/projects/$id")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./users-BRcgEnO9.mjs");
var Route$5 = createFileRoute("/_app/admin/users")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./sources-BLMgPeDP.mjs");
var Route$4 = createFileRoute("/_app/admin/sources")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./settings-Bpq2ocqY.mjs");
var Route$3 = createFileRoute("/_app/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./grants-B52cTzsA.mjs");
var Route$2 = createFileRoute("/_app/admin/grants")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./audit-CsELuyNW.mjs");
var Route$1 = createFileRoute("/_app/admin/audit")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./announcements-BbcCAaX4.mjs");
var Route = createFileRoute("/_app/admin/announcements")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var SuspendedRoute = Route$27.update({
	id: "/suspended",
	path: "/suspended",
	getParentRoute: () => Route$28
});
var PendingRoute = Route$26.update({
	id: "/pending",
	path: "/pending",
	getParentRoute: () => Route$28
});
var MaintenanceRoute = Route$25.update({
	id: "/maintenance",
	path: "/maintenance",
	getParentRoute: () => Route$28
});
var LoginRoute = Route$24.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$28
});
var AppRoute = Route$23.update({
	id: "/_app",
	getParentRoute: () => Route$28
});
var IndexRoute = Route$22.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$28
});
var AppWorklogRoute = Route$21.update({
	id: "/worklog",
	path: "/worklog",
	getParentRoute: () => AppRoute
});
var AppTeamRoute = Route$20.update({
	id: "/team",
	path: "/team",
	getParentRoute: () => AppRoute
});
var AppResourcesRoute = Route$19.update({
	id: "/resources",
	path: "/resources",
	getParentRoute: () => AppRoute
});
var AppQualityRoute = Route$18.update({
	id: "/quality",
	path: "/quality",
	getParentRoute: () => AppRoute
});
var AppProjectsRoute = Route$17.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => AppRoute
});
var AppOnboardingRoute = Route$16.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => AppRoute
});
var AppNewcomersRoute = Route$15.update({
	id: "/newcomers",
	path: "/newcomers",
	getParentRoute: () => AppRoute
});
var AppMyScoresRoute = Route$14.update({
	id: "/my-scores",
	path: "/my-scores",
	getParentRoute: () => AppRoute
});
var AppMyProjectsRoute = Route$13.update({
	id: "/my-projects",
	path: "/my-projects",
	getParentRoute: () => AppRoute
});
var AppMyProgressRoute = Route$12.update({
	id: "/my-progress",
	path: "/my-progress",
	getParentRoute: () => AppRoute
});
var AppMyPlaygroundRoute = Route$11.update({
	id: "/my-playground",
	path: "/my-playground",
	getParentRoute: () => AppRoute
});
var AppMyLearningRoute = Route$10.update({
	id: "/my-learning",
	path: "/my-learning",
	getParentRoute: () => AppRoute
});
var AppLearningRoute = Route$9.update({
	id: "/learning",
	path: "/learning",
	getParentRoute: () => AppRoute
});
var AppDashboardRoute = Route$8.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AppRoute
});
var AppContributorsRoute = Route$7.update({
	id: "/contributors",
	path: "/contributors",
	getParentRoute: () => AppRoute
});
var AppProjectsIdRoute = Route$6.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => AppProjectsRoute
});
var AppAdminUsersRoute = Route$5.update({
	id: "/admin/users",
	path: "/admin/users",
	getParentRoute: () => AppRoute
});
var AppAdminSourcesRoute = Route$4.update({
	id: "/admin/sources",
	path: "/admin/sources",
	getParentRoute: () => AppRoute
});
var AppAdminSettingsRoute = Route$3.update({
	id: "/admin/settings",
	path: "/admin/settings",
	getParentRoute: () => AppRoute
});
var AppAdminGrantsRoute = Route$2.update({
	id: "/admin/grants",
	path: "/admin/grants",
	getParentRoute: () => AppRoute
});
var AppAdminAuditRoute = Route$1.update({
	id: "/admin/audit",
	path: "/admin/audit",
	getParentRoute: () => AppRoute
});
var AppAdminAnnouncementsRoute = Route.update({
	id: "/admin/announcements",
	path: "/admin/announcements",
	getParentRoute: () => AppRoute
});
var AppProjectsRouteChildren = { AppProjectsIdRoute };
var AppRouteChildren = {
	AppContributorsRoute,
	AppDashboardRoute,
	AppLearningRoute,
	AppMyLearningRoute,
	AppMyPlaygroundRoute,
	AppMyProgressRoute,
	AppMyProjectsRoute,
	AppMyScoresRoute,
	AppNewcomersRoute,
	AppOnboardingRoute,
	AppProjectsRoute: AppProjectsRoute._addFileChildren(AppProjectsRouteChildren),
	AppQualityRoute,
	AppResourcesRoute,
	AppTeamRoute,
	AppWorklogRoute,
	AppAdminAnnouncementsRoute,
	AppAdminAuditRoute,
	AppAdminGrantsRoute,
	AppAdminSettingsRoute,
	AppAdminSourcesRoute,
	AppAdminUsersRoute
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren),
	LoginRoute,
	MaintenanceRoute,
	PendingRoute,
	SuspendedRoute
};
var routeTree = Route$28._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
