import { describe, expect, it } from "vitest";
import { validatePartnerCreateSearch } from "./partnerCreateSearch.ts";

describe("validatePartnerCreateSearch", () => {
    it.each([[true], ["true"]])("opens the create dialog for create=%j", (create) => {
        expect(validatePartnerCreateSearch({ create })).toEqual({ create: true });
    });

    it.each([
        [{}],
        [{ create: false }],
        [{ create: "false" }],
        [{ create: "1" }],
        [{ create: 1 }],
        [{ create: "TRUE" }],
        [{ create: null }],
    ])("drops anything else, such as %j", (search) => {
        expect(validatePartnerCreateSearch(search)).toEqual({});
    });

    it("keeps no other search parameters", () => {
        expect(validatePartnerCreateSearch({ create: "true", tab: "expired" })).toEqual({
            create: true,
        });
    });
});
