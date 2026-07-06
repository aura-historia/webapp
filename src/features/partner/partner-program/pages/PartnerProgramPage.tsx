import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import PartnerFAQSection from "@/features/partner/partner-program/components/sections/PartnerFAQSection.tsx";
import PartnerFinalCtaSection from "@/features/partner/partner-program/components/sections/PartnerFinalCtaSection.tsx";
import PartnerHeroSection from "@/features/partner/partner-program/components/sections/PartnerHeroSection.tsx";
import PartnerHowEasySection from "@/features/partner/partner-program/components/sections/PartnerHowEasySection.tsx";
import PartnerIntegrationsSection from "@/features/partner/partner-program/components/sections/PartnerIntegrationsSection.tsx";
import PartnerMotivationSection from "@/features/partner/partner-program/components/sections/PartnerMotivationSection.tsx";
import PartnerStatsSection from "@/features/partner/partner-program/components/sections/PartnerStatsSection.tsx";

export default function PartnerProgramPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div id={PARTNER_PROGRAM_FRAGMENTS.hero} className="scroll-mt-24">
                <PartnerHeroSection />
            </div>
            <div id={PARTNER_PROGRAM_FRAGMENTS.motivation} className="scroll-mt-24">
                <PartnerMotivationSection />
            </div>
            <div id={PARTNER_PROGRAM_FRAGMENTS.stats} className="scroll-mt-24">
                <PartnerStatsSection />
            </div>
            <div id={PARTNER_PROGRAM_FRAGMENTS.integrations} className="scroll-mt-24">
                <PartnerIntegrationsSection />
            </div>
            <div id={PARTNER_PROGRAM_FRAGMENTS.howEasy} className="scroll-mt-24">
                <PartnerHowEasySection />
            </div>
            <div id={PARTNER_PROGRAM_FRAGMENTS.faq} className="scroll-mt-24">
                <PartnerFAQSection />
            </div>
            <div id={PARTNER_PROGRAM_FRAGMENTS.apply} className="scroll-mt-24">
                <PartnerFinalCtaSection />
            </div>
        </div>
    );
}
