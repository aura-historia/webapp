import type { LucideIcon } from "lucide-react";
import { Archive, Compass, Globe2, ShieldCheck } from "lucide-react";

export type AboutValueItem = {
    readonly icon: LucideIcon;
    readonly titleKey: string;
    readonly descriptionKey: string;
};

export type AboutTeamMember = {
    readonly id: string;
    readonly nameKey: string;
    readonly positionKey: string;
    readonly motivationKey: string;
    readonly focusKeys: readonly string[];
    readonly linkedinUrl: string;
};

export const ABOUT_VALUE_ITEMS: readonly AboutValueItem[] = [
    {
        icon: ShieldCheck,
        titleKey: "aboutPage.values.items.trust.title",
        descriptionKey: "aboutPage.values.items.trust.description",
    },
    {
        icon: Compass,
        titleKey: "aboutPage.values.items.discernment.title",
        descriptionKey: "aboutPage.values.items.discernment.description",
    },
    {
        icon: Archive,
        titleKey: "aboutPage.values.items.marketMemory.title",
        descriptionKey: "aboutPage.values.items.marketMemory.description",
    },
    {
        icon: Globe2,
        titleKey: "aboutPage.values.items.internationalView.title",
        descriptionKey: "aboutPage.values.items.internationalView.description",
    },
] as const;

export const ABOUT_TEAM_MEMBERS: readonly AboutTeamMember[] = [
    {
        id: "founding-team",
        nameKey: "aboutPage.team.members.foundingTeam.name",
        positionKey: "aboutPage.team.members.foundingTeam.position",
        motivationKey: "aboutPage.team.members.foundingTeam.motivation",
        focusKeys: [
            "aboutPage.team.members.foundingTeam.focus.discovery",
            "aboutPage.team.members.foundingTeam.focus.trust",
            "aboutPage.team.members.foundingTeam.focus.intelligence",
        ],
        linkedinUrl: "https://www.linkedin.com/company/aura-historia",
    },
] as const;
