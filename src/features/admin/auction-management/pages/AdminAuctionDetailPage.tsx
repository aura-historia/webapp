import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Gavel, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import {
    AdminBackLink,
    AdminRecordHeader,
} from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import {
    ADMIN_LEGEND_CLASS,
    ADMIN_SKELETON_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import type { AdminAuction } from "@/data/internal/auction/AdminAuction.ts";
import { cn, formatDateTime } from "@/lib/utils.ts";
import {
    AdminAuctionRequestError,
    type AuctionUpdateValues,
    mapAdminAuctionFormValues,
    useAdminAuction,
    useUpdateAdminAuction,
} from "../api/useAdminAuctions.ts";
import { AuctionMetadataFields } from "../components/AuctionMetadataFields.tsx";
import { AuctionFormActions, AuctionRequestAlert } from "../components/AuctionRecordParts.tsx";
import { auctionMetadataSchema } from "../lib/auctionForm.ts";

export function AdminAuctionDetailPage({
    auctionId,
    language,
}: {
    readonly auctionId: string;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const auctionQuery = useAdminAuction(auctionId);

    if (auctionQuery.isPending) {
        return (
            <div aria-busy="true" className="flex max-w-[860px] flex-col gap-3.5 pt-2">
                <span className={cn(ADMIN_SKELETON_CLASS, "h-3 w-1/4")} />
                <span className={cn(ADMIN_SKELETON_CLASS, "h-11 w-2/3 rounded-sm")} />
                <span className="grid grid-cols-3 gap-2.5">
                    {Array.from({ length: 6 }, (_, index) => (
                        <span
                            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cells
                            key={index}
                            className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")}
                        />
                    ))}
                </span>
                <span className={cn(ADMIN_SKELETON_CLASS, "h-44 rounded-panel")} />
                <output className="block text-meta text-ink-secondary">
                    {t("adminAuctions.detail.loading")}
                </output>
            </div>
        );
    }

    if (auctionQuery.error || !auctionQuery.data) {
        const status =
            auctionQuery.error instanceof AdminAuctionRequestError
                ? auctionQuery.error.status
                : undefined;
        const missing = status === 404 || status === 400;
        const forbidden = status === 401 || status === 403;
        return (
            <AdminStatePanel
                tone={missing ? "empty" : "error"}
                icon={missing ? Gavel : undefined}
                title={t(auctionErrorTitleKey(missing, forbidden))}
            >
                <Link
                    to="/$lng/admin/auctions"
                    params={{ lng: language }}
                    className={PRIMARY_PILL_CLASS}
                >
                    {t("adminAuctions.actions.allAuctions")}
                </Link>
                {!forbidden && (
                    <button
                        type="button"
                        onClick={() => auctionQuery.refetch()}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("adminCommon.retry")}
                    </button>
                )}
            </AdminStatePanel>
        );
    }

    return (
        <AdminAuctionUpdateForm
            auction={auctionQuery.data}
            language={language}
            onRefetch={auctionQuery.refetch}
        />
    );
}

function AdminAuctionUpdateForm({
    auction,
    language,
    onRefetch,
}: {
    readonly auction: AdminAuction;
    readonly language: string;
    readonly onRefetch: ReturnType<typeof useAdminAuction>["refetch"];
}) {
    const { t } = useTranslation();
    const [expectedVersion, setExpectedVersion] = useState(auction.expectedVersion);
    const form = useForm<AuctionUpdateValues, undefined, AuctionUpdateValues>({
        resolver: zodResolver(auctionMetadataSchema),
        defaultValues: mapAdminAuctionFormValues(auction, language),
    });
    const updateAuction = useUpdateAdminAuction(auction.auctionId);
    const stale =
        updateAuction.error instanceof AdminAuctionRequestError &&
        updateAuction.error.status === 409;

    const reloadLatest = async () => {
        const result = await onRefetch();
        if (!result.data) return;
        form.reset(mapAdminAuctionFormValues(result.data, language));
        setExpectedVersion(result.data.expectedVersion);
        updateAuction.reset();
    };

    const submit = form.handleSubmit(async (values) => {
        try {
            const updated = await updateAuction.mutateAsync({ values, expectedVersion });
            form.reset(mapAdminAuctionFormValues(updated, language));
            setExpectedVersion(updated.expectedVersion);
            toast.success(t("adminAuctions.toasts.saved"));
        } catch {
            // The mutation exposes a localized, status-based error below.
        }
    });

    return (
        <div className="flex max-w-[860px] flex-col">
            <AdminRecordHeader
                back={
                    <AdminBackLink to="/$lng/admin/auctions" params={{ lng: language }}>
                        {t("adminAuctions.actions.allAuctions")}
                    </AdminBackLink>
                }
                eyebrow={t("adminAuctions.detail.eyebrow")}
                title={
                    auction.name ? (
                        <span lang={auction.name.language}>{auction.name.text}</span>
                    ) : (
                        <span className="text-ink-muted italic">
                            {t("adminAuctions.list.noName")}
                        </span>
                    )
                }
            />
            <form noValidate onSubmit={submit} className="flex flex-col gap-7">
                <AuctionIdentity auction={auction} />
                <AuctionMetadataFields form={form} />
                {stale ? (
                    <div
                        role="alert"
                        className="flex flex-col gap-3 rounded-md bg-surface-raised p-4 shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                    >
                        <p className="text-sm leading-normal">
                            {t("adminAuctions.errors.changedElsewhere")}
                        </p>
                        <button
                            type="button"
                            onClick={() => void reloadLatest()}
                            className={cn(SMALL_SECONDARY_PILL_CLASS, "self-start")}
                        >
                            {t("adminAuctions.actions.loadLatest")}
                        </button>
                    </div>
                ) : (
                    updateAuction.error && <AuctionRequestAlert error={updateAuction.error} />
                )}
                <AuctionFormActions
                    language={language}
                    pending={updateAuction.isPending}
                    label={t("adminCommon.save")}
                    pendingLabel={t("adminCommon.saving")}
                />
            </form>
        </div>
    );
}

/** 01 Identity: the source and IDs fixed at creation, with the record's timestamps and version. */
function AuctionIdentity({ auction }: { readonly auction: AdminAuction }) {
    const { t, i18n } = useTranslation();
    const utc = (value: Date) => `${formatDateTime(value, i18n.language, "UTC")} UTC`;
    return (
        <section aria-labelledby="auction-identity-title" className="flex flex-col gap-3.5">
            <h2
                id="auction-identity-title"
                className={cn(ADMIN_LEGEND_CLASS, "mb-0 flex items-center justify-between gap-3")}
            >
                {`01 · ${t("adminAuctions.sections.identity")}`}
                <span className="inline-flex items-center gap-1.5">
                    <Lock aria-hidden="true" className="size-3" strokeWidth={1.9} />
                    {t("adminAuctions.detail.fixed")}
                </span>
            </h2>
            <AdminFacts
                columns={3}
                facts={[
                    {
                        key: "auctionId",
                        label: t("adminAuctions.fields.auctionId"),
                        value: auction.auctionId,
                        mono: true,
                    },
                    {
                        key: "listingSourceId",
                        label: t("adminAuctions.fields.sourceId"),
                        value: auction.listingSourceId,
                        mono: true,
                    },
                    {
                        key: "sourceAuctionId",
                        label: t("adminAuctions.fields.sourceAuctionId"),
                        value: auction.sourceAuctionId,
                        mono: true,
                    },
                    {
                        key: "created",
                        label: t("adminAuctions.fields.created"),
                        value: utc(auction.created),
                    },
                    {
                        key: "updated",
                        label: t("adminAuctions.fields.updated"),
                        value: utc(auction.updated),
                    },
                    {
                        key: "version",
                        label: t("adminAuctions.fields.version"),
                        value: auction.expectedVersion,
                        mono: true,
                    },
                ]}
            />
        </section>
    );
}

function auctionErrorTitleKey(missing: boolean, forbidden: boolean): string {
    if (missing) return "adminAuctions.detail.notFound";
    if (forbidden) return "adminAuctions.errors.forbidden";
    return "adminAuctions.detail.loadFailed";
}
