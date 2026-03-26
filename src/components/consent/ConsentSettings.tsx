import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { H1 } from "@/components/typography/H1.tsx";

export function ConsentSettings() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { t } = useTranslation();

    const isEnabled = preferences.trackingConsent === true;

    const handleToggle = (checked: boolean) => {
        updatePreferences({ trackingConsent: checked });
        toast.success(t("consentSettings.saved"));
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <H1 className="mb-2">{t("consentSettings.title")}</H1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                <Trans
                    i18nKey="consentSettings.description"
                    components={{
                        1: <Link to="/privacy" className="underline hover:text-foreground" />,
                    }}
                />
            </p>

            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/60 p-5 shadow-sm backdrop-blur-sm">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                            {t("consentSettings.analyticsLabel")}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("consentSettings.analyticsDescription")}
                        </p>
                    </div>
                    <Switch
                        id="analytics-consent"
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        aria-label={t("consentSettings.analyticsLabel")}
                        className="shrink-0 mt-0.5"
                    />
                </div>
            </div>
        </div>
    );
}
