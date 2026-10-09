import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type {
    ListingAuctionSummary,
    ListingLotFacts,
} from "@/data/internal/product/ProductListingDomain.ts";
import { formatDateTime } from "@/lib/utils.ts";

const EMPTY_SCHEDULE = {
    biddingOpens: null,
    liveStarts: null,
    lotsBeginClosing: null,
    scheduledEnd: null,
} as const;

export function AuctionListingFacts({
    auction,
    lot,
}: {
    readonly auction: ListingAuctionSummary | null;
    readonly lot: ListingLotFacts | null;
}) {
    const { t, i18n } = useTranslation();
    const schedule = auction?.schedule ?? EMPTY_SCHEDULE;
    const scheduleFacts = [
        ["biddingOpens", schedule.biddingOpens],
        ["liveStarts", schedule.liveStarts],
        ["lotsBeginClosing", schedule.lotsBeginClosing],
        ["scheduledEnd", schedule.scheduledEnd],
    ] as const;
    const lotFacts = [
        ["biddingOpens", lot?.biddingOpens ?? null],
        ["scheduledCloses", lot?.scheduledCloses ?? null],
        ["reportedClosedAt", lot?.reportedClosedAt ?? null],
    ] as const;
    const hasLotFacts = Boolean(
        lot?.lotNumber ||
            (lot?.cataloguePosition !== null && lot?.cataloguePosition !== undefined) ||
            lotFacts.some(([, value]) => value !== null),
    );

    if (!auction && !hasLotFacts) return null;

    return (
        <section
            className="mt-6 grid gap-4 border-t border-outline-variant/30 pt-5"
            aria-label={t("product.auction.section")}
        >
            {auction && (
                <div className="grid gap-3">
                    <Link
                        to="/$lng/auctions/$auctionId"
                        params={(current) => ({ ...current, auctionId: auction.auctionId })}
                        from="/$lng"
                        className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {auction.name?.text || t("product.auction.view")}
                    </Link>
                    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                        {auction.format && (
                            <Fact label={t("auctions.fields.format")}>
                                {t(`auctions.formats.${auction.format}`)}
                            </Fact>
                        )}
                        {auction.reportedStatus && (
                            <Fact label={t("auctions.fields.reportedStatus")}>
                                {t(`auctions.reportedStatuses.${auction.reportedStatus}`)}
                            </Fact>
                        )}
                        {scheduleFacts.map(([role, value]) =>
                            value ? (
                                <Fact key={role} label={t(`auctions.schedule.${role}`)}>
                                    <UtcTime value={value} locale={i18n.language} />
                                </Fact>
                            ) : null,
                        )}
                    </dl>
                </div>
            )}
            {hasLotFacts && lot && (
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    {lot.lotNumber && (
                        <Fact label={t("auctions.lot.lotNumber")}>{lot.lotNumber}</Fact>
                    )}
                    {lot.cataloguePosition !== null && (
                        <Fact label={t("auctions.lot.cataloguePosition")}>
                            {lot.cataloguePosition}
                        </Fact>
                    )}
                    {lotFacts.map(([role, value]) =>
                        value ? (
                            <Fact key={role} label={t(`auctions.lot.${role}`)}>
                                <UtcTime value={value} locale={i18n.language} />
                            </Fact>
                        ) : null,
                    )}
                </dl>
            )}
        </section>
    );
}

function UtcTime({ value, locale }: { readonly value: Date; readonly locale: string }) {
    return <time dateTime={value.toISOString()}>{formatDateTime(value, locale, "UTC")} UTC</time>;
}

function Fact({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}
