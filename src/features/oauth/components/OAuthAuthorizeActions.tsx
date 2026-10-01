import { Button } from "@/components/ui/button.tsx";
import { OAUTH_AUTHORIZE_APPROVE_ACTION } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { useTranslation } from "react-i18next";
import { useParams } from "@tanstack/react-router";
import { useId } from "react";

interface OAuthAuthorizeActionsProps {
    readonly approveAriaLabel: string;
    readonly denyAriaLabel: string;
    readonly isApproveDisabled: boolean;
    readonly listingSourceId: string | undefined;
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizeActions({
    approveAriaLabel,
    denyAriaLabel,
    isApproveDisabled,
    listingSourceId,
    searchParams,
}: OAuthAuthorizeActionsProps) {
    const { t } = useTranslation();
    const { lng } = useParams({ from: "/$lng" });
    const formId = useId();

    return (
        <>
            <form
                id={formId}
                action={OAUTH_AUTHORIZE_APPROVE_ACTION}
                method="post"
                className="w-full sm:w-auto"
            >
                <input type="hidden" name="lng" value={lng} />
                <input type="hidden" name="response_type" value={searchParams.response_type} />
                <input type="hidden" name="client_id" value={searchParams.client_id} />
                <input type="hidden" name="redirect_uri" value={searchParams.redirect_uri} />
                <input
                    type="hidden"
                    name="requires_listing_source_id"
                    value={String(searchParams.requires_listing_source_id)}
                />
                {searchParams.scope !== undefined && (
                    <input type="hidden" name="scope" value={searchParams.scope} />
                )}
                {searchParams.state !== undefined && (
                    <input type="hidden" name="state" value={searchParams.state} />
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
                <Button
                    type="submit"
                    name="decision"
                    value="approve"
                    className="w-full sm:w-auto"
                    disabled={isApproveDisabled}
                    aria-label={approveAriaLabel}
                >
                    {t("oauth.authorize.approve")}
                </Button>
            </form>
            <Button
                type="submit"
                form={formId}
                name="decision"
                value="deny"
                variant="outline"
                className="w-full sm:w-auto"
                aria-label={denyAriaLabel}
            >
                {t("oauth.authorize.deny")}
            </Button>
        </>
    );
}
