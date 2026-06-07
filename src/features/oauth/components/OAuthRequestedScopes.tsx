import { useTranslation } from "react-i18next";
import { OAuthScopeItem } from "@/features/oauth/components/OAuthScopeItem.tsx";

interface OAuthRequestedScopesProps {
    readonly requestedScopes: readonly string[];
}

export function OAuthRequestedScopes({ requestedScopes }: OAuthRequestedScopesProps) {
    const { t } = useTranslation();

    if (requestedScopes.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-primary">{t("oauth.authorize.scopesTitle")}</p>
            <ul className="flex flex-col gap-2" aria-label={t("oauth.authorize.scopesTitle")}>
                {requestedScopes.map((scope) => (
                    <OAuthScopeItem key={scope} scope={scope} />
                ))}
            </ul>
        </div>
    );
}
