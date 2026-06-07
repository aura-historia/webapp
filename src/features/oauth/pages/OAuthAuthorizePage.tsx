import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { OAuthAuthorizePageContainer } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { OAuthAuthorizePageSkeleton } from "@/features/oauth/components/OAuthAuthorizePageSkeleton.tsx";
import { OAuthScopeItem } from "@/features/oauth/components/OAuthScopeItem.tsx";
import { useOAuthClient } from "@/features/oauth/hooks/useOAuthClient.ts";
import {
    type OAuthPartnerShop,
    useOAuthPartnerShops,
} from "@/features/oauth/hooks/useOAuthPartnerShops.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import {
    getPartnerShopIdFromRedirectUri,
    getSafeHttpsUrl,
    OAUTH_AUTHORIZE_APPROVE_ACTION,
    setPartnerShopIdOnRedirectUri,
} from "@/features/oauth/lib/oauthAuthorizeUrls.ts";

interface OAuthAuthorizePageProps {
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizePage({ searchParams }: OAuthAuthorizePageProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: client, isLoading, isError } = useOAuthClient(searchParams.client_id);
    const requiresPartnerShopId = searchParams.requires_partner_shop_id;
    const requestKey = `${searchParams.client_id}:${searchParams.redirect_uri}:${searchParams.state ?? ""}`;
    const redirectUriPartnerShopId = requiresPartnerShopId
        ? getPartnerShopIdFromRedirectUri(searchParams.redirect_uri)
        : undefined;
    const [partnerShopSelection, setPartnerShopSelection] = useState<{
        requestKey: string;
        partnerShopId: string | undefined;
    }>({
        requestKey,
        partnerShopId: redirectUriPartnerShopId,
    });
    const {
        data: partnerShops = [],
        isLoading: isPartnerShopsLoading,
        isError: isPartnerShopsError,
    } = useOAuthPartnerShops(requiresPartnerShopId);

    const requestedScopes = searchParams.scope?.split(" ").filter(Boolean) ?? [];
    const clientLogoUri = getSafeHttpsUrl(client?.logoUri);
    const selectedPartnerShopId =
        partnerShopSelection.requestKey === requestKey
            ? partnerShopSelection.partnerShopId
            : redirectUriPartnerShopId;
    const selectedPartnerShop = getSelectedPartnerShop({
        partnerShops,
        selectedPartnerShopId,
    });
    const effectivePartnerShop = partnerShops.length === 1 ? partnerShops[0] : selectedPartnerShop;
    const effectivePartnerShopId = effectivePartnerShop?.shopId;
    const effectiveRedirectUri = requiresPartnerShopId
        ? setPartnerShopIdOnRedirectUri(searchParams.redirect_uri, effectivePartnerShopId)
        : searchParams.redirect_uri;
    const requiresPartnerShopSelection = requiresPartnerShopId && partnerShops.length > 1;
    const clientLinks = client
        ? [
              {
                  href: getSafeHttpsUrl(client.clientUri),
                  label: t("oauth.authorize.clientInfoLink"),
              },
              {
                  href: getSafeHttpsUrl(client.policyUri),
                  label: t("oauth.authorize.privacyLink"),
              },
              {
                  href: getSafeHttpsUrl(client.tosUri),
                  label: t("oauth.authorize.termsLink"),
              },
          ].filter((link): link is { href: string; label: string } => !!link.href)
        : [];

