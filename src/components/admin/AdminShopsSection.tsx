import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Pencil, Search, ShieldCheck, Globe, Plus, Mail, Phone, MapPin } from "lucide-react";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    SHOP_PARTNER_STATUSES,
    SHOP_PARTNER_STATUS_TRANSLATION_CONFIG,
    type ShopPartnerStatus,
} from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG, type ShopType } from "@/data/internal/shop/ShopType.ts";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useAdminShops } from "@/hooks/admin/useAdminShops.ts";
import { formatShortDate } from "@/lib/utils.ts";
import { AdminShopEditDialog } from "@/components/admin/AdminShopEditDialog.tsx";
import { AdminShopCreateDialog } from "@/components/admin/AdminShopCreateDialog.tsx";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";

function shopTypeLabel(t: (k: string) => string, shopType: ShopType): string {
    return t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey);
}

function partnerStatusLabel(t: (k: string) => string, status: ShopPartnerStatus): string {
    return t(SHOP_PARTNER_STATUS_TRANSLATION_CONFIG[status].translationKey);
}

export function AdminShopsSection() {
    const { t, i18n } = useTranslation();
    const [nameInput, setNameInput] = useState("");
    const [appliedName, setAppliedName] = useState("");
    const [partnerFilter, setPartnerFilter] = useState<ShopPartnerStatus | "ALL">("ALL");
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ShopDetail | null>(null);
    const { ref: loadMoreRef, inView } = useInView();

    const filters = useMemo(
        () => ({
            nameQuery: appliedName || undefined,
            partnerStatus: partnerFilter === "ALL" ? undefined : [partnerFilter],
        }),
        [appliedName, partnerFilter],
    );

    const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useAdminShops(filters);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const items = data?.pages.flatMap((p) => p.items) ?? [];
    const total = data?.pages[0]?.total;

    return (
        <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                    <H1>{t("adminDashboard.shops.title")}</H1>
                    <p className="text-base text-muted-foreground">
                        {t("adminDashboard.shops.description")}
                    </p>
                </div>
                <Button type="button" onClick={() => setCreateOpen(true)} className="sm:self-start">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t("adminDashboard.shops.actions.create")}
                </Button>
            </header>

            <form
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
                onSubmit={(e) => {
                    e.preventDefault();
                    setAppliedName(nameInput.trim());
                }}
            >
                <div className="relative flex-1">
                    <Search
                        className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder={t("adminDashboard.shops.searchPlaceholder")}
                        aria-label={t("adminDashboard.shops.searchPlaceholder")}
                        className="pl-8"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={partnerFilter === "ALL" ? "default" : "outline"}
                        onClick={() => setPartnerFilter("ALL")}
                    >
                        {t("adminDashboard.shops.filter.all")}
                    </Button>
                    {SHOP_PARTNER_STATUSES.map((status) => (
                        <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant={partnerFilter === status ? "default" : "outline"}
                            onClick={() => setPartnerFilter(status)}
                        >
                            {partnerStatusLabel(t, status)}
                        </Button>
                    ))}
                </div>
            </form>

            {isPending ? (
                <div className="flex justify-center py-10" role="status" aria-live="polite">
                    <Spinner />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.shops.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        {t("adminDashboard.actions.retry")}
                    </Button>
                </div>
            ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    {t("adminDashboard.shops.empty")}
                </p>
            ) : (
                <>
                    {total !== undefined && (
                        <p className="text-xs text-muted-foreground">
                            {t("adminDashboard.shops.totalCount", { count: total })}
                        </p>
                    )}
                    <ul className="flex flex-col gap-2">
                        {items.map((shop) => (
                            <li
                                key={shop.shopId}
                                className="flex flex-row items-start gap-3 rounded-md border bg-surface-container-low p-3"
                            >
                                <div className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted sm:block">
                                    {shop.image ? (
                                        <ImageWithFallback
                                            src={shop.image}
                                            alt={t("adminDashboard.shops.shopImageAlt", {
                                                shop: shop.name,
                                            })}
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
                                        <Badge
                                            variant={
                                                shop.partnerStatus === "PARTNERED"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="gap-1"
                                        >
                                            {shop.partnerStatus === "PARTNERED" && (
                                                <ShieldCheck
                                                    className="h-3 w-3"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {partnerStatusLabel(t, shop.partnerStatus)}
                                        </Badge>
                                        <Badge variant="outline">
                                            {shopTypeLabel(t, shop.shopType)}
                                        </Badge>
                                    </div>
                                    {shop.domains.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                            <Globe className="h-3 w-3" aria-hidden="true" />
                                            <span
                                                className="truncate"
                                                title={shop.domains.join(", ")}
                                            >
                                                {shop.domains.join(", ")}
                                            </span>
                                        </div>
                                    )}
                                    {shop.url && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Globe
                                                className="h-3 w-3 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <a
                                                href={shop.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate underline underline-offset-2"
                                                title={shop.url}
                                            >
                                                {shop.url}
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
                                            <MapPin
                                                className="h-3 w-3 shrink-0"
                                                aria-hidden="true"
                                            />
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
                                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                                        <span title={shop.shopId} className="font-mono">
                                            {shop.shopSlugId}
                                        </span>
                                        <span>
                                            {t("adminDashboard.shops.updatedAt", {
                                                date: formatShortDate(shop.updated, i18n.language),
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditTarget(shop)}
                                    aria-label={t("adminDashboard.shops.editAriaLabel", {
                                        shop: shop.name,
                                    })}
                                >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">
                                        {t("adminDashboard.actions.edit")}
                                    </span>
                                </Button>
                            </li>
                        ))}
                    </ul>
                    {hasNextPage && (
                        <div ref={loadMoreRef} className="flex justify-center py-4">
                            {isFetchingNextPage ? <Spinner /> : null}
                        </div>
                    )}
                </>
            )}

            <AdminShopCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
            <AdminShopEditDialog
                shop={editTarget}
                open={editTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setEditTarget(null);
                }}
            />
        </section>
    );
}
