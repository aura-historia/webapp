import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ProductCard } from "@/features/product/catalog/components/cards/ProductCard.tsx";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { formatDateTime } from "@/lib/utils.ts";
import type { ListingLotFacts } from "@/data/internal/product/ProductListingDomain.ts";
import type { PublicAuction } from "@/data/internal/auction/Auction.ts";
import { useAuction, useAuctionCatalogue } from "../api/useAuctions.ts";

const SKELETON_KEYS = ["first", "second", "third", "fourth"] as const;

export function AuctionDetailPage({ auctionId }: { readonly auctionId: string }) {
    const { t, i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const auctionQuery = useAuction(auctionId);
    const catalogueQuery = useAuctionCatalogue(auctionId, i18n.language, preferences.currency);

    if (auctionQuery.isPending) {
        return (
            <main
                className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6"
                aria-busy="true"
            >
                <Skeleton className="h-14 w-2/3" />
                <Skeleton className="h-48 w-full" />
            </main>
        );
    }

    if (auctionQuery.error || !auctionQuery.data) {
        return (
            <main className="mx-auto grid w-full max-w-6xl justify-items-start gap-4 px-4 py-10 sm:px-6">
                <h1 className="font-display text-3xl italic">
                    {auctionQuery.error instanceof Error &&
                    "status" in auctionQuery.error &&
                    auctionQuery.error.status === 404
                        ? t("auctions.errors.missing")
                        : t("auctions.errors.requestFailed")}
                </h1>
                <Link
                    to="/$lng/auctions"
                    params={true}
                    from="/$lng"
                    className="text-primary underline-offset-4 hover:underline"
                >
                    {t("auctions.actions.backToDirectory")}
                </Link>
            </main>
        );
    }

    const auction = auctionQuery.data;
    const items = catalogueQuery.data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6">
            <Link
                to="/$lng/auctions"
                params={true}
                from="/$lng"
                className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
                {t("auctions.actions.backToDirectory")}
            </Link>
            <AuctionOverview auction={auction} />
            <section className="grid gap-5" aria-labelledby="auction-catalogue-title">
                <header className="grid gap-2">
                    <h2 id="auction-catalogue-title" className="font-display text-3xl italic">
                        {t("auctions.catalogue.title")}
                    </h2>
                    {catalogueQuery.data && (
                        <p className="text-sm text-muted-foreground">
                            {t("auctions.catalogue.visibleCount", {
                                count: auction.visibleListingCount,
                            })}
                        </p>
                    )}
                </header>
                {catalogueQuery.isPending ? (
                    <div
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        aria-busy="true"
                    >
                        {SKELETON_KEYS.map((key) => (
                            <Skeleton key={key} className="h-[30rem] w-full" />
                        ))}
                    </div>
                ) : catalogueQuery.error && items.length === 0 ? (
                    <div className="grid justify-items-start gap-3 py-6" role="alert">
                        <p className="text-muted-foreground">{catalogueQuery.error.message}</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => catalogueQuery.refetch()}
                        >
                            {t("auctions.actions.retry")}
                        </Button>
                    </div>
                ) : items.length === 0 ? (
                    <p className="py-8 text-muted-foreground">{t("auctions.catalogue.empty")}</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map(({ product, detail }) => (
                                <div
                                    key={product.productListingId}
                                    className="grid content-start gap-3"
                                >
                                    <ProductCard product={product} />
                                    <LotFacts lot={detail.lot} />
                                </div>
                            ))}
                        </div>
                        {catalogueQuery.error && (
                            <p role="alert" className="text-sm text-destructive">
                                {catalogueQuery.error.message}
                            </p>
                        )}
                        {catalogueQuery.hasNextPage && (
                            <Button
                                type="button"
                                variant="outline"
                                className="justify-self-center"
                                disabled={catalogueQuery.isFetchingNextPage}
                                onClick={() => catalogueQuery.fetchNextPage()}
                            >
                                {catalogueQuery.isFetchingNextPage
                                    ? t("auctions.actions.loadingMore")
                                    : t("auctions.actions.loadMore")}
                            </Button>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

function AuctionOverview({ auction }: { readonly auction: PublicAuction }) {
    const { t, i18n } = useTranslation();
    const scheduleFacts = [
        ["biddingOpens", auction.schedule.biddingOpens],
        ["liveStarts", auction.schedule.liveStarts],
        ["lotsBeginClosing", auction.schedule.lotsBeginClosing],
        ["scheduledEnd", auction.schedule.scheduledEnd],
    ] as const;

    return (
        <section className="grid gap-6 border bg-card p-6 sm:p-8" aria-labelledby="auction-title">
            <div className="grid gap-3">
                <H1 id="auction-title">{auction.name?.text || t("auctions.nameNotProvided")}</H1>
                <Link
                    to="/$lng/shops/$shopSlugId"
                    params={(current) => ({ ...current, shopSlugId: auction.listingSource.slugId })}
                    from="/$lng"
                    className="w-fit text-sm uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground hover:underline"
                >
                    {auction.listingSource.name}
                </Link>
            </div>
            <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {auction.format && (
                    <Fact label={t("auctions.fields.format")}>
                        {t(`auctions.formats.${auction.format}`)}
                    </Fact>
                )}
                <Fact label={t("auctions.fields.reportedStatus")}>
                    {auction.reportedStatus
                        ? t(`auctions.reportedStatuses.${auction.reportedStatus}`)
                        : t("auctions.statusNotReported")}
                </Fact>
                {auction.reportedLotCount !== null && (
                    <Fact label={t("auctions.fields.reportedLotCount")}>
                        {t("auctions.count", { count: auction.reportedLotCount })}
                    </Fact>
                )}
                <Fact label={t("auctions.fields.visibleListings")}>
                    {t("auctions.count", { count: auction.visibleListingCount })}
                </Fact>
                {scheduleFacts.map(([role, value]) =>
                    value ? (
                        <Fact key={role} label={t(`auctions.schedule.${role}`)}>
                            <time dateTime={value.toISOString()}>
                                {formatDateTime(value, i18n.language, "UTC")} UTC
                            </time>
                        </Fact>
                    ) : null,
                )}
            </dl>
            <div className="flex flex-wrap gap-3">
                {auction.catalogueUrl && (
                    <a
                        href={auction.catalogueUrl.href}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {t("auctions.actions.openSourceCatalogue")}
                    </a>
                )}
                {auction.viewUrl && auction.viewUrl.href !== auction.catalogueUrl?.href && (
                    <a
                        href={auction.viewUrl.href}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {t("auctions.actions.openAuctionPage")}
                    </a>
                )}
            </div>
        </section>
    );
}

function LotFacts({ lot }: { readonly lot: ListingLotFacts | null }) {
    const { t, i18n } = useTranslation();
    if (!lot) return null;

    const timeFacts = [
        ["biddingOpens", lot.biddingOpens],
        ["scheduledCloses", lot.scheduledCloses],
        ["reportedClosedAt", lot.reportedClosedAt],
    ] as const;
    const hasFacts = Boolean(
        lot.lotNumber ||
            lot.cataloguePosition !== null ||
            timeFacts.some(([, value]) => value !== null),
    );
    if (!hasFacts) return null;

    return (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border bg-surface-container-low p-4 text-sm">
            {lot.lotNumber && <Fact label={t("auctions.lot.lotNumber")}>{lot.lotNumber}</Fact>}
            {lot.cataloguePosition !== null && (
                <Fact label={t("auctions.lot.cataloguePosition")}>
                    {t("auctions.count", { count: lot.cataloguePosition })}
                </Fact>
            )}
            {timeFacts.map(([role, value]) =>
                value ? (
                    <Fact key={role} label={t(`auctions.lot.${role}`)}>
                        <time dateTime={value.toISOString()}>
                            {formatDateTime(value, i18n.language, "UTC")} UTC
                        </time>
                    </Fact>
                ) : null,
            )}
        </dl>
    );
}

function Fact({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}
