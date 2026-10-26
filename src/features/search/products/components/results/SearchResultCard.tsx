import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { useMarkNotificationsSeen } from "@/features/notification-center/api/useMarkNotificationsSeen.ts";
import { getListingStatusLabelKey } from "@/features/product/catalog/components/badges/ListingStatusBadge.tsx";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { SearchResultMedia } from "@/features/search/products/components/results/SearchResultMedia.tsx";
import { useListingWatchlistState } from "@/features/watchlist/api/watchlistMutationState.ts";
import { useWatchlistMutation } from "@/features/watchlist/api/useWatchlistMutation.ts";
import { useWatchlistNotificationMutation } from "@/features/watchlist/api/useWatchlistNotificationMutation.ts";
import { cn } from "@/lib/utils.ts";
import { ToggleBellIcon } from "@/components/common/ToggleBellIcon.tsx";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
const IMAGE_BUTTON_CLASS = cn(
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-pill disabled:cursor-default",
    FOCUS_CLASS,
);
const BADGE_CLASS =
    "absolute top-2.5 left-2.5 z-10 rounded-sm bg-oxblood px-[7px] py-1 font-mono text-tag text-on-oxblood uppercase";

/** Reserved listings get a brass dot; listings that cannot be bought get a hollow one. */
const RESERVED: readonly (ListingAvailability | null)[] = ["RESERVED"];
const GONE: readonly (ListingAvailability | null)[] = [
    "UNAVAILABLE",
    "OUT_OF_STOCK",
    "SOLD_OUT",
    "UNKNOWN",
    null,
];

function statusTone(product: ProductListing): "available" | "reserved" | "gone" {
    if (product.lifecycle === "WITHDRAWN" || GONE.includes(product.availability)) return "gone";
    if (RESERVED.includes(product.availability)) return "reserved";
    return "available";
}

