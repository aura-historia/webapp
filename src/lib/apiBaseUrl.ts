const DEFAULT_API_BASE_URL = "https://api.stage.aura-historia.com";

export function getApiBaseUrl(configuredBaseUrl?: string): string {
    return configuredBaseUrl ?? DEFAULT_API_BASE_URL;
}
