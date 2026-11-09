import { useTranslation } from "react-i18next";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import { CONSENT_PANEL_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";
import { cn } from "@/lib/utils.ts";

/** Says that a provider was granted while the consent page was open without one. */
export function OAuthGrantedAccessNote({
    listingSources,
}: {
    readonly listingSources: readonly OAuthListingSource[];
}) {
    const { t } = useTranslation();
    return (
        <p
            role="status"
            className={cn(
                CONSENT_PANEL_CLASS,
                "flex-row items-start gap-2.5 px-4 py-3.5 text-sm leading-[1.55] text-ink-secondary",
            )}
        >
            <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-pill bg-ink" />
            <span>
                <span className="font-medium text-ink">
                    {listingSources.length === 1
                        ? t("oauth.authorize.noProvider.granted.one", {
                              name: listingSources[0].name,
                          })
                        : t("oauth.authorize.noProvider.granted.other")}
                </span>{" "}
                {t("oauth.authorize.noProvider.granted.description")}
            </span>
        </p>
    );
}
