import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import {
    WOOCOMMERCE_BROKER_APPROVE_PATH,
    WOOCOMMERCE_BROKER_DENY_PATH,
} from "@/features/oauth-client-broker/lib/brokerUrls.ts";

interface BrokerConsentActionsProps {
    readonly lng: string;
    readonly transactionId: string;
    readonly listingSourceId: string | undefined;
    readonly approveAriaLabel: string;
    readonly denyAriaLabel: string;
}

/**
 * Same-origin decision forms. They carry only the transaction reference and the chosen source:
 * client, recipient, scopes and resource are read from the stored transaction. A decision is sent
 * once; a second click would race the first for the transaction.
 */
export function BrokerConsentActions({
    lng,
    transactionId,
    listingSourceId,
    approveAriaLabel,
    denyAriaLabel,
}: BrokerConsentActionsProps) {
    const { t } = useTranslation();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const markSubmitted = () => setIsSubmitted(true);
    const fields = (
        <>
            <input type="hidden" name="lng" value={lng} />
            <input type="hidden" name="transaction_id" value={transactionId} />
            {listingSourceId !== undefined && (
                <input type="hidden" name="listing_source_id" value={listingSourceId} />
            )}
        </>
    );

    return (
        <>
            <form
                action={WOOCOMMERCE_BROKER_APPROVE_PATH}
                method="post"
                className="w-full sm:w-auto"
                onSubmit={markSubmitted}
            >
                {fields}
                <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={listingSourceId === undefined || isSubmitted}
                    aria-label={approveAriaLabel}
                >
                    {t("oauth.authorize.approve")}
                </Button>
            </form>
            <form
                action={WOOCOMMERCE_BROKER_DENY_PATH}
                method="post"
                className="w-full sm:w-auto"
                onSubmit={markSubmitted}
            >
                {fields}
                <Button
                    type="submit"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isSubmitted}
                    aria-label={denyAriaLabel}
                >
                    {t("oauth.authorize.deny")}
                </Button>
            </form>
        </>
    );
}
