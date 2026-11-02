import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import { cn } from "@/lib/utils.ts";

/**
 * The shift from search to agents, in five sourced figures. Each figure, claim and source label is
 * localised; the link always goes to the primary source. Re-check the figures before changing copy.
 */
const SHIFT_FIGURES = [
    {
        key: "search",
        href: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/",
    },
    {
        key: "answers",
        href: "https://www.pewresearch.org/chart/a-majority-of-americans-say-they-read-ai-summaries-at-the-top-of-search-results/",
    },
    {
        key: "assistants",
        href: "https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/",
    },
    {
        key: "buying",
        href: "https://www.bain.com/insights/winning-over-the-customer-in-the-age-of-ai-a-new-horizon-for-luxury/",
        lead: true,
    },
    {
        key: "collecting",
        href: "https://www.ubs.com/global/en/media/display-page-ndp/en-20261008-art-basel-ubs-survey.html",
    },
] as const;

/** How each figure was measured, keyed to the figures it describes. */
const SHIFT_NOTES = [
    { key: "search", figures: "01" },
    { key: "survey2026", figures: "02–03" },
    { key: "buying", figures: "04" },
    { key: "collecting", figures: "05" },
] as const;

/** Ways a listing can be found today. */
const ROUTES = ["aura", "engines", "assistants"] as const;

/**
 * Our own apps for named assistants, all still in development, in alphabetical order. Names only:
 * none of these owners allows its logo without prior approval. Google's product name is localised.
 */
const ASSISTANT_APPS = [
    { id: "chatgpt", name: "ChatGPT", maker: "OpenAI" },
    { id: "claude", name: "Claude", maker: "Anthropic" },
    { id: "google", name: null, maker: "Google · Connected Apps" },
    { id: "grok", name: "Grok", maker: "xAI" },
    { id: "muse", name: "Muse", maker: "Meta" },
] as const;

const SOURCE_LINK_CLASS = cn(
    "inline-flex min-h-11 items-center gap-2 self-start font-mono text-label tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass",
    NAV_FOCUS_CLASS,
);

function AvailableTag({ className }: { readonly className?: string }) {
    const { t } = useTranslation();

    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 self-start justify-self-start rounded-sm px-[9px] py-[5px] font-mono text-tag tracking-[0.12em] whitespace-nowrap text-ink uppercase shadow-[inset_0_0_0_1px_var(--line-strong)]",
                className,
            )}
        >
            <span aria-hidden="true" className="size-[7px] rounded-full bg-signal-live" />
            {t("partnerProgram.discovery.routes.status")}
        </span>
    );
}

function InDevelopmentTag() {
    const { t } = useTranslation();

    return (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-dashed border-line-strong px-[7px] py-1 font-mono text-tag tracking-[0.1em] whitespace-nowrap text-ink-secondary uppercase sm:gap-2 sm:px-2 sm:tracking-[0.12em]">
            <span
                aria-hidden="true"
                className="size-[7px] rounded-full shadow-[inset_0_0_0_1.5px_var(--ink-muted)]"
            />
            {t("partnerProgram.discovery.apps.status")}
        </span>
    );
}

