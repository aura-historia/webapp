import { ComparisonHeroSection } from "@/features/comparison/components/sections/ComparisonHeroSection.tsx";
import {
    ComparisonAdvantagesSection,
    ComparisonRespectSection,
    ComparisonSummarySection,
} from "@/features/comparison/components/sections/ComparisonIntroSections.tsx";
import { ComparisonJumpNav } from "@/features/comparison/components/sections/ComparisonJumpNav.tsx";
import { ComparisonScorecardSection } from "@/features/comparison/components/sections/ComparisonScorecardSection.tsx";
import {
    ComparisonAlertsSection,
    ComparisonFaqSection,
    ComparisonSourcesSection,
    ComparisonVerdictSection,
} from "@/features/comparison/components/sections/ComparisonClosingSections.tsx";

/** Aura Historia vs Barnebys: one h1, then chapters that the jump links address by id. */
export function BarnebysComparisonPage() {
    return (
        <article className="bg-surface text-ink">
            <ComparisonHeroSection />
            <ComparisonJumpNav />
            <ComparisonSummarySection />
            <ComparisonRespectSection />
            <ComparisonAdvantagesSection />
            <ComparisonScorecardSection />
            <ComparisonSourcesSection />
            <ComparisonAlertsSection />
            <ComparisonFaqSection />
            <ComparisonVerdictSection />
        </article>
    );
}
