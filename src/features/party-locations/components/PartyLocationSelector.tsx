import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    ADMIN_SKELETON_CLASS,
    FIELD_LABEL_CLASS,
    OPTION_CARD_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
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
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-meta text-oxblood">{query.error.message}</p>
                <button
                    type="button"
                    onClick={() => query.refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("partyLocations.actions.retry")}
                </button>
            </div>
        );
    } else if (query.isPending) {
        content = (
            <div className="flex flex-col gap-2" aria-busy="true">
                <output className="sr-only">{t("partyLocations.list.loading")}</output>
                <span className={cn(ADMIN_SKELETON_CLASS, "h-14 rounded-md")} />
                <span className={cn(ADMIN_SKELETON_CLASS, "h-14 rounded-md")} />
            </div>
        );
    } else if (active.length === 0 && !query.hasNextPage) {
        content = (
            <p className="text-sm text-ink-secondary">{t("partyLocations.selector.empty")}</p>
        );
    } else {
        content = (
            <div className="flex flex-col gap-2">
                {active.map((location) => {
                    const id = `${name}-${location.id}`;
                    return (
                        <label key={location.id} htmlFor={id} className={OPTION_CARD_CLASS}>
                            <input
                                id={id}
                                type="radio"
                                name={name}
                                value={location.id}
                                checked={value === location.id}
                                disabled={disabled}
                                onChange={() => onChange(location.id)}
                                className="mt-1 size-[15px] shrink-0 accent-oxblood"
                            />
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="text-sm font-medium break-words">
                                    {location.label}
                                </span>
                                <span className="text-meta text-ink-secondary">
                                    {formatPartyLocationRegion(location, i18n.language, t)}
                                </span>
                            </span>
                        </label>
                    );
                })}
                {query.hasNextPage && (
                    <button
                        type="button"
                        disabled={query.isFetchingNextPage}
                        onClick={() => query.fetchNextPage()}
                        className={cn(SMALL_SECONDARY_PILL_CLASS, "self-start")}
                    >
                        {query.isFetchingNextPage
                            ? t("partyLocations.list.loadingMore")
                            : t("partyLocations.list.loadMore")}
                    </button>
                )}
            </div>
        );
    }

    return (
        <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className={cn(FIELD_LABEL_CLASS, "mb-2")}>{legend}</legend>
            {content}
        </fieldset>
    );
}