/** The five figures under a ruled top line, then how each was measured. */
function ShiftFigures() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex max-w-[860px] flex-col gap-3">
                <p className="font-mono text-kicker text-ink-muted uppercase">
                    {t("partnerProgram.discovery.shift.label")}
                </p>
                <p className="font-serif text-[24px] leading-[1.2] text-balance sm:text-[clamp(26px,2.6vw,36px)] sm:leading-[1.15] [&_em]:text-brass-light [&_em]:italic">
                    <Trans
                        i18nKey="partnerProgram.discovery.shift.title"
                        components={HEADLINE_COMPONENTS}
                    />
                </p>
            </div>
            <ol className="grid grid-cols-1 border-t border-ink sm:grid-cols-2 lg:grid-cols-5">
                {SHIFT_FIGURES.map((figure, index) => (
                    <li
                        key={figure.key}
                        className={cn(
                            "grid grid-cols-[84px_minmax(0,1fr)] gap-x-3 border-b border-line pt-[18px] pb-1.5 sm:flex sm:flex-col sm:gap-2.5 sm:pt-6 sm:pr-5 sm:pb-4 lg:border-b-0 lg:pb-2",
                            index > 0 && "lg:border-l lg:pl-5",
                        )}
                    >
                        <span
                            className={cn(
                                "font-serif text-[40px] leading-none sm:order-2 sm:text-[clamp(44px,4.4vw,60px)]",
                                "lead" in figure && "text-brass-light",
                            )}
                        >
                            {t(`partnerProgram.discovery.shift.items.${figure.key}.value`)}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1.5 sm:contents">
                            <span className="font-mono text-label text-brass-ink uppercase sm:order-1">
                                {String(index + 1).padStart(2, "0")} ·{" "}
                                {t(`partnerProgram.discovery.shift.items.${figure.key}.stage`)}
                            </span>
                            <p className="text-body-sm text-ink-secondary sm:order-3">
                                {t(`partnerProgram.discovery.shift.items.${figure.key}.claim`)}
                            </p>
                            <a
                                href={figure.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(SOURCE_LINK_CLASS, "sm:order-4 sm:mt-auto")}
                            >
                                {t(`partnerProgram.discovery.shift.items.${figure.key}.source`)}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-[13px] shrink-0"
                                    strokeWidth={1.8}
                                />
                                <span className="sr-only">
                                    {t("partnerProgram.integrations.newTab")}
                                </span>
                            </a>
                        </div>
                    </li>
                ))}
            </ol>
            <ol
                aria-label={t("partnerProgram.discovery.shift.notesLabel")}
                className="grid grid-cols-1 gap-x-7 gap-y-1.5 text-xs leading-normal text-ink-muted md:grid-cols-2"
            >
                {SHIFT_NOTES.map((note) => (
                    <li
                        key={note.key}
                        className="grid grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[52px_minmax(0,1fr)]"
                    >
                        <span className="font-mono tracking-[0.08em]">{note.figures}</span>
                        <span>{t(`partnerProgram.discovery.shift.notes.${note.key}`)}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

/** What works today: three ruled routes, each marked available; the AI route explains its plumbing on request. */
function DiscoveryRoutes() {
    const { t } = useTranslation();
    const detailId = useId();
    const [detailOpen, setDetailOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:gap-5">
            <p className="font-mono text-kicker text-ink-muted uppercase">
                {t("partnerProgram.discovery.routes.label")}
            </p>
            <ol className="border-t border-ink">
                {ROUTES.map((route, index) => (
                    <li
                        key={route}
                        className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-2.5 border-b border-line pt-5 pb-6 sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:gap-x-5 sm:gap-y-3 sm:py-7"
                    >
                        <span
                            aria-hidden="true"
                            className="col-start-1 row-start-1 pt-1.5 font-mono text-xs tracking-[0.14em] text-brass-ink sm:pt-2"
                        >
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="col-start-2 font-serif text-[22px] leading-[1.2] font-normal sm:text-title-md">
                            {t(`partnerProgram.discovery.routes.items.${route}.title`)}
                        </h3>
                        <AvailableTag className="col-start-2 sm:col-start-3 sm:row-start-1 sm:mt-1" />
                        <p className="col-start-2 max-w-[520px] text-body text-ink-secondary">
                            {t(`partnerProgram.discovery.routes.items.${route}.description`)}
                        </p>
                        {route === "assistants" && (
                            <div className="col-start-2 flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    aria-expanded={detailOpen}
                                    aria-controls={detailId}
                                    onClick={() => setDetailOpen((open) => !open)}
                                    className={cn(
                                        "inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-ink transition-colors hover:text-brass",
                                        NAV_FOCUS_CLASS,
                                    )}
                                >
                                    {t("partnerProgram.discovery.routes.detailToggle")}
                                    <span
                                        aria-hidden="true"
                                        className="text-lg leading-none font-light"
                                    >
                                        {detailOpen ? "−" : "+"}
                                    </span>
                                </button>
                                <div
                                    id={detailId}
                                    role="region"
                                    aria-label={t("partnerProgram.discovery.routes.detailLabel")}
                                    hidden={!detailOpen}
                                    className="flex max-w-[560px] flex-col gap-1.5 rounded-lg px-4 py-3.5 shadow-field"
                                >
                                    <p className="font-mono text-label text-ink-muted uppercase">
                                        {t("partnerProgram.discovery.routes.detailLabel")}
                                    </p>
                                    <p className="text-body-sm text-ink-secondary">
                                        {t("partnerProgram.discovery.routes.detail")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

/** What is coming: our own apps inside named assistants, marked in development, names only. */
function AssistantApps() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 sm:gap-5">
            <p className="font-mono text-kicker text-ink-muted uppercase">
                {t("partnerProgram.discovery.apps.label")}
            </p>
            <p className="text-body text-ink-secondary">
                {t("partnerProgram.discovery.apps.intro")}
            </p>
            <ul className="border-t border-ink">
                {ASSISTANT_APPS.map((app) => (
                    <li
                        key={app.id}
                        className="flex items-center justify-between gap-3 border-b border-line py-4 sm:gap-4 sm:py-[18px]"
                    >
                        <span className="flex min-w-0 flex-col gap-1">
                            <span className="font-serif text-[21px] leading-[1.15] sm:text-[24px]">
                                {app.name ?? t("partnerProgram.discovery.apps.google")}
                            </span>
                            <span className="font-mono text-label text-ink-muted uppercase">
                                {app.maker}
                            </span>
                        </span>
                        <InDevelopmentTag />
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * II — Search is changing: why being listed matters as discovery moves from result lists to AI answers
 * and assistants. Sourced figures, what works today, what is in development, and the plain caveat that
 * third parties decide what they show. Buyers still buy in the partner's own shop.
 */
export default function PartnerDiscoverySection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="ink"
            id={PARTNER_PROGRAM_FRAGMENTS.discovery}
            labelledBy="partner-discovery-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <div className="grid items-end gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,6vw,96px)]">
                <SectionHeading
                    id="partner-discovery-heading"
                    onInk
                    eyebrow={`II — ${t("partnerProgram.discovery.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="partnerProgram.discovery.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className="max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg">
                    {t("partnerProgram.discovery.subtitle")}
                </p>
            </div>

            <ShiftFigures />

            <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-[clamp(40px,5vw,80px)]">
                <DiscoveryRoutes />
                <AssistantApps />
            </div>

            <p className="max-w-[880px] text-meta leading-[1.55] text-ink-muted">
                {t("partnerProgram.discovery.disclaimer")}
            </p>

            <div className="flex flex-col gap-3.5 border-t border-line pt-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-7 sm:pt-9">
                <div className="flex max-w-[640px] flex-col gap-2.5">
                    <h3 className="font-serif text-[26px] leading-[1.15] font-normal sm:text-[clamp(26px,2.4vw,34px)] [&_em]:text-brass-light [&_em]:italic">
                        <Trans
                            i18nKey="partnerProgram.discovery.closing.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    </h3>
                    <p className="text-[15px] leading-relaxed text-ink-secondary sm:text-base">
                        {t("partnerProgram.discovery.closing.body")}
                    </p>
                </div>
                <div className="mt-1.5 flex flex-col gap-2.5 sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-3">
                    <a
                        href={`#${PARTNER_PROGRAM_FRAGMENTS.apply}`}
                        data-theme="light"
                        className={cn(
                            "inline-flex h-[50px] items-center justify-center gap-2.5 rounded-pill bg-surface px-6 text-[15px] font-medium text-ink transition-opacity hover:opacity-90",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        {t("partnerProgram.discovery.closing.apply")}
                        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    </a>
                    <a
                        href={`#${PARTNER_PROGRAM_FRAGMENTS.integrations}`}
                        className={cn(
                            "inline-flex h-[50px] items-center justify-center rounded-pill px-6 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        {t("partnerProgram.discovery.closing.connect")}
                    </a>
                </div>
            </div>
        </LandingSection>
    );
}
