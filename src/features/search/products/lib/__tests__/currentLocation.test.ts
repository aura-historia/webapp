import { afterEach, describe, expect, it, vi } from "vitest";
import {
    clearCurrentLocation,
    getCurrentLocationSnapshot,
    requestCurrentLocation,
} from "@/features/search/products/lib/currentLocation.ts";

type Callbacks = [PositionCallback, PositionErrorCallback];

function stubGeolocation(respond: (...callbacks: Callbacks) => void) {
    const getCurrentPosition = vi.fn((success: PositionCallback, failure: PositionErrorCallback) =>
        respond(success, failure),
    );
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
    vi.stubGlobal("isSecureContext", true);
    return getCurrentPosition;
}

function positionError(code: number): GeolocationPositionError {
    return { code, message: "", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
}

describe("requestCurrentLocation", () => {
    afterEach(() => {
        clearCurrentLocation();
        vi.unstubAllGlobals();
        localStorage.clear();
        sessionStorage.clear();
    });

    it("keeps the location in memory only", async () => {
        stubGeolocation((success) =>
            success({ coords: { latitude: 51.34, longitude: 12.37 } } as GeolocationPosition),
        );

        await expect(requestCurrentLocation()).resolves.toEqual({
            latitude: 51.34,
            longitude: 12.37,
        });
        expect(getCurrentLocationSnapshot().point).toEqual({ latitude: 51.34, longitude: 12.37 });
        expect(localStorage.length).toBe(0);
        expect(sessionStorage.length).toBe(0);
    });

    it("reports a denial without asking again", async () => {
        const getCurrentPosition = stubGeolocation((_success, failure) =>
            failure(positionError(1)),
        );

        await expect(requestCurrentLocation()).rejects.toBe("denied");
        expect(getCurrentPosition).toHaveBeenCalledTimes(1);
        expect(getCurrentLocationSnapshot().point).toBeUndefined();
    });

    it("reports a timeout and an unavailable position", async () => {
        stubGeolocation((_success, failure) => failure(positionError(3)));
        await expect(requestCurrentLocation()).rejects.toBe("timeout");

        stubGeolocation((_success, failure) => failure(positionError(2)));
        await expect(requestCurrentLocation()).rejects.toBe("unavailable");
    });

    it("fails without a geolocation API instead of throwing", async () => {
        vi.stubGlobal("navigator", {});
        await expect(requestCurrentLocation()).rejects.toBe("unavailable");
    });
});
