import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { ConsentToggle } from "@/features/consent-management/components/ConsentToggle.tsx";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

interface ConsentPurposeRowProps {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly checked: boolean;
    readonly onCheckedChange: (checked: boolean) => void;
}

function ConsentPurposeRow({
    id,
    label,
    description,
    checked,
    onCheckedChange,
}: ConsentPurposeRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-line-subtle py-5 last:border-b-0 sm:gap-6 sm:py-7">
            <div className="flex min-w-0 flex-col gap-2">
                <h2 className="font-sans text-body font-medium text-ink">{label}</h2>
                <p className="text-body-sm text-ink-secondary">{description}</p>
            </div>
            <ConsentToggle
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                aria-label={label}
                className="-mt-3 -mr-[5px]"
            />
        </div>
    );
}

export function ConsentSettingsPage() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { t } = useTranslation();

    const isAnalyticsEnabled = preferences.trackingConsent === true;
    const isExternalMapEnabled = preferences.externalMapConsent === true;

    const handleAnalyticsToggle = (checked: boolean) => {
        updatePreferences({ trackingConsent: checked });
        toast.success(t("consentSettings.saved"));
    };

    const handleExternalMapToggle = (checked: boolean) => {
        updatePreferences({ externalMapConsent: checked });
        toast.success(t("consentSettings.saved"));
    };

    return (
        <div className="mx-auto w-full max-w-[calc(1280px+2*var(--page-gutter))] px-(--page-gutter) pt-8 pb-24 sm:pt-14 sm:pb-36">
            <header className="mb-6 flex flex-col gap-3 border-b border-line-subtle pb-6 sm:gap-4 sm:pb-9 lg:mb-14">
                <p className="font-mono text-[11px] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow">
                    {t("legal.eyebrow")}
                </p>
                <h1 className="font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] text-ink sm:text-display-section">
                    {t("consentSettings.title")}
                </h1>
                <p className="max-w-[760px] font-sans text-[17px] leading-[1.55] text-ink-secondary sm:text-lead">
                    <Trans
                        i18nKey="consentSettings.description"
                        components={{
                            1: (
                                <Link
                                    to="/$lng/privacy"
                                    className="underline decoration-line-strong underline-offset-3 transition-colors hover:text-brass-ink hover:decoration-current focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
                                    params={true}
                                    from="/$lng"
                                />
                            ),
                        }}
                    />
                </p>
            </header>

            <div className="max-w-[760px] rounded-panel bg-surface-raised px-5 text-ink shadow-ring sm:px-8">
                <ConsentPurposeRow
                    id="analytics-consent"
                    label={t("consentSettings.analyticsLabel")}
                    description={t("consentSettings.analyticsDescription")}
                    checked={isAnalyticsEnabled}
                    onCheckedChange={handleAnalyticsToggle}
                />
                <ConsentPurposeRow
                    id="external-map-consent"
                    label={t("consentSettings.externalMapsLabel")}
                    description={t("consentSettings.externalMapsDescription")}
                    checked={isExternalMapEnabled}
                    onCheckedChange={handleExternalMapToggle}
                />
            </div>
        </div>
    );
}
