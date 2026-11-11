import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { type AdminUserFilters, DEFAULT_ADMIN_USER_FILTERS } from "../../lib/adminUserSearch.ts";
import { AdminUsersPage } from "../AdminUsersPage.tsx";
import { chooseSelectOption } from "@/test/utils.tsx";

const api = vi.hoisted(() => ({ useAdminUsers: vi.fn() }));
vi.mock("../../api/useAdminUsers.ts", () => ({ useAdminUsers: api.useAdminUsers }));
vi.mock("../../components/AdminUserDetailDialog.tsx", () => ({
    AdminUserDetailDialog: () => null,
}));
vi.mock("../../components/AdminUserSecurityControls.tsx", () => ({
    AdminUserSecurityControls: () => null,
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const ADA = {
    userId: "opaque/user+01",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "ADMIN",
    tier: "ultimate",
};
const MARIO = {
    userId: "usr_02",
    email: "m.rossi@example.it",
    role: "USER",
    tier: "free",
};

function listResult(items: unknown[], extra: Record<string, unknown> = {}) {
    return {
        data: { pages: [{ items, total: 12480 }] },
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        isFetchNextPageError: false,
        hasNextPage: false,
        refetch: vi.fn(),
        fetchNextPage: vi.fn(),
        ...extra,
    };
}

function renderPage(filters: AdminUserFilters = DEFAULT_ADMIN_USER_FILTERS) {
    const props = {
        onFiltersChange: vi.fn(),
        onUserSelect: vi.fn(),
        onDetailOpenChange: vi.fn(),
    };
    render(<AdminUsersPage filters={filters} {...props} />);
    return props;
}

describe("AdminUsersPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("lists accounts with name over email, role and tier tags", () => {
        api.useAdminUsers.mockReturnValue(listResult([ADA, MARIO]));
        const { onUserSelect } = renderPage();

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminUsers.pageTitle") }),
        ).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent(
            t("adminCommon.result.loadedOfTotal", { loaded: "2", total: "12.480" }),
        );
        const list = screen.getByRole("list", { name: t("adminUsers.list.label") });
        const [adaRow, marioRow] = within(list).getAllByRole("button");
        if (!adaRow || !marioRow) throw new Error("Missing rows");
        expect(adaRow).toHaveTextContent("Ada Lovelace");
        expect(adaRow).toHaveTextContent("ada@example.test");
        expect(adaRow).toHaveTextContent(t("adminUsers.options.roles.ADMIN"));
        expect(adaRow).toHaveTextContent(t("adminUsers.options.tiers.ULTIMATE"));
        // An account without a name shows its email alone.
        expect(within(marioRow).getAllByText("m.rossi@example.it")).toHaveLength(1);
        expect(adaRow).not.toHaveTextContent(
            t("adminUsers.fields.showUnassessedOrSensitiveContent"),
        );

        fireEvent.click(adaRow);
        expect(onUserSelect).toHaveBeenCalledWith("opaque/user+01");
    });

    it("sorts with one select that combines field and direction", async () => {
        api.useAdminUsers.mockReturnValue(listResult([ADA]));
        const user = userEvent.setup();
        const { onFiltersChange } = renderPage();

        const sort = screen.getByRole("combobox", { name: t("adminCommon.sort") });
        expect(sort).toHaveTextContent(
            `${t("adminUsers.sort.name")} · ${t("adminUsers.order.alphaAsc")}`,
        );
        await chooseSelectOption(
            user,
            sort,
            `${t("adminUsers.sort.created")} · ${t("adminUsers.order.newest")}`,
        );
        expect(onFiltersChange).toHaveBeenCalledWith({
            ...DEFAULT_ADMIN_USER_FILTERS,
            sort: "created",
            order: "desc",
        });
    });

    it("applies the search on Enter and shows a removable chip for it", () => {
        api.useAdminUsers.mockReturnValue(listResult([ADA]));
        const { onFiltersChange } = renderPage({ ...DEFAULT_ADMIN_USER_FILTERS, role: ["ADMIN"] });

        const search = screen.getByRole("searchbox", { name: t("adminUsers.filters.query") });
        fireEvent.change(search, { target: { value: "  ada " } });
        fireEvent.submit(search);
        expect(onFiltersChange).toHaveBeenLastCalledWith({
            ...DEFAULT_ADMIN_USER_FILTERS,
            role: ["ADMIN"],
            query: "ada",
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", {
                    filter: `${t("adminUsers.filters.role")}: ${t("adminUsers.options.roles.ADMIN")}`,
                }),
            }),
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith({
            ...DEFAULT_ADMIN_USER_FILTERS,
            role: undefined,
        });
    });

    it("offers to reset filters when nothing matches", () => {
        api.useAdminUsers.mockReturnValue(listResult([]));
        const { onFiltersChange } = renderPage({ ...DEFAULT_ADMIN_USER_FILTERS, query: "nobody" });

        expect(screen.getByText(t("adminUsers.noMatches"))).toBeInTheDocument();
        fireEvent.click(
            screen.getAllByRole("button", {
                name: t("adminCommon.filters.clearSearch"),
            })[0] as HTMLElement,
        );
        expect(onFiltersChange).toHaveBeenCalledWith(DEFAULT_ADMIN_USER_FILTERS);
    });

    it("shows an error panel with Try again when nothing loaded", () => {
        const refetch = vi.fn();
        api.useAdminUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            isFetchingNextPage: false,
            hasNextPage: false,
            refetch,
        });
        renderPage();

        expect(screen.getByText(t("adminUsers.loadFailed"))).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalledOnce();
    });

    it("shows the ledger skeleton while loading", () => {
        api.useAdminUsers.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            isFetchingNextPage: false,
            hasNextPage: false,
        });
        renderPage();

        expect(screen.getByRole("status", { name: t("adminUsers.loading") })).toBeInTheDocument();
    });
});
