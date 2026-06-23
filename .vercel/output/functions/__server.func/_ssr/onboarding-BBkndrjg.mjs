import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-Czyyay-D.mjs";
import { H as CircleCheck, V as Circle } from "../_libs/lucide-react.mjs";
import { c as PageHeader, n as Button, r as Card, t as Badge } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-BBkndrjg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	{
		n: 1,
		title: "Account created",
		desc: "Sign in with Google"
	},
	{
		n: 2,
		title: "SME assigned",
		desc: "Your subject matter expert"
	},
	{
		n: 3,
		title: "Project assigned",
		desc: "Your first project"
	},
	{
		n: 4,
		title: "Learning path started",
		desc: "Begin your training"
	},
	{
		n: 5,
		title: "Ready to contribute",
		desc: "Onboarding complete"
	}
];
function OnboardingPage() {
	const { user } = useAuth();
	const [stage, setStage] = (0, import_react.useState)(1);
	const [status, setStatus] = (0, import_react.useState)("not_started");
	const [loading, setLoading] = (0, import_react.useState)(true);
	async function load() {
		if (!user) return;
		setLoading(true);
		const { data } = await supabase.from("contributors").select("onboarding_stage,onboarding_status").eq("id", user.id).maybeSingle();
		if (data) {
			setStage(data.onboarding_stage);
			setStatus(data.onboarding_status);
		} else await supabase.from("contributors").insert({
			id: user.id,
			onboarding_stage: 1,
			onboarding_status: "not_started"
		});
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [user]);
	async function advance() {
		if (!user) return;
		const next = Math.min(5, stage + 1);
		const ns = next >= 5 ? "complete" : "in_progress";
		await supabase.from("contributors").update({
			onboarding_stage: next,
			onboarding_status: ns
		}).eq("id", user.id);
		setStage(next);
		setStatus(ns);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Onboarding",
		subtitle: "Track your ramp-up",
		right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: status === "complete" ? "success" : "info",
			children: status
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-4",
		children: STAGES.map((s) => {
			const done = stage > s.n || stage === s.n && status === "complete";
			const current = stage === s.n && status !== "complete";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: `flex items-start gap-3 p-3 rounded-lg ${current ? "bg-primary/5 border border-primary/20" : ""}`,
				children: [
					done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-emerald-600 mt-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: `h-5 w-5 mt-0.5 ${current ? "text-primary" : "text-muted-foreground"}` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: s.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: s.desc
						})]
					}),
					current && stage < 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: advance,
						children: "Mark done"
					})
				]
			}, s.n);
		})
	}) })] });
}
//#endregion
export { OnboardingPage as component };
