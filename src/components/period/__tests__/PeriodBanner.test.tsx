import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PeriodBanner } from "@/components/period/PeriodBanner.tsx";

describe("PeriodBanner", () => {
    it("renders the period name", () => {
        render(<PeriodBanner periodName="Renaissance" />);

        expect(screen.getByText("Renaissance")).toBeInTheDocument();
    });

    it("renders the banner image with alt text", () => {
        render(<PeriodBanner periodName="Art Nouveau" />);

        const img = screen.getByRole("img", { name: "Art Nouveau" });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute(
            "src",
            "https://aura-historia-public.s3.eu-central-1.amazonaws.com/branding/banner_twitter_slogan.png",
        );
    });
});
