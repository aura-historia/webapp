import { useParams } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import { OAuthAuthorizeErrorCard } from "@/features/oauth/components/OAuthAuthorizeErrorCard.tsx";
import {
    OAuthAuthorizePageContainer,
    OAuthAuthorizeTitle,
} from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthListingSourceSelection } from "@/features/oauth/components/OAuthListingSourceSelection.tsx";
import { OAuthRequestedScopes } from "@/features/oauth/components/OAuthRequestedScopes.tsx";
import { OAuthSecurityNote } from "@/features/oauth/components/OAuthSecurityNote.tsx";
import { OAuthSelectedListingSourceConfirmation } from "@/features/oauth/components/OAuthSelectedListingSourceConfirmation.tsx";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import { useOAuthListingSources } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import {
    CONSENT_ACTIONS_CLASS,
    CONSENT_ALERT_CLASS,
    CONSENT_CARD_CLASS,
    CONSENT_COPY_CLASS,
} from "@/features/oauth/lib/oauthConsentStyles.ts";
import { BrokerConsentActions } from "@/features/oauth-client-broker/components/BrokerConsentActions.tsx";
import { BrokerRecipientPanel } from "@/features/oauth-client-broker/components/BrokerRecipientPanel.tsx";
import { useBrokerConsent } from "@/features/oauth-client-broker/hooks/useBrokerConsent.ts";
import { useBrokerListingSourceSelection } from "@/features/oauth-client-broker/hooks/useBrokerListingSourceSelection.ts";
import type { BrokerConsentSearchParams } from "@/features/oauth-client-broker/lib/brokerConsentSearchParams.ts";
import { BROKER_RANDOM_VALUE_PATTERN } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
import { formatMerchantSiteAddress } from "@/features/oauth-client-broker/lib/brokerMerchantRedirectUri.ts";
import type { OAuthBrokerConsent } from "@/data/internal/oauth/OAuthBrokerConsent.ts";

type TerminalState = "declined" | "answered" | "invalid" | "unavailable" | "sessionMismatch";

const INLINE_ERROR_KEYS = {
    recipient_not_registered: "recipientNotRegistered",
    source_unavailable: "sourceUnavailable",
    approval_failed: "approvalFailed",
} as const;

interface WooCommerceBrokerConsentPageProps {
    readonly searchParams: BrokerConsentSearchParams;
}

/**
 * Consent for a WooCommerce broker transaction. Client, recipient, scopes and resource come from
 * the stored transaction; the URL carries only its reference.
 */
export function WooCommerceBrokerConsentPage({ searchParams }: WooCommerceBrokerConsentPageProps) {
    const { transaction_id: transactionId, broker_error: brokerError } = searchParams;

    if (brokerError === "session_mismatch") return <BrokerTerminalCard state="sessionMismatch" />;
    if (brokerError === "unavailable") return <BrokerTerminalCard state="unavailable" />;
    if (
        brokerError === "invalid_request" ||
        !transactionId ||
        !BROKER_RANDOM_VALUE_PATTERN.test(transactionId)
    ) {
        return <BrokerTerminalCard state="invalid" />;
    }

    return (
        <BrokerTransactionConsent
            transactionId={transactionId}
            inlineError={brokerError === undefined ? undefined : INLINE_ERROR_KEYS[brokerError]}
        />
    );
}

function BrokerTransactionConsent({
    transactionId,
    inlineError,
}: {
    readonly transactionId: string;
    readonly inlineError: (typeof INLINE_ERROR_KEYS)[keyof typeof INLINE_ERROR_KEYS] | undefined;
}) {
    const consent = useBrokerConsent(transactionId);
    const pending = consent.data?.status === "pending" ? consent.data : undefined;

    if (consent.isPending) {
        return <BrokerConsentSkeleton />;
    }
    if (consent.isError) {
        return <BrokerTerminalCard state="unavailable" />;
    }
    if (!pending) {
        return <BrokerTerminalCard state={consent.data.status as TerminalState} />;
    }
    return <PendingBrokerConsent consent={pending} inlineError={inlineError} />;
}

