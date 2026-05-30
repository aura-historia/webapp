import { PARTNERS_PAGE_FRAGMENTS } from "@/features/partners/components/PartnersPage.fragments.ts";
import PartnerFAQSection from "@/features/partners/components/sections/PartnerFAQSection.tsx";
import PartnerFinalCtaSection from "@/features/partners/components/sections/PartnerFinalCtaSection.tsx";
import PartnerHeroSection from "@/features/partners/components/sections/PartnerHeroSection.tsx";
import PartnerHowEasySection from "@/features/partners/components/sections/PartnerHowEasySection.tsx";
import PartnerIntegrationsSection from "@/features/partners/components/sections/PartnerIntegrationsSection.tsx";
import PartnerMotivationSection from "@/features/partners/components/sections/PartnerMotivationSection.tsx";
import PartnerStatsSection from "@/features/partners/components/sections/PartnerStatsSection.tsx";

export default function PartnersPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div id={PARTNERS_PAGE_FRAGMENTS.hero} className="scroll-mt-24">
                <PartnerHeroSection />
            </div>
            <div id={PARTNERS_PAGE_FRAGMENTS.motivation} className="scroll-mt-24">
                <PartnerMotivationSection />
            </div>
            <div id={PARTNERS_PAGE_FRAGMENTS.stats} className="scroll-mt-24">
                <PartnerStatsSection />
            </div>
            <div id={PARTNERS_PAGE_FRAGMENTS.integrations} className="scroll-mt-24">
                <PartnerIntegrationsSection />
            </div>
            <div id={PARTNERS_PAGE_FRAGMENTS.howEasy} className="scroll-mt-24">
                <PartnerHowEasySection />
            </div>
            <div id={PARTNERS_PAGE_FRAGMENTS.faq} className="scroll-mt-24">
                <PartnerFAQSection />
            </div>
            <div id={PARTNERS_PAGE_FRAGMENTS.apply} className="scroll-mt-24">
                <PartnerFinalCtaSection />
            </div>
        </div>
    );
}
