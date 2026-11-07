import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { ConsentToggle } from "@/features/consent-management/components/ConsentToggle.tsx";
import {
    CONSENT_DECISION_BUTTON_CLASS,
    CONSENT_LINK_CLASS,
    CONSENT_SELECTION_BUTTON_CLASS,
} from "@/features/consent-management/lib/consentStyles.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

/** How long the banner fades out after a decision before it unmounts. */
const LEAVE_DURATION_MS = 150;

interface ConsentPurposeRowProps {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly checked: boolean;
    readonly onCheckedChange: (checked: boolean) => void;
}

function ConsentPurposeRow({
    id,
    label,
    description,
    checked,
    onCheckedChange,
}: ConsentPurposeRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 border-t border-line-subtle py-3.5 md:gap-5 md:border-t-0 md:border-b md:py-4">
            <div className="flex min-w-0 flex-col gap-1">
                <h3 id={id} className="font-sans text-[14px] leading-[1.4] font-medium text-ink">
                    {label}
                </h3>
                <p className="font-sans text-[13px] leading-[1.55] text-ink-secondary">
                    {description}
                </p>
            </div>
            <ConsentToggle
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-labelledby={id}
                className="-mt-2.5 -mr-[5px]"
            />
        </div>
    );
}

function CookieSettingsNote({ className }: { readonly className?: string }) {
    return (
        <p className={cn("font-sans leading-[1.5] text-ink-muted", className)}>
            <Trans
                i18nKey="consent.changeLater"
                components={{
                    1: (
                        <Link
                            to="/$lng/consent-settings"
                            className={CONSENT_LINK_CLASS}
                            params={true}
                            from="/$lng"
                        />
                    ),
                }}
            />
        </p>
    );
}

/**
 * Asks for the optional purposes (analytics, external maps) while any of them has no decision.
 * A floating card from 768px, a bottom sheet below with the purposes behind a disclosure
 * (design boards "Legal · Consent banner").
 */
export function ConsentBanner() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { t } = useTranslation();
    const idPrefix = useId();
    const [mounted, setMounted] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [purposesOpen, setPurposesOpen] = useState(false);
    const [analyticsSelected, setAnalyticsSelected] = useState(
        preferences.trackingConsent === true,
    );
    const [externalMapsSelected, setExternalMapsSelected] = useState(
        preferences.externalMapConsent === true,
    );
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Render nothing on the server and in the first client render, so hydration matches;
    // the stored decisions are only known in the browser.
    useEffect(() => {
        setMounted(true);
        return () => clearTimeout(leaveTimer.current);
    }, []);

    if (!mounted) return null;

    const decided =
        typeof preferences.trackingConsent === "boolean" &&
        typeof preferences.externalMapConsent === "boolean";

    if (decided && !leaving) return null;

    const decide = (trackingConsent: boolean, externalMapConsent: boolean) => {
        setLeaving(true);
        updatePreferences({ trackingConsent, externalMapConsent });
        leaveTimer.current = setTimeout(() => setLeaving(false), LEAVE_DURATION_MS);
    };

    const titleId = `${idPrefix}-title`;
    const purposesId = `${idPrefix}-purposes`;

    return (
        <div
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 md:px-6 md:pb-6",
                leaving
                    ? "motion-safe:animate-out motion-safe:fade-out motion-safe:duration-150 fill-mode-forwards"
                    : "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-250 motion-safe:ease-out",
            )}
        >
            <section
                aria-labelledby={titleId}
                className="mx-auto flex max-h-[85dvh] w-full max-w-[1040px] flex-col gap-4 overflow-y-auto rounded-t-card bg-surface-raised px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))] text-ink shadow-[var(--shadow-menu),0_0_0_1px_var(--line)] md:gap-7 md:rounded-card md:px-9 md:pt-8 md:pb-7"
            >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] md:items-start md:gap-12">
                    <div className="flex min-w-0 flex-col gap-2.5 md:gap-3">
                        <p className="font-mono text-[11px] leading-[1.4] tracking-[0.2em] text-brass-ink uppercase">
                            {t("consent.eyebrow")}
                        </p>
                        <h2
                            id={titleId}
                            className="font-serif text-[26px] leading-[1.1] font-normal tracking-[-0.01em] text-ink md:text-[30px]"
                        >
                            <Trans i18nKey="consent.heading" components={HEADLINE_COMPONENTS} />
                        </h2>
                        <p className="font-sans text-[14px] leading-[1.55] text-ink-secondary md:leading-[1.6]">
                            <Trans
                                i18nKey="consent.description"
                                components={{
                                    1: (
                                        <Link
                                            to="/$lng/privacy"
                                            className={CONSENT_LINK_CLASS}
                                            params={true}
                                            from="/$lng"
                                        />
                                    ),
                                }}
                            />
                        </p>
                        <CookieSettingsNote className="hidden text-[13px] md:block" />
                    </div>

                    <div className="flex flex-col border-y border-line-subtle md:border-b-0">
                        <button
                            type="button"
                            aria-expanded={purposesOpen}
                            aria-controls={purposesId}
                            onClick={() => setPurposesOpen((open) => !open)}
                            className="flex min-h-12 cursor-pointer items-center justify-between gap-3 text-left font-sans text-[14px] font-medium text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass md:hidden"
                        >
                            {purposesOpen ? t("consent.hidePurposes") : t("consent.choosePurposes")}
                            <ChevronDown
                                aria-hidden="true"
                                className={cn(
                                    "size-4 flex-none transition-transform motion-reduce:transition-none",
                                    purposesOpen && "rotate-180",
                                )}
                                strokeWidth={1.5}
                            />
                        </button>
                        <div
                            id={purposesId}
                            className={cn("flex-col", purposesOpen ? "flex" : "hidden md:flex")}
                        >
                            <ConsentPurposeRow
                                id={`${idPrefix}-analytics`}
                                label={t("consent.analyticsLabel")}
                                description={t("consent.analyticsDescription")}
                                checked={analyticsSelected}
                                onCheckedChange={setAnalyticsSelected}
                            />
                            <ConsentPurposeRow
                                id={`${idPrefix}-maps`}
                                label={t("consent.externalMapsLabel")}
                                description={t("consent.externalMapsDescription")}
                                checked={externalMapsSelected}
                                onCheckedChange={setExternalMapsSelected}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 md:-mt-2 md:flex-row md:items-center md:justify-between md:gap-4 md:border-t md:border-line-subtle md:pt-5">
                    <button
                        type="button"
                        onClick={() => decide(analyticsSelected, externalMapsSelected)}
                        className={cn(
                            CONSENT_SELECTION_BUTTON_CLASS,
                            "w-full md:inline-flex md:w-auto",
                            !purposesOpen && "hidden",
                        )}
                    >
                        {t("consent.saveSelection")}
                    </button>
                    <div className="grid grid-cols-2 gap-2.5 md:flex md:gap-3">
                        <button
                            type="button"
                            onClick={() => decide(false, false)}
                            className={CONSENT_DECISION_BUTTON_CLASS}
                        >
                            {t("consent.rejectAll")}
                        </button>
                        <button
                            type="button"
                            onClick={() => decide(true, true)}
                            className={CONSENT_DECISION_BUTTON_CLASS}
                        >
                            {t("consent.acceptAll")}
                        </button>
                    </div>
                </div>

                <CookieSettingsNote className="text-center text-[12px] md:hidden" />
            </section>
        </div>
    );
}
