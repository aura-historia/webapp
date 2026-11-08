import { useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { OAuthAuthorizeActions } from "@/features/oauth/components/OAuthAuthorizeActions.tsx";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import { OAuthAuthorizeErrorCard } from "@/features/oauth/components/OAuthAuthorizeErrorCard.tsx";
import {
    OAuthAuthorizePageContainer,
    OAuthAuthorizeTitle,
} from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthListingSourceSelection } from "@/features/oauth/components/OAuthListingSourceSelection.tsx";
import { OAuthNoProviderConsent } from "@/features/oauth/components/OAuthNoProviderConsent.tsx";
import { OAuthRequestedScopes } from "@/features/oauth/components/OAuthRequestedScopes.tsx";
import { OAuthSecurityNote } from "@/features/oauth/components/OAuthSecurityNote.tsx";
import { OAuthSelectedListingSourceConfirmation } from "@/features/oauth/components/OAuthSelectedListingSourceConfirmation.tsx";
import { useOAuthAuthorizeListingSourceSelection } from "@/features/oauth/hooks/useOAuthAuthorizeListingSourceSelection.ts";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import { useOAuthListingSources } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import {
    getOAuthDenialRedirectUrl,
    isRegisteredOAuthRedirect,
} from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import {
    CONSENT_ACTIONS_CLASS,
    CONSENT_CARD_CLASS,
    CONSENT_COPY_CLASS,
    CONSENT_PANEL_CLASS,
} from "@/features/oauth/lib/oauthConsentStyles.ts";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";
import { isWooCommerceBrokerCallback } from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import { cn } from "@/lib/utils.ts";

interface OAuthAuthorizePageProps {
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizePage({ searchParams }: OAuthAuthorizePageProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const nameId = useId();
    const { data: client, isLoading, isError, error } = useOAuthClient(searchParams.client_id);
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

    // Only a settled, complete and empty grant list counts as "no provider": not a pending or
    // failed read, and not a first page with more pages behind it.
    const hasConfirmedNoProvider =
        requiresListingSourceId &&
        !isListingSourcesPending &&
        !isListingSourcesError &&
        listingSources.length === 0 &&
        !hasMoreListingSources;
    // Remembered for this visit, so a failed check keeps the panel and a later grant is announced.
    const [sawNoProvider, setSawNoProvider] = useState(false);
    useEffect(() => {
        if (hasConfirmedNoProvider) setSawNoProvider(true);
    }, [hasConfirmedNoProvider]);

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
                    requestedScopes={requestedScopes}
                    title={t("oauth.authorize.title")}
                />
            </OAuthAuthorizePageContainer>
        );
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

    // RFC 6749 §4.1.2.1: report an unregistered redirect URI here and never redirect to it.
    if (!isRegisteredOAuthRedirect(client, searchParams)) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.error.title")}
                description={t("oauth.authorize.error.description")}
            />
        );
    }

    const checkFailed = sawNoProvider && requiresListingSourceId && isListingSourcesError;
    if (hasConfirmedNoProvider || checkFailed) {
        return (
            <OAuthNoProviderConsent
                client={client}
                returnUrl={denialUrl}
                onReturn={handleDeny}
                onCheckAgain={retryListingSources}
                isChecking={isListingSourcesRefreshing}
                checkFailed={checkFailed}
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

    const gainedAccess = sawNoProvider && listingSources.length > 0;

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

                {gainedAccess && (
                    <p
                        role="status"
                        className={cn(
                            CONSENT_PANEL_CLASS,
                            "flex-row items-start gap-2.5 px-4 py-3.5 text-sm leading-[1.55] text-ink-secondary",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className="mt-1.5 size-2.5 shrink-0 rounded-pill bg-ink"
                        />
                        <span>
                            <span className="font-medium text-ink">
                                {listingSources.length === 1
                                    ? t("oauth.authorize.noProvider.granted.one", {
                                          name: listingSources[0].name,
                                      })
                                    : t("oauth.authorize.noProvider.granted.other")}
                            </span>{" "}
                            {t("oauth.authorize.noProvider.granted.description")}
                        </span>
                    </p>
                )}

                <OAuthRequestedScopes requestedScopes={requestedScopes} />

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
                        onDeny={handleDeny}
                        searchParams={searchParams}
                    />
                </div>
            </article>
        </OAuthAuthorizePageContainer>
    );
}
