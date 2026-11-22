import {
    isBoundedSingleLine,
    isBoundedText,
    MAX_ADDRESS_TEXT_BYTES,
} from "@/data/internal/geography/GeographicAssertions.ts";
import {
    MAX_USER_ADDRESS_LABEL_BYTES,
    type UserAddress,
    type UserAddressInput,
} from "@/data/internal/geography/UserAddress.ts";

/**
 * Text fields hold the input verbatim. Country, region and postal code are not asked for: the
 * address search locates the address from its text.
 */
export type UserAddressFormValues = {
    readonly label: string;
    readonly addressText: string;
};

export type UserAddressFormField = keyof UserAddressFormValues;

/** Translation keys of field errors, in field order. */
export type UserAddressFormErrors = Partial<Record<UserAddressFormField, string>>;

export const USER_ADDRESS_FORM_FIELDS: readonly UserAddressFormField[] = ["label", "addressText"];

export const EMPTY_USER_ADDRESS_FORM: UserAddressFormValues = {
    label: "",
    addressText: "",
};

export function toUserAddressFormValues(address?: UserAddress): UserAddressFormValues {
    if (!address) return EMPTY_USER_ADDRESS_FORM;
    return {
        label: address.label,
        addressText: address.geography.addressText ?? "",
    };
}

function isBlank(value: string) {
    return value.trim().length === 0;
}

export function validateUserAddressForm(values: UserAddressFormValues): UserAddressFormErrors {
    const errors: UserAddressFormErrors = {};

    if (isBlank(values.label)) errors.label = "account.addresses.validation.labelRequired";
    else if (!isBoundedSingleLine(values.label, MAX_USER_ADDRESS_LABEL_BYTES)) {
        errors.label = "account.addresses.validation.labelInvalid";
    }

    if (isBlank(values.addressText))
        errors.addressText = "account.addresses.validation.addressRequired";
    else if (!isBoundedText(values.addressText, MAX_ADDRESS_TEXT_BYTES)) {
        errors.addressText = "account.addresses.validation.addressTooLong";
    }
    return errors;
}

export function firstInvalidField(errors: UserAddressFormErrors): UserAddressFormField | undefined {
    return USER_ADDRESS_FORM_FIELDS.find((field) => errors[field]);
}

/**
 * Builds the complete replacing input from the label and address, kept as entered. A country,
 * region or postal code asserted earlier is not sent, so saving clears it.
 */
export function buildUserAddressInput(values: UserAddressFormValues): UserAddressInput {
    return {
        label: values.label,
        geography: { addressText: values.addressText },
    };
}
