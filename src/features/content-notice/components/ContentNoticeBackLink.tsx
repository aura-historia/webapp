import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    FOCUS_CLASS,
    PRIMARY_BUTTON_CLASS,
} from "@/features/content-notice/lib/contentNoticeStyles.ts";
import type { ContentNoticeTarget } from "@/features/content-notice/lib/contentNoticeTarget.ts";
import { cn } from "@/lib/utils.ts";

/** "Back to the listing / provider": a quiet link above the header, or the confirmation's main action. */
export function ContentNoticeBackLink({
    target,
    variant,
}: {
    readonly target: ContentNoticeTarget;
    readonly variant: "link" | "button";
}) {
    const { t } = useTranslation();
    const className =
        variant === "button"
            ? PRIMARY_BUTTON_CLASS
            : cn(
                  "-mt-3 mb-2 inline-flex min-h-11 items-center gap-1.5 self-start text-sm text-ink-secondary hover:text-ink",
                  FOCUS_CLASS,
              );
    const content = (
        <>
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t(
                target.kind === "listing"
                    ? "contentNotice.backToListing"
                    : "contentNotice.backToProvider",
            )}
        </>
    );

    return target.kind === "listing" ? (
        <Link
            to="/$lng/products/$productListingTitleSlugId"
            from="/$lng"
            params={(current) => ({
                ...current,
                productListingTitleSlugId: target.productListingTitleSlugId,
            })}
            className={className}
        >
            {content}
        </Link>
    ) : (
        <Link
            to="/$lng/shops/$shopSlugId"
            from="/$lng"
            params={(current) => ({ ...current, shopSlugId: target.providerSlugId })}
            className={className}
        >
            {content}
        </Link>
    );
}
