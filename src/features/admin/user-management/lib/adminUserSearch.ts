import type { AdminSearchUsersData } from "@/client";
import type {
    AdminUserRole,
    AdminUserSortField,
    AdminUserTier,
} from "@/data/internal/admin/AdminUser.ts";

export const ADMIN_USER_SORT_FIELDS = [
    "name",
    "email",
    "firstName",
    "lastName",
    "tier",
    "role",
    "created",
    "updated",
] as const satisfies readonly AdminUserSortField[];
export const ADMIN_USER_ROLES = ["USER", "ADMIN"] as const satisfies readonly AdminUserRole[];
export const ADMIN_USER_TIERS = [
    "FREE",
    "PRO",
    "ULTIMATE",
] as const satisfies readonly AdminUserTier[];
export const ADMIN_USER_PAGE_SIZE = 21;

export type AdminUserSortOrder = "asc" | "desc";

export type AdminUserFilters = {
    readonly query?: string;
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly tier?: readonly AdminUserTier[];
    readonly role?: readonly AdminUserRole[];
    readonly createdFrom?: string;
    readonly createdTo?: string;
    readonly updatedFrom?: string;
    readonly updatedTo?: string;
    readonly sort: AdminUserSortField;
    readonly order: AdminUserSortOrder;
};

export type AdminUserRouteSearch = AdminUserFilters & {
    readonly userId?: string;
};

export const DEFAULT_ADMIN_USER_FILTERS: AdminUserFilters = {
    sort: "name",
    order: "asc",
};

const validSorts = new Set<string>(ADMIN_USER_SORT_FIELDS);
const validRoles = new Set<string>(ADMIN_USER_ROLES);
const validTiers = new Set<string>(ADMIN_USER_TIERS);

function searchString(search: Record<string, unknown>, key: string): string | undefined {
    const value = search[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function searchEnumArray<T extends string>(
    search: Record<string, unknown>,
    key: string,
    allowed: Set<string>,
): T[] | undefined {
    const raw = search[key];
    const values = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
    const selected = values.filter(
        (value): value is T => typeof value === "string" && allowed.has(value),
    );
    return selected.length > 0 ? [...new Set(selected)] : undefined;
}

export function isAdminUserCalendarDay(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year ?? 0, (month ?? 1) - 1, day ?? 1);
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === (month ?? 1) - 1 &&
        date.getUTCDate() === day
    );
}

function searchCalendarDay(search: Record<string, unknown>, key: string): string | undefined {
    const value = searchString(search, key);
    return value && isAdminUserCalendarDay(value) ? value : undefined;
}

export function validateAdminUserSearch(search: Record<string, unknown>): AdminUserRouteSearch {
    const sort = searchString(search, "sort");
    const order = searchString(search, "order");
    const userId = searchString(search, "userId");

    return {
        ...DEFAULT_ADMIN_USER_FILTERS,
        query: searchString(search, "query"),
        email: searchString(search, "email"),
        firstName: searchString(search, "firstName"),
        lastName: searchString(search, "lastName"),
        tier: searchEnumArray<AdminUserTier>(search, "tier", validTiers),
        role: searchEnumArray<AdminUserRole>(search, "role", validRoles),
        createdFrom: searchCalendarDay(search, "createdFrom"),
        createdTo: searchCalendarDay(search, "createdTo"),
        updatedFrom: searchCalendarDay(search, "updatedFrom"),
        updatedTo: searchCalendarDay(search, "updatedTo"),
        sort: sort && validSorts.has(sort) ? (sort as AdminUserSortField) : "name",
        order: order === "desc" ? "desc" : "asc",
        userId,
    };
}

function asRfc3339Bound(day: string | undefined, end: boolean): string | undefined {
    if (!day || !isAdminUserCalendarDay(day)) return undefined;
    return `${day}T${end ? "23:59:59.999" : "00:00:00.000"}Z`;
}

/** Maps route filters to only the declared adminSearchUsers query parameters. */
export function mapToAdminUserSearchQuery(
    filters: AdminUserFilters,
    searchAfter?: string,
): NonNullable<AdminSearchUsersData["query"]> {
    return {
        size: ADMIN_USER_PAGE_SIZE,
        ...(filters.query?.trim() && { query: filters.query.trim() }),
        ...(filters.email?.trim() && { email: filters.email.trim() }),
        ...(filters.firstName?.trim() && { firstName: filters.firstName.trim() }),
        ...(filters.lastName?.trim() && { lastName: filters.lastName.trim() }),
        ...(filters.tier?.length && { tier: [...filters.tier] }),
        ...(filters.role?.length && { role: [...filters.role] }),
        ...(asRfc3339Bound(filters.createdFrom, false) && {
            "created[min]": asRfc3339Bound(filters.createdFrom, false),
        }),
        ...(asRfc3339Bound(filters.createdTo, true) && {
            "created[max]": asRfc3339Bound(filters.createdTo, true),
        }),
        ...(asRfc3339Bound(filters.updatedFrom, false) && {
            "updated[min]": asRfc3339Bound(filters.updatedFrom, false),
        }),
        ...(asRfc3339Bound(filters.updatedTo, true) && {
            "updated[max]": asRfc3339Bound(filters.updatedTo, true),
        }),
        sort: filters.sort,
        order: filters.order,
        ...(searchAfter !== undefined && { searchAfter }),
    };
}

export function withoutAdminUserSelection(search: AdminUserRouteSearch): AdminUserFilters {
    const { userId: _userId, ...filters } = search;
    return filters;
}
