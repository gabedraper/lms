export const ROLES = {
  admin: "Admin",
  bdm: "Business Development Manager",
  obdm: "Outsourced BDM",
  sdr: "Sales Development Representative",
} as const;

export type RoleKey = keyof typeof ROLES;

export const LEARNER_ROLES: RoleKey[] = ["bdm", "obdm", "sdr"];

export function getRoleLabel(role: string): string {
  return ROLES[role as RoleKey] ?? role;
}
