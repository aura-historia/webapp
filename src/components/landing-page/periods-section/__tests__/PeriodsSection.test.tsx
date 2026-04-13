import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PeriodsSection from "../PeriodsSection.tsx";
import type { PeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { renderWithRouter } from "@/test/utils.tsx";

// Mock the entire embla carousel to avoid plugin comparison errors in jsdom
vi.mock("embla-carousel-react", () => ({
    default: () => [
        vi.fn(),
        {
            on: vi.fn(),
            off: vi.fn(),
            scrollTo: vi.fn(),
            canScrollNext: vi.fn(() => false),
            canScrollPrev: vi.fn(() => false),
            selectedScrollSnap: vi.fn(() => 0),
            scrollSnapList: vi.fn(() => []),
        },
    ],
}));

vi.mock("embla-carousel-autoplay", () => ({
    default: vi.fn(() => ({
        name: "autoplay",
        options: {},
        init: vi.fn(),
        destroy: vi.fn(),
        play: vi.fn(),
        stop: vi.fn(),
    })),
}));

const mockPeriods: PeriodOverview[] = [
    { periodId: "renaissance-1", periodKey: "RENAISSANCE", name: "Renaissance" },
    { periodId: "baroque-2", periodKey: "BAROQUE", name: "Baroque" },
    { periodId: "unknown-3", periodKey: "UNKNOWN_KEY", name: "Modern" },
];

describe("PeriodsSection", () => {
    it("renders the section with the periods title", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        expect(
            screen.getByRole("region", { name: "Historische Epochen entdecken" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Entdecken nach")).toBeInTheDocument();
        expect(screen.getByText("Historischen Epochen")).toBeInTheDocument();
    });

    it("renders a carousel item for each period", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        expect(screen.getByText("Renaissance")).toBeInTheDocument();
        expect(screen.getByText("Baroque")).toBeInTheDocument();
        expect(screen.getByText("Modern")).toBeInTheDocument();
    });

    it("renders links to the correct period routes", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        const links = screen
            .getAllByRole("link")
            .filter((l) => (l.getAttribute("href") ?? "").startsWith("/periods/"));
        const hrefs = links.map((l) => l.getAttribute("href"));
        expect(hrefs).toContain("/periods/renaissance-1");
        expect(hrefs).toContain("/periods/baroque-2");
        expect(hrefs).toContain("/periods/unknown-3");
    });

    it("renders the section element with the correct aria-label", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        const section = screen.getByRole("region", { name: "Historische Epochen entdecken" });
        expect(section).toBeInTheDocument();
    });

    it("renders an empty carousel when periods list is empty", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={[]} />));
        expect(
            screen.getByRole("region", { name: "Historische Epochen entdecken" }),
        ).toBeInTheDocument();
        const periodLinks = screen
            .queryAllByRole("link")
            .filter((l) => (l.getAttribute("href") ?? "").startsWith("/periods/"));
        expect(periodLinks).toHaveLength(0);
    });

    it("shows period navigation controls", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        expect(screen.getByLabelText("Vorherige Epochen")).toBeInTheDocument();
        expect(screen.getByLabelText("Naechste Epochen")).toBeInTheDocument();
    });

    it("switches pages immediately when clicking next", async () => {
        const periods: PeriodOverview[] = [
            { periodId: "renaissance-1", periodKey: "RENAISSANCE", name: "Renaissance" },
            { periodId: "baroque-2", periodKey: "BAROQUE", name: "Baroque" },
            { periodId: "unknown-3", periodKey: "UNKNOWN_KEY", name: "Modern" },
            { periodId: "rococo-4", periodKey: "ROCOCO", name: "Rococo" },
            { periodId: "gothic-5", periodKey: "GOTHIC", name: "Gothic" },
        ];

        await act(async () => renderWithRouter(<PeriodsSection periods={periods} />));

        const firstPageLinks = screen
            .getAllByRole("link")
            .filter((link) => (link.getAttribute("href") ?? "").startsWith("/periods/"));
        const firstPageHrefs = firstPageLinks.map((link) => link.getAttribute("href"));
        expect(firstPageHrefs).toContain("/periods/renaissance-1");
        expect(firstPageHrefs).not.toContain("/periods/gothic-5");

        fireEvent.click(screen.getByLabelText("Naechste Epochen"));

        const secondPageLinks = screen
            .getAllByRole("link")
            .filter((link) => (link.getAttribute("href") ?? "").startsWith("/periods/"));
        const secondPageHrefs = secondPageLinks.map((link) => link.getAttribute("href"));
        expect(secondPageHrefs).toContain("/periods/gothic-5");
        expect(secondPageHrefs).not.toContain("/periods/renaissance-1");
    });
});
