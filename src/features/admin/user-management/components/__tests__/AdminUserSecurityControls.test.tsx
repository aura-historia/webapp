import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CredentialListEntryData } from "@/data/internal/access-tokens/OwnCredentials.ts";
import testI18n from "@/i18n/i18nForTests";
import { formatDateTime } from "@/lib/utils.ts";
import { AdminUserSecurityControls } from "../AdminUserSecurityControls.tsx";

const CATALOG_INTEGRATION: CredentialListEntryData = {
    accessTokenId: "at_selected",
    name: "Catalog integration",
    scopes: ["users:read"],
    origin: "User",
};

const AGENT_CONNECTION: CredentialListEntryData = {
    connectionId: "ocn_agent",
    name: "Claude Code",
    scopes: ["watchlist:read"],
    origin: "OAuthMetadataDocument",
    client: {
        clientId: "https://claude.ai/oauth/claude-code-client-metadata",
        name: "Claude Code",
        kind: "METADATA_DOCUMENT",
        host: "claude.ai",
    },
    created: "2026-11-01T09:00:00Z",
    lastUsed: "2026-11-06T12:00:00Z",
};

const SHOPIFY_CLIENT = {
    clientId: "oc_shopify",
    name: "Shopify",
    kind: "REGISTERED",
    host: "shopify.com",
} as const;

const SHOPIFY_TOKEN_1: CredentialListEntryData = {
    accessTokenId: "at_shop_1",
    name: "Shopify",
    scopes: ["product-listings:write"],
    origin: "OAuth",
    client: SHOPIFY_CLIENT,
};

const SHOPIFY_TOKEN_2: CredentialListEntryData = {
    accessTokenId: "at_shop_2",
    name: "Shopify",
    scopes: ["listing-sources:read"],
    origin: "OAuth",
    client: SHOPIFY_CLIENT,
    expires: "2027-01-01T00:00:00Z",
};

const mocks = vi.hoisted(() => ({
    suspend: vi.fn(),
    unsuspend: vi.fn(),
    sessions: vi.fn(),
    revokeToken: vi.fn(),
    revokeAllTokens: vi.fn(),
    signOut: vi.fn(),
    navigate: vi.fn(),
    currentUserId: "usr_target",
    tokenItems: [] as unknown[],
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

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mocks.navigate,
    useParams: () => ({ lng: "en" }),
}));
vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { userId: mocks.currentUserId } }),
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ signOut: mocks.signOut }),
}));
vi.mock("../../api/useAdminUserSecurity.ts", () => ({
    useAdminUserAccessTokens: () => ({
        data: { pages: [{ items: mocks.tokenItems }] },
        isLoading: false,
        isError: false,
        hasNextPage: false,
        isFetchingNextPage: false,
        refetch: vi.fn(),
        fetchNextPage: vi.fn(),
    }),
    useAdminUserSecurityActions: () => ({
        suspend: mocks.suspend,
        unsuspend: mocks.unsuspend,
        revokeSessions: mocks.sessions,
        revokeToken: mocks.revokeToken,
        revokeAllTokens: mocks.revokeAllTokens,
    }),
}));

