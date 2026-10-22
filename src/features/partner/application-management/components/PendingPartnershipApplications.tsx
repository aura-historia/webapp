import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import {
    applicationName,
    canWithdrawApplication,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { cn } from "@/lib/utils.ts";
import { usePartnerApplications } from "../api/usePartnerApplications.ts";
import { BUSINESS_STATE_TRANSLATION_KEY } from "../lib/partnerApplicationHelpers.ts";

const PANEL_CLASS =
    "flex flex-col gap-3 rounded-lg p-4 shadow-[inset_0_0_0_1px_var(--line)] sm:gap-2.5";

export function PendingPartnershipApplications({ enabled }: { readonly enabled: boolean }) {
    const { t } = useTranslation();
    const { data: applications = [], isError, refetch } = usePartnerApplications(enabled);
    if (!enabled) return null;
    if (isError)
        return (
            <div role="alert" className={PANEL_CLASS}>
                <p className="text-body-sm text-ink">{t("partnerApplications.loadError")}</p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className={cn(
                        "inline-flex h-11 cursor-pointer items-center self-start rounded-pill px-5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)]",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {t("partnerApplications.actions.retry")}
                </button>
            </div>
        );
    const pending = applications.filter(canWithdrawApplication);
    if (pending.length === 0) return null;
    return (
        <div className={PANEL_CLASS}>
            <p className="font-mono text-label text-ink-muted uppercase">
                {t("partnerApplications.title")}
            </p>
            <ul className="flex flex-col">
                {pending.map((application) => (
                    <li
                        key={application.id}
                        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-dashed border-line-strong py-2.5"
                    >
                        <Link
                            to="/$lng/partners/applications"
                            params={true}
                            from="/$lng"
                            className={cn(
                                "text-body-sm break-all text-ink underline underline-offset-3",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {applicationName(application)}
                        </Link>
                        <span className="rounded-sm bg-brass px-[7px] py-[3px] font-mono text-tag text-[#170D0E] uppercase">
                            {t(BUSINESS_STATE_TRANSLATION_KEY[application.state])}
                        </span>
                    </li>
                ))}
            </ul>
            <p className="text-meta text-ink-muted">
                {t("partnerApplications.proposals.selectionHint")}
            </p>
        </div>
    );
}
