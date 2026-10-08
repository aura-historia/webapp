import { useState } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    FEDERATED_AUTH_PROVIDERS,
    type FederatedAuthProvider,
} from "@/features/authentication/config/federatedAuthProviders.ts";
import {
    createFederatedAuthState,
    type FederatedAuthIntent,
} from "@/features/authentication/lib/federatedAuthState.ts";

type FederatedAuthOptionsProps = {
    readonly intent: FederatedAuthIntent;
    readonly locale: string;
    readonly redirect?: string;
};

export function FederatedAuthOptions({ intent, locale, redirect }: FederatedAuthOptionsProps) {
    const { t } = useTranslation();
    const [pendingProviderId, setPendingProviderId] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    const startRedirect = async (provider: FederatedAuthProvider) => {
        setPendingProviderId(provider.id);
        setHasError(false);

        try {
            await signInWithRedirect({
                provider: provider.signInProvider,
                customState: createFederatedAuthState({
                    intent,
                    locale,
                    redirectPath: redirect,
                }),
            });
        } catch {
            setHasError(true);
        } finally {
            // Also reset on success so the button is usable after a back navigation.
            setPendingProviderId(null);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {FEDERATED_AUTH_PROVIDERS.map((provider) => {
                    const Icon = provider.icon;

                    return (
                        <Button
                            key={provider.id}
                            type="button"
                            variant="outline"
                            className="h-11 w-full"
                            disabled={pendingProviderId !== null}
                            onClick={() => startRedirect(provider)}
                        >
                            {pendingProviderId === provider.id ? (
                                <Spinner className="size-5" />
                            ) : (
                                <Icon className="size-5" />
                            )}
                            {t(provider.labelKey)}
                        </Button>
                    );
                })}
            </div>

            {hasError && (
                <p
                    role="alert"
                    className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {t("auth.federated.redirectFailure")}
                </p>
            )}

            <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
                <div aria-hidden="true" className="h-px flex-1 bg-border" />
                <span>{t("auth.federated.or")}</span>
                <div aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
        </div>
    );
}
