import { PendingPartnershipApplications } from "@/features/partner/application-management/components/PendingPartnershipApplications.tsx";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import {
    type OwnListingSource,
    type OwnListingSources,
    useOwnListingSources,
} from "@/features/partner/common/api/useOwnListingSources.ts";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";
import { OwnListingSourcesMore } from "@/features/partner/common/components/OwnListingSourcesMore.tsx";
import { cn } from "@/lib/utils.ts";
import { PARTNER_CREATE_EXAMPLE } from "../config/partnerRequestExamples.ts";
import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { type ReactNode, lazy, Suspense, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

type GuideStepKey = "selectSource" | "requestKey" | "preparePayload" | "verifyResults";

const GUIDE_STEPS: readonly { readonly key: GuideStepKey; readonly numeral: string }[] = [
    { key: "selectSource", numeral: "I" },
    { key: "requestKey", numeral: "II" },
    { key: "preparePayload", numeral: "III" },
    { key: "verifyResults", numeral: "IV" },
];

const PRODUCT_LISTINGS_ENDPOINT = "/v1/listing-sources/{listingSourceId}/product-listings";
const API_DOCUMENTATION_URL = "https://docs.api.aura-historia.com";
const LISTING_SOURCE_PLACEHOLDER = "YOUR_LISTING_SOURCE_ID";
const ACCESS_TOKEN_PLACEHOLDER = "YOUR_USER_ACCESS_TOKEN";

const CONTRACT_TOPICS = [
    { key: "batch", tag: null },
    { key: "create", tag: "POST" },
    { key: "patch", tag: "PATCH" },
    { key: "put", tag: "PUT" },
    { key: "auction", tag: "AUCTION" },
    { key: "withdrawal", tag: "DELETE" },
    { key: "woocommerce", tag: "WEBHOOK" },
] as const;

const BATCH_OUTCOMES = [
    { key: "allWritten", code: "200 · []", live: true },
    { key: "partial", code: "200 · ", live: false },
    { key: "allFailed", code: "problem+json", live: false },
] as const;

const FLOW_STEPS = ["send", "completed", "failures"] as const;
const SUMMARY_ITEMS = ["accessToken", "listingSourceId", "listingBatch"] as const;

const MONO_LABEL_CLASS = "font-mono text-label text-ink-muted uppercase";
const INK_BUTTON_CLASS = cn(
    "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-pill bg-ink px-[22px] py-2.5 text-center text-[15px] font-medium text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted disabled:opacity-100",
    NAV_FOCUS_CLASS,
);
const OUTLINE_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
    NAV_FOCUS_CLASS,
);
const FIELD_PANEL_CLASS = "rounded-lg bg-surface-raised p-4 shadow-field sm:p-5";

const LazyPartnerProductsApiReference = lazy(
    () =>
        import(
            "@/features/partner/partner-program/components/api-reference/PartnerProductsApiReference.tsx"
        ),
);

function buildCurlCommand(listingSourceId: string) {
    return [
        "curl --request POST \\",
        `  --url 'https://api.aura-historia.com/v1/listing-sources/${listingSourceId}/product-listings' \\`,
        `  --header 'Authorization: Bearer ${ACCESS_TOKEN_PLACEHOLDER}' \\`,
        "  --header 'Content-Type: application/json' \\",
        `  --data '${JSON.stringify(PARTNER_CREATE_EXAMPLE, null, 2)}'`,
    ].join("\n");
}

