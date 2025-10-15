import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Footer } from "../Footer.tsx";

describe("Footer Component", () => {
    beforeEach(async () => {
        await act(() => {
            renderWithRouter(<Footer />);
        });
    });

    it("should render all navigation links with correct text", () => {
        expect(screen.getByText("common.imprint")).toBeInTheDocument();
        expect(screen.getByText("common.terms")).toBeInTheDocument();
    });

    it("should render copyright text with correct year", () => {
        expect(screen.getByText(`common.copyright`)).toBeInTheDocument();
    });

    it("should render navigation links with correct href attributes", () => {
        expect(screen.getByText("common.imprint").closest("a")).toHaveAttribute("href", "/imprint");
        expect(screen.getByText("common.terms").closest("a")).toHaveAttribute("href", "/terms");
    });
});
