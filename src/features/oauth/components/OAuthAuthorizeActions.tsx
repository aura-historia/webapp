import { Spinner } from "@/components/ui/spinner.tsx";
import { useConsentDecision } from "@/features/oauth/hooks/useConsentDecision.ts";
import { OAUTH_AUTHORIZE_APPROVE_ACTION } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import {
    CONSENT_BRAND_BUTTON_CLASS,
    CONSENT_OUTLINE_BUTTON_CLASS,
} from "@/features/oauth/lib/oauthConsentStyles.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { useTranslation } from "react-i18next";
import { useParams } from "@tanstack/react-router";

interface OAuthAuthorizeActionsProps {
    readonly approveAriaLabel: string;
    readonly denyAriaLabel: string;
    readonly isApproveDisabled: boolean;
    /** Undefined when there is no validated callback to return the denial to. */
    readonly onDeny: (() => void) | undefined;
    readonly listingSourceId: string | undefined;
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizeActions({
    approveAriaLabel,
    denyAriaLabel,
    isApproveDisabled,
    onDeny,
    listingSourceId,
    searchParams,
}: OAuthAuthorizeActionsProps) {
    const { t } = useTranslation();
    const { lng } = useParams({ from: "/$lng" });
    const { pendingDecision, startDecision } = useConsentDecision();
    const isApproving = pendingDecision === "approve";
    const isDenying = pendingDecision === "deny";

    const deny = () => {
        if (onDeny) {
            startDecision("deny");
            onDeny();
        }
    };

    return (
        <>
            <form
                action={OAUTH_AUTHORIZE_APPROVE_ACTION}
                method="post"
                className="w-full sm:w-auto"
                onSubmit={() => startDecision("approve")}
            >
                <input type="hidden" name="lng" value={lng} />
                <input type="hidden" name="response_type" value={searchParams.response_type} />
                <input type="hidden" name="client_id" value={searchParams.client_id} />
                <input type="hidden" name="redirect_uri" value={searchParams.redirect_uri} />
                {searchParams.scope !== undefined && (
                    <input type="hidden" name="scope" value={searchParams.scope} />
                )}
                {searchParams.state !== undefined && (
                    <input type="hidden" name="state" value={searchParams.state} />
                )}
                {searchParams.resource !== undefined && (
                    <input type="hidden" name="resource" value={searchParams.resource} />
                )}
                {searchParams.requires_listing_source_id && (
                    <input type="hidden" name="requires_listing_source_id" value="true" />
                )}
                {listingSourceId !== undefined && (
                    <input type="hidden" name="listing_source_id" value={listingSourceId} />
                )}
                <input type="hidden" name="code_challenge" value={searchParams.code_challenge} />
                <input
                    type="hidden"
                    name="code_challenge_method"
                    value={searchParams.code_challenge_method}
                />
                <button
                    type="submit"
                    className={CONSENT_BRAND_BUTTON_CLASS}
                    disabled={isApproveDisabled || pendingDecision !== null}
                    aria-busy={isApproving}
                    aria-label={isApproving ? t("oauth.authorize.approving") : approveAriaLabel}
                >
                    {isApproving && <Spinner aria-hidden="true" className="size-4" />}
                    {t(isApproving ? "oauth.authorize.approving" : "oauth.authorize.approve")}
                </button>
            </form>
            <button
                type="button"
                onClick={deny}
                className={CONSENT_OUTLINE_BUTTON_CLASS}
                disabled={pendingDecision !== null}
                aria-busy={isDenying}
                aria-label={isDenying ? t("oauth.authorize.denying") : denyAriaLabel}
            >
                {isDenying && <Spinner aria-hidden="true" className="size-4" />}
                {t(isDenying ? "oauth.authorize.denying" : "oauth.authorize.deny")}
            </button>
        </>
    );
}
