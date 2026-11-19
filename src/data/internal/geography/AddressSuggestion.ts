import type {
    AddressSuggestion as AddressSuggestionDto,
    AddressSuggestionList as AddressSuggestionListDto,
} from "@/client";
import {
    type GeographyAttribution,
    mapToGeographyAttribution,
} from "@/data/internal/geography/GeographyAttribution.ts";

export const ADDRESS_SUGGESTION_KINDS = [
    "ADDRESS",
    "STREET",
    "LOCALITY",
    "POSTAL_CODE",
    "REGION",
    "OTHER",
] as const satisfies readonly AddressSuggestionDto["kind"][];

/** `ADDRESS` is a complete address; every other kind still needs details such as a house number. */
export type AddressSuggestionKind = (typeof ADDRESS_SUGGESTION_KINDS)[number];

/**
 * A search-as-you-type suggestion. Display-only: never store, cache or log it. Its `placeId` is an
 * opaque provider reference, sent with the address write when the suggestion is picked.
 */
export type AddressSuggestion = {
    readonly placeId: string;
    readonly label: string;
    readonly kind: AddressSuggestionKind;
};

export type AddressSuggestionList = {
    readonly suggestions: readonly AddressSuggestion[];
    /** Show it with the suggestions. */
    readonly attribution?: GeographyAttribution;
};

/** Backend bounds of a suggestion query, after trimming. */
export const MIN_ADDRESS_SUGGESTION_QUERY = 3;
export const MAX_ADDRESS_SUGGESTION_QUERY = 200;

export function isAddressSuggestionQuery(query: string): boolean {
    const trimmed = query.trim();
    return (
        trimmed.length >= MIN_ADDRESS_SUGGESTION_QUERY &&
        trimmed.length <= MAX_ADDRESS_SUGGESTION_QUERY &&
        // biome-ignore lint/suspicious/noControlCharactersInRegex: the backend refuses control characters.
        !/[\u0000-\u001f\u007f]/.test(trimmed)
    );
}

export function mapToAddressSuggestionList(data: AddressSuggestionListDto): AddressSuggestionList {
    const attribution = mapToGeographyAttribution(data.attribution);
    return {
        // An unknown kind is treated as a place without a closer category.
        suggestions: data.suggestions
            .filter((suggestion) => suggestion.placeId && suggestion.label.trim())
            .map((suggestion) => ({
                placeId: suggestion.placeId,
                label: suggestion.label,
                kind: ADDRESS_SUGGESTION_KINDS.includes(suggestion.kind)
                    ? suggestion.kind
                    : "OTHER",
            })),
        ...(attribution ? { attribution } : {}),
    };
}
