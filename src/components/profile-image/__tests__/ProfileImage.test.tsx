import { ProfileImage } from "@/components/profile-image/ProfileImage.tsx";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("ProfileImage", () => {
    it("renders initials when both first and last name are provided", () => {
        render(<ProfileImage firstName="Max" lastName="Mustermann" />);
        expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("renders only first initial when last name is empty", () => {
        render(<ProfileImage firstName="Anna" lastName="" />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("renders only last initial when first name is empty", () => {
        render(<ProfileImage firstName="" lastName="Schmidt" />);
        expect(screen.getByText("S")).toBeInTheDocument();
    });

    it("renders the User icon when both names are empty", () => {
        const { container } = render(<ProfileImage firstName="" lastName="" />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
    });
});
