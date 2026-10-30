import { useParams } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import { OAuthAuthorizeErrorCard } from "@/features/oauth/components/OAuthAuthorizeErrorCard.tsx";
import { OAuthAuthorizePageContainer } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthListingSourceSelection } from "@/features/oauth/components/OAuthListingSourceSelection.tsx";
import { OAuthRequestedScopes } from "@/features/oauth/components/OAuthRequestedScopes.tsx";
import { OAuthSelectedListingSourceConfirmation } from "@/features/oauth/components/OAuthSelectedListingSourceConfirmation.tsx";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import { useOAuthListingSources } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import { BrokerConsentActions } from "@/features/oauth-client-broker/components/BrokerConsentActions.tsx";
import { BrokerRecipientPanel } from "@/features/oauth-client-broker/components/BrokerRecipientPanel.tsx";
import { useBrokerConsent } from "@/features/oauth-client-broker/hooks/useBrokerConsent.ts";
import { useBrokerListingSourceSelection } from "@/features/oauth-client-broker/hooks/useBrokerListingSourceSelection.ts";
import type { BrokerConsentSearchParams } from "@/features/oauth-client-broker/lib/brokerConsentSearchParams.ts";
import { BROKER_RANDOM_VALUE_PATTERN } from "@/features/oauth-client-broker/lib/brokerProtocol.ts";
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
            <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
                <H1>{t("oauth.authorize.title")}</H1>

                <Card className="gap-4">
                    <OAuthAuthorizeClientSummary client={client} />

                    <CardContent className="flex flex-col gap-6">
                        <p className="text-sm text-muted-foreground">
                            {t("oauth.authorize.description", { appName: client.clientName })}
                        </p>

                        <BrokerRecipientPanel
                            recipient={consent.recipient}
                            merchantRedirectUri={consent.merchantRedirectUri}
                        />

                        <OAuthRequestedScopes requestedScopes={consent.scopes} />

                        {hasOnlyListingSource && listingSource ? (
                            <OAuthSelectedListingSourceConfirmation listingSource={listingSource} />
                        ) : (
                            <OAuthListingSourceSelection
                                listingSources={listingSourcePages.sources}
                                listingSourcePages={listingSourcePages}
                                selectedListingSourceId={listingSource?.listingSourceId}
                                onSelectListingSource={selectListingSource}
                            />
                        )}
                        <p className="text-sm text-muted-foreground">
                            {t("oauth.authorize.broker.sourceRegistrationNote")}
                        </p>

                        <div className="flex items-start gap-2 rounded-sm bg-surface-container-highest/40 p-3">
                            <ShieldAlert
                                className="size-4 text-muted-foreground shrink-0 mt-0.5"
                                aria-hidden="true"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("oauth.authorize.securityNote")}
                            </p>
                        </div>

                        {inlineError && (
                            <AuthFormAlert>
                                <span className="block font-medium">
                                    {t(`oauth.authorize.broker.errors.${inlineError}.title`)}
                                </span>
                                {t(`oauth.authorize.broker.errors.${inlineError}.description`, {
                                    recipient: new URL(consent.recipient).host,
                                })}
                            </AuthFormAlert>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
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
                    </CardFooter>
                </Card>
            </div>
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
