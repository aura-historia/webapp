import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUserDetailDialog } from "../AdminUserDetailDialog.tsx";

const mockUseAdminUser = vi.hoisted(() => vi.fn());
const mockDeleteMutate = vi.hoisted(() => vi.fn());
const mockPatchMutate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
}));

vi.mock("@/hooks/admin/useAdminUsers.ts", () => ({
    useAdminUser: mockUseAdminUser,
    useDeleteAdminUser: () => ({
        mutate: mockDeleteMutate,
        isPending: false,
    }),
    usePatchAdminUser: () => ({
        mutate: mockPatchMutate,
        isPending: false,
    }),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

describe("AdminUserDetailDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAdminUser.mockReturnValue({
            data: {
                userId: "user-1",
                email: "ada@example.com",
                firstName: "Ada",
                lastName: "Lovelace",
                language: "en",
                currency: "EUR",
                prohibitedContentConsent: true,
                tier: "PRO",
                role: "ADMIN",
                stripeCustomerId: "cus_123",
                created: new Date("2024-01-01T00:00:00Z"),
                updated: new Date("2024-01-02T00:00:00Z"),
            },
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it("opens a confirmation dialog before deleting a user", async () => {
        const user = userEvent.setup();

        render(<AdminUserDetailDialog userId="user-1" open onOpenChange={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: "Benutzer löschen" }));

        expect(
            screen.getByText(
                "Benutzer ada@example.com löschen? Dies kann nicht rückgängig gemacht werden.",
            ),
        ).toBeInTheDocument();
        expect(mockDeleteMutate).not.toHaveBeenCalled();

        const dialogs = screen.getAllByRole("dialog");
        const confirmDialog = dialogs[dialogs.length - 1];

        await user.click(within(confirmDialog).getByRole("button", { name: "Benutzer löschen" }));

        expect(mockDeleteMutate).toHaveBeenCalledWith(
            "user-1",
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
    });
});
