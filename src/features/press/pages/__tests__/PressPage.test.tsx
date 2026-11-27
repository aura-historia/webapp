import { act, fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SOCIAL_LINKS } from "@/features/app-shell/components/footer/Footer.data.ts";
import {
    BRAND_COLOURS,
    BRAND_KIT_URL,
    PRESS_LOGOS,
    PRESS_SECTION_IDS,
} from "@/features/press/config/pressPage.data.ts";
import { PressPage } from "@/features/press/pages/PressPage.tsx";
import { renderWithRouter } from "@/test/utils";

const mocks = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));
vi.mock("@/features/landing/hooks/usePublicOverview.ts", () => ({
    usePublicOverview: () => ({ data: undefined, isPending: true }),
}));

async function renderPage() {
    await act(async () => {
        renderWithRouter(<PressPage />);
    });
}

function section(id: string) {
    return document.getElementById(id) as HTMLElement;
}

describe("PressPage", () => {
    beforeEach(() => {
        mocks.toastError.mockReset();
    });

    it("renders the hero and the chapters in order", async () => {
        await renderPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Sie schreiben über Aura Historia? Beginnen Sie hier.",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
        ).toEqual([
            "Aura Historia auf einen Blick.",
            "Beschreibungen, bereit zum Zitieren.",
            "Die Wortmarke.",
            "Pergament, Tinte und Ochsenblut.",
            "Drei Schriften, eine Stimme.",
            "Screenshots und Porträts.",
            "Nutzung dieser Materialien.",
            "Fragen, Interviews, Bilder.",
        ]);
    });

    it("links every chapter from the hero navigation", async () => {
        await renderPage();

        const navigation = screen.getByRole("navigation", { name: "Auf dieser Seite" });
        const hrefs = within(navigation)
            .getAllByRole("link")
            .map((link) => link.getAttribute("href"));
        expect(hrefs).toEqual(Object.values(PRESS_SECTION_IDS).map((id) => `#${id}`));
        for (const id of Object.values(PRESS_SECTION_IDS)) {
            expect(document.getElementById(id)).toBeInTheDocument();
        }
    });

    it("offers the brand kit as a download", async () => {
        await renderPage();

        const kit = screen.getByRole("link", { name: "Pressepaket herunterladen" });
        expect(kit).toHaveAttribute("href", BRAND_KIT_URL);
        expect(kit).toHaveAttribute("download");
        expect(screen.getByRole("link", { name: "Alle Logos (ZIP)" })).toHaveAttribute(
            "href",
            BRAND_KIT_URL,
        );
    });

    it("lists the facts without a legal form, and the social profiles", async () => {
        await renderPage();

        const facts = section(PRESS_SECTION_IDS.facts);
        expect(
            within(facts).getByText(
                "Eine weltweite Plattform für Suche und Entdeckung in Kunst und Antiquitäten",
            ),
        ).toBeInTheDocument();
        expect(within(facts).queryByText(/Einzelunternehmen/)).toBeNull();
        expect(within(facts).queryByText(/Geschäftsmodell/)).toBeNull();
        for (const social of SOCIAL_LINKS) {
            const link = within(facts).getByRole("link", { name: social.name });
            expect(link).toHaveAttribute("href", social.url);
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        }
    });

    it("offers every logo as SVG and PNG", async () => {
        await renderPage();

        const logo = section(PRESS_SECTION_IDS.logo);
        for (const { file } of PRESS_LOGOS) {
            for (const format of ["svg", "png"]) {
                const link = within(logo)
                    .getAllByRole("link")
                    .find(
                        (candidate) =>
                            candidate.getAttribute("href") === `/press/${file}.${format}`,
                    );
                expect(link, `${file}.${format}`).toHaveAttribute("download");
            }
        }
        expect(
            within(logo).getByRole("link", {
                name: "Gestapelt auf Ochsenblut als PNG herunterladen",
            }),
        ).toHaveAttribute("href", "/press/aura-historia-wordmark-stacked-oxblood.png");
    });

    it("shows every brand colour with its hex and RGB values", async () => {
        await renderPage();

        const colour = section(PRESS_SECTION_IDS.colour);
        for (const { hex, rgb } of BRAND_COLOURS) {
            expect(within(colour).getByText(hex)).toBeInTheDocument();
            expect(within(colour).getByText(rgb)).toBeInTheDocument();
        }
    });

    it("copies a description and confirms it", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        await renderPage();

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Kurzbeschreibung kopieren" }));
        });

        expect(writeText).toHaveBeenCalledWith(
            expect.stringMatching(/^Aura Historia ist eine weltweite Plattform für Suche/),
        );
        expect(
            screen.getByRole("button", { name: "Kurzbeschreibung kopiert" }),
        ).toBeInTheDocument();
        expect(mocks.toastError).not.toHaveBeenCalled();
    });

    it("selects the text and shows an error when the clipboard is refused", async () => {
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: vi.fn(() => Promise.reject(new Error("denied"))) },
        });
        await renderPage();

        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: "Hexwert von Ochsenblut kopieren" }),
            );
        });

        expect(mocks.toastError).toHaveBeenCalledWith("Kopieren nicht möglich", {
            description:
                "Ihr Browser hat die Zwischenablage blockiert. Markieren Sie den Text und kopieren Sie ihn selbst.",
        });
        expect(window.getSelection()?.toString()).toBe("#4A1520");
    });

    it("names the press contact and links the team", async () => {
        await renderPage();

        const contact = section(PRESS_SECTION_IDS.contact);
        expect(
            within(contact).getByRole("link", { name: "contact@aura-historia.com" }),
        ).toHaveAttribute("href", "mailto:contact@aura-historia.com");
        expect(within(contact).getByText("Julian Bruder, Team Lead")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Das Team kennenlernen" })).toHaveAttribute(
            "href",
            "/de/about-us#team",
        );
    });
});
