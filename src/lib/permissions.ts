import type { Role } from "./auth-state";

export type Permission = "board" | "tables" | "tableManage" | "soldOut" | "menu" | "settings" | "reports" | "accounts";
const permissions: Record<Role, readonly Permission[]> = {
  staff: ["board", "tables", "soldOut"],
  manager: ["board", "tables", "tableManage", "soldOut", "menu", "settings", "reports"],
  owner: ["board", "tables", "tableManage", "soldOut", "menu", "settings", "reports", "accounts"],
};

// UI visibility only; the API is authoritative for authorization.
export const can = (role: Role, permission: Permission) => permissions[role].includes(permission);
