import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FloatingSaveSearchFilterButton } from "@/components/search/FloatingSaveSearchFilterButton.tsx";

vi.mock("@/components/search/SaveSearchFilterDialog.tsx", () => ({
    SaveSearchFilterDialog: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="save-dialog">{children}</div>
    ),
}));

describe("FloatingSaveSearchFilterButton", () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, "scrollY", {
            writable: true,
            configurable: true,
            value: 0,
        });
    });

    it("should not be visible when scrollY < 300", () => {
        render(<FloatingSaveSearchFilterButton searchArgs={{ q: "Tisch" }} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should be visible when scrollY > 300", () => {
        globalThis.scrollY = 400;
        render(<FloatingSaveSearchFilterButton searchArgs={{ q: "Tisch" }} />);

        fireEvent.scroll(window);

        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render inside SaveSearchFilterDialog when not disabled", () => {
        globalThis.scrollY = 400;
        render(<FloatingSaveSearchFilterButton searchArgs={{ q: "Tisch" }} />);

        fireEvent.scroll(window);

        expect(screen.getByTestId("save-dialog")).toBeInTheDocument();
    });

    it("should not render SaveSearchFilterDialog when disabled", () => {
        globalThis.scrollY = 400;
        render(
            <FloatingSaveSearchFilterButton
                searchArgs={{ q: "Tisch" }}
                disabled
                tooltip="Quota erreicht"
            />,
        );

        fireEvent.scroll(window);

        expect(screen.queryByTestId("save-dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });
});
