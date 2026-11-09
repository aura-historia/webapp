import { useTranslation } from "react-i18next";
import { CONSENT_PANEL_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";
import { formatMerchantSiteAddress } from "@/features/oauth-client-broker/lib/brokerMerchantRedirectUri.ts";
import { cn } from "@/lib/utils.ts";

interface BrokerRecipientPanelProps {
    /** Address of the WordPress site: origin and install path. */
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
            className={cn(CONSENT_PANEL_CLASS, "gap-1.5 p-4 sm:px-[18px]")}
        >
            <p
                id="broker-recipient-label"
                className="font-mono text-[11px] leading-[1.4] tracking-[0.14em] text-ink-muted uppercase"
            >
                {t("oauth.authorize.broker.recipient.label")}
            </p>
            <p className="font-serif text-xl leading-[1.25] break-all text-ink sm:text-[22px]">
                {formatMerchantSiteAddress(recipient)}
            </p>
            <p className="font-mono text-xs leading-normal break-all text-ink-muted">
                {merchantRedirectUri}
            </p>
            <p className="mt-2 border-t border-line pt-3 text-sm leading-[1.6] text-ink-secondary">
                {t("oauth.authorize.broker.recipient.description")}
            </p>
        </section>
    );
}
