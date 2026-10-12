import type {
    BrowsingDestination as BrowsingDestinationDto,
    BrowsingDestinationView as BrowsingDestinationViewDto,
    CreateUserAddress,
    SetBrowsingDestination,
    UpdateUserAddress,
    UserAddress as UserAddressDto,
    UserAddressExpectedVersion,
    UserAddressPage as UserAddressPageDto,
    UserAddressResolution as UserAddressResolutionDto,
} from "@/client";
import { parseCountryCode, type CountryCode } from "@/data/internal/geography/GeographicCodes.ts";
import {
    isBoundedSingleLine,
    mapToBackendGeographicAssertions,
    mapToGeographicAssertions,
    MAX_POSTAL_CODE_BYTES,
    validateGeographicAssertions,
    type GeographicAssertions,
    type GeographicAssertionsInput,
    type GeographicAssertionsValidationError,
} from "@/data/internal/geography/GeographicAssertions.ts";
import {
    mapToGeographicPosition,
    type GeographicPosition,
} from "@/data/internal/geography/GeographicPosition.ts";
import {
    mapToGeographyAttribution,
    type GeographyAttribution,
} from "@/data/internal/geography/GeographyAttribution.ts";

export const USER_ADDRESS_RESOLUTION_STATUSES = [
    "PENDING",
    "ACCEPTED",
    "AMBIGUOUS",
    "NO_MATCH",
    "FAILED",
    "BLOCKED",
    "UNAVAILABLE",
] as const satisfies readonly UserAddressResolutionDto["status"][];
export type UserAddressResolutionStatus =
    | (typeof USER_ADDRESS_RESOLUTION_STATUSES)[number]
    | "UNKNOWN";

/** Provider-derived browsing enrichment. Never address, residence or delivery verification. */
export type UserAddressResolution = {
    readonly status: UserAddressResolutionStatus;
    readonly derivedGeography?: GeographicAssertions;
    readonly derivedPosition?: GeographicPosition;
    /** Show wherever derived geography is shown. */
    readonly attribution?: GeographyAttribution;
};

/** A private, named bookmark. `geography` holds only what the user asserted. */
export type UserAddress = {
    /** Opaque server-generated ID. */
    readonly addressId: string;
    readonly label: string;
    readonly geography: GeographicAssertions;
    readonly inputRevision: number;
    /** Expected version for replacement and deletion. */
    readonly version: number;
    /** Selected as the browsing destination. */
    readonly preferred: boolean;
    readonly resolution: UserAddressResolution;
};

export type UserAddressPage = {
    readonly items: readonly UserAddress[];
    /** Pass as `after`; absent when exhausted. */
    readonly next?: string;
};

export type UserAddressInput = {
    readonly label: string;
    readonly geography: GeographicAssertionsInput & { readonly addressText: string };
};

export const MAX_USER_ADDRESS_LABEL_BYTES = 128;

export type UserAddressValidationError = "LABEL_INVALID" | GeographicAssertionsValidationError;

export function mapToUserAddressResolution(data: UserAddressResolutionDto): UserAddressResolution {
    const derivedGeography = mapToGeographicAssertions(data.derived?.geography);
    const derivedPosition = mapToGeographicPosition(data.derived?.position);
    const attribution = mapToGeographyAttribution(data.attribution);
    return {
        status: USER_ADDRESS_RESOLUTION_STATUSES.find((s) => s === data.status) ?? "UNKNOWN",
        ...(derivedGeography ? { derivedGeography } : {}),
        ...(derivedPosition ? { derivedPosition } : {}),
        ...(attribution ? { attribution } : {}),
    };
}

export function mapToUserAddress(data: UserAddressDto): UserAddress {
    return {
        addressId: data.addressId,
        label: data.label,
        geography: mapToGeographicAssertions(data.geography) ?? { hasUnsupportedValues: true },
        inputRevision: data.inputRevision,
        version: data.version,
        preferred: data.preferred,
        resolution: mapToUserAddressResolution(data.resolution),
    };
}

