import { describe, expect, it } from "vitest";
import {
    livenessState,
    readinessState,
    resolveServiceAvailability,
    type ServiceProbe,
} from "../serviceAvailability.ts";

const probe = (httpStatus: number | null): ServiceProbe => ({ httpStatus, latencyMs: 40 });

describe("serviceAvailability", () => {
    it.each([
        [200, 204, "operational"],
        [503, 204, "maintenance"],
        [503, 503, "maintenance"],
        [503, null, "maintenance"],
        [200, 503, "disruption"],
        [200, null, "disruption"],
        [500, 204, "disruption"],
        [502, 503, "disruption"],
        [429, 204, "disruption"],
        [null, 204, "disruption"],
        [null, null, "disruption"],
    ] as const)("maps health %s and readiness %s to %s", (health, ready, expected) => {
        expect(
            resolveServiceAvailability({ liveness: probe(health), readiness: probe(ready) }),
        ).toBe(expected);
    });

    it("reserves maintenance for the liveness probe", () => {
        expect(livenessState(probe(503))).toBe("maintenance");
        expect(readinessState(probe(503))).toBe("unavailable");
    });

    it("treats any 2xx as available and anything else, including no response, as unavailable", () => {
        expect(livenessState(probe(200))).toBe("available");
        expect(readinessState(probe(204))).toBe("available");
        expect(livenessState(probe(302))).toBe("unavailable");
        expect(livenessState(probe(null))).toBe("unavailable");
        expect(readinessState(probe(null))).toBe("unavailable");
    });
});
