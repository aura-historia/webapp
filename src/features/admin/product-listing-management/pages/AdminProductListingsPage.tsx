import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { AdminProductListingSummary } from "@/data/internal/product/AdminProductListing.ts";
import { useAdminProductListings } from "../api/useAdminProductListings.ts";
import { AdminProductListingFiltersForm } from "../components/AdminProductListingFiltersForm.tsx";
import {
    AdminProductListingLifecycleBadge,
    UtcDateTime,
    useAvailabilityLabel,
    useSourcePriceLabel,
} from "../components/AdminProductListingPresentation.tsx";
import type { AdminProductListingFilters } from "../lib/adminProductListingSearch.ts";

export function AdminProductListingsPage({
    language,
    filters,
    onFiltersChange,
}: {
    readonly language: string;
    readonly filters: AdminProductListingFilters;
    readonly onFiltersChange: (filters: AdminProductListingFilters) => void;
}) {
    const { t } = useTranslation();

    return (
        <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6">
            <header className="grid gap-2">
                <H1>{t("adminProductListings.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">
                    {t("adminProductListings.description")}
                </p>
            </header>

            <section className="grid gap-4" aria-labelledby="admin-product-listing-directory-title">
                <div className="grid gap-2">
                    <h2
                        id="admin-product-listing-directory-title"
                        className="font-display text-2xl italic"
                    >
                        {t("adminProductListings.list.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t("adminProductListings.list.description")}
                    </p>
                </div>
                <AdminProductListingFiltersForm
                    key={JSON.stringify(filters)}
                    filters={filters}
                    onApply={onFiltersChange}
                />
                <AdminProductListingResults language={language} filters={filters} />
            </section>
        </main>
    );
}

function AdminProductListingResults({
    language,
    filters,
}: {
    readonly language: string;
    readonly filters: AdminProductListingFilters;
}) {
    const { t } = useTranslation();
    const listingsQuery = useAdminProductListings(filters);
    const listings = listingsQuery.data?.pages.flatMap((page) => page.items) ?? [];

    if (listingsQuery.error && listings.length === 0) {
        return (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{listingsQuery.error.message}</p>
                <Button variant="outline" onClick={() => listingsQuery.refetch()}>
                    {t("adminProductListings.actions.retry")}
                </Button>
            </div>
        );
    }
    if (listingsQuery.isPending) {
        return (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">{t("adminProductListings.list.loading")}</output>
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-36 w-full" />
                ))}
            </div>
        );
    }
    if (listings.length === 0) {
        return <p className="py-6 text-muted-foreground">{t("adminProductListings.list.empty")}</p>;
    }

    return (
        <div className="grid gap-3">
            <ul className="grid gap-2" aria-labelledby="admin-product-listing-directory-title">
                {listings.map((listing) => (
                    <AdminProductListingRow
                        key={listing.productListingId}
                        listing={listing}
                        language={language}
                    />
                ))}
            </ul>
            {listingsQuery.error && (
                <p role="alert" className="text-sm text-destructive">
                    {listingsQuery.error.message}
                </p>
            )}
            {listingsQuery.hasNextPage ? (
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-center"
                    disabled={listingsQuery.isFetchingNextPage}
                    onClick={() => listingsQuery.fetchNextPage()}
                >
                    {listingsQuery.isFetchingNextPage
                        ? t("adminProductListings.actions.loadingMore")
                        : t("adminProductListings.list.loadMore")}
                </Button>
            ) : (
                <p className="justify-self-center text-sm text-muted-foreground">
                    {t("adminProductListings.list.end")}
                </p>
            )}
        </div>
    );
}

function AdminProductListingRow({
    listing,
    language,
}: {
    readonly listing: AdminProductListingSummary;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const availabilityLabel = useAvailabilityLabel();
    const priceLabel = useSourcePriceLabel();
    return (
        <li className="flex flex-wrap items-center justify-between gap-4 border bg-surface-container-low p-4">
            <div className="grid min-w-0 flex-1 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <AdminProductListingLifecycleBadge lifecycle={listing.lifecycle} />
                    {listing.title ? (
                        <p className="break-words font-medium" lang={listing.title.language}>
                            {listing.title.text}
                        </p>
                    ) : (
                        <p className="font-medium text-muted-foreground italic">
                            {t("adminProductListings.list.noTitle")}
                        </p>
                    )}
                </div>
                <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
                    <SummaryRow label={t("adminProductListings.fields.listingSource")}>
                        {listing.source.name}{" "}
                        <span className="break-all font-mono">
                            ({listing.source.listingSourceId})
                        </span>
                    </SummaryRow>
                    <SummaryRow label={t("adminProductListings.fields.sourceListingId")}>
                        <span className="break-all font-mono">{listing.sourceListingId}</span>
                    </SummaryRow>
                    <SummaryRow label={t("adminProductListings.fields.productListingId")}>
                        <span className="break-all font-mono">{listing.productListingId}</span>
                    </SummaryRow>
                </dl>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {t("adminProductListings.fields.availability")}:{" "}
                        {availabilityLabel(listing.availability)}
                    </span>
                    <span>
                        {t("adminProductListings.fields.price")}: {priceLabel.price(listing.price)}
                    </span>
                    {(listing.priceEstimateMin || listing.priceEstimateMax) && (
                        <span>
                            {t("adminProductListings.fields.estimate")}:{" "}
                            {priceLabel.estimate(
                                listing.priceEstimateMin,
                                listing.priceEstimateMax,
                            )}
                        </span>
                    )}
                    <span>
                        {t("adminProductListings.fields.created")}:{" "}
                        <UtcDateTime value={listing.created} />
                    </span>
                    <span>
                        {t("adminProductListings.fields.updated")}:{" "}
                        <UtcDateTime value={listing.updated} />
                    </span>
                </div>
            </div>
            <Button asChild variant="outline">
                <Link
                    to="/$lng/admin/product-listings/$productListingId"
                    params={{ lng: language, productListingId: listing.productListingId }}
                    aria-label={t("adminProductListings.list.openLabel", {
                        label: listing.title?.text ?? listing.sourceListingId,
                    })}
                >
                    {t("adminProductListings.actions.open")}
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
