import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessTokensSection } from "@/features/partner/access-token-management/components/AccessTokensSection.tsx";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";

const mockUseAccessTokens = vi.hoisted(() => vi.fn());
const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockUpdateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockDeleteAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockDeleteAllAccessTokensMutate = vi.hoisted(() => vi.fn());
const mockMutationState = vi.hoisted(() => ({ deletePending: false, deleteAllPending: false }));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { role: "USER" } }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

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
        isPending: mockMutationState.deletePending,
    }),
    useDeleteAllAccessTokens: () => ({
        mutate: mockDeleteAllAccessTokensMutate,
        isPending: mockMutationState.deleteAllPending,
    }),
}));

const PRODUCT_SYNC: AccessToken = {
    id: "token-12345678",
    name: "Product sync",
    scopes: [
        "product-listings:write",
        "search-filters:read",
        "admin-overview:read",
        "watchlist:read",
        "notifications:read",
    ],
    expiresAt: null,
};

const SHOP_ADMINISTRATION: AccessToken = {
    id: "token-87654321",
    name: "Shop administration",
    scopes: [],
    expiresAt: new Date("2099-08-01T12:00:00Z"),
};

function mockTokens(data: AccessToken[] | undefined, overrides: Record<string, unknown> = {}) {
    const refetch = vi.fn();
    mockUseAccessTokens.mockReturnValue({
        data,
        dataUpdatedAt: data ? 1 : 0,
        isPending: false,
        isError: false,
        refetch,
        ...overrides,
    });
    return refetch;
}

function rowFor(name: string) {
    const row = screen.getByRole("heading", { level: 3, name }).closest("li");
    if (!row) throw new Error(`No row for ${name}`);
    return row;
}

