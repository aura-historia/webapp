import type { ShopType } from "@/data/internal/shop/ShopType.ts";

export const EDITABLE_SHOP_TYPES = [
    "AUCTION_HOUSE",
    "AUCTION_PLATFORM",
    "COMMERCIAL_DEALER",
    "MARKETPLACE",
] as const satisfies readonly ShopType[];

export type EditableShopType = (typeof EDITABLE_SHOP_TYPES)[number];

export function normalizeShopDomain(domain: string): string {
    const trimmed = domain.trim().toLowerCase();

    if (trimmed === "") {
        return "";
    }

    const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
    const withoutWww = withoutScheme.replace(/^www\./, "");
    const [withoutPathOrQuery = ""] = withoutWww.split(/[/?#]/, 1);

    return withoutPathOrQuery.replace(/:\d+$/, "");
}

export function parseShopDomains(input: string): string[] {
    const seen = new Set<string>();

    return input
        .split(/[\s,;\n]+/)
        .map(normalizeShopDomain)
        .filter((domain) => {
            if (domain === "" || seen.has(domain)) {
                return false;
            }

            seen.add(domain);
            return true;
        });
}
