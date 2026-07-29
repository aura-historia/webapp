export type AboutPrincipleItem = {
    readonly titleKey: string;
    readonly descriptionKey: string;
};

export type AboutTeamMember = {
    readonly id: string;
    readonly name: string;
    readonly positionKey: string;
    readonly email: string;
    readonly linkedinUrl: string;
    readonly bioKey?: string;
    readonly imageUrl?: string;
    readonly hidden?: boolean;
};

export const ABOUT_PRINCIPLES: readonly AboutPrincipleItem[] = [
    {
        titleKey: "aboutPage.values.items.carefulClaims.title",
        descriptionKey: "aboutPage.values.items.carefulClaims.description",
    },
    {
        titleKey: "aboutPage.values.items.discernment.title",
        descriptionKey: "aboutPage.values.items.discernment.description",
    },
    {
        titleKey: "aboutPage.values.items.sourceStewardship.title",
        descriptionKey: "aboutPage.values.items.sourceStewardship.description",
    },
] as const;

export const ABOUT_TEAM_MEMBERS: readonly AboutTeamMember[] = [
    {
        id: "julian-bruder",
        name: "Julian Bruder",
        positionKey: "aboutPage.team.members.julianBruder.position",
        bioKey: "aboutPage.team.members.julianBruder.bio",
        email: "julian.bruder@aura-historia.com",
        linkedinUrl: "https://www.linkedin.com/in/julianbruder/",
    },
    {
        id: "luca-franke",
        name: "Luca Franke",
        positionKey: "aboutPage.team.members.lucaFranke.position",
        bioKey: "aboutPage.team.members.lucaFranke.bio",
        email: "luca.franke@aura-historia.com",
        linkedinUrl: "https://www.linkedin.com/in/luca-franke-4778b5299/",
    },
    {
        id: "abdellah-filali",
        name: "Abdellah Filali",
        positionKey: "aboutPage.team.members.abdellahFilali.position",
        bioKey: "aboutPage.team.members.abdellahFilali.bio",
        email: "abdellah.filali@aura-historia.com",
        linkedinUrl: "https://www.linkedin.com/in/abdellah-f-44608228a/",
    },
    {
        id: "erwin-bause",
        name: "Erwin Bause",
        positionKey: "aboutPage.team.members.erwinBause.position",
        bioKey: "aboutPage.team.members.erwinBause.bio",
        email: "erwin.bause@aura-historia.com",
        linkedinUrl: "https://www.linkedin.com/in/erwin-bause-10b592185/",
    },
    {
        id: "anton-diettrich",
        name: "Anton Diettrich",
        positionKey: "aboutPage.team.members.antonDiettrich.position",
        bioKey: "aboutPage.team.members.antonDiettrich.bio",
        email: "anton.diettrich@aura-historia.com",
        linkedinUrl: "https://www.linkedin.com/in/anton-diettrich-77529521a/",
        hidden: true,
    },
] as const;
