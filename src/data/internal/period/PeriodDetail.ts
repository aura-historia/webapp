import type { GetPeriodData } from "@/client";

/**
 * Internal representation of detailed period information.
 */
export type PeriodDetail = {
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
    /**
     * Localized description
     */
    description: string;
    /**
     * When the period was created
     */
    created: Date;
    /**
     * When the period was last updated
     */
    updated: Date;
};

/**
 * Maps API period details data to the internal PeriodDetail format.
 */
export const mapToPeriodDetail = (data: GetPeriodData): PeriodDetail => {
    return {
        periodId: data.periodId,
        periodKey: data.periodKey,
        name: data.name.text,
        description: "", // TODO
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
};
