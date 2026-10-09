import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
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
import { useAdminOverview } from "../api/useAdminOverview.ts";

type AdminSectionRoute =
    | "/$lng/admin/users"
    | "/$lng/admin/partnership-applications"
    | "/$lng/admin/parties"
    | "/$lng/admin/partnerships"
    | "/$lng/admin/shops"
    | "/$lng/admin/auctions"
    | "/$lng/admin/oauth-clients";

type CountRow = { readonly label: string; readonly value: number };

function useCountFormatter(language: string) {
    const formatter = new Intl.NumberFormat(language);
    return (value: number) => formatter.format(value);
}

function CountList({
    title,
    note,
    rows,
    format,
}: {
    readonly title?: string;
    readonly note?: string;
    readonly rows: readonly CountRow[];
    readonly format: (value: number) => string;
}) {
    return (
        <div className="grid gap-2">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
            <dl className="grid gap-1 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-3">
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-medium tabular-nums">{format(row.value)}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function OverviewCard({
    id,
    title,
    total,
    totalLabel,
    format,
    language,
    to,
    linkLabel,
    children,
}: {
    readonly id: string;
    readonly title: string;
    readonly total: number;
    readonly totalLabel: string;
    readonly format: (value: number) => string;
    readonly language: string;
    readonly to?: AdminSectionRoute;
    readonly linkLabel?: string;
    readonly children?: ReactNode;
}) {
    const titleId = `admin-overview-${id}-title`;
    return (
        <section className="grid content-start gap-4 border bg-card p-5" aria-labelledby={titleId}>
            <div className="grid gap-1">
                <h2 id={titleId} className="font-display text-xl italic">
                    {title}
                </h2>
                <p className="flex items-baseline gap-2">
                    <span className="text-3xl font-medium tabular-nums">{format(total)}</span>
                    <span className="text-sm text-muted-foreground">{totalLabel}</span>
                </p>
            </div>
            {children}
            {to && linkLabel && (
                <Button asChild variant="outline" className="w-fit">
                    <Link to={to} params={{ lng: language }}>
                        {linkLabel}
                    </Link>
                </Button>
            )}
        </section>
    );
}

function rowsFor<Key extends string>(
    values: AdminOverviewBreakdown<Key>,
    keys: readonly Key[],
    label: (key: Key) => string,
): CountRow[] {
    return keys.map((key) => ({ label: label(key), value: values[key] }));
}

