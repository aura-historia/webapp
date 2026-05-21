import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowRight, Code2, ExternalLink, KeyRound, RefreshCw, Send, Store } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";

type GuideStepKey = "requestKey" | "preparePayload" | "sendBatch" | "keepInSync" | "verifyShop";

type VisualVariant = "key" | "payload" | "send" | "sync" | "shop";

type GuideStep = {
    readonly key: GuideStepKey;
    readonly icon: typeof KeyRound;
    readonly variant: VisualVariant;
    readonly endpoint?: string;
};

const GUIDE_STEPS: readonly GuideStep[] = [
    {
        key: "requestKey",
        icon: KeyRound,
        variant: "key",
    },
    {
        key: "preparePayload",
        icon: Code2,
        variant: "payload",
    },
    {
        key: "sendBatch",
        icon: Send,
        variant: "send",
        endpoint: "POST /api/v1/shops/{shopId}/products",
    },
    {
        key: "keepInSync",
        icon: RefreshCw,
        variant: "sync",
        endpoint: "PATCH /api/v1/shops/{shopId}/products · PUT /api/v1/shops/{shopId}/products",
    },
    {
        key: "verifyShop",
        icon: Store,
        variant: "shop",
        endpoint: "/shops/{shopSlugId}",
    },
];

const LazyPartnerProductsApiReference = lazy(
    () => import("@/components/partners/PartnerProductsApiReference.tsx"),
);

