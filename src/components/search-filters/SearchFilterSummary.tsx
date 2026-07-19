import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    type SearchFilterArguments,
    hasActiveFilters,
} from "@/data/internal/search/SearchFilterArguments.ts";
import type { ReactNode } from "react";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import type { ShopType } from "@/data/internal/shop/ShopType.ts";
import type { ProductState } from "@/data/internal/product/ProductState.ts";
import {
    FilterDetailRow,
    FilterDetailRowBadges,
} from "@/components/search-filters/FilterDetailRow.tsx";

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

/** Returns true when all available variants are selected (= no restriction active). */
const isAllSelected = (count: number, total: number) => count === total;

type Props = {
    readonly name: string;
    readonly search: SearchFilterArguments;
    readonly shopType: ShopType[];
    readonly productState: ProductState[];
    /** Hide the "Name" row — useful when the caller already shows the name elsewhere (e.g. as a page H1). */
    readonly showName?: boolean;
};

/**
 * Read-only summary of a search filter's full configuration — name, query, price/status,
 * shop/merchant, and date criteria, with a fallback when nothing beyond the query is set.
 *
 * `shopType`/`productState` are passed explicitly rather than derived from `search` alone:
 * the wizard needs the live, un-debounced checkbox state (see SearchFilterWizardConfirmStep),
 * while a persisted filter can just pass `search.shopType`/`search.allowedStates` directly.
 */
export function SearchFilterSummary({
    name,
    search,
    shopType,
    productState,
    showName = true,
}: Props) {
    const { t } = useTranslation();

    const hasAnyFilter = hasActiveFilters(search);

    const hasShop =
        !isAllSelected(shopType.length, SHOP_TYPES.length) ||
        !!search.merchant?.length ||
        !!search.excludeMerchant?.length ||
        !!search.seller?.length ||
        !!search.excludeSeller?.length;

    const hasDate =
        search.auctionDateFrom != null ||
        search.auctionDateTo != null ||
        search.creationDateFrom != null ||
        search.creationDateTo != null ||
        search.updateDateFrom != null ||
        search.updateDateTo != null;

    return (
        <div className="border bg-muted/30 divide-y overflow-hidden">
            {/* Name */}
            {showName && (
                <div className="px-5 py-4 flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                        {t("searchFilter.saveDialog.nameLabel")}
                    </span>
                    <span className="font-semibold text-base">{name}</span>
                </div>
            )}

            {/* Search query */}
            {search.queryTerms && search.queryTerms.length > 0 && (
                <div className="px-5 py-4 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                        {t("searchFilter.saveDialog.queryLabel", {
                            count: search.queryTerms.length,
                        })}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {search.queryTerms.map((term) => (
                            <Badge key={term} variant="outline">
                                {term}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Price & product status */}
            <ConfirmSection
                label={t("searchFilter.wizard.step.priceStatus")}
                show={search.priceFrom != null || search.priceTo != null || productState.length > 0}
            >
                {(search.priceFrom != null || search.priceTo != null) && (
                    <FilterDetailRowBadges label={t("search.filter.priceSpan")}>
                        <Badge variant="outline">
                            {search.priceFrom ?? "?"} – {search.priceTo ?? "?"} €
                        </Badge>
                    </FilterDetailRowBadges>
                )}
                {productState.length > 0 && (
                    <FilterDetailRowBadges label={t("search.filter.productState")}>
                        {isAllSelected(productState.length, PRODUCT_STATES.length) ? (
                            <Badge variant="outline">{t("search.filter.all")}</Badge>
                        ) : (
                            productState.map((s) => (
                                <StatusBadge key={s} status={s} showIcon={false} />
                            ))
                        )}
                    </FilterDetailRowBadges>
                )}
            </ConfirmSection>

            {/* Shop & merchant */}
            <ConfirmSection label={t("searchFilter.wizard.step.shop")} show={hasShop}>
                {!isAllSelected(shopType.length, SHOP_TYPES.length) && (
                    <FilterDetailRowBadges label={t("search.filter.shopType")}>
                        {shopType.map((st) => (
                            <ShopTypeBadge key={st} shopType={st} />
                        ))}
                    </FilterDetailRowBadges>
                )}
                <FilterDetailRow
                    variant="badges"
                    label={t("search.filter.merchant")}
                    values={search.merchant ?? []}
                />
                <FilterDetailRow
                    variant="badges"
                    label={t("search.filter.excludeMerchant")}
                    values={search.excludeMerchant ?? []}
                    badgeVariant="destructive"
                />
                <FilterDetailRow
                    variant="badges"
                    label={t("search.filter.seller")}
                    values={search.seller ?? []}
                />
                <FilterDetailRow
                    variant="badges"
                    label={t("search.filter.excludeSeller")}
                    values={search.excludeSeller ?? []}
                    badgeVariant="destructive"
                />
            </ConfirmSection>

            {/* Date */}
            <ConfirmSection label={t("searchFilter.wizard.step.date")} show={hasDate}>
                {(search.auctionDateFrom != null || search.auctionDateTo != null) && (
                    <FilterDetailRow
                        variant="text"
                        label={t("search.filter.auctionDate")}
                        values={[
                            `${search.auctionDateFrom?.toLocaleDateString() ?? "?"} – ${search.auctionDateTo?.toLocaleDateString() ?? "?"}`,
                        ]}
                    />
                )}
                {(search.creationDateFrom != null || search.creationDateTo != null) && (
                    <FilterDetailRow
                        variant="text"
                        label={t("search.filter.creationDate")}
                        values={[
                            `${search.creationDateFrom?.toLocaleDateString() ?? "?"} – ${search.creationDateTo?.toLocaleDateString() ?? "?"}`,
                        ]}
                    />
                )}
                {(search.updateDateFrom != null || search.updateDateTo != null) && (
                    <FilterDetailRow
                        variant="text"
                        label={t("search.filter.updateDate")}
                        values={[
                            `${search.updateDateFrom?.toLocaleDateString() ?? "?"} – ${search.updateDateTo?.toLocaleDateString() ?? "?"}`,
                        ]}
                    />
                )}
            </ConfirmSection>

            {/* No filters configured */}
            {!hasAnyFilter && (
                <div className="px-5 py-4">
                    <span className="text-sm text-muted-foreground italic">
                        {t("searchFilter.wizard.noFiltersConfigured")}
                    </span>
                </div>
            )}
        </div>
    );
}
