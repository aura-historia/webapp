import { queryOptions } from "@tanstack/react-query";
import { getHealth, getReadiness } from "@/client";
import {
    resolveServiceAvailability,
    type ServiceProbe,
    type ServiceStatusSnapshot,
} from "../lib/serviceAvailability.ts";

export const SERVICE_STATUS_QUERY_KEY = ["service-status"] as const;

/** Exceeds the backend's 5 s readiness budget plus a cold start. */
export const SERVICE_PROBE_TIMEOUT_MS = 10_000;
const OPERATIONAL_REFETCH_MS = 120_000;
const DEGRADED_REFETCH_MS = 30_000;

/**
 * Thrown when the API is not operational, so query retries absorb a brief failure before
 * any notice appears. Carries the probe results for display.
 */
export class ServiceStatusError extends Error {
    constructor(readonly snapshot: ServiceStatusSnapshot) {
        super("The API is not operational.");
        this.name = "ServiceStatusError";
    }
}

type ProbeRequest = (options: {
    signal: AbortSignal;
    cache: RequestCache;
}) => Promise<{ response?: Response }>;

async function probe(request: ProbeRequest, signal: AbortSignal): Promise<ServiceProbe> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    const timeout = setTimeout(abort, SERVICE_PROBE_TIMEOUT_MS);
    signal.addEventListener("abort", abort);
    const startedAt = performance.now();
    try {
        // The generated client resolves network failures and aborts with no response.
        const { response } = await request({ signal: controller.signal, cache: "no-store" });
        return {
            httpStatus: response?.status ?? null,
            latencyMs: Math.round(performance.now() - startedAt),
        };
    } finally {
        clearTimeout(timeout);
        signal.removeEventListener("abort", abort);
    }
}

/**
 * Browser-only probe of the public health endpoints. Queries do not fetch during SSR,
 * so server and first client render both see a pending status.
 */
export const serviceStatusQueryOptions = queryOptions({
    queryKey: SERVICE_STATUS_QUERY_KEY,
    queryFn: async ({ signal }): Promise<ServiceStatusSnapshot> => {
        const [liveness, readiness] = await Promise.all([
            probe(getHealth, signal),
            probe(getReadiness, signal),
        ]);
        const snapshot = { liveness, readiness };
        if (resolveServiceAvailability(snapshot) !== "operational") {
            throw new ServiceStatusError(snapshot);
        }
        return snapshot;
    },
    retry: 2,
    staleTime: 60_000,
    // Recheck sooner while degraded so the notice clears promptly after recovery.
    refetchInterval: (query) =>
        query.state.status === "error" ? DEGRADED_REFETCH_MS : OPERATIONAL_REFETCH_MS,
});
