import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * `offline_access` asks for a refresh token; it is a request flag, not a permission, so it is
 * explained here instead of being listed among the scopes.
 */
export function OAuthOfflineAccessNote() {
    const { t } = useTranslation();

    return (
        <div className="flex items-start gap-2.5 rounded-sm bg-surface-sunken p-3">
            <RefreshCw className="mt-[3px] size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-body-sm font-medium text-ink">
                    {t("oauth.authorize.agentClient.offlineAccess.title")}
                </p>
                <p className="text-meta text-ink-muted">
                    {t("oauth.authorize.agentClient.offlineAccess.description")}
                </p>
            </div>
        </div>
    );
}
