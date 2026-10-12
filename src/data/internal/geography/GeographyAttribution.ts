import type { UserAddressAttribution } from "@/client";

/**
 * Provider attribution for retained, provider-derived geography.
 * Display it wherever accepted provider-derived geography is shown.
 */
export type GeographyAttribution = {
    readonly provider: string;
    readonly url: string;
};

// The Amazon Location Service attribution page that the backend geography contract requires
// end-user terms and product documentation to link conspicuously.
export const AMAZON_LOCATION_ATTRIBUTION: GeographyAttribution = {
    provider: "Amazon Location Service",
    url: "https://docs.aws.amazon.com/location/latest/developerguide/data-attribution.html",
};

export function mapToGeographyAttribution(
    attribution: UserAddressAttribution | null | undefined,
): GeographyAttribution | undefined {
    const provider = attribution?.provider.trim();
    if (!attribution || !provider || !isHttpsUrl(attribution.attributionUrl)) {
        return undefined;
    }

    return { provider, url: attribution.attributionUrl };
}

function isHttpsUrl(url: string): boolean {
    try {
        return new URL(url).protocol === "https:";
    } catch {
        return false;
    }
}
