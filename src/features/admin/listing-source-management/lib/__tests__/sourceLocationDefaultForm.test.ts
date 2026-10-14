import { describe, expect, it } from "vitest";
import type { SourceLocationDefault } from "@/data/internal/geography/SourceLocationDefault.ts";
import {
    type ApplicabilityDraft,
    diffApplicabilityDraft,
    rebaseApplicabilityDraft,
    toApplicabilityDraft,
    toAssignedApplicability,
    validateApplicabilityDraft,
} from "../sourceLocationDefaultForm.ts";

const sourceDefault = (
    assignment?: SourceLocationDefault["assignment"],
): SourceLocationDefault => ({
    listingSourceId: "ls_1",
    revision: 2,
    ...(assignment ? { assignment, eligibility: "ACTIVE" as const } : {}),
    hasUnsupportedValues: false,
});

const draft = (advertisedInventory?: string, businessAssociation?: string): ApplicabilityDraft => ({
    advertisedInventory: {
        asserted: advertisedInventory !== undefined,
        reference: advertisedInventory ?? "",
    },
    businessAssociation: {
        asserted: businessAssociation !== undefined,
        reference: businessAssociation ?? "",
    },
});

describe("source location default form", () => {
    it("starts from the stored assertions", () => {
        expect(
            toApplicabilityDraft(
                sourceDefault({ partyLocationId: "ploc_1", advertisedInventory: "catalogue p. 4" }),
            ),
        ).toEqual(draft("catalogue p. 4"));
        expect(toApplicabilityDraft(sourceDefault())).toEqual(draft());
    });

    it("requires a valid single-line evidence reference for every asserted statement", () => {
        expect(validateApplicabilityDraft(draft(" ", "a\nb"))).toEqual({
            advertisedInventory: "evidenceRequired",
            businessAssociation: "evidenceInvalid",
        });
        expect(validateApplicabilityDraft(draft("x".repeat(2049)))).toEqual({
            advertisedInventory: "evidenceInvalid",
        });
        // An unasserted statement keeps its text for re-checking but is never validated or sent.
        expect(
            validateApplicabilityDraft({
                ...draft(),
                advertisedInventory: { asserted: false, reference: "a\nb" },
            }),
        ).toEqual({});
    });

    it("sends both statements of a replacing assignment, omitting unasserted ones", () => {
        expect(toAssignedApplicability(draft("inventory"))).toEqual({
            advertisedInventory: "inventory",
        });
        expect(toAssignedApplicability(draft())).toEqual({});
    });

    it("sends only changed statements: removed as null, set as their verbatim reference", () => {
        const base = draft("inventory", "business");
        expect(diffApplicabilityDraft(base, base)).toEqual({});
        expect(diffApplicabilityDraft(draft("inventory", " registry 7 "), base)).toEqual({
            businessAssociation: " registry 7 ",
        });
        expect(diffApplicabilityDraft(draft(undefined, "business"), base)).toEqual({
            advertisedInventory: null,
        });
    });

    it("reapplies only the draft's own changes onto a newer stored state", () => {
        const base = draft("inventory", "business");
        const edited = draft(undefined, "business");
        const latest = draft("inventory", "new business evidence");

        expect(rebaseApplicabilityDraft(edited, base, latest)).toEqual(
            draft(undefined, "new business evidence"),
        );
    });
});
