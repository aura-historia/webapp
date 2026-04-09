import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation, Trans } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function ConsentBanner() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    // Initially don't render this on the client, so we don't have a hydration mismatch
    // After first render, we trigger a re-render: This time we return the actual banner component
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (typeof preferences.trackingConsent === "boolean") {
        return null;
    }

    const handleAccept = () => {
        updatePreferences({ trackingConsent: true });
    };

    const handleReject = () => {
        updatePreferences({ trackingConsent: false });
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-in slide-in-from-bottom-full duration-500 ease-out">
            <div className="mx-auto max-w-4xl overflow-hidden border bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:bg-slate-900/90 dark:border-slate-800">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                            {t("consent.title")}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            <Trans
                                i18nKey="consent.description"
                                components={{
                                    1: (
                                        <Link
                                            to="/privacy"
                                            className="underline hover:text-foreground"
                                        />
                                    ),
                                }}
                            />
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <Button variant="ghost" onClick={handleReject} className="w-full sm:w-auto">
                            {t("consent.reject")}
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleAccept}
                            className="w-full sm:w-auto"
                        >
                            {t("consent.accept")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
