import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { AdminAuction } from "@/data/internal/auction/AdminAuction.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { useAdminAuctions } from "../api/useAdminAuctions.ts";
import { AdminAuctionFiltersForm } from "../components/AdminAuctionFiltersForm.tsx";
import type { AdminAuctionFilters } from "../lib/adminAuctionSearch.ts";

export function AdminAuctionsPage({
    language,
    filters,
    onFiltersChange,
}: {
    readonly language: string;
    readonly filters: AdminAuctionFilters;
    readonly onFiltersChange: (filters: AdminAuctionFilters) => void;
}) {
    const { t } = useTranslation();

    return (
        <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-2">
                    <H1>{t("adminAuctions.title")}</H1>
                    <p className="max-w-3xl text-muted-foreground">
                        {t("adminAuctions.description")}
                    </p>
                </div>
                <Button asChild>
                    <Link to="/$lng/admin/auctions/new" params={{ lng: language }}>
                        {t("adminAuctions.actions.create")}
                    </Link>
                </Button>
            </header>

            <section className="grid gap-4" aria-labelledby="admin-auction-directory-title">
                <div className="grid gap-2">
                    <h2 id="admin-auction-directory-title" className="font-display text-2xl italic">
                        {t("adminAuctions.list.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t("adminAuctions.list.description")}
                    </p>
                </div>
                <AdminAuctionFiltersForm
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onApply={onFiltersChange}
                />
                <AdminAuctionResults language={language} filters={filters} />
            </section>
        </main>
    );
}

function AdminAuctionResults({
    language,
    filters,
}: {
    readonly language: string;
    readonly filters: AdminAuctionFilters;
}) {
    const { t } = useTranslation();
    const auctionsQuery = useAdminAuctions(filters);
    const auctions = auctionsQuery.data?.pages.flatMap((page) => page.items) ?? [];

    if (auctionsQuery.error && auctions.length === 0) {
        return (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{auctionsQuery.error.message}</p>
                <Button variant="outline" onClick={() => auctionsQuery.refetch()}>
                    {t("adminAuctions.actions.retry")}
                </Button>
            </div>
        );
    }
    if (auctionsQuery.isPending) {
        return (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminAuctions.list.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-28 w-full" />
                ))}
            </div>
        );
    }
    if (auctions.length === 0) {
        return <p className="py-6 text-muted-foreground">{t("adminAuctions.list.empty")}</p>;
    }

    return (
        <div className="grid gap-3">
            <ul className="grid gap-2" aria-labelledby="admin-auction-directory-title">
                {auctions.map((auction) => (
                    <AdminAuctionRow
                        key={auction.auctionId}
                        auction={auction}
                        language={language}
                    />
                ))}
            </ul>
            {auctionsQuery.error && (
                <p role="alert" className="text-sm text-destructive">
                    {auctionsQuery.error.message}
                </p>
            )}
            {auctionsQuery.hasNextPage ? (
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-center"
                    disabled={auctionsQuery.isFetchingNextPage}
                    onClick={() => auctionsQuery.fetchNextPage()}
                >
                    {auctionsQuery.isFetchingNextPage
                        ? t("adminAuctions.actions.loadingMore")
                        : t("adminAuctions.list.loadMore")}
                </Button>
            ) : (
                <p className="justify-self-center text-sm text-muted-foreground">
                    {t("adminAuctions.list.end")}
                </p>
            )}
        </div>
    );
}

function AdminAuctionRow({
    auction,
    language,
}: {
    readonly auction: AdminAuction;
    readonly language: string;
}) {
    const { t, i18n } = useTranslation();
    return (
        <li className="flex flex-wrap items-center justify-between gap-4 border bg-surface-container-low p-4">
            <div className="grid min-w-0 gap-2">
                {auction.name ? (
                    <p className="break-words font-medium" lang={auction.name.language}>
                        {auction.name.text}
                    </p>
                ) : (
                    <p className="font-medium text-muted-foreground italic">
                        {t("adminAuctions.list.noName")}
                    </p>
                )}
                <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
                    <SummaryRow label={t("adminAuctions.fields.sourceAuctionId")}>
                        <span className="break-all font-mono">{auction.sourceAuctionId}</span>
                    </SummaryRow>
                    <SummaryRow label={t("adminAuctions.fields.listingSourceId")}>
                        <span className="break-all font-mono">{auction.listingSourceId}</span>
                    </SummaryRow>
                    <SummaryRow label={t("adminAuctions.fields.auctionId")}>
                        <span className="break-all font-mono">{auction.auctionId}</span>
                    </SummaryRow>
                </dl>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {t("adminAuctions.fields.format")}:{" "}
                        {auction.format
                            ? t(`adminAuctions.formats.${auction.format}`)
                            : t("adminAuctions.fields.notSet")}
                    </span>
                    <span>
                        {t("adminAuctions.fields.reportedStatus")}:{" "}
                        {auction.reportedStatus
                            ? t(`adminAuctions.reportedStatuses.${auction.reportedStatus}`)
                            : t("adminAuctions.fields.notSet")}
                    </span>
                    <span>
                        {t("adminAuctions.fields.created")}:{" "}
                        <time dateTime={auction.created.toISOString()}>
                            {formatDateTime(auction.created, i18n.language, "UTC")}
                        </time>
                    </span>
                    <span>
                        {t("adminAuctions.fields.updated")}:{" "}
                        <time dateTime={auction.updated.toISOString()}>
                            {formatDateTime(auction.updated, i18n.language, "UTC")}
                        </time>
                    </span>
                </div>
            </div>
            <Button asChild variant="outline">
                <Link
                    to="/$lng/admin/auctions/$auctionId"
                    params={{ lng: language, auctionId: auction.auctionId }}
                    aria-label={t("adminAuctions.list.openLabel", {
                        label: auction.name?.text ?? auction.sourceAuctionId,
                    })}
                >
                    {t("adminAuctions.actions.open")}
                </Link>
            </Button>
        </li>
    );
}

function SummaryRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    return (
        <div className="contents">
            <dt>{label}</dt>
            <dd className="min-w-0">{children}</dd>
        </div>
    );
}
