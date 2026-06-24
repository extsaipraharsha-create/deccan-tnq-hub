import { o as __toESM } from "./chunk-CNf5ZN-e.mjs";
import { n as require_react, t as require_jsx_runtime } from "./jsx-runtime-BIM3nkd3.mjs";
import { t as supabase } from "./client-DS55tWNo.mjs";
import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
import { t as Megaphone } from "./megaphone-BFUfxzKo.mjs";
import { c as PageHeader, f as Textarea, i as EmptyState, n as Button, r as Card } from "./ui-BR57aP_a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/announcements-CvCWDZcF.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Save = createLucideIcon("save", [
	["path", {
		d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
		key: "1c8476"
	}],
	["path", {
		d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
		key: "1ydtos"
	}],
	["path", {
		d: "M7 3v4a1 1 0 0 0 1 1h7",
		key: "t51u73"
	}]
]);
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
