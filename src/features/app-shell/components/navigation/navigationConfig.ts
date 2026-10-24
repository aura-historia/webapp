import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";

export type SiteSectionId = "discover" | "platform" | "agent" | "dealers" | "pricing";

export type SiteSectionLink =
    | {
          readonly id: SiteSectionId;
          readonly translationKey: string;
          readonly kind: "landing";
          readonly fragment: string;
      }
    | {
          readonly id: SiteSectionId;
          readonly translationKey: string;
          readonly kind: "route";
          readonly to: "/$lng/partner-program";
      };

/** The site sections of the marketing header and the phone menu. */
export const SITE_SECTION_LINKS: readonly SiteSectionLink[] = [
    {
        id: "discover",
        translationKey: "header.sections.discover",
        kind: "landing",
        fragment: LANDING_PAGE_FRAGMENTS.recentlyAdded,
    },
    {
        id: "platform",
        translationKey: "header.sections.platform",
        kind: "landing",
        fragment: LANDING_PAGE_FRAGMENTS.platform,
    },
    {
        id: "agent",
        translationKey: "header.sections.agent",
        kind: "landing",
        fragment: LANDING_PAGE_FRAGMENTS.agent,
    },
    {
        id: "dealers",
        translationKey: "header.sections.dealers",
        kind: "landing",
        fragment: LANDING_PAGE_FRAGMENTS.dealers,
    },
    {
        id: "pricing",
        translationKey: "header.sections.pricing",
        kind: "landing",
        fragment: LANDING_PAGE_FRAGMENTS.pricing,
    },
];

export const CONTACT_EMAIL = "contact@aura-historia.com";

/** Shared focus treatment from the design system: a solid 2px brass outline, 3px offset. */
export const NAV_FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

export function getActiveSiteSection(routePathname: string): SiteSectionId | undefined {
    if (routePathname === "/partner-program" || routePathname.startsWith("/partner-program/")) {
        return "dealers";
    }

    return undefined;
}
