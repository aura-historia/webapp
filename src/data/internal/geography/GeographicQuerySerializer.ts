import { createQuerySerializer } from "@/client/client/utils.gen.ts";

type QueryParams = Record<string, unknown>;

const defaultQuerySerializer = createQuerySerializer<QueryParams>();

/**
 * Serializes nested objects and arrays as indexed deep objects, e.g.
 * `geography[countries][0]=DE&geography[origin][latitude]=48.137`. Brackets stay literal and
 * values are percent-encoded. Undefined and null members are omitted.
 */
export function serializeDeepObjectQuery(name: string, value: unknown): string[] {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) {
        return value.flatMap((item, index) => serializeDeepObjectQuery(`${name}[${index}]`, item));
    }
    if (typeof value === "object") {
        return Object.entries(value).flatMap(([key, item]) =>
            serializeDeepObjectQuery(`${name}[${key}]`, item),
        );
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
        throw new RangeError(`Non-finite query value for ${name}`);
    }
    return [`${name}=${encodeURIComponent(String(value))}`];
}

/**
 * Query serializer for operations with nested deep-object parameters. The generated client
 * only serializes one object level, so the named parameters are serialized here and every other
 * parameter keeps the generated default.
 */
export function createDeepObjectQuerySerializer(
    deepObjectParameters: readonly string[],
): (query: QueryParams) => string {
    return (query) => {
        const rest: QueryParams = {};
        const deepParts: string[] = [];
        for (const [name, value] of Object.entries(query ?? {})) {
            if (deepObjectParameters.includes(name)) {
                deepParts.push(...serializeDeepObjectQuery(name, value));
            } else {
                rest[name] = value;
            }
        }
        return [defaultQuerySerializer(rest), ...deepParts].filter(Boolean).join("&");
    };
}

/** For `simpleSearchProductListings`, whose `searchAfter` stays one JSON string value. */
export const listingGeographyQuerySerializer = createDeepObjectQuerySerializer(["geography"]);

/** For `discoverPartyLocations`, whose continuation is a deep object. */
export const partyLocationDiscoveryQuerySerializer = createDeepObjectQuerySerializer([
    "geography",
    "searchAfter",
]);
