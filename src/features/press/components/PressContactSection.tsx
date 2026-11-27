import { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";

import { CopyTextButton } from "@/components/common/CopyTextButton.tsx";
import {
    CONTACT_EMAIL,
    NAV_FOCUS_CLASS,
} from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { PRESS_SECTION_IDS } from "@/features/press/config/pressPage.data.ts";
import {
    PRESS_INTRO_CLASS,
    PRESS_LABEL_CLASS,
    PRESS_SPLIT_CLASS,
} from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

const CONTACT_ROWS = ["person", "basedIn"] as const;

/** Ink closing band: one address for every press enquiry, with Copy, and who answers it. */
export function PressContactSection() {
    const { t } = useTranslation();
    const emailRef = useRef<HTMLAnchorElement>(null);

    return (
        <section
            aria-labelledby="press-contact-heading"
            data-theme="dark"
            className="bg-surface px-(--page-gutter) pt-16 pb-[72px] text-ink sm:py-[clamp(64px,8vw,112px)]"
        >
            <div
                id={PRESS_SECTION_IDS.contact}
                className={cn(
                    PRESS_SPLIT_CLASS,
                    "mx-auto w-full max-w-content scroll-mt-(--anchor-offset) gap-8",
                )}
            >
                <div className="flex flex-col gap-4 sm:gap-5">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-brass-light uppercase sm:text-eyebrow">
                        {t("pressPage.contact.eyebrow")}
                    </p>
                    <h2
                        id="press-contact-heading"
                        className="font-serif text-[38px] leading-[1.04] font-normal tracking-[-0.02em] text-balance sm:text-display-section [&_em]:text-brass-light [&_em]:italic"
                    >
                        <Trans i18nKey="pressPage.contact.title" components={HEADLINE_COMPONENTS} />
                    </h2>
                    <p className={PRESS_INTRO_CLASS}>{t("pressPage.contact.description")}</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3 rounded-panel bg-surface-raised py-2.5 pr-2.5 pl-5 shadow-ring">
                        <a
                            ref={emailRef}
                            href={`mailto:${CONTACT_EMAIL}`}
                            className={cn(
                                "inline-flex min-h-11 min-w-0 flex-1 items-center font-serif text-xl [overflow-wrap:anywhere] underline-offset-4 hover:underline sm:text-[26px]",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {CONTACT_EMAIL}
                        </a>
                        <CopyTextButton
                            text={CONTACT_EMAIL}
                            targetRef={emailRef}
                            label={t("pressPage.contact.copyLabel")}
                            copiedLabel={t("pressPage.contact.copiedLabel")}
                        />
                    </div>
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 text-body-sm">
                        {CONTACT_ROWS.map((row) => (
                            <div key={row} className="contents">
                                <dt className={cn(PRESS_LABEL_CLASS, "pt-0.5")}>
                                    {t(`pressPage.contact.${row}.label`)}
                                </dt>
                                <dd>{t(`pressPage.contact.${row}.value`)}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
