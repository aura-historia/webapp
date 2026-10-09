import { describe, expect, it } from "vitest";
import { validateAdminApplicationSearch } from "../adminApplicationSearch.ts";

describe("validateAdminApplicationSearch", () => {
    it("keeps known filters as URL-safe values", () => {
        expect(
            validateAdminApplicationSearch({
                states: ["IN_REVIEW", "SUBMITTED"],
                proposalTypes: "PROPOSED_LISTING_SOURCE",
                applicantUserId: " user_1 ",
                sourceId: "ls_1",
                createdFrom: "2026-09-01",
                updatedTo: "2026-09-30",
                sort: "updated",
                order: "asc",
            }),
        ).toEqual({
            states: ["SUBMITTED", "IN_REVIEW"],
            proposalTypes: ["PROPOSED_LISTING_SOURCE"],
            applicantUserId: "user_1",
            sourceId: "ls_1",
            createdFrom: "2026-09-01",
            updatedTo: "2026-09-30",
            sort: "updated",
            order: "asc",
        });
    });

    it("drops unknown, malformed and oversized values", () => {
        expect(
            validateAdminApplicationSearch({
                states: ["PROCESSING"],
                proposalTypes: ["NEW"],
                applicantUserId: "x".repeat(129),
                sourceId: 42,
                createdFrom: "2026-9-1",
                sort: "name",
                order: "up",
                state: "APPROVED",
            }),
        ).toEqual({});
    });

    it("drops impossible calendar days", () => {
        expect(
            validateAdminApplicationSearch({ createdFrom: "2026-99-99", updatedTo: "2026-02-30" }),
        ).toEqual({});
    });

    it.each([{ sort: "updated" }, { order: "asc" }])(
        "drops an incomplete sort pair %o so the form matches the default order",
        (search) => {
            expect(validateAdminApplicationSearch(search)).toEqual({});
        },
    );
});
