import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
    AdminListingSourceDetail,
    AdminListingSourceFilters,
    AdminListingSourceSummary,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminListingSourcesPage } from "../AdminListingSourcesPage.tsx";

const api = vi.hoisted(() => ({
    useAdminListingSources: vi.fn(),
    useAdminListingSource: vi.fn(),
    useDeleteAdminListingSource: vi.fn(),
    formDialog: vi.fn(),
    locationDefaultSection: vi.fn(),
}));
vi.mock("../../api/useAdminListingSources.ts", () => ({
    useAdminListingSources: api.useAdminListingSources,
    useAdminListingSource: api.useAdminListingSource,
    useDeleteAdminListingSource: api.useDeleteAdminListingSource,
}));
vi.mock("../../components/AdminSourceLocationDefaultSection.tsx", () => ({
    AdminSourceLocationDefaultSection: (props: unknown) => {
        api.locationDefaultSection(props);
        return null;
    },
}));
vi.mock("../../components/AdminListingSourceFormDialog.tsx", () => ({
    AdminListingSourceFormDialog: (props: { open: boolean }) => {
        api.formDialog(props);
        return props.open ? <p>form</p> : null;
    },
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        params,
        className,
    }: {
        readonly children?: ReactNode;
        readonly params: (previous: Record<string, string>) => Record<string, string>;
        readonly className?: string;
    }) => (
        <a href={`/de/admin/parties/${params({ lng: "de" }).partyId}`} className={className}>
            {children}
        </a>
    ),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const t = testI18n.t.bind(testI18n);
const updated = new Date("2026-09-02T11:00:00.000Z");
const detail: AdminListingSourceDetail = {
    listingSourceType: "DEALER",
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL", "PARTNER_API"],
    presentation: { url: "https://antique.example" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated,
};
const summary: AdminListingSourceSummary = {
    ...detail,
    referralConfiguration: { type: "PARTNERIZE", camref: "ref-01" },
};
const bare: AdminListingSourceSummary = {
    ...detail,
    listingSourceId: "ls_02BARE",
    listingSourceSlugId: "maison-duret",
    name: "Maison Duret",
    listingSourceType: "AUCTION_HOUSE",
    ingestionMethods: [],
    platformTechnology: "SHOPWARE",
};

const listState = (overrides: Record<string, unknown> = {}) => ({
    data: { pages: [{ items: [summary], total: 7 }] },
    isPending: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
});

function mockList(items: readonly AdminListingSourceSummary[]) {
    api.useAdminListingSources.mockReturnValue(
        listState({ data: { pages: [{ items, total: items.length }] } }),
    );
}

function mockDetail(source: AdminListingSourceDetail) {
    api.useAdminListingSource.mockImplementation((id?: string, enabled?: boolean) =>
        id && enabled
            ? { data: source, isPending: false, error: null, refetch: vi.fn() }
            : { data: undefined, isPending: true, error: null, refetch: vi.fn() },
    );
}

const route = vi.hoisted(() => ({ filters: vi.fn(), source: vi.fn() }));

function Harness({
    initial = { sort: "name", order: "asc" },
    source,
}: {
    readonly initial?: AdminListingSourceFilters;
    readonly source?: string;
}) {
    const [filters, setFilters] = useState<AdminListingSourceFilters>(initial);
    const [selected, setSelected] = useState(source);
    return (
        <AdminListingSourcesPage
            filters={filters}
            selectedSourceId={selected}
            onFiltersChange={(next) => {
                route.filters(next);
                setFilters(next);
            }}
            onSourceSelect={(next) => {
                route.source(next);
                setSelected(next);
            }}
        />
    );
}

const fact = (dialog: HTMLElement, label: string) =>
    within(dialog).getByText(label, { selector: "dt" }).nextElementSibling?.textContent;

describe("AdminListingSourcesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.useAdminListingSources.mockReturnValue(listState());
        mockDetail(detail);
        api.useDeleteAdminListingSource.mockReturnValue({
            isPending: false,
            error: null,
            reset: vi.fn(),
            mutate: vi.fn(),
        });
    });

    it("lists sources with operator, type, ingestion, platform and the result line", () => {
        mockList([summary, bare]);
        render(<Harness />);

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminListingSources.heading") }),
        ).toBeInTheDocument();
        const row = screen.getByRole("button", { name: /^Antique House/ });
        expect(
            within(row).getByText(
                t("adminListingSources.list.operatedBy", { name: "Antique House Ltd" }),
            ),
        ).toBeTruthy();
        expect(within(row).getByText(t("listingSourceTypes.DEALER"))).toBeTruthy();
        expect(within(row).getByText(t("adminListingSources.methods.WEB_CRAWL"))).toBeTruthy();
        expect(within(row).getByText(t("adminListingSources.methods.PARTNER_API"))).toBeTruthy();

        const bareRow = screen.getByRole("button", { name: /Maison Duret/ });
        expect(within(bareRow).getByText(t("adminListingSources.list.none"))).toBeTruthy();
        expect(within(bareRow).getByText("SHOPWARE")).toBeTruthy();
        expect(
            screen.getByText(t("adminCommon.result.loadedOfTotal", { loaded: "2", total: "2" })),
        ).toBeTruthy();
    });

    it("shows loading, empty, no-match and retryable error states", () => {
        api.useAdminListingSources.mockReturnValue(listState({ data: undefined, isPending: true }));
        const loading = render(<Harness />);
        expect(screen.getByRole("status", { name: t("adminListingSources.loading") })).toBeTruthy();
        loading.unmount();

        mockList([]);
        const empty = render(<Harness />);
        expect(
            screen.getByRole("heading", { name: t("adminListingSources.states.empty") }),
        ).toBeInTheDocument();
        fireEvent.click(
            within(screen.getByRole("status")).getByRole("button", {
                name: t("adminListingSources.actions.create"),
            }),
        );
        expect(screen.getByText("form")).toBeTruthy();
        empty.unmount();

        const noMatches = render(
            <Harness initial={{ sort: "slug", order: "desc", listingSourceType: "DEALER" }} />,
        );
        expect(
            screen.getByRole("heading", { name: t("adminListingSources.states.noMatches") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }));
        expect(route.filters).toHaveBeenLastCalledWith({ sort: "name", order: "asc" });
        noMatches.unmount();

        const refetch = vi.fn();
        api.useAdminListingSources.mockReturnValue(
            listState({ data: undefined, error: new Error("List failed"), refetch }),
        );
        render(<Harness />);
        expect(
            screen.getByRole("heading", { name: t("adminListingSources.states.error") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });

    it("loads more sources and keeps loaded rows when a page fails", () => {
        const fetchNextPage = vi.fn();
        api.useAdminListingSources.mockReturnValue(listState({ hasNextPage: true, fetchNextPage }));
        const { rerender } = render(<Harness />);
        fireEvent.click(
            screen.getByRole("button", { name: t("adminListingSources.list.loadMoreSources") }),
        );
        expect(fetchNextPage).toHaveBeenCalledTimes(1);

        api.useAdminListingSources.mockReturnValue(
            listState({ hasNextPage: true, fetchNextPage, isFetchNextPageError: true }),
        );
        rerender(<Harness />);
        expect(screen.getByRole("button", { name: /^Antique House/ })).toBeTruthy();
        expect(screen.getByText(t("adminCommon.loadMoreFailed"))).toBeTruthy();
    });

    it("applies search, quick filters, panel filters and sort through the URL filters", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        const search = screen.getByRole("searchbox", {
            name: t("adminListingSources.filters.query"),
        });
        fireEvent.change(search, { target: { value: "  Lenbach " } });
        fireEvent.submit(search);
        expect(route.filters).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: "Lenbach" }),
        );

        await user.click(
            screen.getByRole("button", {
                name: new RegExp(`^${t("adminListingSources.filters.type")}`),
            }),
        );
        await user.click(
            await screen.findByRole("menuitemradio", {
                name: t("listingSourceTypes.AUCTION_HOUSE"),
            }),
        );
        expect(route.filters).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: "Lenbach", listingSourceType: "AUCTION_HOUSE" }),
        );

        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        const platform = screen.getByLabelText(t("adminListingSources.fields.platformTechnology"));
        fireEvent.change(platform, { target: { value: "shop ware" } });
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        expect(
            screen.getByText(t("adminListingSources.validation.platformTechnology")),
        ).toBeTruthy();
        expect(route.filters).toHaveBeenCalledTimes(2);

        fireEvent.change(platform, { target: { value: "shopware" } });
        fireEvent.change(screen.getByLabelText(t("adminListingSources.filters.operatorId")), {
            target: { value: " party_01 " },
        });
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        expect(route.filters).toHaveBeenLastCalledWith(
            expect.objectContaining({
                platformTechnology: "SHOPWARE",
                operatorPartyId: "party_01",
                listingSourceType: "AUCTION_HOUSE",
            }),
        );

        fireEvent.change(screen.getByLabelText(t("adminCommon.sort")), {
            target: { value: "updated:desc" },
        });
        expect(route.filters).toHaveBeenLastCalledWith(
            expect.objectContaining({ sort: "updated", order: "desc" }),
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", {
                    filter: `${t("adminListingSources.filters.operatorId")}: party_01`,
                }),
            }),
        );
        expect(route.filters.mock.lastCall?.[0]).not.toHaveProperty("operatorPartyId", "party_01");

        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearAll") }));
        expect(route.filters).toHaveBeenLastCalledWith({ sort: "updated", order: "desc" });
    });

    it("opens the selected source's record with its facts and operator link", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: /^Antique House/ }));
        expect(route.source).toHaveBeenLastCalledWith("ls_01SOURCE");

        const dialog = screen.getByRole("dialog", { name: "Antique House" });
        expect(
            within(dialog).getByText(
                t("adminListingSources.detail.eyebrow", { type: t("listingSourceTypes.DEALER") }),
            ),
        ).toBeTruthy();
        expect(within(dialog).getByRole("link", { name: "Antique House Ltd" })).toHaveAttribute(
            "href",
            "/de/admin/parties/party_01",
        );
        expect(fact(dialog, t("adminListingSources.facts.id"))).toBe("ls_01SOURCE");
        expect(fact(dialog, t("adminListingSources.facts.slug"))).toBe("antique-house");
        expect(fact(dialog, t("adminListingSources.facts.platform"))).toBe(t("adminCommon.none"));
        expect(fact(dialog, t("adminListingSources.facts.referral"))).toBe(
            t("adminListingSources.referral.partnerizeValue", { camref: "ref-01" }),
        );
        expect(api.locationDefaultSection).toHaveBeenLastCalledWith({ source: detail });

        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
        expect(route.source).toHaveBeenLastCalledWith(undefined);
    });

    it("opens a source named by the URL and hands it with its referral to the edit form", () => {
        render(<Harness source="ls_01SOURCE" />);

        fireEvent.click(
            within(screen.getByRole("dialog")).getByRole("button", {
                name: t("adminListingSources.actions.edit"),
            }),
        );
        expect(api.formDialog).toHaveBeenLastCalledWith(
            expect.objectContaining({
                source: detail,
                referralConfiguration: summary.referralConfiguration,
                open: true,
            }),
        );
        expect(route.source).toHaveBeenLastCalledWith(undefined);
    });

    it("reports a missing referral as none when the summary is current", () => {
        mockList([{ ...detail }]);
        render(<Harness source="ls_01SOURCE" />);

        expect(fact(screen.getByRole("dialog"), t("adminListingSources.facts.referral"))).toBe(
            t("adminCommon.none"),
        );
    });

    it("reports referral data as unavailable when the summary predates the detail", () => {
        mockDetail({ ...detail, updated: new Date("2026-09-03T09:00:00.000Z") });
        render(<Harness source="ls_01SOURCE" />);

        const dialog = screen.getByRole("dialog");
        expect(fact(dialog, t("adminListingSources.facts.referral"))).toBe(
            t("adminListingSources.fields.referralUnavailable"),
        );
        fireEvent.click(
            within(dialog).getByRole("button", { name: t("adminListingSources.actions.edit") }),
        );
        expect(api.formDialog).toHaveBeenLastCalledWith(
            expect.objectContaining({ referralConfiguration: undefined, open: true }),
        );
    });

    it("opens a created source that is not in the list with its referral unavailable", () => {
        mockList([]);
        render(<Harness />);

        fireEvent.click(
            screen.getAllByRole("button", { name: t("adminListingSources.actions.create") })[0],
        );
        const [{ onCreated, onOpenChange }] = api.formDialog.mock.lastCall as [
            { onCreated: (id: string) => void; onOpenChange: (open: boolean) => void },
        ];
        act(() => {
            onOpenChange(false);
            onCreated("ls_01SOURCE");
        });

        expect(fact(screen.getByRole("dialog"), t("adminListingSources.facts.referral"))).toBe(
            t("adminListingSources.fields.referralUnavailable"),
        );
    });

    it("deletes a source only after the inline confirmation", async () => {
        const mutate = vi.fn();
        api.useDeleteAdminListingSource.mockReturnValue({
            isPending: false,
            error: null,
            reset: vi.fn(),
            mutate,
        });
        render(<Harness source="ls_01SOURCE" />);
        const dialog = screen.getByRole("dialog");

        fireEvent.click(
            within(dialog).getByRole("button", { name: t("adminListingSources.actions.delete") }),
        );
        const confirm = within(dialog).getByRole("group", {
            name: t("adminListingSources.detail.confirmDelete"),
        });
        await waitFor(() =>
            expect(
                within(confirm).getByRole("button", { name: t("adminCommon.cancel") }),
            ).toHaveFocus(),
        );
        fireEvent.click(
            within(confirm).getByRole("button", { name: t("adminListingSources.actions.delete") }),
        );
        expect(mutate).toHaveBeenCalledWith("ls_01SOURCE", expect.any(Object));
    });
});
