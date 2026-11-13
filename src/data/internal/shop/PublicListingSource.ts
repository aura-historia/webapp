import type { PublicListingSourceData } from "@/client";

/** Public, allowlisted presentation fields for an indexed listing source. */
export type PublicListingSource = {
    readonly listingSourceId: string;
    readonly slugId: string;
    readonly name: string;
    readonly operatorName: string;
    /** Whether the operator has an active Aura Historia partnership. */
    readonly partner: boolean;
    readonly image?: string;
    /** The source's own address. Use it where the canonical address is meant, never as an outbound link. */
    readonly url?: string;
    /**
     * The link to send visitors to: the source's affiliate link, or `url` with Aura's UTM
     * parameters. The backend derives it and sends it exactly when `url` is present.
     */
    readonly viewUrl?: string;
};

export function mapPublicListingSource(data: PublicListingSourceData): PublicListingSource {
    return {
        listingSourceId: data.listingSourceId,
        slugId: data.listingSourceSlugId,
        name: data.name,
        operatorName: data.operator.name,
        partner: data.operator.partner,
        image: data.image,
        url: data.url,
        viewUrl: data.viewUrl,
    };
}
