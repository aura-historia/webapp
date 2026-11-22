import { Link } from "@tanstack/react-router";
import { EyeOff, Mail, Package, Store, SquareArrowOutUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    type AdminContentNotice,
    type AdminContentNoticeSummary,
    type AdminContentNoticeTarget,
    adminContentNoticeTitle,
    type ContentNoticeState,
    type ContentNoticeTargetType,
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
type DialogHeader = {
    readonly target: AdminContentNoticeTarget;
    readonly title?: string;
    readonly state: ContentNoticeState;
    readonly created: Date;
};

const EYEBROW_KEY: Record<ContentNoticeTargetType, string> = {
    PRODUCT_LISTING: "adminContentNotices.detail.eyebrowListing",
    LISTING_SOURCE: "adminContentNotices.detail.eyebrowSource",
};

/** The header shows the loaded record, or the row that opened the dialog while it loads. */
function dialogHeader(
    notice: AdminContentNotice | undefined,
    summary: AdminContentNoticeSummary | undefined,
    noticeId: string | undefined,
): DialogHeader | undefined {
    if (notice) {
        return {
            target: notice.target,
            title: adminContentNoticeTitle({
                target: notice.target,
                listingSourceName: notice.snapshot.listingSourceName,
                productListingTitle: notice.snapshot.productListingTitle,
            }),
            state: notice.state,
            created: notice.created,
        };
    }
    if (summary && summary.id === noticeId) {
        return {
            target: summary.target,
            title: adminContentNoticeTitle(summary),
            state: summary.state,
            created: summary.created,
        };
    }
    return undefined;
}

function HeaderTitle({ header }: { readonly header: DialogHeader }) {
    const { t } = useTranslation();
    return (
        <span className={cn(!header.title && "text-ink-muted italic")}>
            {header.title ?? t("adminContentNotices.list.untitled")}
        </span>
    );
}

function HeaderSubtitle({ header }: { readonly header: DialogHeader }) {
    const { t, i18n } = useTranslation();
    const state = CONTENT_NOTICE_STATE[header.state];
    return (
        <span className="flex flex-wrap items-center gap-2">
            <AdminStatusMark tone={state.tone} label={t(state.key)} className="text-ink" />
            <span aria-hidden="true" className="text-ink-muted">
                ·
            </span>
            <span>
                {t("adminContentNotices.detail.received", {
                    time: formatAdminTimestamp(header.created, i18n.language),
                })}
            </span>
        </span>
    );
}

/** The dialog body: the record, or its not-found, failed or loading state. */
function DialogContent({
    notice,
    error,
    isPending,
    language,
    onRetry,
    onClose,
}: {
    readonly notice?: AdminContentNotice;
    readonly error: Error | null;
    readonly isPending: boolean;
    readonly language: string;
    readonly onRetry: () => void;
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();
    if (notice) return <NoticeBody notice={notice} language={language} />;
    if (error instanceof AdminContentNoticeRequestError && error.status === 404) {
        return (
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
    }
    if (error) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3.5">
                <AdminErrorLine message={error.message} className="text-sm" />
                <button type="button" onClick={onRetry} className={SMALL_SECONDARY_PILL_CLASS}>
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    }
    if (!isPending) return null;
    return (
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
    const { t } = useTranslation();
    const open = Boolean(requestedId);
    const [noticeId, releaseId] = useRetainedDialogValue(requestedId, open);
    const [summary, releaseSummary] = useRetainedDialogValue(requestedSummary, open);
    const { data: notice, isPending, error, refetch } = useAdminContentNotice(noticeId, open);
    const header = dialogHeader(notice, summary, noticeId);

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
            eyebrow={header && t(EYEBROW_KEY[header.target.type])}
            title={
                header ? (
                    <HeaderTitle header={header} />
                ) : (
                    t("adminContentNotices.detail.fallbackTitle")
                )
            }
            subtitle={header && <HeaderSubtitle header={header} />}
        >
            <DialogContent
                notice={notice}
                error={error}
                isPending={isPending}
                language={language}
                onRetry={() => void refetch()}
                onClose={onClose}
            />
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

type Translate = ReturnType<typeof useTranslation>["t"];

const LIFECYCLE: Record<string, { readonly key: string; readonly tone: AdminMarkTone }> = {
    ACTIVE: { key: "adminContentNotices.content.active", tone: "ink" },
    WITHDRAWN: { key: "adminContentNotices.content.withdrawn", tone: "muted" },
};
const UNKNOWN_LIFECYCLE = {
    key: "adminContentNotices.content.lifecycleUnknown",
    tone: "dashed",
} as const;

function yesNo(value: boolean, t: Translate): string {
    return t(value ? "adminContentNotices.content.yes" : "adminContentNotices.content.no");
}

/** The partner status now; a change since submission is spelled out and marked brass. */
function partnerNow(now: boolean, then: boolean, t: Translate): Pick<CompareRow, "value" | "mark"> {
    if (now === then) return { value: yesNo(now, t) };
    const key = now
        ? "adminContentNotices.content.partnerNowYes"
        : "adminContentNotices.content.partnerNowNo";
    return { value: t(key), mark: "brass" };
}

function urlRow(key: string, label: string, url: string | undefined): CompareRow[] {
    if (!url) return [];
    return [{ key, label, value: <ExternalLink href={url}>{url}</ExternalLink> }];
}

/** The target as it was when the notice arrived. */
function snapshotRows(notice: AdminContentNotice, t: Translate): CompareRow[] {
    const { snapshot } = notice;
    const listingRows: CompareRow[] =
        notice.target.type === "PRODUCT_LISTING"
            ? [
                  {
                      key: "listing",
                      label: t("adminContentNotices.content.listing"),
                      value: snapshot.productListingTitle ?? t("adminContentNotices.list.untitled"),
                      muted: !snapshot.productListingTitle,
                  },
                  ...urlRow(
                      "listingUrl",
                      t("adminContentNotices.content.listingUrl"),
                      snapshot.productListingUrl,
                  ),
              ]
            : [];
    return [
        ...listingRows,
        {
            key: "source",
            label: t("adminContentNotices.content.source"),
            value: snapshot.listingSourceName,
        },
        ...urlRow(
            "sourceUrl",
            t("adminContentNotices.content.sourceUrl"),
            snapshot.listingSourceUrl,
        ),
        {
            key: "partner",
            label: t("adminContentNotices.content.partner"),
            value: yesNo(snapshot.partner, t),
        },
    ];
}

function goneRow(key: string, label: string, t: Translate): CompareRow {
    return {
        key,
        label,
        value: t("adminContentNotices.content.gone"),
        mark: "dashed",
        muted: true,
    };
}

function currentListingRows(notice: AdminContentNotice, t: Translate): CompareRow[] {
    const listing = notice.current.productListing;
    const label = t("adminContentNotices.content.listing");
    if (!listing) return [];
    if (!listing.exists) return [goneRow("listing", label, t)];
    const lifecycle = (listing.lifecycle && LIFECYCLE[listing.lifecycle]) || UNKNOWN_LIFECYCLE;
    return [{ key: "listing", label, value: t(lifecycle.key), mark: lifecycle.tone }];
}

function IngestionTags({ methods }: { readonly methods: readonly string[] }) {
    const { t } = useTranslation();
    if (methods.length === 0) {
        return <MutedText>{t("adminContentNotices.content.noIngestion")}</MutedText>;
    }
    return methods.map((method) => (
        <span key={method} className={ADMIN_TAG_CLASS}>
            {t(`adminListingSources.methods.${method}`)}
        </span>
    ));
}

/** The target as it is now: the listing's lifecycle, the source, its ingestion and partner status. */
function currentRows(notice: AdminContentNotice, t: Translate, language: string): CompareRow[] {
    const source = notice.current.listingSource;
    const sourceLabel = t("adminContentNotices.content.source");
    if (!source.exists) {
        return [...currentListingRows(notice, t), goneRow("source", sourceLabel, t)];
    }
    return [
        ...currentListingRows(notice, t),
        {
            key: "source",
            label: sourceLabel,
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
            value: <IngestionTags methods={source.ingestionMethods} />,
        },
        {
            key: "partner",
            label: t("adminContentNotices.content.partner"),
            ...partnerNow(source.partner, notice.snapshot.partner, t),
        },
    ];
}

function MutedText({ children }: { readonly children: ReactNode }) {
    return <span className="text-ink-muted">{children}</span>;
}

function NoticeFacts({ notice }: { readonly notice: AdminContentNotice }) {
    const { t, i18n } = useTranslation();
    const listingId = notice.target.productListingId;
    const targetFact = listingId
        ? {
              key: "listing",
              label: t("adminContentNotices.fields.productListingId"),
              value: listingId,
          }
        : {
              key: "source",
              label: t("adminContentNotices.fields.listingSourceId"),
              value: notice.target.listingSourceId,
          };
    return (
        <AdminFacts
            facts={[
                {
                    key: "id",
                    label: t("adminContentNotices.fields.id"),
                    value: notice.id,
                    mono: true,
                },
                { ...targetFact, mono: true },
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
            ]}
        />
    );
}

function NoticeSection({ notice }: { readonly notice: AdminContentNotice }) {
    const { t } = useTranslation();
    const explanation = notice.explanation ? (
        <span className="leading-relaxed whitespace-pre-line">{notice.explanation}</span>
    ) : (
        <MutedText>{t("adminContentNotices.notice.noExplanation")}</MutedText>
    );
    const urls =
        notice.additionalUrls.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
                {notice.additionalUrls.map((url) => (
                    <li key={url} className="min-w-0">
                        <ExternalLink href={url}>{url}</ExternalLink>
                    </li>
                ))}
            </ul>
        ) : (
            <MutedText>{t("adminContentNotices.notice.noUrls")}</MutedText>
        );
    return (
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
                        value: explanation,
                    },
                    { key: "urls", label: t("adminContentNotices.notice.urls"), value: urls },
                    {
                        key: "goodFaith",
                        label: t("adminContentNotices.notice.goodFaith"),
                        value: t("adminContentNotices.notice.goodFaithConfirmed"),
                    },
                ]}
            />
        </Section>
    );
}

