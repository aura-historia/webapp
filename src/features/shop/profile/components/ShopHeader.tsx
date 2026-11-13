import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { NonPartnerNotice } from "@/features/provider-status/components/NonPartnerNotice.tsx";
import { PartnerBadge } from "@/features/provider-status/components/PartnerBadge.tsx";
import { providerStatusPageUrl } from "@/features/provider-status/lib/providerStatusLinks.ts";
import { SHOP_FOCUS_CLASS } from "@/features/shop/profile/lib/shopStyles.ts";
import { cn } from "@/lib/utils.ts";

type ShopHeaderProps = {
    readonly shop: PublicListingSource;
};

/** First letter of the name, shown on the image ground when the provider has no image. */
function initialOf(name: string): string {
    return Array.from(name.trim())[0]?.toUpperCase() ?? "";
}

/**
 * Provider header: image tile, eyebrow, name, operator, buying note, the website link and a quiet
 * "Apply as a partner" link that opens the new application dialog with this provider chosen.
 *
 * All parts are grid items of one grid. On phones the tile and eyebrow share the first row and the
 * rest stacks below; from 768px the tile and the actions column span the text rows, and the first
 * row takes any spare height so the text stays aligned with the bottom of the tile.
 */
export function ShopHeader({ shop }: ShopHeaderProps) {
    const { t, i18n } = useTranslation();
    // `viewUrl` carries the referral or UTM tagging; `url` is only the fallback for a response without it.
    const websiteUrl = shop.viewUrl ?? shop.url;

    return (
        <header className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-line-subtle pb-6 md:grid-cols-[184px_minmax(0,1fr)_auto] md:grid-rows-[1fr_auto_auto_auto] md:gap-x-12 md:pb-9">
            <div className="col-start-1 row-start-1 flex size-22 items-center justify-center overflow-hidden rounded-panel bg-image-ground shadow-ring md:row-span-4 md:size-46 md:self-end md:rounded-figure">
                {shop.image ? (
                    <img
                        src={shop.image}
                        alt=""
                        className="size-full object-contain"
                        loading="eager"
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        data-testid="shop-header-initial"
                        className="font-serif text-[40px] leading-none text-ink-muted md:text-[76px]"
                    >
                        {initialOf(shop.name)}
                    </span>
                )}
            </div>

            <div className="col-start-2 row-start-1 flex flex-wrap items-center gap-x-3 gap-y-2 self-center md:self-end">
                <span className="font-mono text-[11px] leading-[1.4] tracking-[0.2em] text-brass-ink uppercase md:text-xs">
                    {t("shop.header.eyebrow")}
                </span>
                {shop.partner && <PartnerBadge size="lg" />}
            </div>

            <h1 className="col-span-2 font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] wrap-anywhere md:col-span-1 md:col-start-2 md:row-start-2 md:max-w-[820px] md:text-display-section md:text-balance">
                {shop.name}
            </h1>

            <p className="col-span-2 text-body-sm text-ink-secondary md:col-span-1 md:col-start-2 md:row-start-3 md:text-body">
                {t("shop.header.operator", { operator: shop.operatorName })}
            </p>

            {shop.partner ? (
                <p className="col-span-2 text-meta leading-[1.6] text-ink-muted md:col-span-1 md:col-start-2 md:row-start-4 md:max-w-[560px] md:text-body-sm">
                    {t("shop.header.note")}
                </p>
            ) : (
                // Non-partners: the notice replaces the buying note (Redesign, "Provider status").
                <NonPartnerNotice
                    scope="provider"
                    providerName={shop.name}
                    sourceUrl={shop.url}
                    pageUrl={providerStatusPageUrl(
                        { scope: "provider", shopSlugId: shop.slugId },
                        i18n.language,
                    )}
                    className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-4 md:max-w-[560px]"
                />
            )}

            <div
                className={cn(
                    "col-span-2 mt-1 flex flex-col gap-3",
                    "md:col-span-1 md:col-start-3 md:row-span-4 md:row-start-1 md:mt-0 md:items-end md:self-end",
                )}
            >
                {websiteUrl && (
                    <a
                        href={websiteUrl}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className={cn(
                            "inline-flex h-12 items-center justify-center gap-2.5 rounded-pill bg-ink px-6 text-button text-surface transition-colors hover:bg-oxblood hover:text-on-oxblood",
                            "md:h-13 md:whitespace-nowrap",
                            SHOP_FOCUS_CLASS,
                        )}
                    >
                        {t("shop.header.visitWebsite")}
                        <span className="sr-only"> {t("shop.header.newTab")}</span>
                        <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    </a>
                )}
                <p
                    className={cn(
                        "text-meta leading-normal text-ink-muted md:text-right",
                        websiteUrl && "text-center",
                    )}
                >
                    {t("shop.header.partner.question")}{" "}
                    <Link
                        to="/$lng/partners/applications"
                        params={true}
                        from="/$lng"
                        search={{ create: true, provider: shop.slugId }}
                        className={cn(
                            "inline-flex min-h-6 items-center gap-1 text-ink underline decoration-line-strong underline-offset-3 transition-colors hover:text-oxblood hover:decoration-oxblood",
                            SHOP_FOCUS_CLASS,
                        )}
                    >
                        {t("shop.header.partner.apply")}
                        <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    </Link>
                </p>
            </div>
        </header>
    );
}
