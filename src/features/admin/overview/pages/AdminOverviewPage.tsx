import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import {
    ADMIN_APPLICATION_STATE_KEYS,
    ADMIN_INGESTION_METHOD_KEYS,
    ADMIN_LISTING_AVAILABILITY_KEYS,
    ADMIN_LISTING_LIFECYCLE_KEYS,
    ADMIN_USER_TIER_KEYS,
    type AdminApplicationStateKey,
    type AdminOverview,
    type AdminOverviewBreakdown,
} from "@/data/internal/admin/AdminOverview.ts";
import type { AdminSectionRoute } from "@/features/admin/common/components/AdminNav.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import {
    AdminMark,
    type AdminMarkTone,
} from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_PAGE_SECTION_TITLE_CLASS,
    ADMIN_PAGE_TITLE_CLASS,
    ADMIN_PANEL_CLASS,
    ADMIN_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_SMALL_PRIMARY_CLASS,
    FOCUS_CLASS,
    MONO_LABEL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminOverview } from "../api/useAdminOverview.ts";
import { AdminServiceStatusPanel } from "../components/AdminServiceStatusPanel.tsx";

type Format = (value: number) => string;

type CountRow = {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly mark?: AdminMarkTone;
    /** Brass bar for the "nothing reported" remainder rows. */
    readonly remainder?: boolean;
};

const APPLICATION_MARKS: Record<AdminApplicationStateKey, AdminMarkTone> = {
    submitted: "hollow",
    inReview: "brass",
    approved: "ink",
    rejected: "oxblood",
    withdrawn: "dashed",
};

function rowsFor<Key extends string>(
    values: AdminOverviewBreakdown<Key>,
    keys: readonly Key[],
    label: (key: Key) => string,
    mark?: (key: Key) => AdminMarkTone,
): CountRow[] {
    return keys.map((key) => ({
        id: key,
        label: label(key),
        value: values[key],
        ...(mark && { mark: mark(key) }),
    }));
}

// ─── Totals ─────────────────────────────────────────────────────────────────

type Total = {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly detail?: string;
    /** Brass ring before the detail: something needs attention. */
    readonly flag?: boolean;
    readonly to: AdminSectionRoute;
};

function TotalTile({
    total,
    index,
    format,
    language,
}: {
    readonly total: Total;
    readonly index: number;
    readonly format: Format;
    readonly language: string;
}) {
    // Two columns on phones, three from 768px; every tile but a row's first has a rule on its left.
    const firstOnPhone = index % 2 === 0;
    const firstOnDesktop = index % 3 === 0;
    return (
        <li
            className={cn(
                "min-w-0 border-b border-line",
                !firstOnPhone && "shadow-[inset_1px_0_0_var(--line)]",
                firstOnDesktop ? "md:shadow-none" : "md:shadow-[inset_1px_0_0_var(--line)]",
            )}
        >
            <Link
                to={total.to}
                params={{ lng: language }}
                className={cn(
                    // Every tile keeps padding on both sides, so its content never meets the edge.
                    "group flex h-full flex-col gap-2.5 px-4 py-[18px] hover:bg-surface-raised md:px-7 md:py-6",
                    FOCUS_CLASS,
                )}
            >
                <span className={cn(MONO_LABEL_CLASS, "flex items-center justify-between gap-2")}>
                    {total.label}
                    <ArrowRight
                        aria-hidden="true"
                        className="size-[13px] shrink-0 transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none"
                        strokeWidth={1.8}
                    />
                </span>
                <span className="font-serif text-[30px] leading-none tracking-[-0.02em] tabular-nums lining-nums md:text-[36px] lg:text-[44px]">
                    {format(total.value)}
                </span>
                <span className="flex min-h-5 items-center gap-2 text-meta leading-normal text-ink-secondary">
                    {total.flag && <AdminMark tone="brass" className="size-2" />}
                    {total.detail}
                </span>
            </Link>
        </li>
    );
}

