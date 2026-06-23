import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-Czyyay-D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Ctx = (0, import_react.createContext)(void 0);
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [role, setRole] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	async function loadFor(userId) {
		const [{ data: r }, { data: p }] = await Promise.all([supabase.from("user_roles").select("role,status,assigned_sme_id,user_id").eq("user_id", userId).maybeSingle(), supabase.from("profiles").select("*").eq("id", userId).maybeSingle()]);
		const role = r?.role ?? "pending";
		const status = r?.status ?? "pending";
		setRole(role);
		setStatus(status);
		setProfile(p);
	}
	async function refresh() {
		const { data } = await supabase.auth.getSession();
		setSession(data.session);
		if (data.session?.user) await loadFor(data.session.user.id);
		else {
			setRole(null);
			setStatus(null);
			setProfile(null);
		}
	}
	(0, import_react.useEffect)(() => {
		let mounted = true;
		(async () => {
			const { data } = await supabase.auth.getSession();
			setSession(data.session);
			if (data.session?.user) await loadFor(data.session.user.id);
			else {
				setRole(null);
				setStatus(null);
				setProfile(null);
			}
			if (mounted) setLoading(false);
		})();
		const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
			if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
				setSession(sess);
				if (sess?.user) loadFor(sess.user.id);
			}
			if (event === "SIGNED_OUT") {
				setSession(null);
				setRole(null);
				setStatus(null);
				setProfile(null);
				setLoading(false);
			}
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	async function signOut() {
		await supabase.auth.signOut();
		setSession(null);
		setRole(null);
		setStatus(null);
		setProfile(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			loading,
			session,
			user: session?.user ?? null,
			role,
			status,
			profile,
			refresh,
			signOut
		},
		children
	});
}
function useAuth() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
	return v;
}
//#endregion
export { useAuth as n, AuthProvider as t };
