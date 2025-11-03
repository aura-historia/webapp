import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScrollToTopButton } from "@/components/search/ScrollToTopButton.tsx";

describe("ScrollToTopButton", () => {
    beforeEach(() => {
        Object.defineProperty(window, "scrollY", {
            writable: true,
            configurable: true,
            value: 0,
        });

        vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    });

    it("should not be visible when scrollY < 300", () => {
        render(<ScrollToTopButton />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should be visible when scrollY > 300", () => {
        window.scrollY = 400;
        render(<ScrollToTopButton />);

        fireEvent.scroll(window);

        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should call scrollTo on click", () => {
        window.scrollY = 400;
        render(<ScrollToTopButton />);

        fireEvent.scroll(window);
        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: "smooth",
        });
    });
});
