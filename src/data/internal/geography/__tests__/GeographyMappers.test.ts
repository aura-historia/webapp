import { describe, expect, it } from "vitest";
import type {
    PartyLocationData,
    PublicPartyLocationData,
    SourceLocationDefaultData,
    UserAddress as UserAddressDto,
} from "@/client";
import { mapToListingGeography } from "@/data/internal/geography/ListingGeography.ts";
import {
    mapToBackendCreateUserAddress,
    mapToBackendDeleteUserAddress,
    mapToBackendSetBrowsingDestination,
    mapToBackendUpdateUserAddress,
    mapToBrowsingDestinationView,
    mapToUserAddress,
    mapToUserAddressPage,
    validateUserAddressInput,
} from "@/data/internal/geography/UserAddress.ts";
import {
    mapToBackendCorrectPartyLocation,
    mapToBackendCreatePartyLocation,
    mapToBackendPartyLocationDiscoveryCursor,
    mapToBackendPartyLocationManagementGrant,
    mapToBackendSetPartyLocationLifecycle,
    mapToPartyLocation,
    mapToPartyLocationDiscoveryPage,
    mapToPartyLocationPage,
    validatePartyLocationInput,
} from "@/data/internal/geography/PartyLocation.ts";
import {
    mapToBackendAssignSourceLocationDefault,
    mapToBackendChangeSourceLocationDefaultApplicability,
    mapToBackendClearSourceLocationDefault,
    mapToSourceLocationDefault,
} from "@/data/internal/geography/SourceLocationDefault.ts";
import type { CountryCode } from "@/data/internal/geography/GeographicCodes.ts";

const RELEASE = "iso-codes-4.20.1" as const;
const DE = "DE" as CountryCode;

describe("mapToListingGeography", () => {
    const base = {
        locationId: "ploc_1",
        basis: "SOURCE_DEFAULT_DERIVED" as const,
        referenceRelease: RELEASE,
    };

    it("drops geography it cannot interpret", () => {
        expect(mapToListingGeography(undefined)).toBeUndefined();
        expect(mapToListingGeography({ ...base, basis: "VERIFIED" as never })).toBeUndefined();
        expect(mapToListingGeography({ ...base, referenceRelease: "iso-codes-5" })).toBeUndefined();
    });

    it("omits unrecognized facts and a point without precision", () => {
        expect(
            mapToListingGeography({
                ...base,
                country: "XX",
                subdivision: "DE-BY",
                point: { latitude: 1, longitude: 2 },
                distanceKm: Number.NaN,
            }),
        ).toEqual({ ...base, subdivision: "DE-BY" });
    });
});

describe("user addresses", () => {
    const dto: UserAddressDto = {
        addressId: "uaddr_1",
        label: "Home",
        geography: { referenceRelease: RELEASE, addressText: "Marienplatz 1", country: "DE" },
        inputRevision: 2,
        version: 5,
        preferred: true,
        resolution: {
            status: "ACCEPTED",
            derived: {
                geography: { referenceRelease: RELEASE, country: "DE", subdivision: "DE-BY" },
                position: {
                    latitudeDegrees: 48.137,
                    longitudeDegrees: 11.575,
                    precision: "PREMISES",
                },
            },
            attribution: { provider: "Amazon Location Service", attributionUrl: "https://a.test" },
        },
    };

    it("keeps asserted and provider-derived geography separate", () => {
        const address = mapToUserAddress(dto);
        expect(address.geography).toEqual({
            referenceRelease: RELEASE,
            addressText: "Marienplatz 1",
            country: "DE",
            hasUnsupportedValues: false,
        });
        expect(address.geography).not.toHaveProperty("subdivision");
        expect(address.resolution).toEqual({
            status: "ACCEPTED",
            derivedGeography: {
                referenceRelease: RELEASE,
                country: "DE",
                subdivision: "DE-BY",
                hasUnsupportedValues: false,
            },
            derivedPosition: {
                point: { latitude: 48.137, longitude: 11.575 },
                precision: "PREMISES",
            },
            attribution: { provider: "Amazon Location Service", url: "https://a.test" },
        });
    });

    it("maps unknown resolution states without inventing derived data", () => {
        const address = mapToUserAddress({
            ...dto,
            resolution: { status: "QUEUED" as never, derived: null, attribution: null },
        });
        expect(address.resolution).toEqual({ status: "UNKNOWN" });
    });

    it("maps the page cursor and stops on null", () => {
        expect(mapToUserAddressPage({ items: [dto], next: "uaddr_1" }).next).toBe("uaddr_1");
        expect(mapToUserAddressPage({ items: [], next: null })).toEqual({ items: [] });
    });

    it("sends create, update and delete bodies with the pinned release and expected version", () => {
        const input = { label: "Studio", geography: { addressText: "Via Roma 1", country: DE } };
        expect(validateUserAddressInput(input)).toBeUndefined();
        expect(mapToBackendCreateUserAddress(input)).toEqual({
            label: "Studio",
            geography: { referenceRelease: RELEASE, addressText: "Via Roma 1", country: "DE" },
        });
        expect(mapToBackendUpdateUserAddress(input, 5)).toMatchObject({ expectedVersion: 5 });
        expect(mapToBackendDeleteUserAddress(5)).toEqual({ expectedVersion: 5 });
    });

    it("validates labels and required address text", () => {
        const geography = { addressText: "Via Roma 1" };
        expect(validateUserAddressInput({ label: " ", geography })).toBe("LABEL_INVALID");
        expect(validateUserAddressInput({ label: "a".repeat(129), geography })).toBe(
            "LABEL_INVALID",
        );
        expect(validateUserAddressInput({ label: "A", geography: { addressText: " " } })).toBe(
            "ADDRESS_TEXT_INVALID",
        );
    });
});

