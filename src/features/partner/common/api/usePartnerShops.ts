import { useOwnListingSources } from "./useOwnListingSources.ts";

/** @deprecated MIG-13 replaces the remaining custom-integration shop identifiers and examples. */
export interface PartnerShop {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
}

/** @deprecated Compatibility adapter for the custom-integration page, owned by MIG-13. */
export function usePartnerShops(enabled: boolean) {
    const query = useOwnListingSources(enabled);
    return {
        ...query,
        data:
            enabled && query.isSuccess
                ? query.data.map(
                      (source): PartnerShop => ({
                          shopId: source.listingSourceId,
                          shopSlugId: source.listingSourceSlugId,
                          name: source.name,
                      }),
                  )
                : undefined,
    };
}
