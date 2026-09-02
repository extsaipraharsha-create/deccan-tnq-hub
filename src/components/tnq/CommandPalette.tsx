import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FolderKanban, User, CornerDownLeft, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/tnq/auth-context";
import { NAV, ADMIN_SUB, type IconType } from "./Sidebar";
import type { AppRole } from "@/lib/tnq/types";

type PaletteItem = {
  id: string;
  label: string;
  sublabel?: string;
  group: "Pages" | "Projects" | "People";
  icon: IconType;
  to: string;
};

type ProjectRow = { id: string; name: string; emoji_icon: string | null };
type ProfileRow = { id: string; name: string | null; email: string | null };

export function CommandPalette() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [people, setPeople] = useState<ProfileRow[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("tnq:cmdk_open", onOpen);
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("tnq:cmdk_open", onOpen);
      window.removeEventListener("keydown", onKeydown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 10);
    if (projects === null) {
      supabase
        .from("projects")
        .select("id,name,emoji_icon")
        .then(({ data }) => setProjects((data as ProjectRow[]) ?? []));
    }
    if (people === null) {
      supabase
        .from("profiles")
        .select("id,name,email")
        .then(({ data }) => setPeople((data as ProfileRow[]) ?? []));
    }
  }, [open, projects, people]);

  const pageItems: PaletteItem[] = useMemo(() => {
    const effRole: AppRole = role && role !== "pending" ? role : "contributor";
    const items: PaletteItem[] = [];
    for (const section of NAV[effRole]) {
      if (section.admin) {
        for (const it of ADMIN_SUB) {
          items.push({ id: it.to, label: it.label, group: "Pages", icon: it.icon, to: it.to });
        }
        continue;
      }
      for (const it of section.items) {
        items.push({ id: it.to, label: it.label, group: "Pages", icon: it.icon, to: it.to });
      }
    }
    return items;
  }, [role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const projectItems: PaletteItem[] = (projects ?? []).map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      sublabel: p.emoji_icon ?? undefined,
      group: "Projects",
      icon: FolderKanban,
      to: `/projects/${p.id}`,
    }));
    const peopleItems: PaletteItem[] = (people ?? []).map((p) => ({
      id: `person-${p.id}`,
      label: p.name ?? p.email ?? "Unnamed",
      sublabel: p.email ?? undefined,
      group: "People",
      icon: User,
      to: `/team?q=${encodeURIComponent(p.name ?? p.email ?? "")}`,
    }));

    if (!q) return pageItems.slice(0, 8);

    const all = [...pageItems, ...projectItems, ...peopleItems];
    return all
      .filter(
        (it) => it.label.toLowerCase().includes(q) || (it.sublabel ?? "").toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [query, pageItems, projects, people]);

  function select(item: PaletteItem) {
    setOpen(false);
    if (item.group === "People") {
      window.location.href = item.to;
    } else {
      navigate({ to: item.to });
    }
  }

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) select(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[14vh] p-4 bg-foreground/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-pop overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Jump to a page, project, or person…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/60 text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nothing matches “{query}”
                </div>
              ) : (
                results.map((item, i) => {
                  const showHeader = item.group !== lastGroup;
                  lastGroup = item.group;
                  const Icon = item.icon;
                  return (
                    <div key={item.id}>
                      {showHeader && (
                        <div className="px-4 pt-2 pb-1 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                          {item.group}
                        </div>
                      )}
                      <button
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => select(item)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                          i === activeIndex
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        {item.group === "Projects" && item.sublabel ? (
                          <span className="h-4 w-4 shrink-0 text-center leading-none">
                            {item.sublabel}
                          </span>
                        ) : (
                          <Icon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="flex-1 truncate font-medium">{item.label}</span>
                        {item.group === "People" && item.sublabel && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.sublabel}
                          </span>
                        )}
                        {i === activeIndex && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> Navigate ↑↓
              </span>
              <span>Select ↵</span>
              <span>Close esc</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
