import { describe, expect, it } from "vitest";
import {
    mapToPartyLocationManager,
    mapToPartyLocationManagerPage,
    mapToPartyLocationManagerQuery,
} from "../PartyLocationManager.ts";

describe("PartyLocationManager mapping", () => {
    it("keeps explicit and partnership access as independent reasons", () => {
        expect(
            mapToPartyLocationManager({
                userId: "usr_1",
                email: "both@example.test",
                firstName: "Grace",
                lastName: "Hopper",
                access: [
                    { type: "EXPLICIT" },
                    { type: "PARTNERSHIP", partnershipIds: ["psh_1", "psh_2"] },
                ],
            }),
        ).toEqual({
            userId: "usr_1",
            email: "both@example.test",
            firstName: "Grace",
            lastName: "Hopper",
            hasExplicitGrant: true,
            partnershipIds: ["psh_1", "psh_2"],
        });
        expect(
            mapToPartyLocationManager({
                userId: "usr_2",
                email: "member@example.test",
                access: [{ type: "PARTNERSHIP", partnershipIds: ["psh_1"] }],
            }),
        ).toEqual({
            userId: "usr_2",
            email: "member@example.test",
            hasExplicitGrant: false,
            partnershipIds: ["psh_1"],
        });
    });

    it("omits the cursor on the terminal page", () => {
        expect(mapToPartyLocationManagerPage({ items: [], size: 0 })).toEqual({ items: [] });
        expect(mapToPartyLocationManagerPage({ items: [], size: 0, searchAfter: "usr_9" })).toEqual(
            { items: [], searchAfter: "usr_9" },
        );
    });

    it("pages the directory and reads a single user with one item", () => {
        expect(mapToPartyLocationManagerQuery()).toEqual({ size: 21 });
        expect(mapToPartyLocationManagerQuery({ searchAfter: "usr_9" })).toEqual({
            size: 21,
            searchAfter: "usr_9",
        });
        expect(mapToPartyLocationManagerQuery({ userId: "usr_1" })).toEqual({
            size: 1,
            userId: "usr_1",
        });
    });
});
