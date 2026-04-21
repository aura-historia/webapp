import { LANDING_PAGE_FRAGMENTS } from "@/components/landing-page/LandingPage.fragments.ts";
import { LandingPage } from "@/routes/index.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/landing-page/hero-section/HeroSection.tsx", () => ({
    default: () => <div>Hero Section</div>,
}));

vi.mock("@/components/landing-page/categories-section/CategoriesSection.tsx", () => ({
    default: () => <div>Categories Section</div>,
}));

vi.mock("@/components/landing-page/recently-added-section/RecentlyAddedSection.tsx", () => ({
    default: () => <div>Recently Added Section</div>,
}));

vi.mock("@/components/landing-page/periods-section/PeriodsSection.tsx", () => ({
    default: () => <div>Periods Section</div>,
}));

vi.mock("@/components/landing-page/discover-section/DiscoverSection.tsx", () => ({
    default: () => <div>Discover Section</div>,
}));

vi.mock("@/components/landing-page/features-section/FeaturesSection.tsx", () => ({
    default: () => <div>Features Section</div>,
}));

vi.mock("@/components/landing-page/how-it-works-section/HowItWorksSection.tsx", () => ({
    default: () => <div>How It Works Section</div>,
}));

vi.mock("@/components/landing-page/testimonials-section/TestimonialsSection.tsx", () => ({
    default: () => <div>Testimonials Section</div>,
}));

vi.mock("@/components/landing-page/pricing-section/PricingSection.tsx", () => ({
    default: () => <div>Pricing Section</div>,
}));

vi.mock("@/components/landing-page/newsletter-section/NewsletterSection.tsx", () => ({
    default: () => <div>Newsletter Section</div>,
}));

vi.mock("@/components/landing-page/faq-section/FAQSection.tsx", () => ({
    default: () => <div>FAQ Section</div>,
}));

vi.mock("@/data/internal/category/CategoryOverview.ts", () => ({
    mapToCategoryOverview: vi.fn(() => ({
        categoryId: "furniture",
        categoryKey: "FURNITURE",
        name: "Möbel",
    })),
}));

vi.mock("@/data/internal/period/PeriodOverview.ts", () => ({
    mapToPeriodOverview: vi.fn(() => ({
        periodId: "baroque",
        periodKey: "BAROQUE",
        name: "Barock",
    })),
}));

vi.mock("@/data/internal/product/OverviewProduct.ts", () => ({
    mapPersonalizedGetProductSummaryDataToOverviewProduct: vi.fn(() => ({
        productId: "product-1",
    })),
}));

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...actual,
        useQuery: vi.fn(({ queryKey }: { queryKey: Array<{ _id?: string }> }) => {
            if (queryKey[0]?._id === "getCategories") {
                return { data: [{}] };
            }
            if (queryKey[0]?._id === "getPeriods") {
                return { data: [{}] };
            }
            if (queryKey[0]?._id === "simpleSearchProducts") {
                return { data: { items: [{}] } };
            }
            return { data: undefined };
        }),
    };
});

describe("LandingPage", () => {
    it("renders fragment targets for all landing page sections", async () => {
        let container: HTMLElement | undefined;

        await act(async () => {
            const view = renderWithRouter(<LandingPage />, { initialEntries: ["/"] });
            container = view.container;
        });

        expect(container).toBeDefined();

        Object.values(LANDING_PAGE_FRAGMENTS).forEach((fragment) => {
            expect(container?.querySelector(`#${fragment}`)).toBeInTheDocument();
        });

        expect(screen.getByText("Testimonials Section")).toBeInTheDocument();
    });
});
