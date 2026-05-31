import { useTranslation } from "react-i18next";
import { useOAuthClient } from "@/hooks/oauth/useOAuthClient.ts";
import { useOAuthAuthorize } from "@/hooks/oauth/useOAuthAuthorize.ts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";

type OAuthAuthorizeSearchParams = {
    readonly response_type: string;
    readonly client_id: string;
    readonly redirect_uri: string;
    readonly scope?: string;
    readonly state?: string;
    readonly code_challenge: string;
    readonly code_challenge_method: string;
};

interface OAuthAuthorizePageProps {
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizePage({ searchParams }: OAuthAuthorizePageProps) {
    const { t } = useTranslation();
    const { data: client, isLoading, isError } = useOAuthClient(searchParams.client_id);
    const authorize = useOAuthAuthorize();

    const requestedScopes = searchParams.scope?.split(" ").filter(Boolean) ?? [];
    const clientLogoUri = getSafeHttpsUrl(client?.logoUri);
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

    const handleApprove = () => {
        authorize.mutate(
            {
                clientId: searchParams.client_id,
                redirectUri: searchParams.redirect_uri,
                codeChallenge: searchParams.code_challenge,
                scope: searchParams.scope,
                state: searchParams.state,
            },
            {
                onSuccess: (result) => {
                    window.location.href = result.redirectUrl;
                },
            },
        );
    };

    const handleDeny = () => {
        const url = new URL(searchParams.redirect_uri);
        url.searchParams.set("error", "access_denied");
        url.searchParams.set("error_description", "The user denied the authorization request.");
        if (searchParams.state) {
            url.searchParams.set("state", searchParams.state);
        }
        window.location.href = url.toString();
    };

    if (isLoading) {
        return (
            <PageContainer>
                <Card className="w-full max-w-lg mx-auto gap-4">
                    <CardContent className="flex items-center justify-center py-16">
                        <Spinner className="size-8" />
                    </CardContent>
                </Card>
            </PageContainer>
        );
    }

    if (isError || !client) {
        return (
            <PageContainer>
                <Card className="w-full max-w-lg mx-auto gap-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
                            {t("oauth.authorize.error.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            {t("oauth.authorize.error.description")}
                        </p>
                    </CardContent>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="w-full max-w-lg mx-auto flex flex-col gap-8">
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
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                    {clientLinks.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                                        >
                                            <span>{link.label}</span>
                                            <ExternalLink className="size-3" aria-hidden="true" />
                                        </a>
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
                                        <ScopeItem key={scope} scope={scope} />
                                    ))}
                                </ul>
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
                        <Button
                            onClick={handleApprove}
                            disabled={authorize.isPending}
                            className="w-full sm:w-auto"
                            aria-label={t("oauth.authorize.approveAriaLabel", {
                                appName: client.clientName,
                            })}
                        >
                            {authorize.isPending && <Spinner className="size-4" />}
                            {t("oauth.authorize.approve")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDeny}
                            disabled={authorize.isPending}
                            className="w-full sm:w-auto"
                            aria-label={t("oauth.authorize.denyAriaLabel", {
                                appName: client.clientName,
                            })}
                        >
                            {t("oauth.authorize.deny")}
                        </Button>
                    </CardFooter>
                </Card>

                {authorize.isError && (
                    <Card className="border-destructive/30 gap-4">
                        <CardContent className="pt-6">
                            <p className="text-sm text-destructive">{authorize.error.message}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageContainer>
    );
}

function PageContainer({ children }: { readonly children: React.ReactNode }) {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 px-8 lg:px-4 lg:mx-auto">
            {children}
        </div>
    );
}

function ScopeItem({ scope }: { readonly scope: string }) {
    const { t } = useTranslation();

    const scopeKey = scope.replace(":", "_");
    const description = t(`oauth.scopes.${scopeKey}.description`);

    return (
        <li className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
            <div className="flex flex-col gap-2">
                <Badge
                    variant="outline"
                    className="w-fit rounded-sm border-outline-variant/30 bg-surface-container font-mono text-[11px] text-primary"
                >
                    {scope}
                </Badge>
                <span className="text-xs text-muted-foreground">{description}</span>
            </div>
        </li>
    );
}

function getSafeHttpsUrl(url: string | undefined): string | undefined {
    if (!url) {
        return undefined;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:" ? url : undefined;
    } catch {
        return undefined;
    }
}
