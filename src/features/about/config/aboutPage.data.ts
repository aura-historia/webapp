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

export type AboutFaqItem = {
    readonly questionKey: string;
    readonly answerKey: string;
};

/** Anchors of the about page's chapters, linked from the hero's "On this page" row. */
export const ABOUT_SECTION_IDS = {
    services: "services",
    difference: "difference",
    audience: "audience",
    team: "team",
    faq: "faq",
} as const;

export type AboutSectionId = (typeof ABOUT_SECTION_IDS)[keyof typeof ABOUT_SECTION_IDS];

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
    },
] as const;

/** The about page's questions; the route also publishes them as FAQPage structured data. */
export const ABOUT_FAQ_ITEMS: readonly AboutFaqItem[] = [
    {
        questionKey: "aboutPage.faq.items.whatIs.question",
        answerKey: "aboutPage.faq.items.whatIs.answer",
    },
    {
        questionKey: "aboutPage.faq.items.whoIsBehind.question",
        answerKey: "aboutPage.faq.items.whoIsBehind.answer",
    },
    {
        questionKey: "aboutPage.faq.items.isFree.question",
        answerKey: "aboutPage.faq.items.isFree.answer",
    },
    {
        questionKey: "aboutPage.faq.items.buyDirectly.question",
        answerKey: "aboutPage.faq.items.buyDirectly.answer",
    },
    {
        questionKey: "aboutPage.faq.items.appraisal.question",
        answerKey: "aboutPage.faq.items.appraisal.answer",
    },
    {
        questionKey: "aboutPage.faq.items.barnebys.question",
        answerKey: "aboutPage.faq.items.barnebys.answer",
    },
    {
        questionKey: "aboutPage.faq.items.contact.question",
        answerKey: "aboutPage.faq.items.contact.answer",
    },
] as const;
