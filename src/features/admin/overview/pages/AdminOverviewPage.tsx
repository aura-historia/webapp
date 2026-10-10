import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    ADMIN_APPLICATION_STATE_KEYS,
    ADMIN_INGESTION_METHOD_KEYS,
    ADMIN_LISTING_AVAILABILITY_KEYS,
    ADMIN_LISTING_LIFECYCLE_KEYS,
    ADMIN_USER_ROLE_KEYS,
    ADMIN_USER_TIER_KEYS,
    type AdminOverview,
    type AdminOverviewBreakdown,
} from "@/data/internal/admin/AdminOverview.ts";
import type { AdminSectionRoute } from "@/features/admin/common/components/AdminSidebar.tsx";
import { cn } from "@/lib/utils.ts";
import { useAdminOverview } from "../api/useAdminOverview.ts";

type Format = (value: number) => string;
type CountRow = { readonly id: string; readonly label: string; readonly value: number };

function rowsFor<Key extends string>(
    values: AdminOverviewBreakdown<Key>,
    keys: readonly Key[],
    label: (key: Key) => string,
): CountRow[] {
    return keys.map((key) => ({ id: key, label: label(key), value: values[key] }));
}

function SummaryTile({
    label,
    value,
    detail,
    format,
    to,
    language,
}: {
    readonly label: string;
    readonly value: number;
    readonly detail?: string;
    readonly format: Format;
    readonly to?: AdminSectionRoute;
    readonly language: string;
}) {
    const body = (
        <>
            <span className="hyphens-auto break-words text-sm text-muted-foreground">{label}</span>
            <span className="font-display text-3xl tabular-nums">{format(value)}</span>
            {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
        </>
    );
    const className = "flex h-full flex-col gap-1 border border-border bg-card p-4";

    return (
        <li className="min-w-0">
            {to ? (
                <Link
                    to={to}
                    params={{ lng: language }}
                    className={cn(
                        className,
                        "transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                >
                    {body}
                </Link>
            ) : (
                <div className={className}>{body}</div>
            )}
        </li>
    );
}

/**
 * Rows with a share bar. `base` is the population each value is measured against; values
 * are shown as reported and never summed.
 */
function Breakdown({
    title,
    note,
    rows,
    base,
    format,
    columns = 1,
}: {
    readonly title: string;
    readonly note?: string;
    readonly rows: readonly CountRow[];
    readonly base: number;
    readonly format: Format;
    readonly columns?: 1 | 2;
}) {
    return (
        <div className="grid content-start gap-3">
            <div className="grid gap-0.5">
                <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {title}
                </h3>
                {note && <p className="text-xs text-muted-foreground">{note}</p>}
            </div>
            <dl className={cn("grid gap-x-8 gap-y-2.5", columns === 2 && "sm:grid-cols-2")}>
                {rows.map((row) => {
                    const share = base > 0 ? Math.min(row.value / base, 1) : 0;
                    return (
                        <div key={row.id} className="grid gap-1">
                            <div
                                className={cn(
                                    "flex items-baseline justify-between gap-3 text-sm",
                                    row.value === 0 && "text-muted-foreground",
                                )}
                            >
                                <dt>{row.label}</dt>
                                <dd className="font-medium tabular-nums">{format(row.value)}</dd>
                            </div>
                            <div className="h-0.5 bg-surface-container-high" aria-hidden="true">
                                <div
                                    className="h-full bg-primary/70"
                                    style={{ width: `${share * 100}%` }}
                                />
                            </div>
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
    action,
    children,
    className,
}: {
    readonly id: string;
    readonly title: string;
    readonly action?: { readonly to: AdminSectionRoute; readonly label: string; language: string };
    readonly children: ReactNode;
    readonly className?: string;
}) {
    const titleId = `admin-overview-${id}-title`;
    return (
        <section
            aria-labelledby={titleId}
            className={cn("flex flex-col gap-5 border border-border bg-card p-5", className)}
        >
            <h2 id={titleId} className="font-display text-xl italic">
                {title}
            </h2>
            {children}
            {action && (
                // Pinned to the panel foot so links line up across equal-height panels.
                <footer className="mt-auto border-t border-border pt-4">
                    <Link
                        to={action.to}
                        params={{ lng: action.language }}
                        className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {action.label}
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </footer>
            )}
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
    const detail = (key: string, value: number) => `${t(key)}: ${format(value)}`;

    return (
        <div className="grid gap-6">
            <ul
                aria-label={t("adminOverview.summary.label")}
                className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
            >
                <SummaryTile
                    label={t("adminOverview.users.title")}
                    value={users.total}
                    detail={detail("adminOverview.users.roles.admin", users.byRole.admin)}
                    format={format}
                    to="/$lng/admin/users"
                    language={language}
                />
                <SummaryTile
                    label={t("adminOverview.applications.title")}
                    value={partnershipApplications.total}
                    // Submitted and in-review are distinct states, so their sum is exact.
                    detail={detail(
                        "adminOverview.summary.awaitingReview",
                        applicationStates.submitted + applicationStates.inReview,
                    )}
                    format={format}
                    to="/$lng/admin/partnership-applications"
                    language={language}
                />
                <SummaryTile
                    label={t("adminOverview.partnerships.title")}
                    value={partnerships.total}
                    format={format}
                    to="/$lng/admin/partnerships"
                    language={language}
                />
                <SummaryTile
                    label={t("adminOverview.parties.title")}
                    value={parties.total}
                    format={format}
                    to="/$lng/admin/parties"
                    language={language}
                />
                <SummaryTile
                    label={t("adminOverview.listingSources.title")}
                    value={listingSources.total}
                    detail={detail(
                        "adminOverview.listingSources.withoutIngestionMethod",
                        listingSources.withoutIngestionMethod,
                    )}
                    format={format}
                    to="/$lng/admin/listing-sources"
                    language={language}
                />
                <SummaryTile
                    label={t("adminOverview.productListings.title")}
                    value={productListings.total}
                    detail={detail(
                        "adminOverview.productListings.lifecycle.active",
                        productListings.byLifecycle.active,
                    )}
                    format={format}
                    language={language}
                />
            </ul>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Panel
                    id="users"
                    title={t("adminOverview.users.title")}
                    action={{
                        to: "/$lng/admin/users",
                        label: t("adminOverview.users.link"),
                        language,
                    }}
                >
                    <div className="grid gap-6">
                        <Breakdown
                            title={t("adminOverview.users.byTier")}
                            rows={rowsFor(users.byTier, ADMIN_USER_TIER_KEYS, (key) =>
                                t(`adminOverview.users.tiers.${key}`),
                            )}
                            base={users.total}
                            format={format}
                        />
                        <Breakdown
                            title={t("adminOverview.users.byRole")}
                            rows={rowsFor(users.byRole, ADMIN_USER_ROLE_KEYS, (key) =>
                                t(`adminOverview.users.roles.${key}`),
                            )}
                            base={users.total}
                            format={format}
                        />
                    </div>
                </Panel>

                <Panel
                    id="applications"
                    title={t("adminOverview.applications.title")}
                    action={{
                        to: "/$lng/admin/partnership-applications",
                        label: t("adminOverview.applications.link"),
                        language,
                    }}
                >
                    <Breakdown
                        title={t("adminOverview.applications.byState")}
                        rows={rowsFor(applicationStates, ADMIN_APPLICATION_STATE_KEYS, (key) =>
                            t(`adminOverview.applications.states.${key}`),
                        )}
                        base={partnershipApplications.total}
                        format={format}
                    />
                </Panel>

                <Panel
                    id="listing-sources"
                    title={t("adminOverview.listingSources.title")}
                    action={{
                        to: "/$lng/admin/listing-sources",
                        label: t("adminOverview.listingSources.link"),
                        language,
                    }}
                >
                    <Breakdown
                        title={t("adminOverview.listingSources.methodAssignments")}
                        note={t("adminOverview.listingSources.methodAssignmentsNote")}
                        rows={[
                            ...rowsFor(
                                listingSources.methodAssignments,
                                ADMIN_INGESTION_METHOD_KEYS,
                                (key) => t(`adminOverview.listingSources.methods.${key}`),
                            ),
                            {
                                id: "withoutIngestionMethod",
                                label: t("adminOverview.listingSources.withoutIngestionMethod"),
                                value: listingSources.withoutIngestionMethod,
                            },
                        ]}
                        base={listingSources.total}
                        format={format}
                    />
                </Panel>

                <Panel
                    id="product-listings"
                    title={t("adminOverview.productListings.title")}
                    className="md:col-span-2 xl:col-span-3"
                >
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <Breakdown
                            title={t("adminOverview.productListings.byLifecycle")}
                            rows={rowsFor(
                                productListings.byLifecycle,
                                ADMIN_LISTING_LIFECYCLE_KEYS,
                                (key) => t(`adminOverview.productListings.lifecycle.${key}`),
                            )}
                            base={productListings.total}
                            format={format}
                        />
                        <Breakdown
                            title={t("adminOverview.productListings.activeAvailability")}
                            note={t("adminOverview.productListings.activeAvailabilityNote")}
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
                                },
                            ]}
                            base={productListings.byLifecycle.active}
                            format={format}
                            columns={2}
                        />
                    </div>
                </Panel>
            </div>
        </div>
    );
}

function OverviewSkeleton() {
    const { t } = useTranslation();
    return (
        <div className="grid gap-6" aria-busy="true">
            <output className="sr-only">{t("adminOverview.loading")}</output>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-72 w-full" />
                ))}
                <Skeleton className="h-80 w-full md:col-span-2 xl:col-span-3" />
            </div>
        </div>
    );
}

export function AdminOverviewPage({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    const overviewQuery = useAdminOverview();

    let content: ReactNode;
    if (overviewQuery.data) {
        content = (
            <>
                {overviewQuery.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {t("adminOverview.errors.stale")}
                    </p>
                )}
                <OverviewContent overview={overviewQuery.data} language={language} />
            </>
        );
    } else if (overviewQuery.error) {
        // Counters stay unavailable on failure; never substitute zero for an unknown value.
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-6">
                <p className="text-muted-foreground">{overviewQuery.error.message}</p>
                <Button variant="outline" onClick={() => overviewQuery.refetch()}>
                    {t("adminOverview.actions.retry")}
                </Button>
            </div>
        );
    } else {
        content = <OverviewSkeleton />;
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <header className="grid gap-1">
                <H1>{t("adminOverview.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">{t("adminOverview.description")}</p>
            </header>
            {content}
        </div>
    );
}
