import {
    ComparisonAlertsSection,
    ComparisonFaqSection,
    ComparisonSourcesSection,
    ComparisonVerdictSection,
} from "@/features/comparison/components/sections/ComparisonClosingSections.tsx";
import { ComparisonHeroSection } from "@/features/comparison/components/sections/ComparisonHeroSection.tsx";
import {
    ComparisonAdvantagesSection,
    ComparisonRespectSection,
    ComparisonSummarySection,
} from "@/features/comparison/components/sections/ComparisonIntroSections.tsx";
import { ComparisonJumpNav } from "@/features/comparison/components/sections/ComparisonJumpNav.tsx";
import { ComparisonOtherComparisonsSection } from "@/features/comparison/components/sections/ComparisonOtherComparisonsSection.tsx";
import { ComparisonScorecardSection } from "@/features/comparison/components/sections/ComparisonScorecardSection.tsx";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";

/**
 * Aura Historia vs a competitor: one h1, then chapters the jump links address by id. The definition
 * decides the data and the optional chapters; copy comes from its namespace. Other published
 * comparisons follow the article.
 */
export function ComparisonPage({ definition }: { readonly definition: ComparisonDefinition }) {
    return (
        <>
            <article className="bg-surface text-ink">
                <ComparisonHeroSection definition={definition} />
                <ComparisonJumpNav definition={definition} />
                <ComparisonSummarySection definition={definition} />
                <ComparisonRespectSection definition={definition} />
                <ComparisonAdvantagesSection definition={definition} />
                <ComparisonScorecardSection definition={definition} />
                {definition.sources && (
                    <ComparisonSourcesSection
                        namespace={definition.namespace}
                        sources={definition.sources}
                    />
                )}
                {definition.alerts && (
                    <ComparisonAlertsSection
                        namespace={definition.namespace}
                        alerts={definition.alerts}
                    />
                )}
                <ComparisonFaqSection definition={definition} />
                <ComparisonVerdictSection definition={definition} />
            </article>
            <ComparisonOtherComparisonsSection currentSlug={definition.slug} />
        </>
    );
}
