import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as AnimatePresence, i as motion, n as useTransform, r as useMotionValue, t as animate } from "../_libs/framer-motion.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-BU3fdnmk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Button({ variant = "primary", size = "md", className = "", children, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: `inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none ${{
			sm: "h-8 px-3 text-xs",
			md: "h-9 px-4 text-sm"
		}[size]} ${{
			primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
			secondary: "bg-card text-foreground border border-border hover:bg-accent",
			ghost: "text-foreground hover:bg-accent",
			danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
		}[variant]} ${className}`,
		...rest,
		children
	});
}
function Input(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: `h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className ?? ""}`
	});
}
function Textarea(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: `min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className ?? ""}`
	});
}
function Select(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: `h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className ?? ""}`
	});
}
function Field({ label, children, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase",
				children: label
			}),
			children,
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function Badge({ children, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded ${{
			default: "bg-foreground text-background",
			success: "bg-emerald-100 text-emerald-800",
			warn: "bg-amber-100 text-amber-800",
			danger: "bg-rose-100 text-rose-800",
			info: "bg-sky-100 text-sky-800",
			admin: "bg-primary text-primary-foreground",
			sme: "bg-orange-100 text-orange-800",
			contributor: "bg-violet-100 text-violet-800"
		}[tone]}`,
		children
	});
}
function Modal({ open, onClose, title, children, footer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			className: "w-full max-w-lg bg-card border border-border rounded-2xl shadow-pop overflow-hidden",
			initial: {
				opacity: 0,
				scale: .96,
				y: 8
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				scale: .96
			},
			transition: { duration: .16 },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-3 border-b border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-5 space-y-4 max-h-[70vh] overflow-y-auto",
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 py-3 border-t border-border bg-muted/30 flex justify-end gap-2",
					children: footer
				})
			]
		})
	}) });
}
function Card({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `bg-card border border-border rounded-2xl p-6 shadow-soft ${className}`,
		children
	});
}
function StatCard({ label, value, suffix }) {
	const isNum = typeof value === "number";
	const mv = useMotionValue(0);
	const rounded = useTransform(mv, (v) => Math.round(v).toString().padStart(2, "0"));
	(0, import_react.useEffect)(() => {
		if (!isNum) return;
		const controls = animate(mv, value, {
			duration: .9,
			ease: "easeOut"
		});
		return () => controls.stop();
	}, [
		value,
		isNum,
		mv
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-card border border-border rounded-2xl p-5 shadow-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-baseline gap-2",
			children: [isNum ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				className: "font-digital text-5xl text-foreground",
				children: rounded
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-digital text-5xl text-foreground",
				children: value
			}), suffix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tracking-wider text-muted-foreground uppercase",
				children: suffix
			})]
		})]
	});
}
function EmptyState({ title, subtitle, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center py-16 px-6",
		children: [
			icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mb-4 h-12 w-12 text-muted-foreground/60 flex items-center justify-center",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold text-foreground",
				children: title
			}),
			subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground max-w-md mx-auto",
				children: subtitle
			})
		]
	});
}
function PageHeader({ title, subtitle, right, eyebrow }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-8 flex items-start justify-between gap-4 flex-wrap",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-sm text-primary mb-1",
					children: eyebrow
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl sm:text-5xl font-bold tracking-tight text-foreground",
					children: title
				}),
				subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: subtitle
				})
			]
		}), right]
	});
}
function StatusPill({ items }) {
	const dot = {
		ok: "bg-emerald-500",
		warn: "bg-amber-500",
		off: "bg-muted-foreground"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-card border border-border rounded-full shadow-soft px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-2",
		children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.16em] text-foreground/80 uppercase",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full ${dot[it.tone ?? "ok"]}` }), it.label]
		}, it.label))
	});
}
//#endregion
export { Field as a, PageHeader as c, StatusPill as d, Textarea as f, EmptyState as i, Select as l, Button as n, Input as o, Card as r, Modal as s, Badge as t, StatCard as u };
