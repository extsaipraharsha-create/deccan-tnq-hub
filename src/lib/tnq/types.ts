export type AppRole = "super_admin" | "tnq_team" | "contributor" | "pending";
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