export default function PartnerCustomIntegrationPage() {
    const { t } = useTranslation();
    const [selection, setSelection] = useState<ListingSourceSelection>();
    const [createTokenDialogOpen, setCreateTokenDialogOpen] = useState(false);
    const { user, isAuthenticated, isResolved } = useResolvedAuth();
    const listingSourcePages = useOwnListingSources(isAuthenticated);

    const listingSources = isAuthenticated && isResolved ? listingSourcePages.sources : [];
    // A choice applies only to the viewer who made it and only while the source is still granted.
    const selectedListingSourceId =
        selection?.viewerId === user?.userId ? selection?.listingSourceId : undefined;
    const selectedListingSource =
        listingSources.find((source) => source.listingSourceId === selectedListingSourceId) ??
        (listingSources.length === 1 && !listingSourcePages.hasMore
            ? listingSources[0]
            : undefined);

    const stepAside: Record<GuideStepKey, ReactNode> = {
        selectSource: (
            <>
                <ListingSourceRequirement
                    isAuthenticated={isAuthenticated}
                    isResolved={isResolved}
                    listingSourcePages={listingSourcePages}
                    listingSources={listingSources}
                    selectedListingSourceId={selectedListingSource?.listingSourceId}
                    onSelectListingSource={(listingSourceId) =>
                        setSelection({ viewerId: user?.userId, listingSourceId })
                    }
                />
                <PendingPartnershipApplications enabled={isAuthenticated && isResolved} />
            </>
        ),
        requestKey: (
            <div className={cn(FIELD_PANEL_CLASS, "flex flex-col gap-4 bg-surface")}>
                <TokenSummary providerName={selectedListingSource?.name} />
                <RequestAccessTokenAction
                    isAuthenticated={isAuthenticated}
                    isResolved={isResolved}
                    onCreate={() => setCreateTokenDialogOpen(true)}
                />
            </div>
        ),
        preparePayload: (
            <ProductRequestExample listingSourceId={selectedListingSource?.listingSourceId} />
        ),
        verifyResults: <BatchResult />,
    };

    return (
        <div className="bg-surface">
            <section
                aria-labelledby="custom-integration-title"
                data-theme="dark"
                className="bg-surface px-(--page-gutter) pt-12 pb-14 text-ink sm:py-[clamp(56px,7vw,104px)]"
            >
                <div className="mx-auto grid w-full max-w-content items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-[clamp(48px,6vw,96px)]">
                    <div className="flex flex-col gap-5 sm:gap-7">
                        <nav aria-label={t("partnerProgram.customIntegrationPage.hero.breadcrumb")}>
                            <ol className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase sm:text-eyebrow sm:tracking-[0.2em]">
                                <li>
                                    <Link
                                        to="/$lng/partner-program"
                                        params={true}
                                        from="/$lng"
                                        className={cn(
                                            "text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink",
                                            NAV_FOCUS_CLASS,
                                        )}
                                    >
                                        {t("partnerProgram.customIntegrationPage.hero.breadcrumb")}
                                    </Link>
                                </li>
                                <li aria-hidden="true" className="text-ink-muted">
                                    /
                                </li>
                                <li aria-current="page" className="text-brass-light">
                                    {t("partnerProgram.customIntegrationPage.hero.current")}
                                </li>
                            </ol>
                        </nav>
                        <h1
                            id="custom-integration-title"
                            className="font-serif text-[44px] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[clamp(46px,5.6vw,84px)] sm:leading-none [&_em]:text-brass-light [&_em]:italic"
                        >
                            <Trans
                                i18nKey="partnerProgram.customIntegrationPage.hero.title"
                                components={HEADLINE_COMPONENTS}
                            />
                        </h1>
                        <p className="max-w-[580px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                            {t("partnerProgram.customIntegrationPage.hero.subtitle")}
                        </p>
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                            <Link
                                to="/$lng/partners/access-tokens"
                                params={true}
                                from="/$lng"
                                data-theme="light"
                                className={cn(
                                    "inline-flex h-[50px] items-center justify-center gap-2.5 rounded-pill bg-surface px-6 text-[15px] font-medium text-ink transition-opacity hover:opacity-90",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("partnerProgram.customIntegrationPage.hero.primaryCta")}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                    strokeWidth={1.8}
                                />
                            </Link>
                            <a
                                href={API_DOCUMENTATION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "inline-flex h-[50px] items-center justify-center gap-2.5 rounded-pill px-6 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("partnerProgram.customIntegrationPage.hero.secondaryCta")}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-[15px]"
                                    strokeWidth={1.8}
                                />
                                <span className="sr-only">
                                    {t("partnerProgram.customIntegrationPage.hero.newTab")}
                                </span>
                            </a>
                        </div>
                    </div>
                    <FlowPanel />
                </div>
            </section>

            <LandingSection
                ground="surface"
                labelledBy="custom-integration-concept-heading"
                className="border-b border-line-subtle"
                containerClassName="grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-[clamp(40px,5vw,80px)]"
            >
                <div className="flex flex-col gap-7 sm:gap-9">
                    <SectionHeading
                        id="custom-integration-concept-heading"
                        eyebrow={`I — ${t("partnerProgram.customIntegrationPage.concept.eyebrow")}`}
                        title={
                            <Trans
                                i18nKey="partnerProgram.customIntegrationPage.concept.title"
                                components={HEADLINE_COMPONENTS}
                            />
                        }
                        intro={t("partnerProgram.customIntegrationPage.concept.description")}
                        className="[&>p:last-child]:max-w-[560px]"
                    />
                    <dl className="grid gap-0 sm:grid-cols-2 sm:gap-7">
                        {(["synchronous", "retry"] as const).map((benefit) => (
                            <div
                                key={benefit}
                                className="flex flex-col gap-2 border-t border-ink pt-[18px] pb-[22px] sm:gap-2.5 sm:pt-5 sm:pb-0"
                            >
                                <dt className="font-serif text-[21px] leading-[1.2] font-medium sm:text-[22px]">
                                    {t(
                                        `partnerProgram.customIntegrationPage.concept.benefits.${benefit}.title`,
                                    )}
                                </dt>
                                <dd className="text-body text-ink-secondary">
                                    {t(
                                        `partnerProgram.customIntegrationPage.concept.benefits.${benefit}.description`,
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <aside
                    aria-labelledby="custom-integration-summary-heading"
                    className="flex flex-col gap-3.5 rounded-card bg-surface-raised p-[22px] shadow-ring sm:gap-5 sm:p-[clamp(24px,3vw,36px)]"
                >
                    <p className="font-mono text-kicker text-ink-muted uppercase">
                        {t("partnerProgram.customIntegrationPage.summary.kicker")}
                    </p>
                    <h3
                        id="custom-integration-summary-heading"
                        className="font-serif text-[26px] leading-[1.15] font-normal sm:text-[30px] sm:leading-[1.1]"
                    >
                        {t("partnerProgram.customIntegrationPage.summary.title")}
                    </h3>
                    <p className="text-body text-ink-secondary">
                        {t("partnerProgram.customIntegrationPage.summary.subtitle")}
                    </p>
                    <ul className="border-t border-line">
                        {SUMMARY_ITEMS.map((item) => (
                            <li
                                key={item}
                                className="grid grid-cols-[22px_minmax(0,1fr)] gap-3 border-b border-line py-4 last:border-b-0 sm:grid-cols-[24px_minmax(0,1fr)] sm:gap-3.5 sm:py-[18px] sm:last:border-b"
                            >
                                <Check
                                    aria-hidden="true"
                                    className="mt-0.5 size-[18px] text-oxblood sm:size-5"
                                    strokeWidth={2}
                                />
                                <div className="flex flex-col gap-1 sm:gap-1.5">
                                    <span className="text-[15px] font-medium">
                                        {t(
                                            `partnerProgram.customIntegrationPage.summary.items.${item}.title`,
                                        )}
                                    </span>
                                    <span className="text-body-sm text-ink-secondary">
                                        {t(
                                            `partnerProgram.customIntegrationPage.summary.items.${item}.description`,
                                        )}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>
            </LandingSection>

            <LandingSection
                ground="raised"
                labelledBy="custom-integration-guide-heading"
                containerClassName="flex flex-col gap-9 sm:gap-16"
            >
                <SectionHeading
                    id="custom-integration-guide-heading"
                    className="max-w-[820px]"
                    eyebrow={`II — ${t("partnerProgram.customIntegrationPage.guide.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="partnerProgram.customIntegrationPage.guide.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    intro={t("partnerProgram.customIntegrationPage.guide.subtitle")}
                />
                <ol>
                    {GUIDE_STEPS.map((step, index) => {
                        const translationBase = `partnerProgram.customIntegrationPage.guide.steps.${step.key}`;
                        const isLast = index === GUIDE_STEPS.length - 1;

                        return (
                            <li
                                key={step.key}
                                className={cn(
                                    "grid gap-3.5 border-t border-ink pt-6 md:grid-cols-[80px_minmax(0,1fr)] md:gap-x-12 md:gap-y-5 md:pt-9 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]",
                                    isLast ? "pb-0" : "pb-9 md:pb-12",
                                )}
                            >
                                <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
                                    <span
                                        aria-hidden="true"
                                        className="font-serif text-[36px] leading-none text-oxblood md:order-2 md:text-display-rail md:leading-none"
                                    >
                                        {step.numeral}
                                    </span>
                                    <span className={cn(MONO_LABEL_CLASS, "md:order-1")}>
                                        {t("partnerProgram.customIntegrationPage.guide.stepLabel", {
                                            number: index + 1,
                                        })}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3.5 md:gap-4">
                                    <h3 className="font-serif text-[26px] leading-[1.15] font-normal sm:text-title-lg">
                                        {t(`${translationBase}.title`)}
                                    </h3>
                                    <p className="text-body text-ink-secondary sm:text-base">
                                        {t(`${translationBase}.description`)}
                                    </p>
                                    <p className="flex flex-col gap-1 border-t border-line pt-3 text-body-sm text-ink-secondary sm:gap-1.5 sm:pt-3.5">
                                        <span className="font-mono text-label text-brass-ink uppercase">
                                            {t(
                                                "partnerProgram.customIntegrationPage.guide.focusLabel",
                                            )}
                                        </span>
                                        {t(`${translationBase}.focus`)}
                                    </p>
                                </div>
                                <div className="flex min-w-0 flex-col gap-3 md:col-start-2 lg:col-start-3">
                                    {stepAside[step.key]}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </LandingSection>

            <LandingSection
                ground="surface"
                labelledBy="custom-integration-reference-heading"
                containerClassName="flex flex-col gap-9 sm:gap-14"
            >
                <SectionHeading
                    id="custom-integration-reference-heading"
                    className="max-w-[820px]"
                    eyebrow={`III — ${t("partnerProgram.customIntegrationPage.endpoints.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="partnerProgram.customIntegrationPage.endpoints.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    intro={t("partnerProgram.customIntegrationPage.endpoints.subtitle")}
                />

                <ul className="grid border-t border-ink md:grid-cols-2 md:gap-x-12">
                    {CONTRACT_TOPICS.map((topic) => (
                        <li
                            key={topic.key}
                            className="flex min-w-0 flex-col gap-2.5 border-b border-line pt-5 pb-6 sm:gap-3 sm:pt-6 sm:pb-7"
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <code className="rounded-sm bg-surface-sunken px-[7px] py-[3px] font-mono text-tag text-ink uppercase">
                                    {topic.tag ??
                                        t(
                                            "partnerProgram.customIntegrationPage.endpoints.allMethods",
                                        )}
                                </code>
                                <h3 className="font-serif text-[21px] leading-[1.2] font-normal sm:text-title-sm sm:font-normal">
                                    {t(
                                        `partnerProgram.customIntegrationPage.contract.${topic.key}.title`,
                                    )}
                                </h3>
                            </div>
                            <p className="text-body-sm leading-[1.65] wrap-anywhere text-ink-secondary">
                                {t(
                                    `partnerProgram.customIntegrationPage.contract.${topic.key}.description`,
                                )}
                            </p>
                        </li>
                    ))}
                </ul>

                <figure className="overflow-hidden rounded-panel bg-surface-raised shadow-ring">
                    <figcaption className="flex justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-3.5">
                        <span className={MONO_LABEL_CLASS}>
                            {t("partnerProgram.customIntegrationPage.endpoints.frameLabel")}
                        </span>
                        <a
                            href={API_DOCUMENTATION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center gap-1 font-mono text-label text-ink uppercase underline underline-offset-3",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {t("partnerProgram.customIntegrationPage.endpoints.fullDocs")}
                            <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={1.8} />
                            <span className="sr-only">
                                {t("partnerProgram.customIntegrationPage.hero.newTab")}
                            </span>
                        </a>
                    </figcaption>
                    <p className="sr-only">
                        {t("partnerProgram.customIntegrationPage.endpoints.embedTitle")}
                    </p>
                    <ClientOnly fallback={<ApiReferenceSkeleton />}>
                        <Suspense fallback={<ApiReferenceSkeleton />}>
                            <LazyPartnerProductsApiReference />
                        </Suspense>
                    </ClientOnly>
                </figure>
            </LandingSection>

            {createTokenDialogOpen && (
                <AccessTokenCreateDialog
                    open={createTokenDialogOpen}
                    onOpenChange={setCreateTokenDialogOpen}
                    defaultValues={{
                        name: t(
                            "partnerProgram.customIntegrationPage.guide.steps.requestKey.defaultTokenName",
                        ),
                        scopes: ["product-listings:write"],
                        expiresAt: "",
                    }}
                />
            )}
        </div>
    );
}

/** The typical batch flow as a terminal panel beside the hero copy. */
function FlowPanel() {
    const { t } = useTranslation();
    const chips: Record<(typeof FLOW_STEPS)[number], ReactNode> = {
        send: (
            <code className="rounded-sm px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-ink-secondary shadow-[inset_0_0_0_1px_var(--line-strong)]">
                POST · PATCH · PUT · DELETE
            </code>
        ),
        completed: (
            <code className="inline-flex items-center gap-2 font-mono text-xs text-ink">
                <span aria-hidden="true" className="size-2 rounded-full bg-signal-live" />
                HTTP 200
            </code>
        ),
        failures: (
            <code className="font-mono text-xs text-ink-secondary">
                {t("partnerProgram.customIntegrationPage.concept.flow.allWritten")}
            </code>
        ),
    };

    return (
        <figure className="overflow-hidden rounded-panel bg-surface-raised shadow-ring">
            <figcaption className="flex justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-3.5">
                <span className={MONO_LABEL_CLASS}>
                    {t("partnerProgram.customIntegrationPage.concept.flowLabel")}
                </span>
                <span className={cn(MONO_LABEL_CLASS, "hidden sm:inline")}>
                    {t("partnerProgram.customIntegrationPage.concept.flowCaption")}
                </span>
            </figcaption>
            <ol>
                {FLOW_STEPS.map((flowStep, index) => (
                    <li
                        key={flowStep}
                        className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1 border-b border-line-subtle px-4 py-3.5 last:border-b-0 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-4 sm:p-5"
                    >
                        <span className="font-mono text-xs text-brass-ink">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-serif text-lg leading-[1.3] sm:text-[21px] sm:leading-[1.25]">
                            {t(`partnerProgram.customIntegrationPage.concept.flow.${flowStep}`)}
                        </span>
                        <span className="col-start-2 justify-self-start sm:col-start-auto sm:justify-self-end">
                            {chips[flowStep]}
                        </span>
                    </li>
                ))}
            </ol>
        </figure>
    );
}

function TokenSummary({ providerName }: { readonly providerName: string | undefined }) {
    const { t } = useTranslation();
    const rows = [
        {
            key: "name",
            value: (
                <span className="text-sm">
                    {t(
                        "partnerProgram.customIntegrationPage.guide.steps.requestKey.defaultTokenName",
                    )}
                </span>
            ),
        },
        {
            key: "scope",
            value: <code className="font-mono text-[13px]">product-listings:write</code>,
        },
        {
            key: "provider",
            value: (
                <span className={cn("text-sm", !providerName && "text-ink-muted")}>
                    {providerName ??
                        t(
                            "partnerProgram.customIntegrationPage.guide.steps.requestKey.summary.none",
                        )}
                </span>
            ),
        },
    ];

    return (
        <dl className="flex flex-col">
            {rows.map((row) => (
                <div
                    key={row.key}
                    className="flex items-baseline justify-between gap-3 border-b border-line-subtle py-2.5 last:border-b-0"
                >
                    <dt className={MONO_LABEL_CLASS}>
                        {t(
                            `partnerProgram.customIntegrationPage.guide.steps.requestKey.summary.${row.key}`,
                        )}
                    </dt>
                    <dd className="min-w-0 text-right wrap-anywhere">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}

interface RequestAccessTokenActionProps {
    readonly isAuthenticated: boolean;
    readonly isResolved: boolean;
    readonly onCreate: () => void;
}

function RequestAccessTokenAction({
    isAuthenticated,
    isResolved,
    onCreate,
}: RequestAccessTokenActionProps) {
    const { t } = useTranslation();
    const buttonContent = (
        <>
            <KeyRound aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t("partnerProgram.customIntegrationPage.guide.steps.requestKey.cta")}
        </>
    );
    const className = cn(INK_BUTTON_CLASS, "w-full sm:w-auto sm:self-start");

    if (isAuthenticated) {
        return (
            <button type="button" className={cn(className, "cursor-pointer")} onClick={onCreate}>
                {buttonContent}
            </button>
        );
    }

    if (!isResolved) {
        return (
            <button type="button" className={className} disabled>
                {buttonContent}
            </button>
        );
    }

    return (
        <Link to="/$lng/partners/access-tokens" params={true} from="/$lng" className={className}>
            {buttonContent}
        </Link>
    );
}

interface ListingSourceSelection {
    readonly viewerId: string | undefined;
    readonly listingSourceId: string;
}

interface ListingSourceRequirementProps {
    readonly isAuthenticated: boolean;
    readonly isResolved: boolean;
    readonly listingSourcePages: OwnListingSources;
    readonly listingSources: readonly OwnListingSource[];
    readonly selectedListingSourceId: string | undefined;
    readonly onSelectListingSource: (listingSourceId: string) => void;
}

function ListingSourceRequirement({
    isAuthenticated,
    isResolved,
    listingSourcePages,
    listingSources,
    selectedListingSourceId,
    onSelectListingSource,
}: ListingSourceRequirementProps) {
    const { t } = useTranslation();
    const translationBase = "partnerProgram.customIntegrationPage.guide.steps.selectSource";
    const { isPending, isError, hasMore, retry } = listingSourcePages;

    if (!isResolved || (isAuthenticated && isPending)) {
        return (
            <div aria-busy="true" className={cn(FIELD_PANEL_CLASS, "flex flex-col gap-2.5")}>
                <div className="h-3 w-48 animate-pulse rounded-xs bg-surface-sunken" />
                <div className="h-14 animate-pulse rounded-md bg-surface-sunken" />
                <div className="h-14 animate-pulse rounded-md bg-surface-sunken opacity-60" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={cn(FIELD_PANEL_CLASS, "flex flex-col gap-3.5")}>
                <p className="text-body-sm text-ink-secondary">
                    {t("partnerProgram.customIntegrationPage.guide.steps.selectSource.signInHint")}
                </p>
                <Link
                    to="/$lng/partners/applications"
                    params={true}
                    from="/$lng"
                    className={cn(INK_BUTTON_CLASS, "self-start")}
                >
                    {t(`${translationBase}.signInCta`)}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </Link>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                role="alert"
                className="flex flex-col gap-3.5 rounded-lg bg-surface-raised p-5 shadow-[inset_0_0_0_1px_var(--oxblood)]"
            >
                <p className="text-body-sm text-ink">{t(`${translationBase}.loadError`)}</p>
                <button
                    type="button"
                    onClick={retry}
                    className={cn(OUTLINE_BUTTON_CLASS, "self-start")}
                >
                    <RefreshCw aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    {t(`${translationBase}.retryCta`)}
                </button>
            </div>
        );
    }

    if (listingSources.length === 0 && !hasMore) {
        return (
            <div className={cn(FIELD_PANEL_CLASS, "flex flex-col gap-3.5")}>
                <p className="text-body-sm text-ink-secondary">{t(`${translationBase}.empty`)}</p>
                <Link
                    to="/$lng/partners/applications"
                    params={true}
                    from="/$lng"
                    className={cn(INK_BUTTON_CLASS, "self-start")}
                >
                    {t(`${translationBase}.applyCta`)}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </Link>
            </div>
        );
    }

    return (
        <fieldset className="flex min-w-0 flex-col gap-2 rounded-lg bg-surface p-3.5 shadow-field sm:p-4">
            <legend className="float-left mb-1.5 w-full font-mono text-label text-ink-muted uppercase">
                {t(`${translationBase}.selectionLabel`)}
            </legend>
            {listingSources.map((source) => {
                const labelId = `custom-integration-listing-source-${source.listingSourceId}`;
                const isSelected = selectedListingSourceId === source.listingSourceId;

                return (
                    <label
                        key={source.listingSourceId}
                        className={cn(
                            "grid min-h-14 cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-3 transition-shadow sm:px-3.5",
                            isSelected
                                ? "bg-surface-raised shadow-selected"
                                : "shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--line-strong)]",
                        )}
                    >
                        <input
                            type="radio"
                            name="custom_integration_listing_source"
                            value={source.listingSourceId}
                            checked={isSelected}
                            onChange={() => onSelectListingSource(source.listingSourceId)}
                            aria-labelledby={labelId}
                            className="size-[18px] accent-oxblood"
                        />
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span id={labelId} className="text-[15px] font-medium">
                                {source.name}
                            </span>
                            <code className="font-mono text-xs wrap-anywhere text-ink-muted">
                                {source.listingSourceId}
                            </code>
                        </span>
                    </label>
                );
            })}
            <OwnListingSourcesMore
                listingSources={listingSourcePages}
                className="mt-1.5 gap-2.5 px-0.5"
                textClassName="text-body-sm text-ink-secondary"
                buttonClassName={cn(
                    OUTLINE_BUTTON_CLASS,
                    "disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:shadow-[inset_0_0_0_1px_var(--line-strong)]",
                )}
            />
        </fieldset>
    );
}

function ProductRequestExample({
    listingSourceId,
}: {
    readonly listingSourceId: string | undefined;
}) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const markClass = "rounded-sm bg-oxblood px-1 py-px text-on-oxblood";

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timeout);
    }, [copied]);

    const copyCommand = async () => {
        try {
            await navigator.clipboard.writeText(
                buildCurlCommand(listingSourceId ?? LISTING_SOURCE_PLACEHOLDER),
            );
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <figure
            data-theme="dark"
            className="min-w-0 overflow-hidden rounded-lg bg-surface text-ink"
        >
            <figcaption className="flex items-center justify-between gap-3 border-b border-line py-1.5 pr-1.5 pl-3.5 sm:py-2 sm:pr-2 sm:pl-4">
                <span className={MONO_LABEL_CLASS}>cURL · POST</span>
                <button
                    type="button"
                    onClick={copyCommand}
                    className={cn(OUTLINE_BUTTON_CLASS, "h-9 px-3 text-meta sm:h-8")}
                >
                    {copied ? (
                        <Check aria-hidden="true" className="size-[13px]" strokeWidth={1.8} />
                    ) : (
                        <Copy aria-hidden="true" className="size-[13px]" strokeWidth={1.8} />
                    )}
                    <span aria-live="polite">
                        {t(
                            copied
                                ? "partnerProgram.customIntegrationPage.guide.steps.preparePayload.copied"
                                : "partnerProgram.customIntegrationPage.guide.steps.preparePayload.copy",
                        )}
                    </span>
                </button>
            </figcaption>
            <pre
                data-testid="partner-product-code-example"
                className="max-w-full overflow-x-auto p-3.5 font-mono text-[11px] leading-[1.7] text-ink-secondary sm:px-4 sm:py-[18px] sm:text-xs"
            >
                <code>
                    {
                        "curl --request POST \\\n  --url 'https://api.aura-historia.com/v1/listing-sources/"
                    }
                    <mark className={markClass}>
                        {listingSourceId ?? LISTING_SOURCE_PLACEHOLDER}
                    </mark>
                    {"/product-listings' \\\n  --header 'Authorization: Bearer "}
                    <mark className={markClass}>{ACCESS_TOKEN_PLACEHOLDER}</mark>
                    {"' \\\n  --header 'Content-Type: application/json' \\\n  --data '"}
                    {JSON.stringify(PARTNER_CREATE_EXAMPLE, null, 2)}
                    {"'"}
                </code>
            </pre>
        </figure>
    );
}

/** Step IV: the endpoint and the three ways a batch can come back. */
function BatchResult() {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex flex-col gap-1 rounded-lg px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)] sm:gap-1.5 sm:px-4 sm:py-3.5">
                <span className={MONO_LABEL_CLASS}>
                    {t("partnerProgram.customIntegrationPage.guide.endpointLabel")}
                </span>
                <code className="font-mono text-xs wrap-anywhere sm:text-[13px]">
                    {PRODUCT_LISTINGS_ENDPOINT}
                </code>
            </div>
            <dl
                data-theme="dark"
                className="grid overflow-hidden rounded-lg bg-surface text-ink sm:grid-cols-3"
            >
                {BATCH_OUTCOMES.map((outcome) => (
                    <div
                        key={outcome.key}
                        className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3 last:border-b-0 sm:flex-col sm:items-start sm:gap-1.5 sm:border-r sm:border-b-0 sm:px-4 sm:py-3.5 sm:last:border-r-0"
                    >
                        <dt className="font-mono text-tag text-ink-muted uppercase">
                            {t(
                                `partnerProgram.customIntegrationPage.guide.steps.verifyResults.outcomes.${outcome.key}`,
                            )}
                        </dt>
                        <dd className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-[13px]">
                            {outcome.live && (
                                <span
                                    aria-hidden="true"
                                    className="size-[7px] rounded-full bg-signal-live"
                                />
                            )}
                            {outcome.code}
                            {outcome.key === "partial" &&
                                t(
                                    "partnerProgram.customIntegrationPage.guide.steps.verifyResults.outcomes.failures",
                                )}
                        </dd>
                    </div>
                ))}
            </dl>
        </>
    );
}

/** Holds the embedded reference's place, in its frame, until the client-only bundle arrives. */
function ApiReferenceSkeleton() {
    return (
        <div aria-hidden="true" className="grid min-h-[560px] md:grid-cols-[240px_minmax(0,1fr)]">
            <div className="hidden flex-col gap-2.5 border-r border-line px-3 py-4 md:flex">
                <div className="h-8 animate-pulse rounded-md bg-surface-sunken" />
                <div className="h-8 animate-pulse rounded-md bg-surface-sunken opacity-60" />
                <div className="h-8 animate-pulse rounded-md bg-surface-sunken opacity-60" />
            </div>
            <div className="flex flex-col gap-3 p-5 sm:p-8">
                <div className="h-3.5 w-[70%] animate-pulse rounded-xs bg-surface-sunken" />
                <div className="h-6 w-[40%] animate-pulse rounded-xs bg-surface-sunken" />
                <div className="h-[72px] animate-pulse rounded-lg bg-surface-sunken" />
            </div>
        </div>
    );
}
