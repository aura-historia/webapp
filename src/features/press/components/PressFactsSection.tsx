import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SOCIAL_LINKS } from "@/features/app-shell/components/footer/Footer.data.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { PressCatalogueFigures } from "@/features/press/components/PressCatalogueFigures.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import { PRESS_FACTS, PRESS_SECTION_IDS } from "@/features/press/config/pressPage.data.ts";
import { PRESS_LABEL_CLASS } from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

/** I — Fact sheet: the live catalogue figures with their date, the facts, the social profiles. */
export function PressFactsSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={PRESS_SECTION_IDS.facts}
            labelledBy="press-facts-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-facts-heading"
                eyebrow={`I — ${t("pressPage.facts.eyebrow")}`}
                titleKey="pressPage.facts.title"
                intro={t("pressPage.facts.description")}
            />
            <PressCatalogueFigures />
            <dl className="grid border-b border-line min-[900px]:grid-cols-2 min-[900px]:gap-x-12">
                {PRESS_FACTS.map((fact) => (
                    <div
                        key={fact}
                        className="grid gap-x-5 gap-y-1.5 border-t border-line py-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-baseline"
                    >
                        <dt className={PRESS_LABEL_CLASS}>
                            {t(`pressPage.facts.items.${fact}.label`)}
                        </dt>
                        <dd className="text-body text-ink">
                            {t(`pressPage.facts.items.${fact}.value`)}
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-0">
                <span className={PRESS_LABEL_CLASS}>{t("pressPage.facts.socialLabel")}</span>
                {SOCIAL_LINKS.map((social) => (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "inline-flex min-h-11 items-center gap-1.5 rounded-xs text-body-sm text-ink-secondary underline-offset-4 hover:underline",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        {social.name}
                        <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={1.8} />
                    </a>
                ))}
            </div>
        </LandingSection>
    );
}
