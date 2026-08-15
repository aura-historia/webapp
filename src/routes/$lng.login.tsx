import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { AuthFlow } from "@/components/auth/AuthFlow.tsx";
import { hasStoredPendingEmail } from "@/components/auth/pendingSignUpEmail.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";
import { useResolvedAuth } from "@/hooks/auth/useResolvedAuth.ts";
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
    component: LoginPage,
});

function LoginPage() {
    const { redirect: redirectParam, mode } = Route.useSearch();
    const { lng } = Route.useParams();
    const { t } = useTranslation();
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

    return (
        <div className="flex flex-col gap-8 lg:gap-0 lg:grid lg:grid-cols-[2fr_auto_3fr] min-h-screen w-full">
            {/* Left panel — branding */}
            <div className="flex flex-col items-center justify-start lg:justify-center pt-12 lg:pt-0 px-6 lg:px-0 pb-8 lg:pb-0 w-full">
                <span className="text-3xl text-primary lg:text-5xl font-display text-center">
                    {t("common.auraHistoria")}
                </span>
                <p className="mt-6 text-center text-lg lg:text-xl text-muted-foreground px-8">
                    {t("auth.subtitle")}
                </p>
            </div>

            {/* Divider */}
            <div className="hidden lg:flex items-center justify-center">
                <div className="w-px bg-gray-300 h-[80%]" />
            </div>

            {/* Right panel — auth form or completion state */}
            <div className="flex justify-center items-start lg:items-center px-6 lg:px-0 pb-12 lg:pb-0 w-full">
                <AuthFlow
                    step={mode || "sign-in"}
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
            </div>
        </div>
    );
}
