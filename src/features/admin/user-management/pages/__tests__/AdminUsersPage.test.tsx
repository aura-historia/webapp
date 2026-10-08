import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { DEFAULT_ADMIN_USER_FILTERS } from "../../lib/adminUserSearch.ts";
import { AdminUsersPage } from "../AdminUsersPage.tsx";

const api = vi.hoisted(() => ({ useAdminUsers: vi.fn() }));
vi.mock("../../api/useAdminUsers.ts", () => ({ useAdminUsers: api.useAdminUsers }));
vi.mock("../../components/AdminUserDetailDialog.tsx", () => ({
    AdminUserDetailDialog: () => null,
}));

describe("AdminUsersPage", () => {
    it("renders search summaries using only fields present in the summary DTO", () => {
        api.useAdminUsers.mockReturnValue({
            data: {
                pages: [
                    {
                        items: [
                            {
                                userId: "opaque/user+01",
                                email: "ada@example.test",
                                firstName: "Ada",
                                lastName: "Lovelace",
                                role: "ADMIN",
                                tier: "ultimate",
                            },
                        ],
                    },
                ],
            },
            isLoading: false,
            isError: false,
            isFetchingNextPage: false,
            hasNextPage: false,
        });

        render(
            <AdminUsersPage
                filters={DEFAULT_ADMIN_USER_FILTERS}
                onFiltersChange={vi.fn()}
                onUserSelect={vi.fn()}
                onDetailOpenChange={vi.fn()}
            />,
        );

        const list = screen.getByRole("region", { name: testI18n.t("adminUsers.list.title") });
        expect(within(list).getByText("Ada Lovelace")).toBeInTheDocument();
        expect(within(list).getByText("ada@example.test")).toBeInTheDocument();
        expect(
            within(list).getByText(testI18n.t("adminUsers.options.roles.ADMIN")),
        ).toBeInTheDocument();
        expect(
            within(list).getByText(testI18n.t("adminUsers.options.tiers.ULTIMATE")),
        ).toBeInTheDocument();
        expect(
            within(list).queryByText(
                testI18n.t("adminUsers.fields.showUnassessedOrSensitiveContent"),
            ),
        ).not.toBeInTheDocument();
        expect(within(list).queryByText("2020-01-01T00:00:00.000Z")).not.toBeInTheDocument();
    });
});
