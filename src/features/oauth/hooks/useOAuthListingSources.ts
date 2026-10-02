import { useOwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";

export type { OAuthListingSource } from "@/data/internal/oauth/OAuthListingSource.ts";

// OAuth keeps its public hook name while sharing granted-source fetching with partners.
export const useOAuthListingSources = useOwnListingSources;
