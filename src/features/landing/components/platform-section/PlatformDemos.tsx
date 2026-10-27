import { ImageIcon } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { HATCHED_PLACEHOLDER_CLASS } from "@/features/landing/components/common/ObjectCard.tsx";
import { useTypewriter } from "@/hooks/common/useTypewriter.ts";
import { cn } from "@/lib/utils.ts";

/*
 * Small miniatures of each platform capability. They illustrate the feature only and are
 * exposed to assistive technology as one image with a description.
 */

const MONO_PILL = "rounded-pill border border-line px-2.5 py-1";
const QUIET_TAG = "rounded-sm bg-surface-sunken px-[7px] py-[3px]";

const AGENT_EXAMPLES = ["gustavian", "meissen", "artDeco"] as const;
const AGENT_CHIPS = ["region", "form", "budget", "languages"] as const;
const CARET_CLASS = "ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.18em]";

/** True while the element is on screen and the visitor has not asked for reduced motion. */
function useAnimateWhenVisible(ref: RefObject<HTMLElement | null>): boolean {
    const [isVisible, setIsVisible] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(true);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotion = () => setReduceMotion(media.matches);
        updateMotion();
        media.addEventListener("change", updateMotion);
        return () => media.removeEventListener("change", updateMotion);
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return isVisible && !reduceMotion;
}

/**
 * Example search instructions for an Ultimate search alert, typed out like a visitor writing
 * them, with illustrative tags for what they describe and the alert's latest matches. It cycles
 * through a few briefs.
 */
export function AgentDemo() {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const isAnimating = useAnimateWhenVisible(ref);
    const briefs = useMemo(
        () => AGENT_EXAMPLES.map((id) => t(`landingPage.platform.agent.examples.${id}.brief`)),
        [t],
    );
    const { text, index } = useTypewriter({
        examples: briefs,
        enabled: isAnimating,
        startTyped: true,
        typingSpeed: 38,
        deletingSpeed: 14,
        delayBetweenExamples: 3600,
    });
    const example = AGENT_EXAMPLES[index];

    return (
        <div
            ref={ref}
            role="img"
            aria-label={t("landingPage.platform.agent.demoLabel")}
            className="mt-auto flex flex-col gap-3.5 rounded-lg border border-line bg-surface-sunken p-4 sm:gap-4 sm:p-[18px]"
        >
            {/* Every brief is laid out invisibly in the same cell, so the card keeps the height of the longest. */}
            <div className="grid font-serif text-[17px] leading-[1.45] text-ink italic sm:text-lg [&>p]:col-start-1 [&>p]:row-start-1">
                {briefs.map((brief) => (
                    <p key={brief} aria-hidden="true" className="invisible">
                        {brief}
                        <span className={CARET_CLASS} />
                    </p>
                ))}
                <p>
                    {isAnimating ? text : briefs[index]}
                    <span
                        aria-hidden="true"
                        className={cn(CARET_CLASS, "bg-brass motion-safe:animate-pulse")}
                    />
                </p>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-ink-secondary sm:gap-2 sm:text-[11px]">
                {AGENT_CHIPS.map((chip) => (
                    <span key={chip} className={MONO_PILL}>
                        {t(`landingPage.platform.agent.examples.${example}.chips.${chip}`)}
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-2.5 border-t border-line pt-3 text-meta sm:pt-3.5">
                <span className="size-2 shrink-0 rounded-full bg-signal-live" />
                <span>
                    <Trans
                        i18nKey={`landingPage.platform.agent.examples.${example}.watching`}
                        components={{ strong: <strong className="font-semibold" /> }}
                    />
                </span>
                <span className="ml-auto text-brass">{t("landingPage.platform.agent.review")}</span>
            </div>
        </div>
    );
}

const LANGUAGE_MATCHES = [
    { text: "Meissener Porzellan", code: "DE" },
    { text: "porcelaine de Saxe", code: "FR" },
    { text: "servizio in porcellana di Meissen", code: "IT" },
] as const;

export function LanguagesDemo() {
    const { t } = useTranslation();

    return (
        <div
            role="img"
            aria-label={t("landingPage.platform.languages.demoLabel")}
            className="mt-auto flex flex-col gap-1.5 text-meta sm:gap-2"
        >
            <div data-theme="dark" className="rounded-md bg-surface px-3 py-2.5 text-ink">
                {t("landingPage.platform.languages.query")}
            </div>
            {LANGUAGE_MATCHES.map((match) => (
                <div
                    key={match.code}
                    lang={match.code.toLowerCase()}
                    className="flex justify-between gap-2 rounded-md px-3 py-2 shadow-field"
                >
                    <span>{match.text}</span>
                    <span className="font-mono text-[11px] text-ink-muted">{match.code}</span>
                </div>
            ))}
        </div>
    );
}

export function AlertsDemo() {
    const { t } = useTranslation();
    const tags = ["price", "available", "dealers"] as const;

    return (
        <div
            role="img"
            aria-label={t("landingPage.platform.alerts.demoLabel")}
            className="mt-auto flex flex-col gap-2.5 rounded-field p-3.5 text-meta shadow-field"
        >
            <div className="flex items-center justify-between gap-3">
                <strong className="font-semibold">{t("landingPage.platform.alerts.name")}</strong>
                <span className="relative h-5 w-[34px] shrink-0 rounded-pill bg-oxblood">
                    <span className="absolute top-[3px] right-[3px] size-3.5 rounded-full bg-surface-raised" />
                </span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-ink-secondary sm:text-[11px]">
                {tags.map((tag) => (
                    <span key={tag} className={QUIET_TAG}>
                        {t(`landingPage.platform.alerts.tags.${tag}`)}
                    </span>
                ))}
            </div>
            <span className="font-medium text-oxblood">
                {t("landingPage.platform.alerts.matches")}
            </span>
        </div>
    );
}

const WATCHLIST_ITEMS = [
    { key: "vanity", status: "priceDrop", tone: "text-oxblood" },
    { key: "sideboard", status: "relisted", tone: "text-brass-ink" },
    { key: "dressingTable", status: "sold", tone: "text-ink-muted" },
] as const;

export function WatchlistDemo() {
    const { t } = useTranslation();

    return (
        <div
            role="img"
            aria-label={t("landingPage.platform.watchlist.demoLabel")}
            className="mt-auto flex flex-col gap-2.5 text-meta"
        >
            {WATCHLIST_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                    <span
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-thumb",
                            HATCHED_PLACEHOLDER_CLASS,
                        )}
                    >
                        <ImageIcon className="size-4" strokeWidth={1.4} />
                    </span>
                    <span className="min-w-0 flex-1">
                        {t(`landingPage.platform.watchlist.items.${item.key}`)}
                    </span>
                    <span className={cn("font-mono text-[11px] uppercase", item.tone)}>
                        {t(`landingPage.platform.watchlist.status.${item.status}`)}
                    </span>
                </div>
            ))}
        </div>
    );
}

