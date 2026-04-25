import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { AuthFlow } from "@/components/auth/AuthFlow.tsx";
import { registrationStore } from "@/stores/registrationStore";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";
import { useAuth } from "@/hooks/auth/useAuth.ts";
import "../amplify-config";

type LoginSearch = {
    redirect?: string;
    mode?: "sign-in" | "sign-up" | "confirm" | "user-details" | "reset-password";
};

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearch => {
        const redirect = typeof search.redirect === "string" ? search.redirect : undefined;
        const mode = ["sign-up", "sign-in", "confirm", "user-details", "reset-password"].includes(
            String(search.mode),
        )
            ? (search.mode as LoginSearch["mode"])
            : undefined;

        if (redirect?.startsWith("/login")) {
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAuthComplete = useStore(registrationStore, (state) => state.isAuthComplete);
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // Redirect if auth is complete OR if they already have an active session
        if (isAuthComplete || (!isLoading && user)) {
            navigate({
                to: redirectParam || "/",
                viewTransition: true,
            });
        }
    }, [isAuthComplete, user, isLoading, navigate, redirectParam]);

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
                {isAuthComplete ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <AuthFlow
                        step={mode || "sign-in"}
                        onStepChange={(newStep) => {
                            navigate({
                                from: "/login",
                                search: (prev) => ({ ...prev, mode: newStep }),
                                replace: true,
                            });
                        }}
                        onComplete={() => {
                            /* navigation is handled by the isAuthComplete effect above */
                        }}
                    />
                )}
            </div>
        </div>
    );
}