describe("AccessTokensSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMutationState.deletePending = false;
        mockMutationState.deleteAllPending = false;
        mockTokens([PRODUCT_SYNC, SHOP_ADMINISTRATION]);
    });

    it("renders the page header and the create action", () => {
        render(<AccessTokensSection />);

        expect(
            screen.getByRole("heading", { level: 1, name: "Ihre Zugriffstoken." }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Mit Zugriffstoken ruft Ihre Integration die Aura Historia API/),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Neues Zugriffstoken" })).toBeInTheDocument();
    });

    it("renders saved access tokens in the active group with their metadata", () => {
        render(<AccessTokensSection />);

        const activeGroup = screen.getByRole("region", { name: "Aktiv" });
        expect(activeGroup).toHaveTextContent("2 in Verwendung");
        expect(screen.queryByRole("region", { name: "Abgelaufen" })).not.toBeInTheDocument();

        const productSync = rowFor("Product sync");
        expect(within(productSync).getAllByText("Läuft nicht ab")).toHaveLength(2);
        const permissions = within(productSync).getByRole("list", { name: "Berechtigungen" });
        expect(within(permissions).getByText("Produktangebote schreiben")).toBeInTheDocument();
        expect(within(permissions).getByText("Gespeicherte Suchen lesen")).toBeInTheDocument();
        expect(within(permissions).getByText("Admin-Übersicht lesen")).toBeInTheDocument();

        const shopAdministration = rowFor("Shop administration");
        expect(within(shopAdministration).getByText("Keine Berechtigungen")).toBeInTheDocument();
        expect(within(shopAdministration).getAllByText(/^Läuft ab am /)).toHaveLength(2);
    });

    it("shows three permissions and reveals the rest on demand", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);
        const productSync = rowFor("Product sync");

        expect(within(productSync).queryByText("Merkliste lesen")).not.toBeInTheDocument();
        expect(within(productSync).queryByText("Benachrichtigungen lesen")).not.toBeInTheDocument();
        const toggle = within(productSync).getByRole("button", { name: "+2 weitere" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");

        await user.click(toggle);

        expect(within(productSync).getByText("Merkliste lesen")).toBeInTheDocument();
        expect(within(productSync).getByText("Benachrichtigungen lesen")).toBeInTheDocument();
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(toggle).toHaveTextContent("Weniger anzeigen");

        await user.click(toggle);
        expect(within(productSync).queryByText("Merkliste lesen")).not.toBeInTheDocument();
    });

    it("offers no expand toggle for three permissions or fewer", () => {
        mockTokens([{ ...PRODUCT_SYNC, scopes: PRODUCT_SYNC.scopes.slice(0, 3) }]);
        render(<AccessTokensSection />);

        expect(screen.queryByRole("button", { name: /weitere/ })).not.toBeInTheDocument();
    });

    it("opens the access token creation dialog", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(screen.getByRole("button", { name: "Neues Zugriffstoken" }));

        expect(screen.getByRole("dialog", { name: "Zugriffstoken erstellen" })).toBeInTheDocument();
    });

    it("opens the creation dialog when asked by the page and reports closing", async () => {
        const user = userEvent.setup();
        const onCreateOpenChange = vi.fn();
        render(<AccessTokensSection createOpen onCreateOpenChange={onCreateOpenChange} />);

        const dialog = screen.getByRole("dialog", { name: "Zugriffstoken erstellen" });
        await user.click(within(dialog).getByRole("button", { name: "Abbrechen" }));

        expect(onCreateOpenChange).toHaveBeenCalledWith(false);
    });

    it("opens the edit dialog with the current name", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(
            screen.getByRole("button", { name: "Zugriffstoken Product sync bearbeiten" }),
        );

        expect(
            screen.getByRole("dialog", { name: "Zugriffstoken bearbeiten" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Product sync");
    });

    it("requires confirmation before deleting one access token", async () => {
        const user = userEvent.setup();
        mockDeleteAccessTokenMutate.mockImplementation(
            (_id: string, options: { onSuccess: () => void }) => options.onSuccess(),
        );
        render(<AccessTokensSection />);

        await user.click(
            screen.getByRole("button", { name: "Zugriffstoken Product sync löschen" }),
        );

        const confirmation = screen.getByRole("alertdialog", { name: "„Product sync“ löschen?" });
        expect(confirmation).toHaveTextContent(
            "Das Token wird endgültig gelöscht und funktioniert ab sofort nicht mehr.",
        );
        expect(mockDeleteAccessTokenMutate).not.toHaveBeenCalled();

        await user.click(within(confirmation).getByRole("button", { name: "Token löschen" }));

        expect(mockDeleteAccessTokenMutate).toHaveBeenCalledWith(
            "token-12345678",
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
        expect(toast.success).toHaveBeenCalledWith("Zugriffstoken wurde gelöscht.");
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("cancels deleting one access token", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        await user.click(
            screen.getByRole("button", { name: "Zugriffstoken Product sync löschen" }),
        );
        await user.click(
            within(screen.getByRole("alertdialog")).getByRole("button", { name: "Abbrechen" }),
        );

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        expect(mockDeleteAccessTokenMutate).not.toHaveBeenCalled();
    });

    it("requires confirmation before deleting all access tokens", async () => {
        const user = userEvent.setup();
        render(<AccessTokensSection />);

        expect(
            screen.getByRole("region", { name: "Alle Zugriffstoken löschen" }),
        ).toHaveTextContent(/Jede Integration, die eines davon verwendet/);
        await user.click(screen.getByRole("button", { name: "Alle löschen…" }));

        const confirmation = screen.getByRole("alertdialog", {
            name: "Alle 2 Zugriffstoken löschen?",
        });
        expect(confirmation).toHaveTextContent("Alle 2 Token werden endgültig gelöscht.");
        expect(mockDeleteAllAccessTokensMutate).not.toHaveBeenCalled();

        await user.click(
            within(confirmation).getByRole("button", { name: "Alle 2 Token löschen" }),
        );

        expect(mockDeleteAllAccessTokensMutate).toHaveBeenCalledWith(
            ["token-12345678", "token-87654321"],
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("locks the row actions and shows progress while a token is deleted", () => {
        mockMutationState.deletePending = true;
        render(<AccessTokensSection />);

        expect(
            screen.getByRole("button", { name: "Zugriffstoken Product sync bearbeiten" }),
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Zugriffstoken Product sync löschen" }),
        ).toBeDisabled();
        expect(screen.getByRole("button", { name: "Alle löschen…" })).toBeDisabled();
    });

    it("shows the pending label in the confirmation while all tokens are deleted", async () => {
        const user = userEvent.setup();
        const { rerender } = render(<AccessTokensSection />);
        await user.click(screen.getByRole("button", { name: "Alle löschen…" }));

        mockMutationState.deleteAllPending = true;
        rerender(<AccessTokensSection />);

        const confirmation = screen.getByRole("alertdialog");
        expect(confirmation).toHaveAttribute("aria-busy", "true");
        expect(within(confirmation).getByRole("button", { name: "Wird gelöscht…" })).toBeDisabled();
        expect(within(confirmation).getByRole("button", { name: "Abbrechen" })).toBeDisabled();
    });

    it("lists expired tokens in their own group after active ones", () => {
        mockTokens([
            {
                id: "token-expired",
                name: "Archived sync",
                scopes: [],
                expiresAt: new Date("2020-01-01T00:00:00Z"),
            },
            { id: "token-active", name: "Product sync", scopes: [], expiresAt: null },
        ]);

        render(<AccessTokensSection />);

        const activeGroup = screen.getByRole("region", { name: "Aktiv" });
        const expiredGroup = screen.getByRole("region", { name: "Abgelaufen" });
        expect(activeGroup).toHaveTextContent("1 in Verwendung");
        expect(within(activeGroup).getByRole("heading", { name: "Product sync" })).toBeVisible();
        expect(expiredGroup).toHaveTextContent("1 funktioniert nicht mehr");
        expect(within(expiredGroup).getByRole("heading", { name: "Archived sync" })).toBeVisible();
        expect(within(expiredGroup).getAllByText(/^Abgelaufen am /)).toHaveLength(2);
        expect(screen.queryByText(/^Läuft ab am /)).not.toBeInTheDocument();
        expect(
            activeGroup.compareDocumentPosition(expiredGroup) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("renders the empty state with a create action", async () => {
        const user = userEvent.setup();
        mockTokens([]);

        render(<AccessTokensSection />);

        expect(
            screen.getByRole("heading", { name: "Noch keine Zugriffstoken." }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Erstellen Sie ein Token, wenn Sie eine Integration/),
        ).toBeVisible();
        expect(screen.queryByRole("button", { name: "Alle löschen…" })).not.toBeInTheDocument();

        const createButtons = screen.getAllByRole("button", { name: "Neues Zugriffstoken" });
        expect(createButtons).toHaveLength(2);
        await user.click(createButtons[1]);
        expect(screen.getByRole("dialog", { name: "Zugriffstoken erstellen" })).toBeInTheDocument();
    });

    it("renders a loading skeleton", () => {
        mockTokens(undefined, { isPending: true });

        render(<AccessTokensSection />);

        expect(screen.getByRole("status")).toHaveTextContent("Zugriffstoken werden geladen.");
    });

    it("retries after a loading error", async () => {
        const user = userEvent.setup();
        const refetch = mockTokens(undefined, { isError: true });

        render(<AccessTokensSection />);
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Ihre Zugriffstoken konnten nicht geladen werden.",
        );
        expect(
            screen.getByRole("heading", { name: "Zugriffstoken nicht verfügbar." }),
        ).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Erneut versuchen" }));

        expect(refetch).toHaveBeenCalledOnce();
    });
});
