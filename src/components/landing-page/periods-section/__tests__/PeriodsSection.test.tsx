import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PeriodsSection from "../PeriodsSection.tsx";
import type { PeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import type React from "react";

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

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({
            children,
            to,
            params,
            ...props
        }: {
            children: React.ReactNode;
            to: string;
            params?: Record<string, string>;
            className?: string;
        }) => {
            const href = params
                ? Object.entries(params).reduce(
                      (acc, [key, val]) => acc.replace(`$${key}`, val),
                      to,
                  )
                : to;
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
    };
});

const mockPeriods: PeriodOverview[] = [
    { periodId: "renaissance-1", periodKey: "RENAISSANCE", name: "Renaissance" },
    { periodId: "baroque-2", periodKey: "BAROQUE", name: "Baroque" },
    { periodId: "unknown-3", periodKey: "UNKNOWN_KEY", name: "Modern" },
];

describe("PeriodsSection", () => {
    it("renders the section with the periods title", () => {
        render(<PeriodsSection periods={mockPeriods} />);
        expect(screen.getByText("Epochen durchstöbern")).toBeInTheDocument();
    });

    it("renders a carousel item for each period", () => {
        render(<PeriodsSection periods={mockPeriods} />);
        expect(screen.getByText("Renaissance")).toBeInTheDocument();
        expect(screen.getByText("Baroque")).toBeInTheDocument();
        expect(screen.getByText("Modern")).toBeInTheDocument();
    });

    it("renders links to the correct period routes", () => {
        render(<PeriodsSection periods={mockPeriods} />);
        const links = screen.getAllByRole("link");
        const hrefs = links.map((l) => l.getAttribute("href"));
        expect(hrefs).toContain("/periods/renaissance-1");
        expect(hrefs).toContain("/periods/baroque-2");
        expect(hrefs).toContain("/periods/unknown-3");
    });

    it("renders the section element with the correct aria-label", () => {
        render(<PeriodsSection periods={mockPeriods} />);
        const section = screen.getByRole("region", { name: "Epochen durchstöbern" });
        expect(section).toBeInTheDocument();
    });

    it("renders an empty carousel when periods list is empty", () => {
        render(<PeriodsSection periods={[]} />);
        expect(screen.getByText("Epochen durchstöbern")).toBeInTheDocument();
        expect(screen.queryAllByRole("link")).toHaveLength(0);
    });
});
