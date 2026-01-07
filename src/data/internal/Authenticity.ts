import type { AuthenticityData } from "@/client";

export type Authenticity = "ORIGINAL" | "LATER_COPY" | "REPRODUCTION" | "QUESTIONABLE" | "UNKNOWN";

export function parseAuthenticity(authenticity?: string | null): Authenticity {
    const uppercasedAuthenticityData = authenticity?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedAuthenticityData) {
        case "ORIGINAL":
        case "LATER_COPY":
        case "REPRODUCTION":
        case "QUESTIONABLE":
            return uppercasedAuthenticityData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendAuthenticity(authenticity: Authenticity): AuthenticityData {
    switch (authenticity) {
        case "ORIGINAL":
        case "LATER_COPY":
        case "REPRODUCTION":
        case "QUESTIONABLE":
        case "UNKNOWN":
            return authenticity;
    }
}
