import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import {
    PartyLocationRequestError,
    type PartyLocationScope,
    usePartyLocationList,
} from "../api/usePartyLocations.ts";
import { formatPartyLocationRegion } from "../lib/partyLocationSummary.ts";
import { PartyLocationLifecycleBadge } from "./PartyLocationLifecycleBadge.tsx";

/** Paginated list of every site of one Party, active and retired. */
export function PartyLocationList({
    scope,
    selectedId,
    onSelect,
}: {
    readonly scope: PartyLocationScope;
    readonly selectedId?: string;
    readonly onSelect: (locationId: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const query = usePartyLocationList(scope);
    const accessLost = query.error instanceof PartyLocationRequestError && query.error.isAccessLoss;
    // Lost access hides previously loaded protected content instead of showing it beside the error.
    const locations = accessLost ? [] : (query.data?.pages.flatMap((page) => page.items) ?? []);

    if (query.error && locations.length === 0) {
        return (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{query.error.message}</p>
                <Button type="button" variant="outline" onClick={() => query.refetch()}>
                    {t("partyLocations.actions.retry")}
                </Button>
            </div>
        );
    }
    if (query.isPending) {
        return (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("partyLocations.list.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                ))}
            </div>
        );
    }
    if (locations.length === 0) {
        return <p className="py-6 text-muted-foreground">{t("partyLocations.list.empty")}</p>;
    }

    return (
        <div className="grid gap-3">
            <ul className="grid gap-2" aria-label={t("partyLocations.list.label")}>
                {locations.map((location) => (
                    <li key={location.id}>
                        <button
                            type="button"
                            aria-current={location.id === selectedId ? "true" : undefined}
                            onClick={() => onSelect(location.id)}
                            className={cn(
                                "grid w-full gap-1 border bg-surface-container-low p-3 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring",
                                location.id === selectedId && "border-primary bg-surface-container",
                            )}
                        >
                            <span className="flex flex-wrap items-center justify-between gap-2">
                                <span className="break-words font-medium">{location.label}</span>
                                <PartyLocationLifecycleBadge lifecycle={location.lifecycle} />
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {formatPartyLocationRegion(location, i18n.language, t)}
                            </span>
                            {location.roles.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    {location.roles
                                        .map((role) => t(`partyLocations.roles.${role}`))
                                        .join(" · ")}
                                </span>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
            {query.error && (
                <p role="alert" className="text-sm text-destructive">
                    {query.error.message}
                </p>
            )}
            {query.hasNextPage && (
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-center"
                    disabled={query.isFetchingNextPage}
                    onClick={() => query.fetchNextPage()}
                >
                    {query.isFetchingNextPage
                        ? t("partyLocations.list.loadingMore")
                        : t("partyLocations.list.loadMore")}
                </Button>
            )}
        </div>
    );
}
