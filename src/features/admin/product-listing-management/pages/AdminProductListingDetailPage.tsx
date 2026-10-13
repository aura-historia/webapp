import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import {
    type AdminProductListingErrorReason,
    AdminProductListingRequestError,
    useAdminProductListing,
} from "../api/useAdminProductListings.ts";
import { AdminProductListingEditForm } from "../components/AdminProductListingEditForm.tsx";
import { AdminProductListingLifecycleSection } from "../components/AdminProductListingLifecycleSection.tsx";
import { toHttpUrl } from "../lib/adminProductListingForm.ts";
import {
    ReadOnlyFact,
    UtcDateTime,
    useAvailabilityLabel,
    useSourcePriceLabel,
} from "../components/AdminProductListingPresentation.tsx";

/** Responses after which previously loaded data must no longer be shown. */
const ACCESS_LOSS_REASONS = new Set<AdminProductListingErrorReason>([
    "forbidden",
    "missing",
    "invalidId",
]);

export function AdminProductListingDetailPage({
    productListingId,
    language,
}: {
    readonly productListingId: string;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const listingQuery = useAdminProductListing(productListingId);
    const error =
        listingQuery.error instanceof AdminProductListingRequestError
            ? listingQuery.error
            : undefined;
    const accessLost = error !== undefined && ACCESS_LOSS_REASONS.has(error.reason);

    if (listingQuery.isPending) {
        return (
            <main
                className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6"
                aria-busy="true"
            >
                <output className="sr-only">{t("adminProductListings.detail.loading")}</output>
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-[34rem] w-full" />
            </main>
        );
    }

    if (!listingQuery.data || accessLost) {
        return (
            <main className="mx-auto grid w-full max-w-5xl justify-items-start gap-4 px-4 py-10 sm:px-6">
                <BackToDirectory language={language} />
                <H1>
                    {error?.reason === "missing" || error?.reason === "invalidId"
                        ? t("adminProductListings.detail.unavailableTitle")
                        : t("adminProductListings.detail.errorTitle")}
                </H1>
                <p role="alert" className="text-muted-foreground">
                    {listingQuery.error?.message ?? t("adminProductListings.errors.requestFailed")}
                </p>
                {!accessLost && (
                    <Button variant="outline" onClick={() => listingQuery.refetch()}>
                        {t("adminProductListings.actions.retry")}
                    </Button>
                )}
            </main>
        );
    }

    const listing = listingQuery.data;
    return (
        <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6">
            <header className="grid gap-2">
                <BackToDirectory language={language} />
                <p className="text-sm text-muted-foreground">
                    {t("adminProductListings.detail.eyebrow")}
                </p>
                {listing.title ? (
                    <H1 lang={listing.title.language}>{listing.title.text}</H1>
                ) : (
                    <H1>{t("adminProductListings.list.noTitle")}</H1>
                )}
            </header>
            <p className="border border-primary/30 bg-primary/5 p-4 text-sm">
                {t("adminProductListings.detail.convergence")}
            </p>
            {listingQuery.error && (
                <div role="alert" className="grid justify-items-start gap-2">
                    <p className="text-sm text-destructive">{listingQuery.error.message}</p>
                    <Button variant="outline" size="sm" onClick={() => listingQuery.refetch()}>
                        {t("adminProductListings.actions.retry")}
                    </Button>
                </div>
            )}
            <AdminProductListingFacts listing={listing} language={language} />
            <AdminProductListingLifecycleSection listing={listing} />
            <AdminProductListingEditForm
                key={listing.productListingId}
                listing={listing}
                language={language}
            />
        </main>
    );
}

function AdminProductListingFacts({
    listing,
    language,
}: {
    readonly listing: AdminProductListingDetail;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const availabilityLabel = useAvailabilityLabel();
    const priceLabel = useSourcePriceLabel();

    return (
        <section className="grid gap-4" aria-labelledby="admin-product-listing-facts-title">
            <div className="grid gap-2">
                <h2 id="admin-product-listing-facts-title" className="font-display text-2xl italic">
                    {t("adminProductListings.detail.factsTitle")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("adminProductListings.detail.factsDescription")}
                </p>
            </div>
            <dl className="grid gap-x-6 gap-y-4 border bg-surface-container-low p-5 sm:grid-cols-2 lg:grid-cols-3">
                <ReadOnlyFact label={t("adminProductListings.fields.productListingId")} mono>
                    {listing.productListingId}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.slug")} mono>
                    {listing.productListingTitleSlugId}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.version")} mono>
                    {listing.expectedVersion}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.listingSource")}>
                    {listing.source.name}
                    <span className="block break-all font-mono text-xs text-muted-foreground">
                        {listing.source.listingSourceId} · {listing.source.slugId}
                    </span>
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.sourceListingId")}>
                    <span className="break-all font-mono text-xs">{listing.sourceListingId}</span>
                    <span className="block text-xs text-muted-foreground">
                        {t("adminProductListings.detail.sourceListingIdScope")}
                    </span>
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.availability")}>
                    {availabilityLabel(listing.availability)}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.price")}>
                    {priceLabel.price(listing.price)}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.estimate")}>
                    {priceLabel.estimate(listing.priceEstimateMin, listing.priceEstimateMax)}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.saleObservation")}>
                    {listing.saleObservation ? (
                        <>
                            <UtcDateTime value={listing.saleObservation.observedAt} />
                            <span className="block break-all font-mono text-xs text-muted-foreground">
                                {listing.saleObservation.fxRateId}
                            </span>
                        </>
                    ) : (
                        t("adminProductListings.detail.noSaleObservation")
                    )}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.created")}>
                    <UtcDateTime value={listing.created} />
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.updated")}>
                    <UtcDateTime value={listing.updated} />
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.url")}>
                    <OriginalUrl url={listing.url} />
                </ReadOnlyFact>
            </dl>
            <dl className="grid gap-4 border bg-surface-container-low p-5">
                <ReadOnlyFact label={t("adminProductListings.fields.originalTitle")}>
                    {listing.title ? (
                        <span lang={listing.title.language}>
                            {listing.title.text}{" "}
                            <span className="text-xs text-muted-foreground uppercase">
                                ({listing.title.language})
                            </span>
                        </span>
                    ) : (
                        t("adminProductListings.detail.noText")
                    )}
                </ReadOnlyFact>
                <ReadOnlyFact label={t("adminProductListings.fields.originalDescription")}>
                    {listing.description ? (
                        <span
                            className="block whitespace-pre-line"
                            lang={listing.description.language}
                        >
                            {listing.description.text}
                        </span>
                    ) : (
                        t("adminProductListings.detail.noText")
                    )}
                </ReadOnlyFact>
            </dl>
            {listing.lifecycle === "ACTIVE" && (
                <Link
                    to="/$lng/products/$productListingTitleSlugId"
                    params={{
                        lng: language,
                        productListingTitleSlugId: listing.productListingTitleSlugId,
                    }}
                    className="w-fit text-sm text-primary underline-offset-4 hover:underline"
                >
                    {t("adminProductListings.actions.viewPublicListing")}
                </Link>
            )}
        </section>
    );
}

function OriginalUrl({ url }: { readonly url: string }) {
    const href = toHttpUrl(url);
    if (!href) return <span className="break-all">{url}</span>;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary underline-offset-4 hover:underline"
        >
            {url}
        </a>
    );
}

function BackToDirectory({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    return (
        <Link
            to="/$lng/admin/product-listings"
            params={{ lng: language }}
            className="w-fit text-sm text-primary underline-offset-4 hover:underline"
        >
            {t("adminProductListings.actions.backToDirectory")}
        </Link>
    );
}
