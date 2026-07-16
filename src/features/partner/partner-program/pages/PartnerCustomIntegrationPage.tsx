import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { usePartnerApplications } from "@/features/partner/application-management/api/usePartnerApplications.ts";
import { PartnerApplicationCreateDialog } from "@/features/partner/application-management/components/PartnerApplicationCreateDialog.tsx";
import { BUSINESS_STATE_TRANSLATION_KEY } from "@/features/partner/application-management/lib/partnerApplicationHelpers.ts";
import {
    type PartnerShop,
    usePartnerShops,
} from "@/features/partner/common/api/usePartnerShops.ts";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";
import { useResolvedAuth } from "@/hooks/auth/useResolvedAuth.ts";
import { cn } from "@/lib/utils.ts";
import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Code2, ExternalLink, KeyRound, RefreshCw, Store } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";

type GuideStepKey = "selectShop" | "requestKey" | "preparePayload" | "verifyShop";

type GuideStep = {
    readonly key: GuideStepKey;
    readonly icon: typeof KeyRound;
    readonly endpoint?: string;
};

const GUIDE_STEPS: readonly GuideStep[] = [
    {
        key: "selectShop",
        icon: Store,
    },
    {
        key: "requestKey",
        icon: KeyRound,
    },
    {
        key: "preparePayload",
        icon: Code2,
    },
    {
        key: "verifyShop",
        icon: Store,
        endpoint: "/shops/{shopSlugId}",
    },
];

const LazyPartnerProductsApiReference = lazy(
    () =>
        import(
            "@/features/partner/partner-program/components/api-reference/PartnerProductsApiReference.tsx"
        ),
);

