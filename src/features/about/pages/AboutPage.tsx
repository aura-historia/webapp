import { AboutAudienceSection } from "@/features/about/components/sections/AboutAudienceSection.tsx";
import { AboutDifferenceSection } from "@/features/about/components/sections/AboutDifferenceSection.tsx";
import { AboutFaqSection } from "@/features/about/components/sections/AboutFaqSection.tsx";
import { AboutHeroSection } from "@/features/about/components/sections/AboutHeroSection.tsx";
import { AboutServicesSection } from "@/features/about/components/sections/AboutServicesSection.tsx";
import { AboutTeamSection } from "@/features/about/components/sections/AboutTeamSection.tsx";

export function AboutPage() {
    return (
        <div className="bg-surface">
            <AboutHeroSection />
            <AboutServicesSection />
            <AboutDifferenceSection />
            <AboutAudienceSection />
            <AboutTeamSection />
            <AboutFaqSection />
        </div>
    );
}
