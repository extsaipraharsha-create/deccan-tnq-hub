import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  useEffect,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
    secondary: "bg-card text-foreground border border-border hover:bg-accent",
    ghost: "text-foreground hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className ?? ""}`}
    />
  );
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[80px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className ?? ""}`}
    />
  );
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${props.className ?? ""}`}
    />
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warn" | "danger" | "info" | "admin" | "sme" | "contributor";
}) {
  const tones: Record<string, string> = {
    default: "bg-foreground text-background",
    success: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
    admin: "bg-primary text-primary-foreground",
    sme: "bg-orange-100 text-orange-800",
    contributor: "bg-violet-100 text-violet-800",
  };
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] font-bold tracking-[0.14em] px-2 py-1 rounded ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-pop overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="font-mono text-xs font-bold tracking-[0.18em] text-foreground uppercase">
                {title}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && (
              <div className="px-5 py-3 border-t border-border bg-muted/30 flex justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  suffix,
}: {
  icon?: ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  accent?: string;
}) {
  const isNum = typeof value === "number";
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString().padStart(2, "0"));

  useEffect(() => {
    if (!isNum) return;
    const controls = animate(mv, value as number, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, isNum, mv]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
      <div className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        {isNum ? (
          <motion.span className="font-digital text-5xl text-foreground">{rounded}</motion.span>
        ) : (
          <span className="font-digital text-5xl text-foreground">{value}</span>
        )}
        {suffix && (
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      {icon && (
        <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        {eyebrow && <div className="font-mono text-sm text-primary mb-1">{eyebrow}</div>}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatusPill({
  items,
}: {
  items: { label: string; tone?: "ok" | "warn" | "off" }[];
}) {
  const dot: Record<string, string> = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    off: "bg-muted-foreground",
  };
  return (
    <div className="bg-card border border-border rounded-full shadow-soft px-6 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.16em] text-foreground/80 uppercase"
        >
          <span className={`h-2 w-2 rounded-full ${dot[it.tone ?? "ok"]}`} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
