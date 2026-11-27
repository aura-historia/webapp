import { PressColourSection } from "@/features/press/components/PressColourSection.tsx";
import { PressContactSection } from "@/features/press/components/PressContactSection.tsx";
import { PressDescriptionsSection } from "@/features/press/components/PressDescriptionsSection.tsx";
import { PressFactsSection } from "@/features/press/components/PressFactsSection.tsx";
import { PressHeroSection } from "@/features/press/components/PressHeroSection.tsx";
import { PressImagesSection } from "@/features/press/components/PressImagesSection.tsx";
import { PressLogoSection } from "@/features/press/components/PressLogoSection.tsx";
import { PressTypographySection } from "@/features/press/components/PressTypographySection.tsx";
import { PressUsageSection } from "@/features/press/components/PressUsageSection.tsx";

/** `/{lang}/press`: facts, descriptions, logos, colours and typefaces for coverage of Aura Historia. */
export function PressPage() {
    return (
        <div className="bg-surface">
            <PressHeroSection />
            <PressFactsSection />
            <PressDescriptionsSection />
            <PressLogoSection />
            <PressColourSection />
            <PressTypographySection />
            <PressImagesSection />
            <PressUsageSection />
            <PressContactSection />
        </div>
    );
}
