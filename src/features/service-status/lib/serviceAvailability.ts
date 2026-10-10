/** One probe request. `httpStatus` is null when no response arrived (network failure or timeout). */
export type ServiceProbe = {
    readonly httpStatus: number | null;
    readonly latencyMs: number;
};

export type ServiceStatusSnapshot = {
    /** `GET /api/v1/health`: the API answers at all; 503 signals maintenance. */
    readonly liveness: ServiceProbe;
    /** `GET /api/v1/ready`: the API can reach its database and search index. */
    readonly readiness: ServiceProbe;
};

export type ServiceAvailability = "operational" | "maintenance" | "disruption";

export type ServiceProbeState = "available" | "maintenance" | "unavailable";

const MAINTENANCE_STATUS = 503;

function isSuccessful(probe: ServiceProbe): boolean {
    return probe.httpStatus !== null && probe.httpStatus >= 200 && probe.httpStatus < 300;
}

export function livenessState(probe: ServiceProbe): ServiceProbeState {
    if (probe.httpStatus === MAINTENANCE_STATUS) return "maintenance";
    return isSuccessful(probe) ? "available" : "unavailable";
}

/** Readiness 503 means failing dependencies; only liveness announces maintenance. */
export function readinessState(probe: ServiceProbe): ServiceProbeState {
    return isSuccessful(probe) ? "available" : "unavailable";
}

export function resolveServiceAvailability(snapshot: ServiceStatusSnapshot): ServiceAvailability {
    const liveness = livenessState(snapshot.liveness);
    if (liveness === "maintenance") return "maintenance";
    if (liveness === "unavailable" || readinessState(snapshot.readiness) === "unavailable") {
        return "disruption";
    }
    return "operational";
}
