import type { ProvenanceData } from "@/client";

export type Provenance = "COMPLETE" | "PARTIAL" | "CLAIMED" | "NONE" | "UNKNOWN";

export function parseProvenance(provenance?: string | null): Provenance {
    const uppercasedProvenanceData = provenance?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedProvenanceData) {
        case "COMPLETE":
        case "PARTIAL":
        case "CLAIMED":
        case "NONE":
            return uppercasedProvenanceData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendProvenance(provenance: Provenance): ProvenanceData {
    switch (provenance) {
        case "COMPLETE":
        case "PARTIAL":
        case "CLAIMED":
        case "NONE":
        case "UNKNOWN":
            return provenance;
    }
}
