import { describe, expect, it } from "vitest";
import { validatePartnerApplicationsSearch } from "../partnerApplicationsSearch.ts";

describe("validatePartnerApplicationsSearch", () => {
    it("opens the create dialog for create=true", () => {
        expect(validatePartnerApplicationsSearch({ create: "true" })).toEqual({ create: true });
    });

    it("keeps a provider slug alongside create", () => {
        expect(
            validatePartnerApplicationsSearch({ create: true, provider: " hartley-finch-42 " }),
        ).toEqual({ create: true, provider: "hartley-finch-42" });
    });

    it("drops a provider without create", () => {
        expect(validatePartnerApplicationsSearch({ provider: "hartley-finch" })).toEqual({});
    });

    it.each([[""], ["-leading"], ["with space"], ["a/b"], ["x".repeat(201)], [42], [null]])(
        "drops a malformed provider such as %j",
        (provider) => {
            expect(validatePartnerApplicationsSearch({ create: "true", provider })).toEqual({
                create: true,
            });
        },
    );
});
