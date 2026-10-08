import { useNavigate } from "@tanstack/react-router";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { storePendingEmail } from "@/features/authentication/components/pendingSignUpEmail.ts";
import {
    type FederatedAuthRedirectResult,
    federatedAuthRedirect,
} from "@/features/authentication/lib/federatedAuthRedirect.ts";
import { localizeHref } from "@/i18n/routing.ts";

type CompletionContext = {
    navigate: ReturnType<typeof useNavigate>;
    t: ReturnType<typeof useTranslation>["t"];
    language: string;
};

async function completeFederatedAuthRedirect(
    result: FederatedAuthRedirectResult,
    { navigate, t, language }: CompletionContext,
) {
    if (result.status === "failure") {
        toast.error(t("auth.federated.redirectFailure"));
        await navigate({ href: `/${language}/login`, replace: true });
        return;
    }

    const { state } = result;
    const locale = state?.locale ?? language;

    // Sign-up intent reuses the optional native onboarding step. Without a mapped
    // email that step cannot run, so continue straight to the destination.
    if (state?.intent === "sign-up") {
        const email = await fetchUserAttributes().then(
            (attributes) => attributes.email,
            () => undefined,
        );

        if (email) {
            storePendingEmail(email);
            const search = new URLSearchParams({ mode: "user-details" });
            if (state.redirectPath) {
                search.set("redirect", state.redirectPath);
            }
            await navigate({ href: `/${locale}/login?${search}`, replace: true });
            return;
        }
    }

    await navigate({
        href: state?.redirectPath ? localizeHref(state.redirectPath, locale) : `/${locale}`,
        replace: true,
    });
}

/** Routes the user after a Cognito federated sign-in redirect. Mount once in the app shell. */
export function useFederatedAuthRedirectCompletion() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const contextRef = useRef<CompletionContext>({ navigate, t, language: i18n.language });
    contextRef.current = { navigate, t, language: i18n.language };

    useEffect(
        () =>
            federatedAuthRedirect.subscribe((result) => {
                void completeFederatedAuthRedirect(result, contextRef.current);
            }),
        [],
    );
}