function ReportedContentSection({
    notice,
    language,
}: {
    readonly notice: AdminContentNotice;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const sourceExists = notice.current.listingSource.exists;
    const listingId = notice.current.productListing?.exists
        ? notice.target.productListingId
        : undefined;
    return (
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
                    rows={snapshotRows(notice, t)}
                />
                <CompareColumn
                    title={t("adminContentNotices.content.now")}
                    rows={currentRows(notice, t, language)}
                />
            </div>
            {(listingId || sourceExists) && (
                <div className="flex flex-wrap gap-2.5">
                    {listingId && (
                        <Link
                            to="/$lng/admin/product-listings/$productListingId"
                            params={{ lng: language, productListingId: listingId }}
                            className={cn(SECONDARY_PILL_CLASS, "basis-full sm:basis-auto")}
                        >
                            <Package aria-hidden="true" className="size-4" strokeWidth={1.7} />
                            {t("adminContentNotices.content.openListing")}
                        </Link>
                    )}
                    {sourceExists && (
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
    );
}

function AnonymousNotice() {
    const { t } = useTranslation();
    return (
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
    );
}

function NotifierSection({ notice }: { readonly notice: AdminContentNotice }) {
    const { t, i18n } = useTranslation();
    const languageName = useLanguageNames();
    const { name, email } = notice.submitter;
    const languageRow = {
        key: "language",
        label: t("adminContentNotices.notifier.language"),
        value: languageName(notice.submitter.language),
    };
    const emailValue = email ? (
        <a href={`mailto:${email}`} className={TEXT_LINK_CLASS}>
            {email}
        </a>
    ) : (
        <MutedText>{t("adminContentNotices.notifier.noEmail")}</MutedText>
    );
    return (
        <Section id="notifier" title={t("adminContentNotices.notifier.title")}>
            {!name && !email ? (
                <>
                    <AnonymousNotice />
                    <KeyValueRows rows={[languageRow]} />
                </>
            ) : (
                <KeyValueRows
                    rows={[
                        {
                            key: "name",
                            label: t("adminContentNotices.notifier.name"),
                            value: name ?? (
                                <MutedText>{t("adminContentNotices.notifier.noName")}</MutedText>
                            ),
                        },
                        {
                            key: "email",
                            label: t("adminContentNotices.notifier.email"),
                            value: emailValue,
                        },
                        languageRow,
                        {
                            key: "receipt",
                            label: t("adminContentNotices.notifier.receipt"),
                            value: receiptValue(notice, t, i18n.language),
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
    );
}

function NoticeBody({
    notice,
    language,
}: {
    readonly notice: AdminContentNotice;
    readonly language: string;
}) {
    return (
        <>
            <NoticeFacts notice={notice} />
            <NoticeSection notice={notice} />
            <ReportedContentSection notice={notice} language={language} />
            <NotifierSection notice={notice} />
        </>
    );
}

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
