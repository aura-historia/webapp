import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { PartnerBadge } from "@/features/provider-status/components/PartnerBadge.tsx";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const ACTION_CLASS = cn(
    "inline-flex min-h-11 items-center gap-1.5 text-meta font-medium hover:text-brass-ink",
    FOCUS_CLASS,
);

/**
 * A provider in the provider search grid: a square image tile (the serif initial when the source
 * has no image), the name, the operator, and links to the provider page and, when the source has
 * a website, its referral-tagged `viewUrl`. Phones show the website link as an icon.
 */
function ShopResultCardComponent({ shop }: { readonly shop: PublicListingSource }) {
    const { t } = useTranslation();
    const linkProps = {
        to: "/$lng/shops/$shopSlugId",
        from: "/$lng",
        params: (current: Record<string, string>) => ({ ...current, shopSlugId: shop.slugId }),
    } as const;
    const operator = t("shop.header.operator", { operator: shop.operatorName });

    return (
        <article
            data-testid="shop-result-card"
            className="flex h-full min-w-0 flex-col gap-3 text-ink"
        >
            <Link
                {...linkProps}
                tabIndex={-1}
                aria-hidden="true"
                className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-image-ground shadow-ring"
            >
                {shop.image ? (
                    <img
                        src={shop.image}
                        alt=""
                        loading="lazy"
                        className="size-full object-contain"
                    />
                ) : (
                    <span className="font-serif text-[48px] leading-none text-ink-muted sm:text-[72px]">
                        {shop.name.charAt(0)}
                    </span>
                )}
            </Link>

            <div className="flex min-w-0 flex-col gap-1.5">
                <Link {...linkProps} className={cn("group", FOCUS_CLASS)}>
                    <h3 className="line-clamp-2 font-serif text-[16px] leading-[1.22] font-normal wrap-anywhere group-hover:underline group-hover:underline-offset-3 sm:text-[19px]">
                        {shop.name}
                    </h3>
                </Link>
                <p title={operator} className="truncate text-meta text-ink-secondary">
                    {operator}
                </p>
                {shop.partner && <PartnerBadge size="sm" className="self-start" />}
            </div>

            <div className="mt-auto flex items-center border-t border-line-subtle">
                <Link {...linkProps} className={cn(ACTION_CLASS, "flex-1 text-ink")}>
                    {t("search.providers.viewProvider")}
                    <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                </Link>
                {shop.viewUrl && (
                    <>
                        <a
                            href={shop.viewUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className={cn(ACTION_CLASS, "hidden text-ink-secondary sm:inline-flex")}
                        >
                            {t("search.providers.website")}
                            <span className="sr-only">{t("shop.header.newTab")}</span>
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3.5"
                                strokeWidth={1.8}
                            />
                        </a>
                        <a
                            href={shop.viewUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            aria-label={t("search.providers.websiteOf", { shop: shop.name })}
                            className={cn(
                                "-mr-3 inline-flex size-11 items-center justify-center text-ink-secondary hover:text-brass-ink sm:hidden",
                                FOCUS_CLASS,
                            )}
                        >
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-[15px]"
                                strokeWidth={1.8}
                            />
                        </a>
                    </>
                )}
            </div>
        </article>
    );
}

export const ShopResultCard = memo(ShopResultCardComponent);

/** Loading stand-in shaped like a provider card. */
export function ShopResultCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            data-testid="shop-result-skeleton"
            className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none"
        >
            <div className="aspect-square rounded-md bg-image-ground" />
            <div className="h-4 w-[78%] rounded-xs bg-surface-sunken" />
            <div className="h-3 w-[55%] rounded-xs bg-surface-sunken" />
            <div className="flex h-11 items-center border-t border-line-subtle">
                <div className="h-3 w-[38%] rounded-xs bg-surface-sunken" />
            </div>
        </div>
    );
}
