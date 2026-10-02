import type { OwnListingSource } from "@/data/internal/listing-source/OwnListingSource.ts";

export type OAuthListingSource = Pick<OwnListingSource, "listingSourceId" | "name">;