// ─── Breakdown ──────────────────────────────────────────────────────────────

/**
 * A ruled count list with share bars. `base` is the population each value is measured against;
 * values are shown as reported and never summed.
 */
function CountGroup({
    title,
    rows,
    base,
    format,
    columns = 1,
}: {
    readonly title: string;
    readonly rows: readonly CountRow[];
    readonly base: number;
    readonly format: Format;
    readonly columns?: 1 | 2;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <h4 className={cn(MONO_LABEL_CLASS, "font-normal")}>{title}</h4>
            <dl
                className={cn(
                    "grid grid-cols-1 gap-x-7 border-t border-line",
                    columns === 2 && "md:grid-cols-2",
                )}
            >
                {rows.map((row) => {
                    const share = base > 0 ? Math.min(row.value / base, 1) : 0;
                    return (
                        <div
                            key={row.id}
                            className={cn(
                                "flex flex-col gap-1.5 border-b border-line-subtle pt-2.5 pb-[9px]",
                                row.value === 0 ? "text-ink-muted" : "text-ink",
                            )}
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <dt className="inline-flex items-center gap-2 text-sm">
                                    {row.mark && <AdminMark tone={row.mark} />}
                                    {row.label}
                                </dt>
                                <dd className="font-serif text-lg tabular-nums lining-nums">
                                    {format(row.value)}
                                </dd>
                            </div>
                            <span
                                aria-hidden="true"
                                className="h-[3px] overflow-hidden rounded-pill bg-surface-sunken"
                            >
                                <span
                                    className={cn(
                                        "block h-full",
                                        row.remainder ? "bg-brass" : "bg-ink",
                                    )}
                                    style={{ width: `${(share * 100).toFixed(1)}%` }}
                                />
                            </span>
                        </div>
                    );
                })}
            </dl>
        </div>
    );
}

function Panel({
    id,
    title,
    children,
    className,
}: {
    readonly id: string;
    readonly title: string;
    readonly children: ReactNode;
    readonly className?: string;
}) {
    const titleId = `admin-overview-${id}-title`;
    return (
        <section
            aria-labelledby={titleId}
            className={cn(
                ADMIN_PANEL_CLASS,
                "flex min-w-0 flex-col gap-5 px-5 py-[22px] md:p-7",
                className,
            )}
        >
            <h3 id={titleId} className={ADMIN_SECTION_TITLE_CLASS}>
                {title}
            </h3>
            {children}
        </section>
    );
}

