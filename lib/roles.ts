export const ROLES = {
  admin: "Admin",
  bdm: "Business Development Manager",
  obdm: "Outsourced Business Development Manager",
  sdr: "Sales Development Representative",
  osdr: "Outsourced Sales Development Representative",
  account_manager: "Account Manager",
  service_delivery_manager: "Service Delivery Manager",
  data_engineer: "Data Engineer",
  data_analyst: "Data Analyst",
  data_team_lead: "Data Team Lead",
  sales_team_lead: "Sales Team Lead",
  marketing_strategist: "Marketing Strategist",
  designer: "Designer",
  developer: "Developer",
  content_manager: "Content Manager",
  rev_ops_manager: "Revenue Operations Manager",
  ceo: "CEO",
  finance_manager: "Finance Manager",
  people_ops_manager: "People Operations Manager",
} as const;

export type RoleKey = keyof typeof ROLES;

export const LEARNER_ROLES: RoleKey[] = [
  "bdm", "obdm", "sdr", "osdr", "account_manager", "service_delivery_manager",
  "data_engineer", "data_analyst", "data_team_lead", "sales_team_lead",
  "marketing_strategist", "designer", "developer", "content_manager",
  "rev_ops_manager", "ceo", "finance_manager", "people_ops_manager",
];

export function getRoleLabel(role: string): string {
  return ROLES[role as RoleKey] ?? role;
}
