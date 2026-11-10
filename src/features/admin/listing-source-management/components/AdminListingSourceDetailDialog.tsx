import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ReferralConfigurationData } from "@/client";
import type {
    AdminListingSourceDetail,
    AdminListingSourceSummary,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { type AdminFact, AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_SKELETON_CLASS,
    FOCUS_CLASS,
    PRIMARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import {
    useAdminListingSource,
    useDeleteAdminListingSource,
} from "../api/useAdminListingSources.ts";
import { formatAdminDateTime } from "../lib/formatAdminListingSourceDate.ts";
import { AdminSourceLocationDefaultSection } from "./AdminSourceLocationDefaultSection.tsx";

const LINK_CLASS = cn(
    "font-medium text-ink underline decoration-line-strong underline-offset-3 hover:decoration-current",
    FOCUS_CLASS,
);

/**
 * A listing source's record dialog (board "Admin · Listing source"): type, name and operator, the
 * facts, delete and edit, then its default location.
 */
export function AdminListingSourceDetailDialog({
    listingSourceId: requestedListingSourceId,
    summary: requestedSummary,
    open,
    onOpenChange,
    onEdit,
}: {
    readonly listingSourceId?: string;
    readonly summary?: AdminListingSourceSummary;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onEdit: (
        source: AdminListingSourceDetail,
        referralConfiguration?: ReferralConfigurationData | null,
    ) => void;
}) {
    const { t, i18n } = useTranslation();
    const [listingSourceId, releaseListingSourceId] = useRetainedDialogValue(
        requestedListingSourceId,
        open,
    );
    const [summary, releaseSummary] = useRetainedDialogValue(requestedSummary, open);
    const detailQuery = useAdminListingSource(listingSourceId, open);
    const deleteSource = useDeleteAdminListingSource();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);
    const source = detailQuery.data;
    // A summary older than the detail predates a mutation, so its referral data is unknown.
    const referralConfiguration =
        source && summary && summary.updated.getTime() >= source.updated.getTime()
            ? (summary.referralConfiguration ?? null)
            : undefined;

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            setConfirmDelete(false);
            deleteSource.reset();
        }
        onOpenChange(nextOpen);
    };

    let body: ReactNode;
    if (detailQuery.error) {
        body = (
            <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3.5 rounded-md bg-surface p-4 shadow-ring"
            >
                <span className="flex gap-2.5 text-sm text-oxblood">
                    <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                        strokeWidth={2}
                    />
                    {detailQuery.error.message}
                </span>
                <button
                    type="button"
                    onClick={() => void detailQuery.refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    } else if (!source) {
        body = (
            <div aria-busy="true" className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                    {[0, 1, 2, 3].map((index) => (
                        <span key={index} className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")} />
                    ))}
                </div>
                <p role="status" className="text-meta text-ink-secondary">
                    {t("adminListingSources.loadingDetail")}
                </p>
            </div>
        );
    } else {
        body = (
            <>
                <AdminFacts
                    facts={listingSourceFacts(source, referralConfiguration, t, i18n.language)}
                />
                {confirmDelete ? (
                    <AdminInlineConfirm
                        message={t("adminListingSources.detail.confirmDelete")}
                        confirmLabel={t("adminListingSources.actions.delete")}
                        pending={deleteSource.isPending}
                        error={deleteSource.error?.message}
                        onCancel={() => {
                            setConfirmDelete(false);
                            deleteSource.reset();
                            requestAnimationFrame(() => deleteTriggerRef.current?.focus());
                        }}
                        onConfirm={() =>
                            deleteSource.mutate(source.listingSourceId, {
                                onSuccess: () => {
                                    toast.success(t("adminListingSources.success.deleted"));
                                    close(false);
                                },
                            })
                        }
                    />
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <button
                            ref={deleteTriggerRef}
                            type="button"
                            onClick={() => {
                                deleteSource.reset();
                                setConfirmDelete(true);
                            }}
                            className={ADMIN_DANGER_OUTLINE_CLASS}
                        >
                            {t("adminListingSources.actions.delete")}
                        </button>
                        <button
                            type="button"
                            onClick={() => onEdit(source, referralConfiguration)}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {t("adminListingSources.actions.edit")}
                        </button>
                    </div>
                )}
                <AdminSourceLocationDefaultSection source={source} />
            </>
        );
    }

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={close}
            width="lg"
            eyebrow={
                source
                    ? t("adminListingSources.detail.eyebrow", {
                          type: t(`listingSourceTypes.${source.listingSourceType}`),
                      })
                    : t("adminListingSources.detail.eyebrowBare")
            }
            title={
                source ? (
                    source.name
                ) : (
                    <>
                        <span className="sr-only">{t("adminListingSources.loadingDetail")}</span>
                        <span
                            aria-hidden="true"
                            className={cn(ADMIN_SKELETON_CLASS, "block h-8 w-3/5 rounded-sm")}
                        />
                    </>
                )
            }
            subtitle={
                source ? (
                    <Trans
                        i18nKey="adminListingSources.detail.operatedBy"
                        values={{ name: source.operator.name }}
                        components={{
                            party: (
                                <Link
                                    to="/$lng/admin/parties/$partyId"
                                    from="/$lng"
                                    params={(previous) => ({
                                        ...previous,
                                        partyId: source.operator.partyId,
                                    })}
                                    className={LINK_CLASS}
                                />
                            ),
                        }}
                    />
                ) : undefined
            }
            onCloseAutoFocus={() => {
                releaseListingSourceId();
                releaseSummary();
            }}
        >
            {body}
        </AdminRecordDialog>
    );
}

