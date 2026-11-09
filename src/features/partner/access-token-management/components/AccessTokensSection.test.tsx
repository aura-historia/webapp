import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccessTokensSection } from "@/features/partner/access-token-management/components/AccessTokensSection.tsx";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import type { ConnectedApp } from "@/data/internal/access-tokens/OwnCredentials.ts";
import { formatDateTime } from "@/lib/utils.ts";

const mockUseOwnCredentials = vi.hoisted(() => vi.fn());
const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockUpdateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockDeleteAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockDeleteAllAccessTokensMutate = vi.hoisted(() => vi.fn());
const mockDisconnectMutate = vi.hoisted(() => vi.fn());
const mockMutationState = vi.hoisted(() => ({
    deletePending: false,
    deleteAllPending: false,
    disconnectPending: false,
}));

vi.mock("@/env.ts", () => ({
    env: {
        VITE_APP_URL: "https://aura-historia.com",
        VITE_USER_POOL_ID: "test-pool-id",
        VITE_USER_POOL_CLIENT_ID: "test-client-id",
        VITE_COGNITO_DOMAIN: "auth.aura-historia.com",
        VITE_COGNITO_REDIRECT_SIGN_IN: "http://localhost:3000",
        VITE_COGNITO_REDIRECT_SIGN_OUT: "http://localhost:3000",
    },
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { role: "USER" } }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useOwnCredentials: mockUseOwnCredentials,
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
    useDisconnectConnectedApp: () => ({
        mutate: mockDisconnectMutate,
        isPending: mockMutationState.disconnectPending,
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

const SHOPIFY: ConnectedApp = {
    client: {
        clientId: "oc_shopify",
        name: "Shopify",
        kind: "registered",
        host: "shopify.com",
    },
    origin: "OAuth",
    scopes: ["product-listings:write", "listing-sources:read"],
    connection: null,
    tokens: [
        { id: "at_shop_1", scopes: ["product-listings:write"], expiresAt: null },
        { id: "at_shop_2", scopes: ["listing-sources:read"], expiresAt: null },
    ],
};

const CONNECTED_AT = new Date("2026-11-01T09:00:00Z");
const LAST_USED_AT = new Date("2026-11-06T12:00:00Z");

const CLAUDE_CODE: ConnectedApp = {
    client: {
        clientId: "https://claude.ai/oauth/claude-code-client-metadata",
        name: "Claude Code",
        kind: "metadataDocument",
        host: "claude.ai",
    },
    origin: "OAuthMetadataDocument",
    scopes: ["watchlist:read"],
    connection: {
        id: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
        connectedAt: CONNECTED_AT,
        lastUsedAt: LAST_USED_AT,
    },
    tokens: [],
};

const BROWSER_AGENTS: ConnectedApp = {
    client: {
        clientId: "https://aura-historia.com/oauth/webmcp-client.json",
        name: "AI agents in your browser",
        kind: "metadataDocument",
        host: "aura-historia.com",
    },
    origin: "OAuthMetadataDocument",
    scopes: ["watchlist:read"],
    connection: {
        id: "ocn_browser",
        connectedAt: CONNECTED_AT,
        lastUsedAt: null,
    },
    tokens: [],
};

function mockCredentials(
    personalTokens: AccessToken[] | undefined,
    connectedApps: ConnectedApp[] = [],
    overrides: Record<string, unknown> = {},
) {
    const refetch = vi.fn();
    mockUseOwnCredentials.mockReturnValue({
        data: personalTokens ? { personalTokens, connectedApps } : undefined,
        dataUpdatedAt: personalTokens ? 1 : 0,
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

function connectedAppsSection() {
    return screen.getByRole("region", { name: "Verbundene Apps." });
}

function personalSection() {
    return screen.getByRole("region", { name: "Persönliche Zugriffstoken." });
}

describe("AccessTokensSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMutationState.deletePending = false;
        mockMutationState.deleteAllPending = false;
        mockMutationState.disconnectPending = false;
        mockCredentials([PRODUCT_SYNC, SHOP_ADMINISTRATION]);
    });

    describe("personal access tokens", () => {
        it("renders the page header and the create action in the personal section", () => {
            render(<AccessTokensSection />);

            expect(
                screen.getByRole("heading", { level: 1, name: "Ihre Zugriffstoken." }),
            ).toBeInTheDocument();
            expect(screen.getByText(/^Alles, was für Ihr Konto handeln kann/)).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: "Neues Zugriffstoken" })).toHaveLength(1);
            expect(
                within(personalSection()).getByRole("button", { name: "Neues Zugriffstoken" }),
            ).toBeInTheDocument();
        });

        it("renders saved access tokens in the active group with their metadata", () => {
            render(<AccessTokensSection />);

            const activeGroup = screen.getByRole("group", { name: "Aktiv" });
            expect(activeGroup).toHaveTextContent("2 in Verwendung");
            expect(screen.queryByRole("group", { name: "Abgelaufen" })).not.toBeInTheDocument();

            const productSync = rowFor("Product sync");
            expect(within(productSync).getAllByText("Läuft nicht ab")).toHaveLength(2);
            const permissions = within(productSync).getByRole("list", { name: "Berechtigungen" });
            expect(within(permissions).getByText("Produktangebote schreiben")).toBeInTheDocument();
            expect(within(permissions).getByText("Gespeicherte Suchen lesen")).toBeInTheDocument();
            expect(within(permissions).getByText("Admin-Übersicht lesen")).toBeInTheDocument();

            const shopAdministration = rowFor("Shop administration");
            expect(
                within(shopAdministration).getByText("Keine Berechtigungen"),
            ).toBeInTheDocument();
            expect(within(shopAdministration).getAllByText(/^Läuft ab am /)).toHaveLength(2);
        });

        it("shows three permissions and reveals the rest on demand", async () => {
            const user = userEvent.setup();
            render(<AccessTokensSection />);
            const productSync = rowFor("Product sync");

            expect(within(productSync).queryByText("Merkliste lesen")).not.toBeInTheDocument();
            expect(
                within(productSync).queryByText("Benachrichtigungen lesen"),
            ).not.toBeInTheDocument();
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
            mockCredentials([{ ...PRODUCT_SYNC, scopes: PRODUCT_SYNC.scopes.slice(0, 3) }]);
            render(<AccessTokensSection />);

            expect(screen.queryByRole("button", { name: /weitere/ })).not.toBeInTheDocument();
        });

        it("opens the access token creation dialog", async () => {
            const user = userEvent.setup();
            render(<AccessTokensSection />);

            await user.click(screen.getByRole("button", { name: "Neues Zugriffstoken" }));

            expect(
                screen.getByRole("dialog", { name: "Zugriffstoken erstellen" }),
            ).toBeInTheDocument();
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

            const confirmation = screen.getByRole("alertdialog", {
                name: "„Product sync“ löschen?",
            });
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

        it("requires confirmation before deleting all personal access tokens and spares connected apps", async () => {
            const user = userEvent.setup();
            mockCredentials([PRODUCT_SYNC, SHOP_ADMINISTRATION], [SHOPIFY, CLAUDE_CODE]);
            mockDeleteAllAccessTokensMutate.mockImplementation(
                (_ids: string[], options: { onSuccess: () => void }) => options.onSuccess(),
            );
            render(<AccessTokensSection />);

            expect(
                screen.getByRole("group", { name: "Alle persönlichen Zugriffstoken löschen" }),
            ).toHaveTextContent(/Jede Integration, die eines davon verwendet/);
            await user.click(screen.getByRole("button", { name: "Alle löschen…" }));

            const confirmation = screen.getByRole("alertdialog", {
                name: "Alle 2 persönlichen Zugriffstoken löschen?",
            });
            expect(confirmation).toHaveTextContent("Alle 2 Token werden endgültig gelöscht.");
            expect(confirmation).toHaveTextContent("Verbundene Apps bleiben verbunden.");
            expect(mockDeleteAllAccessTokensMutate).not.toHaveBeenCalled();

            await user.click(
                within(confirmation).getByRole("button", { name: "Alle 2 Token löschen" }),
            );

            expect(mockDeleteAllAccessTokensMutate).toHaveBeenCalledWith(
                ["token-12345678", "token-87654321"],
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
            expect(mockDisconnectMutate).not.toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith(
                "Alle persönlichen Zugriffstoken wurden gelöscht.",
            );
            expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        });

        it("locks the row actions and shows progress while a token is deleted", () => {
            mockMutationState.deletePending = true;
            mockCredentials([PRODUCT_SYNC, SHOP_ADMINISTRATION], [SHOPIFY]);
            render(<AccessTokensSection />);

            expect(
                screen.getByRole("button", { name: "Zugriffstoken Product sync bearbeiten" }),
            ).toBeDisabled();
            expect(
                screen.getByRole("button", { name: "Zugriffstoken Product sync löschen" }),
            ).toBeDisabled();
            expect(screen.getByRole("button", { name: "Alle löschen…" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Shopify trennen" })).toBeDisabled();
        });

        it("shows the pending label in the confirmation while all tokens are deleted", async () => {
            const user = userEvent.setup();
            const { rerender } = render(<AccessTokensSection />);
            await user.click(screen.getByRole("button", { name: "Alle löschen…" }));

            mockMutationState.deleteAllPending = true;
            rerender(<AccessTokensSection />);

            const confirmation = screen.getByRole("alertdialog");
            expect(confirmation).toHaveAttribute("aria-busy", "true");
            expect(
                within(confirmation).getByRole("button", { name: "Wird gelöscht…" }),
            ).toBeDisabled();
            expect(within(confirmation).getByRole("button", { name: "Abbrechen" })).toBeDisabled();
        });

        it("lists expired tokens in their own group after active ones", () => {
            mockCredentials([
                {
                    id: "token-expired",
                    name: "Archived sync",
                    scopes: [],
                    expiresAt: new Date("2020-01-01T00:00:00Z"),
                },
                { id: "token-active", name: "Product sync", scopes: [], expiresAt: null },
            ]);

            render(<AccessTokensSection />);

            const activeGroup = screen.getByRole("group", { name: "Aktiv" });
            const expiredGroup = screen.getByRole("group", { name: "Abgelaufen" });
            expect(activeGroup).toHaveTextContent("1 in Verwendung");
            expect(
                within(activeGroup).getByRole("heading", { name: "Product sync" }),
            ).toBeVisible();
            expect(expiredGroup).toHaveTextContent("1 funktioniert nicht mehr");
            expect(
                within(expiredGroup).getByRole("heading", { name: "Archived sync" }),
            ).toBeVisible();
            expect(within(expiredGroup).getAllByText(/^Abgelaufen am /)).toHaveLength(2);
            expect(screen.queryByText(/^Läuft ab am /)).not.toBeInTheDocument();
            expect(
                activeGroup.compareDocumentPosition(expiredGroup) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        });

        it("renders the personal empty state with the section's create action", async () => {
            const user = userEvent.setup();
            mockCredentials([], [SHOPIFY]);

            render(<AccessTokensSection />);

            const section = personalSection();
            expect(within(section).getByText("Keine persönlichen Zugriffstoken.")).toBeVisible();
            expect(
                within(section).getByText(/Erstellen Sie eines, sobald Ihre eigene Integration/),
            ).toBeVisible();
            expect(screen.queryByRole("button", { name: "Alle löschen…" })).not.toBeInTheDocument();
            expect(screen.queryByRole("group", { name: "Aktiv" })).not.toBeInTheDocument();
            expect(rowFor("Shopify")).toBeInTheDocument();

            const createButtons = screen.getAllByRole("button", { name: "Neues Zugriffstoken" });
            expect(createButtons).toHaveLength(1);
            await user.click(createButtons[0]);
            expect(
                screen.getByRole("dialog", { name: "Zugriffstoken erstellen" }),
            ).toBeInTheDocument();
        });
    });

    describe("connected apps", () => {
        it("renders a registered client and an agent with name, kind and verified host", () => {
            mockCredentials([PRODUCT_SYNC], [SHOPIFY, CLAUDE_CODE]);
            render(<AccessTokensSection />);

            const section = connectedAppsSection();
            expect(section).toHaveTextContent("2 verbunden");
            // Sorted by name, in the connected apps section before personal tokens.
            const names = within(section)
                .getAllByRole("heading", { level: 3 })
                .map((heading) => heading.textContent);
            expect(names).toEqual(["Claude Code", "Shopify"]);
            expect(
                section.compareDocumentPosition(personalSection()) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();

            const shopify = rowFor("Shopify");
            expect(within(shopify).getByText("Integration")).toBeInTheDocument();
            expect(within(shopify).getByText("shopify.com")).toBeInTheDocument();
            const permissions = within(shopify).getByRole("list", { name: "Berechtigungen" });
            expect(within(permissions).getByText("Produktangebote schreiben")).toBeInTheDocument();

            const claudeCode = rowFor("Claude Code");
            expect(within(claudeCode).getByText("KI-Agent")).toBeInTheDocument();
            expect(within(claudeCode).getByText("claude.ai")).toBeInTheDocument();
        });

        it("shows an agent's connection and last use dates", () => {
            mockCredentials([], [CLAUDE_CODE]);
            render(<AccessTokensSection />);

            const claudeCode = rowFor("Claude Code");
            // The meta list renders once for narrow and once for wide layouts.
            expect(within(claudeCode).getAllByText("Verbunden")).toHaveLength(2);
            expect(within(claudeCode).getAllByText("Zuletzt genutzt")).toHaveLength(2);
            expect(
                within(claudeCode).getAllByText(formatDateTime(CONNECTED_AT, "de")),
            ).toHaveLength(2);
            expect(
                within(claudeCode).getAllByText(formatDateTime(LAST_USED_AT, "de")),
            ).toHaveLength(2);
            expect(within(claudeCode).queryByText("Token")).not.toBeInTheDocument();
            expect(within(claudeCode).queryByText("Läuft nicht ab")).not.toBeInTheDocument();
        });

        it("shows an integration's token count and expiry", () => {
            mockCredentials([], [SHOPIFY]);
            render(<AccessTokensSection />);

            const shopify = rowFor("Shopify");
            expect(within(shopify).getAllByText("Token")).toHaveLength(2);
            expect(within(shopify).getAllByText("2")).toHaveLength(2);
            expect(within(shopify).getAllByText("Läuft nicht ab")).toHaveLength(2);
            expect(within(shopify).queryByText("Verbunden")).not.toBeInTheDocument();
        });

        it("shows the website's own browser-agent client under its translated name", () => {
            mockCredentials([], [BROWSER_AGENTS]);
            render(<AccessTokensSection />);

            const browserAgents = rowFor("KI-Agenten in Ihrem Browser");
            expect(within(browserAgents).getByText("Browser-Agenten")).toBeInTheDocument();
            expect(within(browserAgents).getByText("aura-historia.com")).toBeInTheDocument();
            expect(screen.queryByText("AI agents in your browser")).not.toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "KI-Agenten in Ihrem Browser trennen" }),
            ).toBeInTheDocument();
        });

        it("asks for confirmation before disconnecting and cancels without a request", async () => {
            const user = userEvent.setup();
            mockCredentials([], [SHOPIFY]);
            render(<AccessTokensSection />);

            await user.click(screen.getByRole("button", { name: "Shopify trennen" }));

            const confirmation = screen.getByRole("group", { name: /^Shopify trennen\?/ });
            expect(confirmation).toHaveFocus();
            expect(confirmation).toHaveTextContent("Ihre 2 Zugriffstoken werden sofort widerrufen");
            expect(
                screen.queryByRole("button", { name: "Shopify trennen" }),
            ).not.toBeInTheDocument();

            await user.click(within(confirmation).getByRole("button", { name: "Abbrechen" }));

            expect(
                screen.queryByRole("group", { name: /^Shopify trennen\?/ }),
            ).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Shopify trennen" })).toHaveFocus();
            expect(mockDisconnectMutate).not.toHaveBeenCalled();
        });

        it("explains what disconnecting an agent ends", async () => {
            const user = userEvent.setup();
            mockCredentials([], [CLAUDE_CODE]);
            render(<AccessTokensSection />);

            await user.click(screen.getByRole("button", { name: "Claude Code trennen" }));

            expect(screen.getByRole("group", { name: /^Claude Code trennen\?/ })).toHaveTextContent(
                "auch die gespeicherte Anmeldung",
            );
        });

        it("disconnects the app by its client ID and confirms success", async () => {
            const user = userEvent.setup();
            mockDisconnectMutate.mockImplementation(
                (_clientId: string, options: { onSuccess: () => void }) => options.onSuccess(),
            );
            mockCredentials([PRODUCT_SYNC], [SHOPIFY, CLAUDE_CODE]);
            render(<AccessTokensSection />);

            await user.click(screen.getByRole("button", { name: "Claude Code trennen" }));
            const confirmation = screen.getByRole("group", { name: /^Claude Code trennen\?/ });
            await user.click(within(confirmation).getByRole("button", { name: "Trennen" }));

            expect(mockDisconnectMutate).toHaveBeenCalledOnce();
            expect(mockDisconnectMutate).toHaveBeenCalledWith(
                "https://claude.ai/oauth/claude-code-client-metadata",
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                }),
            );
            expect(toast.success).toHaveBeenCalledWith("Claude Code wurde getrennt.");
            expect(
                screen.queryByRole("group", { name: /^Claude Code trennen\?/ }),
            ).not.toBeInTheDocument();
            expect(mockDeleteAccessTokenMutate).not.toHaveBeenCalled();
            expect(mockDeleteAllAccessTokensMutate).not.toHaveBeenCalled();
        });

        it("names the browser agents by their translated name in the success toast", async () => {
            const user = userEvent.setup();
            mockDisconnectMutate.mockImplementation(
                (_clientId: string, options: { onSuccess: () => void }) => options.onSuccess(),
            );
            mockCredentials([], [BROWSER_AGENTS]);
            render(<AccessTokensSection />);

            await user.click(
                screen.getByRole("button", { name: "KI-Agenten in Ihrem Browser trennen" }),
            );
            await user.click(screen.getByRole("button", { name: "Trennen" }));

            expect(mockDisconnectMutate).toHaveBeenCalledWith(
                "https://aura-historia.com/oauth/webmcp-client.json",
                expect.anything(),
            );
            expect(toast.success).toHaveBeenCalledWith(
                "KI-Agenten in Ihrem Browser wurde getrennt.",
            );
        });

        it("reports a failed disconnect and keeps the confirmation open", async () => {
            const user = userEvent.setup();
            mockDisconnectMutate.mockImplementation(
                (_clientId: string, options: { onError: () => void }) => options.onError(),
            );
            mockCredentials([], [SHOPIFY]);
            render(<AccessTokensSection />);

            await user.click(screen.getByRole("button", { name: "Shopify trennen" }));
            await user.click(screen.getByRole("button", { name: "Trennen" }));

            expect(toast.error).toHaveBeenCalledWith(
                "Shopify konnte nicht getrennt werden. Bitte versuchen Sie es erneut.",
            );
            expect(toast.success).not.toHaveBeenCalled();
            expect(screen.getByRole("group", { name: /^Shopify trennen\?/ })).toBeInTheDocument();
        });

        it("shows progress and locks every action while an app is disconnected", async () => {
            const user = userEvent.setup();
            mockCredentials([PRODUCT_SYNC], [SHOPIFY, CLAUDE_CODE]);
            const { rerender } = render(<AccessTokensSection />);

            await user.click(screen.getByRole("button", { name: "Shopify trennen" }));
            mockMutationState.disconnectPending = true;
            rerender(<AccessTokensSection />);

            const confirmation = screen.getByRole("group", { name: /^Shopify trennen\?/ });
            expect(confirmation).toHaveAttribute("aria-busy", "true");
            expect(
                within(confirmation).getByRole("button", { name: "Wird getrennt…" }),
            ).toBeDisabled();
            expect(within(confirmation).getByRole("button", { name: "Abbrechen" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Claude Code trennen" })).toBeDisabled();
            expect(
                screen.getByRole("button", { name: "Zugriffstoken Product sync bearbeiten" }),
            ).toBeDisabled();
            expect(
                screen.getByRole("button", { name: "Zugriffstoken Product sync löschen" }),
            ).toBeDisabled();
            expect(screen.getByRole("button", { name: "Alle löschen…" })).toBeDisabled();
        });

        it("renders the connected apps empty state next to personal tokens", () => {
            render(<AccessTokensSection />);

            const section = connectedAppsSection();
            expect(within(section).getByText("Keine verbundenen Apps.")).toBeVisible();
            expect(within(section).queryByText(/verbunden$/)).not.toBeInTheDocument();
            expect(within(section).queryByRole("list")).not.toBeInTheDocument();
            expect(rowFor("Product sync")).toBeInTheDocument();
        });
    });

    it("renders both empty states together", () => {
        mockCredentials([], []);
        render(<AccessTokensSection />);

        expect(within(connectedAppsSection()).getByText("Keine verbundenen Apps.")).toBeVisible();
        expect(
            within(personalSection()).getByText("Keine persönlichen Zugriffstoken."),
        ).toBeVisible();
        expect(screen.queryByRole("button", { name: "Alle löschen…" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Neues Zugriffstoken" })).toBeInTheDocument();
    });

    it("renders a loading skeleton under both section headings", () => {
        mockCredentials(undefined, [], { isPending: true });

        render(<AccessTokensSection />);

        const status = screen.getByRole("status");
        expect(status).toHaveTextContent("Zugriffstoken und verbundene Apps werden geladen…");
        expect(
            within(status).getByRole("heading", { level: 2, name: "Verbundene Apps." }),
        ).toBeInTheDocument();
        expect(
            within(status).getByRole("heading", { level: 2, name: "Persönliche Zugriffstoken." }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Neues Zugriffstoken" }),
        ).not.toBeInTheDocument();
    });

    it("retries after a loading error", async () => {
        const user = userEvent.setup();
        const refetch = mockCredentials(undefined, [], { isError: true });

        render(<AccessTokensSection />);
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Ihre Zugriffstoken und verbundenen Apps konnten nicht geladen werden.",
        );
        expect(
            screen.getByRole("heading", { name: "Zugriffstoken nicht verfügbar." }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("heading", { level: 2, name: "Verbundene Apps." }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("heading", { level: 2, name: "Persönliche Zugriffstoken." }),
        ).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Erneut versuchen" }));

        expect(refetch).toHaveBeenCalledOnce();
    });
});
