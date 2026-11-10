import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CredentialListEntryData } from "@/data/internal/access-tokens/OwnCredentials.ts";
import testI18n from "@/i18n/i18nForTests";
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
        dataUpdatedAt: 1,
        hasNextPage: false,
        isFetchingNextPage: false,
        isFetchNextPageError: false,
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

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);
const formatDate = (value: string) =>
    new Intl.DateTimeFormat("de", { dateStyle: "medium" }).format(new Date(value));

describe("AdminUserSecurityControls", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.currentUserId = "usr_admin";
        mocks.tokenItems = [CATALOG_INTEGRATION];
        mocks.suspend.mockResolvedValue({ userId: "usr_target", suspended: true });
        mocks.unsuspend.mockResolvedValue({ userId: "usr_target", suspended: false });
        mocks.sessions.mockResolvedValue(undefined);
        mocks.revokeToken.mockResolvedValue(undefined);
        mocks.revokeAllTokens.mockResolvedValue(undefined);
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    const suspendButton = () =>
        screen.getByRole("button", { name: t("adminUsers.security.actions.suspend") });

    it("validates the reason, then confirms inline before sending a suspension", async () => {
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });
        const reason = screen.getByLabelText(t("adminUsers.security.suspension.reason"));

        await user.click(suspendButton());
        expect(
            await screen.findByText(t("adminUsers.security.suspension.reasonRequired")),
        ).toBeInTheDocument();
        expect(mocks.suspend).not.toHaveBeenCalled();

        fireEvent.change(reason, { target: { value: "é".repeat(501) } });
        await user.click(suspendButton());
        expect(
            await screen.findByText(t("adminUsers.security.suspension.reasonTooLong")),
        ).toBeInTheDocument();
        expect(screen.getByText(/1\.002 \/ 1\.000/)).toBeInTheDocument();
        expect(mocks.suspend).not.toHaveBeenCalled();

        fireEvent.change(reason, { target: { value: "é".repeat(500) } });
        await user.click(suspendButton());
        const confirmation = screen.getByRole("group", {
            name: t("adminUsers.security.suspension.confirmQuestion"),
        });
        expect(
            within(confirmation).getByRole("button", { name: t("adminCommon.cancel") }),
        ).toHaveFocus();
        expect(mocks.suspend).not.toHaveBeenCalled();

        await user.click(
            within(confirmation).getByRole("button", {
                name: t("adminUsers.security.actions.suspend"),
            }),
        );
        await waitFor(() =>
            expect(mocks.suspend).toHaveBeenCalledWith({
                userId: "usr_target",
                reason: "é".repeat(500),
            }),
        );
        expect(reason).toHaveValue("");
        expect(
            await screen.findByText(t("adminUsers.security.suspension.status.suspended")),
        ).toBeInTheDocument();
        expect(mocks.signOut).not.toHaveBeenCalled();
    });

    it("does not claim a suspension state until a response confirms one", async () => {
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        expect(
            screen.getByText(t("adminUsers.security.suspension.status.unknown")),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(t("adminUsers.security.suspension.status.active")),
        ).not.toBeInTheDocument();

        // Reactivation does not ask first.
        await user.click(
            screen.getByRole("button", { name: t("adminUsers.security.actions.unsuspend") }),
        );
        await waitFor(() => expect(mocks.unsuspend).toHaveBeenCalledWith("usr_target"));
        expect(
            await screen.findByText(t("adminUsers.security.suspension.status.active")),
        ).toBeInTheDocument();
    });

    it("ends the current session after a confirmed self-suspension", async () => {
        mocks.currentUserId = "usr_self";
        mocks.suspend.mockResolvedValue({ userId: "usr_self", suspended: true });
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_self" />, { wrapper });

        fireEvent.change(screen.getByLabelText(t("adminUsers.security.suspension.reason")), {
            target: { value: "  Policy breach  " },
        });
        await user.click(suspendButton());
        await user.click(
            within(
                screen.getByRole("group", {
                    name: t("adminUsers.security.suspension.confirmQuestion"),
                }),
            ).getByRole("button", { name: t("adminUsers.security.actions.suspend") }),
        );

        await waitFor(() =>
            expect(mocks.suspend).toHaveBeenCalledWith({
                userId: "usr_self",
                reason: "Policy breach",
            }),
        );
        await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/$lng/login",
            params: { lng: "en" },
            search: { mode: "sign-in" },
            replace: true,
        });
    });

    it("treats self session revocation as a fresh-sign-in action, separate from token revocation", async () => {
        mocks.currentUserId = "usr_self";
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_self" />, { wrapper });

        expect(
            screen.getByRole("heading", { name: t("adminUsers.security.sessions.heading") }),
        ).toBeInTheDocument();
        await user.click(
            screen.getByRole("button", {
                name: t("adminUsers.security.actions.confirmSessionRevocation"),
            }),
        );
        const confirmation = screen.getByRole("group", {
            name: t("adminUsers.security.sessions.confirmQuestion"),
        });
        await user.click(
            within(confirmation).getByRole("button", {
                name: t("adminUsers.security.actions.confirmSessionRevocation"),
            }),
        );

        await waitFor(() => expect(mocks.sessions).toHaveBeenCalledWith("usr_self"));
        await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/$lng/login",
            params: { lng: "en" },
            search: { mode: "sign-in" },
            replace: true,
        });
        expect(mocks.revokeToken).not.toHaveBeenCalled();
        expect(mocks.revokeAllTokens).not.toHaveBeenCalled();
    });

    it("shows a failed action in its own block", async () => {
        mocks.sessions.mockRejectedValue(new Error("Request failed"));
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        await user.click(
            screen.getByRole("button", {
                name: t("adminUsers.security.actions.confirmSessionRevocation"),
            }),
        );
        await user.click(
            within(
                screen.getByRole("group", {
                    name: t("adminUsers.security.sessions.confirmQuestion"),
                }),
            ).getByRole("button", {
                name: t("adminUsers.security.actions.confirmSessionRevocation"),
            }),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent("Request failed");
        expect(mocks.signOut).not.toHaveBeenCalled();
    });

    it("revokes a single token for the selected user without revoking sign-in sessions", async () => {
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        await user.click(
            screen.getByRole("button", { name: t("adminUsers.security.actions.revokeToken") }),
        );
        await user.click(
            screen.getByRole("button", {
                name: t("adminUsers.security.actions.confirmTokenRevocation"),
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
        const triggerName = t("adminUsers.security.actions.revokeToken");

        await user.click(screen.getByRole("button", { name: triggerName }));

        const confirmation = screen.getByRole("group", {
            name: t("adminUsers.security.tokens.confirmSingle", { name: "Catalog integration" }),
        });
        expect(
            within(confirmation).getByRole("button", { name: t("adminCommon.cancel") }),
        ).toHaveFocus();
        expect(screen.queryByRole("button", { name: triggerName })).not.toBeInTheDocument();

        await user.click(
            within(confirmation).getByRole("button", { name: t("adminCommon.cancel") }),
        );

        expect(screen.getByRole("button", { name: triggerName })).toHaveFocus();
        expect(mocks.revokeToken).not.toHaveBeenCalled();
    });

    it("shows an agent's connection as read-only, without a revoke action", () => {
        mocks.tokenItems = [AGENT_CONNECTION];
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        expect(
            screen.getByRole("heading", {
                name: `${t("adminUsers.security.tokens.groups.connectedApps")} · 1`,
            }),
        ).toBeInTheDocument();
        const app = screen.getByText("Claude Code").closest("li");
        if (!app) throw new Error("No connected app row");
        expect(within(app).getByText(t("adminUsers.security.tokens.readOnly"))).toBeInTheDocument();
        expect(app).toHaveTextContent(t("adminUsers.security.tokens.connectionNote"));
        expect(app).toHaveTextContent("claude.ai");
        expect(app).toHaveTextContent(
            t("adminUsers.security.tokens.connectedAt", {
                date: formatDate("2026-11-01T09:00:00Z"),
            }),
        );
        expect(app).toHaveTextContent(
            t("adminUsers.security.tokens.lastUsedAt", {
                date: formatDate("2026-11-06T12:00:00Z"),
            }),
        );
        expect(
            screen.queryByRole("button", { name: t("adminUsers.security.actions.revokeToken") }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("heading", {
                name: `${t("adminUsers.security.tokens.groups.personal")} · 1`,
            }),
        ).not.toBeInTheDocument();
    });

    it("groups a registered client's tokens under the client and revokes them one by one", async () => {
        mocks.tokenItems = [SHOPIFY_TOKEN_1, CATALOG_INTEGRATION, SHOPIFY_TOKEN_2];
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        const tokens = screen.getByRole("list", {
            name: t("adminUsers.security.tokens.clientTokens", { name: "Shopify" }),
        });
        const app = tokens.closest("li");
        if (!app) throw new Error("No connected app row");
        expect(
            within(app).queryByText(t("adminUsers.security.tokens.readOnly")),
        ).not.toBeInTheDocument();
        expect(app).toHaveTextContent(t("adminUsers.security.tokens.tokenCount", { count: 2 }));
        const tokenRows = within(tokens).getAllByRole("listitem");
        expect(tokenRows).toHaveLength(2);
        expect(tokenRows[0]).toHaveTextContent("at_shop_1");
        expect(tokenRows[0]).toHaveTextContent(t("partnerAccessTokens.noExpiration"));
        expect(tokenRows[1]).toHaveTextContent("at_shop_2");
        expect(tokenRows[1]).toHaveTextContent(
            t("adminUsers.security.tokens.expiresOn", { date: formatDate("2027-01-01T00:00:00Z") }),
        );
        // Two client tokens and one personal token, each revocable on its own.
        expect(
            screen.getAllByRole("button", { name: t("adminUsers.security.actions.revokeToken") }),
        ).toHaveLength(3);

        await user.click(
            within(tokenRows[1] as HTMLElement).getByRole("button", {
                name: t("adminUsers.security.actions.revokeToken"),
            }),
        );
        const confirmation = screen.getByRole("group", {
            name: t("adminUsers.security.tokens.confirmClientToken", { name: "Shopify" }),
        });
        await user.click(
            within(confirmation).getByRole("button", {
                name: t("adminUsers.security.actions.confirmTokenRevocation"),
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

        const origin = (key: string) => t(`adminUsers.security.tokens.origins.${key}`);
        expect(document.body).toHaveTextContent(origin("OAuthMetadataDocument"));
        expect(document.body).toHaveTextContent(origin("OAuth"));
        expect(document.body).toHaveTextContent(origin("unknown"));
        // A personal token's own origin is implied by its group.
        expect(document.body).not.toHaveTextContent(origin("User"));
        expect(screen.queryByText(/OAuthMetadataDocument|LegacyOrigin/)).not.toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: `${t("adminUsers.security.tokens.groups.connectedApps")} · 2`,
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: `${t("adminUsers.security.tokens.groups.personal")} · 2`,
            }),
        ).toBeInTheDocument();
    });

    it("confirms that revoking all also ends every connected app", async () => {
        mocks.tokenItems = [AGENT_CONNECTION, CATALOG_INTEGRATION];
        const user = userEvent.setup();
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        await user.click(
            screen.getByRole("button", { name: t("adminUsers.security.actions.revokeAllTokens") }),
        );

        const confirmation = screen.getByRole("group", {
            name: t("adminUsers.security.tokens.confirmAllQuestion"),
        });
        expect(
            within(confirmation).getByRole("button", { name: t("adminCommon.cancel") }),
        ).toHaveFocus();
        await user.click(
            within(confirmation).getByRole("button", {
                name: t("adminUsers.security.actions.confirmAllTokenRevocation"),
            }),
        );

        await waitFor(() => expect(mocks.revokeAllTokens).toHaveBeenCalledWith("usr_target"));
        expect(mocks.revokeToken).not.toHaveBeenCalled();
    });

    it("says when there is nothing to revoke", () => {
        mocks.tokenItems = [];
        render(<AdminUserSecurityControls userId="usr_target" />, { wrapper });

        expect(screen.getByText(t("adminUsers.security.tokens.none"))).toBeInTheDocument();
    });
});
