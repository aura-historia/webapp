import { Link } from "@tanstack/react-router";
import { Flag } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentNoticeSearch } from "@/features/content-notice/lib/contentNoticeSearch.ts";
import { REPORT_LINK_CLASS } from "@/features/content-notice/lib/contentNoticeStyles.ts";
import { cn } from "@/lib/utils.ts";

/**
 * "Report this listing / provider": the notice mechanism of Art. 16 DSA, visible without any
 * interaction and close to the content (Recital 50), on every listing and provider page, partner
 * or not. Opens the notice form with the target pre-filled.
 */
export function ContentNoticeReportLink({
    kind,
    search,
    className,
}: {
    readonly kind: "listing" | "provider";
    readonly search: ContentNoticeSearch;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    return (
        <Link
            to="/$lng/content-notice"
            params={true}
            from="/$lng"
            search={search}
            className={cn(REPORT_LINK_CLASS, className)}
        >
            <Flag aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.7} />
            {t(
                kind === "listing"
                    ? "contentNotice.entry.reportListing"
                    : "contentNotice.entry.reportProvider",
            )}
        </Link>
    );
}
