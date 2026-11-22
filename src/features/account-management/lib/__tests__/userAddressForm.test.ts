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

    it("rejects a multi-line name and an address over the size limit", () => {
        const errors = validateUserAddressForm({
            label: "Home\nflat",
            addressText: "x".repeat(4097),
        });
        expect(errors).toEqual({
            label: "account.addresses.validation.labelInvalid",
            addressText: "account.addresses.validation.addressTooLong",
        });
    });

    it("sends the name and address verbatim and nothing else", () => {
        expect(
            buildUserAddressInput({
                label: " Home ",
                addressText: "Torstraße 12\n10119 Berlin",
            }),
        ).toEqual({
            label: " Home ",
            geography: { addressText: "Torstraße 12\n10119 Berlin" },
        });
    });

    it("prefills the name and address only, dropping earlier asserted details", () => {
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
        });
    });
});
