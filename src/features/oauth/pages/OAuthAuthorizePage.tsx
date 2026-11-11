import { useNavigate } from "@tanstack/react-router";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { OAuthAgentClientIdentity } from "@/features/oauth/components/OAuthAgentClientIdentity.tsx";
import { OAuthAuthorizeActions } from "@/features/oauth/components/OAuthAuthorizeActions.tsx";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import { OAuthGrantedAccessNote } from "@/features/oauth/components/OAuthGrantedAccessNote.tsx";
import { OAuthAuthorizeErrorCard } from "@/features/oauth/components/OAuthAuthorizeErrorCard.tsx";
import {
    OAuthAuthorizePageContainer,
    OAuthAuthorizeTitle,
} from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthListingSourceSelection } from "@/features/oauth/components/OAuthListingSourceSelection.tsx";
import { OAuthLoopbackWarning } from "@/features/oauth/components/OAuthLoopbackWarning.tsx";
import { OAuthNoProviderConsent } from "@/features/oauth/components/OAuthNoProviderConsent.tsx";
import { OAuthOfflineAccessNote } from "@/features/oauth/components/OAuthOfflineAccessNote.tsx";
import { OAuthRequestedScopes } from "@/features/oauth/components/OAuthRequestedScopes.tsx";
import { OAuthSecurityNote } from "@/features/oauth/components/OAuthSecurityNote.tsx";
import { OAuthSelectedListingSourceConfirmation } from "@/features/oauth/components/OAuthSelectedListingSourceConfirmation.tsx";
import { useOAuthAuthorizeListingSourceSelection } from "@/features/oauth/hooks/useOAuthAuthorizeListingSourceSelection.ts";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import { useOAuthListingSources } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import { useNoProviderState } from "@/features/oauth/hooks/useNoProviderState.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import {
    getOAuthDenialRedirectUrl,
    isValidatedOAuthRedirect,
} from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import {
    getOAuthConsentScopes,
    withoutOfflineAccess,
} from "@/features/oauth/lib/oauthConsentScopes.ts";
import {
    CONSENT_ACTIONS_CLASS,
    CONSENT_CARD_CLASS,
    CONSENT_COPY_CLASS,
    CONSENT_OUTLINE_BUTTON_CLASS,
} from "@/features/oauth/lib/oauthConsentStyles.ts";
import {
    OAuthConsentMetadataError,
    OAuthConsentUnavailableError,
} from "@/features/oauth/api/oauthConsentMetadata.ts";
import { isWooCommerceBrokerCallback } from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import {
    isMetadataDocumentClientId,
    returnsToLocalDevice,
} from "@/data/internal/oauth/OAuthClient.ts";

