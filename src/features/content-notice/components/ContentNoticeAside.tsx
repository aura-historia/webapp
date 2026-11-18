import { Trans, useTranslation } from "react-i18next";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import {
    MONO_LABEL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/content-notice/lib/contentNoticeStyles.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";

const STEPS = [
    { numeral: "I", key: "confirmation" },
    { numeral: "II", key: "review" },
    { numeral: "III", key: "decision" },
] as const;

/**
 * "How we handle your notice": receipt, review by a person (no automated decisions, Art. 16(6)
 * DSA) and the decision by e-mail. No time frame and no partner programme.
 */
export function ContentNoticeAside() {
    const { t } = useTranslation();
    return (
        <aside
            aria-labelledby="content-notice-how"
            className="flex flex-col gap-5 rounded-panel bg-surface-raised p-5 shadow-ring lg:sticky lg:top-24 lg:p-6"
        >
            <span className={MONO_LABEL_CLASS}>{t("contentNotice.aside.eyebrow")}</span>
            <h2
                id="content-notice-how"
                className="font-serif text-2xl leading-[1.2] font-normal tracking-[-0.01em] [&_em]:italic"
            >
                <Trans i18nKey="contentNotice.aside.title" components={HEADLINE_COMPONENTS} />
            </h2>
            <ol className="m-0 flex list-none flex-col border-t border-line-subtle p-0">
                {STEPS.map((step) => (
                    <li
                        key={step.key}
                        className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5 border-b border-line-subtle py-3.5"
                    >
                        <span
                            aria-hidden="true"
                            className="font-serif text-[17px] leading-[1.3] text-brass-ink italic"
                        >
                            {step.numeral}
                        </span>
                        <span className="flex flex-col gap-1">
                            <span className="text-sm leading-[1.4] font-medium">
                                {t(`contentNotice.aside.steps.${step.key}.title`)}
                            </span>
                            <span className="text-meta leading-[1.55] text-ink-secondary">
                                {t(`contentNotice.aside.steps.${step.key}.text`)}
                            </span>
                        </span>
                    </li>
                ))}
            </ol>
            <p className="text-meta leading-[1.6] text-ink-muted">
                <Trans
                    i18nKey="contentNotice.aside.fallback"
                    values={{ email: CONTACT_EMAIL }}
                    components={{
                        email: (
                            <a href={`mailto:${CONTACT_EMAIL}`} className={TEXT_LINK_CLASS}>
                                {CONTACT_EMAIL}
                            </a>
                        ),
                    }}
                />
            </p>
        </aside>
    );
}
