import { t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/suspended-DZrFeoDj.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Ban = createLucideIcon("ban", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "M4.929 4.929 19.07 19.071",
	key: "196cmz"
}]]);
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
