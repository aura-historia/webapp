import { Link } from "@tanstack/react-router";
import { EyeOff, Mail, Package, Store, SquareArrowOutUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    type AdminContentNotice,
    type AdminContentNoticeSummary,
    adminContentNoticeTitle,
} from "@/data/internal/content-notice/AdminContentNotice.ts";
import { AdminFacts } from "@/features/admin/common/components/AdminFacts.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import {
    AdminMark,
    type AdminMarkTone,
    AdminStatusMark,
} from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_INSET_CLASS,
    ADMIN_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_TAG_CLASS,
    MONO_LABEL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { formatAdminTimestamp } from "@/features/admin/party-management/lib/adminDates.ts";
import { AdminErrorLine } from "@/features/admin/partnership-management/components/AdminConflictNotice.tsx";
import { useLanguageNames } from "@/features/admin/product-listing-management/components/AdminProductListingPresentation.tsx";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import {
    AdminContentNoticeRequestError,
    useAdminContentNotice,
} from "../api/useAdminContentNotices.ts";
import {
    CONTENT_NOTICE_REASON_KEY,
    CONTENT_NOTICE_RECEIPT,
    CONTENT_NOTICE_ROLE_KEY,
    CONTENT_NOTICE_STATE,
} from "../lib/adminContentNoticePresentation.ts";

/** Only web addresses become links; anything else the notifier typed stays text. */
export function safeExternalUrl(value: string): string | undefined {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
    } catch {
        return undefined;
    }
}

/**
 * The read-only record of one notice (board "Admin · Content notice — record dialog"): what was
 * reported, the target then and now, and the notifier with the receipt. The API has no decisions
 * yet, so there are no actions besides writing to the notifier.
 */
export function AdminContentNoticeDialog({
    noticeId: requestedId,
    summary: requestedSummary,
    language,
    onClose,
}: {
    readonly noticeId?: string;
    readonly summary?: AdminContentNoticeSummary;
    readonly language: string;
    readonly onClose: () => void;
}) {
    const { t, i18n } = useTranslation();
    const open = Boolean(requestedId);
    const [noticeId, releaseId] = useRetainedDialogValue(requestedId, open);
    const [summary, releaseSummary] = useRetainedDialogValue(requestedSummary, open);
    const { data: notice, isPending, error, refetch } = useAdminContentNotice(noticeId, open);
    const header = notice
        ? {
              target: notice.target,
              title: adminContentNoticeTitle({
                  target: notice.target,
                  listingSourceName: notice.snapshot.listingSourceName,
                  productListingTitle: notice.snapshot.productListingTitle,
              }),
              state: notice.state,
              created: notice.created,
          }
        : summary?.id === noticeId && summary
          ? {
                target: summary.target,
                title: adminContentNoticeTitle(summary),
                state: summary.state,
                created: summary.created,
            }
          : undefined;
    const missing = error instanceof AdminContentNoticeRequestError && error.status === 404;

    let content: ReactNode;
    if (notice) {
        content = <NoticeBody notice={notice} language={language} />;
    } else if (missing) {
        content = (
            <AdminStatePanel
                tone="empty"
                framed={false}
                className="min-h-0 py-6"
                title={t("adminContentNotices.errors.missing")}
            >
                <button type="button" onClick={onClose} className={SECONDARY_PILL_CLASS}>
                    {t("adminContentNotices.detail.back")}
                </button>
            </AdminStatePanel>
        );
    } else if (error) {
        content = (
            <div className="flex flex-wrap items-center justify-between gap-3.5">
                <AdminErrorLine message={error.message} className="text-sm" />
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    } else if (isPending) {
        content = (
            <div aria-busy="true" className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                    {[0, 1, 2, 3].map((index) => (
                        <span key={index} className={cn(ADMIN_SKELETON_CLASS, "h-10 rounded-sm")} />
                    ))}
                </div>
                <span className={cn(ADMIN_SKELETON_CLASS, "h-32 rounded-md")} />
                <output className="block text-meta text-ink-secondary">
                    {t("adminContentNotices.loadingDetail")}
                </output>
            </div>
        );
    }

    const state = header ? CONTENT_NOTICE_STATE[header.state] : undefined;
    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
            onCloseAutoFocus={() => {
                releaseId();
                releaseSummary();
            }}
            eyebrow={
                header
                    ? t(
                          header.target.type === "LISTING_SOURCE"
                              ? "adminContentNotices.detail.eyebrowSource"
                              : "adminContentNotices.detail.eyebrowListing",
                      )
                    : undefined
            }
            title={
                header ? (
                    <span className={cn(!header.title && "text-ink-muted italic")}>
                        {header.title ?? t("adminContentNotices.list.untitled")}
                    </span>
                ) : (
                    t("adminContentNotices.detail.fallbackTitle")
                )
            }
            subtitle={
                header && state ? (
                    <span className="flex flex-wrap items-center gap-2">
                        <AdminStatusMark
                            tone={state.tone}
                            label={t(state.key)}
                            className="text-ink"
                        />
                        <span aria-hidden="true" className="text-ink-muted">
                            ·
                        </span>
                        <span>
                            {t("adminContentNotices.detail.received", {
                                time: formatAdminTimestamp(header.created, i18n.language),
                            })}
                        </span>
                    </span>
                ) : undefined
            }
        >
            {content}
        </AdminRecordDialog>
    );
}

