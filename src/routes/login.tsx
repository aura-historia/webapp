import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { motion, AnimatePresence } from "motion/react";
import { Authenticator } from "@/components/auth/Authenticator.tsx";
import { registrationStore, resetAuth } from "@/stores/registrationStore";
import { useUserAccount } from "@/hooks/useUserAccount";
import "../amplify-config";

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
    const isSignUpFlow = useStore(registrationStore, (state) => state.isSignUpFlow);
    const { data: userAccount, isFetching } = useUserAccount(isAuthComplete);
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => resetAuth(), []);

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

    const userName =
        `${userAccount?.firstName || ""} ${userAccount?.lastName || ""}`.trim() || null;
    const welcomeText = `${isSignUpFlow ? t("auth.welcome") : t("auth.welcomeBack")}${userName ? `, ${userName}` : ""}!`;

    return (
        <div className="grid grid-cols-[2fr_auto_3fr] min-h-screen">
            <motion.div
                className="flex flex-col items-center justify-center"
                animate={{ x: showAnimation ? "30vw" : 0, scale: showAnimation ? 1.1 : 1 }}
                transition={{ duration: 0.8 }}
            >
                <span className="text-4xl font-bold">Aura Historia</span>
                <div className="mt-6 text-center relative" style={{ minHeight: "32px" }}>
                    <AnimatePresence mode="wait">
                        {!showAnimation ? (
                            <motion.p
                                key="subtitle"
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="text-xl text-muted-foreground absolute left-1/2 -translate-x-1/2"
                                style={{ width: "max-content", maxWidth: "28rem" }}
                            >
                                {t("auth.subtitle")}
                            </motion.p>
                        ) : (
                            <motion.p
                                key="welcome"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="text-xl text-muted-foreground absolute left-1/2 -translate-x-1/2"
                                style={{ width: "max-content", maxWidth: "28rem" }}
                            >
                                {welcomeText}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <motion.div
                className="flex items-center justify-center"
                animate={{ opacity: showAnimation ? 0 : 1 }}
            >
                <div className="w-px bg-gray-300 h-[80%]"></div>
            </motion.div>

            <motion.div
                className="flex justify-center items-center"
                animate={{ opacity: showAnimation ? 0 : 1 }}
            >
                {isAuthComplete && !showAnimation ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                        <p>
                            {isSignUpFlow
                                ? t("auth.completingRegistration")
                                : t("auth.completingLogin")}
                        </p>
                    </div>
                ) : (
                    <Authenticator />
                )}
            </motion.div>
        </div>
    );
}
