import { describe, expect, it } from "vitest";
import {
    ADMIN_PARTNERSHIPS_PAGE_SIZE,
    mapToAdminPartnershipDetails,
    mapToAdminPartnershipPage,
    mapToAdminPartnershipSearchQuery,
    mapToAdminPartnershipSummary,
} from "../AdminPartnership.ts";

const summaryDto = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier-bleu", name: "Atelier Bleu" },
    memberCount: 120,
    listingSourceGrantCount: 3,
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};

const summary = {
    partnershipId: "psh_01",
    party: { partyId: "pty_01", partySlugId: "atelier-bleu", name: "Atelier Bleu" },
    memberCount: 120,
    listingSourceGrantCount: 3,
    created: new Date(summaryDto.created),
    updated: new Date(summaryDto.updated),
};

describe("AdminPartnership mapping", () => {
    it("maps the party, backend counts, and timestamps", () => {
        expect(mapToAdminPartnershipSummary(summaryDto)).toEqual(summary);
    });

    it("keeps returned references separate from the complete counts", () => {
        const dto = {
            ...summaryDto,
            memberUserIds: ["usr_1", "usr_2"],
            listingSourceIds: ["ls_1"],
        };
        const details = mapToAdminPartnershipDetails(dto);

        expect(details).toEqual({
            ...summary,
            memberUserIds: ["usr_1", "usr_2"],
            listingSourceIds: ["ls_1"],
        });
        expect(details.memberUserIds).not.toBe(dto.memberUserIds);
    });

    it("maps a page with its clamped size and cursor", () => {
        expect(
            mapToAdminPartnershipPage({
                items: [summaryDto],
                size: 21,
                searchAfter: ["2026-09-01T10:00:00.000Z", "psh_01"],
            }),
        ).toEqual({
            items: [summary],
            pageSize: 21,
            searchAfter: ["2026-09-01T10:00:00.000Z", "psh_01"],
        });
    });
});

describe("mapToAdminPartnershipSearchQuery", () => {
    it("omits empty filters and sends only the page size", () => {
        expect(mapToAdminPartnershipSearchQuery({})).toEqual({
            size: ADMIN_PARTNERSHIPS_PAGE_SIZE,
        });
    });

    it("includes filters and serializes the cursor", () => {
        expect(
            mapToAdminPartnershipSearchQuery(
                { partyId: "pty_01", memberUserId: "usr_1", listingSourceId: "ls_1" },
                ["2026-09-01T10:00:00.000Z", "psh_01"],
            ),
        ).toEqual({
            partyId: "pty_01",
            memberUserId: "usr_1",
            listingSourceId: "ls_1",
            searchAfter: JSON.stringify(["2026-09-01T10:00:00.000Z", "psh_01"]),
            size: ADMIN_PARTNERSHIPS_PAGE_SIZE,
        });
    });
});
