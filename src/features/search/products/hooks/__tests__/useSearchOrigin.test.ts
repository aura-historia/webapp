import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import type { SearchLocation, SearchNear } from "@/data/internal/search/SearchLocation.ts";
import { UserAddressRequestError } from "@/features/account-management/hooks/useUserAddresses.ts";
import { useSearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";
import {
    clearCurrentLocation,
    requestCurrentLocation,
} from "@/features/search/products/lib/currentLocation.ts";

type QueryState = { data?: unknown; error?: unknown; isPending: boolean };

const mocks = vi.hoisted(() => ({
    auth: { user: { userId: "user-1" } as { userId: string } | undefined, isLoading: false },
    destination: { data: undefined, error: null, isPending: false } as QueryState,
    address: { data: undefined, error: null, isPending: false } as QueryState,
}));

vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => mocks.auth,
}));
vi.mock("@/features/account-management/hooks/useBrowsingDestination.ts", () => ({
    useBrowsingDestination: () => mocks.destination,
}));
vi.mock("@/features/account-management/hooks/useUserAddresses.ts", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useUserAddressDetail: () => mocks.address,
}));

const located: UserAddress = {
    addressId: "uaddr_home",
    label: "Zuhause",
    geography: { addressText: "Marienplatz 1, München" } as UserAddress["geography"],
    inputRevision: 1,
    version: 3,
    preferred: false,
    resolution: {
        status: "ACCEPTED",
        derivedPosition: {
            point: { latitude: 48.137, longitude: 11.575 },
            precision: "PREMISES",
        },
    },
};

function distance(near: SearchNear): SearchLocation {
    return {
        kind: "DISTANCE",
        near,
        radius: { amount: 50, unit: "KILOMETERS" },
        mode: "APPROXIMATE",
    } as SearchLocation;
}

function origin(location: SearchLocation | undefined) {
    return renderHook(() => useSearchOrigin(location)).result.current;
}

describe("useSearchOrigin", () => {
    beforeEach(() => {
        mocks.auth = { user: { userId: "user-1" }, isLoading: false };
        mocks.destination = { data: undefined, error: null, isPending: false };
        mocks.address = { data: undefined, error: null, isPending: false };
        clearCurrentLocation();
    });

    it("has no starting point without a distance search", () => {
        expect(origin(undefined)).toEqual({ status: "none" });
        expect(
            origin({
                kind: "REGION",
                countries: ["DE"],
                subdivisions: [],
            } as unknown as SearchLocation),
        ).toEqual({ status: "none" });
    });

    it("reports a current location that was not kept", () => {
        expect(origin(distance({ kind: "CURRENT" }))).toEqual({
            status: "unavailable",
            problem: "currentNotKept",
        });
    });

    it("starts from the current location held in memory, keyed by capture only", async () => {
        vi.stubGlobal("isSecureContext", true);
        vi.stubGlobal("navigator", {
            geolocation: {
                getCurrentPosition: (success: PositionCallback) =>
                    success({
                        coords: { latitude: 51.34, longitude: 12.37 },
                    } as GeolocationPosition),
            },
        });
        await requestCurrentLocation();
        const result = origin(distance({ kind: "CURRENT" }));
        vi.unstubAllGlobals();

        expect(result).toMatchObject({
            status: "ready",
            point: { latitude: 51.34, longitude: 12.37 },
            label: "Aktueller Standort",
        });
        expect(result.status === "ready" && result.key).toMatch(/^current:\d+$/);
    });

    it("waits for auth and needs a signed-in owner for saved addresses", () => {
        mocks.auth = { user: undefined, isLoading: true };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "loading",
        });
        mocks.auth = { user: undefined, isLoading: false };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "unavailable",
            problem: "signedOut",
        });
    });

    it("starts from a located saved address without exposing coordinates in its key", () => {
        mocks.address = { data: located, error: null, isPending: false };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "ready",
            point: { latitude: 48.137, longitude: 11.575 },
            label: "Zuhause",
            key: "address:uaddr_home:3",
            address: located,
        });
    });

    it("names an address that has no located point", () => {
        const unlocated = { ...located, resolution: { status: "NO_MATCH" } } as UserAddress;
        mocks.address = { data: unlocated, error: null, isPending: false };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "unavailable",
            problem: "addressNotLocated",
            label: "Zuhause",
            address: unlocated,
        });
    });

    it.each([
        [404, "addressUnavailable"],
        [403, "addressUnavailable"],
        [500, "loadFailed"],
        [undefined, "loadFailed"],
    ] as const)("maps a %s address response to %s", (status, problem) => {
        mocks.address = {
            data: undefined,
            error: new UserAddressRequestError("failed", status),
            isPending: false,
        };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "unavailable",
            problem,
        });
    });

    it("reports loading and an unspecific failure while the address is not there", () => {
        mocks.address = { data: undefined, error: null, isPending: true };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "loading",
        });
        mocks.address = { data: undefined, error: null, isPending: false };
        expect(origin(distance({ kind: "ADDRESS", addressId: "uaddr_home" }))).toEqual({
            status: "unavailable",
            problem: "loadFailed",
        });
    });

    describe("the account's search location", () => {
        const near: SearchNear = { kind: "SEARCH_LOCATION" };

        it("waits for and reports a failed browsing destination", () => {
            mocks.destination = { data: undefined, error: null, isPending: true };
            expect(origin(distance(near))).toEqual({ status: "loading" });
            mocks.destination = { data: undefined, error: new Error("x"), isPending: false };
            expect(origin(distance(near))).toEqual({
                status: "unavailable",
                problem: "loadFailed",
            });
        });

        it("explains a search location that is a country rather than an address", () => {
            mocks.destination = {
                data: { destination: { kind: "COUNTRY", country: "DE" } },
                error: null,
                isPending: false,
            };
            expect(origin(distance(near))).toEqual({
                status: "unavailable",
                problem: "searchLocationNotAddress",
            });
        });

        it("starts from the address the search location points to", () => {
            mocks.destination = {
                data: { destination: { kind: "ADDRESS", addressId: "uaddr_home" } },
                error: null,
                isPending: false,
            };
            mocks.address = { data: located, error: null, isPending: false };
            expect(origin(distance(near))).toMatchObject({
                status: "ready",
                key: "address:uaddr_home:3",
            });
        });
    });
});
