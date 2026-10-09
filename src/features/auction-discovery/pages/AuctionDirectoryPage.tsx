import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { formatDateTime } from "@/lib/utils.ts";
import type {
    AuctionDirectoryFilters,
    AuctionDirectoryItem,
} from "@/data/internal/auction/Auction.ts";
import { useAuctionDirectory } from "../api/useAuctions.ts";
import { AuctionDirectoryFiltersForm } from "../components/AuctionDirectoryFiltersForm.tsx";

const SKELETON_KEYS = ["first", "second", "third"] as const;

export function AuctionDirectoryPage() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<AuctionDirectoryFilters>({});
    const directory = useAuctionDirectory(filters);
    const items = directory.data?.pages.flatMap((page) => page.items) ?? [];

    let results: ReactNode;
    if (directory.isPending) {
        results = (
            <div className="grid gap-4" aria-busy="true">
                <output className="sr-only">{t("auctions.loading")}</output>
                {SKELETON_KEYS.map((key) => (
                    <Skeleton key={key} className="h-48 w-full" />
                ))}
            </div>
        );
    } else if (directory.error && items.length === 0) {
        results = (
            <div className="grid justify-items-start gap-3 py-6" role="alert">
                <p className="text-muted-foreground">{directory.error.message}</p>
                <Button type="button" variant="outline" onClick={() => directory.refetch()}>
                    {t("auctions.actions.retry")}
                </Button>
            </div>
        );
    } else if (items.length === 0) {
        results = <p className="py-8 text-muted-foreground">{t("auctions.empty")}</p>;
    } else {
        results = (
            <div className="grid gap-4">
                <ul className="grid gap-4">
                    {items.map((item) => (
                        <AuctionDirectoryCard key={item.auctionId} auction={item} />
                    ))}
                </ul>
                {directory.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {directory.error.message}
                    </p>
                )}
                {directory.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={directory.isFetchingNextPage}
                        onClick={() => directory.fetchNextPage()}
                    >
                        {directory.isFetchingNextPage
                            ? t("auctions.actions.loadingMore")
                            : t("auctions.actions.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6">
            <header className="grid gap-2">
                <H1>{t("auctions.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">{t("auctions.description")}</p>
            </header>
            <AuctionDirectoryFiltersForm
                key={JSON.stringify(filters)}
                filters={filters}
                onApply={setFilters}
            />
            <section className="grid gap-4" aria-label={t("auctions.results")}>
                {results}
            </section>
        </main>
    );
}

function AuctionDirectoryCard({ auction }: { readonly auction: AuctionDirectoryItem }) {
    const { t, i18n } = useTranslation();
    const scheduleFacts = [
        ["biddingOpens", auction.schedule.biddingOpens],
        ["liveStarts", auction.schedule.liveStarts],
        ["lotsBeginClosing", auction.schedule.lotsBeginClosing],
        ["scheduledEnd", auction.schedule.scheduledEnd],
    ] as const;

    return (
        <li>
            <article className="grid gap-4 border bg-card p-5 sm:p-6">
                <div className="grid gap-2">
                    <h2 className="font-display text-2xl italic">
                        <Link
                            to="/$lng/auctions/$auctionId"
                            params={(current) => ({ ...current, auctionId: auction.auctionId })}
                            from="/$lng"
                            className="transition-colors hover:text-primary"
                        >
                            {auction.name?.text || t("auctions.nameNotProvided")}
                        </Link>
                    </h2>
                    <Link
                        to="/$lng/shops/$shopSlugId"
                        params={(current) => ({
                            ...current,
                            shopSlugId: auction.listingSource.slugId,
                        })}
                        from="/$lng"
                        className="w-fit text-sm uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground hover:underline"
                    >
                        {auction.listingSource.name}
                    </Link>
                </div>
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
                    {scheduleFacts.map(([role, value]) =>
                        value ? (
                            <Fact key={role} label={t(`auctions.schedule.${role}`)}>
                                <time dateTime={value.toISOString()}>
                                    {formatDateTime(value, i18n.language, "UTC")} UTC
                                </time>
                            </Fact>
                        ) : null,
                    )}
                    <Fact label={t("auctions.fields.added")}>
                        <time dateTime={auction.created.toISOString()}>
                            {formatDateTime(auction.created, i18n.language, "UTC")} UTC
                        </time>
                    </Fact>
                </dl>
                <Link
                    to="/$lng/auctions/$auctionId"
                    params={(current) => ({ ...current, auctionId: auction.auctionId })}
                    from="/$lng"
                    className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                    {t("auctions.actions.viewCatalogue")}
                </Link>
            </article>
        </li>
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
