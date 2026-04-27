import type { UserRoleData } from "@/client";

export const USER_ROLES = ["USER", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function parseUserRole(role?: string): UserRole {
    const upper = role?.toUpperCase() ?? "USER";
    return upper === "ADMIN" ? "ADMIN" : "USER";
}

export function mapToBackendUserRole(role: UserRole): UserRoleData {
    return role;
}