function OverviewContent({
    overview,
    language,
}: {
    readonly overview: AdminOverview;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const format = useCountFormatter(language);
    const { users, partnershipApplications, parties, partnerships, listingSources } = overview;
    const { productListings } = overview;

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <OverviewCard
                id="users"
                title={t("adminOverview.users.title")}
                total={users.total}
                totalLabel={t("adminOverview.totalLabel")}
                format={format}
                language={language}
                to="/$lng/admin/users"
                linkLabel={t("adminOverview.users.link")}
            >
                <CountList
                    title={t("adminOverview.users.byTier")}
                    rows={rowsFor(users.byTier, ADMIN_USER_TIER_KEYS, (key) =>
                        t(`adminOverview.users.tiers.${key}`),
                    )}
                    format={format}
                />
                <CountList
                    title={t("adminOverview.users.byRole")}
                    rows={rowsFor(users.byRole, ADMIN_USER_ROLE_KEYS, (key) =>
                        t(`adminOverview.users.roles.${key}`),
                    )}
                    format={format}
                />
            </OverviewCard>

            <OverviewCard
                id="applications"
                title={t("adminOverview.applications.title")}
                total={partnershipApplications.total}
                totalLabel={t("adminOverview.totalLabel")}
                format={format}
                language={language}
                to="/$lng/admin/partnership-applications"
                linkLabel={t("adminOverview.applications.link")}
            >
                <CountList
                    title={t("adminOverview.applications.byState")}
                    rows={rowsFor(
                        partnershipApplications.byState,
                        ADMIN_APPLICATION_STATE_KEYS,
                        (key) => t(`adminOverview.applications.states.${key}`),
                    )}
                    format={format}
                />
            </OverviewCard>

            <OverviewCard
                id="listing-sources"
                title={t("adminOverview.listingSources.title")}
                total={listingSources.total}
                totalLabel={t("adminOverview.totalLabel")}
                format={format}
                language={language}
                to="/$lng/admin/shops"
                linkLabel={t("adminOverview.listingSources.link")}
            >
                <CountList
                    rows={[
                        {
                            label: t("adminOverview.listingSources.withoutIngestionMethod"),
                            value: listingSources.withoutIngestionMethod,
                        },
                    ]}
                    format={format}
                />
                <CountList
                    title={t("adminOverview.listingSources.methodAssignments")}
                    note={t("adminOverview.listingSources.methodAssignmentsNote")}
                    rows={rowsFor(
                        listingSources.methodAssignments,
                        ADMIN_INGESTION_METHOD_KEYS,
                        (key) => t(`adminOverview.listingSources.methods.${key}`),
                    )}
                    format={format}
                />
            </OverviewCard>

            <OverviewCard
                id="parties"
                title={t("adminOverview.parties.title")}
                total={parties.total}
                totalLabel={t("adminOverview.totalLabel")}
                format={format}
                language={language}
                to="/$lng/admin/parties"
                linkLabel={t("adminOverview.parties.link")}
            />

            <OverviewCard
                id="partnerships"
                title={t("adminOverview.partnerships.title")}
                total={partnerships.total}
                totalLabel={t("adminOverview.totalLabel")}
                format={format}
                language={language}
                to="/$lng/admin/partnerships"
                linkLabel={t("adminOverview.partnerships.link")}
            />

            <OverviewCard
                id="product-listings"
                title={t("adminOverview.productListings.title")}
                total={productListings.total}
                totalLabel={t("adminOverview.totalLabel")}
                format={format}
                language={language}
            >
                <CountList
                    title={t("adminOverview.productListings.byLifecycle")}
                    rows={rowsFor(
                        productListings.byLifecycle,
                        ADMIN_LISTING_LIFECYCLE_KEYS,
                        (key) => t(`adminOverview.productListings.lifecycle.${key}`),
                    )}
                    format={format}
                />
                <CountList
                    title={t("adminOverview.productListings.activeAvailability")}
                    note={t("adminOverview.productListings.activeAvailabilityNote")}
                    rows={[
                        ...rowsFor(
                            productListings.activeAvailability,
                            ADMIN_LISTING_AVAILABILITY_KEYS,
                            (key) => t(`adminOverview.productListings.availability.${key}`),
                        ),
                        {
                            label: t("adminOverview.productListings.activeWithoutAvailability"),
                            value: productListings.activeWithoutAvailability,
                        },
                    ]}
                    format={format}
                />
            </OverviewCard>
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
        content = (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                <output className="sr-only">{t("adminOverview.loading")}</output>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Skeleton key={index} className="h-48 w-full" />
                ))}
            </div>
        );
    }

    const otherSections: { to: AdminSectionRoute; label: string }[] = [
        { to: "/$lng/admin/auctions", label: t("adminOverview.otherSections.auctions") },
        { to: "/$lng/admin/oauth-clients", label: t("adminOverview.otherSections.oauthClients") },
    ];

    return (
        <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6">
            <header className="grid gap-1">
                <H1>{t("adminOverview.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">{t("adminOverview.description")}</p>
            </header>

            {content}

            <nav aria-labelledby="admin-overview-other-title" className="grid gap-3">
                <h2 id="admin-overview-other-title" className="font-display text-xl italic">
                    {t("adminOverview.otherSections.title")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                    {otherSections.map((section) => (
                        <li key={section.to}>
                            <Button asChild variant="outline">
                                <Link to={section.to} params={{ lng: language }}>
                                    {section.label}
                                </Link>
                            </Button>
                        </li>
                    ))}
                </ul>
            </nav>
        </main>
    );
}
