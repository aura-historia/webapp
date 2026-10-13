import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    PartyLocationRequestError,
    type PartyLocationScope,
    usePartyLocationList,
} from "../api/usePartyLocations.ts";
import { formatPartyLocationRegion } from "../lib/partyLocationSummary.ts";

/**
 * Chooses one active location of a Party, for example as a listing-source default. Retired
 * locations are not offered. Nothing is preselected: callers keep the current choice in `value`.
 */
export function PartyLocationSelector({
    scope,
    name,
    legend,
    value,
    onChange,
    disabled = false,
}: {
    readonly scope: PartyLocationScope;
    readonly name: string;
    readonly legend: string;
    readonly value?: string;
    readonly onChange: (locationId: string) => void;
    readonly disabled?: boolean;
}) {
    const { t, i18n } = useTranslation();
    const query = usePartyLocationList(scope);
    const accessLost = query.error instanceof PartyLocationRequestError && query.error.isAccessLoss;
    const active =
        (!accessLost &&
            query.data?.pages.flatMap((page) =>
                page.items.filter((location) => location.lifecycle === "ACTIVE"),
            )) ||
        [];

    let content: ReactNode;
    if (query.error && (accessLost || !query.data)) {
        content = (
            <div role="alert" className="grid justify-items-start gap-2">
                <p className="text-sm text-muted-foreground">{query.error.message}</p>
                <Button type="button" variant="outline" onClick={() => query.refetch()}>
                    {t("partyLocations.actions.retry")}
                </Button>
            </div>
        );
    } else if (query.isPending) {
        content = (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("partyLocations.list.loading")}</output>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    } else if (active.length === 0 && !query.hasNextPage) {
        content = (
            <p className="text-sm text-muted-foreground">{t("partyLocations.selector.empty")}</p>
        );
    } else {
        content = (
            <div className="grid gap-2">
                {active.map((location) => {
                    const id = `${name}-${location.id}`;
                    return (
                        <label
                            key={location.id}
                            htmlFor={id}
                            className="flex cursor-pointer items-start gap-3 border bg-surface-container-low p-3 has-[:checked]:border-primary has-[:disabled]:cursor-not-allowed"
                        >
                            <input
                                id={id}
                                type="radio"
                                name={name}
                                value={location.id}
                                checked={value === location.id}
                                disabled={disabled}
                                onChange={() => onChange(location.id)}
                                className="mt-1"
                            />
                            <span className="grid gap-0.5">
                                <span className="break-words font-medium">{location.label}</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatPartyLocationRegion(location, i18n.language, t)}
                                </span>
                            </span>
                        </label>
                    );
                })}
                {query.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-start"
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

    return (
        <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">{legend}</legend>
            {content}
        </fieldset>
    );
}
