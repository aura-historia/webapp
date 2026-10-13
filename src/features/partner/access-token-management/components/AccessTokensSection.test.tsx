import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessTokensSection } from "@/features/partner/access-token-management/components/AccessTokensSection.tsx";

const mockUseAccessTokens = vi.hoisted(() => vi.fn());
const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockUpdateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockDeleteAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockDeleteAllAccessTokensMutate = vi.hoisted(() => vi.fn());

vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useAccessTokens: mockUseAccessTokens,
    useCreateAccessToken: () => ({
        mutate: mockCreateAccessTokenMutate,
        isPending: false,
        reset: vi.fn(),
    }),
    useUpdateAccessToken: () => ({
        mutate: mockUpdateAccessTokenMutate,
        isPending: false,
    }),
    useDeleteAccessToken: () => ({
        mutate: mockDeleteAccessTokenMutate,
        isPending: false,
    }),
    useDeleteAllAccessTokens: () => ({
        mutate: mockDeleteAllAccessTokensMutate,
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
                    scopes: [
                        "product-listings:write",
                        "search-filters:read",
                        "admin-overview:read",
                    ],
                    expiresAt: null,
                },
                {
                    id: "token-87654321",
                    name: "Shop administration",
                    scopes: [],
                    expiresAt: new Date("2099-08-01T12:00:00Z"),
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
        expect(screen.getByText("Produktangebote schreiben")).toBeInTheDocument();
        expect(screen.getByText("Gespeicherte Suchen lesen")).toBeInTheDocument();
        expect(screen.getByText("Admin-Übersicht lesen")).toBeInTheDocument();
        expect(screen.getByText("Keine Berechtigungen")).toBeInTheDocument();
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

    it("opens the edit dialog with the current name", async () => {
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
    });

    it("requires confirmation before deleting one access token", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(
            screen.getByRole("button", {
                name: "Zugriffstoken Product sync löschen",
            }),
        );

        expect(
            screen.getByRole("alertdialog", {
                name: "Zugriffstoken „Product sync“ löschen?",
            }),
        ).toBeInTheDocument();
        expect(mockDeleteAccessTokenMutate).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Token endgültig löschen" }));

        expect(mockDeleteAccessTokenMutate).toHaveBeenCalledWith(
            "token-12345678",
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("requires confirmation before deleting all access tokens", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(screen.getByRole("button", { name: "Alle löschen" }));

        expect(
            screen.getByRole("alertdialog", { name: "Alle Zugriffstoken löschen?" }),
        ).toHaveTextContent("Alle 2 Zugriffstoken");
        expect(mockDeleteAllAccessTokensMutate).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Alle Token endgültig löschen" }));

        expect(mockDeleteAllAccessTokensMutate).toHaveBeenCalledWith(
            ["token-12345678", "token-87654321"],
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("marks expired tokens and lists them after active ones", () => {
        mockUseAccessTokens.mockReturnValue({
            data: [
                {
                    id: "token-expired",
                    name: "Archived sync",
                    scopes: [],
                    expiresAt: new Date("2020-01-01T00:00:00Z"),
                },
                {
                    id: "token-active",
                    name: "Product sync",
                    scopes: [],
                    expiresAt: null,
                },
            ],
            dataUpdatedAt: 1,
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<AccessTokensSection />);

        const items = screen.getAllByRole("listitem");
        expect(items[0]).toHaveTextContent("Product sync");
        expect(items[1]).toHaveTextContent("Archived sync");
        const expiredBadge = screen.getByText(/Abgelaufen am/).closest('[data-slot="badge"]');
        expect(expiredBadge).not.toHaveClass("bg-primary/10");
        expect(screen.queryByText(/Läuft ab am/)).not.toBeInTheDocument();
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
