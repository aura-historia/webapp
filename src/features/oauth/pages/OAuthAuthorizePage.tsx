import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { OAuthAuthorizeActions } from "@/features/oauth/components/OAuthAuthorizeActions.tsx";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import { OAuthAuthorizeErrorCard } from "@/features/oauth/components/OAuthAuthorizeErrorCard.tsx";
import { OAuthAuthorizePageContainer } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthListingSourceSelection } from "@/features/oauth/components/OAuthListingSourceSelection.tsx";
import { OAuthRequestedScopes } from "@/features/oauth/components/OAuthRequestedScopes.tsx";
import { OAuthSelectedListingSourceConfirmation } from "@/features/oauth/components/OAuthSelectedListingSourceConfirmation.tsx";
import { useOAuthAuthorizeListingSourceSelection } from "@/features/oauth/hooks/useOAuthAuthorizeListingSourceSelection.ts";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import { useOAuthListingSources } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { isValidOAuthConsentRequest } from "@/features/oauth/lib/oauthConsentValidation.ts";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";

interface OAuthAuthorizePageProps {
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizePage({ searchParams }: OAuthAuthorizePageProps) {
    const { t } = useTranslation();
    const { data: client, isLoading, isError, error } = useOAuthClient(searchParams.client_id);
    const requiresListingSourceId = searchParams.requires_listing_source_id;
    const {
        data: listingSources = [],
        isLoading: isListingSourcesLoading,
        isError: isListingSourcesError,
    } = useOAuthListingSources(requiresListingSourceId);
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
    });

    if (isLoading || (requiresListingSourceId && isListingSourcesLoading)) {
        return (
            <OAuthAuthorizePageContainer>
                <OAuthAuthorizePageSkeleton
                    requestedScopes={requestedScopes}
                    title={t("oauth.authorize.title")}
                />
            </OAuthAuthorizePageContainer>
        );
    }

    if (isError || !client || !isValidOAuthConsentRequest(client, searchParams)) {
        const errorKey = error instanceof OAuthConsentUnavailableError ? "unavailable" : "error";
        return (
            <OAuthAuthorizeErrorCard
                title={t(`oauth.authorize.${errorKey}.title`)}
                description={t(`oauth.authorize.${errorKey}.description`)}
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

    if (requiresListingSourceId && listingSources.length === 0) {
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
                            {t("oauth.authorize.description", {
                                appName: client.clientName,
                            })}
                        </p>

                        <OAuthRequestedScopes requestedScopes={requestedScopes} />

                        {requiresListingSourceSelection && (
                            <OAuthListingSourceSelection
                                listingSources={listingSources}
                                selectedListingSourceId={effectiveListingSourceId}
                                onSelectListingSource={selectListingSource}
                            />
                        )}

                        {shouldShowSelectedListingSource && effectiveListingSource && (
                            <OAuthSelectedListingSourceConfirmation
                                listingSource={effectiveListingSource}
                            />
                        )}

                        <div className="flex items-start gap-2 rounded-sm bg-surface-container-highest/40 p-3">
                            <ShieldAlert
                                className="size-4 text-muted-foreground shrink-0 mt-0.5"
                                aria-hidden="true"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("oauth.authorize.securityNote")}
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
                        <OAuthAuthorizeActions
                            approveAriaLabel={t("oauth.authorize.approveAriaLabel", {
                                appName: client.clientName,
                            })}
                            denyAriaLabel={t("oauth.authorize.denyAriaLabel", {
                                appName: client.clientName,
                            })}
                            isApproveDisabled={requiresListingSourceId && !effectiveListingSourceId}
                            listingSourceId={listingSourceId}
                            searchParams={searchParams}
                        />
                    </CardFooter>
                </Card>
            </div>
        </OAuthAuthorizePageContainer>
    );
}
