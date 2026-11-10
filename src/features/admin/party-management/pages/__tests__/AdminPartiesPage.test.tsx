import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartiesPage } from "../AdminPartiesPage.tsx";

const api = vi.hoisted(() => ({
    useAdminParties: vi.fn(),
    navigate: vi.fn(),
    onCreated: undefined as ((partyId: string) => void) | undefined,
    formOpen: false,
}));
vi.mock("../../api/useAdminParties.ts", () => ({ useAdminParties: api.useAdminParties }));
vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => api.navigate,
    Link: ({
        children,
        params,
        className: _className,
        ...props
    }: {
        children: ReactNode;
        className?: string;
        params: (previous: Record<string, string>) => Record<string, string>;
        "aria-label"?: string;
    }) => (
        <a href={`/en/admin/parties/${params({ lng: "en" }).partyId}`} {...props}>
            {children}
        </a>
    ),
}));
vi.mock("../../components/AdminPartyFormDialog.tsx", () => ({
    AdminPartyFormDialog: ({
        open,
        onCreated,
    }: {
        open: boolean;
        onCreated: (partyId: string) => void;
    }) => {
        api.onCreated = onCreated;
        api.formOpen = open;
        return null;
    },
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const baseParty = {
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

function listResult(items: unknown[], overrides: Record<string, unknown> = {}) {
    return {
        data: { pages: [{ items, total: 431 }] },
        isPending: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        ...overrides,
    };
}

describe("AdminPartiesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.formOpen = false;
        api.useAdminParties.mockReturnValue(
            listResult([
                {
                    ...baseParty,
                    partyId: "p1",
                    contact: { phone: "+49 89 1", email: "a@example.test" },
                },
                { ...baseParty, partyId: "p2", contact: {} },
            ]),
        );
    });

    it("lists organizations that link to their page, with the loaded and matching counts", () => {
        render(<AdminPartiesPage filters={{}} onFiltersChange={vi.fn()} />);

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminParties.pageTitle") }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("adminCommon.result.loadedOfTotal", { loaded: "2", total: "431" })),
        ).toBeInTheDocument();
        expect(screen.getByText("+49 89 1 · a@example.test")).toBeInTheDocument();
        expect(screen.getAllByText(t("adminParties.fields.notProvided"))).toHaveLength(1);
        expect(
            screen
                .getAllByRole("link", {
                    name: t("adminParties.list.open", { name: "Atelier Bleu" }),
                })
                .map((link) => link.getAttribute("href")),
        ).toEqual(["/en/admin/parties/p1", "/en/admin/parties/p2"]);
    });

    it("applies the search on Enter", async () => {
        const onFiltersChange = vi.fn();
        render(
            <AdminPartiesPage
                filters={{ sort: "created", order: "desc" }}
                onFiltersChange={onFiltersChange}
            />,
        );
        await userEvent.type(
            screen.getByRole("searchbox", { name: t("adminParties.filters.query") }),
            " weber {Enter}",
        );
        expect(onFiltersChange).toHaveBeenCalledWith({
            sort: "created",
            order: "desc",
            query: "weber",
        });
    });

    it("applies panel filters and removes them through chips", async () => {
        const user = userEvent.setup();
        const onFiltersChange = vi.fn();
        const { rerender } = render(
            <AdminPartiesPage filters={{}} onFiltersChange={onFiltersChange} />,
        );
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        await user.type(screen.getByLabelText(t("adminParties.filters.email")), "lenbach");
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        expect(onFiltersChange).toHaveBeenLastCalledWith({ email: "lenbach" });

        rerender(
            <AdminPartiesPage
                filters={{ email: "lenbach", query: "galerie" }}
                onFiltersChange={onFiltersChange}
            />,
        );
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.clearAll") }));
        expect(onFiltersChange).toHaveBeenLastCalledWith({});
    });

    it("sends sort and order together and omits the default", async () => {
        const user = userEvent.setup();
        const onFiltersChange = vi.fn();
        render(<AdminPartiesPage filters={{}} onFiltersChange={onFiltersChange} />);
        const sort = screen.getByRole("combobox", { name: t("adminCommon.sort") });
        expect(sort).toHaveValue("name:asc");
        await user.selectOptions(sort, "updated:desc");
        expect(onFiltersChange).toHaveBeenLastCalledWith({ sort: "updated", order: "desc" });
    });

    it("opens the create form and the page of a newly created organization", async () => {
        render(<AdminPartiesPage filters={{}} onFiltersChange={vi.fn()} />);
        await userEvent.click(
            screen.getByRole("button", { name: t("adminParties.actions.create") }),
        );
        expect(api.formOpen).toBe(true);

        api.onCreated?.("p3");
        expect(api.navigate).toHaveBeenCalledTimes(1);
        const [{ to, params }] = api.navigate.mock.calls[0];
        expect(to).toBe("/$lng/admin/parties/$partyId");
        expect(params({ lng: "en" })).toEqual({ lng: "en", partyId: "p3" });
    });

    it("offers Reset filters when nothing matches", async () => {
        const onFiltersChange = vi.fn();
        api.useAdminParties.mockReturnValue(listResult([]));
        render(
            <AdminPartiesPage
                filters={{ name: "nobody", sort: "name", order: "desc" }}
                onFiltersChange={onFiltersChange}
            />,
        );
        expect(screen.getByText(t("adminParties.noMatches"))).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }),
        );
        expect(onFiltersChange).toHaveBeenCalledWith({ sort: "name", order: "desc" });
    });

    it("loads more organizations while a cursor remains", async () => {
        const fetchNextPage = vi.fn();
        api.useAdminParties.mockReturnValue(
            listResult([{ ...baseParty, partyId: "p1", contact: {} }], {
                hasNextPage: true,
                fetchNextPage,
            }),
        );
        render(<AdminPartiesPage filters={{}} onFiltersChange={vi.fn()} />);
        await userEvent.click(
            screen.getByRole("button", { name: t("adminParties.list.loadMoreOrganizations") }),
        );
        expect(fetchNextPage).toHaveBeenCalled();
    });
});
