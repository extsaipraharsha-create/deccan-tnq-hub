import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as useNavigate } from "./useNavigate-BaLgIK1y.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { n as useAuth } from "./auth-context-De6z2H4b.mjs";
import { T as motion } from "./proxy-BlRDGjTo.mjs";
import { n as toast } from "./dist-tXmvIPPR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DwQN9zG6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { session, loading } = useAuth();
	const navigate = useNavigate();
	const [signingIn, setSigningIn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading && session) navigate({
			to: "/",
			replace: true
		});
	}, [
		session,
		loading,
		navigate
	]);
	async function handleGoogle() {
		setSigningIn(true);
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: window.location.origin }
			});
			if (error) {
				toast.error("Sign-in failed", { description: error.message });
				setSigningIn(false);
			}
		} catch (e) {
			toast.error("Sign-in failed", { description: e instanceof Error ? e.message : String(e) });
			setSigningIn(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden",
		style: { background: "radial-gradient(ellipse at top, oklch(0.27 0.06 257), oklch(0.16 0.04 257))" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-grid opacity-60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 16,
				scale: .98
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			transition: {
				duration: .35,
				ease: "easeOut"
			},
			className: "relative z-10 w-full max-w-md bg-card rounded-2xl shadow-pop border border-border p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg",
						style: { background: "linear-gradient(135deg, var(--color-role-contributor), var(--color-role-sme))" },
						children: "D"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Deccan AI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-semibold text-foreground -mt-0.5",
						children: "TnQ Hub"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold text-foreground",
					children: "Welcome back"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Sign in with your @deccan.ai account."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
					whileTap: { scale: .98 },
					onClick: handleGoogle,
					disabled: signingIn,
					className: "mt-6 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), signingIn ? "Signing in…" : "Continue with Google"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xs text-muted-foreground text-center",
					children: "Access is restricted to Deccan AI employees."
				})
			]
		})]
	});
}
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "18",
		height: "18",
		viewBox: "0 0 48 48",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FFC107",
				d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FF3D00",
				d: "M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4CAF50",
				d: "M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-2 1.4-4.4 2.2-6.9 2.2-5.3 0-9.7-3-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#1976D2",
				d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5c4.2-3.9 6.9-9.5 6.9-15.7 0-1.2-.1-2.3-.3-2.5z"
			})
		]
	});
}
//#endregion
export { LoginPage as component };
