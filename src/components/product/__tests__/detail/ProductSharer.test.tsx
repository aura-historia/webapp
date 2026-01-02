vi.mock("lottie-react", () => ({
    default: () => null,
}));

import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ProductSharer } from "@/components/product/detail/ProductSharer.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

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

    it("should render the share button", () => {
        renderWithQueryClient(<ProductSharer {...defaultProps} />);
        expect(screen.getByRole("button", { name: "Produkt teilen" })).toBeInTheDocument();
    });

    it("should open popover when share button is clicked", async () => {
        const user = userEvent.setup();
        renderWithQueryClient(<ProductSharer {...defaultProps} />);

        await user.click(screen.getByRole("button", { name: "Produkt teilen" }));

        expect(screen.getByText("Link kopieren")).toBeInTheDocument();
        expect(screen.getByText("WhatsApp")).toBeInTheDocument();
        expect(screen.getByText("Facebook")).toBeInTheDocument();
        expect(screen.getByText("X")).toBeInTheDocument();
        expect(screen.getByText("Telegram")).toBeInTheDocument();
        // TODO: Re-enable Reddit test once https://github.com/nygardk/react-share/pull/572 is merged
        // expect(screen.getByText("Reddit")).toBeInTheDocument();
    });

    it("should show copied state temporarily", async () => {
        const user = userEvent.setup();
        renderWithQueryClient(<ProductSharer {...defaultProps} />);

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

    it("should render with outline variant when specified", () => {
        renderWithQueryClient(<ProductSharer {...defaultProps} variant="outline" />);

        const shareButton = screen.getByRole("button", { name: "Produkt teilen" });
        expect(shareButton.className).toContain("border");
    });

    it("should apply custom className when provided", () => {
        const customClass = "custom-test-class";
        renderWithQueryClient(<ProductSharer {...defaultProps} className={customClass} />);

        const shareButton = screen.getByRole("button", { name: "Produkt teilen" });
        expect(shareButton.className).toContain(customClass);
    });
});
