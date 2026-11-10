import type { AdminOAuthClientFilters } from "@/data/internal/admin/AdminOAuthClient.ts";

function searchString(search: Record<string, unknown>, key: string): string | undefined {
    const value = search[key];
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/** Reads the directory's URL filters: a client name fragment and an exact client ID. */
export function validateAdminOAuthClientSearch(
    search: Record<string, unknown>,
): AdminOAuthClientFilters {
    const name = searchString(search, "name");
    const clientId = searchString(search, "clientId");
    return {
        ...(name ? { name } : {}),
        ...(clientId ? { clientId } : {}),
    };
}

export function hasAdminOAuthClientFilters(filters: AdminOAuthClientFilters): boolean {
    return Boolean(filters.name || filters.clientId);
}
