import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { useTranslation, Trans } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function ConsentBanner() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [analyticsSelected, setAnalyticsSelected] = useState(
        preferences.trackingConsent === true,
    );
    const [externalMapsSelected, setExternalMapsSelected] = useState(
        preferences.externalMapConsent === true,
    );

    // Initially don't render this on the client, so we don't have a hydration mismatch
    // After first render, we trigger a re-render: This time we return the actual banner component
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const hasAnalyticsDecision = typeof preferences.trackingConsent === "boolean";
    const hasExternalMapDecision = typeof preferences.externalMapConsent === "boolean";

    if (hasAnalyticsDecision && hasExternalMapDecision) {
        return null;
    }

    const handleAcceptAll = () => {
        updatePreferences({ trackingConsent: true, externalMapConsent: true });
    };

    const handleSaveSelection = () => {
        updatePreferences({
            trackingConsent: analyticsSelected,
            externalMapConsent: externalMapsSelected,
        });
    };

    const handleRejectAll = () => {
        updatePreferences({ trackingConsent: false, externalMapConsent: false });
    };

    return (
        <div className="fixed right-0 bottom-0 left-0 z-50 animate-in slide-in-from-bottom-full p-4 pb-safe duration-500 ease-out">
            <div className="mx-auto max-w-5xl overflow-hidden border bg-background/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 md:p-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-start">
                    <div className="space-y-3">
                        <span className="font-display text-2xl font-normal italic tracking-tight text-primary">
                            {t("consent.title")}
                        </span>
                        <p className="text-sm leading-6 text-muted-foreground">
                            <Trans
                                i18nKey="consent.description"
                                components={{
                                    1: (
                                        <Link
                                            to="/$lng/privacy"
                                            className="text-primary underline"
                                            params={true}
                                            from="/$lng"
                                        />
                                    ),
                                }}
                            />
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-surface-container-low p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-on-surface">
                                        {t("consent.analyticsLabel")}
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {t("consent.analyticsDescription")}
                                    </p>
                                </div>
                                <Switch
                                    id="banner-analytics-consent"
                                    checked={analyticsSelected}
                                    onCheckedChange={setAnalyticsSelected}
                                    aria-label={t("consent.analyticsLabel")}
                                    className="mt-1 shrink-0"
                                />
                            </div>
                        </div>

                        <div className="bg-surface-container-low p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-on-surface">
                                        {t("consent.externalMapsLabel")}
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {t("consent.externalMapsDescription")}
                                    </p>
                                </div>
                                <Switch
                                    id="banner-external-map-consent"
                                    checked={externalMapsSelected}
                                    onCheckedChange={setExternalMapsSelected}
                                    aria-label={t("consent.externalMapsLabel")}
                                    className="mt-1 shrink-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        variant="default"
                        onClick={handleAcceptAll}
                        className="h-11 rounded-none text-xs uppercase tracking-[0.12em]"
                    >
                        {t("consent.acceptAll")}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleSaveSelection}
                        className="h-11 rounded-none text-xs uppercase tracking-[0.12em]"
                    >
                        {t("consent.saveSelection")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleRejectAll}
                        className="h-11 rounded-none text-xs uppercase tracking-[0.12em]"
                    >
                        {t("consent.rejectAll")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
