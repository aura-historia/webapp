import { Download } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { OnThisPageNav } from "@/components/common/OnThisPageNav.tsx";
import { OUTLINE_PILL_BUTTON_CLASS } from "@/components/common/outlinePillButtonClass.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { BRAND_KIT_URL, PRESS_SECTION_IDS } from "@/features/press/config/pressPage.data.ts";
import { cn } from "@/lib/utils.ts";

/** Ink hero: what the page is for, the brand kit download, the press contact and the chapters. */
export function PressHeroSection() {
    const { t } = useTranslation();

    return (
        <section
            aria-labelledby="press-title"
            data-theme="dark"
            className="bg-surface px-(--page-gutter) pt-14 pb-8 text-ink sm:pt-[clamp(72px,9vw,128px)] sm:pb-[clamp(40px,4vw,56px)]"
        >
            <div className="mx-auto flex w-full max-w-content flex-col gap-5 sm:gap-7">
                <p className="font-mono text-[11px] tracking-[0.2em] text-brass-light uppercase sm:text-eyebrow">
                    {t("pressPage.hero.eyebrow")}
                </p>
                <h1
                    id="press-title"
                    className="max-w-[980px] font-serif text-[44px] leading-none font-normal tracking-[-0.025em] text-balance sm:text-[clamp(48px,6.4vw,96px)] [&_em]:text-brass-light [&_em]:italic"
                >
                    <Trans i18nKey="pressPage.hero.title" components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="max-w-[720px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                    {t("pressPage.hero.subtitle")}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <a
                        href={BRAND_KIT_URL}
                        download
                        className={cn(
                            "inline-flex h-12 items-center gap-2.5 rounded-pill bg-ink px-[22px] text-[15px] font-medium text-surface",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        <Download aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        {t("pressPage.hero.downloadKit")}
                    </a>
                    <a
                        href={`#${PRESS_SECTION_IDS.contact}`}
                        className={cn(OUTLINE_PILL_BUTTON_CLASS, "h-12 px-[22px] text-[15px]")}
                    >
                        {t("pressPage.hero.contactLink")}
                    </a>
                    <p className="basis-full font-mono text-label text-ink-muted uppercase">
                        {t("pressPage.hero.kitNote")}
                    </p>
                </div>
                <OnThisPageNav
                    label={t("pressPage.hero.navLabel")}
                    links={Object.values(PRESS_SECTION_IDS).map((id) => ({
                        id,
                        label: t(`pressPage.hero.nav.${id}`),
                    }))}
                />
            </div>
        </section>
    );
}
