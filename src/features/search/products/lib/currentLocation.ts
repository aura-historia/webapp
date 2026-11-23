import {
    parseGeographicPoint,
    type GeographicPoint,
} from "@/data/internal/geography/GeographicPosition.ts";

/**
 * The browser location the user asked for, held in memory only: never in the URL, browser
 * storage, analytics or logs. It is gone after a reload, which asks for it again
 * (docs/privacy-policy-alignment.md, "Browser location").
 */
export type CurrentLocationSnapshot = {
    readonly point?: GeographicPoint;
    /** Changes with every new location, so results are read again for it. */
    readonly captureId: number;
};

export type CurrentLocationFailure = "denied" | "unavailable" | "timeout";

/** Why the browser gave no location; `reason` picks the message shown to the user. */
export class CurrentLocationError extends Error {
    readonly reason: CurrentLocationFailure;

    constructor(reason: CurrentLocationFailure) {
        super(`Current location ${reason}`);
        this.name = "CurrentLocationError";
        this.reason = reason;
    }
}

const EMPTY: CurrentLocationSnapshot = { captureId: 0 };
let snapshot: CurrentLocationSnapshot = EMPTY;
const listeners = new Set<() => void>();

function emit() {
    for (const listener of listeners) listener();
}

export function subscribeCurrentLocation(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getCurrentLocationSnapshot(): CurrentLocationSnapshot {
    return snapshot;
}

/** The server never knows a browser location. */
export function getServerCurrentLocationSnapshot(): CurrentLocationSnapshot {
    return EMPTY;
}

export function clearCurrentLocation(): void {
    if (!snapshot.point) return;
    snapshot = { captureId: snapshot.captureId + 1 };
    emit();
}

/** Browser APIs: call after hydration, never during render on the server. */
export function isGeolocationSupported(): boolean {
    return (
        typeof window !== "undefined" &&
        window.isSecureContext &&
        typeof navigator !== "undefined" &&
        "geolocation" in navigator
    );
}

const POSITION_OPTIONS: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 15_000,
    maximumAge: 5 * 60_000,
};

/**
 * Asks the browser for the current position. Only ever call this from the user's explicit
 * "Use my current location" action; a denial is final until the user changes their browser
 * settings, so it is never retried automatically.
 */
export function requestCurrentLocation(): Promise<GeographicPoint> {
    return new Promise((resolve, reject) => {
        const fail = (reason: CurrentLocationFailure) => reject(new CurrentLocationError(reason));
        if (!isGeolocationSupported()) {
            fail("unavailable");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const point = parseGeographicPoint(
                    position.coords.latitude,
                    position.coords.longitude,
                );
                if (!point) {
                    fail("unavailable");
                    return;
                }
                snapshot = { point, captureId: snapshot.captureId + 1 };
                emit();
                resolve(point);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) fail("denied");
                else if (error.code === error.TIMEOUT) fail("timeout");
                else fail("unavailable");
            },
            POSITION_OPTIONS,
        );
    });
}
