import { TriangleAlert } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

/**
 * Shown when every callback a metadata document client lists returns to the user's own device
 * (`127.0.0.1`, `[::1]` or `localhost`): any local program can claim such a client, so the user
 * should continue only for a sign-in they just started.
 */
export function OAuthLoopbackWarning() {
    const { t } = useTranslation();
    const titleId = useId();

    return (
        <section
            aria-labelledby={titleId}
            className="flex items-start gap-3 rounded-lg bg-oxblood/6 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--oxblood)]"
        >
            <TriangleAlert
                aria-hidden="true"
                className="mt-[3px] size-4 shrink-0 text-oxblood"
                strokeWidth={2}
            />
            <div className="flex min-w-0 flex-col gap-1">
                <p id={titleId} className="text-body-sm font-semibold text-ink">
                    {t("oauth.authorize.agentClient.loopbackWarning.title")}
                </p>
                <p className="text-body-sm text-ink-secondary">
                    {t("oauth.authorize.agentClient.loopbackWarning.description")}
                </p>
            </div>
        </section>
    );
}
