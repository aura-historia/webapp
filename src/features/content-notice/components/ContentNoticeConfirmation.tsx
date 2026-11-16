import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import type { ContentNoticeSubmission } from "@/features/content-notice/components/ContentNoticeForm.tsx";
import { ContentNoticeBackLink } from "@/features/content-notice/components/ContentNoticeBackLink.tsx";
import {
    FOCUS_CLASS,
    MONO_LABEL_CLASS,
    SECONDARY_BUTTON_CLASS,
} from "@/features/content-notice/lib/contentNoticeStyles.ts";
import type { ContentNoticeTarget } from "@/features/content-notice/lib/contentNoticeTarget.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const REASON_KEYS = {
    PROVIDER_OPT_OUT: "providerOptOut",
    RIGHTS_INFRINGEMENT: "rightsInfringement",
    ILLEGAL_CONTENT: "illegalContent",
    INCORRECT_INFORMATION: "incorrectInformation",
    OTHER: "other",
} as const;

/**
 * Shown after the `202` (board "Content notice · Confirmation"): the receipt e-mail is on its way
 * and the decision follows by e-mail. No time frame, no reference (the response has none; the
 * e-mail carries it). Focus moves to the heading.
 */
export function ContentNoticeConfirmation({
    target,
    submission,
}: {
    readonly target: ContentNoticeTarget;
    readonly submission: ContentNoticeSubmission;
}) {
    const { t } = useTranslation();
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        window.scrollTo({ top: 0 });
        headingRef.current?.focus();
    }, []);

    const wholeProvider = submission.scope === "provider" || target.kind === "provider";
    const targetValue = wholeProvider
        ? t("contentNotice.confirmation.allListings", { provider: target.providerName })
        : t("contentNotice.confirmation.listingValue", {
              title:
                  target.kind === "listing"
                      ? (target.title ?? t("contentNotice.target.untitled"))
                      : "",
              provider: target.providerName,
          });

    return (
        <div className="mx-auto w-full max-w-[760px] px-(--page-gutter) pt-10 pb-16 sm:pt-24 sm:pb-36">
            <div className="flex flex-col items-start gap-5">
                <span
                    aria-hidden="true"
                    className="inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                >
                    <Check className="size-6" strokeWidth={2.2} />
                </span>
                <span className="font-mono text-xs tracking-[0.2em] text-brass-ink uppercase">
                    {t("contentNotice.confirmation.eyebrow")}
                </span>
                <h1
                    ref={headingRef}
                    tabIndex={-1}
                    className={cn(
                        "font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] text-balance sm:text-[clamp(44px,4.6vw,64px)] [&_em]:italic",
                        FOCUS_CLASS,
                    )}
                >
                    <Trans
                        i18nKey="contentNotice.confirmation.title"
                        components={HEADLINE_COMPONENTS}
                    />
                </h1>
                <output className="block max-w-[620px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lg">
                    <Trans
                        i18nKey="contentNotice.confirmation.body"
                        values={{ email: submission.email }}
                        components={{
                            email: <strong className="font-semibold break-all text-ink" />,
                        }}
                    />
                </output>
            </div>

            <dl className="mt-9 rounded-panel bg-surface-raised shadow-ring">
                <ConfirmationRow
                    label={t(
                        wholeProvider
                            ? "contentNotice.target.provider"
                            : "contentNotice.target.listing",
                    )}
                    value={targetValue}
                />
                <ConfirmationRow
                    label={t("contentNotice.confirmation.reason")}
                    value={t(
                        `contentNotice.reasons.${REASON_KEYS[submission.reasonCategory]}.label`,
                    )}
                />
                <ConfirmationRow
                    label={t("contentNotice.confirmation.next")}
                    value={t("contentNotice.confirmation.nextText")}
                    muted
                    last
                />
            </dl>

            <p className="mt-5 text-meta leading-[1.6] text-ink-muted">
                {t("contentNotice.confirmation.spam", { email: CONTACT_EMAIL })}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ContentNoticeBackLink target={target} variant="button" />
                <Link
                    to="/$lng/search"
                    params={true}
                    from="/$lng"
                    className={SECONDARY_BUTTON_CLASS}
                >
                    {t("contentNotice.confirmation.continue")}
                </Link>
            </div>
        </div>
    );
}

function ConfirmationRow({
    label,
    value,
    muted = false,
    last = false,
}: {
    readonly label: string;
    readonly value: string;
    readonly muted?: boolean;
    readonly last?: boolean;
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-x-4 gap-y-1 px-5 py-4 sm:grid-cols-[110px_minmax(0,1fr)]",
                !last && "border-b border-line-subtle",
            )}
        >
            <dt className={cn(MONO_LABEL_CLASS, "leading-[1.8]")}>{label}</dt>
            <dd
                className={cn(
                    "m-0 text-[15px] leading-normal",
                    muted ? "text-ink-secondary" : "text-ink",
                )}
            >
                {value}
            </dd>
        </div>
    );
}
