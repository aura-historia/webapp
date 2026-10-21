import { describe, expect, it } from "vitest";
import type { PublicOverviewData } from "@/client";
import { InvalidPublicOverviewError, mapToPublicOverview } from "../PublicOverview.ts";

const data: PublicOverviewData = {
    asOf: "2026-10-19T12:00:00.123456Z",
    sourcesIndexed: 124,
    liveObjects: 182450,
    countries: 18,
    languages: 9,
    newObjectsLast7Days: 3120,
};

describe("mapToPublicOverview", () => {
    it("maps the counts and the calculation time", () => {
        expect(mapToPublicOverview(data)).toEqual({
            asOf: new Date("2026-10-19T12:00:00.123Z"),
            sourcesIndexed: 124,
            liveObjects: 182450,
            countries: 18,
            languages: 9,
            newObjectsLast7Days: 3120,
        });
    });

    it.each([
        ["a negative count", { countries: -1 }],
        ["a fractional count", { languages: 2.5 }],
        ["an invalid timestamp", { asOf: "not a date" }],
    ])("rejects %s", (_, patch) => {
        expect(() => mapToPublicOverview({ ...data, ...patch })).toThrow(
            InvalidPublicOverviewError,
        );
    });
});
