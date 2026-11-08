import { Check, Equal } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import {
    COMPARISON_SPLIT_CLASS,
    ComparisonHeading,
    ComparisonSection,
} from "@/features/comparison/components/ComparisonLayout.tsx";
import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const CELL_CLASS = "block lg:table-cell lg:border-t lg:border-line lg:px-6 lg:py-[22px]";

/**
 * IV — The scorecard: one real table. From 1024px it reads as three columns; below that every row
 * stacks its cells under their column labels, while the markup stays a table.
 */
export function ComparisonScorecardSection({
    definition,
}: {
    readonly definition: ComparisonDefinition;
}) {
    const { t } = useTranslation();
    const ns = definition.namespace;
    const competitorLabel = t(`${ns}.scorecard.headers.competitor`);
    const auraLabel = t(`${ns}.scorecard.headers.auraHistoria`);

    return (
        <ComparisonSection
            id="scorecard"
            labelledBy="comparison-scorecard-heading"
            ground="parchment"
            containerClassName="flex flex-col gap-5 sm:gap-14"
        >
            <div className={cn(COMPARISON_SPLIT_CLASS, "items-end")}>
                <ComparisonHeading id="comparison-scorecard-heading">
                    <Trans i18nKey={`${ns}.scorecard.title`} components={HEADLINE_COMPONENTS} />
                </ComparisonHeading>
                <p className="max-w-[560px] text-base leading-[1.6] text-ink-secondary sm:text-body-lg">
                    {t(`${ns}.scorecard.description`)}
                </p>
            </div>

            <div className="overflow-hidden rounded-card bg-surface-raised shadow-ring lg:overflow-x-auto">
                <table className="block w-full border-collapse text-left lg:table lg:min-w-[960px]">
                    <caption className="sr-only">{t(`${ns}.scorecard.caption`)}</caption>
                    <colgroup>
                        <col className="lg:w-[26%]" />
                        <col className="lg:w-[37%]" />
                        <col className="lg:w-[37%]" />
                    </colgroup>
                    <thead className="max-lg:sr-only">
                        <tr className="bg-surface-sunken">
                            <th scope="col" className="px-6 py-4 text-body-sm font-semibold">
                                {t(`${ns}.scorecard.headers.criterion`)}
                            </th>
                            <th scope="col" className="px-6 py-4 text-body-sm font-semibold">
                                {competitorLabel}
                            </th>
                            <th scope="col" className="px-6 py-4 text-body-sm font-semibold">
                                {auraLabel}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="block lg:table-row-group">
                        {definition.scorecardRows.map((row) => (
                            <tr
                                key={row.key}
                                className="flex flex-col gap-3 border-b border-line p-5 last:border-b-0 lg:table-row lg:border-b-0 lg:p-0 lg:align-top lg:transition-colors lg:hover:bg-surface"
                            >
                                <th scope="row" className={cn(CELL_CLASS, "font-normal")}>
                                    <span className="block font-serif text-[21px] leading-[1.25] lg:text-object-title lg:leading-[1.3]">
                                        {t(`${ns}.scorecard.rows.${row.key}.criterion`)}
                                    </span>
                                    <span className="mt-1.5 flex items-center gap-1.5 text-meta font-semibold text-ink-secondary lg:mt-2">
                                        {row.winner === "aura" && (
                                            <Check
                                                className="size-3.5 shrink-0 text-oxblood"
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {row.winner === "tie" && (
                                            <Equal
                                                className="size-3.5 shrink-0 text-ink-muted"
                                                strokeWidth={2.2}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {t(`${ns}.scorecard.rows.${row.key}.verdict`)}
                                    </span>
                                </th>
                                <ScorecardCell label={competitorLabel}>
                                    {t(`${ns}.scorecard.rows.${row.key}.competitor`)}
                                </ScorecardCell>
                                <ScorecardCell label={auraLabel}>
                                    {t(`${ns}.scorecard.rows.${row.key}.auraHistoria`)}
                                </ScorecardCell>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ComparisonSection>
    );
}

/** A description cell; stacked rows repeat the column label above it (hidden from assistive tech). */
function ScorecardCell({ label, children }: { readonly label: string; readonly children: string }) {
    return (
        <td className={CELL_CLASS}>
            <span aria-hidden="true" className="mb-1 block text-meta font-semibold lg:hidden">
                {label}
            </span>
            <p className="text-body-sm text-ink-secondary lg:text-body">{children}</p>
        </td>
    );
}
