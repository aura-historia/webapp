import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUsersSection } from "../AdminUsersSection.tsx";

const mockUseAdminUsers = vi.hoisted(() => vi.fn());
const mockUseInView = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminUsers.ts", () => ({
    useAdminUsers: mockUseAdminUsers,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: mockUseInView,
}));

vi.mock("../AdminUserDetailDialog.tsx", () => ({
    AdminUserDetailDialog: ({ userId, open }: { userId?: string; open: boolean }) =>
        open ? <div>user-dialog:{userId}</div> : null,
}));

describe("AdminUsersSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseInView.mockReturnValue({ ref: vi.fn(), inView: false });
        mockUseAdminUsers.mockReturnValue({
            data: {
                pages: [
                    {
                        items: [
                            {
                                userId: "user-1",
                                email: "ada@example.com",
                                firstName: "Ada",
                                lastName: "Lovelace",
                                prohibitedContentConsent: true,
                                tier: "PRO",
                                role: "ADMIN",
                                stripeCustomerId: "cus_123",
                                created: new Date("2024-01-01T00:00:00Z"),
                                updated: new Date("2024-01-02T00:00:00Z"),
                            },
                        ],
                        total: 1,
                        searchAfter: undefined,
                    },
                ],
            },
            isPending: false,
            isError: false,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            refetch: vi.fn(),
        });
    });

    it("renders users and opens the detail dialog for the selected user", async () => {
        const user = userEvent.setup();
        const onSelectedUserIdChange = vi.fn();

        render(
            <AdminUsersSection
                selectedUserId={undefined}
                onSelectedUserIdChange={onSelectedUserIdChange}
            />,
        );

        expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
        expect(screen.getByText("ada@example.com")).toBeInTheDocument();
        expect(screen.getByText("§ 86a Zustimmung")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Ada Lovelace/i }));

        expect(onSelectedUserIdChange).toHaveBeenCalledWith("user-1");
    });

    it("passes updated search filters to the hook after submitting the search form", async () => {
        const user = userEvent.setup();

        render(<AdminUsersSection selectedUserId={"user-1"} onSelectedUserIdChange={vi.fn()} />);

        await user.type(screen.getByLabelText("Alle Benutzerfelder durchsuchen…"), "stripe");
        await user.type(screen.getByLabelText("Nach E-Mail filtern…"), "ada@");
        await user.type(screen.getByLabelText("Nach Name filtern…"), "Ada Lovelace");
        await user.click(screen.getByRole("button", { name: "Suchen" }));

        expect(mockUseAdminUsers).toHaveBeenLastCalledWith({
            query: "stripe",
            email: "ada@",
            firstName: "Ada",
            lastName: "Lovelace",
            tier: undefined,
            role: undefined,
            sort: "updated",
            order: "desc",
        });
        expect(screen.getByText("user-dialog:user-1")).toBeInTheDocument();
    });
});
