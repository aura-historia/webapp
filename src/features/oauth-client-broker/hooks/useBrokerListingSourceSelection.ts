import { useState } from "react";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";

interface Selection {
    readonly transactionId: string;
    readonly listingSourceId: string | undefined;
}

/**
 * The source chosen for one transaction. A choice made for another transaction is never reused,
 * and a choice counts only while its source is among the loaded grants.
 */
export function useBrokerListingSourceSelection(
    transactionId: string,
    listingSources: readonly OAuthListingSource[],
    hasMoreListingSources: boolean,
) {
    const [selection, setSelection] = useState<Selection>({
        transactionId,
        listingSourceId: undefined,
    });
    if (selection.transactionId !== transactionId) {
        setSelection({ transactionId, listingSourceId: undefined });
    }

    const hasOnlyListingSource = listingSources.length === 1 && !hasMoreListingSources;
    const selectedListingSource =
        selection.transactionId === transactionId && selection.listingSourceId
            ? listingSources.find((source) => source.listingSourceId === selection.listingSourceId)
            : undefined;
    const listingSource = hasOnlyListingSource ? listingSources[0] : selectedListingSource;

    return {
        listingSource,
        hasOnlyListingSource,
        selectListingSource: (listingSourceId: string) =>
            setSelection({ transactionId, listingSourceId }),
    };
}
