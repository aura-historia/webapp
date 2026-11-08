import { useEffect, useState } from "react";
import type { OwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";

/**
 * Whether a consent that needs a provider should show the no-provider panel. Only a settled,
 * complete and empty grant read counts: not a pending or failed read, and not a first page with
 * more pages behind it. The empty state is remembered for the visit, so a failed check keeps the
 * panel and a grant that arrives later is announced.
 */
export function useNoProviderState(requiresProvider: boolean, listingSources: OwnListingSources) {
    const isConfirmedEmpty =
        requiresProvider &&
        !listingSources.isPending &&
        !listingSources.isError &&
        listingSources.sources.length === 0 &&
        !listingSources.hasMore;
    const [sawNoProvider, setSawNoProvider] = useState(false);
    useEffect(() => {
        if (isConfirmedEmpty) setSawNoProvider(true);
    }, [isConfirmedEmpty]);

    const checkFailed = sawNoProvider && requiresProvider && listingSources.isError;
    return {
        /** Show the no-provider panel instead of permissions and provider choice. */
        showPanel: isConfirmedEmpty || checkFailed,
        /** The last check could not read the providers; the panel shows an alert. */
        checkFailed,
        /** The account had no provider earlier in this visit and has one now. */
        gainedAccess: sawNoProvider && listingSources.sources.length > 0,
    };
}
