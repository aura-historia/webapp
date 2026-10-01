import { useTranslation } from "react-i18next";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";

interface OAuthSelectedListingSourceConfirmationProps {
    readonly listingSource: OAuthListingSource;
}

export function OAuthSelectedListingSourceConfirmation({
    listingSource,
}: OAuthSelectedListingSourceConfirmationProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
            <p className="text-xs font-medium text-muted-foreground">
                {t("oauth.authorize.listingSources.selectedLabel")}
            </p>
            <p className="mt-1 text-sm font-medium">{listingSource.name}</p>
        </div>
    );
}