describe("browsing destination", () => {
    it.each([
        [{ kind: "NONE" }, { kind: "NONE" }],
        [
            { kind: "ADDRESS", addressId: "uaddr_1" },
            { kind: "ADDRESS", addressId: "uaddr_1" },
        ],
        [
            { kind: "COUNTRY_POSTAL", country: "DE", postalCode: null },
            { kind: "COUNTRY_POSTAL", country: "DE" },
        ],
        [{ kind: "COUNTRY_POSTAL", country: "XX" }, { kind: "UNSUPPORTED" }],
        [{ kind: "IP" }, { kind: "UNSUPPORTED" }],
    ])("maps %j", (destination, expected) => {
        expect(
            mapToBrowsingDestinationView({ version: 3, destination: destination as never }),
        ).toEqual({ version: 3, destination: expected });
    });

    it("sets a destination under the expected version", () => {
        expect(
            mapToBackendSetBrowsingDestination(
                { kind: "COUNTRY_POSTAL", country: DE, postalCode: "01067" },
                3,
            ),
        ).toEqual({
            expectedVersion: 3,
            destination: { kind: "COUNTRY_POSTAL", country: "DE", postalCode: "01067" },
        });
    });
});

describe("Party locations", () => {
    const dto: PartyLocationData = {
        id: "ploc_1",
        partyId: "pty_1",
        label: "Gallery",
        roles: ["BUSINESS_PREMISES", "SHOWROOM" as never],
        geography: { referenceRelease: RELEASE, country: "DE" },
        position: { latitudeDegrees: 0, longitudeDegrees: 0, precision: "LOCALITY" },
        lifecycle: "ACTIVE",
        revision: 4,
        inputRevision: 2,
        evidence: {
            reference: "ref-1",
            scope: "SITE_DESCRIPTION",
            observedAt: "2026-10-01T00:00:00Z",
        },
    };

    it("maps the management view and flags omitted unsupported members", () => {
        const location = mapToPartyLocation(dto);
        expect(location.roles).toEqual(["BUSINESS_PREMISES"]);
        expect(location.position?.point).toEqual({ latitude: 0, longitude: 0 });
        expect(location.evidence?.observedAt).toEqual(new Date("2026-10-01T00:00:00Z"));
        expect(location.hasUnsupportedValues).toBe(true);
        expect(mapToPartyLocation({ ...dto, roles: [] }).hasUnsupportedValues).toBe(false);
        expect(mapToPartyLocationPage({ items: [dto], next: null })).not.toHaveProperty("next");
    });

    it("preserves omitted, null and replacement semantics on correction", () => {
        expect(mapToBackendCorrectPartyLocation({ expectedRevision: 4 })).toEqual({
            expectedRevision: 4,
            correction: "SAME_SITE",
        });
        expect(
            mapToBackendCorrectPartyLocation({
                expectedRevision: 4,
                label: " Showroom ",
                roles: [],
                geography: null,
                position: null,
                evidence: null,
            }),
        ).toEqual({
            expectedRevision: 4,
            correction: "SAME_SITE",
            label: "Showroom",
            roles: [],
            geography: null,
            position: null,
            evidence: null,
        });
    });

    it("creates relocations and lifecycle and grant commands explicitly", () => {
        expect(
            mapToBackendCreatePartyLocation({
                label: "New site",
                geography: { country: DE },
                relocates: { id: "ploc_1", revision: 4 },
            }),
        ).toEqual({
            label: "New site",
            geography: { referenceRelease: RELEASE, country: "DE" },
            relocates: { id: "ploc_1", revision: 4 },
        });
        expect(mapToBackendSetPartyLocationLifecycle("RETIRED", 4)).toEqual({
            expectedRevision: 4,
            lifecycle: "RETIRED",
        });
        expect(mapToBackendPartyLocationManagementGrant(false)).toEqual({ granted: false });
    });

    it("validates labels, positions and evidence before sending", () => {
        expect(validatePartyLocationInput({ label: "x".repeat(256) })).toBe("LABEL_INVALID");
        expect(
            validatePartyLocationInput({
                label: "Site",
                position: { point: { latitude: 0, longitude: 200 }, precision: "PREMISES" },
            }),
        ).toBe("POSITION_INVALID");
        expect(
            validatePartyLocationInput({
                label: "Site",
                evidence: { reference: "a\nb", scope: "SITE_DESCRIPTION" },
            }),
        ).toBe("EVIDENCE_INVALID");
    });

    it("maps public discovery results and keeps the cursor unrounded", () => {
        const item: PublicPartyLocationData = {
            partyId: "pty_1",
            partyName: "Atelier",
            locationId: "ploc_1",
            label: "Gallery",
            basis: "MIXED_ASSERTED_AND_DERIVED",
            country: "DE",
            point: { latitude: 48, longitude: 11 },
            precision: "STREET",
            distanceKm: 3,
        };
        const page = mapToPartyLocationDiscoveryPage({
            items: [item, { ...item, basis: "GUESSED" as never }],
            size: 2,
            searchAfter: { locationId: "ploc_1", distanceKm: 3.2468 },
        });
        expect(page.items[0]).toEqual({
            partyId: "pty_1",
            partyName: "Atelier",
            locationId: "ploc_1",
            label: "Gallery",
            basis: "MIXED_ASSERTED_AND_DERIVED",
            country: "DE",
            position: { point: { latitude: 48, longitude: 11 }, precision: "STREET" },
            distanceKm: 3,
        });
        expect(page.items[1].basis).toBe("UNKNOWN");
        expect(
            page.searchAfter && mapToBackendPartyLocationDiscoveryCursor(page.searchAfter),
        ).toEqual({ locationId: "ploc_1", distanceKm: 3.2468 });
    });
});

