import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import {
    registrationStore,
    setAuthComplete,
    clearPendingUserData,
} from "@/stores/registrationStore";
import { useRegistrationPolling } from "@/hooks/useRegistrationPolling";
import { useTranslation } from "react-i18next";

export function CompleteRegistration() {
    const { t } = useTranslation();
    const pendingData = useStore(registrationStore, (state) => state.pendingUserData);
    const isAuthComplete = useStore(registrationStore, (state) => state.isAuthComplete);
    const isSignUpFlow = useStore(registrationStore, (state) => state.isSignUpFlow);
    const registrationPolling = useRegistrationPolling();

    useEffect(() => {
        if (isAuthComplete) return;

        if (!isSignUpFlow) {
            clearPendingUserData();
            setAuthComplete();
            return;
        }

        if (!pendingData || registrationPolling.isDone) {
            setAuthComplete();
            return;
        }

        if (!registrationPolling.isLoading) {
            registrationPolling.start();
        }
    }, [
        pendingData,
        isAuthComplete,
        isSignUpFlow,
        registrationPolling.isDone,
        registrationPolling.isLoading,
        registrationPolling.start,
    ]);

    if (isAuthComplete) {
        return null;
    }

    if (registrationPolling.isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                <p>{t("auth.completingRegistration")}</p>
            </div>
        );
    }

    return null;
}
