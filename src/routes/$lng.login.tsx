import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { hasStoredPendingEmail } from "@/features/authentication/components/pendingSignUpEmail.ts";
import { LoginPage } from "@/features/authentication/pages/LoginPage.tsx";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import type { AuthStep } from "@/features/authentication/components/AuthFlow.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";
import "../amplify-config";
import { localizeHref, stripLanguageFromPathname } from "@/i18n/routing.ts";

type LoginSearch = {
    redirect?: string;
    mode?: "sign-in" | "sign-up" | "confirm" | "user-details" | "reset-password";
};

export const Route = createFileRoute("/$lng/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearch => {
        const redirect = typeof search.redirect === "string" ? search.redirect : undefined;
        const mode = ["sign-up", "sign-in", "confirm", "user-details", "reset-password"].includes(
            String(search.mode),
        )
            ? (search.mode as LoginSearch["mode"])
            : undefined;

        if (
            redirect &&
            stripLanguageFromPathname(
                new URL(redirect, "https://aura-historia.invalid").pathname,
            ).startsWith("/login")
        ) {
            return { redirect: undefined, mode };
        }

        return { redirect, mode };
    },
    head: () =>
        generatePageHeadMeta({
            pageKey: "login",
            url: `${env.VITE_APP_URL}/login`,
            noIndex: true,
        }),
    component: LoginRoutePage,
});

function LoginRoutePage() {
    const { redirect: redirectParam, mode } = Route.useSearch();
    const { lng } = Route.useParams();
    const navigate = Route.useNavigate();
    const { isAuthenticated, isResolved } = useResolvedAuth();

    useEffect(() => {
        const isOnboardingStep = mode === "confirm" || mode === "user-details";
        const canContinueOnboarding = isOnboardingStep && hasStoredPendingEmail();

        // Redirect existing sessions away from login unless they are still
        // finishing the post-signup onboarding handoff in this browser session.
        if (isResolved && isAuthenticated && !canContinueOnboarding) {
            navigate({
                href: redirectParam ? localizeHref(redirectParam, lng) : `/${lng}`,
                viewTransition: true,
            });
        }
    }, [isAuthenticated, isResolved, lng, mode, navigate, redirectParam]);

    const step: AuthStep = mode || "sign-in";

    return (
        <LoginPage
            step={step}
            onStepChange={(newStep) => {
                navigate({
                    from: "/$lng/login",
                    search: (prev) => ({ ...prev, mode: newStep }),
                    replace: true,
                });
            }}
            onComplete={() => {
                navigate({
                    href: redirectParam ? localizeHref(redirectParam, lng) : `/${lng}`,
                    viewTransition: true,
                });
            }}
        />
    );
}