function PendingBrokerConsent({
    consent,
    inlineError,
}: {
    readonly consent: Extract<OAuthBrokerConsent, { status: "pending" }>;
    readonly inlineError: (typeof INLINE_ERROR_KEYS)[keyof typeof INLINE_ERROR_KEYS] | undefined;
}) {
    const { t } = useTranslation();
    const { lng } = useParams({ from: "/$lng" });
    const nameId = useId();
    const { data: client, isLoading, isError, error } = useOAuthClient(consent.clientId);
    const listingSourcePages = useOAuthListingSources(true);
    const { listingSource, hasOnlyListingSource, selectListingSource } =
        useBrokerListingSourceSelection(
            consent.transactionId,
            listingSourcePages.sources,
            listingSourcePages.hasMore,
        );

    if (isLoading || listingSourcePages.isPending) {
        return <BrokerConsentSkeleton requestedScopes={consent.scopes} />;
    }

    if (isError || !client) {
        const errorKey = error instanceof OAuthConsentUnavailableError ? "unavailable" : "error";
        return (
            <OAuthAuthorizeErrorCard
                title={t(`oauth.authorize.${errorKey}.title`)}
                description={t(`oauth.authorize.${errorKey}.description`)}
            />
        );
    }

    if (listingSourcePages.isError) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.listingSources.loadError.title")}
                description={t("oauth.authorize.listingSources.loadError.description")}
            />
        );
    }

    if (listingSourcePages.sources.length === 0 && !listingSourcePages.hasMore) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.listingSources.empty.title")}
                description={t("oauth.authorize.listingSources.empty.description")}
            />
        );
    }

    return (
        <OAuthAuthorizePageContainer>
            <OAuthAuthorizeTitle>{t("oauth.authorize.title")}</OAuthAuthorizeTitle>

            <article aria-labelledby={nameId} className={CONSENT_CARD_CLASS}>
                <OAuthAuthorizeClientSummary client={client} nameId={nameId} />

                <p className={CONSENT_COPY_CLASS}>
                    {t("oauth.authorize.description", { appName: client.clientName })}
                </p>

                <BrokerRecipientPanel
                    recipient={consent.recipient}
                    merchantRedirectUri={consent.merchantRedirectUri}
                />

                <OAuthRequestedScopes requestedScopes={consent.scopes} />

                {hasOnlyListingSource && listingSource ? (
                    <OAuthSelectedListingSourceConfirmation
                        listingSource={listingSource}
                        hint={t("oauth.authorize.broker.sourceRegistrationNote")}
                    />
                ) : (
                    <OAuthListingSourceSelection
                        listingSources={listingSourcePages.sources}
                        listingSourcePages={listingSourcePages}
                        selectedListingSourceId={listingSource?.listingSourceId}
                        onSelectListingSource={selectListingSource}
                        hint={t("oauth.authorize.broker.sourceRegistrationNote")}
                    />
                )}

                <OAuthSecurityNote />

                {inlineError && (
                    <div role="alert" className={CONSENT_ALERT_CLASS}>
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-0.5 size-[18px] shrink-0 text-oxblood"
                            strokeWidth={1.8}
                        />
                        <div className="flex min-w-0 flex-col gap-1">
                            <p className="text-sm leading-normal font-semibold text-ink">
                                {t(`oauth.authorize.broker.errors.${inlineError}.title`)}
                            </p>
                            <p className="text-sm leading-[1.6] text-ink-secondary">
                                {t(`oauth.authorize.broker.errors.${inlineError}.description`, {
                                    recipient: formatMerchantSiteAddress(consent.recipient),
                                })}
                            </p>
                        </div>
                    </div>
                )}

                <div className={CONSENT_ACTIONS_CLASS}>
                    <BrokerConsentActions
                        lng={lng}
                        transactionId={consent.transactionId}
                        listingSourceId={listingSource?.listingSourceId}
                        approveAriaLabel={t("oauth.authorize.approveAriaLabel", {
                            appName: client.clientName,
                        })}
                        denyAriaLabel={t("oauth.authorize.denyAriaLabel", {
                            appName: client.clientName,
                        })}
                    />
                </div>
            </article>
        </OAuthAuthorizePageContainer>
    );
}

function BrokerConsentSkeleton({
    requestedScopes = [],
}: {
    readonly requestedScopes?: readonly string[];
}) {
    const { t } = useTranslation();
    return (
        <OAuthAuthorizePageContainer>
            <OAuthAuthorizePageSkeleton
                requestedScopes={requestedScopes}
                title={t("oauth.authorize.title")}
            />
        </OAuthAuthorizePageContainer>
    );
}

function BrokerTerminalCard({ state }: { readonly state: TerminalState }) {
    const { t } = useTranslation();
    return (
        <OAuthAuthorizeErrorCard
            title={t(`oauth.authorize.broker.states.${state}.title`)}
            description={t(`oauth.authorize.broker.states.${state}.description`)}
        />
    );
}
