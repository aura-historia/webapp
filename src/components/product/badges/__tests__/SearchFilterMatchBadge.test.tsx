import type React from "react";

vi.mock("@tanstack/react-router", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");

    return {
        ...actual,
        Link: ({
            to,
            params,
            children,
            ...props
        }: {
            to: string;
            params?: Record<string, string>;
            children: React.ReactNode;
        }) => {
            let href = to;
            for (const [key, value] of Object.entries(params ?? {})) {
                href = href.replace(`$${key}`, value);
            }
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
    };
});

import { render, screen } from "@testing-library/react";
import { SearchFilterMatchBadge } from "../SearchFilterMatchBadge.tsx";

describe("SearchFilterMatchBadge", () => {
    it("should render badge with 'Treffer' text", () => {
        render(<SearchFilterMatchBadge filterId="filter-123" />);

        expect(screen.getByText("Treffer")).toBeInTheDocument();
    });

    it("should link to the search filter page", () => {
        render(<SearchFilterMatchBadge filterId="filter-123" />);

        expect(screen.getByRole("link")).toHaveAttribute("href", "/me/search-filter/filter-123");
    });

    it("should render the filter icon", () => {
        const { container } = render(<SearchFilterMatchBadge filterId="filter-123" />);

        expect(container.querySelector(".lucide-funnel")).toBeInTheDocument();
    });
});
