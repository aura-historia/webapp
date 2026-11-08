/** `?create=true` opens a dashboard page's create dialog, e.g. from the overview's next steps. */
export type PartnerCreateSearch = {
    readonly create?: true;
};

export function validatePartnerCreateSearch(search: Record<string, unknown>): PartnerCreateSearch {
    return search.create === true || search.create === "true" ? { create: true } : {};
}
