import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    scopes: ["access-tokens:read"] as const,
    clientIdIssuedAt: 1_759_000_000,
};

const listState = (overrides: Record<string, unknown> = {}) => ({
    data: { pages: [{ items: [oauthClient], size: 1, total: 1 }] },
    isPending: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
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

const openDetails = () =>
    fireEvent.click(
        screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.details") }),
    );

describe("AdminOAuthClientsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.deletion.error = null;
        api.deletion.isPending = false;
        api.useAdminOAuthClients.mockReturnValue(listState());
        api.useAdminOAuthClient.mockReturnValue(detailState());
    });

    it("renders client rows with a singular total", () => {
        render(<AdminOAuthClientsPage />);

        expect(screen.getByText("Cabinet integration")).toBeTruthy();
        expect(screen.getByText("oc_test123")).toBeTruthy();
        expect(
            screen.getByText(testI18n.t("adminOAuthClients.list.total", { count: 1 })),
        ).toBeTruthy();
        expect(testI18n.t("adminOAuthClients.list.total", { count: 1 })).not.toBe(
            testI18n.t("adminOAuthClients.list.total", { count: 2 }),
        );
    });

    it("shows loading, empty, and retryable error states", () => {
        const refetch = vi.fn();
        api.useAdminOAuthClients.mockReturnValue(listState({ data: undefined, isPending: true }));
        const { rerender } = render(<AdminOAuthClientsPage />);
        expect(screen.getByText(testI18n.t("adminOAuthClients.loading"))).toBeTruthy();

        api.useAdminOAuthClients.mockReturnValue(listState({ data: { pages: [] } }));
        rerender(<AdminOAuthClientsPage />);
        expect(screen.getByText(testI18n.t("adminOAuthClients.empty"))).toBeTruthy();

        api.useAdminOAuthClients.mockReturnValue(
            listState({ data: undefined, error: new Error("List failed"), refetch }),
        );
        rerender(<AdminOAuthClientsPage />);
        expect(screen.getByText("List failed")).toBeTruthy();
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.retry") }),
        );
        expect(refetch).toHaveBeenCalled();
    });

    it("loads further pages and keeps loaded rows on a follow-up error", () => {
        const fetchNextPage = vi.fn();
        api.useAdminOAuthClients.mockReturnValue(
            listState({ hasNextPage: true, fetchNextPage, error: new Error("Page failed") }),
        );
        render(<AdminOAuthClientsPage />);

        expect(screen.getByText("Cabinet integration")).toBeTruthy();
        expect(screen.getByText("Page failed")).toBeTruthy();
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.list.loadMore") }),
        );
        expect(fetchNextPage).toHaveBeenCalled();
    });

    it("applies trimmed filters and resets them", async () => {
        render(<AdminOAuthClientsPage />);

        fireEvent.change(screen.getByLabelText(testI18n.t("adminOAuthClients.filters.name")), {
            target: { value: "  Cabinet  " },
        });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.filters.apply") }),
        );

        await waitFor(() =>
            expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({ name: "Cabinet" }),
        );

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.filters.reset") }),
        );
        await waitFor(() => expect(api.useAdminOAuthClients).toHaveBeenLastCalledWith({}));
    });

    it("opens the create form", () => {
        render(<AdminOAuthClientsPage />);

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.create") }),
        );

        expect(screen.getByText("form:create")).toBeTruthy();
    });

    it("shows detail loading and retryable error states", () => {
        const refetch = vi.fn();
        api.useAdminOAuthClient.mockReturnValue(detailState({ isPending: true }));
        const { rerender } = render(<AdminOAuthClientsPage />);
        openDetails();
        expect(screen.getByText(testI18n.t("adminOAuthClients.loadingDetail"))).toBeTruthy();

        api.useAdminOAuthClient.mockReturnValue(
            detailState({ error: new Error("Detail failed"), refetch }),
        );
        rerender(<AdminOAuthClientsPage />);
        expect(screen.getByText("Detail failed")).toBeTruthy();
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.retry") }),
        );
        expect(refetch).toHaveBeenCalled();
    });

    it("shows details and hands the latest client to the edit form", () => {
        api.useAdminOAuthClient.mockReturnValue(detailState({ data: oauthClient }));
        render(<AdminOAuthClientsPage />);
        openDetails();

        expect(screen.getByText("https://cabinet.example/oauth/callback")).toBeTruthy();
        expect(screen.getByText("https://cabinet.example/terms")).toBeTruthy();

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.edit") }),
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
        render(<AdminOAuthClientsPage />);
        openDetails();

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.actions.delete") }),
        );
        fireEvent.click(
            await screen.findByRole("button", {
                name: testI18n.t("adminOAuthClients.delete.confirm"),
            }),
        );

        await waitFor(() => expect(api.deleteMutateAsync).toHaveBeenCalledWith("oc_test123"));
        await waitFor(() =>
            expect(
                screen.queryByRole("heading", {
                    name: testI18n.t("adminOAuthClients.detail.title"),
                }),
            ).toBeNull(),
        );
    });

    it("resets a failed deletion when the detail dialog closes", async () => {
        api.useAdminOAuthClient.mockReturnValue(detailState({ data: oauthClient }));
        api.deletion.error = new Error("Delete failed");
        render(<AdminOAuthClientsPage />);
        openDetails();

        expect(screen.getByText("Delete failed")).toBeTruthy();
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

        await waitFor(() => expect(api.deleteReset).toHaveBeenCalled());
    });
});
