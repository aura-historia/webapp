import { useTranslation } from "react-i18next";
import { Bell, BellRing, ScanSearch, Search, Settings2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { Link } from "@tanstack/react-router";
import { intlFormatDistance } from "date-fns";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import { hasAdvancedFilterDetails } from "@/data/internal/search/SearchFilterArguments.ts";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { AUTHENTICITY_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Authenticity.ts";
import { CONDITION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Condition.ts";
import { PROVENANCE_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Provenance.ts";
import { RESTORATION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Restoration.ts";
import { useUpdateUserSearchFilter } from "@/hooks/search-filters/useUpdateUserSearchFilter.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { serializeSearchParams } from "@/lib/searchValidation.ts";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useMemo } from "react";
import { FilterDetailRow } from "@/components/search-filters/FilterDetailRow.tsx";

type Props = {
    readonly filter: UserSearchFilter;
    readonly isDeleting: boolean;
    readonly onDelete: (id: string) => void;
    readonly onEdit: (filter: UserSearchFilter) => void;
};

export function SearchFilterCard({ filter, isDeleting, onDelete, onEdit }: Props) {
    const { t, i18n } = useTranslation();
    const { search } = filter;
    const updateFilter = useUpdateUserSearchFilter();

    const { data: periodsData } = useQuery(
        getPeriodsOptions({ query: { language: parseLanguage(i18n.language) } }),
    );
    const periods = useMemo(() => (periodsData ?? []).map(mapToPeriodOverview), [periodsData]);

    const { data: categoriesData } = useQuery(
        getCategoriesOptions({ query: { language: parseLanguage(i18n.language) } }),
    );
    const categories = useMemo(
        () => (categoriesData ?? []).map(mapToCategoryOverview),
        [categoriesData],
    );

    const hasAdvancedFilters = hasAdvancedFilterDetails(search);
    const notificationsLabel = filter.notifications
        ? t("searchFilters.notificationsOn")
        : t("searchFilters.notificationsOff");

    return (
        <Card className="flex flex-col p-6 gap-5 shadow-md min-w-0 h-full transition-colors hover:bg-accent">
            <div className="flex justify-between">
                <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-3 min-w-0">
                        <H2 className="text-ellipsis line-clamp-1">{filter.name}</H2>
                        <span
                            className="text-sm text-muted-foreground shrink-0"
                            suppressHydrationWarning
                        >
                            {intlFormatDistance(filter.created, new Date(), {
                                locale: i18n.language,
                            })}
                        </span>
                    </div>
                    {search.q && (
                        <H3 variant="muted" className="line-clamp-1 text-ellipsis">
                            „{search.q}"
                        </H3>
                    )}
                    {filter.enhancedSearchDescription && (
                        <p className="text-sm text-muted-foreground italic line-clamp-2">
                            {filter.enhancedSearchDescription}
                        </p>
                    )}
                </div>
                <div className="flex gap-1 shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-10 text-muted-foreground"
                                aria-label={notificationsLabel}
                                disabled={updateFilter.isPending}
                                onClick={() =>
                                    updateFilter.mutate({
                                        id: filter.id,
                                        patch: { notifications: !filter.notifications },
                                    })
                                }
                            >
                                <div className="relative size-5">
                                    <Bell
                                        className={`absolute inset-0 size-5 transition-all duration-300 ease-in-out ${filter.notifications ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
                                    />
                                    <BellRing
                                        className={`absolute inset-0 size-5 transition-all duration-300 ease-in-out fill-primary ${filter.notifications ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                                    />
                                </div>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{notificationsLabel}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-10 text-muted-foreground hover:text-primary"
                                aria-label={t("searchFilters.edit")}
                                onClick={() => onEdit(filter)}
                            >
                                <Settings2 className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("searchFilters.edit")}</TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-10 text-muted-foreground hover:text-destructive"
                                        aria-label={t("searchFilters.delete")}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="size-5" />
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>{t("searchFilters.delete")}</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t("searchFilters.deleteConfirm.title", { name: filter.name })}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("searchFilters.deleteConfirm.description")}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {t("searchFilters.deleteConfirm.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(filter.id)}>
                                    {t("searchFilters.deleteConfirm.confirm")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

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
                        {search.allowedStates.map((s) => (
                            <StatusBadge key={s} status={s} showIcon={false} />
                        ))}
                    </span>
                )}
                {!!search.shopType?.length && (
                    <span className="inline-flex flex-wrap gap-1.5">
                        {search.shopType.map((st) => (
                            <ShopTypeBadge key={st} shopType={st} />
                        ))}
                    </span>
                )}
                {!!search.periodId?.length && (
                    <span className="inline-flex flex-wrap gap-1.5">
                        {search.periodId.map((p) => (
                            <Badge key={p} variant="outline">
                                {periods.find((period) => period.periodId === p)?.name ?? p}
                            </Badge>
                        ))}
                    </span>
                )}
                {!!search.categoryId?.length && (
                    <span className="inline-flex flex-wrap gap-1.5">
                        {search.categoryId.map((c) => (
                            <Badge key={c} variant="outline">
                                {categories.find((cat) => cat.categoryId === c)?.name ?? c}
                            </Badge>
                        ))}
                    </span>
                )}
                {(search.originYearMin != null || search.originYearMax != null) && (
                    <span className="inline-flex flex-wrap gap-1.5">
                        <Badge variant="outline">
                            {search.originYearMin ?? "?"} – {search.originYearMax ?? "?"}
                        </Badge>
                    </span>
                )}
            </div>

            {hasAdvancedFilters && (
                <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-t border-b-0">
                        <AccordionTrigger className="text-sm text-muted-foreground py-3 hover:no-underline">
                            {t("searchFilters.showDetails")}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-3 pt-2">
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
                                    label={t("search.filter.authenticity")}
                                    values={(search.authenticity ?? []).map((a) =>
                                        t(AUTHENTICITY_TRANSLATION_CONFIG[a].translationKey),
                                    )}
                                />
                                <FilterDetailRow
                                    variant="text"
                                    label={t("search.filter.condition")}
                                    values={(search.condition ?? []).map((c) =>
                                        t(CONDITION_TRANSLATION_CONFIG[c].translationKey),
                                    )}
                                />
                                <FilterDetailRow
                                    variant="text"
                                    label={t("search.filter.provenance")}
                                    values={(search.provenance ?? []).map((p) =>
                                        t(PROVENANCE_TRANSLATION_CONFIG[p].translationKey),
                                    )}
                                />
                                <FilterDetailRow
                                    variant="text"
                                    label={t("search.filter.restoration")}
                                    values={(search.restoration ?? []).map((r) =>
                                        t(RESTORATION_TRANSLATION_CONFIG[r].translationKey),
                                    )}
                                />
                                {(search.creationDateFrom != null ||
                                    search.creationDateTo != null) && (
                                    <FilterDetailRow
                                        variant="text"
                                        label={t("searchFilters.info.creationDate")}
                                        values={[
                                            `${search.creationDateFrom?.toLocaleDateString() ?? "?"} – ${search.creationDateTo?.toLocaleDateString() ?? "?"}`,
                                        ]}
                                    />
                                )}
                                {(search.updateDateFrom != null || search.updateDateTo != null) && (
                                    <FilterDetailRow
                                        variant="text"
                                        label={t("searchFilters.info.updateDate")}
                                        values={[
                                            `${search.updateDateFrom?.toLocaleDateString() ?? "?"} – ${search.updateDateTo?.toLocaleDateString() ?? "?"}`,
                                        ]}
                                    />
                                )}
                                {(search.auctionDateFrom != null ||
                                    search.auctionDateTo != null) && (
                                    <FilterDetailRow
                                        variant="text"
                                        label={t("searchFilters.info.auctionDate")}
                                        values={[
                                            `${search.auctionDateFrom?.toLocaleDateString() ?? "?"} – ${search.auctionDateTo?.toLocaleDateString() ?? "?"}`,
                                        ]}
                                    />
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}

            <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" className="gap-2 flex-1" asChild>
                    <Link to="/search" search={serializeSearchParams(search)}>
                        <Search className="size-4" />
                        {t("searchFilters.showResults")}
                    </Link>
                </Button>
                <Button size="sm" className="gap-2 flex-1" asChild>
                    <Link to="/me/search-filter/$filterId" params={{ filterId: filter.id }}>
                        <ScanSearch className="size-4" />
                        {t("searchFilters.matchingProducts")}
                    </Link>
                </Button>
            </div>
        </Card>
    );
}