interface OAuthAuthorizePageProps {
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizePage({ searchParams: requestSearchParams }: OAuthAuthorizePageProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const nameId = useId();
    const isMetadataDocumentRequest = isMetadataDocumentClientId(requestSearchParams.client_id);
    // Metadata document clients request account scopes only: provider selection never applies, so
    // no grants are read and neither the flag nor a source is posted.
    const searchParams = isMetadataDocumentRequest
        ? { ...requestSearchParams, requires_listing_source_id: false }
        : requestSearchParams;
    const {
        data: client,
        isLoading,
        isError,
        error,
    } = useOAuthClient(searchParams.client_id, searchParams.redirect_uri);
    const requiresListingSourceId = searchParams.requires_listing_source_id;
    const listingSourcePages = useOAuthListingSources(requiresListingSourceId);
    const {
        sources: listingSources,
        isPending: isListingSourcesPending,
        isError: isListingSourcesError,
        hasMore: hasMoreListingSources,
        isRefreshing: isListingSourcesRefreshing,
        retry: retryListingSources,
    } = listingSourcePages;
    const {
        effectiveListingSource,
        effectiveListingSourceId,
        listingSourceId,
        requiresListingSourceSelection,
        selectListingSource,
        requestedScopes,
        shouldShowSelectedListingSource,
    } = useOAuthAuthorizeListingSourceSelection({
        searchParams,
        listingSources,
        hasMoreListingSources,
    });

    const noProvider = useNoProviderState(requiresListingSourceId, listingSourcePages);

    const denialUrl = client ? getOAuthDenialRedirectUrl(client, searchParams) : undefined;
    const handleDeny = () => {
        if (denialUrl) {
            navigate({ href: denialUrl });
        }
    };

    // WooCommerce connects only through a broker transaction, never by a direct request.
    if (isWooCommerceBrokerCallback(searchParams.redirect_uri)) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.brokerRequired.title")}
                description={t("oauth.authorize.brokerRequired.description")}
            />
        );
    }

    if (isLoading || (requiresListingSourceId && isListingSourcesPending)) {
        return (
            <OAuthAuthorizePageContainer>
                <OAuthAuthorizePageSkeleton
                    requestedScopes={
                        isMetadataDocumentRequest
                            ? withoutOfflineAccess(requestedScopes)
                            : requestedScopes
                    }
                    title={t("oauth.authorize.title")}
                />
            </OAuthAuthorizePageContainer>
        );
    }

    if (isError || !client) {
        const errorCopy = getConsentErrorCopy(error, isMetadataDocumentRequest);
        return (
            <OAuthAuthorizeErrorCard
                title={t(errorCopy.title)}
                description={t(errorCopy.description)}
            />
        );
    }

    // RFC 6749 §4.1.2.1: report a redirect URI the backend did not validate here and never
    // redirect to it.
    if (!isValidatedOAuthRedirect(client, searchParams)) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.error.title")}
                description={t("oauth.authorize.error.description")}
            />
        );
    }

    if (noProvider.showPanel) {
        return (
            <OAuthNoProviderConsent
                client={client}
                secondaryAction={
                    denialUrl && (
                        <button
                            type="button"
                            className={CONSENT_OUTLINE_BUTTON_CLASS}
                            aria-label={t("oauth.authorize.noProvider.returnAriaLabel", {
                                appName: client.clientName,
                            })}
                            onClick={handleDeny}
                        >
                            {t("oauth.authorize.noProvider.return")}
                        </button>
                    )
                }
                onCheckAgain={retryListingSources}
                isChecking={isListingSourcesRefreshing}
                checkFailed={noProvider.checkFailed}
            />
        );
    }

    if (requiresListingSourceId && isListingSourcesError) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.listingSources.loadError.title")}
                description={t("oauth.authorize.listingSources.loadError.description")}
            />
        );
    }

    const metadataDocumentClient = client.kind === "metadataDocument" ? client : undefined;
    const consentScopes = getOAuthConsentScopes(requestedScopes, metadataDocumentClient);

    return (
        <OAuthAuthorizePageContainer>
            <OAuthAuthorizeTitle>{t("oauth.authorize.title")}</OAuthAuthorizeTitle>

            <article aria-labelledby={nameId} className={CONSENT_CARD_CLASS}>
                <OAuthAuthorizeClientSummary client={client} nameId={nameId} />

                <p className={CONSENT_COPY_CLASS}>
                    {t("oauth.authorize.description", {
                        appName: client.clientName,
                    })}
                </p>

                {noProvider.gainedAccess && (
                    <OAuthGrantedAccessNote listingSources={listingSources} />
                )}

                {metadataDocumentClient && returnsToLocalDevice(metadataDocumentClient) && (
                    <OAuthLoopbackWarning />
                )}

                {metadataDocumentClient && (
                    <OAuthAgentClientIdentity
                        clientHost={metadataDocumentClient.clientHost}
                        redirectUriHost={metadataDocumentClient.redirectUriHost}
                    />
                )}

                <OAuthRequestedScopes
                    requestedScopes={consentScopes.requestedScopes}
                    alreadyGrantedScopes={consentScopes.alreadyGrantedScopes}
                />

                {consentScopes.requestsOfflineAccess && <OAuthOfflineAccessNote />}

                {requiresListingSourceSelection && (
                    <OAuthListingSourceSelection
                        listingSources={listingSources}
                        listingSourcePages={listingSourcePages}
                        selectedListingSourceId={effectiveListingSourceId}
                        onSelectListingSource={selectListingSource}
                    />
                )}

                {shouldShowSelectedListingSource && effectiveListingSource && (
                    <OAuthSelectedListingSourceConfirmation
                        listingSource={effectiveListingSource}
                    />
                )}

                <OAuthSecurityNote />

                <div className={CONSENT_ACTIONS_CLASS}>
                    <OAuthAuthorizeActions
                        approveAriaLabel={t("oauth.authorize.approveAriaLabel", {
                            appName: client.clientName,
                        })}
                        denyAriaLabel={t("oauth.authorize.denyAriaLabel", {
                            appName: client.clientName,
                        })}
                        isApproveDisabled={
                            requiresListingSourceSelection && !effectiveListingSourceId
                        }
                        listingSourceId={listingSourceId}
                        onDeny={denialUrl ? handleDeny : undefined}
                        searchParams={searchParams}
                    />
                </div>
            </article>
        </OAuthAuthorizePageContainer>
    );
}

const CONSENT_ERROR_COPY = {
    invalidRequest: {
        title: "oauth.authorize.error.title",
        description: "oauth.authorize.error.description",
    },
    unavailable: {
        title: "oauth.authorize.unavailable.title",
        description: "oauth.authorize.unavailable.description",
    },
    agentClientInvalid: {
        title: "oauth.authorize.agentClient.errors.invalidClient.title",
        description: "oauth.authorize.agentClient.errors.invalidClient.description",
    },
    agentClientUnavailable: {
        title: "oauth.authorize.agentClient.errors.unavailable.title",
        description: "oauth.authorize.agentClient.errors.unavailable.description",
    },
} as const;

/**
 * The state shown when consent metadata cannot be read. Every refusal stays on this page; nothing
 * is sent to the callback. A registered client keeps its earlier states. For a metadata document
 * client only the backend's `400` refusals describe the request; any other failure, such as a
 * rejected session or a rate limit, says the details cannot be verified now.
 */
function getConsentErrorCopy(
    error: unknown,
    isMetadataDocumentRequest: boolean,
): (typeof CONSENT_ERROR_COPY)[keyof typeof CONSENT_ERROR_COPY] {
    if (!isMetadataDocumentRequest) {
        return error instanceof OAuthConsentUnavailableError
            ? CONSENT_ERROR_COPY.unavailable
            : CONSENT_ERROR_COPY.invalidRequest;
    }
    if (!(error instanceof OAuthConsentMetadataError) || error.status !== 400) {
        return CONSENT_ERROR_COPY.agentClientUnavailable;
    }
    return error.code === "OAUTH_INVALID_CLIENT"
        ? CONSENT_ERROR_COPY.agentClientInvalid
        : CONSENT_ERROR_COPY.invalidRequest;
}
