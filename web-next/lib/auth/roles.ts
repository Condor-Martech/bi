/**
 * UI-side role helpers.
 *
 * The legacy NestJS uses `manager` as the most-privileged role and `admin` as
 * a mid-level operator. The product vocabulary we expose to users INVERTS that:
 * "Admin" = platform owner (legacy `manager`), "Manager" = operator (legacy `admin`).
 *
 * The token claim and every backend guard keep the legacy names — we only
 * translate at the presentation layer.
 */

export type Role = "manager" | "admin" | "user";

const OWNER: Role = "manager";
const OPERATOR: Role = "admin";

export function isOwner(role: Role): boolean {
  return role === OWNER;
}

export function isOperator(role: Role): boolean {
  return role === OPERATOR;
}

export function isPrivileged(role: Role): boolean {
  return role === OWNER || role === OPERATOR;
}

export function roleLabel(role: Role | string | null | undefined): string {
  switch (role) {
    case OWNER:
      return "Administrador";
    case OPERATOR:
      return "Manager";
    case "user":
      return "Usuario";
    default:
      return "Usuario";
  }
}