const TIMELINE_EVENTS = [
    { key: "indexed", dot: "bg-surface-raised shadow-[inset_0_0_0_2px_var(--ink-muted)]" },
    { key: "auction", dot: "bg-brass" },
    { key: "relisted", dot: "bg-oxblood" },
] as const;

export function TimelineDemo() {
    const { t } = useTranslation();

    return (
        <ol
            aria-label={t("landingPage.platform.timeline.demoLabel")}
            className="mt-auto ml-1 flex flex-col text-meta"
        >
            {TIMELINE_EVENTS.map((event, index) => {
                const isLast = index === TIMELINE_EVENTS.length - 1;
                return (
                    <li
                        key={event.key}
                        className={cn(
                            "relative flex gap-3 pl-3.5",
                            isLast ? "border-l border-transparent" : "border-l border-line pb-3",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "absolute top-1 -left-[5px] size-[9px] rounded-full",
                                event.dot,
                            )}
                        />
                        <span className={cn("flex-1", isLast && "font-semibold")}>
                            {t(`landingPage.platform.timeline.events.${event.key}.label`)}
                        </span>
                        <span className="font-mono text-[11px] text-ink-muted uppercase">
                            {t(`landingPage.platform.timeline.events.${event.key}.date`)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

const PRICE_LINE =
    "M0 52 C40 50 70 72 110 74 S180 58 230 54 S300 60 330 92 S400 108 440 118 S520 132 600 130";

export function MarketWatchDemo() {
    const { t } = useTranslation();

    return (
        <div
            role="img"
            aria-label={t("landingPage.platform.marketWatch.demoLabel")}
            className="flex flex-col gap-2.5"
        >
            <div className="flex justify-between gap-2 font-mono text-[10px] tracking-[0.1em] text-ink-muted uppercase sm:text-[11px]">
                <span>{t("landingPage.platform.marketWatch.measure")}</span>
                <span>{t("landingPage.platform.marketWatch.period")}</span>
            </div>
            <svg aria-hidden="true" viewBox="0 0 600 180" className="h-auto w-full" fill="none">
                <line x1="0" y1="45" x2="600" y2="45" className="stroke-line-subtle" />
                <line x1="0" y1="90" x2="600" y2="90" className="stroke-line-subtle" />
                <line x1="0" y1="135" x2="600" y2="135" className="stroke-line-subtle" />
                <line x1="0" y1="179.5" x2="600" y2="179.5" className="stroke-line" />
                <path d={`${PRICE_LINE} V180 H0 Z`} fill="rgba(74,21,32,0.07)" />
                <path d={PRICE_LINE} strokeWidth="2.2" className="stroke-oxblood" />
                <circle cx="600" cy="130" r="5" className="fill-oxblood" />
                <circle
                    cx="600"
                    cy="130"
                    r="11"
                    strokeOpacity="0.25"
                    strokeWidth="2"
                    className="stroke-oxblood"
                />
            </svg>
        </div>
    );
}
