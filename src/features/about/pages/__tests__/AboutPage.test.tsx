import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ABOUT_TEAM_MEMBERS, type AboutTeamMember } from "@/features/about/config/aboutPage.data";
import { AboutPage, AboutTeamMemberCard } from "@/features/about/pages/AboutPage";
import { renderWithRouter } from "@/test/utils";

function getCardForMember(name: string) {
    const heading = screen.getByRole("heading", { name });
    const card = heading.closest('[data-slot="card"]');
    expect(card).toBeInTheDocument();
    return card as HTMLElement;
}

describe("AboutPage", () => {
    it("renders the lean about page sections", async () => {
        await act(async () => {
            renderWithRouter(<AboutPage />);
        });

        expect(
            screen.getByRole("heading", {
                name: "Wir geben dem Antiquitäten- und Kunstmarkt mehr Übersicht.",
                level: 1,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: "Orientierung schaffen, ohne den Markt zu vereinfachen.",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Zurückhaltung vor Lautstärke." }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Ein kleines Team mit langem Blick." }),
        ).toBeInTheDocument();
    });

    it("renders configured visible team members", async () => {
        await act(async () => {
            renderWithRouter(<AboutPage />);
        });

        expect(screen.getByRole("heading", { name: "Julian Bruder" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Luca Franke" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Abdellah Filali" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Erwin Bause" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Anton Diettrich" })).toBeInTheDocument();
    });

    it("keeps contact buttons aligned at the bottom of every team card", async () => {
        await act(async () => {
            renderWithRouter(<AboutPage />);
        });

        for (const member of ABOUT_TEAM_MEMBERS.filter((teamMember) => !teamMember.hidden)) {
            const card = getCardForMember(member.name);
            expect(card).toHaveClass("flex", "h-full", "flex-col");

            const content = card.querySelector('[data-slot="card-content"]');
            expect(content).toHaveClass("flex", "grow", "flex-col");

            const emailLink = within(card).getByRole("link", {
                name: `E-Mail an ${member.name}`,
            });
            const buttonRow = emailLink.parentElement;
            expect(buttonRow).toHaveClass("mt-auto", "flex", "flex-wrap", "gap-2", "pt-2");
        }
    });

    it("renders the configured email and LinkedIn links for each visible member", async () => {
        await act(async () => {
            renderWithRouter(<AboutPage />);
        });

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
        await act(async () => {
            renderWithRouter(<AboutPage />);
        });

        expect(screen.getByRole("img", { name: "Initialen von Julian Bruder" })).toHaveTextContent(
            "JB",
        );
        expect(
            screen.getByRole("img", { name: "Initialen von Abdellah Filali" }),
        ).toHaveTextContent("AF");
    });

    it("contains complete config for five team members while Anton is hidden", () => {
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
