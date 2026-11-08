import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { canWithdrawApplication } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useAccessTokens } from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import { AccessTokenExpiry } from "@/features/partner/access-token-management/components/AccessTokenRow.tsx";
import {
    sortAccessTokens,
    useClientNow,
} from "@/features/partner/access-token-management/lib/accessTokenExpiry.ts";
import { usePartnerApplications } from "@/features/partner/application-management/api/usePartnerApplications.ts";
import { PartnerApplicationCompactRow } from "@/features/partner/application-management/components/PartnerApplicationRow.tsx";
import { useOwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";
import { useProviderNames } from "@/features/partner/common/api/useProviderNames.ts";
import {
    FOCUS_CLASS,
    PAGE_TITLE_CLASS,
    SECTION_HEADING_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { cn } from "@/lib/utils.ts";
import { GlanceTile, type GlanceTileState } from "../components/GlanceTile.tsx";

const RECENT_COUNT = 3;

function tileState(isPending: boolean, isError: boolean): GlanceTileState {
    if (isPending) return "pending";
    if (isError) return "error";
    return "ready";
}

/** Everything the overview shows, derived from the three section lists. */
function usePartnerOverviewData() {
    const { i18n } = useTranslation();
    const applicationsQuery = usePartnerApplications();
    const tokensQuery = useAccessTokens();
    const { isAuthenticated, isResolved } = useResolvedAuth();
    const listingSources = useOwnListingSources(isAuthenticated);
    const providerNames = useProviderNames(listingSources.sources);
    const now = useClientNow(tokensQuery.dataUpdatedAt);

    const applications = applicationsQuery.data ?? [];
    const tokens = sortAccessTokens(tokensQuery.data ?? [], now, i18n.language);
    const providerCount = listingSources.sources.length;
    const providersPending = !isResolved || (isAuthenticated && listingSources.isPending);

    return {
        applications,
        openCount: applications.filter(canWithdrawApplication).length,
        inReviewCount: applications.filter((application) => application.state === "IN_REVIEW")
            .length,
        applicationsState: tileState(applicationsQuery.isPending, applicationsQuery.isError),
        retryApplications: () => void applicationsQuery.refetch(),
        tokens,
        activeCount: tokens.filter((entry) => entry.expiry !== "expired").length,
        soonCount: tokens.filter((entry) => entry.expiry === "soon").length,
        tokensState: tileState(tokensQuery.isPending, tokensQuery.isError),
        retryTokens: () => void tokensQuery.refetch(),
        providerCount,
        providerFigure: listingSources.hasMore ? `${providerCount}+` : String(providerCount),
        providersState: tileState(providersPending, listingSources.isError),
        retryProviders: listingSources.retry,
        providerNames,
    };
}

type OverviewData = ReturnType<typeof usePartnerOverviewData>;

/** The dashboard's landing page (board "Partner dashboard · Overview"); counts come from the section lists. */
export function PartnerOverviewPage() {
    const data = usePartnerOverviewData();
    return (
        <>
            <h1 className={cn(PAGE_TITLE_CLASS, "-mb-3 sm:-mb-7")}>
                <Trans i18nKey="partnerDashboard.heading" components={HEADLINE_COMPONENTS} />
            </h1>
            <GlanceSection data={data} />
            <StepsSection data={data} />
            <div className="grid items-start gap-12 md:grid-cols-2">
                <RecentApplications data={data} />
                <RecentTokens data={data} />
            </div>
        </>
    );
}

function GlanceSection({ data }: { readonly data: OverviewData }) {
    const { t } = useTranslation();
    const noApplications = data.applications.length === 0;

    let tokensNote = t("partnerDashboard.overview.tokens.noneNote");
    if (data.soonCount > 0) {
        tokensNote = t("partnerDashboard.overview.tokens.soonNote", { count: data.soonCount });
    } else if (data.tokens.length > 0) {
        tokensNote = t("partnerDashboard.overview.tokens.totalNote", { count: data.tokens.length });
    }

    return (
        <section
            data-theme="dark"
            aria-labelledby="partner-glance-title"
            className="flex flex-col gap-7 rounded-card bg-surface px-5 py-6 text-ink sm:px-9 sm:pt-8 sm:pb-9"
        >
            <h2
                id="partner-glance-title"
                className="font-mono text-[11px] font-normal tracking-[0.16em] text-brass-light uppercase"
            >
                {t("partnerDashboard.overview.glance")}
            </h2>
            <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
                <GlanceTile
                    state={data.applicationsState}
                    label={t("partnerDashboard.nav.applications")}
                    figure={String(data.openCount)}
                    unit={t("partnerDashboard.overview.applications.unit")}
                    note={
                        noApplications
                            ? t("partnerDashboard.overview.applications.noneNote")
                            : t("partnerDashboard.overview.applications.note", {
                                  inReview: data.inReviewCount,
                                  count: data.applications.length,
                              })
                    }
                    cta={
                        noApplications
                            ? t("partnerApplications.create.open")
                            : t("partnerDashboard.overview.applications.cta")
                    }
                    to="/$lng/partners/applications"
                    createSearch={noApplications}
                    onRetry={data.retryApplications}
                />
                <GlanceTile
                    state={data.providersState}
                    label={t("partnerDashboard.nav.providers")}
                    figure={data.providerFigure}
                    unit={t("partnerDashboard.overview.providers.unit")}
                    note={
                        data.providerCount === 0
                            ? t("partnerDashboard.overview.providers.noneNote")
                            : t("partnerDashboard.overview.providers.note")
                    }
                    cta={t("partnerDashboard.overview.providers.cta")}
                    to="/$lng/partners/listing-sources"
                    onRetry={data.retryProviders}
                />
                <GlanceTile
                    state={data.tokensState}
                    label={t("partnerDashboard.nav.accessTokens")}
                    figure={String(data.activeCount)}
                    unit={t("partnerDashboard.overview.tokens.unit")}
                    note={tokensNote}
                    flagged={data.soonCount > 0}
                    cta={t("partnerDashboard.overview.tokens.cta")}
                    to="/$lng/partners/access-tokens"
                    onRetry={data.retryTokens}
                />
            </div>
        </section>
    );
}

function StepsSection({ data }: { readonly data: OverviewData }) {
    const { t } = useTranslation();
    const applicationsReady = data.applicationsState === "ready";
    const tokensReady = data.tokensState === "ready";
    const hasApplications = data.applications.length > 0;
    const hasActiveTokens = data.activeCount > 0;
    const hasProviders = data.providersState === "ready" && data.providerCount > 0;

    return (
        <section aria-labelledby="partner-steps-title" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 id="partner-steps-title" className={SECTION_HEADING_CLASS}>
                    <Trans
                        i18nKey="partnerDashboard.steps.heading"
                        components={HEADLINE_COMPONENTS}
                    />
                </h2>
                <p className="text-body-sm text-ink-secondary">
                    {t("partnerDashboard.steps.lead")}
                </p>
            </div>
            <ol className="border-t border-line">
                <Step
                    numeral="I"
                    title={t("partnerDashboard.steps.apply.title")}
                    copy={t("partnerDashboard.steps.apply.copy")}
                    status={
                        applicationsReady && hasApplications
                            ? t("partnerDashboard.steps.apply.status")
                            : undefined
                    }
                    action={
                        applicationsReady && !hasApplications ? (
                            <StepAction to="/$lng/partners/applications">
                                {t("partnerApplications.create.open")}
                            </StepAction>
                        ) : undefined
                    }
                />
                <Step
                    numeral="II"
                    title={t("partnerDashboard.steps.access.title")}
                    copy={t("partnerDashboard.steps.access.copy")}
                    status={
                        hasProviders
                            ? t("partnerDashboard.steps.access.status", {
                                  count: data.providerCount,
                                  figure: data.providerFigure,
                              })
                            : undefined
                    }
                />
                <Step
                    numeral="III"
                    title={t("partnerDashboard.steps.token.title")}
                    copy={t("partnerDashboard.steps.token.copy")}
                    status={
                        tokensReady && hasActiveTokens
                            ? t("partnerDashboard.steps.token.status", { count: data.activeCount })
                            : undefined
                    }
                    action={
                        tokensReady && !hasActiveTokens ? (
                            <StepAction to="/$lng/partners/access-tokens">
                                {t("partnerAccessTokens.create.open")}
                            </StepAction>
                        ) : undefined
                    }
                />
                <Step
                    numeral="IV"
                    title={t("partnerDashboard.steps.connect.title")}
                    copy={t("partnerDashboard.steps.connect.copy")}
                >
                    <div className="mt-3 flex flex-wrap gap-2">
                        <ExternalChip href={SHOPIFY_APP_STORE_URL}>
                            {t("partnerProgram.integrations.shopify.title")}
                        </ExternalChip>
                        <ExternalChip href={WORDPRESS_PLUGIN_DIRECTORY_URL}>
                            {t("partnerProgram.integrations.woocommerce.title")}
                        </ExternalChip>
                        <Link
                            to="/$lng/partner-program/custom-integration"
                            params={true}
                            from="/$lng"
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {t("partnerProgram.integrations.customApi.title")}
                            <ArrowRight aria-hidden="true" className="size-3" strokeWidth={1.8} />
                        </Link>
                    </div>
                    <p className="mt-2 text-[11px] leading-normal text-ink-muted">
                        {t("partnerProgram.integrations.trademarks")}
                    </p>
                </Step>
            </ol>
        </section>
    );
}

function RecentApplications({ data }: { readonly data: OverviewData }) {
    const { t } = useTranslation();
    let content: ReactNode = null;
    if (data.applicationsState === "ready") {
        content =
            data.applications.length > 0 ? (
                <ul className="border-t border-line">
                    {data.applications.slice(0, RECENT_COUNT).map((application) => (
                        <li key={application.id}>
                            <PartnerApplicationCompactRow
                                application={application}
                                providerNames={data.providerNames}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="border-t border-line pt-4 text-body-sm text-ink-muted">
                    {t("partnerApplications.empty")}
                </p>
            );
    }
    return (
        <section
            aria-labelledby="partner-recent-applications"
            className="flex min-w-0 flex-col gap-4"
        >
            <RecentHeading
                id="partner-recent-applications"
                title={t("partnerDashboard.nav.applications")}
                to="/$lng/partners/applications"
            />
            {content}
        </section>
    );
}

function RecentTokens({ data }: { readonly data: OverviewData }) {
    const { t } = useTranslation();
    let content: ReactNode = null;
    if (data.tokensState === "ready") {
        content =
            data.tokens.length > 0 ? (
                <ul className="border-t border-line">
                    {data.tokens.slice(0, RECENT_COUNT).map(({ accessToken, expiry }) => (
                        <li
                            key={accessToken.id}
                            className="flex min-h-16 flex-col items-start justify-center gap-1.5 border-b border-line-subtle py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        >
                            <span className="truncate text-[15px] font-medium">
                                {accessToken.name}
                            </span>
                            <AccessTokenExpiry
                                accessToken={accessToken}
                                state={expiry}
                                className="shrink-0 sm:text-right"
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="border-t border-line pt-4 text-body-sm text-ink-muted">
                    {t("partnerAccessTokens.empty")}
                </p>
            );
    }
    return (
        <section aria-labelledby="partner-recent-tokens" className="flex min-w-0 flex-col gap-4">
            <RecentHeading
                id="partner-recent-tokens"
                title={t("partnerDashboard.nav.accessTokens")}
                to="/$lng/partners/access-tokens"
            />
            {content}
        </section>
    );
}

function Step({
    numeral,
    title,
    copy,
    status,
    action,
    children,
}: {
    readonly numeral: string;
    readonly title: string;
    readonly copy: string;
    readonly status?: string;
    readonly action?: ReactNode;
    readonly children?: ReactNode;
}) {
    return (
        <li className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-x-6 gap-y-3 border-b border-line-subtle py-[22px] sm:grid-cols-[48px_minmax(0,1fr)_auto]">
            <span
                aria-hidden="true"
                className="font-serif text-[22px] leading-[1.2] text-brass-ink"
            >
                {numeral}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
                <h3 className="text-base leading-[1.35] font-medium">{title}</h3>
                <p className="text-body-sm text-ink-secondary">{copy}</p>
                {children}
            </div>
            {(status || action) && (
                <div className="col-start-2 flex min-h-8 items-center sm:col-start-3 sm:justify-self-end">
                    {status ? (
                        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
                            <span
                                aria-hidden="true"
                                className="inline-flex size-[18px] items-center justify-center rounded-pill bg-ink text-surface"
                            >
                                <Check className="size-2.5" strokeWidth={3} />
                            </span>
                            {status}
                        </span>
                    ) : (
                        action
                    )}
                </div>
            )}
        </li>
    );
}

function StepAction({
    to,
    children,
}: {
    readonly to: "/$lng/partners/applications" | "/$lng/partners/access-tokens";
    readonly children: ReactNode;
}) {
    return (
        <Link
            to={to}
            params={true}
            from="/$lng"
            search={{ create: true }}
            className={cn(
                "inline-flex h-10 items-center rounded-pill bg-ink px-4 text-meta font-medium text-surface",
                FOCUS_CLASS,
            )}
        >
            {children}
        </Link>
    );
}

function ExternalChip({ href, children }: { readonly href: string; readonly children: ReactNode }) {
    const { t } = useTranslation();
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={SMALL_SECONDARY_PILL_CLASS}
        >
            {children}
            <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={1.8} />
            <span className="sr-only">{t("partnerProgram.integrations.newTab")}</span>
        </a>
    );
}

function RecentHeading({
    id,
    title,
    to,
}: {
    readonly id: string;
    readonly title: string;
    readonly to: "/$lng/partners/applications" | "/$lng/partners/access-tokens";
}) {
    const { t } = useTranslation();
    return (
        <div className="flex items-baseline justify-between gap-3">
            <h2 id={id} className="font-serif text-2xl leading-[1.2] font-normal">
                {title}
            </h2>
            <Link to={to} params={true} from="/$lng" className={cn(TEXT_LINK_CLASS, "text-meta")}>
                {t("partnerDashboard.overview.viewAll")}
                <span className="sr-only">: {title}</span>
            </Link>
        </div>
    );
}
