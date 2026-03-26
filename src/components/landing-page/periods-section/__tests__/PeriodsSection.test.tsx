import { act, screen } from "@testing-library/react";
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
        expect(screen.getByText("Epochen und Stile entdecken")).toBeInTheDocument();
    });

    it("renders a carousel item for each period", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        expect(screen.getByText("Renaissance")).toBeInTheDocument();
        expect(screen.getByText("Baroque")).toBeInTheDocument();
        expect(screen.getByText("Modern")).toBeInTheDocument();
    });

    it("renders links to the correct period routes", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        const links = screen.getAllByRole("link");
        const hrefs = links.map((l) => l.getAttribute("href"));
        expect(hrefs).toContain("/periods/renaissance-1");
        expect(hrefs).toContain("/periods/baroque-2");
        expect(hrefs).toContain("/periods/unknown-3");
    });

    it("renders the section element with the correct aria-label", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={mockPeriods} />));
        const section = screen.getByRole("region", { name: "Epochen und Stile entdecken" });
        expect(section).toBeInTheDocument();
    });

    it("renders an empty carousel when periods list is empty", async () => {
        await act(async () => renderWithRouter(<PeriodsSection periods={[]} />));
        expect(screen.getByText("Epochen und Stile entdecken")).toBeInTheDocument();
        expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
});
