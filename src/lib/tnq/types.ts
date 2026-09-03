export type AppRole = "super_admin" | "tnq_team" | "deccan_team" | "contributor" | "pending";

// Roles that get the same access as "tnq_team" (full working-team access,
// minus the Admin Console). Route every access check through this instead
// of comparing to "tnq_team" directly, so a role added here takes effect
// everywhere at once.
export function isTeamRole(role: AppRole | null | undefined): boolean {
  return role === "tnq_team" || role === "deccan_team";
}
export type UserStatus = "active" | "suspended" | "pending";

export interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  photo_url: string | null;
  first_login: boolean;
}

export interface RoleRow {
  user_id: string;
  role: AppRole;
  status: UserStatus;
  assigned_sme_id: string | null;
}
