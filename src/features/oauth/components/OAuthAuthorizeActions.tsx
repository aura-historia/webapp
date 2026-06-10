import { Button } from "@/components/ui/button.tsx";
import { OAUTH_AUTHORIZE_APPROVE_ACTION } from "@/features/oauth/lib/oauthAuthorizeUrls.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { useTranslation } from "react-i18next";

interface OAuthAuthorizeActionsProps {
    readonly approveAriaLabel: string;
    readonly denyAriaLabel: string;
    readonly isApproveDisabled: boolean;
    readonly onDeny: () => void;
    readonly partnerShopId: string | undefined;
    readonly searchParams: OAuthAuthorizeSearchParams;
}

export function OAuthAuthorizeActions({
    approveAriaLabel,
    denyAriaLabel,
    isApproveDisabled,
    onDeny,
    partnerShopId,
    searchParams,
}: OAuthAuthorizeActionsProps) {
    const { t } = useTranslation();

    return (
        <>
            <form
                action={OAUTH_AUTHORIZE_APPROVE_ACTION}
                method="post"
                className="w-full sm:w-auto"
            >
                <input type="hidden" name="response_type" value={searchParams.response_type} />
                <input type="hidden" name="client_id" value={searchParams.client_id} />
                <input type="hidden" name="redirect_uri" value={searchParams.redirect_uri} />
                {searchParams.scope !== undefined && (
                    <input type="hidden" name="scope" value={searchParams.scope} />
                )}
                {searchParams.state !== undefined && (
                    <input type="hidden" name="state" value={searchParams.state} />
                )}
                {partnerShopId !== undefined && (
                    <input type="hidden" name="partner_shop_id" value={partnerShopId} />
                )}
                <input type="hidden" name="code_challenge" value={searchParams.code_challenge} />
                <input
                    type="hidden"
                    name="code_challenge_method"
                    value={searchParams.code_challenge_method}
                />
                <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isApproveDisabled}
                    aria-label={approveAriaLabel}
                >
                    {t("oauth.authorize.approve")}
                </Button>
            </form>
            <Button
                type="button"
                variant="outline"
                onClick={onDeny}
                className="w-full sm:w-auto"
                aria-label={denyAriaLabel}
            >
                {t("oauth.authorize.deny")}
            </Button>
        </>
    );
}
