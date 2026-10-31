import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { ABOUT_SECTION_IDS } from "@/features/about/config/aboutPage.data";
import { ABOUT_SPLIT_CLASS, ABOUT_TEXT_LINK_CLASS } from "@/features/about/lib/aboutStyles.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { env } from "@/env";
import { cn } from "@/lib/utils.ts";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

const SERVICES = [
    { id: "search", to: "/$lng/search" },
    { id: "watchlist", to: "/$lng/me/watchlist" },
    { id: "alerts", to: "/$lng/me/search-filters" },
    { id: "partners", to: "/$lng/partner-program" },
] as const;

/** I — Services: one numbered column per service, each closing with a link to it. */
export function AboutServicesSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={ABOUT_SECTION_IDS.services}
            labelledBy="about-services-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <div className={cn(ABOUT_SPLIT_CLASS, "items-end")}>
                <SectionHeading
                    id="about-services-heading"
                    eyebrow={`I — ${t("aboutPage.services.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="aboutPage.services.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className="max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg">
                    {t("aboutPage.services.description")}
                </p>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-7 min-[1180px]:grid-cols-4">
                {SERVICES.map((service, index) => (
                    <li
                        key={service.id}
                        className="flex flex-col gap-2.5 border-t border-ink pt-[22px] pb-6 sm:gap-3 sm:pt-6 sm:pb-9"
                    >
                        <span
                            aria-hidden="true"
                            className="font-mono text-[11px] tracking-[0.14em] text-brass-ink sm:text-xs"
                        >
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-serif text-2xl leading-[1.15] font-normal sm:text-title-md">
                            {t(`aboutPage.services.items.${service.id}.title`)}
                        </h3>
                        <p className="text-body text-ink-secondary">
                            {t(`aboutPage.services.items.${service.id}.description`)}
                        </p>
                        {(service.to !== "/$lng/search" || isSearchEnabled) && (
                            <Link
                                to={service.to}
                                params={true}
                                from="/$lng"
                                className={cn(
                                    ABOUT_TEXT_LINK_CLASS,
                                    "mt-auto pt-2 text-body-sm",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t(`aboutPage.services.items.${service.id}.cta`)}
                                <ArrowRight
                                    className="size-[15px]"
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </LandingSection>
    );
}
