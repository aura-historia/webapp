import type { PublicOverviewData } from "@/client";

/** Indexed ListingSources split by type; the four values sum to `sourcesIndexed`. */
export type SourcesIndexedByType = {
    readonly dealers: number;
    readonly auctionHouses: number;
    readonly marketplaces: number;
    readonly auctionPlatforms: number;
};

/** Aggregate counts for the public catalogue, from the backend's latest scheduled calculation. */
export type PublicOverview = {
    /** When the backend counted every value; the figures are normally hours old. */
    readonly asOf: Date;
    readonly sourcesIndexed: number;
    readonly sourcesIndexedByType: SourcesIndexedByType;
    readonly liveObjects: number;
    readonly countries: number;
    readonly languages: number;
    readonly newObjectsLast7Days: number;
};

export class InvalidPublicOverviewError extends Error {}

function count(value: number | undefined, field: string): number {
    if (value === undefined || !Number.isSafeInteger(value) || value < 0) {
        throw new InvalidPublicOverviewError(`Invalid public overview count: ${field}`);
    }
    return value;
}

function mapSourcesIndexedByType(
    data: PublicOverviewData["sourcesIndexedByType"] | undefined,
): SourcesIndexedByType {
    if (data == null) {
        throw new InvalidPublicOverviewError("Missing public overview count: sourcesIndexedByType");
    }
    return {
        dealers: count(data.dealers, "sourcesIndexedByType.dealers"),
        auctionHouses: count(data.auctionHouses, "sourcesIndexedByType.auctionHouses"),
        marketplaces: count(data.marketplaces, "sourcesIndexedByType.marketplaces"),
        auctionPlatforms: count(data.auctionPlatforms, "sourcesIndexedByType.auctionPlatforms"),
    };
}

export function mapToPublicOverview(data: PublicOverviewData): PublicOverview {
    const asOf = new Date(data.asOf);
    if (Number.isNaN(asOf.getTime())) {
        throw new InvalidPublicOverviewError("Invalid public overview timestamp");
    }

    return {
        asOf,
        sourcesIndexed: count(data.sourcesIndexed, "sourcesIndexed"),
        sourcesIndexedByType: mapSourcesIndexedByType(data.sourcesIndexedByType),
        liveObjects: count(data.liveObjects, "liveObjects"),
        countries: count(data.countries, "countries"),
        languages: count(data.languages, "languages"),
        newObjectsLast7Days: count(data.newObjectsLast7Days, "newObjectsLast7Days"),
    };
}
