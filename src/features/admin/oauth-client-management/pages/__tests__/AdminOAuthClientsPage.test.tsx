import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type { AdminOAuthClientFilters } from "@/data/internal/admin/AdminOAuthClient.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminOAuthClientsPage } from "../AdminOAuthClientsPage.tsx";

const api = vi.hoisted(() => ({
    useAdminOAuthClients: vi.fn(),
    useAdminOAuthClient: vi.fn(),
    deleteMutateAsync: vi.fn(),
    deleteReset: vi.fn(),
    deletion: { error: null as Error | null, isPending: false },
    formDialog: vi.fn(),
}));
vi.mock("../../api/useAdminOAuthClients.ts", () => ({
    useAdminOAuthClients: api.useAdminOAuthClients,
    useAdminOAuthClient: api.useAdminOAuthClient,
    useDeleteAdminOAuthClient: () => ({
        mutateAsync: api.deleteMutateAsync,
        reset: api.deleteReset,
        ...api.deletion,
    }),
}));
vi.mock("../../components/AdminOAuthClientFormDialog.tsx", () => ({
    AdminOAuthClientFormDialog: (props: { mode: string; open: boolean }) => {
        api.formDialog(props);
        return props.open ? <p>form:{props.mode}</p> : null;
    },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const oauthClient = {
    clientId: "oc_test123",
    clientName: "Cabinet integration",
    tosUri: "https://cabinet.example/terms",
    policyUri: "https://cabinet.example/privacy",
    clientUri: "https://cabinet.example",
    logoUri: "https://cabinet.example/logo.svg",
    redirectUris: ["https://cabinet.example/oauth/callback"],
    scopes: ["access-tokens:read", "notifications:read", "watchlist:read"] as const,
    clientIdIssuedAt: 1_759_000_000,
};

const listState = (overrides: Record<string, unknown> = {}) => ({
    data: { pages: [{ items: [oauthClient], size: 1, total: 1 }] },
    isPending: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
});

const detailState = (overrides: Record<string, unknown> = {}) => ({
    data: undefined,
    isPending: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
});

const t = testI18n.t.bind(testI18n);

function Harness({ initial = {} }: { readonly initial?: AdminOAuthClientFilters }) {
    const [filters, setFilters] = useState<AdminOAuthClientFilters>(initial);
    return <AdminOAuthClientsPage filters={filters} onFiltersChange={setFilters} />;
}

const openDetails = () =>
    fireEvent.click(screen.getByRole("button", { name: /Cabinet integration/ }));

describe("AdminOAuthClientsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.deletion.error = null;
        api.deletion.isPending = false;
        api.useAdminOAuthClients.mockReturnValue(listState());
        api.useAdminOAuthClient.mockReturnValue(detailState());
    });

    it("lists clients with their ID, at most two scopes and the result line", () => {
        render(<Harness />);

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminOAuthClients.heading") }),
        ).toBeInTheDocument();
        const row = screen.getByRole("button", { name: /Cabinet integration/ });
        expect(within(row).getByText("oc_test123")).toBeTruthy();
        expect(
            within(row).getByText(t(ACCESS_TOKEN_SCOPE_METADATA["access-tokens:read"].label)),
        ).toBeTruthy();
        expect(within(row).getByText("+1")).toBeTruthy();
        expect(
            screen.getByText(t("adminCommon.result.loadedOfTotal", { loaded: "1", total: "1" })),
        ).toBeTruthy();
    });

    it("labels a client without scopes", () => {
        api.useAdminOAuthClients.mockReturnValue(
            listState({
                data: { pages: [{ items: [{ ...oauthClient, scopes: [] }], size: 1 }] },
            }),
        );
        render(<Harness />);

        expect(screen.getByText(t("adminOAuthClients.list.noScopes"))).toBeTruthy();
        expect(screen.getByText(t("adminCommon.result.loaded", { loaded: "1" }))).toBeTruthy();
    });

    it("shows loading, empty, no-match and retryable error states", () => {
        const refetch = vi.fn();
        api.useAdminOAuthClients.mockReturnValue(listState({ data: undefined, isPending: true }));
        const { unmount } = render(<Harness />);
        expect(screen.getByRole("status", { name: t("adminOAuthClients.loading") })).toBeTruthy();
        unmount();

        api.useAdminOAuthClients.mockReturnValue(listState({ data: { pages: [] } }));
        const empty = render(<Harness />);
        expect(
            screen.getByRole("heading", { name: t("adminOAuthClients.states.empty") }),
        ).toBeInTheDocument();
        fireEvent.click(
            within(screen.getByRole("status")).getByRole("button", {
                name: t("adminOAuthClients.actions.create"),
            }),
        );
        expect(screen.getByText("form:create")).toBeTruthy();
        empty.unmount();

        const noMatches = render(<Harness initial={{ name: "Nothing" }} />);
        expect(
            screen.getByRole("heading", { name: t("adminOAuthClients.states.noMatches") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }));
        expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({});
        noMatches.unmount();

        api.useAdminOAuthClients.mockReturnValue(
            listState({ data: undefined, error: new Error("List failed"), refetch }),
        );
        render(<Harness />);
        expect(
            screen.getByRole("heading", { name: t("adminOAuthClients.states.error") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("loads further pages and keeps loaded rows on a follow-up error", () => {
        const fetchNextPage = vi.fn();
        api.useAdminOAuthClients.mockReturnValue(listState({ hasNextPage: true, fetchNextPage }));
        const { rerender } = render(<Harness />);
        fireEvent.click(
            screen.getByRole("button", { name: t("adminOAuthClients.list.loadMoreClients") }),
        );
        expect(fetchNextPage).toHaveBeenCalledTimes(1);

        api.useAdminOAuthClients.mockReturnValue(
            listState({
                hasNextPage: true,
                fetchNextPage,
                error: new Error("Page failed"),
                isFetchNextPageError: true,
            }),
        );
        rerender(<Harness />);
        expect(screen.getByRole("button", { name: /Cabinet integration/ })).toBeTruthy();
        expect(screen.getByText(t("adminCommon.loadMoreFailed"))).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(fetchNextPage).toHaveBeenCalledTimes(2);
    });

    it("searches by name on Enter, filters by client ID in the panel and removes chips", async () => {
        render(<Harness />);

        const search = screen.getByRole("searchbox", { name: t("adminOAuthClients.filters.name") });
        fireEvent.change(search, { target: { value: "  Cabinet  " } });
        fireEvent.submit(search);
        await waitFor(() =>
            expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({ name: "Cabinet" }),
        );

        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        fireEvent.change(screen.getByLabelText(t("adminOAuthClients.fields.clientId")), {
            target: { value: " oc_test123 " },
        });
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        await waitFor(() =>
            expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({
                name: "Cabinet",
                clientId: "oc_test123",
            }),
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", {
                    filter: `${t("adminOAuthClients.filters.name")}: Cabinet`,
                }),
            }),
        );
        await waitFor(() =>
            expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({ clientId: "oc_test123" }),
        );
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearAll") }));
        await waitFor(() => expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({}));
    });

    it("shows detail loading and retryable error states", () => {
        const refetch = vi.fn();
        api.useAdminOAuthClient.mockReturnValue(detailState({ isPending: true }));
        const { rerender } = render(<Harness />);
        openDetails();
        expect(screen.getByRole("status", { name: "" }).textContent).toContain(
            t("adminOAuthClients.loadingDetail"),
        );

        api.useAdminOAuthClient.mockReturnValue(
            detailState({ error: new Error("Detail failed"), refetch }),
        );
        rerender(<Harness />);
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("Detail failed")).toBeTruthy();
        fireEvent.click(within(dialog).getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("shows details and hands the latest client to the edit form", () => {
        api.useAdminOAuthClient.mockReturnValue(detailState({ data: oauthClient }));
        render(<Harness />);
        openDetails();

        const dialog = screen.getByRole("dialog", { name: "Cabinet integration" });
        expect(within(dialog).getByText(t("adminOAuthClients.detail.title"))).toBeTruthy();
        expect(within(dialog).getByText("https://cabinet.example/oauth/callback")).toBeTruthy();
        expect(within(dialog).getByText("https://cabinet.example/terms")).toBeTruthy();
        expect(
            within(dialog).getByText(t(ACCESS_TOKEN_SCOPE_METADATA["watchlist:read"].label)),
        ).toBeTruthy();

        fireEvent.click(
            within(dialog).getByRole("button", { name: t("adminOAuthClients.actions.edit") }),
        );

        expect(api.deleteReset).toHaveBeenCalled();
        expect(screen.getByText("form:edit")).toBeTruthy();
        expect(api.formDialog).toHaveBeenLastCalledWith(
            expect.objectContaining({ mode: "edit", client: oauthClient, open: true }),
        );
    });

    it("deletes a client after confirmation", async () => {
        api.useAdminOAuthClient.mockReturnValue(detailState({ data: oauthClient }));
        api.deleteMutateAsync.mockResolvedValue("oc_test123");
        render(<Harness />);
        openDetails();

        fireEvent.click(
            screen.getByRole("button", { name: t("adminOAuthClients.actions.delete") }),
        );
        const confirm = await screen.findByRole("alertdialog", {
            name: t("adminOAuthClients.delete.titleNamed", { name: "Cabinet integration" }),
        });
        expect(within(confirm).getByText(t("adminOAuthClients.delete.consequence"))).toBeTruthy();
        fireEvent.click(
            within(confirm).getByRole("button", { name: t("adminOAuthClients.actions.delete") }),
        );

        await waitFor(() => expect(api.deleteMutateAsync).toHaveBeenCalledWith("oc_test123"));
        await waitFor(() =>
            expect(screen.queryByRole("dialog", { name: "Cabinet integration" })).toBeNull(),
        );
    });

    it("resets a failed deletion when the detail dialog closes", async () => {
        api.useAdminOAuthClient.mockReturnValue(detailState({ data: oauthClient }));
        api.deletion.error = new Error("Delete failed");
        render(<Harness />);
        openDetails();

        expect(screen.getByText("Delete failed")).toBeTruthy();
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

        await waitFor(() => expect(api.deleteReset).toHaveBeenCalled());
    });
});
