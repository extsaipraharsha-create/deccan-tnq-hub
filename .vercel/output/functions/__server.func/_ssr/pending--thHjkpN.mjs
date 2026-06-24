import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as useNavigate } from "./useNavigate-BaLgIK1y.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pending--thHjkpN.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Hourglass = createLucideIcon("hourglass", [
	["path", {
		d: "M5 22h14",
		key: "ehvnwv"
	}],
	["path", {
		d: "M5 2h14",
		key: "pdyrp9"
	}],
	["path", {
		d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",
		key: "1d314k"
	}],
	["path", {
		d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",
		key: "1vvvr6"
	}]
]);
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
