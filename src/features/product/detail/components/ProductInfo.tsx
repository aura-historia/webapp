import { Link } from "@tanstack/react-router";
import { Bookmark, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { ListingStatusPill } from "@/features/product/detail/components/ListingStatusPill.tsx";
import { ProductDescription } from "@/features/product/detail/components/ProductDescription.tsx";
import { ProductImageGallery } from "@/features/product/detail/components/ProductImageGallery.tsx";
import { ProductSharer } from "@/features/product/detail/components/ProductSharer.tsx";
import {
    FOCUS_CLASS,
    ProviderLink,
    usePriceDisplay,
    useWatchToggle,
} from "@/features/product/detail/components/ProductListingActions.tsx";
import { useWatchlistNotificationMutation } from "@/features/watchlist/api/useWatchlistNotificationMutation.ts";
import { cn } from "@/lib/utils.ts";
import { ToggleBellIcon } from "@/components/common/ToggleBellIcon.tsx";

const PILL_BUTTON_CLASS = cn(
    "inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-pill text-button",
    FOCUS_CLASS,
);
const MONO_LABEL_CLASS = "font-mono text-label tracking-[0.14em] text-ink-muted uppercase";

export function ProductInfo({ product }: { readonly product: ProductListingDetail }) {
    const { t } = useTranslation();
    const {
        watching,
        notifications,
        label: watchLabel,
        toggle: toggleWatch,
    } = useWatchToggle(product);
    const notificationMutation = useWatchlistNotificationMutation(product.productListingId);
    const price = usePriceDisplay(product);
    const isWithdrawn = product.lifecycle === "WITHDRAWN";
    const searchFilter = product.userState?.searchFilter;
    const matchedFilterId =
        searchFilter?.matched && !searchFilter.hidden ? searchFilter.userSearchFilterId : undefined;
    const title = product.title ?? t("product.untitled");
    const showSensitiveContent =
        product.userState?.contentVisibility.showUnassessedOrSensitiveContent ?? false;

    return (
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <ProductImageGallery
                images={product.images}
                productId={product.productListingId}
                title={title}
                showSensitiveContent={showSensitiveContent}
            />

            <div className="flex min-w-0 flex-col gap-7">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-h-11 min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                        <ListingStatusPill
                            availability={product.availability}
                            lifecycle={product.lifecycle}
                        />
                        {product.auction?.name?.text && (
                            <span className="font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                                {product.auction.name.text}
                            </span>
                        )}
                        {product.lot?.lotNumber && (
                            <span className="font-mono text-tag tracking-[0.14em] text-ink uppercase">
                                {t("product.auction.lotNumber", {
                                    lotNumber: product.lot.lotNumber,
                                })}
                            </span>
                        )}
                    </div>
                    <div className="flex shrink-0 gap-1 max-sm:gap-2">
                        {watching && (
                            <button
                                type="button"
                                aria-pressed={notifications}
                                aria-label={t("product.watchlistNotifications")}
                                disabled={notificationMutation.isPending}
                                onClick={() => notificationMutation.mutate(!notifications)}
                                className={cn(
                                    "inline-flex size-11 cursor-pointer items-center justify-center rounded-pill transition-colors duration-200 ease-out motion-reduce:transition-none",
                                    notifications
                                        ? "bg-oxblood text-on-oxblood"
                                        : "text-ink hover:bg-surface-sunken max-sm:shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
                                    FOCUS_CLASS,
                                )}
                            >
                                <ToggleBellIcon
                                    on={notifications}
                                    className="size-[18px]"
                                    strokeWidth={1.7}
                                />
                            </button>
                        )}
                        <ProductSharer title={title} className="max-sm:hidden" />
                        <ProductSharer title={title} variant="outline" className="sm:hidden" />
                    </div>
                </div>

                <div className="flex flex-col gap-3.5">
                    <Link
                        to="/$lng/shops/$shopSlugId"
                        params={(current) => ({
                            ...current,
                            shopSlugId: product.source.slugId,
                        })}
                        from="/$lng"
                        className={cn(
                            "inline-flex min-h-6 self-start font-mono text-kicker text-ink-muted uppercase hover:text-brass-ink",
                            FOCUS_CLASS,
                        )}
                    >
                        {product.source.name}
                    </Link>
                    <h1 className="font-serif text-[32px] leading-[1.1] font-normal tracking-[-0.02em] text-pretty sm:text-[clamp(34px,3.2vw,46px)] sm:leading-[1.08]">
                        {title}
                    </h1>
                </div>

                {matchedFilterId && (
                    <Link
                        to="/$lng/me/search-filter/$filterId"
                        params={(current) => ({ ...current, filterId: matchedFilterId })}
                        from="/$lng"
                        className={cn(
                            "group flex items-center gap-3 rounded-lg bg-surface-sunken px-3.5 py-3 text-body-sm leading-[1.45] text-ink-secondary",
                            FOCUS_CLASS,
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        >
                            <Bookmark className="size-3.5 fill-current" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                            {t("product.searchFilter.matchedBy")}:{" "}
                            <strong className="font-semibold text-ink underline decoration-line-strong underline-offset-3 group-hover:text-brass-ink">
                                {searchFilter?.userSearchFilterName}
                            </strong>
                        </span>
                        <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-ink-muted"
                            strokeWidth={1.8}
                        />
                    </Link>
                )}

                <div className="flex flex-col gap-5 border-t border-line pt-6">
                    <div className="flex flex-col gap-2">
                        {price.primaryIsEstimate && (
                            <span className={MONO_LABEL_CLASS}>{t("product.estimate.label")}</span>
                        )}
                        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
                            <span
                                data-testid="product-price"
                                className={cn(
                                    "font-serif leading-none font-normal tracking-[-0.02em]",
                                    price.unknown ? "text-ink-muted" : "text-ink",
                                    price.unknown || price.primary.length > 14
                                        ? "text-[30px]"
                                        : "text-[38px] sm:text-[44px]",
                                )}
                            >
                                {price.primary}
                            </span>
                            {product.priceValuation === "SALE_OBSERVATION" && (
                                <span className="rounded-sm bg-surface-sunken px-2 py-1 font-mono text-tag tracking-[0.1em] text-ink-secondary uppercase">
                                    {t("product.saleObservationPrice")}
                                </span>
                            )}
                        </div>
                    </div>
                    {price.estimate && (
                        <div className="flex items-baseline justify-between gap-3 border-y border-line-subtle py-3">
                            <span className={MONO_LABEL_CLASS}>{t("product.estimate.label")}</span>
                            <span className="font-serif text-[20px] leading-[1.2] text-ink">
                                {price.estimate}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col gap-2.5">
                        <ProviderLink
                            product={product}
                            className={cn(PILL_BUTTON_CLASS, "bg-ink text-surface")}
                        />
                        <button
                            type="button"
                            aria-pressed={watching}
                            onClick={toggleWatch}
                            className={cn(
                                PILL_BUTTON_CLASS,
                                "cursor-pointer text-ink",
                                watching
                                    ? "bg-surface-sunken"
                                    : "shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-surface-sunken",
                            )}
                        >
                            <Bookmark
                                aria-hidden="true"
                                strokeWidth={1.8}
                                className={cn("size-4", watching && "fill-current")}
                            />
                            {watchLabel}
                        </button>
                    </div>
                    {isWithdrawn && (
                        <p className="text-meta text-ink-muted">{t("product.withdrawnHint")}</p>
                    )}
                </div>

                {product.description && <ProductDescription description={product.description} />}
            </div>
        </section>
    );
}
