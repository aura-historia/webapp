import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    type SearchFilterArguments,
    hasActiveFilters,
} from "@/data/internal/search/SearchFilterArguments.ts";
import type { PeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import type { CategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import type { ReactNode } from "react";
import {
    AUTHENTICITY_TRANSLATION_CONFIG,
    AUTHENTICITIES,
} from "@/data/internal/quality-indicators/Authenticity.ts";
import {
    CONDITION_TRANSLATION_CONFIG,
    CONDITIONS,
} from "@/data/internal/quality-indicators/Condition.ts";
import {
    PROVENANCE_TRANSLATION_CONFIG,
    PROVENANCES,
} from "@/data/internal/quality-indicators/Provenance.ts";
import {
    RESTORATION_TRANSLATION_CONFIG,
    RESTORATIONS,
} from "@/data/internal/quality-indicators/Restoration.ts";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import {
    FilterDetailRow,
    FilterDetailRowBadges,
} from "@/components/search-filters/FilterDetailRow.tsx";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";

type ConfirmSectionProps = {
    readonly label: string;
    readonly show: boolean;
    readonly children: ReactNode;
};

function ConfirmSection({ label, show, children }: ConfirmSectionProps) {
    if (!show) return null;
    return (
        <div className="px-5 py-4 flex flex-col gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                {label}
            </span>
            {children}
        </div>
    );
}

type Props = {
    readonly name: string;
    readonly filters: SearchFilterArguments;
    readonly periods: PeriodOverview[];
    readonly categories: CategoryOverview[];
};

/** Returns true when all available variants are selected (= no restriction active). */
const isAllSelected = (count: number, total: number) => count === total;

export function SearchFilterWizardConfirmStep({ name, filters, periods, categories }: Props) {
    const { t } = useTranslation();
    // Raw form values — reflect exactly what the user has checked (incl. "all selected")
    const formValues = useFormContext<FilterSchema>().watch();

    const hasAnyFilter = hasActiveFilters(filters);

    const hasQuality =
        formValues.authenticity.length > 0 ||
        formValues.condition.length > 0 ||
        formValues.provenance.length > 0 ||
        formValues.restoration.length > 0 ||
        filters.originYearMin != null ||
        filters.originYearMax != null;

    const hasShop =
        formValues.shopType.length > 0 ||
        !!filters.merchant?.length ||
        !!filters.excludeMerchant?.length;

    const hasDate =
        filters.auctionDateFrom != null ||
        filters.auctionDateTo != null ||
        filters.creationDateFrom != null ||
        filters.creationDateTo != null ||
        filters.updateDateFrom != null ||
        filters.updateDateTo != null;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">{t("searchFilter.wizard.step.confirm")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("searchFilter.wizard.step.confirmDescription")}
                </p>
            </div>

            <div className="border bg-muted/30 divide-y overflow-hidden">
                {/* Name */}
                <div className="px-5 py-4 flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                        {t("searchFilter.saveDialog.nameLabel")}
                    </span>
                    <span className="font-semibold text-base">{name}</span>
                </div>

                {/* Suchbegriff */}
                {filters.q && (
                    <div className="px-5 py-4 flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                            {t("searchFilter.saveDialog.queryLabel")}
                        </span>
                        <span className="font-semibold text-base">{filters.q}</span>
                    </div>
                )}

                {/* Preis & Produktstatus */}
                <ConfirmSection
                    label={t("searchFilter.wizard.step.priceStatus")}
                    show={
                        filters.priceFrom != null ||
                        filters.priceTo != null ||
                        formValues.productState.length > 0
                    }
                >
                    {(filters.priceFrom != null || filters.priceTo != null) && (
                        <FilterDetailRowBadges label={t("search.filter.priceSpan")}>
                            <Badge variant="outline">
                                {filters.priceFrom ?? "?"} – {filters.priceTo ?? "?"} €
                            </Badge>
                        </FilterDetailRowBadges>
                    )}
                    {formValues.productState.length > 0 && (
                        <FilterDetailRowBadges label={t("search.filter.productState")}>
                            {isAllSelected(
                                formValues.productState.length,
                                PRODUCT_STATES.length,
                            ) ? (
                                <Badge variant="outline">{t("search.filter.all")}</Badge>
                            ) : (
                                formValues.productState.map((s) => (
                                    <StatusBadge key={s} status={s} showIcon={false} />
                                ))
                            )}
                        </FilterDetailRowBadges>
                    )}
                </ConfirmSection>

                {/* Epoche & Kategorie */}
                <ConfirmSection
                    label={t("searchFilter.wizard.step.theme")}
                    show={!!filters.periodId?.length || !!filters.categoryId?.length}
                >
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.periodId")}
                        values={(filters.periodId ?? []).map(
                            (p) => periods.find((x) => x.periodId === p)?.name ?? p,
                        )}
                    />
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.categoryId")}
                        values={(filters.categoryId ?? []).map(
                            (c) => categories.find((x) => x.categoryId === c)?.name ?? c,
                        )}
                    />
                </ConfirmSection>

                {/* Qualitätsmerkmale */}
                <ConfirmSection label={t("searchFilter.wizard.step.quality")} show={hasQuality}>
                    {(filters.originYearMin != null || filters.originYearMax != null) && (
                        <FilterDetailRowBadges label={t("search.filter.originYear")}>
                            <Badge variant="outline">
                                {filters.originYearMin ?? "?"} – {filters.originYearMax ?? "?"}
                            </Badge>
                        </FilterDetailRowBadges>
                    )}
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.authenticity")}
                        values={
                            isAllSelected(formValues.authenticity.length, AUTHENTICITIES.length)
                                ? [t("search.filter.all")]
                                : formValues.authenticity.map((a) =>
                                      t(AUTHENTICITY_TRANSLATION_CONFIG[a].translationKey),
                                  )
                        }
                    />
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.condition")}
                        values={
                            isAllSelected(formValues.condition.length, CONDITIONS.length)
                                ? [t("search.filter.all")]
                                : formValues.condition.map((c) =>
                                      t(CONDITION_TRANSLATION_CONFIG[c].translationKey),
                                  )
                        }
                    />
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.provenance")}
                        values={
                            isAllSelected(formValues.provenance.length, PROVENANCES.length)
                                ? [t("search.filter.all")]
                                : formValues.provenance.map((p) =>
                                      t(PROVENANCE_TRANSLATION_CONFIG[p].translationKey),
                                  )
                        }
                    />
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.restoration")}
                        values={
                            isAllSelected(formValues.restoration.length, RESTORATIONS.length)
                                ? [t("search.filter.all")]
                                : formValues.restoration.map((r) =>
                                      t(RESTORATION_TRANSLATION_CONFIG[r].translationKey),
                                  )
                        }
                    />
                </ConfirmSection>

                {/* Shop & Händler */}
                <ConfirmSection label={t("searchFilter.wizard.step.shop")} show={hasShop}>
                    <FilterDetailRowBadges label={t("search.filter.shopType")}>
                        {isAllSelected(formValues.shopType.length, SHOP_TYPES.length) ? (
                            <Badge variant="outline">{t("search.filter.all")}</Badge>
                        ) : (
                            formValues.shopType.map((st) => (
                                <ShopTypeBadge key={st} shopType={st} />
                            ))
                        )}
                    </FilterDetailRowBadges>
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.merchant")}
                        values={filters.merchant ?? []}
                    />
                    <FilterDetailRow
                        variant="badges"
                        label={t("search.filter.excludeMerchant")}
                        values={filters.excludeMerchant ?? []}
                        badgeVariant="destructive"
                    />
                </ConfirmSection>

                {/* Datum */}
                <ConfirmSection label={t("searchFilter.wizard.step.date")} show={hasDate}>
                    {(filters.auctionDateFrom != null || filters.auctionDateTo != null) && (
                        <FilterDetailRow
                            variant="text"
                            label={t("search.filter.auctionDate")}
                            values={[
                                `${filters.auctionDateFrom?.toLocaleDateString() ?? "?"} – ${filters.auctionDateTo?.toLocaleDateString() ?? "?"}`,
                            ]}
                        />
                    )}
                    {(filters.creationDateFrom != null || filters.creationDateTo != null) && (
                        <FilterDetailRow
                            variant="text"
                            label={t("search.filter.creationDate")}
                            values={[
                                `${filters.creationDateFrom?.toLocaleDateString() ?? "?"} – ${filters.creationDateTo?.toLocaleDateString() ?? "?"}`,
                            ]}
                        />
                    )}
                    {(filters.updateDateFrom != null || filters.updateDateTo != null) && (
                        <FilterDetailRow
                            variant="text"
                            label={t("search.filter.updateDate")}
                            values={[
                                `${filters.updateDateFrom?.toLocaleDateString() ?? "?"} – ${filters.updateDateTo?.toLocaleDateString() ?? "?"}`,
                            ]}
                        />
                    )}
                </ConfirmSection>

                {/* Kein Filter gesetzt */}
                {!hasAnyFilter && (
                    <div className="px-5 py-4">
                        <span className="text-sm text-muted-foreground italic">
                            {t("searchFilter.wizard.noFiltersConfigured")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
