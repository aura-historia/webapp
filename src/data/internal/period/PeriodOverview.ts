import type { GetPeriodSummaryData } from "@/client";

/**
 * Internal representation of a period used for overview lists and carousels.
 */
export type PeriodOverview = {
    /**
     * Kebab-case identifier of the period
     */
    periodId: string;
    /**
     * Stable key for the period
     */
    periodKey: string;
    /**
     * Localized display name
     */
    name: string;
};

/**
 * Maps API period summary data to the internal PeriodOverview format.
 */
export const mapToPeriodOverview = (data: GetPeriodSummaryData): PeriodOverview => {
    return {
        periodId: data.periodId,
        periodKey: data.periodKey,
        name: data.name.text,
    };
};
