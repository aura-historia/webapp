/**
 * The `rel` of a link that leaves Aura Historia for a provider's site. Affiliate links, which can
 * earn Aura Historia a commission, are also marked `sponsored`.
 */
export function outboundLinkRel(affiliate: boolean): string {
    return affiliate ? "sponsored nofollow noopener noreferrer" : "nofollow noopener noreferrer";
}
