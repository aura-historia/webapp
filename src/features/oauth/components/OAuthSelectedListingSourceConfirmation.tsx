import { useTranslation } from "react-i18next";
import {
    SOURCE_OPTION_CLASS,
    SOURCE_OPTION_SELECTED_CLASS,
} from "@/features/oauth/components/OAuthListingSourceSelection.tsx";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import { CONSENT_HEADING_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";
import { cn } from "@/lib/utils.ts";

interface OAuthSelectedListingSourceConfirmationProps {
    readonly listingSource: OAuthListingSource;
    readonly hint?: string;
}

/** The only granted provider, shown as the selected option; there is nothing else to choose. */
export function OAuthSelectedListingSourceConfirmation({
    listingSource,
    hint,
}: OAuthSelectedListingSourceConfirmationProps) {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col gap-3">
            <h3 className={CONSENT_HEADING_CLASS}>
                {t("oauth.authorize.listingSources.selectedLabel")}
            </h3>
            <div className="flex flex-col gap-1">
                <p className="text-meta leading-[1.6] text-ink-secondary">
                    {t("oauth.authorize.listingSources.description")}
                </p>
                {hint && <p className="text-meta leading-[1.6] font-medium text-ink">{hint}</p>}
            </div>
            <div className={cn(SOURCE_OPTION_CLASS, SOURCE_OPTION_SELECTED_CLASS)}>
                <span
                    aria-hidden="true"
                    className="size-[18px] rounded-pill bg-surface-raised shadow-[inset_0_0_0_5px_var(--oxblood)]"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[15px] leading-[1.4] font-medium text-ink">
                        {listingSource.name}
                    </span>
                    <code className="font-mono text-xs leading-[1.4] break-all text-ink-muted">
                        {listingSource.listingSourceId}
                    </code>
                </span>
            </div>
        </section>
    );
}
