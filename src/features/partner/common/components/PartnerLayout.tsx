import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { PartnerSidebar } from "@/features/partner/common/components/PartnerSidebar.tsx";

interface PartnerLayoutProps {
    readonly children: ReactNode;
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-10">
            <H1>{t("partnerDashboard.title")}</H1>
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                <aside className="lg:w-56 lg:shrink-0">
                    <PartnerSidebar />
                </aside>
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