function listingSourceFacts(
    source: AdminListingSourceDetail,
    referralConfiguration: ReferralConfigurationData | null | undefined,
    t: ReturnType<typeof useTranslation>["t"],
    locale: string,
): AdminFact[] {
    const none = t("adminCommon.none");
    const link = (href?: string): Pick<AdminFact, "value" | "muted"> =>
        href
            ? {
                  value: (
                      <a href={href} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                          {href}
                      </a>
                  ),
              }
            : { value: none, muted: true };
    const referral: Pick<AdminFact, "value" | "muted" | "mono"> =
        referralConfiguration === undefined
            ? { value: t("adminListingSources.fields.referralUnavailable"), muted: true }
            : referralConfiguration?.type === "PARTNERIZE"
              ? {
                    value: t("adminListingSources.referral.partnerizeValue", {
                        camref: referralConfiguration.camref,
                    }),
                    mono: true,
                }
              : { value: none, muted: true };
    return [
        {
            key: "id",
            label: t("adminListingSources.facts.id"),
            value: source.listingSourceId,
            mono: true,
        },
        {
            key: "slug",
            label: t("adminListingSources.facts.slug"),
            value: source.listingSourceSlugId,
            mono: true,
        },
        {
            key: "ingestion",
            label: t("adminListingSources.facts.ingestion"),
            ...(source.ingestionMethods.length > 0
                ? {
                      value: source.ingestionMethods
                          .map((method) => t(`adminListingSources.methods.${method}`))
                          .join(", "),
                  }
                : { value: t("adminListingSources.list.none"), muted: true }),
        },
        {
            key: "platform",
            label: t("adminListingSources.facts.platform"),
            ...(source.platformTechnology
                ? { value: source.platformTechnology, mono: true }
                : { value: none, muted: true }),
        },
        {
            key: "website",
            label: t("adminListingSources.facts.website"),
            ...link(source.presentation.url),
        },
        {
            key: "image",
            label: t("adminListingSources.facts.image"),
            ...link(source.presentation.image),
        },
        { key: "referral", label: t("adminListingSources.facts.referral"), ...referral },
        {
            key: "operator",
            label: t("adminListingSources.facts.operatorId"),
            value: source.operator.partyId,
            mono: true,
        },
        {
            key: "created",
            label: t("adminListingSources.facts.created"),
            value: (
                <time dateTime={source.created.toISOString()}>
                    {formatAdminDateTime(source.created, locale)}
                </time>
            ),
        },
        {
            key: "updated",
            label: t("adminListingSources.facts.updated"),
            value: (
                <time dateTime={source.updated.toISOString()}>
                    {formatAdminDateTime(source.updated, locale)}
                </time>
            ),
        },
    ];
}
