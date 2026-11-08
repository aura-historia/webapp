/** The path of a public listing source's profile page, without a language prefix. */
export function getShopProfilePath(shopSlugId: string): string {
    return `/shops/${encodeURIComponent(shopSlugId)}`;
}
