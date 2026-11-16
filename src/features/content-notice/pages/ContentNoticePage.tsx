import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ContentNoticeAside } from "@/features/content-notice/components/ContentNoticeAside.tsx";
import { ContentNoticeBackLink } from "@/features/content-notice/components/ContentNoticeBackLink.tsx";
import { ContentNoticeConfirmation } from "@/features/content-notice/components/ContentNoticeConfirmation.tsx";
import {
    ContentNoticeForm,
    type ContentNoticeSubmission,
} from "@/features/content-notice/components/ContentNoticeForm.tsx";
import {
    ContentNoticeMissingTarget,
    ContentNoticeTargetGone,
} from "@/features/content-notice/components/ContentNoticeStatePanel.tsx";
import type { ContentNoticeLoaderData } from "@/features/content-notice/lib/contentNoticeTarget.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";

const PAGE_COLUMN_CLASS =
    "mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter)";

/**
 * Notice and removal form (Art. 16 DSA, #1326; Redesign, Legal page, "Content notice" rows):
 * header, the form beside a "How we handle your notice" panel from 1024px, then the confirmation.
 */
export function ContentNoticePage({ data }: { readonly data: ContentNoticeLoaderData }) {
    const { t } = useTranslation();
    const [submission, setSubmission] = useState<ContentNoticeSubmission | null>(null);
    const [targetGone, setTargetGone] = useState(false);

    if (data.status === "ready" && submission) {
        return <ContentNoticeConfirmation target={data.target} submission={submission} />;
    }

    return (
        <div className={`${PAGE_COLUMN_CLASS} pt-7 pb-16 sm:pt-12 sm:pb-36`}>
            {data.status === "ready" && (
                <ContentNoticeBackLink target={data.target} variant="link" />
            )}
            <header className="mb-9 flex flex-col gap-4 border-b border-line-subtle pb-7 sm:mb-14 sm:pb-9">
                <span className="font-mono text-xs tracking-[0.2em] text-brass-ink uppercase">
                    {t("contentNotice.eyebrow")}
                </span>
                <h1 className="font-serif text-[40px] leading-[1.02] font-normal tracking-[-0.02em] text-balance sm:text-[clamp(40px,4.6vw,68px)] [&_em]:italic">
                    <Trans i18nKey="contentNotice.title" components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="max-w-[720px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-[clamp(17px,1.5vw,20px)]">
                    {t("contentNotice.lead")}
                </p>
            </header>

            {data.status === "missing" && <ContentNoticeMissingTarget />}
            {data.status === "notFound" && <ContentNoticeTargetGone kind={data.kind} />}
            {data.status === "ready" && (
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
                    <div className="min-w-0 max-w-[760px]">
                        {targetGone ? (
                            <ContentNoticeTargetGone kind={data.target.kind} />
                        ) : (
                            <ContentNoticeForm
                                target={data.target}
                                onSubmitted={setSubmission}
                                onTargetGone={() => setTargetGone(true)}
                            />
                        )}
                    </div>
                    <ContentNoticeAside />
                </div>
            )}
        </div>
    );
}
