import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { k as Hourglass } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pending-Cub1eKCf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Pending() {
	const { loading, session, role, status, signOut } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!session) navigate({
			to: "/login",
			replace: true
		});
		else if (status === "suspended") navigate({
			to: "/suspended",
			replace: true
		});
		else if (role && role !== "pending") navigate({
			to: "/dashboard",
			replace: true
		});
	}, [
		loading,
		session,
		role,
		status,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-14 w-14 rounded-full bg-warning/15 flex items-center justify-center text-warning",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hourglass, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-xl font-semibold text-foreground",
					children: "Access Pending"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Your account has been created but hasn't been granted access yet. Contact a TnQ admin."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: signOut,
					className: "mt-6 rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted",
					children: "Sign out"
				})
			]
		})
	});
}
//#endregion
export { Pending as component };