function KeyValueRows({
    rows,
}: {
    readonly rows: readonly {
        readonly key: string;
        readonly label: string;
        readonly value: ReactNode;
    }[];
}) {
    return (
        <dl className={cn(ADMIN_INSET_CLASS, "px-[18px] py-1")}>
            {rows.map((row, index) => (
                <div
                    key={row.key}
                    className={cn(
                        "grid grid-cols-1 items-baseline gap-0.5 py-[11px] sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4",
                        index < rows.length - 1 && "border-b border-line-subtle",
                    )}
                >
                    <dt className="text-meta text-ink-secondary">{row.label}</dt>
                    <dd className="min-w-0 text-sm break-words">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}

function Section({
    id,
    title,
    action,
    children,
}: {
    readonly id: string;
    readonly title: string;
    readonly action?: ReactNode;
    readonly children: ReactNode;
}) {
    const titleId = `admin-content-notice-${id}`;
    return (
        <section aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 id={titleId} className={cn(ADMIN_SECTION_TITLE_CLASS, "text-[22px]")}>
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </section>
    );
}

function ExternalLink({ href, children }: { readonly href: string; readonly children: ReactNode }) {
    const safe = safeExternalUrl(href);
    if (!safe) return <span className="font-mono text-xs break-all">{children}</span>;
    return (
        <a
            href={safe}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(
                TEXT_LINK_CLASS,
                "inline-flex min-h-7 items-center gap-1.5 font-mono text-xs break-all",
            )}
        >
            <span className="min-w-0 break-all">{children}</span>
            <SquareArrowOutUpRight
                aria-hidden="true"
                className="size-3 shrink-0 text-ink-muted"
                strokeWidth={1.9}
            />
        </a>
    );
}

type CompareRow = {
    readonly key: string;
    readonly label: string;
    readonly value: ReactNode;
    readonly mark?: AdminMarkTone;
    readonly muted?: boolean;
};

function CompareColumn({ title, rows }: { readonly title: string; readonly rows: CompareRow[] }) {
    return (
        <div className={cn(ADMIN_INSET_CLASS, "flex min-w-0 flex-col gap-2 px-[18px] pt-4 pb-1.5")}>
            <h4 className={cn(MONO_LABEL_CLASS, "font-normal")}>{title}</h4>
            <dl>
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="flex min-w-0 flex-col gap-[3px] border-t border-line-subtle py-[9px]"
                    >
                        <dt className="text-xs text-ink-secondary">{row.label}</dt>
                        <dd
                            className={cn(
                                "flex min-w-0 flex-wrap items-center gap-1.5 text-sm break-words",
                                row.muted && "text-ink-muted",
                            )}
                        >
                            {row.mark && <AdminMark tone={row.mark} />}
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function NoticeBody({
    notice,
    language,
}: {
    readonly notice: AdminContentNotice;
    readonly language: string;
}) {
    const { t, i18n } = useTranslation();
    const languageName = useLanguageNames();
    const isListing = notice.target.type === "PRODUCT_LISTING";
    const source = notice.current.listingSource;
    const listing = notice.current.productListing;
    const yesNo = (value: boolean) =>
        t(value ? "adminContentNotices.content.yes" : "adminContentNotices.content.no");

    const facts = [
        { key: "id", label: t("adminContentNotices.fields.id"), value: notice.id, mono: true },
        isListing && notice.target.productListingId
            ? {
                  key: "listing",
                  label: t("adminContentNotices.fields.productListingId"),
                  value: notice.target.productListingId,
                  mono: true,
              }
            : {
                  key: "source",
                  label: t("adminContentNotices.fields.listingSourceId"),
                  value: notice.target.listingSourceId,
                  mono: true,
              },
        {
            key: "received",
            label: t("adminContentNotices.fields.received"),
            value: formatAdminTimestamp(notice.created, i18n.language),
        },
        {
            key: "updated",
            label: t("adminContentNotices.fields.updated"),
            value: formatAdminTimestamp(notice.updated, i18n.language),
        },
    ];

    const then: CompareRow[] = [
        ...(isListing
            ? [
                  {
                      key: "listing",
                      label: t("adminContentNotices.content.listing"),
                      value:
                          notice.snapshot.productListingTitle ??
                          t("adminContentNotices.list.untitled"),
                      muted: !notice.snapshot.productListingTitle,
                  },
                  ...(notice.snapshot.productListingUrl
                      ? [
                            {
                                key: "listingUrl",
                                label: t("adminContentNotices.content.listingUrl"),
                                value: (
                                    <ExternalLink href={notice.snapshot.productListingUrl}>
                                        {notice.snapshot.productListingUrl}
                                    </ExternalLink>
                                ),
                            },
                        ]
                      : []),
              ]
            : []),
        {
            key: "source",
            label: t("adminContentNotices.content.source"),
            value: notice.snapshot.listingSourceName,
        },
        ...(notice.snapshot.listingSourceUrl
            ? [
                  {
                      key: "sourceUrl",
                      label: t("adminContentNotices.content.sourceUrl"),
                      value: (
                          <ExternalLink href={notice.snapshot.listingSourceUrl}>
                              {notice.snapshot.listingSourceUrl}
                          </ExternalLink>
                      ),
                  },
              ]
            : []),
        {
            key: "partner",
            label: t("adminContentNotices.content.partner"),
            value: yesNo(notice.snapshot.partner),
        },
    ];

    const gone = t("adminContentNotices.content.gone");
    const now: CompareRow[] = [];
    if (listing) {
        if (!listing.exists) {
            now.push({
                key: "listing",
                label: t("adminContentNotices.content.listing"),
                value: gone,
                mark: "dashed",
                muted: true,
            });
        } else {
            const lifecycle = listing.lifecycle;
            now.push({
                key: "listing",
                label: t("adminContentNotices.content.listing"),
                value: t(
                    lifecycle === "ACTIVE"
                        ? "adminContentNotices.content.active"
                        : lifecycle === "WITHDRAWN"
                          ? "adminContentNotices.content.withdrawn"
                          : "adminContentNotices.content.lifecycleUnknown",
                ),
                mark:
                    lifecycle === "ACTIVE" ? "ink" : lifecycle === "WITHDRAWN" ? "muted" : "dashed",
            });
        }
    }
    if (!source.exists) {
        now.push({
            key: "source",
            label: t("adminContentNotices.content.source"),
            value: gone,
            mark: "dashed",
            muted: true,
        });
    } else {
        const partnerChanged = source.partner !== notice.snapshot.partner;
        now.push(
            {
                key: "source",
                label: t("adminContentNotices.content.source"),
                value: (
                    <Link
                        to="/$lng/shops/$shopSlugId"
                        params={{ lng: language, shopSlugId: source.slugId }}
                        target="_blank"
                        className={TEXT_LINK_CLASS}
                    >
                        {source.name}
                    </Link>
                ),
            },
            {
                key: "ingestion",
                label: t("adminContentNotices.content.ingestion"),
                value:
                    source.ingestionMethods.length > 0 ? (
                        source.ingestionMethods.map((method) => (
                            <span key={method} className={ADMIN_TAG_CLASS}>
                                {t(`adminListingSources.methods.${method}`)}
                            </span>
                        ))
                    ) : (
                        <span className="text-ink-muted">
                            {t("adminContentNotices.content.noIngestion")}
                        </span>
                    ),
            },
            {
                key: "partner",
                label: t("adminContentNotices.content.partner"),
                value: partnerChanged
                    ? t(
                          source.partner
                              ? "adminContentNotices.content.partnerNowYes"
                              : "adminContentNotices.content.partnerNowNo",
                      )
                    : yesNo(source.partner),
                mark: partnerChanged ? "brass" : undefined,
            },
        );
    }

    const showListingButton = isListing && listing?.exists && notice.target.productListingId;
    const email = notice.submitter.email;
    const name = notice.submitter.name;
    const anonymous = !name && !email;
    const receiptRow = receiptValue(notice, t, i18n.language);

    return (
        <>
            <AdminFacts facts={facts} />

            <Section id="notice" title={t("adminContentNotices.notice.title")}>
                <KeyValueRows
                    rows={[
                        {
                            key: "role",
                            label: t("adminContentNotices.notice.role"),
                            value: t(CONTENT_NOTICE_ROLE_KEY[notice.role]),
                        },
                        {
                            key: "reason",
                            label: t("adminContentNotices.notice.reason"),
                            value: t(CONTENT_NOTICE_REASON_KEY[notice.reason]),
                        },
                        {
                            key: "explanation",
                            label: t("adminContentNotices.notice.explanation"),
                            value: notice.explanation ? (
                                <span className="leading-relaxed whitespace-pre-line">
                                    {notice.explanation}
                                </span>
                            ) : (
                                <span className="text-ink-muted">
                                    {t("adminContentNotices.notice.noExplanation")}
                                </span>
                            ),
                        },
                        {
                            key: "urls",
                            label: t("adminContentNotices.notice.urls"),
                            value:
                                notice.additionalUrls.length > 0 ? (
                                    <ul className="flex flex-col gap-1.5">
                                        {notice.additionalUrls.map((url) => (
                                            <li key={url} className="min-w-0">
                                                <ExternalLink href={url}>{url}</ExternalLink>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-ink-muted">
                                        {t("adminContentNotices.notice.noUrls")}
                                    </span>
                                ),
                        },
                        {
                            key: "goodFaith",
                            label: t("adminContentNotices.notice.goodFaith"),
                            value: t("adminContentNotices.notice.goodFaithConfirmed"),
                        },
                    ]}
                />
            </Section>

            <Section
                id="content"
                title={t("adminContentNotices.content.title")}
                action={
                    <Link
                        to="/$lng/admin/content-notices"
                        params={{ lng: language }}
                        search={{ sourceId: notice.target.listingSourceId }}
                        className={cn(
                            TEXT_LINK_CLASS,
                            "inline-flex min-h-8 items-center text-meta font-medium",
                        )}
                    >
                        {t("adminContentNotices.content.moreAbout", {
                            source: notice.snapshot.listingSourceName,
                        })}
                    </Link>
                }
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CompareColumn
                        title={t("adminContentNotices.content.atSubmission")}
                        rows={then}
                    />
                    <CompareColumn title={t("adminContentNotices.content.now")} rows={now} />
                </div>
                {(showListingButton || source.exists) && (
                    <div className="flex flex-wrap gap-2.5">
                        {showListingButton && notice.target.productListingId && (
                            <Link
                                to="/$lng/admin/product-listings/$productListingId"
                                params={{
                                    lng: language,
                                    productListingId: notice.target.productListingId,
                                }}
                                className={cn(SECONDARY_PILL_CLASS, "basis-full sm:basis-auto")}
                            >
                                <Package aria-hidden="true" className="size-4" strokeWidth={1.7} />
                                {t("adminContentNotices.content.openListing")}
                            </Link>
                        )}
                        {source.exists && (
                            <Link
                                to="/$lng/admin/listing-sources"
                                params={{ lng: language }}
                                search={{ source: notice.target.listingSourceId }}
                                className={cn(SECONDARY_PILL_CLASS, "basis-full sm:basis-auto")}
                            >
                                <Store aria-hidden="true" className="size-4" strokeWidth={1.7} />
                                {t("adminContentNotices.content.openSource")}
                            </Link>
                        )}
                    </div>
                )}
            </Section>

            <Section id="notifier" title={t("adminContentNotices.notifier.title")}>
                {anonymous ? (
                    <>
                        <p className="flex items-start gap-2.5 rounded-md bg-surface-sunken px-4 py-3.5 text-sm leading-normal">
                            <EyeOff
                                aria-hidden="true"
                                className="mt-0.5 size-[17px] shrink-0 text-ink-muted"
                                strokeWidth={1.7}
                            />
                            <span>
                                <strong className="font-semibold">
                                    {t("adminContentNotices.notifier.anonymousTitle")}
                                </strong>{" "}
                                {t("adminContentNotices.notifier.anonymous")}
                            </span>
                        </p>
                        <KeyValueRows
                            rows={[
                                {
                                    key: "language",
                                    label: t("adminContentNotices.notifier.language"),
                                    value: languageName(notice.submitter.language),
                                },
                            ]}
                        />
                    </>
                ) : (
                    <KeyValueRows
                        rows={[
                            {
                                key: "name",
                                label: t("adminContentNotices.notifier.name"),
                                value: name ?? (
                                    <span className="text-ink-muted">
                                        {t("adminContentNotices.notifier.noName")}
                                    </span>
                                ),
                            },
                            {
                                key: "email",
                                label: t("adminContentNotices.notifier.email"),
                                value: email ? (
                                    <a href={`mailto:${email}`} className={TEXT_LINK_CLASS}>
                                        {email}
                                    </a>
                                ) : (
                                    <span className="text-ink-muted">
                                        {t("adminContentNotices.notifier.noEmail")}
                                    </span>
                                ),
                            },
                            {
                                key: "language",
                                label: t("adminContentNotices.notifier.language"),
                                value: languageName(notice.submitter.language),
                            },
                            {
                                key: "receipt",
                                label: t("adminContentNotices.notifier.receipt"),
                                value: receiptRow,
                            },
                        ]}
                    />
                )}
                {email && (
                    <div className="flex sm:justify-end">
                        <a
                            href={`mailto:${email}?subject=${encodeURIComponent(
                                t("adminContentNotices.notifier.mailSubject", { id: notice.id }),
                            )}`}
                            className={cn(SECONDARY_PILL_CLASS, "w-full sm:w-auto")}
                        >
                            <Mail aria-hidden="true" className="size-4" strokeWidth={1.7} />
                            {t("adminContentNotices.notifier.write")}
                        </a>
                    </div>
                )}
            </Section>
        </>
    );
}

type Translate = ReturnType<typeof useTranslation>["t"];

function receiptValue(notice: AdminContentNotice, t: Translate, language: string): ReactNode {
    const receipt = notice.receipt;
    if (!receipt) {
        return (
            <span className="flex flex-col gap-1">
                <AdminStatusMark tone="dashed" label={t("adminContentNotices.receipt.none")} />
                <span className="text-meta text-ink-secondary">
                    {t("adminContentNotices.receipt.noneNote")}
                </span>
            </span>
        );
    }
    const presentation = CONTENT_NOTICE_RECEIPT[receipt.status];
    const note = t(presentation.noteKey, {
        count: receipt.attempts,
        time: receipt.deliveredAt ? formatAdminTimestamp(receipt.deliveredAt, language) : "—",
    });
    return (
        <span className="flex flex-col gap-1">
            <AdminStatusMark tone={presentation.tone} label={t(presentation.key)} />
            <span
                className={cn(
                    "text-meta leading-normal",
                    receipt.status === "FAILED" ? "text-oxblood" : "text-ink-secondary",
                )}
            >
                {note}
            </span>
        </span>
    );
}
