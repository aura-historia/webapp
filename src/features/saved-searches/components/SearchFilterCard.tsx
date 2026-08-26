import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Bell,
    BellRing,
    Copy,
    MoreVertical,
    Pause,
    Play,
    ScanSearch,
    Settings2,
    Trash2,
} from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { Link } from "@tanstack/react-router";
import { intlFormatDistance } from "date-fns";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import { hasAdvancedFilterDetails } from "@/data/internal/search/SearchFilterArguments.ts";
import { useUpdateUserSearchFilter } from "@/features/saved-searches/api/useUpdateUserSearchFilter.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
    SearchFilterCriteriaBadges,
    SearchFilterCriteriaDetails,
} from "@/features/saved-searches/components/SearchFilterCriteria.tsx";

type Props = {
    readonly filter: UserSearchFilter;
    readonly isDeleting: boolean;
    readonly canDuplicate: boolean;
    readonly onDelete: (id: string) => void;
    readonly onEdit: (filter: UserSearchFilter) => void;
    readonly onDuplicate: (filter: UserSearchFilter) => void;
};

export function SearchFilterCard({
    filter,
    isDeleting,
    canDuplicate,
    onDelete,
    onEdit,
    onDuplicate,
}: Props) {
    const { t, i18n } = useTranslation();
    const { search } = filter;
    const updateFilter = useUpdateUserSearchFilter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const queryTerms = search.queryTerms?.length ? search.queryTerms : search.q ? [search.q] : [];
    const hasAdvancedFilters = hasAdvancedFilterDetails(search);
    const notificationsLabel = filter.notifications
        ? t("searchFilters.notificationsOn")
        : t("searchFilters.notificationsOff");

    const isActive = filter.state === "ACTIVE";
    const isRestrictedByPlan = filter.state === "INACTIVE_BY_RESTRICTED_PLAN";
    const stateToggleLabel = isActive ? t("searchFilters.deactivate") : t("searchFilters.activate");

    const handleStateToggle = () =>
        updateFilter.mutate({
            id: filter.id,
            patch: { state: isActive ? "INACTIVE_BY_USER" : "ACTIVE" },
        });

    const handleNotificationsToggle = () =>
        updateFilter.mutate({
            id: filter.id,
            patch: { notifications: !filter.notifications },
        });

    return (
        <Card className="relative flex flex-col p-4 sm:p-6 gap-5 shadow-md min-w-0 h-full transition-colors hover:bg-accent">
            <Link
                to="/$lng/me/search-filter/$filterId"
                params={(current) => ({ ...current, filterId: filter.id })}
                className="absolute inset-0 z-0"
                aria-label={filter.name}
                from="/$lng"
            />

            <div className="flex justify-between gap-2">
                <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                    <H2 className="text-ellipsis line-clamp-1">{filter.name}</H2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                            {intlFormatDistance(filter.created, new Date(), {
                                locale: i18n.language,
                            })}
                        </span>
                        {filter.state === "INACTIVE_BY_USER" && (
                            <Badge variant="secondary" className="text-xs">
                                {t("searchFilters.stateInactiveByUser")}
                            </Badge>
                        )}
                        {isRestrictedByPlan && (
                            <Badge variant="destructive" className="text-xs">
                                {t("searchFilters.stateInactiveByPlan")}
                            </Badge>
                        )}
                    </div>
                    {queryTerms.length > 0 && (
                        <H3 variant="muted" className="line-clamp-1 text-ellipsis">
                            {queryTerms.map((term) => `„${term}"`).join(", ")}
                        </H3>
                    )}
                    {filter.enhancedSearchDescription && (
                        <p className="text-sm text-muted-foreground italic line-clamp-2">
                            {filter.enhancedSearchDescription}
                        </p>
                    )}
                </div>

                {/* Desktop: 5 icon buttons with tooltips */}
                <div className="hidden sm:flex gap-1 shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative size-10 text-muted-foreground"
                                aria-label={stateToggleLabel}
                                disabled={updateFilter.isPending}
                                onClick={handleStateToggle}
                            >
                                <div className="relative size-5">
                                    <Pause
                                        className={`absolute inset-0 size-5 transition-all duration-300 ease-in-out ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                                    />
                                    <Play
                                        className={`absolute inset-0 size-5 transition-all duration-300 ease-in-out ${isActive ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
                                    />
                                </div>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{stateToggleLabel}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative z-10 size-10 text-muted-foreground"
                                aria-label={notificationsLabel}
                                disabled={updateFilter.isPending || !isActive}
                                onClick={handleNotificationsToggle}
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
                                className="relative z-10 size-10 text-muted-foreground hover:text-primary"
                                aria-label={t("searchFilters.duplicate")}
                                disabled={!canDuplicate}
                                onClick={() => onDuplicate(filter)}
                            >
                                <Copy className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {canDuplicate
                                ? t("searchFilters.duplicate")
                                : t("searchFilters.createUpgradeTooltip")}
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative z-10 size-10 text-muted-foreground hover:text-primary"
                                aria-label={t("searchFilters.edit")}
                                onClick={() => onEdit(filter)}
                            >
                                <Settings2 className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("searchFilters.edit")}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative z-10 size-10 text-muted-foreground hover:text-destructive"
                                aria-label={t("searchFilters.delete")}
                                disabled={isDeleting}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("searchFilters.delete")}</TooltipContent>
                    </Tooltip>
                </div>

                {/* Mobile: single ⋮ dropdown with labeled actions */}
                <div className="relative z-10 sm:hidden shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-10 text-muted-foreground"
                                aria-label={t("searchFilters.moreActions")}
                            >
                                <MoreVertical className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                disabled={updateFilter.isPending}
                                onClick={handleStateToggle}
                            >
                                {isActive ? (
                                    <Pause className="size-4" />
                                ) : (
                                    <Play className="size-4" />
                                )}
                                {stateToggleLabel}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={updateFilter.isPending || !isActive}
                                onClick={handleNotificationsToggle}
                            >
                                {filter.notifications ? (
                                    <Bell className="size-4" />
                                ) : (
                                    <BellRing className="size-4" />
                                )}
                                {notificationsLabel}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={!canDuplicate}
                                onClick={() => onDuplicate(filter)}
                            >
                                <Copy className="size-4" />
                                {t("searchFilters.duplicate")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(filter)}>
                                <Settings2 className="size-4" />
                                {t("searchFilters.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                disabled={isDeleting}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                {t("searchFilters.delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <SearchFilterCriteriaBadges search={search} />

            {hasAdvancedFilters && (
                <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-t border-b-0">
                        <AccordionTrigger className="relative z-10 text-sm text-muted-foreground py-3 hover:no-underline">
                            {t("searchFilters.showDetails")}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="pt-2">
                                <SearchFilterCriteriaDetails search={search} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}

            <Button size="sm" className="relative z-10 gap-2 mt-auto text-xs sm:text-sm" asChild>
                <Link
                    to="/$lng/me/search-filter/$filterId"
                    params={(current) => ({ ...current, filterId: filter.id })}
                    from="/$lng"
                >
                    <ScanSearch className="size-4 shrink-0" />
                    <span className="sm:hidden">{t("searchFilters.matchesAndDetailsShort")}</span>
                    <span className="hidden sm:inline">{t("searchFilters.matchesAndDetails")}</span>
                </Link>
            </Button>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
        </Card>
    );
}
