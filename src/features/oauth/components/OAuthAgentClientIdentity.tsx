import { useId } from "react";
import { useTranslation } from "react-i18next";

interface OAuthAgentClientIdentityProps {
    /** Host of the `client_id` URL, which serves the client's metadata document. */
    readonly clientHost: string;
    /** Host of the callback the document lists for this request. */
    readonly redirectUriHost: string;
}

/**
 * The two addresses Aura Historia verified for a metadata document client, beside its self-asserted
 * name and logo, so the user can spot an app that borrows another's name. Showing the callback host
 * is required by the MCP authorization spec (board "OAuth · Consent — agent clients identified by a
 * metadata document").
 */
export function OAuthAgentClientIdentity({
    clientHost,
    redirectUriHost,
}: OAuthAgentClientIdentityProps) {
    const { t } = useTranslation();
    const labelId = useId();

    return (
        <section
            aria-labelledby={labelId}
            className="flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-field"
        >
            <p id={labelId} className="font-mono text-label uppercase text-ink-muted">
                {t("oauth.authorize.agentClient.identity.label")}
            </p>
            <dl className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                    <dt className="text-meta text-ink-muted">
                        {t("oauth.authorize.agentClient.identity.clientHost")}
                    </dt>
                    <dd className="break-all font-serif text-question text-ink">{clientHost}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                    <dt className="text-meta text-ink-muted">
                        {t("oauth.authorize.agentClient.identity.redirectHost")}
                    </dt>
                    <dd className="break-all font-serif text-question text-ink">
                        {redirectUriHost}
                    </dd>
                </div>
            </dl>
            <p className="border-t border-line pt-3 text-body-sm text-ink-secondary">
                {t("oauth.authorize.agentClient.identity.description")}
            </p>
        </section>
    );
}