describe("source location defaults", () => {
    const dto: SourceLocationDefaultData = {
        listingSourceId: "ls_1",
        revision: 2,
        assignment: {
            partyLocationId: "ploc_1",
            businessAssociation: { reference: "imprint", scope: "ASSOCIATED_BUSINESS" },
            advertisedInventory: { reference: "imprint", scope: "ASSOCIATED_BUSINESS" },
        },
        eligibility: "RETIRED",
    };

    it("keeps each assertion only under its own scope", () => {
        expect(mapToSourceLocationDefault(dto)).toEqual({
            listingSourceId: "ls_1",
            revision: 2,
            assignment: { partyLocationId: "ploc_1", businessAssociation: "imprint" },
            eligibility: "RETIRED",
            hasUnsupportedValues: true,
        });
    });

    it("maps an untouched source without inventing an assignment", () => {
        expect(
            mapToSourceLocationDefault({
                listingSourceId: "ls_1",
                revision: 1,
                assignment: null,
                eligibility: null as never,
            }),
        ).toEqual({ listingSourceId: "ls_1", revision: 1, hasUnsupportedValues: false });
    });

    it("sends assignment, applicability and clear commands with the expected revision", () => {
        expect(
            mapToBackendAssignSourceLocationDefault({
                expectedRevision: 1,
                partyLocationId: "ploc_1",
                advertisedInventory: "catalogue",
            }),
        ).toEqual({
            expectedRevision: 1,
            partyLocationId: "ploc_1",
            businessAssociation: null,
            advertisedInventory: { reference: "catalogue", scope: "ADVERTISED_INVENTORY" },
        });
        expect(
            mapToBackendChangeSourceLocationDefaultApplicability({
                expectedRevision: 2,
                businessAssociation: null,
            }),
        ).toEqual({ expectedRevision: 2, businessAssociation: null });
        expect(mapToBackendClearSourceLocationDefault(3)).toEqual({ expectedRevision: 3 });
    });
});
