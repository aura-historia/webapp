import { useState } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { env } from "@/env";
import { FEDERATED_AUTH_PROVIDERS } from "@/features/authentication/config/federatedAuthProviders.ts";
import {
    createFederatedAuthState,
    type FederatedAuthIntent,
} from "@/features/authentication/lib/federatedAuthState.ts";

type FederatedAuthOptionsProps = {
    readonly intent: FederatedAuthIntent;
    readonly redirect?: string;
    readonly locale: string;
};

export function FederatedAuthOptions({ intent, redirect, locale }: FederatedAuthOptionsProps) {
    const { t } = useTranslation();
    const [initiatingProviderId, setInitiatingProviderId] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const isOAuthConfigured = Boolean(
        env.VITE_COGNITO_DOMAIN &&
            env.VITE_COGNITO_REDIRECT_SIGN_IN &&
            env.VITE_COGNITO_REDIRECT_SIGN_OUT,
    );

    const beginRedirect = async (
        providerId: string,
        signInProvider: "Google" | { custom: string },
    ) => {
        setInitiatingProviderId(providerId);
        setHasError(false);

        try {
            await signInWithRedirect({
                provider: signInProvider,
                customState: createFederatedAuthState({
                    intent,
                    locale,
                    redirectPath: redirect,
                }),
            });
        } catch {
            // Keep provider and OAuth details out of UI, logs, and analytics.
            setHasError(true);
        } finally {
            setInitiatingProviderId(null);
        }
    };

    if (!isOAuthConfigured) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {FEDERATED_AUTH_PROVIDERS.map((provider) => (
                    <Button
                        key={provider.id}
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={initiatingProviderId !== null}
                        onClick={() => beginRedirect(provider.id, provider.signInProvider)}
                    >
                        {initiatingProviderId === provider.id && <Spinner />}
                        {t(provider.labelKey)}
                    </Button>
                ))}
            </div>

            {hasError && (
                <p role="alert" className="text-sm text-destructive">
                    {t("auth.federated.error")}
                </p>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div aria-hidden="true" className="h-px flex-1 bg-border" />
                <span>{t("auth.federated.or")}</span>
                <div aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
        </div>
    );
}