function SearchResultCardComponent({
    product,
    firstImageOnly = false,
}: {
    readonly product: ProductListing;
    /**
     * Shows only the first photo, without its own image carousel. For cards inside a rail, where
     * an inner swipe would fight the rail's own swipe.
     */
    readonly firstImageOnly?: boolean;
}) {
    const { t } = useTranslation();
    const unseenNotificationIds = product.userState?.notification?.unseenNotificationIds ?? [];
    const hasUnseenNotification = unseenNotificationIds.length > 0;
    const markSeen = useMarkNotificationsSeen();
    const searchFilterData = product.userState?.searchFilter;
    const matchedFilterId =
        searchFilterData?.matched && !searchFilterData.hidden
            ? searchFilterData.userSearchFilterId
            : undefined;
    const isWithdrawn = product.lifecycle === "WITHDRAWN";
    const merchantUrl = product.viewUrl?.href ?? product.url?.href;
    const showSensitiveContent =
        product.userState?.contentVisibility?.showUnassessedOrSensitiveContent ?? false;
    const { watching, notifications } = useListingWatchlistState(
        product.productListingId,
        product.userState?.watchlist,
    );
    const watchlistMutation = useWatchlistMutation(product.productListingId);
    const notificationMutation = useWatchlistNotificationMutation(product.productListingId);
    const tone = statusTone(product);
    const title = product.title ?? t("product.untitled");
    const provider = [product.source.name, product.geography?.country].filter(Boolean).join(" · ");
    const price =
        product.formattedPrice ??
        (product.price?.type === "ON_REQUEST"
            ? t("product.history.values.onRequest")
            : t("product.unknownPrice"));

    const handleProductClick = useCallback(() => {
        if (unseenNotificationIds.length > 0) markSeen.mutate(unseenNotificationIds);
    }, [unseenNotificationIds, markSeen.mutate]);

    return (
        <article className="flex h-full min-w-0 flex-col gap-3 text-ink">
            <div
                className={cn(
                    "relative aspect-square overflow-hidden rounded-md bg-image-ground",
                    (hasUnseenNotification || matchedFilterId) && "shadow-selected",
                )}
            >
                <SearchResultMedia
                    images={firstImageOnly ? product.images.slice(0, 1) : product.images}
                    productListingTitleSlugId={product.productListingTitleSlugId}
                    showSensitiveContent={showSensitiveContent}
                    onProductClick={handleProductClick}
                />

                {hasUnseenNotification && (
                    <span data-testid="unseen-notification-badge" className={BADGE_CLASS}>
                        {t("product.unseenNotification")}
                    </span>
                )}
                {!hasUnseenNotification && matchedFilterId && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                to="/$lng/me/search-filter/$filterId"
                                params={(current) => ({ ...current, filterId: matchedFilterId })}
                                from="/$lng"
                                className={cn(BADGE_CLASS, FOCUS_CLASS)}
                            >
                                {t("product.searchFilter.matchedBadge")}
                            </Link>
                        </TooltipTrigger>
                        {searchFilterData?.userSearchFilterName && (
                            <TooltipContent className="max-w-64">
                                {searchFilterData.userSearchFilterName}
                            </TooltipContent>
                        )}
                    </Tooltip>
                )}

                <div className="absolute top-1.5 right-1.5 z-10 flex gap-1">
                    {watching && (
                        <button
                            type="button"
                            aria-pressed={notifications}
                            aria-label={t("product.watchlistNotifications")}
                            disabled={notificationMutation.isPending}
                            onClick={() => notificationMutation.mutate(!notifications)}
                            className={cn(IMAGE_BUTTON_CLASS, "bg-chip-on-image text-ink")}
                        >
                            <ToggleBellIcon on={notifications} className="size-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        aria-pressed={watching}
                        aria-label={
                            watching
                                ? t("product.removeFromWatchlist")
                                : t("product.addToWatchlist")
                        }
                        onClick={() => {
                            if (watchlistMutation.isPending) return;
                            watchlistMutation.mutate(
                                watching ? "deleteFromWatchlist" : "addToWatchlist",
                            );
                        }}
                        className={cn(
                            IMAGE_BUTTON_CLASS,
                            watching ? "bg-oxblood text-on-oxblood" : "bg-chip-on-image text-ink",
                        )}
                    >
                        <Bookmark
                            aria-hidden="true"
                            strokeWidth={1.8}
                            className={cn("size-4", watching && "fill-current")}
                        />
                    </button>
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
                <Link
                    to="/$lng/shops/$shopSlugId"
                    params={(current) => ({ ...current, shopSlugId: product.source.slugId })}
                    from="/$lng"
                    title={provider}
                    className={cn(
                        "inline-flex min-h-5 min-w-0 max-w-full self-start font-mono text-tag tracking-[0.14em] text-ink-muted uppercase hover:text-brass-ink",
                        FOCUS_CLASS,
                    )}
                >
                    <span className="truncate">{provider}</span>
                </Link>
                <ProductListingLink
                    productListingTitleSlugId={product.productListingTitleSlugId}
                    onClick={handleProductClick}
                    className={cn("group rounded-xs", FOCUS_CLASS)}
                >
                    <h3 className="line-clamp-2 font-serif text-[15px] leading-[1.25] font-normal group-hover:underline group-hover:underline-offset-3 sm:text-[17px]">
                        {title}
                    </h3>
                </ProductListingLink>
                <div className="mt-0.5 flex flex-col-reverse items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-2.5">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 text-meta",
                            tone === "gone" ? "text-ink-muted" : "text-ink-secondary",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-[7px] shrink-0 rounded-pill border-[1.5px]",
                                tone === "available" && "border-ink bg-ink",
                                tone === "reserved" && "border-brass bg-brass",
                                tone === "gone" && "border-ink-muted",
                            )}
                        />
                        {t(getListingStatusLabelKey(product.availability, product.lifecycle))}
                    </span>
                    <span className="flex flex-col items-start sm:items-end">
                        <strong className="text-sm leading-[1.2] font-semibold whitespace-nowrap sm:text-price">
                            {price}
                        </strong>
                        {product.priceValuation === "SALE_OBSERVATION" && (
                            <span className="font-mono text-tag text-ink-muted uppercase">
                                {t("product.saleObservationPrice")}
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <div className="mt-auto flex border-t border-line-subtle">
                <ProductListingLink
                    productListingTitleSlugId={product.productListingTitleSlugId}
                    onClick={handleProductClick}
                    className={cn(
                        "hidden min-h-11 flex-1 items-center text-meta font-medium hover:text-brass-ink sm:inline-flex",
                        FOCUS_CLASS,
                    )}
                >
                    {t("product.details")}
                </ProductListingLink>
                {!isWithdrawn && merchantUrl ? (
                    <a
                        href={merchantUrl}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className={cn(
                            "inline-flex min-h-11 flex-1 items-center gap-1.5 text-meta font-medium hover:text-brass-ink sm:flex-none sm:justify-end",
                            FOCUS_CLASS,
                        )}
                    >
                        {t("product.toMerchant")}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    </a>
                ) : (
                    <span
                        aria-disabled="true"
                        className="inline-flex min-h-11 flex-1 items-center gap-1.5 text-meta font-medium text-ink-muted opacity-35 sm:flex-none sm:justify-end"
                    >
                        {t("product.toMerchant")}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    </span>
                )}
            </div>
        </article>
    );
}

export const SearchResultCard = memo(SearchResultCardComponent);
