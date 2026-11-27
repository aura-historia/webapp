import { useTranslation } from "react-i18next";

import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { PressBoilerplateCard } from "@/features/press/components/PressBoilerplateCard.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import { PRESS_SECTION_IDS } from "@/features/press/config/pressPage.data.ts";
import { PRESS_CARD_TITLE_CLASS } from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

const NAMING_RULES = ["name", "role"] as const;

const RULE_ROW_CLASS =
    "grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-4 border-t py-4 text-body";
const RULE_TERM_CLASS = "inline-flex items-center gap-2 font-mono text-label uppercase";

/** II — Boilerplate: a short and a long description to copy, then how to name and describe us. */
export function PressDescriptionsSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="raised"
            id={PRESS_SECTION_IDS.descriptions}
            labelledBy="press-descriptions-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-descriptions-heading"
                eyebrow={`II — ${t("pressPage.descriptions.eyebrow")}`}
                titleKey="pressPage.descriptions.title"
                intro={t("pressPage.descriptions.description")}
            />
            <div className="grid gap-5 min-[1080px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <PressBoilerplateCard length="short" />
                <PressBoilerplateCard length="long" />
            </div>
            <div className="grid gap-x-12 gap-y-9 min-[900px]:grid-cols-2">
                {NAMING_RULES.map((rule) => (
                    <div key={rule} className="flex flex-col gap-4">
                        <h3 className={cn(PRESS_CARD_TITLE_CLASS, "sm:text-title-md")}>
                            {t(`pressPage.descriptions.naming.${rule}.title`)}
                        </h3>
                        <dl className="border-b border-line">
                            <div className={cn(RULE_ROW_CLASS, "border-ink")}>
                                <dt className={cn(RULE_TERM_CLASS, "text-ink")}>
                                    <span
                                        aria-hidden="true"
                                        className="size-2 rounded-full bg-ink"
                                    />
                                    {t("pressPage.descriptions.naming.write")}
                                </dt>
                                <dd>{t(`pressPage.descriptions.naming.${rule}.write`)}</dd>
                            </div>
                            <div className={cn(RULE_ROW_CLASS, "border-line")}>
                                <dt className={cn(RULE_TERM_CLASS, "text-ink-muted")}>
                                    <span
                                        aria-hidden="true"
                                        className="size-2 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink-muted)]"
                                    />
                                    {t("pressPage.descriptions.naming.avoid")}
                                </dt>
                                <dd className="text-ink-secondary">
                                    {t(`pressPage.descriptions.naming.${rule}.avoid`)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                ))}
            </div>
        </LandingSection>
    );
}
