import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { Y as Ban } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/suspended-D-HdApF2.js
var import_jsx_runtime = require_jsx_runtime();
function Suspended() {
	const { signOut } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-14 w-14 rounded-full bg-destructive/15 flex items-center justify-center text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-xl font-semibold text-foreground",
					children: "Account Suspended"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Your account has been suspended. Contact an administrator."
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
export { Suspended as component };
