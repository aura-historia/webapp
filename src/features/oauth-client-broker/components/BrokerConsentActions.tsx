import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useConsentDecision } from "@/features/oauth/hooks/useConsentDecision.ts";
import {
    WOOCOMMERCE_BROKER_APPROVE_PATH,
    WOOCOMMERCE_BROKER_DENY_PATH,
} from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import {
    CONSENT_BRAND_BUTTON_CLASS,
    CONSENT_OUTLINE_BUTTON_CLASS,
} from "@/features/oauth/lib/oauthConsentStyles.ts";

interface BrokerConsentActionsProps {
    readonly lng: string;
    readonly transactionId: string;
    readonly listingSourceId: string | undefined;
    readonly approveAriaLabel: string;
    readonly denyAriaLabel: string;
    /** False leaves only Decline, e.g. while the account has no provider to approve with. */
    readonly canApprove?: boolean;
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
    canApprove = true,
}: BrokerConsentActionsProps) {
    const { t } = useTranslation();
    const { pendingDecision, startDecision } = useConsentDecision();
    const isSubmitted = pendingDecision !== null;
    const isApproving = pendingDecision === "approve";
    const isDenying = pendingDecision === "deny";
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
            {canApprove && (
                <form
                    action={WOOCOMMERCE_BROKER_APPROVE_PATH}
                    method="post"
                    className="w-full sm:w-auto"
                    onSubmit={() => startDecision("approve")}
                >
                    {fields}
                    <button
                        type="submit"
                        className={CONSENT_BRAND_BUTTON_CLASS}
                        disabled={listingSourceId === undefined || isSubmitted}
                        aria-busy={isApproving}
                        aria-label={isApproving ? t("oauth.authorize.approving") : approveAriaLabel}
                    >
                        {isApproving && <Spinner aria-hidden="true" className="size-4" />}
                        {t(isApproving ? "oauth.authorize.approving" : "oauth.authorize.approve")}
                    </button>
                </form>
            )}
            <form
                action={WOOCOMMERCE_BROKER_DENY_PATH}
                method="post"
                className="w-full sm:w-auto"
                onSubmit={() => startDecision("deny")}
            >
                {fields}
                <button
                    type="submit"
                    className={CONSENT_OUTLINE_BUTTON_CLASS}
                    disabled={isSubmitted}
                    aria-busy={isDenying}
                    aria-label={isDenying ? t("oauth.authorize.denying") : denyAriaLabel}
                >
                    {isDenying && <Spinner aria-hidden="true" className="size-4" />}
                    {t(isDenying ? "oauth.authorize.denying" : "oauth.authorize.deny")}
                </button>
            </form>
        </>
    );
}
