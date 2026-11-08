import { useId } from "react";
import { useTranslation } from "react-i18next";
import { OAuthScopeItem } from "@/features/oauth/components/OAuthScopeItem.tsx";
import { CONSENT_HEADING_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";

interface OAuthRequestedScopesProps {
    readonly requestedScopes: readonly string[];
}

export function OAuthRequestedScopes({ requestedScopes }: OAuthRequestedScopesProps) {
    const { t } = useTranslation();
    const headingId = useId();

    if (requestedScopes.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 id={headingId} className={CONSENT_HEADING_CLASS}>
                {t("oauth.authorize.scopesTitle")}
            </h3>
            <ul aria-labelledby={headingId}>
                {requestedScopes.map((scope) => (
                    <OAuthScopeItem key={scope} scope={scope} />
                ))}
            </ul>
        </div>
    );
}
