import { describe, expect, it } from "vitest";
import { mapToUserAddress } from "@/data/internal/geography/UserAddress.ts";
import {
    buildUserAddressInput,
    EMPTY_USER_ADDRESS_FORM,
    firstInvalidField,
    toUserAddressFormValues,
    validateUserAddressForm,
} from "../userAddressForm.ts";

describe("saved address form", () => {
    it("requires a name and the address, in field order", () => {
        const errors = validateUserAddressForm(EMPTY_USER_ADDRESS_FORM);
        expect(errors).toEqual({
            label: "account.addresses.validation.labelRequired",
            addressText: "account.addresses.validation.addressRequired",
        });
        expect(firstInvalidField(errors)).toBe("label");
    });

    it("rejects a multi-line name, a foreign region and a multi-line postal code", () => {
        const errors = validateUserAddressForm({
            label: "Home\nflat",
            addressText: "Torstraße 12",
            country: "DE",
            subdivision: "FR-IDF",
            postalCode: "10119\n",
        });
        expect(errors).toEqual({
            label: "account.addresses.validation.labelInvalid",
            subdivision: "account.addresses.validation.subdivisionMismatch",
            postalCode: "account.addresses.validation.postalCodeInvalid",
        });
    });

    it("keeps text verbatim and omits blank optional details", () => {
        expect(
            buildUserAddressInput({
                label: " Home ",
                addressText: "Torstraße 12\n10119 Berlin",
                country: "DE",
                subdivision: "",
                postalCode: "   ",
            }),
        ).toEqual({
            label: " Home ",
            geography: { addressText: "Torstraße 12\n10119 Berlin", country: "DE" },
        });
    });

    it("prefills from the asserted values only, never the derived ones", () => {
        const address = mapToUserAddress({
            addressId: "uaddr_1",
            label: "Home",
            geography: {
                referenceRelease: "iso-codes-4.20.1",
                addressText: "Torstraße 12",
                postalCode: "010119",
            },
            inputRevision: 1,
            version: 1,
            preferred: true,
            resolution: {
                status: "ACCEPTED",
                derived: { geography: { referenceRelease: "iso-codes-4.20.1", country: "DE" } },
            },
        });
        expect(toUserAddressFormValues(address)).toEqual({
            label: "Home",
            addressText: "Torstraße 12",
            country: "",
            subdivision: "",
            postalCode: "010119",
        });
    });
});