export function mapToUserAddressPage(data: UserAddressPageDto): UserAddressPage {
    return {
        items: data.items.map(mapToUserAddress),
        ...(data.next ? { next: data.next } : {}),
    };
}

export function validateUserAddressInput(
    input: UserAddressInput,
): UserAddressValidationError | undefined {
    if (!isBoundedSingleLine(input.label, MAX_USER_ADDRESS_LABEL_BYTES)) return "LABEL_INVALID";
    if (!input.geography.addressText.trim()) return "ADDRESS_TEXT_INVALID";
    return validateGeographicAssertions(input.geography);
}

export function mapToBackendCreateUserAddress(input: UserAddressInput): CreateUserAddress {
    return {
        label: input.label,
        geography: {
            ...mapToBackendGeographicAssertions(input.geography),
            addressText: input.geography.addressText,
        },
    };
}

/** Replaces label and the complete geography under the expected version. */
export function mapToBackendUpdateUserAddress(
    input: UserAddressInput,
    expectedVersion: number,
): UpdateUserAddress {
    return { expectedVersion, ...mapToBackendCreateUserAddress(input) };
}

export function mapToBackendDeleteUserAddress(expectedVersion: number): UserAddressExpectedVersion {
    return { expectedVersion };
}

/**
 * At most one browsing destination per user. It never asserts residence, billing, nationality or
 * deliverability. `UNSUPPORTED` marks an unrecognized kind or code and must not be written back.
 */
export type BrowsingDestination =
    | { readonly kind: "NONE" }
    | { readonly kind: "ADDRESS"; readonly addressId: string }
    | {
          readonly kind: "COUNTRY_POSTAL";
          readonly country: CountryCode;
          readonly postalCode?: string;
      }
    | { readonly kind: "UNSUPPORTED" };

export type WritableBrowsingDestination = Exclude<BrowsingDestination, { kind: "UNSUPPORTED" }>;

export type BrowsingDestinationView = {
    /** Expected version for the next change. */
    readonly version: number;
    readonly destination: BrowsingDestination;
};

export function mapToBrowsingDestination(data: BrowsingDestinationDto): BrowsingDestination {
    switch (data.kind) {
        case "NONE":
            return { kind: "NONE" };
        case "ADDRESS":
            return { kind: "ADDRESS", addressId: data.addressId };
        case "COUNTRY_POSTAL": {
            const country = parseCountryCode(data.country);
            if (!country) return { kind: "UNSUPPORTED" };
            return {
                kind: "COUNTRY_POSTAL",
                country,
                ...(data.postalCode != null ? { postalCode: data.postalCode } : {}),
            };
        }
        default:
            return { kind: "UNSUPPORTED" };
    }
}

export function mapToBrowsingDestinationView(
    data: BrowsingDestinationViewDto,
): BrowsingDestinationView {
    return { version: data.version, destination: mapToBrowsingDestination(data.destination) };
}

export function isValidBrowsingDestination(destination: WritableBrowsingDestination): boolean {
    switch (destination.kind) {
        case "NONE":
            return true;
        case "ADDRESS":
            return destination.addressId.length > 0;
        case "COUNTRY_POSTAL":
            return (
                parseCountryCode(destination.country) !== undefined &&
                (destination.postalCode === undefined ||
                    isBoundedSingleLine(destination.postalCode, MAX_POSTAL_CODE_BYTES))
            );
    }
}

export function mapToBackendSetBrowsingDestination(
    destination: WritableBrowsingDestination,
    expectedVersion: number,
): SetBrowsingDestination {
    switch (destination.kind) {
        case "NONE":
            return { expectedVersion, destination: { kind: "NONE" } };
        case "ADDRESS":
            return {
                expectedVersion,
                destination: { kind: "ADDRESS", addressId: destination.addressId },
            };
        case "COUNTRY_POSTAL":
            return {
                expectedVersion,
                destination: {
                    kind: "COUNTRY_POSTAL",
                    country: destination.country,
                    ...(destination.postalCode === undefined
                        ? {}
                        : { postalCode: destination.postalCode }),
                },
            };
    }
}
