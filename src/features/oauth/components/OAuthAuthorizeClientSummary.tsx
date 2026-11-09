import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OAuthConsentClient } from "@/data/internal/oauth/OAuthClient.ts";
import { getSafeHttpsUrl, getSafeHttpsUrlOnHost } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import { FOCUS_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

interface OAuthAuthorizeClientSummaryProps {
    readonly client: OAuthConsentClient;
    /** Id of the client name, so the consent card can be labelled by it. */
    readonly nameId?: string;
}

/** The client's logo (or the shield), its name and the links it registered. */
export function OAuthAuthorizeClientSummary({ client, nameId }: OAuthAuthorizeClientSummaryProps) {
    const { t } = useTranslation();
    const { logoUri: clientLogoUri, links } = getClientPresentation(client);
    const clientLinks = [
        { href: links.clientUri, label: t("oauth.authorize.clientInfoLink") },
        { href: links.policyUri, label: t("oauth.authorize.privacyLink") },
        { href: links.tosUri, label: t("oauth.authorize.termsLink") },
    ].filter((link): link is { href: string; label: string } => !!link.href);

    return (
        <div
            className={cn(
                "flex gap-3.5 sm:gap-4",
                clientLinks.length > 0 ? "items-start" : "items-center",
            )}
        >
            <span className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-oxblood shadow-field">
                {clientLogoUri ? (
                    <img
                        src={clientLogoUri}
                        alt={t("oauth.authorize.logoAlt", {
                            appName: client.clientName,
                        })}
                        className="size-full object-cover"
                    />
                ) : (
                    <ShieldCheck className="size-7" strokeWidth={1.6} aria-hidden="true" />
                )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
                <h2
                    id={nameId}
                    className="font-serif text-[22px] leading-[1.15] font-normal text-balance text-ink sm:text-[26px]"
                >
                    {client.clientName}
                </h2>
                {clientLinks.length > 0 && (
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-meta leading-[1.4] text-ink-secondary">
                        {clientLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "inline-flex items-center gap-1 underline decoration-line-strong underline-offset-3 hover:text-ink hover:decoration-brass",
                                    FOCUS_CLASS,
                                )}
                                params={true}
                                from="/$lng"
                            >
                                <span>{link.label}</span>
                                <ArrowUpRight className="size-3" aria-hidden="true" />
                            </Link>
                        ))}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * A registered client's logo and links were registered by an administrator. A metadata document
 * client asserts its own, on any host: they are shown only on the verified host of its `client_id`,
 * so a document cannot borrow another app's logo or home page (board "OAuth · Consent — agent
 * clients identified by a metadata document").
 */
function getClientPresentation(client: OAuthConsentClient): {
    readonly logoUri: string | undefined;
    readonly links: {
        readonly clientUri?: string;
        readonly policyUri?: string;
        readonly tosUri?: string;
    };
} {
    if (client.kind === "metadataDocument") {
        return {
            logoUri: getSafeHttpsUrlOnHost(client.logoUri, client.clientHost),
            links: { clientUri: getSafeHttpsUrlOnHost(client.clientUri, client.clientHost) },
        };
    }

    return {
        logoUri: getSafeHttpsUrl(client.logoUri),
        links: {
            clientUri: getSafeHttpsUrl(client.clientUri),
            policyUri: getSafeHttpsUrl(client.policyUri),
            tosUri: getSafeHttpsUrl(client.tosUri),
        },
    };
}
