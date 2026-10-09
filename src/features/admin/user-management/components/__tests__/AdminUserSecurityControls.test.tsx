import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminUserSecurityControls } from "../AdminUserSecurityControls.tsx";

const mocks = vi.hoisted(() => ({
    suspend: vi.fn(),
    unsuspend: vi.fn(),
    sessions: vi.fn(),
    revokeToken: vi.fn(),
    revokeAllTokens: vi.fn(),
    signOut: vi.fn(),
    navigate: vi.fn(),
    currentUserId: "usr_target",
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
        data: {
            pages: [
                {
                    items: [
                        {
                            accessTokenId: "at_selected",
                            name: "Catalog integration",
                            scopes: ["users:read"],
                            origin: "User",
                            expires: null,
                        },
                    ],
                },
            ],
        },
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
});
