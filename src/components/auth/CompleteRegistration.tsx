import { useEffect } from "react";
import { useStore } from "@tanstack/react-store";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { H2 } from "../typography/H2";
import {
    registrationStore,
    setAuthComplete,
    clearPendingUserData,
} from "@/stores/registrationStore";
import { useRegistrationPolling } from "@/hooks/useRegistrationPolling";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card.tsx";

export function CompleteRegistration() {
    const { t } = useTranslation();
    const navigate = useNavigate();
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

        if (registrationPolling.isTimeout || registrationPolling.isError) {
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
        registrationPolling.isTimeout,
        registrationPolling.isError,
        registrationPolling.start,
    ]);

    if (isAuthComplete) {
        return null;
    }
    //TODO: Make reusable component
    if (registrationPolling.isTimeout) {
        return (
            <Card className="flex flex-col p-8 gap-6 shadow-lg w-full">
                <div className="text-center space-y-4">
                    <H2>{t("auth.timeout.title")}</H2>
                    <p className="text-muted-foreground">{t("auth.timeout.message")}</p>
                    <p className="text-sm text-muted-foreground">
                        <strong>{t("auth.timeout.noteLabel")}</strong> {t("auth.timeout.hint")}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => registrationPolling.start()}
                        className="w-full sm:w-auto"
                    >
                        {t("auth.retry")}
                    </Button>
                    <Button
                        onClick={() => {
                            clearPendingUserData();
                            navigate({ to: "/" });
                        }}
                        className="w-full sm:w-auto"
                    >
                        {t("auth.backToHomepage")}
                    </Button>
                </div>
            </Card>
        );
    }

    if (registrationPolling.isError) {
        return (
            <Card className="flex flex-col p-8 gap-6 shadow-lg w-full">
                <div className="text-center space-y-4">
                    <H2>{t("auth.errorTitle")}</H2>
                    <p className="text-muted-foreground">
                        {registrationPolling.errorMessage || t("apiErrors.unknown")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <strong>{t("auth.timeout.noteLabel")}</strong> {t("auth.timeout.hint")}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => registrationPolling.start()}
                        className="w-full sm:w-auto"
                    >
                        {t("auth.retry")}
                    </Button>
                    <Button
                        onClick={() => {
                            clearPendingUserData();
                            navigate({ to: "/" });
                        }}
                        className="w-full sm:w-auto"
                    >
                        {t("auth.backToHomepage")}
                    </Button>
                </div>
            </Card>
        );
    }

    if (registrationPolling.isLoading) {
        return (
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                <p className="text-center">{t("auth.completingRegistration")}</p>
            </div>
        );
    }

    return null;
}
