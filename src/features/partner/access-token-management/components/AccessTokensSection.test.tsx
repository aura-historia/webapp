import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessTokensSection } from "@/features/partner/access-token-management/components/AccessTokensSection.tsx";

const mockUseAccessTokens = vi.hoisted(() => vi.fn());
const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockUpdateAccessTokenMutate = vi.hoisted(() => vi.fn());

vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useAccessTokens: mockUseAccessTokens,
    useCreateAccessToken: () => ({
        mutate: mockCreateAccessTokenMutate,
        isPending: false,
    }),
    useUpdateAccessToken: () => ({
        mutate: mockUpdateAccessTokenMutate,
        isPending: false,
    }),
}));

describe("AccessTokensSection", () => {
    beforeEach(() => {
        mockUseAccessTokens.mockReturnValue({
            data: [
                {
                    id: "token-12345678",
                    name: "Product sync",
                    scopes: ["products:write"],
                    maskedToken: "aurahistoria_abcdefghijk_****",
                    tokenType: "BEARER",
                    expiresAt: null,
                    created: new Date("2026-07-01T12:00:00Z"),
                    updated: new Date("2026-07-02T12:00:00Z"),
                },
                {
                    id: "token-87654321",
                    name: "Shop administration",
                    scopes: [],
                    maskedToken: "aurahistoria_zyxwvutsrqp_****",
                    tokenType: "BEARER",
                    expiresAt: new Date("2026-08-01T12:00:00Z"),
                    created: new Date("2026-06-01T12:00:00Z"),
                    updated: new Date("2026-06-02T12:00:00Z"),
                },
            ],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it("renders saved access tokens and their metadata", () => {
        render(<AccessTokensSection />);

        expect(screen.getByRole("heading", { name: "Zugriffstoken" })).toBeInTheDocument();
        expect(screen.getByText("Product sync")).toBeInTheDocument();
        expect(screen.getByText("Shop administration")).toBeInTheDocument();
        expect(screen.getByText("Produkte schreiben")).toBeInTheDocument();
        expect(screen.getByText("Keine Berechtigungen")).toBeInTheDocument();
        expect(screen.getByText("aurahistoria_abcdefghijk_****")).toBeInTheDocument();
        expect(screen.getByText("Läuft nicht ab")).toBeInTheDocument();
        const expirationBadge = screen.getByText(/Läuft ab am/).closest('[data-slot="badge"]');
        expect(expirationBadge).toHaveClass("bg-primary/10", "text-primary");
        expect(expirationBadge?.querySelector("svg")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Neues Zugriffstoken" })).toBeInTheDocument();
    });

    it("opens the access token creation dialog", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(screen.getByRole("button", { name: "Neues Zugriffstoken" }));

        expect(
            screen.getByRole("heading", { name: "Zugriffstoken erstellen" }),
        ).toBeInTheDocument();
    });

    it("opens the edit dialog without displaying the token value", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(
            screen.getByRole("button", {
                name: "Zugriffstoken Product sync bearbeiten",
            }),
        );

        expect(
            screen.getByRole("heading", { name: "Zugriffstoken bearbeiten" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Product sync");
        expect(
            within(screen.getByRole("dialog")).queryByText("aurahistoria_abcdefghijk_****"),
        ).not.toBeInTheDocument();
    });

    it("renders the empty state", () => {
        mockUseAccessTokens.mockReturnValue({
            data: [],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<AccessTokensSection />);

        expect(
            screen.getByText("Sie haben noch keine Zugriffstoken gespeichert."),
        ).toBeInTheDocument();
    });

    it("renders a loading skeleton", () => {
        mockUseAccessTokens.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
            refetch: vi.fn(),
        });

        render(<AccessTokensSection />);

        expect(screen.getByRole("status")).toHaveTextContent("Zugriffstoken werden geladen.");
    });

    it("retries after a loading error", async () => {
        const user = userEvent.setup();
        const refetch = vi.fn();
        mockUseAccessTokens.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
            refetch,
        });

        render(<AccessTokensSection />);
        await user.click(screen.getByRole("button", { name: "Erneut versuchen" }));

        expect(refetch).toHaveBeenCalledOnce();
    });
});
