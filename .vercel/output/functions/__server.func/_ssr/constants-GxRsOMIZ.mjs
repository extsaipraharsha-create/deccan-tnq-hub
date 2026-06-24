import { t as createLucideIcon } from "./createLucideIcon-CPmCm4NB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/constants-GxRsOMIZ.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BookOpen = createLucideIcon("book-open", [["path", {
	d: "M12 7v14",
	key: "1akyts"
}], ["path", {
	d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
	key: "ruj8y"
}]]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ClipboardCheck = createLucideIcon("clipboard-check", [
	["rect", {
		width: "8",
		height: "4",
		x: "8",
		y: "2",
		rx: "1",
		ry: "1",
		key: "tgr4d6"
	}],
	["path", {
		d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
		key: "116196"
	}],
	["path", {
		d: "m9 14 2 2 4-4",
		key: "df797q"
	}]
]);
var DAILY_DOSES = [
	"If it passed TnQ, it probably survived 17 iterations.",
	"Remember: Ctrl + S is self-care.",
	"The audit trail remembers everything. Everything.",
	"final_v2_actual_final.pdf deserves a better name.",
	"Good documentation starts somewhere. Make it start here.",
	"Someone definitely documented it. Probably.",
	"Quality is not a coincidence. But it feels like one.",
	"A well-structured learning path never hurt anyone."
];
function pickDailyDose(seed) {
	const s = seed ?? String(Date.now());
	let h = 0;
	for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
	return DAILY_DOSES[Math.abs(h) % DAILY_DOSES.length];
}
function greeting(d = /* @__PURE__ */ new Date()) {
	const h = d.getHours();
	if (h < 12) return "Good morning";
	if (h < 18) return "Good afternoon";
	return "Good evening";
}
var ROLE_LABEL = {
	super_admin: "SUPER ADMIN",
	tnq_team: "SME",
	contributor: "CONTRIBUTOR",
	pending: "PENDING"
};
var ROLE_ACCENT = {
	super_admin: "var(--color-role-admin)",
	tnq_team: "var(--color-role-sme)",
	contributor: "var(--color-role-contributor)",
	pending: "var(--color-muted-foreground)"
};
//#endregion
export { greeting as a, ROLE_LABEL as i, ClipboardCheck as n, pickDailyDose as o, ROLE_ACCENT as r, BookOpen as t };
