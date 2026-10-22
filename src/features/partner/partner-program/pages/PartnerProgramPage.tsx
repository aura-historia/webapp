import PartnerFAQSection from "@/features/partner/partner-program/components/sections/PartnerFAQSection.tsx";
import PartnerFinalCtaSection from "@/features/partner/partner-program/components/sections/PartnerFinalCtaSection.tsx";
import PartnerHeroSection from "@/features/partner/partner-program/components/sections/PartnerHeroSection.tsx";
import PartnerHowEasySection from "@/features/partner/partner-program/components/sections/PartnerHowEasySection.tsx";
import PartnerIntegrationsSection from "@/features/partner/partner-program/components/sections/PartnerIntegrationsSection.tsx";
import PartnerMotivationSection from "@/features/partner/partner-program/components/sections/PartnerMotivationSection.tsx";
import PartnerOwnershipSection from "@/features/partner/partner-program/components/sections/PartnerOwnershipSection.tsx";

export default function PartnerProgramPage() {
    return (
        <div className="bg-surface">
            <PartnerHeroSection />
            <PartnerMotivationSection />
            <PartnerHowEasySection />
            <PartnerIntegrationsSection />
            <PartnerOwnershipSection />
            <PartnerFAQSection />
            <PartnerFinalCtaSection />
        </div>
    );
}
