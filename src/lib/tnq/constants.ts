export const DAILY_DOSES = [
  "If it passed TnQ, it probably survived 17 iterations.",
  "Remember: Ctrl + S is self-care.",
  "The audit trail remembers everything. Everything.",
  "final_v2_actual_final.pdf deserves a better name.",
  "Good documentation starts somewhere. Make it start here.",
  "Someone definitely documented it. Probably.",
  "Quality is not a coincidence. But it feels like one.",
  "A well-structured learning path never hurt anyone.",
];

export function pickDailyDose(seed?: string) {
  const s = seed ?? String(Date.now());
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return DAILY_DOSES[Math.abs(h) % DAILY_DOSES.length];
}

export function greeting(d: Date = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDateLong(d: Date = new Date()) {
  return d
    .toLocaleDateString(undefined, {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(",", " •");
}

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "SUPER ADMIN",
  tnq_team: "SME",
  contributor: "CONTRIBUTOR",
  pending: "PENDING",
};

export const ROLE_ACCENT: Record<string, string> = {
  super_admin: "var(--color-role-admin)",
  tnq_team: "var(--color-role-sme)",
  contributor: "var(--color-role-contributor)",
  pending: "var(--color-muted-foreground)",
};