describe("AdminUserSecurityControls", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.currentUserId = "usr_target";
        mocks.tokenItems = [CATALOG_INTEGRATION];
        mocks.suspend.mockResolvedValue({ userId: "usr_target", suspended: true });
        mocks.sessions.mockResolvedValue(undefined);
        mocks.revokeToken.mockResolvedValue(undefined);
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("validates blank reasons and the Unicode UTF-8 byte limit before sending a suspension", async () => {
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });
        const reason = screen.getByLabelText(testI18n.t("adminUsers.security.suspension.reason"));
        const suspend = screen.getByRole("button", {
            name: testI18n.t("adminUsers.security.actions.suspend"),
        });

        await user.click(suspend);
        expect(
            await screen.findByText(testI18n.t("adminUsers.security.suspension.reasonRequired")),
        ).toBeInTheDocument();
        expect(mocks.suspend).not.toHaveBeenCalled();

        fireEvent.change(reason, { target: { value: "é".repeat(501) } });
        await user.click(suspend);
        expect(
            await screen.findByText(testI18n.t("adminUsers.security.suspension.reasonTooLong")),
        ).toBeInTheDocument();
        expect(mocks.suspend).not.toHaveBeenCalled();

        fireEvent.change(reason, { target: { value: "é".repeat(500) } });
        await user.click(suspend);
        await waitFor(() =>
            expect(mocks.suspend).toHaveBeenCalledWith({
                userId: "usr_target",
                reason: "é".repeat(500),
            }),
        );
        expect(reason).toHaveValue("");
    });

    it("does not claim a suspension state until the API confirms one", () => {
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        expect(
            screen.getByText(testI18n.t("adminUsers.security.suspension.stateUnknown")),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(testI18n.t("adminUsers.security.suspension.confirmedSuspended")),
        ).not.toBeInTheDocument();
    });

    it("ends the current session after a confirmed self-suspension", async () => {
        mocks.currentUserId = "usr_self";
        mocks.suspend.mockResolvedValue({ userId: "usr_self", suspended: true });
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_self" />, { wrapper });

        fireEvent.change(
            screen.getByLabelText(testI18n.t("adminUsers.security.suspension.reason")),
            { target: { value: "Policy breach" } },
        );
        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.suspend"),
            }),
        );

        await waitFor(() =>
            expect(mocks.suspend).toHaveBeenCalledWith({
                userId: "usr_self",
                reason: "Policy breach",
            }),
        );
        expect(mocks.signOut).toHaveBeenCalledTimes(1);
        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/$lng/login",
            params: { lng: "en" },
            search: { mode: "sign-in" },
            replace: true,
        });
    });

    it("treats self session revocation as a fresh-sign-in action, separate from Aura token revocation", async () => {
        mocks.currentUserId = "usr_self";
        mocks.sessions.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_self" />, { wrapper });

        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.revokeSessions"),
            }),
        );
        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.confirmSessionRevocation"),
            }),
        );

        await waitFor(() => expect(mocks.sessions).toHaveBeenCalledWith("usr_self"));
        expect(mocks.signOut).toHaveBeenCalledTimes(1);
        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/$lng/login",
            params: { lng: "en" },
            search: { mode: "sign-in" },
            replace: true,
        });
        expect(mocks.revokeToken).not.toHaveBeenCalled();
        expect(mocks.revokeAllTokens).not.toHaveBeenCalled();
    });

    it("revokes a single Aura token for the selected user without revoking Cognito sessions", async () => {
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.revokeToken"),
            }),
        );
        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.confirmTokenRevocation"),
            }),
        );

        await waitFor(() =>
            expect(mocks.revokeToken).toHaveBeenCalledWith({
                userId: "usr_target",
                accessTokenId: "at_selected",
            }),
        );
        expect(mocks.sessions).not.toHaveBeenCalled();
        expect(mocks.signOut).not.toHaveBeenCalled();
        expect(screen.queryByText(/raw-token|masked-token|token-hash/i)).not.toBeInTheDocument();
    });

    it("moves focus into a revocation confirmation and restores it to the trigger on cancel", async () => {
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });
        const triggerName = testI18n.t("adminUsers.security.actions.revokeToken");

        await user.click(screen.getByRole("button", { name: triggerName }));

        expect(
            screen.getByRole("group", {
                name: testI18n.t("adminUsers.security.tokens.confirmSingle", {
                    name: "Catalog integration",
                }),
            }),
        ).toHaveFocus();

        await user.click(
            screen.getByRole("button", { name: testI18n.t("adminUsers.actions.cancel") }),
        );

        expect(screen.getByRole("button", { name: triggerName })).toHaveFocus();
        expect(mocks.revokeToken).not.toHaveBeenCalled();
    });

    it("shows an agent's connection as read-only, without a revoke action", () => {
        mocks.tokenItems = [AGENT_CONNECTION];
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        expect(
            screen.getByRole("heading", {
                name: `${testI18n.t("adminUsers.security.tokens.groups.connectedApps")} · 1`,
            }),
        ).toBeInTheDocument();
        const app = screen.getByRole("heading", { name: "Claude Code" }).closest("li");
        if (!app) throw new Error("No connected app row");
        expect(
            within(app).getByText(testI18n.t("adminUsers.security.tokens.readOnly")),
        ).toBeInTheDocument();
        expect(app).toHaveTextContent(testI18n.t("adminUsers.security.tokens.readOnlyNote"));
        expect(app).toHaveTextContent("ocn_agent");
        expect(app).toHaveTextContent(
            testI18n.t("adminUsers.security.tokens.connectedAt", {
                date: formatDateTime(new Date("2026-11-01T09:00:00Z"), "de"),
            }),
        );
        expect(app).toHaveTextContent(
            testI18n.t("adminUsers.security.tokens.lastUsedAt", {
                date: formatDateTime(new Date("2026-11-06T12:00:00Z"), "de"),
            }),
        );
        expect(
            screen.queryByRole("button", {
                name: testI18n.t("adminUsers.security.actions.revokeToken"),
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("heading", {
                name: `${testI18n.t("adminUsers.security.tokens.groups.personal")} · 1`,
            }),
        ).not.toBeInTheDocument();
    });

    it("groups a registered client's tokens under the client and revokes them one by one", async () => {
        mocks.tokenItems = [SHOPIFY_TOKEN_1, CATALOG_INTEGRATION, SHOPIFY_TOKEN_2];
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        const app = screen.getByRole("heading", { name: "Shopify" }).closest("li");
        if (!app) throw new Error("No connected app row");
        expect(
            within(app).queryByText(testI18n.t("adminUsers.security.tokens.readOnly")),
        ).not.toBeInTheDocument();
        const tokens = within(app).getByRole("list", {
            name: testI18n.t("adminUsers.security.tokens.clientTokens", { name: "Shopify" }),
        });
        const tokenRows = within(tokens).getAllByRole("listitem");
        expect(tokenRows).toHaveLength(2);
        expect(tokenRows[0]).toHaveTextContent("at_shop_1");
        expect(tokenRows[0]).toHaveTextContent(testI18n.t("partnerAccessTokens.noExpiration"));
        expect(tokenRows[1]).toHaveTextContent("at_shop_2");
        expect(tokenRows[1]).toHaveTextContent(
            testI18n.t("adminUsers.security.tokens.expires", {
                expires: formatDateTime(new Date("2027-01-01T00:00:00Z"), "de"),
            }),
        );
        // Two client tokens and one personal token, each revocable on its own.
        expect(
            screen.getAllByRole("button", {
                name: testI18n.t("adminUsers.security.actions.revokeToken"),
            }),
        ).toHaveLength(3);

        await user.click(
            within(tokenRows[1]).getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.revokeToken"),
            }),
        );
        const confirmation = screen.getByRole("group", {
            name: testI18n.t("adminUsers.security.tokens.confirmClientToken", { name: "Shopify" }),
        });
        await user.click(
            within(confirmation).getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.confirmTokenRevocation"),
            }),
        );

        await waitFor(() =>
            expect(mocks.revokeToken).toHaveBeenCalledWith({
                userId: "usr_target",
                accessTokenId: "at_shop_2",
            }),
        );
        expect(mocks.revokeToken).toHaveBeenCalledOnce();
        expect(mocks.revokeAllTokens).not.toHaveBeenCalled();
    });

    it("shows translated origins and never the raw origin value", () => {
        mocks.tokenItems = [
            AGENT_CONNECTION,
            SHOPIFY_TOKEN_1,
            CATALOG_INTEGRATION,
            {
                ...CATALOG_INTEGRATION,
                accessTokenId: "at_legacy",
                name: "Legacy token",
                origin: "LegacyOrigin",
            },
        ];
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        const originText = (key: string) =>
            testI18n.t("adminUsers.security.tokens.origin", {
                origin: testI18n.t(`adminUsers.security.tokens.origins.${key}`),
            });
        expect(screen.getByText(originText("OAuthMetadataDocument"))).toBeInTheDocument();
        expect(screen.getByText(originText("OAuth"))).toBeInTheDocument();
        expect(screen.getAllByText(originText("User"))).toHaveLength(1);
        expect(screen.getByText(originText("unknown"))).toBeInTheDocument();
        expect(screen.queryByText(/OAuthMetadataDocument|LegacyOrigin/)).not.toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: `${testI18n.t("adminUsers.security.tokens.groups.connectedApps")} · 2`,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: `${testI18n.t("adminUsers.security.tokens.groups.personal")} · 2`,
            }),
        ).toBeInTheDocument();
    });

    it("warns that revoking all also ends every connected app", async () => {
        mocks.tokenItems = [AGENT_CONNECTION, CATALOG_INTEGRATION];
        mocks.revokeAllTokens.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.revokeAllTokens"),
            }),
        );

        const confirmation = screen.getByRole("group", {
            name: "Alle Zugriffstoken dieses Benutzers widerrufen und alle verbundenen Apps trennen? Noch nicht genutzte Freigaben werden ebenfalls zurückgezogen.",
        });
        expect(confirmation).toHaveFocus();
        await user.click(
            within(confirmation).getByRole("button", {
                name: testI18n.t("adminUsers.security.actions.confirmAllTokenRevocation"),
            }),
        );

        await waitFor(() => expect(mocks.revokeAllTokens).toHaveBeenCalledWith("usr_target"));
        expect(mocks.revokeToken).not.toHaveBeenCalled();
    });
});
