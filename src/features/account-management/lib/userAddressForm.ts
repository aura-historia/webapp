import {
    isBoundedSingleLine,
    isBoundedText,
    MAX_ADDRESS_TEXT_BYTES,
    MAX_POSTAL_CODE_BYTES,
} from "@/data/internal/geography/GeographicAssertions.ts";
import {
    getSubdivisionCountry,
    parseCountryCode,
    parseSubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    MAX_USER_ADDRESS_LABEL_BYTES,
    type UserAddress,
    type UserAddressInput,
} from "@/data/internal/geography/UserAddress.ts";

/** Text fields hold the input verbatim; blank optional fields mean "not asserted". */
export type UserAddressFormValues = {
    readonly label: string;
    readonly addressText: string;
    readonly country: string;
    readonly subdivision: string;
    readonly postalCode: string;
};

export type UserAddressFormField = keyof UserAddressFormValues;

/** Translation keys of field errors, in field order. */
export type UserAddressFormErrors = Partial<Record<UserAddressFormField, string>>;

export const USER_ADDRESS_FORM_FIELDS: readonly UserAddressFormField[] = [
    "label",
    "addressText",
    "country",
    "subdivision",
    "postalCode",
];

export const EMPTY_USER_ADDRESS_FORM: UserAddressFormValues = {
    label: "",
    addressText: "",
    country: "",
    subdivision: "",
    postalCode: "",
};

export function toUserAddressFormValues(address?: UserAddress): UserAddressFormValues {
    if (!address) return EMPTY_USER_ADDRESS_FORM;
    const { geography } = address;
    return {
        label: address.label,
        addressText: geography.addressText ?? "",
        country: geography.country ?? "",
        subdivision: geography.subdivision ?? "",
        postalCode: geography.postalCode ?? "",
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

    const country = values.country ? parseCountryCode(values.country) : undefined;
    if (values.country && !country) errors.country = "account.addresses.validation.countryInvalid";

    if (values.subdivision) {
        const subdivision = parseSubdivisionCode(values.subdivision);
        if (!subdivision || (country && getSubdivisionCountry(subdivision) !== country)) {
            errors.subdivision = "account.addresses.validation.subdivisionMismatch";
        }
    }

    if (
        !isBlank(values.postalCode) &&
        !isBoundedSingleLine(values.postalCode, MAX_POSTAL_CODE_BYTES)
    ) {
        errors.postalCode = "account.addresses.validation.postalCodeInvalid";
    }
    return errors;
}

export function firstInvalidField(errors: UserAddressFormErrors): UserAddressFormField | undefined {
    return USER_ADDRESS_FORM_FIELDS.find((field) => errors[field]);
}

/**
 * Builds the complete replacing input. Label and address are kept as entered; blank optional
 * fields are omitted so the backend stores no assertion.
 */
export function buildUserAddressInput(values: UserAddressFormValues): UserAddressInput {
    const country = parseCountryCode(values.country);
    const subdivision = parseSubdivisionCode(values.subdivision);
    return {
        label: values.label,
        geography: {
            addressText: values.addressText,
            ...(country && { country }),
            ...(subdivision && { subdivision }),
            ...(!isBlank(values.postalCode) && { postalCode: values.postalCode }),
        },
    };
}
