import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { PartnerApplicationsSection } from "@/features/partner-dashboard/components/PartnerApplicationsSection.tsx";

export function PartnerDashboardPage() {
    const { t } = useTranslation();

    return (
        <div className="w-full px-4 py-8 md:px-8 md:py-12">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <header className="flex flex-col gap-2">
                    <H1 className="text-4xl md:text-5xl">{t("partnerDashboard.title")}</H1>
                    <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                        {t("partnerDashboard.description")}
                    </p>
                </header>
                <PartnerApplicationsSection />
            </div>
        </div>
    );
}
