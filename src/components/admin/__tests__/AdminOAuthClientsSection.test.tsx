import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminOAuthClientsSection } from "../AdminOAuthClientsSection.tsx";
import type { OAuthClient } from "@/data/internal/oauth/OAuthClient.ts";

const mockUseAdminOAuthClients = vi.hoisted(() => vi.fn());
const mockDeleteMutate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminOAuthClients.ts", () => ({
    useAdminOAuthClients: mockUseAdminOAuthClients,
}));

vi.mock("@/hooks/admin/useAdminOAuthClientActions.ts", () => ({
    useDeleteOAuthClient: () => ({
        mutate: mockDeleteMutate,
        isPending: false,
    }),
}));

vi.mock("../AdminOAuthClientCreateDialog.tsx", () => ({
    AdminOAuthClientCreateDialog: ({ open }: { open: boolean }) =>
        open ? <div>create-dialog</div> : null,
}));

vi.mock("../AdminOAuthClientEditDialog.tsx", () => ({
    AdminOAuthClientEditDialog: ({
        client,
        open,
    }: {
        client: OAuthClient | null;
        open: boolean;
    }) => (open ? <div>edit-dialog:{client?.clientId}</div> : null),
}));

const oauthClient: OAuthClient = {
    clientId: "client-123",
    clientSecret: "secret-123",
    clientName: "Beispiel Client",
    redirectUris: ["https://example.com/callback", "https://example.com/return"],
    scope: ["shops:manage", "products:write"],
    createdAt: new Date("2024-01-01T00:00:00Z"),
};

describe("AdminOAuthClientsSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAdminOAuthClients.mockReturnValue({
            data: [oauthClient],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it("shows a loading state", () => {
        mockUseAdminOAuthClients.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
            refetch: vi.fn(),
        });

        render(<AdminOAuthClientsSection />);

        expect(screen.getAllByRole("status")).not.toHaveLength(0);
    });

    it("shows an error state", () => {
        mockUseAdminOAuthClients.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
            refetch: vi.fn(),
        });

        render(<AdminOAuthClientsSection />);

        expect(screen.getByText("OAuth-Clients konnten nicht geladen werden.")).toBeInTheDocument();
    });

    it("lists oauth clients", () => {
        render(<AdminOAuthClientsSection />);

        expect(screen.getByText("Beispiel Client")).toBeInTheDocument();
        expect(screen.getByText("client-123")).toBeInTheDocument();
        expect(screen.getByText("https://example.com/callback")).toBeInTheDocument();
        expect(screen.getAllByText("shops:manage")).toHaveLength(2);
    });

    it("opens the edit dialog for the selected client", async () => {
        const user = userEvent.setup();

        render(<AdminOAuthClientsSection />);

        await user.click(screen.getByRole("button", { name: /Beispiel Client bearbeiten/i }));

        expect(screen.getByText("edit-dialog:client-123")).toBeInTheDocument();
    });

    it("submits a delete action for confirmed deletions", async () => {
        const user = userEvent.setup();
        vi.spyOn(window, "confirm").mockReturnValue(true);

        render(<AdminOAuthClientsSection />);

        await user.click(screen.getByRole("button", { name: /Beispiel Client löschen/i }));

        expect(mockDeleteMutate).toHaveBeenCalledWith(
            "client-123",
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });
});
