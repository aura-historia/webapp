import { useTranslation } from "react-i18next";
import { OAuthScopeItem } from "@/features/oauth/components/OAuthScopeItem.tsx";

interface OAuthRequestedScopesProps {
    /** Requested permissions; in a step-up, those the client does not hold yet. */
    readonly requestedScopes: readonly string[];
    /** Requested permissions the user already granted the client, listed on their own. */
    readonly alreadyGrantedScopes?: readonly string[];
}

export function OAuthRequestedScopes({
    requestedScopes,
    alreadyGrantedScopes = [],
}: OAuthRequestedScopesProps) {
    const { t } = useTranslation();
    const isStepUp = alreadyGrantedScopes.length > 0;

    if (requestedScopes.length === 0 && !isStepUp) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            {requestedScopes.length > 0 && (
                <OAuthScopeList
                    title={t(
                        isStepUp
                            ? "oauth.authorize.agentClient.scopes.newTitle"
                            : "oauth.authorize.scopesTitle",
                    )}
                    scopes={requestedScopes}
                />
            )}
            {isStepUp && (
                <OAuthScopeList
                    title={t("oauth.authorize.agentClient.scopes.grantedTitle")}
                    scopes={alreadyGrantedScopes}
                />
            )}
        </div>
    );
}

function OAuthScopeList({
    title,
    scopes,
}: {
    readonly title: string;
    readonly scopes: readonly string[];
}) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-primary">{title}</p>
            <ul className="flex flex-col gap-2" aria-label={title}>
                {scopes.map((scope) => (
                    <OAuthScopeItem key={scope} scope={scope} />
                ))}
            </ul>
        </div>
    );
}
