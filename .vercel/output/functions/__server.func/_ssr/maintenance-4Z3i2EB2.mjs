import { t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as Settings } from "./settings-5CGmtTn0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/maintenance-4Z3i2EB2.js
var import_jsx_runtime = require_jsx_runtime();
function Maintenance() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-14 w-14 rounded-full bg-warning/15 flex items-center justify-center text-warning",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-xl font-semibold text-foreground",
					children: "TnQ Hub is under maintenance"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "We're improving things. Check back shortly."
				})
			]
		})
	});
}
//#endregion
export { Maintenance as component };
