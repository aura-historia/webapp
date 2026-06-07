import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { OAuthAuthorizeActions } from "@/features/oauth/components/OAuthAuthorizeActions.tsx";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import { OAuthAuthorizeErrorCard } from "@/features/oauth/components/OAuthAuthorizeErrorCard.tsx";
import { OAuthAuthorizePageContainer } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthPartnerShopSelection } from "@/features/oauth/components/OAuthPartnerShopSelection.tsx";
import { OAuthRequestedScopes } from "@/features/oauth/components/OAuthRequestedScopes.tsx";
import { OAuthSelectedPartnerShopConfirmation } from "@/features/oauth/components/OAuthSelectedPartnerShopConfirmation.tsx";
import { useOAuthAuthorizePartnerShopSelection } from "@/features/oauth/hooks/useOAuthAuthorizePartnerShopSelection.ts";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import { useOAuthPartnerShops } from "@/features/oauth/hooks/useOAuthPartnerShops.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";

interface OAuthAuthorizePageProps {
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizePage({ searchParams }: OAuthAuthorizePageProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: client, isLoading, isError } = useOAuthClient(searchParams.client_id);
    const requiresPartnerShopId = searchParams.requires_partner_shop_id;
    const {
        data: partnerShops = [],
        isLoading: isPartnerShopsLoading,
        isError: isPartnerShopsError,
    } = useOAuthPartnerShops(requiresPartnerShopId);
    const {
        effectivePartnerShop,
        effectivePartnerShopId,
        partnerShopId,
        requiresPartnerShopSelection,
        selectPartnerShop,
        requestedScopes,
        shouldShowSelectedPartnerShop,
    } = useOAuthAuthorizePartnerShopSelection({
        searchParams,
        partnerShops,
    });

    const handleDeny = () => {
        const url = new URL(searchParams.redirect_uri);
        url.searchParams.set("error", "access_denied");
        url.searchParams.set("error_description", "The user denied the authorization request");
        if (searchParams.state) {
            url.searchParams.set("state", searchParams.state);
        }

        navigate({ href: url.toString() });
    };

    if (isLoading || (requiresPartnerShopId && isPartnerShopsLoading)) {
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
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.error.title")}
                description={t("oauth.authorize.error.description")}
            />
        );
    }

    if (requiresPartnerShopId && isPartnerShopsError) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.partnerShops.loadError.title")}
                description={t("oauth.authorize.partnerShops.loadError.description")}
            />
        );
    }

    if (requiresPartnerShopId && partnerShops.length === 0) {
        return (
            <OAuthAuthorizeErrorCard
                title={t("oauth.authorize.partnerShops.empty.title")}
                description={t("oauth.authorize.partnerShops.empty.description")}
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

                        {requiresPartnerShopSelection && (
                            <OAuthPartnerShopSelection
                                partnerShops={partnerShops}
                                selectedPartnerShopId={effectivePartnerShopId}
                                onSelectPartnerShop={selectPartnerShop}
                            />
                        )}

                        {shouldShowSelectedPartnerShop && effectivePartnerShop && (
                            <OAuthSelectedPartnerShopConfirmation
                                partnerShop={effectivePartnerShop}
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
                            isApproveDisabled={
                                requiresPartnerShopSelection && !effectivePartnerShopId
                            }
                            onDeny={handleDeny}
                            partnerShopId={partnerShopId}
                            searchParams={searchParams}
                        />
                    </CardFooter>
                </Card>
            </div>
        </OAuthAuthorizePageContainer>
    );
}