function OverviewContent({
    overview,
    language,
}: {
    readonly overview: AdminOverview;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const formatter = new Intl.NumberFormat(language);
    const format: Format = (value) => formatter.format(value);
    const { users, partnershipApplications, parties, partnerships, listingSources } = overview;
    const { productListings } = overview;
    const applicationStates = partnershipApplications.byState;
    // Submitted and in-review are distinct states, so their sum is exact.
    const awaitingReview = applicationStates.submitted + applicationStates.inReview;
    const counted = (key: string, value: number) => t(key, { count: value, value: format(value) });

    const totals: Total[] = [
        {
            id: "users",
            label: t("adminOverview.users.title"),
            value: users.total,
            detail: counted("adminOverview.totals.administrators", users.byRole.admin),
            to: "/$lng/admin/users",
        },
        {
            id: "applications",
            label: t("adminOverview.applications.label"),
            value: partnershipApplications.total,
            detail: counted("adminOverview.totals.awaitingReview", awaitingReview),
            flag: awaitingReview > 0,
            to: "/$lng/admin/partnership-applications",
        },
        {
            id: "partnerships",
            label: t("adminOverview.partnerships.title"),
            value: partnerships.total,
            to: "/$lng/admin/partnerships",
        },
        {
            id: "parties",
            label: t("adminOverview.parties.title"),
            value: parties.total,
            to: "/$lng/admin/parties",
        },
        {
            id: "listing-sources",
            label: t("adminOverview.listingSources.title"),
            value: listingSources.total,
            detail: counted(
                "adminOverview.totals.withoutIngestionMethod",
                listingSources.withoutIngestionMethod,
            ),
            to: "/$lng/admin/listing-sources",
        },
        {
            id: "product-listings",
            label: t("adminOverview.productListings.title"),
            value: productListings.total,
            detail: counted("adminOverview.totals.active", productListings.byLifecycle.active),
            to: "/$lng/admin/product-listings",
        },
    ];

    return (
        <>
            <section aria-labelledby="admin-overview-totals-title" className="flex flex-col gap-5">
                <h2 id="admin-overview-totals-title" className={ADMIN_PAGE_SECTION_TITLE_CLASS}>
                    {t("adminOverview.summary.label")}
                </h2>
                <ul
                    aria-label={t("adminOverview.summary.label")}
                    className="grid grid-cols-2 border-t border-line md:grid-cols-3"
                >
                    {totals.map((total, index) => (
                        <TotalTile
                            key={total.id}
                            total={total}
                            index={index}
                            format={format}
                            language={language}
                        />
                    ))}
                </ul>
            </section>

            <section
                aria-labelledby="admin-overview-breakdown-title"
                className="flex flex-col gap-5"
            >
                <h2 id="admin-overview-breakdown-title" className={ADMIN_PAGE_SECTION_TITLE_CLASS}>
                    {t("adminOverview.breakdown")}
                </h2>
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                    {/* Users and listing sources share a column beside the taller applications panel. */}
                    <div className="flex min-w-0 flex-col gap-5">
                        <Panel id="users" title={t("adminOverview.users.title")}>
                            <CountGroup
                                title={t("adminOverview.users.byTier")}
                                rows={rowsFor(users.byTier, ADMIN_USER_TIER_KEYS, (key) =>
                                    t(`adminOverview.users.tiers.${key}`),
                                )}
                                base={users.total}
                                format={format}
                            />
                        </Panel>

                        <Panel id="listing-sources" title={t("adminOverview.listingSources.title")}>
                            <CountGroup
                                title={t("adminOverview.listingSources.methodAssignments")}
                                rows={[
                                    ...rowsFor(
                                        listingSources.methodAssignments,
                                        ADMIN_INGESTION_METHOD_KEYS,
                                        (key) => t(`adminOverview.listingSources.methods.${key}`),
                                    ),
                                    {
                                        id: "withoutIngestionMethod",
                                        label: t(
                                            "adminOverview.listingSources.withoutIngestionMethod",
                                        ),
                                        value: listingSources.withoutIngestionMethod,
                                        remainder: true,
                                    },
                                ]}
                                base={listingSources.total}
                                format={format}
                            />
                            <p className="text-xs leading-normal text-ink-muted">
                                {t("adminOverview.listingSources.overlapNote")}
                            </p>
                        </Panel>
                    </div>

                    <Panel id="applications" title={t("adminOverview.applications.label")}>
                        {awaitingReview > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-sunken px-4 py-3.5">
                                <p className="flex items-center gap-2.5 text-sm">
                                    <AdminMark tone="brass" />
                                    <span>
                                        <Trans
                                            i18nKey="adminOverview.applications.awaitingReview"
                                            count={awaitingReview}
                                            values={{ value: format(awaitingReview) }}
                                            components={{
                                                strong: (
                                                    <strong className="font-semibold tabular-nums" />
                                                ),
                                            }}
                                        />
                                    </span>
                                </p>
                                <Link
                                    to="/$lng/admin/partnership-applications"
                                    params={{ lng: language }}
                                    className={cn(ADMIN_SMALL_PRIMARY_CLASS, "h-9 px-3.5")}
                                >
                                    {t("adminOverview.applications.review")}
                                </Link>
                            </div>
                        )}
                        <CountGroup
                            title={t("adminOverview.applications.byState")}
                            rows={rowsFor(
                                applicationStates,
                                ADMIN_APPLICATION_STATE_KEYS,
                                (key) => t(`adminOverview.applications.states.${key}`),
                                (key) => APPLICATION_MARKS[key],
                            )}
                            base={partnershipApplications.total}
                            format={format}
                        />
                    </Panel>

                    <Panel
                        id="product-listings"
                        title={t("adminOverview.productListings.title")}
                        className="lg:col-span-2"
                    >
                        <CountGroup
                            title={t("adminOverview.productListings.byLifecycle")}
                            rows={rowsFor(
                                productListings.byLifecycle,
                                ADMIN_LISTING_LIFECYCLE_KEYS,
                                (key) => t(`adminOverview.productListings.lifecycle.${key}`),
                            )}
                            base={productListings.total}
                            format={format}
                            columns={2}
                        />
                        <CountGroup
                            title={t("adminOverview.productListings.activeAvailability")}
                            rows={[
                                ...rowsFor(
                                    productListings.activeAvailability,
                                    ADMIN_LISTING_AVAILABILITY_KEYS,
                                    (key) => t(`adminOverview.productListings.availability.${key}`),
                                ),
                                {
                                    id: "activeWithoutAvailability",
                                    label: t(
                                        "adminOverview.productListings.activeWithoutAvailability",
                                    ),
                                    value: productListings.activeWithoutAvailability,
                                    remainder: true,
                                },
                            ]}
                            base={productListings.byLifecycle.active}
                            format={format}
                            columns={2}
                        />
                    </Panel>
                </div>
            </section>
        </>
    );
}

