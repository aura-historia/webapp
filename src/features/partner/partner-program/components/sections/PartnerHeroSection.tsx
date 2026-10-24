import { ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import { cn } from "@/lib/utils.ts";

const PREVIEW_IMAGE_URL = "https://assets.aura-historia.com/webapp/landing-page/lorrain.webp";
const PREVIEW_PRICE_EUR = 1980;

const TERMS = ["commission", "fees", "revenue", "cancel"] as const;

/** A sample listing card: how a partner's object appears in the index, badge and shop link included. */
function ListingPreview() {
    const { t, i18n } = useTranslation();
    const price = new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(PREVIEW_PRICE_EUR);

    return (
        <figure className="flex w-full flex-col gap-3 lg:max-w-[400px] lg:justify-self-end lg:gap-3.5">
            <div
                data-theme="light"
                className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3.5 rounded-panel bg-surface-raised p-2.5 text-ink shadow-search lg:flex lg:flex-col lg:items-stretch lg:p-3"
            >
                <div className="relative aspect-square overflow-hidden rounded-md bg-image-ground lg:aspect-5/4 lg:rounded-field">
                    <img
                        src={PREVIEW_IMAGE_URL}
                        alt=""
                        aria-hidden="true"
                        className="size-full object-cover"
                        decoding="async"
                    />
                    <span className="absolute top-2.5 left-2.5 hidden items-center gap-1.5 rounded-sm bg-chip-on-image px-2 py-1 font-mono text-tag text-[#170D0E] uppercase lg:inline-flex">
                        <BadgeCheck aria-hidden="true" className="size-[11px]" strokeWidth={2.2} />
                        {t("partnerProgram.hero.preview.badge")}
                    </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5 lg:px-1.5">
                    <span className="inline-flex items-center gap-1 font-mono text-tag text-ink-muted uppercase lg:hidden">
                        <BadgeCheck aria-hidden="true" className="size-[11px]" strokeWidth={2.2} />
                        {t("partnerProgram.hero.preview.badge")}
                    </span>
                    <span className="font-serif text-object-title-sm lg:text-object-title">
                        {t("partnerProgram.hero.preview.title")}
                    </span>
                    <div className="flex items-baseline justify-between gap-3 text-meta text-ink-muted">
                        <span className="min-w-0 truncate">
                            {t("partnerProgram.hero.preview.seller")}
                        </span>
                        <strong className="shrink-0 text-sm font-semibold text-ink lg:text-price">
                            {price}
                        </strong>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-meta font-medium lg:hidden">
                        {t("partnerProgram.hero.preview.cta")}
                        <ArrowUpRight
                            aria-hidden="true"
                            className="size-[13px]"
                            strokeWidth={1.8}
                        />
                    </span>
                </div>
                <span className="hidden h-11 items-center justify-center gap-2.5 rounded-pill bg-ink text-sm font-medium text-surface lg:flex">
                    {t("partnerProgram.hero.preview.cta")}
                    <ArrowUpRight aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                </span>
            </div>
            <figcaption className="flex justify-between gap-3 font-mono text-label text-ink-muted uppercase">
                <span>{t("partnerProgram.hero.preview.caption")}</span>
                <span>{t("partnerProgram.hero.preview.sample")}</span>
            </figcaption>
        </figure>
    );
}

/** The partner program opener on the ink ground: promise, calls to action, a sample listing and the terms. */
export default function PartnerHeroSection() {
    const { t } = useTranslation();

    return (
        <section
            id={PARTNER_PROGRAM_FRAGMENTS.hero}
            aria-labelledby="partner-hero-title"
            data-theme="dark"
            className="relative overflow-hidden bg-surface text-ink"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mx-auto hidden max-w-content grid-cols-12 md:grid"
            >
                {Array.from({ length: 12 }, (_, index) => (
                    <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative columns
                        key={index}
                        className="border-l border-[rgba(244,238,227,0.045)] last:border-r"
                    />
                ))}
            </div>
            <div className="relative mx-auto flex max-w-content flex-col gap-10 px-(--page-gutter) pt-12 pb-10 sm:gap-14 lg:gap-[clamp(56px,6vw,88px)] lg:pt-[clamp(64px,8vw,112px)] lg:pb-[clamp(48px,5vw,72px)]">
                <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-[clamp(48px,6vw,96px)]">
                    <div className="flex flex-col gap-5 sm:gap-7">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-brass-light uppercase sm:text-eyebrow">
                            {t("partnerProgram.hero.eyebrow")}
                        </p>
                        <h1
                            id="partner-hero-title"
                            className="font-serif text-[44px] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[clamp(46px,6vw,92px)] sm:leading-none [&_em]:text-brass-light [&_em]:italic"
                        >
                            <Trans
                                i18nKey="partnerProgram.hero.title"
                                components={HEADLINE_COMPONENTS}
                            />
                        </h1>
                        <p className="max-w-[600px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                            {t("partnerProgram.hero.subtitle")}
                        </p>
                        <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                            <a
                                href={`#${PARTNER_PROGRAM_FRAGMENTS.apply}`}
                                data-theme="light"
                                className={cn(
                                    "inline-flex h-[50px] items-center justify-center gap-2.5 rounded-pill bg-surface px-6 text-[15px] font-medium text-ink transition-opacity hover:opacity-90",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("partnerProgram.hero.primaryCta")}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                    strokeWidth={1.8}
                                />
                            </a>
                            <a
                                href={`#${PARTNER_PROGRAM_FRAGMENTS.howEasy}`}
                                className={cn(
                                    "inline-flex h-[50px] items-center justify-center rounded-pill px-6 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t("partnerProgram.hero.secondaryCta")}
                            </a>
                        </div>
                    </div>
                    <ListingPreview />
                </div>

                <dl
                    aria-label={t("partnerProgram.hero.terms.label")}
                    className="grid grid-cols-2 border-y border-line md:grid-cols-4"
                >
                    {TERMS.map((term, index) => (
                        <div
                            key={term}
                            className={cn(
                                "flex flex-col gap-1 py-[18px] sm:gap-1.5 sm:py-[22px]",
                                index % 2 === 1 ? "border-l border-line pl-4 sm:pl-5" : "pr-3",
                                index >= 2 && "border-t border-line md:border-t-0",
                                index === 2 && "md:border-l md:border-line md:pl-5",
                                index > 0 && "md:pr-5",
                            )}
                        >
                            <dt className="order-2 font-mono text-label text-ink-muted uppercase">
                                {t(`partnerProgram.hero.terms.${term}.label`)}
                            </dt>
                            <dd className="order-1 font-serif text-[28px] leading-[1.1] sm:text-stat">
                                {t(`partnerProgram.hero.terms.${term}.value`)}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
