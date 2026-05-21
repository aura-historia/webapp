import PartnerFAQSection from "@/components/partners/sections/PartnerFAQSection.tsx";
import PartnerFinalCtaSection from "@/components/partners/sections/PartnerFinalCtaSection.tsx";
import PartnerHeroSection from "@/components/partners/sections/PartnerHeroSection.tsx";
import PartnerHowEasySection from "@/components/partners/sections/PartnerHowEasySection.tsx";
import PartnerIntegrationsSection from "@/components/partners/sections/PartnerIntegrationsSection.tsx";
import PartnerMotivationSection from "@/components/partners/sections/PartnerMotivationSection.tsx";
import PartnerStatsSection from "@/components/partners/sections/PartnerStatsSection.tsx";
import { PARTNERS_PAGE_FRAGMENTS } from "@/components/partners/PartnersPage.fragments.ts";

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
