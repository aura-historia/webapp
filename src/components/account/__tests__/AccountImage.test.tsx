import { AccountImage } from "@/components/account/AccountImage.tsx";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("AccountImage", () => {
    it("renders initials when both first and last name are provided", () => {
        render(<AccountImage firstName="Max" lastName="Mustermann" />);
        expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("renders only first initial when last name is empty", () => {
        render(<AccountImage firstName="Anna" lastName="" />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("renders only last initial when first name is empty", () => {
        render(<AccountImage firstName="" lastName="Schmidt" />);
        expect(screen.getByText("S")).toBeInTheDocument();
    });

    it("renders the User icon when both names are empty", () => {
        const { container } = render(<AccountImage firstName="" lastName="" />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
    });
    it("renders spinner when loading", () => {
        const { container } = render(
            <AccountImage firstName="Max" lastName="Mustermann" isLoading={true} />,
        );
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });
});
