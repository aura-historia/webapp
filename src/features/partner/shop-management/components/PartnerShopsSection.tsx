import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Globe, Mail, Phone, MapPin, SearchX, RefreshCw } from "lucide-react";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG, type ShopType } from "@/data/internal/shop/ShopType.ts";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useMyPartnerShops } from "@/features/partner/shop-management/api/useMyPartnerShops.ts";
import { PartnerShopEditDialog } from "@/features/partner/shop-management/components/PartnerShopEditDialog.tsx";
import { formatShortDate } from "@/lib/utils.ts";

function shopTypeLabel(t: (k: string) => string, shopType?: ShopType): string {
    return shopType ? t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey) : "—";
}

export function PartnerShopsSection() {
    const { t, i18n } = useTranslation();
    const [editTarget, setEditTarget] = useState<ShopDetail | null>(null);
    const { data: shops = [], isPending, isError, refetch } = useMyPartnerShops();

    const renderContent = () => {
        if (isPending) {
            return <PartnerShopsSkeleton />;
        }

        if (isError) {
            return (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">{t("partnerShops.loadError")}</p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        {t("partnerShops.actions.retry")}
                    </Button>
                </div>
            );
        }

        if (shops.length === 0) {
            return (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">{t("partnerShops.empty")}</p>
                </div>
            );
        }

        return (
            <ul className="flex flex-col gap-2">
                {shops.map((shop) => (
                    <li
                        key={shop.shopId}
                        className="flex flex-row items-start gap-3 border bg-surface-container-low p-3"
                    >
                        <div className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted sm:block">
                            {shop.image ? (
                                <ImageWithFallback
                                    src={shop.image}
                                    alt={t("partnerShops.shopImageAlt", { shop: shop.name })}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    —
                                </div>
                            )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="truncate font-medium" title={shop.name}>
                                    {shop.name}
                                </span>
                                <Badge variant="outline">{shopTypeLabel(t, shop.shopType)}</Badge>
                            </div>
                            {shop.domains.length > 0 && (
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                    <Globe className="h-3 w-3" aria-hidden="true" />
                                    <span className="truncate" title={shop.domains.join(", ")}>
                                        {shop.domains.join(", ")}
                                    </span>
                                </div>
                            )}
                            {(shop.viewUrl ?? shop.url) && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
                                    <a
                                        href={shop.viewUrl ?? shop.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="truncate underline underline-offset-2"
                                        title={shop.viewUrl ?? shop.url}
                                    >
                                        {shop.viewUrl ?? shop.url}
                                    </a>
                                </div>
                            )}
                            {(shop.phone || shop.email) && (
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {shop.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" aria-hidden="true" />
                                            {shop.phone}
                                        </span>
                                    )}
                                    {shop.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" aria-hidden="true" />
                                            {shop.email}
                                        </span>
                                    )}
                                </div>
                            )}
                            {shop.structuredAddress && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                                    <span className="truncate">
                                        {[
                                            shop.structuredAddress.locality,
                                            shop.structuredAddress.country,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </span>
                                </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {t("partnerShops.updatedAt", {
                                    date: formatShortDate(shop.updated, i18n.language),
                                })}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditTarget(shop)}
                            aria-label={t("partnerShops.editAriaLabel", { shop: shop.name })}
                        >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">
                                {t("partnerShops.actions.edit")}
                            </span>
                        </Button>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <section className="flex flex-col gap-4" aria-labelledby="partner-shops-title">
            <header className="flex flex-col gap-1">
                <H2 id="partner-shops-title">{t("partnerShops.title")}</H2>
                <p className="text-sm text-muted-foreground md:text-base">
                    {t("partnerShops.description")}
                </p>
            </header>

            {renderContent()}

            <PartnerShopEditDialog
                shop={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setEditTarget(null);
                }}
            />
        </section>
    );
}

function PartnerShopsSkeleton() {
    const { t } = useTranslation();

    return (
        <div role="status" aria-live="polite">
            <span className="sr-only">{t("partnerShops.loading")}</span>
            <ul className="flex flex-col gap-2">
                {["partner-shop-skeleton-1", "partner-shop-skeleton-2"].map((id) => (
                    <li
                        key={id}
                        className="flex flex-col gap-3 border bg-surface-container-low p-3"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <Skeleton className="h-5 w-full max-w-64" />
                            <Skeleton className="h-6 w-24 rounded-none" />
                        </div>
                        <Skeleton className="h-3 w-full max-w-80" />
                        <Skeleton className="h-3 w-full max-w-56" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
