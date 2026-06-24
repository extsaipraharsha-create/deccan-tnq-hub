import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as useNavigate } from "./useNavigate-BaLgIK1y.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CU6TULYy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Index() {
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
		navigate({
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
		className: "min-h-screen flex items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" })
	});
}
//#endregion
export { Index as component };
