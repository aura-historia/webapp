import { useTranslation } from "react-i18next";
import {
    Ban,
    CalendarClock,
    CalendarPlus,
    Coins,
    Gavel,
    type LucideIcon,
    Search,
    Store,
    Tag,
    User,
    UserX,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { SHOP_TYPES } from "@/data/internal/shop/ShopType.ts";
import { PRODUCT_STATES } from "@/data/internal/product/ProductState.ts";
import {
    hasActiveFilters,
    type SearchFilterArguments,
} from "@/data/internal/search/SearchFilterArguments.ts";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";

type TileProps = {
    readonly icon: LucideIcon;
    readonly label: string;
    readonly children: ReactNode;
};

function CriteriaTile({ icon: Icon, label, children }: TileProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Icon className="size-3.5 text-tertiary" aria-hidden="true" />
                {label}
            </span>
            <div className="flex flex-wrap gap-1.5">{children}</div>
        </div>
    );
}

type BadgeListTileProps = {
    readonly icon: LucideIcon;
    readonly label: string;
    readonly values: string[];
};

function BadgeListTile({ icon, label, values }: BadgeListTileProps) {
    if (!values.length) return null;
    return (
        <CriteriaTile icon={icon} label={label}>
            {values.map((v) => (
                <Badge key={v} variant="outline">
                    {v}
                </Badge>
            ))}
        </CriteriaTile>
    );
}

function useFormatDateRange() {
    const { t, i18n } = useTranslation();
    return (from?: Date, to?: Date) => {
        if (from && to)
            return `${from.toLocaleDateString(i18n.language)} – ${to.toLocaleDateString(i18n.language)}`;
        if (from) return `${t("search.filter.from")} ${from.toLocaleDateString(i18n.language)}`;
        return `${t("search.filter.to")} ${to?.toLocaleDateString(i18n.language)}`;
    };
}

type Props = {
    readonly search: SearchFilterArguments;
};

/**
 * Every configured search-filter criterion, laid out as a responsive grid of compact
 * icon-labelled tiles rather than a stacked list — built for the spacious detail page,
 * not the narrow card/wizard contexts (see SearchFilterCriteria.tsx for those).
 */
export function SearchFilterConfigurationGrid({ search }: Props) {
    const { t } = useTranslation();
    const formatDateRange = useFormatDateRange();

    const fallbackQueryTerms = search.q ? [search.q] : [];
    const queryTerms = search.queryTerms?.length ? search.queryTerms : fallbackQueryTerms;
    const hasPrice = search.priceFrom != null || search.priceTo != null;
    // Mirrors the wizard's confirm-step preview: when allowedStates was never explicitly
    // narrowed, show the same pre-selected default states the wizard shows (see FILTER_DEFAULTS).
    const displayedStates = search.allowedStates?.length
        ? search.allowedStates
        : FILTER_DEFAULTS.productState;
    const statesAllSelected = displayedStates.length === PRODUCT_STATES.length;
    const shopTypeAllSelected = search.shopType?.length === SHOP_TYPES.length;

    if (queryTerms.length === 0 && !hasActiveFilters(search)) {
        return (
            <p className="text-sm text-muted-foreground italic">
                {t("searchFilters.noAdditionalCriteria")}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {queryTerms.length > 0 && (
                <CriteriaTile
                    icon={Search}
                    label={t("searchFilter.saveDialog.queryLabel", { count: queryTerms.length })}
                >
                    {queryTerms.map((term) => (
                        <Badge key={term} variant="outline">
                            {term}
                        </Badge>
                    ))}
                </CriteriaTile>
            )}

            {hasPrice && (
                <CriteriaTile icon={Coins} label={t("search.filter.priceSpan")}>
                    <Badge variant="outline">
                        {search.priceFrom ?? "?"} – {search.priceTo ?? "?"} €
                    </Badge>
                </CriteriaTile>
            )}

            <CriteriaTile icon={Tag} label={t("search.filter.productState")}>
                {statesAllSelected ? (
                    <Badge variant="outline">{t("search.filter.all")}</Badge>
                ) : (
                    displayedStates.map((s) => <StatusBadge key={s} status={s} showIcon={false} />)
                )}
            </CriteriaTile>

            {!!search.shopType?.length && (
                <CriteriaTile icon={Store} label={t("search.filter.shopType")}>
                    {shopTypeAllSelected ? (
                        <Badge variant="outline">{t("search.filter.all")}</Badge>
                    ) : (
                        search.shopType.map((st) => <ShopTypeBadge key={st} shopType={st} />)
                    )}
                </CriteriaTile>
            )}

            <BadgeListTile
                icon={Store}
                label={t("search.filter.merchant")}
                values={search.merchant ?? []}
            />
            <BadgeListTile
                icon={Ban}
                label={t("search.filter.excludeMerchant")}
                values={search.excludeMerchant ?? []}
            />
            <BadgeListTile
                icon={User}
                label={t("search.filter.seller")}
                values={search.seller ?? []}
            />
            <BadgeListTile
                icon={UserX}
                label={t("search.filter.excludeSeller")}
                values={search.excludeSeller ?? []}
            />

            {(search.creationDateFrom != null || search.creationDateTo != null) && (
                <CriteriaTile icon={CalendarPlus} label={t("searchFilters.info.creationDate")}>
                    <span className="text-sm">
                        {formatDateRange(search.creationDateFrom, search.creationDateTo)}
                    </span>
                </CriteriaTile>
            )}

            {(search.updateDateFrom != null || search.updateDateTo != null) && (
                <CriteriaTile icon={CalendarClock} label={t("searchFilters.info.updateDate")}>
                    <span className="text-sm">
                        {formatDateRange(search.updateDateFrom, search.updateDateTo)}
                    </span>
                </CriteriaTile>
            )}

            {(search.auctionDateFrom != null || search.auctionDateTo != null) && (
                <CriteriaTile icon={Gavel} label={t("searchFilters.info.auctionDate")}>
                    <span className="text-sm">
                        {formatDateRange(search.auctionDateFrom, search.auctionDateTo)}
                    </span>
                </CriteriaTile>
            )}
        </div>
    );
}
