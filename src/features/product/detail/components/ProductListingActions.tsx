import { ArrowUpRight, Bookmark } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { formatPriceEstimate } from "@/features/product/detail/lib/pricing/priceEstimate.ts";
import { useListingWatchlistState } from "@/features/watchlist/api/watchlistMutationState.ts";
import { useWatchlistMutation } from "@/features/watchlist/api/useWatchlistMutation.ts";
import { cn } from "@/lib/utils.ts";

export const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

export type PriceDisplay = {
    /** The large figure: the price, "Price on request", the estimate, or "Price unknown". */
    readonly primary: string;
    readonly primaryIsEstimate: boolean;
    readonly unknown: boolean;
    /** The estimate shown in its own row under a price. */
    readonly estimate?: string;
};

export function usePriceDisplay(product: ProductListingDetail): PriceDisplay {
    const { t, i18n } = useTranslation();
    const estimate = formatPriceEstimate(
        product.pricing.display.priceEstimateMin,
        product.pricing.display.priceEstimateMax,
        t,
        i18n.language,
    );
    if (product.price?.type === "ON_REQUEST") {
        return {
            primary: t("product.history.values.onRequest"),
            primaryIsEstimate: false,
            unknown: false,
            estimate,
        };
    }
    if (product.displayPrice) {
        return {
            primary: product.displayPrice,
            primaryIsEstimate: false,
            unknown: false,
            estimate,
        };
    }
    if (estimate) return { primary: estimate, primaryIsEstimate: true, unknown: false };
    return { primary: t("product.unknownPrice"), primaryIsEstimate: false, unknown: true };
}

/** The listing's watchlist state and toggle, shared by the summary and the phone action bar. */
export function useWatchToggle(product: ProductListingDetail) {
    const { t } = useTranslation();
    const { watching, notifications } = useListingWatchlistState(
        product.productListingId,
        product.userState?.watchlist,
    );
    const watchlistMutation = useWatchlistMutation(product.productListingId);
    return {
        watching,
        notifications,
        label: watching ? t("product.removeFromWatchlist") : t("product.addToWatchlist"),
        toggle: () => {
            if (watchlistMutation.isPending) return;
            watchlistMutation.mutate(watching ? "deleteFromWatchlist" : "addToWatchlist");
        },
    };
}

/** "Go to provider": opens the listing at its source, or shows disabled for withdrawn or redacted listings. */
export function ProviderLink({
    product,
    className,
}: {
    readonly product: ProductListingDetail;
    readonly className: string;
}) {
    const { t } = useTranslation();
    const href = product.viewUrl?.href ?? product.url?.href;
    const content: ReactNode = (
        <>
            {t("product.toMerchant")}
            <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </>
    );

    if (product.lifecycle === "WITHDRAWN" || !href) {
        return (
            <span aria-disabled="true" className={cn(className, "cursor-not-allowed opacity-35")}>
                {content}
            </span>
        );
    }
    return (
        <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={className}>
            {content}
        </a>
    );
}

/** The phone and tablet bar that keeps the price and both actions in reach while scrolling. */
export function ProductActionBar({ product }: { readonly product: ProductListingDetail }) {
    const price = usePriceDisplay(product);
    const watch = useWatchToggle(product);

    return (
        <div className="sticky bottom-0 z-30 flex items-center gap-3 bg-surface-bar px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_var(--color-line-subtle)] lg:hidden">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-serif text-[22px] leading-[1.1] text-ink">
                    {price.primary}
                </span>
                <span className="truncate font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                    {product.source.name}
                </span>
            </div>
            <button
                type="button"
                aria-label={watch.label}
                aria-pressed={watch.watching}
                onClick={watch.toggle}
                className={cn(
                    "inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink",
                    watch.watching
                        ? "bg-surface-sunken"
                        : "shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
                    FOCUS_CLASS,
                )}
            >
                <Bookmark
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className={cn("size-[18px]", watch.watching && "fill-current")}
                />
            </button>
            <ProviderLink
                product={product}
                className={cn(
                    "inline-flex h-12 shrink-0 items-center gap-2 rounded-pill bg-ink px-5 text-button text-surface",
                    FOCUS_CLASS,
                )}
            />
        </div>
    );
}
