import { describe, expect, it } from "vitest";
import {
    ADMIN_PARTY_PAGE_SIZE,
    buildCreatePartyData,
    buildUpdatePartyData,
    isPartyCalendarDay,
    mapToAdminPartyPage,
    mapToAdminPartySearchQuery,
    mapToParty,
} from "../Party.ts";

const partyDto = {
    partyId: "party_01",
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    contact: { email: "info@example.test", phone: "+33 1 23 45 67 89" },
    created: "2026-09-01T10:00:00.000Z",
    updated: "2026-09-02T11:00:00.000Z",
};

describe("Party mapping", () => {
    it("maps canonical IDs, nested contact, and timestamps", () => {
        const party = mapToParty(partyDto);
        expect(party).toEqual({
            partyId: "party_01",
            partySlugId: "atelier-bleu",
            name: "Atelier Bleu",
            contact: { email: "info@example.test", phone: "+33 1 23 45 67 89" },
            created: new Date(partyDto.created),
            updated: new Date(partyDto.updated),
        });
    });

    it("keeps omitted contact members absent and supports optional totals", () => {
        const page = mapToAdminPartyPage({
            items: [{ ...partyDto, contact: { phone: "" } }],
            size: 1,
            searchAfter: "party-cursor/opaque+token",
        });
        expect(page.items[0]?.contact).toEqual({});
        expect(page.searchAfter).toBe("party-cursor/opaque+token");
        expect(page).not.toHaveProperty("total");
    });

    it("maps query, contact, date, sort, and opaque cursor filters", () => {
        expect(
            mapToAdminPartySearchQuery(
                {
                    query: " Atelier ",
                    name: " Bleu ",
                    phone: " 123 ",
                    email: " info@example.test ",
                    createdFrom: "2026-02-28",
                    createdTo: "2026-03-01",
                    updatedFrom: "2026-02-30",
                    updatedTo: "2026-03-04",
                    sort: "email",
                    order: "desc",
                },
                "cursor/without/decoding?x=1",
            ),
        ).toEqual({
            size: ADMIN_PARTY_PAGE_SIZE,
            query: "Atelier",
            name: "Bleu",
            phone: "123",
            email: "info@example.test",
            "created[min]": "2026-02-28T00:00:00.000Z",
            "created[max]": "2026-03-01T23:59:59.999Z",
            "updated[max]": "2026-03-04T23:59:59.999Z",
            sort: "email",
            order: "desc",
            searchAfter: "cursor/without/decoding?x=1",
        });
    });

    it("validates calendar days and sends custom ordering only as a pair", () => {
        expect(isPartyCalendarDay("2024-02-29")).toBe(true);
        expect(isPartyCalendarDay("2026-02-29")).toBe(false);
        expect(mapToAdminPartySearchQuery({ sort: "updated" }).sort).toBeUndefined();
    });

    it("omits blank optional create contacts", () => {
        expect(buildCreatePartyData({ name: " Atelier Bleu ", phone: " ", email: " " })).toEqual({
            name: "Atelier Bleu",
        });
    });

    it("sends null only for cleared contacts and omits unchanged fields in a patch", () => {
        const party = mapToParty(partyDto);
        expect(
            buildUpdatePartyData(party, {
                name: party.name,
                phone: "",
                email: party.contact.email ?? "",
            }),
        ).toEqual({ phone: null });
        expect(
            buildUpdatePartyData(party, {
                name: "New Atelier",
                phone: party.contact.phone ?? "",
                email: "atelier@example.test",
            }),
        ).toEqual({ name: "New Atelier", email: "atelier@example.test" });
    });
});
