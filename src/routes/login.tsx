import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { motion, AnimatePresence } from "motion/react";
import { useMediaQuery } from "usehooks-ts";
import { Authenticator } from "@/components/auth/Authenticator.tsx";
import { registrationStore, resetAuth } from "@/stores/registrationStore";
import { useUserAccount } from "@/hooks/useUserAccount";
import "../amplify-config";
import { useQueryClient } from "@tanstack/react-query";
import { CompleteRegistration } from "@/components/auth/CompleteRegistration.tsx";

type LoginSearch = {
    redirect?: string;
};

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearch => {
        const redirect = typeof search.redirect === "string" ? search.redirect : undefined;

        if (redirect?.startsWith("/login")) {
            return { redirect: undefined };
        }

        return { redirect };
    },
    component: LoginPage,
});

function LoginPage() {
    const { redirect: redirectParam } = Route.useSearch();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAuthComplete = useStore(registrationStore, (state) => state.isAuthComplete);
    const isUserAuthenticated = useStore(registrationStore, (state) => state.isUserAuthenticated); // ← ADD!

    const isSignUpFlow = useStore(registrationStore, (state) => state.isSignUpFlow);
    const { data: userAccount, isFetching } = useUserAccount(isAuthComplete);
    const [showAnimation, setShowAnimation] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.removeQueries({ queryKey: ["userAccount"] });
        resetAuth();
    }, [queryClient]);
    useEffect(() => {
        if (!isAuthComplete || showAnimation) return;

        if (!isFetching) {
            setShowAnimation(true);
            return;
        }

        const proceedWithoutUserDataTimer = setTimeout(() => {
            setShowAnimation(true);
        }, 5000);

        return () => clearTimeout(proceedWithoutUserDataTimer);
    }, [isAuthComplete, isFetching, showAnimation]);

    useEffect(() => {
        if (!showAnimation) return;

        const navigationTimer = setTimeout(() => {
            navigate({
                to: redirectParam || "/",
                viewTransition: true,
            });
            resetAuth();
        }, 3000);

        return () => {
            clearTimeout(navigationTimer);
            resetAuth();
        };
    }, [showAnimation, navigate, redirectParam]);

    if (isUserAuthenticated && !isAuthComplete) {
        return <CompleteRegistration />;
    }

    const userName =
        `${userAccount?.firstName || ""} ${userAccount?.lastName || ""}`.trim() || null;
    const welcomeText = `${isSignUpFlow ? t("auth.welcome") : t("auth.welcomeBack")}${userName ? `, ${userName}` : ""}!`;

    return (
        <div className="flex flex-col gap-8 lg:gap-0 lg:grid lg:grid-cols-[2fr_auto_3fr] min-h-screen w-full">
            <motion.div
                className="flex flex-col items-center justify-start lg:justify-center pt-12 lg:pt-0 px-6 lg:px-0 pb-8 lg:pb-0 w-full"
                animate={{
                    x: showAnimation && isDesktop ? "30vw" : 0,
                    y: showAnimation && !isDesktop ? "30vh" : 0,
                }}
                transition={{ duration: 0.8 }}
            >
                <span className="text-3xl lg:text-4xl font-bold text-center">Aura Historia</span>
                <div
                    className="mt-6 text-center relative w-full max-w-full px-4"
                    style={{ minHeight: "80px" }}
                >
                    <AnimatePresence mode="wait">
                        {!showAnimation ? (
                            <motion.p
                                key="subtitle"
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="text-lg lg:text-xl text-muted-foreground"
                            >
                                {t("auth.subtitle")}
                            </motion.p>
                        ) : (
                            <motion.p
                                key="welcome"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="text-lg lg:text-xl text-muted-foreground"
                            >
                                {welcomeText}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <motion.div
                className="hidden lg:flex items-center justify-center"
                animate={{ opacity: showAnimation ? 0 : 1 }}
            >
                <div className="w-px bg-gray-300 h-[80%]"></div>
            </motion.div>

            <motion.div
                className="flex justify-center items-start lg:items-center px-6 lg:px-0 pb-12 lg:pb-0 w-full"
                animate={{ opacity: showAnimation ? 0 : 1 }}
            >
                {isAuthComplete && !showAnimation ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-sm lg:text-base">
                            {isSignUpFlow
                                ? t("auth.completingRegistration")
                                : t("auth.completingLogin")}
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-md">
                        <Authenticator />
                    </div>
                )}
            </motion.div>
        </div>
    );
}
