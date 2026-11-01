import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AboutTeamMemberCard } from "@/features/about/components/AboutTeamMemberCard.tsx";
import {
    ABOUT_FAQ_ITEMS,
    ABOUT_SECTION_IDS,
    ABOUT_TEAM_MEMBERS,
    type AboutTeamMember,
} from "@/features/about/config/aboutPage.data";
import { AboutPage } from "@/features/about/pages/AboutPage";
import { renderWithRouter } from "@/test/utils";

function getCardForMember(name: string) {
    const heading = screen.getByRole("heading", { name });
    const card = heading.closest("article");
    expect(card).toBeInTheDocument();
    return card as HTMLElement;
}

async function renderAboutPage() {
    await act(async () => {
        renderWithRouter(<AboutPage />);
    });
}

describe("AboutPage", () => {
    it("renders the hero and the five chapters in order", async () => {
        await renderAboutPage();

        expect(
            screen.getByRole("heading", {
                name: "Wir geben dem Antiquitäten- und Kunstmarkt mehr Übersicht.",
                level: 1,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/^Aura Historia ist eine weltweite Suchmaschine .* die Händler/),
        ).toBeInTheDocument();

        const chapterHeadings = screen
            .getAllByRole("heading", { level: 2 })
            .map((heading) => heading.textContent);
        expect(chapterHeadings).toEqual([
            "Was Aura Historia bietet.",
            "Was Aura Historia unterscheidet.",
            "Wer Aura Historia nutzt.",
            "Das Team hinter Aura Historia.",
            "Häufig gestellte Fragen.",
        ]);
    });

    it("links every chapter from the hero navigation", async () => {
        await renderAboutPage();

        const navigation = screen.getByRole("navigation", { name: "Auf dieser Seite" });
        const hrefs = within(navigation)
            .getAllByRole("link")
            .map((link) => link.getAttribute("href"));

        expect(hrefs).toEqual(Object.values(ABOUT_SECTION_IDS).map((id) => `#${id}`));
        for (const id of Object.values(ABOUT_SECTION_IDS)) {
            expect(document.getElementById(id)).toBeInTheDocument();
        }
    });

    it("links each service to where it lives", async () => {
        await renderAboutPage();

        expect(screen.getByRole("link", { name: "Markt durchsuchen" })).toHaveAttribute(
            "href",
            "/de/search",
        );
        expect(screen.getByRole("link", { name: "Merkliste anlegen" })).toHaveAttribute(
            "href",
            "/de/me/watchlist",
        );
        expect(screen.getByRole("link", { name: "Suchauftrag anlegen" })).toHaveAttribute(
            "href",
            "/de/me/search-filters",
        );
        expect(screen.getByRole("link", { name: "Zum Partnerprogramm" })).toHaveAttribute(
            "href",
            "/de/partner-program",
        );
    });

    it("names the sources of outside figures and links the full Barnebys comparison", async () => {
        await renderAboutPage();

        expect(
            screen.getByText("Quelle: Art Basel & UBS Global Art Market Report 2026"),
        ).toBeInTheDocument();
        expect(screen.getByText("Quelle: Catawiki-Hilfecenter für Verkäufer")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: "Zum vollständigen Vergleich: Aura Historia und Barnebys",
            }),
        ).toHaveAttribute("href", expect.stringContaining("/compare/barnebys"));
    });

    it("lists both audience groups", async () => {
        await renderAboutPage();

        const audience = document.getElementById(ABOUT_SECTION_IDS.audience) as HTMLElement;
        expect(within(audience).getByRole("heading", { name: "Sammler" })).toBeInTheDocument();
        expect(within(audience).getByRole("heading", { name: "Der Handel" })).toBeInTheDocument();
        expect(within(audience).getAllByRole("listitem")).toHaveLength(8);
    });

    it("keeps every FAQ answer in the markup and opens one at a time", async () => {
        await renderAboutPage();

        const faq = document.getElementById(ABOUT_SECTION_IDS.faq) as HTMLElement;
        const questions = within(faq).getAllByRole("button");
        expect(questions).toHaveLength(ABOUT_FAQ_ITEMS.length);
        expect(questions[0]).toHaveAttribute("aria-expanded", "true");

        const closedAnswer = within(faq).getByText(/^Nein\. Der Kauf findet beim jeweiligen/);
        expect(closedAnswer).not.toBeVisible();

        fireEvent.click(within(faq).getByRole("button", { name: /Kann ich über Aura Historia/ }));

        expect(closedAnswer).toBeVisible();
        expect(questions[0]).toHaveAttribute("aria-expanded", "false");
    });

    it("renders configured visible team members", async () => {
        await renderAboutPage();

        expect(screen.getByRole("heading", { name: "Julian Bruder" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Luca Franke" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Abdellah Filali" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Erwin Bause" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Anton Diettrich" })).toBeInTheDocument();
    });

    it("keeps contact buttons aligned at the bottom of every team card", async () => {
        await renderAboutPage();

        for (const member of ABOUT_TEAM_MEMBERS.filter((teamMember) => !teamMember.hidden)) {
            const card = getCardForMember(member.name);
            expect(card).toHaveClass("flex", "h-full", "flex-col");

            const emailLink = within(card).getByRole("link", {
                name: `E-Mail an ${member.name}`,
            });
            const buttonRow = emailLink.parentElement;
            expect(buttonRow).toHaveClass("mt-auto", "flex", "flex-wrap", "gap-2");
        }
    });

    it("renders the configured email and LinkedIn links for each visible member", async () => {
        await renderAboutPage();

        for (const member of ABOUT_TEAM_MEMBERS.filter((teamMember) => !teamMember.hidden)) {
            const card = getCardForMember(member.name);

            expect(
                within(card).getByRole("link", {
                    name: `E-Mail an ${member.name}`,
                }),
            ).toHaveAttribute("href", `mailto:${member.email}`);

            const linkedInLink = within(card).getByRole("link", {
                name: `${member.name} auf LinkedIn öffnen`,
            });
            expect(linkedInLink).toHaveAttribute("href", member.linkedinUrl);
            expect(linkedInLink).toHaveAttribute("target", "_blank");
            expect(linkedInLink).toHaveAttribute("rel", "noopener noreferrer");
        }
    });

    it("uses initials as image fallback when no image is configured", async () => {
        await renderAboutPage();

        expect(screen.getByRole("img", { name: "Initialen von Julian Bruder" })).toHaveTextContent(
            "JB",
        );
        expect(
            screen.getByRole("img", { name: "Initialen von Abdellah Filali" }),
        ).toHaveTextContent("AF");
    });

    it("contains complete config for five team members", () => {
        expect(ABOUT_TEAM_MEMBERS).toHaveLength(5);
        expect(ABOUT_TEAM_MEMBERS.map((member) => member.email)).toEqual([
            "julian.bruder@aura-historia.com",
            "luca.franke@aura-historia.com",
            "abdellah.filali@aura-historia.com",
            "erwin.bause@aura-historia.com",
            "anton.diettrich@aura-historia.com",
        ]);
    });
});

