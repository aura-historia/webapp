import { describe, expect, it } from "vitest";
import type {
    AdminPartnershipApplicationData,
    AdminPartnershipApplicationSummaryData,
} from "@/client";
import {
    canDecideApplication,
    canMarkApplicationInReview,
    encodeApplicationCursor,
    mapToAdminApplicationSearchQuery,
    mapToAdminPartnershipApplication,
    mapToAdminPartnershipApplicationPage,
    mapToAdminPartnershipApplicationSummary,
} from "../AdminPartnershipApplication.ts";

const detail: AdminPartnershipApplicationData = {
    id: "pa_1",
    applicantUserId: "user_1",
    state: "APPROVED",
    proposal: {
        type: "PROPOSED_LISTING_SOURCE",
        party: { name: "Atelier" },
        listingSource: { name: "Atelier Shop", requestedIngestionMethods: ["WEB_CRAWL"] },
    },
    approvedPartnershipId: "pship_1",
    approvedListingSourceId: "ls_1",
};
const summary: AdminPartnershipApplicationSummaryData = {
    ...detail,
    state: "SUBMITTED",
    approvedPartnershipId: null,
    approvedListingSourceId: null,
    created: "2026-09-01T10:00:00Z",
    updated: "2026-09-02T11:30:00Z",
};

describe("AdminPartnershipApplication mapping", () => {
    it("maps detail with approval references and without timestamps", () => {
        const mapped = mapToAdminPartnershipApplication(detail);
        expect(mapped).toEqual({
            id: "pa_1",
            applicantUserId: "user_1",
            state: "APPROVED",
            proposal: detail.proposal,
            approvedPartnershipId: "pship_1",
            approvedListingSourceId: "ls_1",
        });
        expect(mapped).not.toHaveProperty("created");
        expect(mapped).not.toHaveProperty("updated");
    });

    it("omits null approval references", () => {
        const mapped = mapToAdminPartnershipApplication({
            ...detail,
            approvedPartnershipId: null,
            approvedListingSourceId: null,
        });
        expect(mapped).not.toHaveProperty("approvedPartnershipId");
        expect(mapped).not.toHaveProperty("approvedListingSourceId");
    });

    it("maps summary timestamps to dates", () => {
        const mapped = mapToAdminPartnershipApplicationSummary(summary);
        expect(mapped.created).toEqual(new Date("2026-09-01T10:00:00Z"));
        expect(mapped.updated).toEqual(new Date("2026-09-02T11:30:00Z"));
    });

    it("JSON-encodes the tuple cursor and omits it on the terminal page", () => {
        expect(
            mapToAdminPartnershipApplicationPage({
                items: [summary],
                size: 1,
                searchAfter: ["2026-09-01T10:00:00Z", "pa_1"],
                total: 4,
            }),
        ).toMatchObject({ searchAfter: '["2026-09-01T10:00:00Z","pa_1"]', total: 4 });
        const terminal = mapToAdminPartnershipApplicationPage({ items: [], size: 0, total: null });
        expect(terminal).toEqual({ items: [] });
    });

    it("round-trips the cursor tuple through JSON", () => {
        const cursor = encodeApplicationCursor(["2026-09-01T10:00:00Z", 'pa_"quoted']);
        expect(JSON.parse(cursor)).toEqual(["2026-09-01T10:00:00Z", 'pa_"quoted']);
    });
});

describe("mapToAdminApplicationSearchQuery", () => {
    it("sends only the page size without filters", () => {
        expect(mapToAdminApplicationSearchQuery({})).toEqual({ size: 21 });
    });

    it("serializes every filter, the sort pair and the cursor", () => {
        expect(
            mapToAdminApplicationSearchQuery(
                {
                    states: ["SUBMITTED", "IN_REVIEW"],
                    proposalTypes: ["EXISTING_LISTING_SOURCE"],
                    applicantUserId: " user_1 ",
                    sourceId: "ls_1",
                    createdFrom: "2026-09-01",
                    createdTo: "2026-09-30",
                    updatedFrom: "2026-09-02",
                    updatedTo: "2026-09-03",
                    sort: "updated",
                    order: "asc",
                },
                '["2026-09-01T10:00:00Z","pa_1"]',
                50,
            ),
        ).toEqual({
            size: 50,
            state: ["SUBMITTED", "IN_REVIEW"],
            proposalType: ["EXISTING_LISTING_SOURCE"],
            applicantUserId: "user_1",
            listingSourceId: "ls_1",
            "created[min]": "2026-09-01T00:00:00.000Z",
            "created[max]": "2026-09-30T23:59:59.999Z",
            "updated[min]": "2026-09-02T00:00:00.000Z",
            "updated[max]": "2026-09-03T23:59:59.999Z",
            sort: "updated",
            order: "asc",
            searchAfter: '["2026-09-01T10:00:00Z","pa_1"]',
        });
    });

    it.each(["2026-99-99", "2026-02-30", "2025-02-29"])(
        "drops the impossible calendar day %s",
        (day) => {
            expect(mapToAdminApplicationSearchQuery({ createdFrom: day, updatedTo: day })).toEqual({
                size: 21,
            });
        },
    );

    it("accepts a leap day", () => {
        expect(mapToAdminApplicationSearchQuery({ createdFrom: "2028-02-29" })).toEqual({
            size: 21,
            "created[min]": "2028-02-29T00:00:00.000Z",
        });
    });

    it("drops blank IDs, malformed dates and an incomplete sort pair", () => {
        expect(
            mapToAdminApplicationSearchQuery({
                states: [],
                applicantUserId: "   ",
                createdFrom: "01.09.2026",
                sort: "updated",
            }),
        ).toEqual({ size: 21 });
    });
});

describe("transition guards", () => {
    it("allows review only from SUBMITTED and decisions only from IN_REVIEW", () => {
        const states = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"] as const;
        expect(states.filter((state) => canMarkApplicationInReview({ state }))).toEqual([
            "SUBMITTED",
        ]);
        expect(states.filter((state) => canDecideApplication({ state }))).toEqual(["IN_REVIEW"]);
    });
});
