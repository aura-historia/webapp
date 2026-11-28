import { useTranslation } from "react-i18next";

import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import { PRESS_SECTION_IDS, PRESS_USAGE } from "@/features/press/config/pressPage.data.ts";
import { PRESS_LABEL_CLASS, PRESS_RULED_ROW_CLASS } from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

const GROUPS = [
    { id: "allowed", dot: "bg-ink" },
    { id: "notAllowed", dot: "shadow-[inset_0_0_0_1.5px_var(--ink-muted)]" },
] as const;

/** VII — Usage: what the kit may be used for, what needs permission, and third-party marks. */
export function PressUsageSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="raised"
            id={PRESS_SECTION_IDS.usage}
            labelledBy="press-usage-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-usage-heading"
                eyebrow={`VII — ${t("pressPage.usage.eyebrow")}`}
                titleKey="pressPage.usage.title"
                intro={t("pressPage.usage.description")}
            />
            <div className="grid gap-x-12 gap-y-9 min-[900px]:grid-cols-2">
                {GROUPS.map((group) => (
                    <div key={group.id} className="flex flex-col gap-3">
                        <h3 className={cn(PRESS_LABEL_CLASS, "font-normal")}>
                            {t(`pressPage.usage.${group.id}.heading`)}
                        </h3>
                        <ul className="border-b border-line">
                            {PRESS_USAGE[group.id].map((item) => (
                                <li key={item} className={PRESS_RULED_ROW_CLASS}>
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "size-1.5 -translate-y-0.5 rounded-full",
                                            group.dot,
                                        )}
                                    />
                                    <span>{t(`pressPage.usage.${group.id}.items.${item}`)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <p className="max-w-[820px] text-body-sm text-ink-muted">
                {t("pressPage.usage.thirdParty")}
            </p>
        </LandingSection>
    );
}