describe("AboutTeamMemberCard", () => {
    it("renders an optional image with translated alt text", () => {
        const member: AboutTeamMember = {
            id: "test-member",
            name: "Test Member",
            positionKey: "aboutPage.team.members.lucaFranke.position",
            email: "test.member@aura-historia.com",
            linkedinUrl: "https://www.linkedin.com/in/test-member/",
            imageUrl: "/team/test-member.webp",
        };

        render(<AboutTeamMemberCard member={member} />);

        const image = screen.getByRole("img", { name: "Porträt von Test Member" });
        expect(image).toHaveAttribute("src", "/team/test-member.webp");
        expect(image).toHaveAttribute("loading", "lazy");
        expect(image).toHaveAttribute("decoding", "async");
        expect(
            screen.queryByRole("img", { name: "Initialen von Test Member" }),
        ).not.toBeInTheDocument();
    });

    it("omits the bio paragraph when bioKey is not configured", () => {
        const member: AboutTeamMember = {
            id: "test-member",
            name: "Test Member",
            positionKey: "aboutPage.team.members.erwinBause.position",
            email: "test.member@aura-historia.com",
            linkedinUrl: "https://www.linkedin.com/in/test-member/",
        };

        render(<AboutTeamMemberCard member={member} />);

        expect(screen.getByRole("heading", { name: "Test Member" })).toBeInTheDocument();
        expect(screen.getByText("Lead UI/UX Engineer")).toBeInTheDocument();
        expect(screen.queryByText(/Erwin gestaltet/)).not.toBeInTheDocument();
    });
});
