import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BOZcJ6jf.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { m as Save, x as Megaphone } from "../_libs/lucide-react.mjs";
import { c as PageHeader, f as Textarea, i as EmptyState, n as Button, r as Card } from "./ui-BU3fdnmk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/announcements-BbcCAaX4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AnnouncementsPage() {
	const [text, setText] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [savedAt, setSavedAt] = (0, import_react.useState)(null);
	async function load() {
		setLoading(true);
		const { data } = await supabase.from("settings").select("*").eq("key", "announcement").maybeSingle();
		setText(data?.value ?? "");
		setLoading(false);
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function save() {
		setSaving(true);
		await supabase.from("settings").upsert({
			key: "announcement",
			value: text
		}, { onConflict: "key" });
		setSaving(false);
		setSavedAt((/* @__PURE__ */ new Date()).toLocaleTimeString());
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Admin · Announcements",
		subtitle: "The current announcement appears on every dashboard."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			value: text,
			onChange: (e) => setText(e.target.value),
			placeholder: "Write a short announcement. Leave blank to clear.",
			className: "min-h-[140px]"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: savedAt && `Saved at ${savedAt}`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: save,
				disabled: saving,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }),
					" ",
					saving ? "Saving…" : "Save"
				]
			})]
		}),
		!text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-10 w-10" }),
			title: "No announcement yet",
			subtitle: "Add one above to broadcast to the team."
		})
	] }) })] });
}
//#endregion
export { AnnouncementsPage as component };