export default function PartnerCustomIntegrationPage() {
    const { t } = useTranslation();
    const [selectedPartnerShopId, setSelectedPartnerShopId] = useState<string>();
    const [partnerApplicationDialogOpen, setPartnerApplicationDialogOpen] = useState(false);
    const [createTokenDialogOpen, setCreateTokenDialogOpen] = useState(false);
    const { isAuthenticated, isResolved } = useResolvedAuth();
    const {
        data: partnerShops = [],
        isPending: arePartnerShopsPending,
        isError: arePartnerShopsError,
        refetch: refetchPartnerShops,
    } = usePartnerShops(isAuthenticated);
    const {
        data: partnerApplications = [],
        isPending: arePartnerApplicationsPending,
        isError: arePartnerApplicationsError,
        refetch: refetchPartnerApplications,
    } = usePartnerApplications(isAuthenticated);
    const pendingPartnerApplications = partnerApplications.filter(
        (application) =>
            application.businessState === "SUBMITTED" || application.businessState === "IN_REVIEW",
    );

    const effectiveSelectedPartnerShopId =
        selectedPartnerShopId ?? (partnerShops.length === 1 ? partnerShops[0]?.shopId : undefined);
    const selectedPartnerShop = effectiveSelectedPartnerShopId
        ? partnerShops.find((shop) => shop.shopId === effectiveSelectedPartnerShopId)
        : undefined;

    return (
        <div className="bg-background">
            <section className="border-b border-border/40 bg-linear-to-br from-primary/6 via-background to-tertiary/10 px-4 py-20 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-6">
                        <span className="inline-flex w-fit rounded-full border border-primary/15 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                            {t("partnerProgram.customIntegrationPage.hero.eyebrow")}
                        </span>
                        <div className="space-y-4">
                            <h1 className="font-display text-4xl text-primary sm:text-5xl">
                                {t("partnerProgram.customIntegrationPage.hero.title")}
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                {t("partnerProgram.customIntegrationPage.hero.subtitle")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Button asChild size="lg" className="min-w-56">
                            <Link to="/partners/access-tokens">
                                {t("partnerProgram.customIntegrationPage.hero.primaryCta")}
                                <ArrowRight aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="min-w-56">
                            <a
                                href="https://docs.api.aura-historia.com"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {t("partnerProgram.customIntegrationPage.hero.secondaryCta")}
                                <ExternalLink aria-hidden="true" />
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 sm:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                    <Card className="border-border/60">
                        <CardHeader className="space-y-3">
                            <CardTitle className="font-display text-3xl font-normal text-primary">
                                {t("partnerProgram.customIntegrationPage.concept.title")}
                            </CardTitle>
                            <p className="max-w-3xl text-muted-foreground">
                                {t("partnerProgram.customIntegrationPage.concept.description")}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="border border-primary/10 bg-primary/5 p-5">
                                <p className="text-sm font-medium uppercase tracking-widest text-primary">
                                    {t("partnerProgram.customIntegrationPage.concept.flowLabel")}
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    {(["accepted", "processing", "visible"] as const).map(
                                        (flowStep, index) => (
                                            <div
                                                key={flowStep}
                                                className="flex h-full items-center gap-3 border border-border/70 bg-background px-4 py-3"
                                            >
                                                <span className="flex size-8 shrink-0 aspect-square items-center justify-center rounded-full bg-tertiary/20 text-sm font-medium text-primary">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm text-foreground hyphens-auto">
                                                    {t(
                                                        `partnerProgram.customIntegrationPage.concept.flow.${flowStep}`,
                                                    )}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {(["async", "polling"] as const).map((benefit) => (
                                    <div
                                        key={benefit}
                                        className="border border-border/70 bg-card px-5 py-4"
                                    >
                                        <p className="font-medium text-primary">
                                            {t(
                                                `partnerProgram.customIntegrationPage.concept.benefits.${benefit}.title`,
                                            )}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {t(
                                                `partnerProgram.customIntegrationPage.concept.benefits.${benefit}.description`,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/60">
                        <CardHeader className="space-y-3">
                            <CardTitle className="font-display text-3xl font-normal text-primary">
                                {t("partnerProgram.customIntegrationPage.summary.title")}
                            </CardTitle>
                            <p className="text-muted-foreground">
                                {t("partnerProgram.customIntegrationPage.summary.subtitle")}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(["apiKey", "shopId", "productBatch"] as const).map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-3  border border-border/70 px-4 py-4"
                                >
                                    <span className="mt-0.5 flex size-7 shrink-0 aspect-square items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                        ✓
                                    </span>
                                    <div>
                                        <p className="font-medium text-primary">
                                            {t(
                                                `partnerProgram.customIntegrationPage.summary.items.${item}.title`,
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            {t(
                                                `partnerProgram.customIntegrationPage.summary.items.${item}.description`,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="bg-muted/25 px-4 py-24 sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeading
                        headline={t("partnerProgram.customIntegrationPage.guide.title")}
                        description={t("partnerProgram.customIntegrationPage.guide.subtitle")}
                        showDivider={false}
                    />

                    <div className="mt-16 space-y-8">
                        {GUIDE_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isReverse = index % 2 === 1;
                            const translationBase = `partnerProgram.customIntegrationPage.guide.steps.${step.key}`;

                            return (
                                <Card key={step.key} className="overflow-hidden border-border/60">
                                    <div
                                        className={cn(
                                            "flex flex-col gap-8 p-6 lg:items-center lg:p-8",
                                            isReverse ? "lg:flex-row-reverse" : "lg:flex-row",
                                        )}
                                    >
                                        <div className="flex-1 space-y-5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-11 shrink-0 aspect-square items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Icon className="size-5" aria-hidden="true" />
                                                </span>
                                                <div>
                                                    <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
                                                        {t(
                                                            "partnerProgram.customIntegrationPage.guide.stepLabel",
                                                            {
                                                                number: index + 1,
                                                            },
                                                        )}
                                                    </p>
                                                    <H2 className="mt-1 text-3xl sm:text-4xl">
                                                        {t(`${translationBase}.title`)}
                                                    </H2>
                                                </div>
                                            </div>

                                            <p className="text-base leading-7 text-muted-foreground">
                                                {t(`${translationBase}.description`)}
                                            </p>

                                            {step.endpoint && (
                                                <div className=" border border-dashed border-primary/25 bg-primary/5 px-4 py-3">
                                                    <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
                                                        {t(
                                                            "partnerProgram.customIntegrationPage.guide.endpointLabel",
                                                        )}
                                                    </p>
                                                    <code className="mt-2 block text-sm text-primary">
                                                        {step.endpoint}
                                                    </code>
                                                </div>
                                            )}

                                            <div className=" border border-border/70 bg-background px-4 py-4">
                                                <p className="text-sm font-medium text-primary">
                                                    {t(
                                                        "partnerProgram.customIntegrationPage.guide.focusLabel",
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {t(`${translationBase}.focus`)}
                                                </p>
                                            </div>

                                            {step.key === "selectShop" && (
                                                <PartnerShopRequirement
                                                    isAuthenticated={isAuthenticated}
                                                    isResolved={isResolved}
                                                    isPending={arePartnerShopsPending}
                                                    areApplicationsPending={
                                                        arePartnerApplicationsPending
                                                    }
                                                    isError={
                                                        arePartnerShopsError ||
                                                        arePartnerApplicationsError
                                                    }
                                                    partnerShops={partnerShops}
                                                    pendingApplications={pendingPartnerApplications}
                                                    selectedPartnerShopId={
                                                        effectiveSelectedPartnerShopId
                                                    }
                                                    onSelectPartnerShop={setSelectedPartnerShopId}
                                                    onApply={() =>
                                                        setPartnerApplicationDialogOpen(true)
                                                    }
                                                    onRetry={() => {
                                                        void refetchPartnerShops();
                                                        void refetchPartnerApplications();
                                                    }}
                                                />
                                            )}

                                            {step.key === "requestKey" &&
                                                (isAuthenticated ? (
                                                    <Button
                                                        type="button"
                                                        size="lg"
                                                        className="w-full sm:w-auto"
                                                        onClick={() =>
                                                            setCreateTokenDialogOpen(true)
                                                        }
                                                    >
                                                        <KeyRound aria-hidden="true" />
                                                        {t(`${translationBase}.cta`)}
                                                    </Button>
                                                ) : isResolved ? (
                                                    <Button
                                                        asChild
                                                        size="lg"
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <Link to="/partners/access-tokens">
                                                            <KeyRound aria-hidden="true" />
                                                            {t(`${translationBase}.cta`)}
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="lg"
                                                        className="w-full sm:w-auto"
                                                        disabled
                                                    >
                                                        <KeyRound aria-hidden="true" />
                                                        {t(`${translationBase}.cta`)}
                                                    </Button>
                                                ))}

                                            {step.key === "verifyShop" && (
                                                <div className="space-y-3  border border-border/70 bg-background px-4 py-4">
                                                    {selectedPartnerShop ? (
                                                        <Button
                                                            asChild
                                                            size="lg"
                                                            className="w-full sm:w-auto"
                                                        >
                                                            <Link
                                                                to="/shops/$shopSlugId"
                                                                params={{
                                                                    shopSlugId:
                                                                        selectedPartnerShop.shopSlugId,
                                                                }}
                                                            >
                                                                {t(`${translationBase}.cta`)}
                                                                <ArrowRight aria-hidden="true" />
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            size="lg"
                                                            className="w-full sm:w-auto"
                                                            disabled
                                                        >
                                                            {t(
                                                                `${translationBase}.selectionRequired`,
                                                            )}
                                                            <ArrowRight aria-hidden="true" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {step.key === "preparePayload" && (
                                            <div className="flex-1">
                                                <ProductRequestExample
                                                    shopId={selectedPartnerShop?.shopId}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="px-4 py-24 sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <SectionHeading
                        headline={t("partnerProgram.customIntegrationPage.endpoints.title")}
                        description={t("partnerProgram.customIntegrationPage.endpoints.subtitle")}
                        showDivider={false}
                    />

                    <Card className="mt-16 py-0 overflow-hidden border border-border/60 bg-linear-to-b from-card via-background to-card/70 shadow-xs">
                        <div className="p-0">
                            <div>
                                <p className="sr-only">
                                    {t("partnerProgram.customIntegrationPage.endpoints.embedTitle")}
                                </p>
                                <ClientOnly
                                    fallback={
                                        <div className="h-240 w-full animate-pulse bg-white" />
                                    }
                                >
                                    <Suspense
                                        fallback={
                                            <div className="h-240 w-full animate-pulse bg-white" />
                                        }
                                    >
                                        <LazyPartnerProductsApiReference />
                                    </Suspense>
                                </ClientOnly>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {createTokenDialogOpen && (
                <AccessTokenCreateDialog
                    open={createTokenDialogOpen}
                    onOpenChange={setCreateTokenDialogOpen}
                    defaultValues={{
                        name: t(
                            "partnerProgram.customIntegrationPage.guide.steps.requestKey.defaultTokenName",
                        ),
                        scopes: ["products:write"],
                        expiresAt: "",
                    }}
                />
            )}
            <PartnerApplicationCreateDialog
                open={partnerApplicationDialogOpen}
                onOpenChange={setPartnerApplicationDialogOpen}
            />
        </div>
    );
}

interface PartnerShopRequirementProps {
    readonly isAuthenticated: boolean;
    readonly isResolved: boolean;
    readonly isPending: boolean;
    readonly areApplicationsPending: boolean;
    readonly isError: boolean;
    readonly partnerShops: readonly PartnerShop[];
    readonly pendingApplications: readonly PartnerApplication[];
    readonly selectedPartnerShopId: string | undefined;
    readonly onSelectPartnerShop: (partnerShopId: string) => void;
    readonly onApply: () => void;
    readonly onRetry: () => void;
}

function PartnerShopRequirement({
    isAuthenticated,
    isResolved,
    isPending,
    areApplicationsPending,
    isError,
    partnerShops,
    pendingApplications,
    selectedPartnerShopId,
    onSelectPartnerShop,
    onApply,
    onRetry,
}: PartnerShopRequirementProps) {
    const { t } = useTranslation();
    const translationBase = "partnerProgram.customIntegrationPage.guide.steps.selectShop";

    if (!isResolved || (isAuthenticated && (isPending || areApplicationsPending))) {
        return (
            <div className="space-y-3 border border-border/70 bg-background px-4 py-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/partners/applications">
                    <Store aria-hidden="true" />
                    {t(`${translationBase}.signInCta`)}
                </Link>
            </Button>
        );
    }

    if (isError) {
        return (
            <div className="space-y-3 border border-destructive/30 bg-destructive/5 px-4 py-4">
                <p className="text-sm text-muted-foreground">{t(`${translationBase}.loadError`)}</p>
                <Button type="button" variant="outline" onClick={onRetry}>
                    <RefreshCw aria-hidden="true" />
                    {t(`${translationBase}.retryCta`)}
                </Button>
            </div>
        );
    }

    if (partnerShops.length === 0 && pendingApplications.length === 0) {
        return (
            <div className="space-y-3 border border-primary/15 bg-primary/5 px-4 py-4">
                <p className="text-sm leading-6 text-muted-foreground">
                    {t(`${translationBase}.empty`)}
                </p>
                <Button type="button" size="lg" onClick={onApply}>
                    <Store aria-hidden="true" />
                    {t(`${translationBase}.applyCta`)}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 border border-border/70 bg-background px-4 py-4">
            {partnerShops.length > 0 && (
                <>
                    <p className="text-sm font-medium text-primary">
                        {t(`${translationBase}.selectionLabel`)}
                    </p>
                    <fieldset className="flex flex-col gap-2">
                        <legend className="sr-only">
                            {t(`${translationBase}.selectionLabel`)}
                        </legend>
                        {partnerShops.map((shop) => {
                            const labelId = `custom-integration-partner-shop-${shop.shopId}`;
                            const isSelected = selectedPartnerShopId === shop.shopId;

                            return (
                                <label key={shop.shopId} className="cursor-pointer">
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 rounded-sm border border-outline-variant/20 p-3 transition-colors",
                                            isSelected && "border-primary bg-primary/5",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="custom_integration_partner_shop"
                                            value={shop.shopId}
                                            checked={selectedPartnerShopId === shop.shopId}
                                            onChange={() => onSelectPartnerShop(shop.shopId)}
                                            aria-labelledby={labelId}
                                            className="size-4 shrink-0 accent-primary"
                                        />
                                        <div>
                                            <p id={labelId} className="font-medium">
                                                {shop.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {shop.shopId}
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </fieldset>
                </>
            )}

            {pendingApplications.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-primary">
                        {t(`${translationBase}.pendingLabel`)}
                    </p>
                    <ul className="flex flex-col gap-2">
                        {pendingApplications.map((application) => (
                            <li
                                key={application.id}
                                className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-outline-variant/30 bg-muted/30 p-3"
                            >
                                <p className="font-medium">{application.payload.shopName}</p>
                                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                    <Clock3 className="size-3.5" aria-hidden="true" />
                                    {t(BUSINESS_STATE_TRANSLATION_KEY[application.businessState])}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {partnerShops.length === 0 && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {t(`${translationBase}.pendingHint`)}
                </p>
            )}
        </div>
    );
}

function ProductRequestExample({ shopId }: { readonly shopId: string | undefined }) {
    const displayedShopId = shopId ?? "YOUR_SHOP_ID";

    return (
        <pre
            data-testid="partner-product-code-example"
            className="max-w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-5 font-mono text-xs leading-6 text-foreground sm:text-sm"
        >
            <code>
                curl --request POST \<br />
                {"  "}--url &apos;https://api.aura-historia.com/api/v1/shops/
                <mark className="rounded bg-amber-200 px-1 py-0.5 font-semibold text-amber-950">
                    {displayedShopId}
                </mark>
                /products&apos; \<br />
                {"  "}--header &apos;Authorization: Bearer{" "}
                <mark className="rounded bg-amber-200 px-1 py-0.5 font-semibold text-amber-950">
                    YOUR_USER_ACCESS_TOKEN
                </mark>
                &apos; \<br />
                {"  "}--header &apos;Content-Type: application/json&apos; \<br />
                {"  "}--data &apos;[&#123;
                <br />
                {"    "}&quot;shopsProductId&quot;: &quot;demo-violin-001&quot;,
                <br />
                {"    "}&quot;title&quot;: &#123;&quot;text&quot;: &quot;Baroque Violin&quot;,
                &quot;language&quot;: &quot;en&quot;&#125;,
                <br />
                {"    "}&quot;state&quot;: &quot;AVAILABLE&quot;,
                <br />
                {"    "}&quot;url&quot;:
                &quot;https://example-shop.com/products/demo-violin-001&quot;,
                <br />
                {"    "}&quot;images&quot;:
                [&quot;https://example-shop.com/images/demo-violin.jpg&quot;]
                <br />
                {"  "}&#125;]&apos;
            </code>
        </pre>
    );
}