export default function PartnerCustomIntegrationPage() {
    const { t } = useTranslation();
    const [shopSlugId, setShopSlugId] = useState("");

    const normalizedShopSlugId = shopSlugId.trim();
    const shopHref = normalizedShopSlugId
        ? `/shops/${encodeURIComponent(normalizedShopSlugId)}`
        : undefined;

    return (
        <div className="bg-background">
            <section className="border-b border-border/40 bg-linear-to-br from-primary/6 via-background to-tertiary/10 px-4 py-20 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-6">
                        <span className="inline-flex w-fit rounded-full border border-primary/15 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                            {t("partners.customIntegrationPage.hero.eyebrow")}
                        </span>
                        <div className="space-y-4">
                            <h1 className="font-display text-4xl text-primary sm:text-5xl">
                                {t("partners.customIntegrationPage.hero.title")}
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                {t("partners.customIntegrationPage.hero.subtitle")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Button asChild size="lg" className="min-w-56">
                            <a href="/partners/apply">
                                {t("partners.customIntegrationPage.hero.primaryCta")}
                                <ArrowRight aria-hidden="true" />
                            </a>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="min-w-56">
                            <a
                                href="https://docs.api.aura-historia.com"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {t("partners.customIntegrationPage.hero.secondaryCta")}
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
                                {t("partners.customIntegrationPage.concept.title")}
                            </CardTitle>
                            <p className="max-w-3xl text-muted-foreground">
                                {t("partners.customIntegrationPage.concept.description")}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                                    {t("partners.customIntegrationPage.concept.flowLabel")}
                                </p>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {(["accepted", "processing", "visible"] as const).map(
                                        (flowStep, index) => (
                                            <div
                                                key={flowStep}
                                                className="flex flex-1 items-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
                                            >
                                                <span className="flex size-8 items-center justify-center rounded-full bg-tertiary/20 text-sm font-medium text-primary">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm text-foreground">
                                                    {t(
                                                        `partners.customIntegrationPage.concept.flow.${flowStep}`,
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
                                        className="rounded-2xl border border-border/70 bg-card px-5 py-4"
                                    >
                                        <p className="font-medium text-primary">
                                            {t(
                                                `partners.customIntegrationPage.concept.benefits.${benefit}.title`,
                                            )}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {t(
                                                `partners.customIntegrationPage.concept.benefits.${benefit}.description`,
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
                                {t("partners.customIntegrationPage.summary.title")}
                            </CardTitle>
                            <p className="text-muted-foreground">
                                {t("partners.customIntegrationPage.summary.subtitle")}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(["apiKey", "shopId", "productBatch"] as const).map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-3 rounded-2xl border border-border/70 px-4 py-4"
                                >
                                    <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                        ✓
                                    </span>
                                    <div>
                                        <p className="font-medium text-primary">
                                            {t(
                                                `partners.customIntegrationPage.summary.items.${item}.title`,
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            {t(
                                                `partners.customIntegrationPage.summary.items.${item}.description`,
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
                        headline={t("partners.customIntegrationPage.guide.title")}
                        description={t("partners.customIntegrationPage.guide.subtitle")}
                        showDivider={false}
                    />

                    <div className="mt-16 space-y-8">
                        {GUIDE_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isReverse = index % 2 === 1;
                            const translationBase = `partners.customIntegrationPage.guide.steps.${step.key}`;

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
                                                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Icon className="size-5" aria-hidden="true" />
                                                </span>
                                                <div>
                                                    <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
                                                        {t(
                                                            "partners.customIntegrationPage.guide.stepLabel",
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
                                                <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 px-4 py-3">
                                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
                                                        {t(
                                                            "partners.customIntegrationPage.guide.endpointLabel",
                                                        )}
                                                    </p>
                                                    <code className="mt-2 block text-sm text-primary">
                                                        {step.endpoint}
                                                    </code>
                                                </div>
                                            )}

                                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                                                <p className="text-sm font-medium text-primary">
                                                    {t(
                                                        "partners.customIntegrationPage.guide.focusLabel",
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {t(`${translationBase}.focus`)}
                                                </p>
                                            </div>

                                            {step.key === "verifyShop" && (
                                                <div className="space-y-3 rounded-2xl border border-border/70 bg-background px-4 py-4">
                                                    <label
                                                        htmlFor="custom-integration-shop-slug"
                                                        className="block text-sm font-medium text-primary"
                                                    >
                                                        {t(`${translationBase}.inputLabel`)}
                                                    </label>
                                                    <Input
                                                        id="custom-integration-shop-slug"
                                                        aria-label={t(
                                                            `${translationBase}.inputLabel`,
                                                        )}
                                                        value={shopSlugId}
                                                        onChange={(event) =>
                                                            setShopSlugId(event.currentTarget.value)
                                                        }
                                                        placeholder={t(
                                                            `${translationBase}.inputPlaceholder`,
                                                        )}
                                                        className="h-11"
                                                    />
                                                    <p className="text-sm text-muted-foreground">
                                                        {t(`${translationBase}.inputHint`)}
                                                    </p>
                                                    {shopHref ? (
                                                        <Button
                                                            asChild
                                                            size="lg"
                                                            className="w-full sm:w-auto"
                                                        >
                                                            <a href={shopHref}>
                                                                {t(`${translationBase}.cta`)}
                                                                <ArrowRight aria-hidden="true" />
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="lg"
                                                            className="w-full sm:w-auto"
                                                            disabled
                                                        >
                                                            {t(`${translationBase}.cta`)}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <StepVisual
                                                stepNumber={index + 1}
                                                variant={step.variant}
                                                title={t(`${translationBase}.visualTitle`)}
                                                caption={t(`${translationBase}.visualCaption`)}
                                            />
                                        </div>
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
                        headline={t("partners.customIntegrationPage.endpoints.title")}
                        description={t("partners.customIntegrationPage.endpoints.subtitle")}
                        showDivider={false}
                    />

                    <Card className="mt-16 overflow-hidden rounded-[32px] border border-border/60 bg-linear-to-b from-card via-background to-card/70 shadow-xs">
                        <div className="p-0">
                            <div>
                                <p className="sr-only">
                                    {t("partners.customIntegrationPage.endpoints.embedTitle")}
                                </p>
                                <ClientOnly
                                    fallback={
                                        <div className="h-[960px] w-full animate-pulse bg-white" />
                                    }
                                >
                                    <Suspense
                                        fallback={
                                            <div className="h-[960px] w-full animate-pulse bg-white" />
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
        </div>
    );
}

function StepVisual({
    stepNumber,
    variant,
    title,
    caption,
}: {
    readonly stepNumber: number;
    readonly variant: VisualVariant;
    readonly title: string;
    readonly caption: string;
}) {
    return (
        <div className="rounded-[28px] border border-border/70 bg-linear-to-br from-white to-muted/60 p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">{title}</p>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    {caption}
                </span>
            </div>

            <div className="mt-4 rounded-[24px] border border-border/70 bg-background p-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <span className="size-2.5 rounded-full bg-destructive/60" />
                        <span className="size-2.5 rounded-full bg-primary/30" />
                        <span className="size-2.5 rounded-full bg-tertiary/40" />
                    </div>
                    <span className="text-xs text-muted-foreground">Step {stepNumber}</span>
                </div>

                <div className="mt-5 space-y-3">
                    <div className="h-4 w-2/3 rounded-full bg-muted" />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-3">
                            <div className="h-10 rounded-xl bg-muted" />
                            <div className="h-10 rounded-xl bg-muted" />
                            <div
                                className={cn(
                                    "rounded-xl border-2 border-destructive/80 bg-destructive/10",
                                    variant === "key" ? "h-11" : "h-8",
                                )}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="h-20 rounded-2xl bg-muted/80" />
                            <div
                                className={cn(
                                    "rounded-2xl bg-muted/80",
                                    variant === "send" &&
                                        "border-2 border-destructive/80 bg-destructive/10",
                                    variant === "sync" &&
                                        "border-2 border-destructive/80 bg-destructive/10",
                                    variant === "shop" &&
                                        "border-2 border-destructive/80 bg-destructive/10",
                                    variant === "payload" ? "h-24" : "h-16",
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-9 rounded-xl bg-muted" />
                        <div
                            className={cn(
                                "h-9 rounded-xl bg-muted",
                                (variant === "send" || variant === "shop") &&
                                    "border-2 border-destructive/80 bg-destructive/10",
                            )}
                        />
                        <div className="h-9 rounded-xl bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
}
