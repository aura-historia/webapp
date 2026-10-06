import { act } from "react";
vi.mock("@/env", () => ({
    env: { VITE_APP_URL: "https://aura-historia.com", VITE_FEATURE_LOGIN_ENABLED: false },
}));
vi.mock("lottie-react", () => ({
    Lottie: () => null,
}));

import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ProductSharer } from "@/features/product/detail/components/ProductSharer.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

describe("ProductSharer", () => {
    const defaultProps = {
        title: "Test Product",
    };

    let mockWriteText: ReturnType<typeof vi.fn>;
    let originalClipboard: Clipboard | undefined;

    beforeEach(() => {
        originalClipboard = global.navigator.clipboard;
        mockWriteText = vi.fn().mockResolvedValue(undefined);

        Object.defineProperty(global.navigator, "clipboard", {
            value: {
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        if (originalClipboard) {
            Object.defineProperty(global.navigator, "clipboard", {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
        }
    });

    it("should render the share button", async () => {
        await act(async () => renderWithRouter(<ProductSharer {...defaultProps} />));
        expect(screen.getByRole("button", { name: "Produkt teilen" })).toBeInTheDocument();
    });

    it("should open popover when share button is clicked", async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<ProductSharer {...defaultProps} />));

        await user.click(screen.getByRole("button", { name: "Produkt teilen" }));

        expect(screen.getByText("Link kopieren")).toBeInTheDocument();
        expect(screen.getByText("WhatsApp")).toBeInTheDocument();
        expect(screen.getByText("Facebook")).toBeInTheDocument();
        expect(screen.getByText("X")).toBeInTheDocument();
        expect(screen.getByText("Telegram")).toBeInTheDocument();
        expect(screen.getByText("Reddit")).toBeInTheDocument();
    });

    it("should show copied state temporarily", async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<ProductSharer {...defaultProps} />));

        await user.click(screen.getByRole("button", { name: "Produkt teilen" }));
        await user.click(screen.getByText("Link kopieren"));

        expect(screen.getByText("Kopiert!")).toBeInTheDocument();

        await waitFor(
            () => {
                expect(screen.getByText("Link kopieren")).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it("should render with outline variant when specified", async () => {
        await act(async () =>
            renderWithRouter(<ProductSharer {...defaultProps} variant="outline" />),
        );

        const shareButton = screen.getByRole("button", { name: "Produkt teilen" });
        expect(shareButton.className).toContain("border");
    });

    it("should apply custom className when provided", async () => {
        const customClass = "custom-test-class";
        await act(async () =>
            renderWithRouter(<ProductSharer {...defaultProps} className={customClass} />),
        );

        const shareButton = screen.getByRole("button", { name: "Produkt teilen" });
        expect(shareButton.className).toContain(customClass);
    });
});
