import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { oauthAuthorize } from "@/client";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export type OAuthAuthorizeParams = {
    readonly clientId: string;
    readonly redirectUri: string;
    readonly codeChallenge: string;
    readonly scope?: string;
    readonly state?: string;
};

export type OAuthAuthorizeResult = {
    readonly redirectUrl: string;
};

export function useOAuthAuthorize(): UseMutationResult<
    OAuthAuthorizeResult,
    Error,
    OAuthAuthorizeParams
> {
    const { getErrorMessage } = useApiError();

    return useMutation({
        mutationFn: async (params: OAuthAuthorizeParams) => {
            const result = await oauthAuthorize({
                query: {
                    response_type: "code",
                    client_id: params.clientId,
                    redirect_uri: params.redirectUri,
                    code_challenge: params.codeChallenge,
                    code_challenge_method: "S256",
                    scope: params.scope,
                    state: params.state,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            const locationHeader = result.response?.headers?.get("Location");
            if (locationHeader) {
                return { redirectUrl: locationHeader };
            }

            throw new Error("Authorization failed: no redirect location received.");
        },
    });
}
