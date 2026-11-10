import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Unlink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type AdminFact, AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import {
    AdminBackLink,
    AdminRecordHeader,
} from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import { AdminMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_PANEL_CLASS,
    ADMIN_SKELETON_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import { cn } from "@/lib/utils.ts";
import {
    type AdminProductListingErrorReason,
    AdminProductListingRequestError,
    useAdminProductListing,
} from "../api/useAdminProductListings.ts";
import { AdminProductListingEditForm } from "../components/AdminProductListingEditForm.tsx";
import { AdminProductListingLifecycleAction } from "../components/AdminProductListingLifecycleAction.tsx";
import { lifecycleTone, UtcDateTime } from "../components/AdminProductListingPresentation.tsx";
import { toHttpUrl } from "../lib/adminProductListingForm.ts";

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
            <div aria-busy="true" className="flex flex-col gap-3.5 pt-2">
                <span className={cn(ADMIN_SKELETON_CLASS, "h-3 w-1/4")} />
                <span className={cn(ADMIN_SKELETON_CLASS, "h-11 w-2/3 rounded-sm")} />
                <span className={cn(ADMIN_SKELETON_CLASS, "mt-6 h-[420px] rounded-panel")} />
                <p role="status" className="text-meta text-ink-secondary">
                    {t("adminProductListings.detail.loading")}
                </p>
            </div>
        );
    }

    if (!listingQuery.data || accessLost) {
        const missing = error?.reason === "missing" || error?.reason === "invalidId";
        return (
            <AdminStatePanel
                tone={missing ? "empty" : "error"}
                icon={missing ? Unlink : undefined}
                title={
                    missing
                        ? t("adminProductListings.detail.unavailableTitle")
                        : (error?.reason === "forbidden" && error.message) ||
                          t("adminProductListings.detail.errorTitle")
                }
            >
                <Link
                    to="/$lng/admin/product-listings"
                    params={{ lng: language }}
                    className={PRIMARY_PILL_CLASS}
                >
                    {t("adminProductListings.actions.allListings")}
                </Link>
                {!accessLost && (
                    <button
                        type="button"
                        onClick={() => listingQuery.refetch()}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("adminCommon.retry")}
                    </button>
                )}
            </AdminStatePanel>
        );
    }

    const listing = listingQuery.data;
    return (
        <>
            <AdminRecordHeader
                back={
                    <AdminBackLink to="/$lng/admin/product-listings" params={{ lng: language }}>
                        {t("adminProductListings.actions.allListings")}
                    </AdminBackLink>
                }
                eyebrow={
                    <>
                        <AdminMark tone={lifecycleTone(listing.lifecycle)} />
                        {t("adminProductListings.detail.eyebrowLifecycle", {
                            lifecycle: t(`adminProductListings.lifecycles.${listing.lifecycle}`),
                        })}
                    </>
                }
                title={
                    listing.title ? (
                        <span lang={listing.title.language}>{listing.title.text}</span>
                    ) : (
                        <span className="text-ink-muted italic">
                            {t("adminProductListings.list.noTitle")}
                        </span>
                    )
                }
                actions={
                    <>
                        {listing.lifecycle === "ACTIVE" && (
                            <Link
                                to="/$lng/products/$productListingTitleSlugId"
                                params={{
                                    lng: language,
                                    productListingTitleSlugId: listing.productListingTitleSlugId,
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={SECONDARY_PILL_CLASS}
                            >
                                {t("adminProductListings.actions.publicPage")}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-[13px]"
                                    strokeWidth={1.8}
                                />
                            </Link>
                        )}
                        <AdminProductListingLifecycleAction listing={listing} />
                    </>
                }
            >
                <p className="-mt-2 text-sm text-ink-secondary">
                    {listing.source.name} ·{" "}
                    <code className="font-mono text-xs break-all">{listing.sourceListingId}</code>
                </p>
                <p className="flex gap-2.5 rounded-md bg-surface-sunken px-4 py-3 text-meta leading-normal text-ink-secondary">
                    <AdminMark tone="brass" className="mt-[5px] size-2" />
                    {t("adminProductListings.detail.correctionsNote")}
                </p>
                {listingQuery.error && (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3 text-meta shadow-[inset_0_0_0_1.5px_var(--brass)]"
                    >
                        <span>{listingQuery.error.message}</span>
                        <button
                            type="button"
                            onClick={() => listingQuery.refetch()}
                            className={cn(TEXT_LINK_CLASS, "text-meta")}
                        >
                            {t("adminCommon.retry")}
                        </button>
                    </div>
                )}
            </AdminRecordHeader>
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
                <AdminProductListingEditForm
                    key={listing.productListingId}
                    listing={listing}
                    language={language}
                />
                <AdminProductListingRecordPanel listing={listing} />
            </div>
        </>
    );
}

function AdminProductListingRecordPanel({
    listing,
}: {
    readonly listing: AdminProductListingDetail;
}) {
    const { t } = useTranslation();
    const originalUrl = toHttpUrl(listing.url);
    const facts: AdminFact[] = [
        {
            key: "id",
            label: t("adminProductListings.fields.productListingId"),
            value: listing.productListingId,
            mono: true,
        },
        {
            key: "slug",
            label: t("adminProductListings.fields.slug"),
            value: listing.productListingTitleSlugId,
            mono: true,
        },
        {
            key: "version",
            label: t("adminProductListings.fields.version"),
            value: listing.expectedVersion,
            mono: true,
        },
        {
            key: "source",
            label: t("adminProductListings.fields.source"),
            value: (
                <>
                    {listing.source.name}
                    <span className="block font-mono text-[11px] break-all text-ink-secondary">
                        {listing.source.listingSourceId} · {listing.source.slugId}
                    </span>
                </>
            ),
        },
        {
            key: "sourceListingId",
            label: t("adminProductListings.fields.sourceListingId"),
            value: listing.sourceListingId,
            mono: true,
        },
        {
            key: "sale",
            label: t("adminProductListings.fields.saleObservation"),
            muted: !listing.saleObservation,
            value: listing.saleObservation ? (
                <>
                    <UtcDateTime value={listing.saleObservation.observedAt} />
                    <span className="block font-mono text-[11px] break-all text-ink-secondary">
                        {listing.saleObservation.fxRateId}
                    </span>
                </>
            ) : (
                t("adminProductListings.detail.noSaleObservation")
            ),
        },
        {
            key: "created",
            label: t("adminProductListings.fields.created"),
            value: <UtcDateTime value={listing.created} />,
        },
        {
            key: "updated",
            label: t("adminProductListings.fields.updated"),
            value: <UtcDateTime value={listing.updated} />,
        },
    ];

    return (
        <aside aria-labelledby="admin-product-listing-record-title" className="lg:sticky lg:top-28">
            <div className={cn(ADMIN_PANEL_CLASS, "flex flex-col gap-3.5 p-[22px]")}>
                <h2
                    id="admin-product-listing-record-title"
                    className="font-mono text-[10px] font-normal tracking-[0.16em] text-brass-ink uppercase"
                >
                    {t("adminProductListings.detail.record")}
                </h2>
                <AdminFacts facts={facts} columns={1} />
                {originalUrl && (
                    <a
                        href={originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(TEXT_LINK_CLASS, "self-start text-meta")}
                    >
                        {t("adminProductListings.actions.originalPage")}
                        <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={1.8} />
                    </a>
                )}
            </div>
        </aside>
    );
}
