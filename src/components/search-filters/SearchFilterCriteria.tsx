import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { FilterDetailRow } from "@/components/search-filters/FilterDetailRow.tsx";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

type Props = {
    readonly search: SearchFilterArguments;
};

/**
 * Top-level criteria as badges: price range, product state, shop type.
 * Used on SearchFilterCard and the search-filter detail page.
 */
export function SearchFilterCriteriaBadges({ search }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-center gap-y-2 [&>span]:after:content-['·'] [&>span]:after:mx-2 [&>span]:after:text-muted-foreground/40 [&>span:last-child]:after:hidden">
            {(search.priceFrom != null || search.priceTo != null) && (
                <span className="inline-flex flex-wrap gap-1.5">
                    <Badge variant="outline">
                        {search.priceFrom ?? "?"} – {search.priceTo ?? "?"} €
                    </Badge>
                </span>
            )}
            {!!search.allowedStates?.length && (
                <span className="inline-flex flex-wrap gap-1.5">
                    {search.allowedStates.length === PRODUCT_STATES.length ? (
                        <Badge variant="outline">{t("search.filter.all")}</Badge>
                    ) : (
                        search.allowedStates.map((s) => (
                            <StatusBadge key={s} status={s} showIcon={false} />
                        ))
                    )}
                </span>
            )}
            {!!search.shopType?.length && (
                <span className="inline-flex flex-wrap gap-1.5">
                    {search.shopType.length === SHOP_TYPES.length ? (
                        <Badge variant="outline">{t("search.filter.all")}</Badge>
                    ) : (
                        search.shopType.map((st) => <ShopTypeBadge key={st} shopType={st} />)
                    )}
                </span>
            )}
        </div>
    );
}

/**
 * Advanced criteria rows: merchant/seller allow/deny lists and date spans.
 * Used inside the card's collapsible accordion and always-expanded on the detail page.
 */
export function SearchFilterCriteriaDetails({ search }: Props) {
    const { t, i18n } = useTranslation();

    return (
        <div className="flex flex-col gap-3">
            <FilterDetailRow
                variant="text"
                label={t("search.filter.merchant")}
                values={search.merchant ?? []}
            />
            <FilterDetailRow
                variant="text"
                label={t("search.filter.excludeMerchant")}
                values={search.excludeMerchant ?? []}
            />
            <FilterDetailRow
                variant="text"
                label={t("search.filter.seller")}
                values={search.seller ?? []}
            />
            <FilterDetailRow
                variant="text"
                label={t("search.filter.excludeSeller")}
                values={search.excludeSeller ?? []}
            />
            {(search.creationDateFrom != null || search.creationDateTo != null) && (
                <FilterDetailRow
                    variant="text"
                    label={t("searchFilters.info.creationDate")}
                    values={[
                        `${search.creationDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.creationDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                    ]}
                />
            )}
            {(search.updateDateFrom != null || search.updateDateTo != null) && (
                <FilterDetailRow
                    variant="text"
                    label={t("searchFilters.info.updateDate")}
                    values={[
                        `${search.updateDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.updateDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                    ]}
                />
            )}
            {(search.auctionDateFrom != null || search.auctionDateTo != null) && (
                <FilterDetailRow
                    variant="text"
                    label={t("searchFilters.info.auctionDate")}
                    values={[
                        `${search.auctionDateFrom?.toLocaleDateString(i18n.language) ?? "?"} – ${search.auctionDateTo?.toLocaleDateString(i18n.language) ?? "?"}`,
                    ]}
                />
            )}
        </div>
    );
}
