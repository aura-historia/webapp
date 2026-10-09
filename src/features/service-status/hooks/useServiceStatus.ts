import { useQuery } from "@tanstack/react-query";
import { ServiceStatusError, serviceStatusQueryOptions } from "../api/serviceStatusQuery.ts";
import {
    resolveServiceAvailability,
    type ServiceAvailability,
    type ServiceStatusSnapshot,
} from "../lib/serviceAvailability.ts";

export type ServiceStatusResult = {
    readonly availability: ServiceAvailability;
    readonly snapshot: ServiceStatusSnapshot;
    /** Epoch milliseconds of the check that produced this result. */
    readonly checkedAt: number;
};

export type ServiceStatus = {
    /** Undefined until the first check settles. */
    readonly result: ServiceStatusResult | undefined;
    readonly isChecking: boolean;
    readonly check: () => void;
};

function toResult(snapshot: ServiceStatusSnapshot, checkedAt: number): ServiceStatusResult {
    return { availability: resolveServiceAvailability(snapshot), snapshot, checkedAt };
}

export function useServiceStatus(): ServiceStatus {
    const query = useQuery(serviceStatusQueryOptions);

    let result: ServiceStatusResult | undefined;
    if (query.status === "error") {
        // After retries, the latest failed check wins over the last successful one.
        if (query.error instanceof ServiceStatusError) {
            result = toResult(query.error.snapshot, query.errorUpdatedAt);
        }
    } else if (query.data) {
        result = toResult(query.data, query.dataUpdatedAt);
    }

    return {
        result,
        isChecking: query.isFetching,
        check: () => {
            void query.refetch();
        },
    };
}
