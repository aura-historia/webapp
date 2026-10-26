import { useState } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    FEDERATED_AUTH_PROVIDERS,
    type FederatedAuthProvider,
} from "@/features/authentication/config/federatedAuthProviders.ts";
import {
    createFederatedAuthState,
    type FederatedAuthIntent,
    isFederatedRedirectPathTooLong,
} from "@/features/authentication/lib/federatedAuthState.ts";
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { AUTH_OUTLINE_BUTTON_CLASS } from "@/features/authentication/lib/authStyles.ts";

type FederatedAuthOptionsProps = {
    readonly intent: FederatedAuthIntent;
    readonly locale: string;
    readonly redirect?: string;
};

export function FederatedAuthOptions({ intent, locale, redirect }: FederatedAuthOptionsProps) {
    const { t } = useTranslation();
    const [pendingProviderId, setPendingProviderId] = useState<string | null>(null);
    const [errorKey, setErrorKey] = useState<
        "auth.federated.redirectFailure" | "auth.federated.redirectTooLong" | null
    >(null);

    const startRedirect = async (provider: FederatedAuthProvider) => {
        // Signing in without the destination would silently lose it, e.g. an OAuth request.
        if (isFederatedRedirectPathTooLong(redirect)) {
            setErrorKey("auth.federated.redirectTooLong");
            return;
        }

        setPendingProviderId(provider.id);
        setErrorKey(null);

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
            setErrorKey("auth.federated.redirectFailure");
        } finally {
            // Also reset on success so the button is usable after a back navigation.
            setPendingProviderId(null);
        }
    };

    return (
        <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-2.5">
                {FEDERATED_AUTH_PROVIDERS.map((provider) => {
                    const Icon = provider.icon;

                    return (
                        <button
                            key={provider.id}
                            type="button"
                            className={AUTH_OUTLINE_BUTTON_CLASS}
                            disabled={pendingProviderId !== null}
                            aria-busy={pendingProviderId === provider.id || undefined}
                            onClick={() => startRedirect(provider)}
                        >
                            {pendingProviderId === provider.id ? (
                                <Spinner className="size-[18px]" />
                            ) : (
                                <Icon className="size-[18px]" />
                            )}
                            {t(provider.labelKey)}
                        </button>
                    );
                })}
            </div>

            {errorKey && <AuthFormAlert>{t(errorKey)}</AuthFormAlert>}

            <div className="flex items-center gap-3 font-mono text-kicker text-ink-muted uppercase">
                <div aria-hidden="true" className="h-px flex-1 bg-line" />
                <span>{t("auth.federated.or")}</span>
                <div aria-hidden="true" className="h-px flex-1 bg-line" />
            </div>
        </div>
    );
}
