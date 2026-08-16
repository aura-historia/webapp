import { Link } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { getSafeHttpsUrl } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import type { OAuthClient } from "@/features/oauth/types/OAuthClient.ts";

interface OAuthAuthorizeClientSummaryProps {
    readonly client: OAuthClient;
}

export function OAuthAuthorizeClientSummary({ client }: OAuthAuthorizeClientSummaryProps) {
    const { t } = useTranslation();
    const clientLogoUri = getSafeHttpsUrl(client.logoUri);
    const clientLinks = [
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
    ].filter((link): link is { href: string; label: string } => !!link.href);

    return (
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
                    <ShieldCheck className="size-6 text-primary shrink-0" aria-hidden="true" />
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
                                params={true}
                                from="/$lng"
                            >
                                <span>{link.label}</span>
                                <ExternalLink className="size-3" aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </CardHeader>
    );
}
