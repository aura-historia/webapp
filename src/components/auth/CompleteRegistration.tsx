import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { registrationStore } from "@/stores/registrationStore";
import { useRegistrationPolling } from "@/hooks/useRegistrationPolling";
import { useTranslation } from "react-i18next";

export function CompleteRegistration({ redirect }: { redirect?: string }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const pendingData = useStore(registrationStore, (state) => state.pendingUserData);
    const polling = useRegistrationPolling();

    useEffect(() => {
        if (pendingData) {
            polling.start();
        }
    }, [pendingData, polling.start]);

    if (polling.isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                <p>{t("auth.completingRegistration")}</p>
            </div>
        );
    }

    if (polling.isError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md space-y-4 text-center">
                    <h2 className="text-xl font-bold">Ein Fehler ist aufgetreten</h2>
                    <p>{polling.errorMessage}</p>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/" })}
                        className="px-4 py-2"
                    >
                        Zur Startseite
                    </button>
                </div>
            </div>
        );
    }

    if (polling.isTimeout) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md space-y-4 text-center">
                    <h2 className="text-xl font-bold">Registrierung erfolgreich!</h2>
                    <p>
                        Ihr Account wurde erfolgreich erstellt, aber Ihre Nutzerdaten konnten
                        aufgrund des hohen Nutzeraufkommens derzeit nicht gespeichert werden. Sie
                        können Ihre Daten jederzeit in den Einstellungen nachtragen.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate({ to: redirect || "/" })}
                        className="px-4 py-2"
                    >
                        Zur App
                    </button>
                </div>
            </div>
        );
    }

    if (polling.isDone || !pendingData) {
        navigate({ to: redirect || "/" });
        return null;
    }

    return null;
}
