import type { PublicOverviewData } from "@/client";

/** Aggregate counts for the public catalogue, from the backend's latest scheduled calculation. */
export type PublicOverview = {
    /** When the backend counted every value; the figures are normally hours old. */
    readonly asOf: Date;
    readonly sourcesIndexed: number;
    readonly liveObjects: number;
    readonly countries: number;
    readonly languages: number;
    readonly newObjectsLast7Days: number;
};

export class InvalidPublicOverviewError extends Error {}

function count(value: number, field: string): number {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new InvalidPublicOverviewError(`Invalid public overview count: ${field}`);
    }
    return value;
}

export function mapToPublicOverview(data: PublicOverviewData): PublicOverview {
    const asOf = new Date(data.asOf);
    if (Number.isNaN(asOf.getTime())) {
        throw new InvalidPublicOverviewError("Invalid public overview timestamp");
    }

    return {
        asOf,
        sourcesIndexed: count(data.sourcesIndexed, "sourcesIndexed"),
        liveObjects: count(data.liveObjects, "liveObjects"),
        countries: count(data.countries, "countries"),
        languages: count(data.languages, "languages"),
        newObjectsLast7Days: count(data.newObjectsLast7Days, "newObjectsLast7Days"),
    };
}
