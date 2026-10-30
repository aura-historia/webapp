import { useTranslation } from "react-i18next";

interface BrokerRecipientPanelProps {
    /** Origin of the WordPress site. */
    readonly recipient: string;
    /** The exact address the connection returns to. */
    readonly merchantRedirectUri: string;
}

/** Names the site that receives the connection, as stored in the transaction (board "Partner · WooCommerce connection consent"). */
export function BrokerRecipientPanel({
    recipient,
    merchantRedirectUri,
}: BrokerRecipientPanelProps) {
    const { t } = useTranslation();

    return (
        <section
            aria-labelledby="broker-recipient-label"
            className="flex flex-col gap-1 rounded-sm border border-line bg-surface-sunken p-3"
        >
            <p
                id="broker-recipient-label"
                className="font-mono text-label uppercase text-ink-muted"
            >
                {t("oauth.authorize.broker.recipient.label")}
            </p>
            <p className="break-all text-body font-medium text-ink">{new URL(recipient).host}</p>
            <p className="break-all font-mono text-meta text-ink-muted">{merchantRedirectUri}</p>
            <p className="mt-1 text-body-sm text-ink-muted">
                {t("oauth.authorize.broker.recipient.description")}
            </p>
        </section>
    );
}
