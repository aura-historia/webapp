import { useTranslation } from "react-i18next";
import type { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    getQueryTerms,
    type SearchFilterCriterion,
    useSearchFilterCriteria,
} from "@/features/saved-searches/hooks/useSearchFilterCriteria.ts";
import { FOCUS_CLASS } from "@/features/saved-searches/lib/searchFilterStyles.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly name: string;
    readonly search: SearchFilterArguments;
    readonly availability: (typeof LISTING_AVAILABILITIES)[number][];
    /** Hide the name row when the caller already shows it elsewhere. */
    readonly showName?: boolean;
    /** Jumps back to the wizard step that sets a row; omit to hide the Change links. */
    readonly onChangeStep?: (step: number) => void;
};

type Row = {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly step: number;
    readonly serif?: boolean;
};

function describe(criteria: readonly SearchFilterCriterion[], ids: readonly string[]) {
    return criteria
        .filter((criterion) => ids.includes(criterion.id))
        .map((criterion) => `${criterion.label}: ${criterion.values.join(", ")}`)
        .join(" · ");
}

/** The wizard's review of a search filter: one ruled row per step, each with a Change link. */
export function SearchFilterSummary({
    name,
    search,
    availability,
    showName = true,
    onChangeStep,
}: Props) {
    const { t } = useTranslation();
    const criteria = useSearchFilterCriteria(search, availability);
    const terms = getQueryTerms(search);
    const any = t("searchFilter.wizard.any");

    const rows: Row[] = [
        ...(showName
            ? [{ id: "name", label: t("searchFilter.saveDialog.nameLabel"), value: name, step: 1 }]
            : []),
        {
            id: "terms",
            label: t("searchFilter.saveDialog.queryLabel", { count: terms.length }),
            value: terms.map((term) => `“${term}”`).join(" · ") || any,
            step: 1,
            serif: terms.length > 0,
        },
        {
            id: "priceStatus",
            label: t("searchFilter.wizard.step.priceStatus"),
            value: describe(criteria, ["price", "availability"]),
            step: 2,
        },
        {
            id: "providers",
            label: t("search.filter.listingSources"),
            value: describe(criteria, ["include", "exclude"]) || any,
            step: 3,
        },
        {
            id: "date",
            label: t("searchFilter.wizard.step.date"),
            value: describe(criteria, ["auction", "added", "updated"]) || any,
            step: 4,
        },
    ];

    return (
        <dl className="rounded-lg bg-surface px-5 py-1 shadow-field">
            {rows.map((row, index) => (
                <div
                    key={row.id}
                    className={cn(
                        "grid grid-cols-1 gap-x-4 gap-y-1 py-3.5 sm:grid-cols-[150px_minmax(0,1fr)]",
                        index < rows.length - 1 && "border-b border-line-subtle",
                    )}
                >
                    <dt className="font-mono text-tag leading-[1.8] tracking-[0.14em] text-ink-muted uppercase">
                        {row.label}
                    </dt>
                    <dd className="flex justify-between gap-3 text-body-sm text-ink">
                        <span className={cn("min-w-0", row.serif && "font-serif italic")}>
                            {row.value}
                        </span>
                        {onChangeStep && (
                            <button
                                type="button"
                                aria-label={t("searchFilter.wizard.changeLabel", {
                                    label: row.label,
                                })}
                                onClick={() => onChangeStep(row.step)}
                                className={cn(
                                    "shrink-0 cursor-pointer self-start rounded-xs text-meta font-medium underline decoration-line-strong underline-offset-3",
                                    FOCUS_CLASS,
                                )}
                            >
                                {t("searchFilter.wizard.change")}
                            </button>
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