function OverviewSkeleton() {
    const { t } = useTranslation();
    const bar = (className: string) => (
        <span aria-hidden="true" className={cn(ADMIN_SKELETON_CLASS, className)} />
    );
    return (
        <div aria-busy="true" className="flex flex-col gap-12 md:gap-16">
            <output className="sr-only">{t("adminOverview.loading")}</output>
            <div className="flex flex-col gap-5">
                {bar("h-8 w-40")}
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <span key={index}>{bar("block h-28 rounded-sm")}</span>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-5">
                {bar("h-8 w-48")}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {bar("h-72 rounded-panel")}
                    {bar("h-72 rounded-panel")}
                </div>
            </div>
        </div>
    );
}

export function AdminOverviewPage({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    const overviewQuery = useAdminOverview();
    const stale = Boolean(overviewQuery.data && overviewQuery.error);

    let content: ReactNode;
    if (overviewQuery.data) {
        content = <OverviewContent overview={overviewQuery.data} language={language} />;
    } else if (overviewQuery.error) {
        // Counters stay unavailable on failure; never substitute zero for an unknown value.
        content = (
            <AdminStatePanel tone="error" title={t("adminOverview.unavailable")}>
                <button
                    type="button"
                    onClick={() => void overviewQuery.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else {
        content = <OverviewSkeleton />;
    }

    return (
        <div className="flex flex-col gap-12 md:gap-16">
            <div className="-mb-4 flex flex-col gap-8 md:-mb-6 md:gap-10">
                <h1 className={ADMIN_PAGE_TITLE_CLASS}>{t("adminOverview.pageTitle")}</h1>
                {stale && (
                    <p
                        role="alert"
                        className="flex gap-2.5 rounded-md px-3.5 py-3 text-sm leading-normal shadow-[inset_0_0_0_1.5px_var(--brass)]"
                    >
                        <AdminMark tone="brass" className="mt-1.5" />
                        {t("adminOverview.errors.outOfDate")}
                    </p>
                )}
            </div>
            {/* Independent of the counters, so it stays visible when the overview cannot load. */}
            <AdminServiceStatusPanel language={language} />
            {content}
        </div>
    );
}
