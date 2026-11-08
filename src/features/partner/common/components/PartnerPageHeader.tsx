import type { ReactNode } from "react";
import { Trans } from "react-i18next";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { PAGE_TITLE_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";

/** A dashboard page's header: serif title with an italic close, a lead and the page's main action. */
export function PartnerPageHeader({
    titleKey,
    lead,
    action,
}: {
    readonly titleKey: string;
    readonly lead: string;
    readonly action?: ReactNode;
}) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-7 sm:pb-9">
            <div className="flex max-w-[640px] flex-col gap-4">
                <h1 className={PAGE_TITLE_CLASS}>
                    <Trans i18nKey={titleKey} components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="text-body-sm text-ink-secondary sm:text-body">{lead}</p>
            </div>
            {action && (
                <div className="flex w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{action}</div>
            )}
        </header>
    );
}
