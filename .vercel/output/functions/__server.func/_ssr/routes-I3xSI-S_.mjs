import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Vm_M2PsG.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-I3xSI-S_.js
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
