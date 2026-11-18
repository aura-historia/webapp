import { Link } from "@tanstack/react-router";
import { Link2, Trash2 } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import {
    PRIMARY_BUTTON_CLASS,
    SECONDARY_BUTTON_CLASS,
} from "@/features/content-notice/lib/contentNoticeStyles.ts";
import type { ContentNoticeTargetKind } from "@/features/content-notice/lib/contentNoticeTarget.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const PANEL_CLASS =
    "flex flex-col items-center gap-4 rounded-card px-6 py-12 text-center shadow-[inset_0_0_0_1px_var(--line)] sm:px-10";

const ICON_CLASS =
    "inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-secondary shadow-ring";

/** The listing or provider no longer exists or was withdrawn (404 on load or on submit). */
export function ContentNoticeTargetGone({ kind }: { readonly kind: ContentNoticeTargetKind }) {
    const { t } = useTranslation();
    return (
        <div role="alert" className={PANEL_CLASS}>
            <span aria-hidden="true" className={ICON_CLASS}>
                <Trash2 className="size-[22px]" strokeWidth={1.6} />
            </span>
            <h2 className="font-serif text-[30px] leading-[1.15] font-normal tracking-[-0.01em] [&_em]:italic">
                <Trans
                    i18nKey={`contentNotice.notFound.${kind}Title`}
                    components={HEADLINE_COMPONENTS}
                />
            </h2>
            <p className="max-w-[440px] text-body text-ink-secondary">
                {t(`contentNotice.notFound.${kind}Body`)}
            </p>
            <Link
                to="/$lng/search"
                params={true}
                from="/$lng"
                className={cn(SECONDARY_BUTTON_CLASS, "h-11 px-[22px] text-sm")}
            >
                {t("contentNotice.notFound.search")}
            </Link>
        </div>
    );
}

/** The form was opened without a listing or provider in the link. */
export function ContentNoticeMissingTarget() {
    const { t } = useTranslation();
    return (
        <div className={PANEL_CLASS}>
            <span aria-hidden="true" className={ICON_CLASS}>
                <Link2 className="size-[22px]" strokeWidth={1.6} />
            </span>
            <h2 className="font-serif text-[30px] leading-[1.15] font-normal tracking-[-0.01em] [&_em]:italic">
                <Trans i18nKey="contentNotice.missing.title" components={HEADLINE_COMPONENTS} />
            </h2>
            <p className="max-w-[460px] text-body text-ink-secondary">
                {t("contentNotice.missing.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                <Link
                    to="/$lng/search"
                    params={true}
                    from="/$lng"
                    className={cn(PRIMARY_BUTTON_CLASS, "h-11 w-auto px-[22px] text-sm")}
                >
                    {t("contentNotice.missing.searchListings")}
                </Link>
                <Link
                    to="/$lng/search/shops"
                    search={{ q: "" }}
                    params={true}
                    from="/$lng"
                    className={cn(SECONDARY_BUTTON_CLASS, "h-11 px-[22px] text-sm")}
                >
                    {t("contentNotice.missing.searchProviders")}
                </Link>
            </div>
            <p className="text-meta text-ink-muted">
                {t("contentNotice.missing.contact", { email: CONTACT_EMAIL })}
            </p>
        </div>
    );
}