    const handleDeny = () => {
        const url = new URL(effectiveRedirectUri);
        url.searchParams.set("error", "access_denied");
        url.searchParams.set("error_description", "The user denied the authorization request.");
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
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-outline-variant/20 bg-surface-container-low">
                            {clientLogoUri ? (
                                <img
                                    src={clientLogoUri}
                                    alt={t("oauth.authorize.logoAlt", {
                                        appName: client.clientName,
                                    })}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <ShieldCheck
                                    className="size-6 text-primary shrink-0"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <CardTitle className="text-balance">{client.clientName}</CardTitle>
                            {clientLinks.length > 0 && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {clientLinks.map((link) => (
                                        <Link
                                            key={link.label}
                                            to={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                                        >
                                            <span>{link.label}</span>
                                            <ExternalLink className="size-3" aria-hidden="true" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-6">
                        <p className="text-sm text-muted-foreground">
                            {t("oauth.authorize.description", {
                                appName: client.clientName,
                            })}
                        </p>

                        {requestedScopes.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-medium text-primary">
                                    {t("oauth.authorize.scopesTitle")}
                                </p>
                                <ul
                                    className="flex flex-col gap-2"
                                    aria-label={t("oauth.authorize.scopesTitle")}
                                >
                                    {requestedScopes.map((scope) => (
                                        <OAuthScopeItem key={scope} scope={scope} />
                                    ))}
                                </ul>
                            </div>
                        )}

                        {requiresPartnerShopSelection && (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-primary">
                                        {t("oauth.authorize.partnerShops.title")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("oauth.authorize.partnerShops.description")}
                                    </p>
                                </div>

                                <fieldset className="flex flex-col gap-2">
                                    <legend className="sr-only">
                                        {t("oauth.authorize.partnerShops.title")}
                                    </legend>
                                    {partnerShops.map((shop) => (
                                        <label key={shop.shopId} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name="partner_shop_selection"
                                                value={shop.shopId}
                                                checked={effectivePartnerShopId === shop.shopId}
                                                onChange={() =>
                                                    setPartnerShopSelection({
                                                        requestKey,
                                                        partnerShopId: shop.shopId,
                                                    })
                                                }
                                                className="peer sr-only"
                                            />
                                            <div className="rounded-sm border border-outline-variant/20 p-3 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                                                <p className="font-medium">{shop.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {shop.shopId}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </fieldset>
                            </div>
                        )}

                        {requiresPartnerShopId &&
                            partnerShops.length === 1 &&
                            effectivePartnerShop && (
                                <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {t("oauth.authorize.partnerShops.selectedLabel")}
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {effectivePartnerShop.name}
                                    </p>
                                </div>
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
                        <form
                            action={OAUTH_AUTHORIZE_APPROVE_ACTION}
                            method="post"
                            className="w-full sm:w-auto"
                        >
                            <input
                                type="hidden"
                                name="response_type"
                                value={searchParams.response_type}
                            />
                            <input type="hidden" name="client_id" value={searchParams.client_id} />
                            <input type="hidden" name="redirect_uri" value={effectiveRedirectUri} />
                            {searchParams.scope !== undefined && (
                                <input type="hidden" name="scope" value={searchParams.scope} />
                            )}
                            {searchParams.state !== undefined && (
                                <input type="hidden" name="state" value={searchParams.state} />
                            )}
                            <input
                                type="hidden"
                                name="code_challenge"
                                value={searchParams.code_challenge}
                            />
                            <input
                                type="hidden"
                                name="code_challenge_method"
                                value={searchParams.code_challenge_method}
                            />
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={requiresPartnerShopSelection && !effectivePartnerShopId}
                                aria-label={t("oauth.authorize.approveAriaLabel", {
                                    appName: client.clientName,
                                })}
                            >
                                {t("oauth.authorize.approve")}
                            </Button>
                        </form>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDeny}
                            className="w-full sm:w-auto"
                            aria-label={t("oauth.authorize.denyAriaLabel", {
                                appName: client.clientName,
                            })}
                        >
                            {t("oauth.authorize.deny")}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </OAuthAuthorizePageContainer>
    );
}

interface OAuthAuthorizeErrorCardProps {
    readonly title: string;
    readonly description: string;
}

function OAuthAuthorizeErrorCard({ title, description }: OAuthAuthorizeErrorCardProps) {
    return (
        <OAuthAuthorizePageContainer>
            <Card className="w-full max-w-lg mx-auto gap-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </CardContent>
            </Card>
        </OAuthAuthorizePageContainer>
    );
}

function getSelectedPartnerShop({
    partnerShops,
    selectedPartnerShopId,
}: {
    readonly partnerShops: OAuthPartnerShop[];
    readonly selectedPartnerShopId: string | undefined;
}): OAuthPartnerShop | undefined {
    if (!selectedPartnerShopId) {
        return undefined;
    }

    return partnerShops.find((shop) => shop.shopId === selectedPartnerShopId);
}
