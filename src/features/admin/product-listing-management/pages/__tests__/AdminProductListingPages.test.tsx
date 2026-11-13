import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminProductListingDetails } from "@/client";
import testI18n from "@/i18n/i18nForTests";
import { AdminProductListingDetailPage } from "../AdminProductListingDetailPage.tsx";
import { AdminProductListingsPage } from "../AdminProductListingsPage.tsx";
import { chooseSelectOption } from "@/test/utils.tsx";

const api = vi.hoisted(() => ({
    searchAdminProductListings: vi.fn(),
    getAdminProductListing: vi.fn(),
    updateAdminProductListing: vi.fn(),
    withdrawAdminProductListing: vi.fn(),
    restoreAdminProductListing: vi.fn(),
    adminSearchAuctions: vi.fn(),
    getAdminAuction: vi.fn(),
}));
const toasts = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/client", () => api);
vi.mock("sonner", () => ({ toast: toasts }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@tanstack/react-router")>()),
    Link: ({
        children,
        to,
        params,
        className,
        "aria-label": ariaLabel,
    }: {
        children: ReactNode;
        to: string;
        params?: Record<string, string>;
        className?: string;
        "aria-label"?: string;
    }) => {
        const href = Object.entries(params ?? {}).reduce(
            (path, [key, value]) => path.replace(`$${key}`, value),
            to,
        );
        return (
            <a href={href} className={className} aria-label={ariaLabel}>
                {children}
            </a>
        );
    },
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const detailDto: AdminProductListingDetails = {
    productListingId: "pl_01",
    productListingTitleSlugId: "walnut-cabinet-pl01",
    source: {
        listingSourceId: "ls_01",
        name: "Galerie Nord",
        slugId: "galerie-nord",
        operator: { name: "Galerie Nord GmbH", partner: false },
    },
    sourceListingId: "SKU 0042",
    title: { text: "Walnut cabinet", language: "en" },
    price: { type: "MONETARY", amount: 125_050, currency: "EUR" },
    availability: "IN_STOCK",
    lifecycle: "ACTIVE",
    auctionId: "auc_01",
    expectedVersion: 7,
    created: "2026-09-01T10:00:00Z",
    updated: "2026-10-01T12:30:00Z",
    description: { text: "Two doors and the original key.", language: "en" },
    url: "https://galerie.example/items/42",
    images: ["https://galerie.example/b.jpg", "https://galerie.example/a.jpg"],
    auction: {
        auctionId: "auc_01",
        lotNumber: "12A",
        cataloguePosition: 3,
        timing: {},
    },
};

function ok<T>(data: T, status = 200) {
    return { data, error: undefined, response: { status } };
}

function failure(status: number, error: string) {
    return {
        data: undefined,
        error: { status, error, detail: "private diagnostic" },
        response: { status },
    };
}

function renderWithClient(ui: ReactNode) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const auctionDto = {
    auctionId: "auc_01",
    listingSourceId: "ls_01",
    sourceAuctionId: "A-2026-11",
    name: { text: "Autumn Sale", language: "en" },
    schedule: {},
    expectedVersion: 2,
    created: "2026-08-01T00:00:00Z",
    updated: "2026-08-02T00:00:00Z",
};

beforeEach(() => {
    // Also drops unconsumed one-off responses, so a failing test cannot leak them into the next.
    vi.resetAllMocks();
    api.getAdminAuction.mockResolvedValue(ok(auctionDto));
});

const save = () => screen.getByRole("button", { name: t("adminCommon.save") });

describe("AdminProductListingsPage", () => {
    it("lists active and withdrawn listings with source identity and opens each record", async () => {
        api.searchAdminProductListings
            .mockResolvedValueOnce(ok({ items: [detailDto], size: 1, searchAfter: "cursor-1" }))
            .mockResolvedValueOnce(
                ok({
                    items: [
                        {
                            ...detailDto,
                            productListingId: "pl_02",
                            sourceListingId: "SKU 0043",
                            title: undefined,
                            lifecycle: "WITHDRAWN",
                            availability: undefined,
                            price: { type: "ON_REQUEST" },
                        },
                    ],
                    size: 1,
                }),
            );
        renderWithClient(
            <AdminProductListingsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );

        expect(await screen.findByText("Walnut cabinet")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: t("adminNavigation.items.productListings"),
            }),
        ).toBeInTheDocument();
        expect(screen.getByText("SKU 0042")).toBeInTheDocument();
        expect(
            screen.getByText(
                t("adminProductListings.list.sub", {
                    lifecycle: t("adminProductListings.lifecycles.ACTIVE"),
                    source: "Galerie Nord",
                }),
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(t("adminCommon.result.loaded", { loaded: "1" }))).toBeVisible();
        expect(
            screen.getByRole("link", {
                name: t("adminProductListings.list.openLabel", { label: "Walnut cabinet" }),
            }),
        ).toHaveAttribute("href", "/en/admin/product-listings/pl_01");

        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.list.loadMore") }),
        );

        const withdrawn = await screen.findByRole("link", {
            name: t("adminProductListings.list.openLabel", { label: "SKU 0043" }),
        });
        const row = within(withdrawn);
        expect(
            row.getByText(
                t("adminProductListings.list.sub", {
                    lifecycle: t("adminProductListings.lifecycles.WITHDRAWN"),
                    source: "Galerie Nord",
                }),
            ),
        ).toBeInTheDocument();
        expect(row.getByText(t("adminProductListings.list.noTitle"))).toBeInTheDocument();
        expect(row.getByText(t("adminProductListings.priceOptions.ON_REQUEST"))).toBeVisible();
        expect(row.getByText(t("adminProductListings.fields.notAsserted"))).toBeVisible();
        expect(api.searchAdminProductListings).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: { size: 25, searchAfter: "cursor-1" } }),
        );
        expect(screen.getByText(t("adminCommon.result.loaded", { loaded: "2" }))).toBeVisible();
        expect(screen.getByText(t("adminProductListings.list.end"))).toBeInTheDocument();
    });

    it("applies the search, a quick filter and trimmed panel filters", async () => {
        api.searchAdminProductListings.mockResolvedValue(ok({ items: [detailDto], size: 1 }));
        const user = userEvent.setup();
        const onFiltersChange = vi.fn();
        renderWithClient(
            <AdminProductListingsPage
                language="en"
                filters={{ sort: "created", order: "asc" }}
                onFiltersChange={onFiltersChange}
            />,
        );
        await screen.findByText("Walnut cabinet");

        await user.type(
            screen.getByRole("searchbox", { name: t("adminProductListings.filters.query") }),
            " cabinet {Enter}",
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith({
            sort: "created",
            order: "asc",
            query: "cabinet",
        });

        fireEvent.keyDown(
            screen.getByRole("button", {
                name: new RegExp(t("adminProductListings.fields.lifecycle")),
            }),
            { key: "Enter" },
        );
        fireEvent.click(
            await screen.findByRole("menuitemradio", {
                name: t("adminProductListings.lifecycles.WITHDRAWN"),
            }),
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith({
            sort: "created",
            order: "asc",
            lifecycle: "WITHDRAWN",
        });

        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.sourceId")), {
            target: { value: " ls_01 " },
        });
        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.sourceListingId")), {
            target: { value: " SKU 0042 " },
        });
        await chooseSelectOption(
            user,
            screen.getByRole("combobox", { name: t("adminProductListings.filters.pageSize") }),
            "100",
        );
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));

        expect(onFiltersChange).toHaveBeenLastCalledWith({
            sort: "created",
            order: "asc",
            listingSourceId: "ls_01",
            sourceListingId: "SKU 0042",
            size: 100,
        });
    });

    it("rejects an over-long source listing ID in the panel", async () => {
        api.searchAdminProductListings.mockResolvedValue(ok({ items: [detailDto], size: 1 }));
        const onFiltersChange = vi.fn();
        renderWithClient(
            <AdminProductListingsPage
                language="en"
                filters={{}}
                onFiltersChange={onFiltersChange}
            />,
        );
        await screen.findByText("Walnut cabinet");

        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.sourceListingId")), {
            target: { value: "x".repeat(513) },
        });
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));

        expect(
            screen.getByText(t("adminProductListings.validation.filterTooLong")),
        ).toBeInTheDocument();
        expect(onFiltersChange).not.toHaveBeenCalled();
    });

    it("sorts and shows active filters as chips", async () => {
        api.searchAdminProductListings.mockResolvedValue(ok({ items: [detailDto], size: 1 }));
        const user = userEvent.setup();
        const onFiltersChange = vi.fn();
        renderWithClient(
            <AdminProductListingsPage
                language="en"
                filters={{ availability: "SOLD_OUT", auctionId: "auc_01" }}
                onFiltersChange={onFiltersChange}
            />,
        );
        await screen.findByText("Walnut cabinet");

        await chooseSelectOption(
            user,
            screen.getByRole("combobox", { name: t("adminCommon.sort") }),
            t("adminProductListings.sort.created_desc"),
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith({
            availability: "SOLD_OUT",
            auctionId: "auc_01",
            sort: "created",
            order: "desc",
        });

        const auctionChip = t("adminProductListings.filters.chip", {
            label: t("adminProductListings.fields.auctionId"),
            value: "auc_01",
        });
        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", { filter: auctionChip }),
            }),
        );
        expect(onFiltersChange).toHaveBeenLastCalledWith({
            availability: "SOLD_OUT",
            auctionId: undefined,
        });
    });

    it("offers to reset filters when nothing matches", async () => {
        api.searchAdminProductListings.mockResolvedValue(ok({ items: [], size: 0 }));
        const onFiltersChange = vi.fn();
        renderWithClient(
            <AdminProductListingsPage
                language="en"
                filters={{ lifecycle: "WITHDRAWN", sort: "updated", order: "asc" }}
                onFiltersChange={onFiltersChange}
            />,
        );

        expect(
            await screen.findByRole("heading", { name: t("adminProductListings.list.noMatches") }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }));
        expect(onFiltersChange).toHaveBeenCalledWith({ sort: "updated", order: "asc" });
    });

    it("shows a retryable error without exposing API details", async () => {
        api.searchAdminProductListings.mockResolvedValue(
            failure(503, "PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE"),
        );
        renderWithClient(
            <AdminProductListingsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            t("adminProductListings.list.loadFailed"),
        );
        expect(screen.getByRole("button", { name: t("adminCommon.retry") })).toBeInTheDocument();
        expect(screen.queryByText(/private diagnostic/)).not.toBeInTheDocument();
    });
});

describe("AdminProductListingDetailPage", () => {
    it("shows the record facts and previews an image only on request", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        const { container } = renderWithClient(
            <AdminProductListingDetailPage productListingId="pl_01" language="en" />,
        );

        expect(
            await screen.findByRole("heading", { level: 1, name: "Walnut cabinet" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminProductListings.actions.allListings") }),
        ).toHaveAttribute("href", "/en/admin/product-listings");
        expect(
            screen.getByText(
                t("adminProductListings.detail.eyebrowLifecycle", {
                    lifecycle: t("adminProductListings.lifecycles.ACTIVE"),
                }),
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminProductListings.actions.publicPage") }),
        ).toHaveAttribute("href", "/en/products/walnut-cabinet-pl01");
        expect(screen.getByText(t("adminProductListings.detail.correctionsNote"))).toBeVisible();

        const record = within(
            screen.getByRole("complementary", { name: t("adminProductListings.detail.record") }),
        );
        expect(record.getByText("walnut-cabinet-pl01")).toBeInTheDocument();
        expect(record.getByText("7")).toBeInTheDocument();
        expect(
            record.getByText(t("adminProductListings.detail.noSaleObservation")),
        ).toBeInTheDocument();
        expect(
            record.getByRole("link", { name: t("adminProductListings.actions.originalPage") }),
        ).toHaveAttribute("href", "https://galerie.example/items/42");

        expect(
            screen.getByLabelText(t("adminProductListings.fields.originalDescription")),
        ).toHaveValue("Two doors and the original key.");
        expect(await screen.findByRole("link", { name: "Autumn Sale" })).toHaveAttribute(
            "href",
            "/en/admin/auctions/auc_01",
        );
        expect(container.querySelector("img")).toBeNull();

        fireEvent.click(
            screen.getByRole("button", {
                name: t("adminProductListings.edit.showPreview", { position: 2 }),
            }),
        );

        const images = container.querySelectorAll("img");
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute("src", "https://galerie.example/a.jpg");
        expect(images[0]).toHaveAttribute("referrerpolicy", "no-referrer");
        expect(images[0]).toHaveAttribute(
            "alt",
            t("adminProductListings.edit.imagePreviewAlt", { position: 2 }),
        );
        expect(
            screen.getByRole("button", {
                name: t("adminProductListings.edit.hidePreview", { position: 2 }),
            }),
        ).toHaveAttribute("aria-pressed", "true");

        // An edited URL is not loaded until the administrator asks for its preview again.
        fireEvent.change(
            screen.getByLabelText(t("adminProductListings.edit.imageLabel", { position: 2 })),
            { target: { value: "https://other.example/c.jpg" } },
        );
        expect(container.querySelector("img")).toBeNull();
        expect(
            screen.getByRole("button", {
                name: t("adminProductListings.edit.showPreview", { position: 2 }),
            }),
        ).toBeInTheDocument();
    });

    it("saves only changed facts with the loaded version and confirms with a toast", async () => {
        api.getAdminProductListing
            .mockResolvedValueOnce(ok(detailDto))
            .mockResolvedValue(
                ok({ ...detailDto, expectedVersion: 8, url: "https://galerie.example/items/42b" }),
            );
        api.updateAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
        );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const url = await screen.findByLabelText(t("adminProductListings.fields.url"));
        expect(save()).toBeDisabled();
        expect(screen.getByText(t("adminProductListings.edit.noUnsaved"))).toBeVisible();
        fireEvent.change(url, { target: { value: "https://galerie.example/items/42b" } });
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.detach") }),
        );
        expect(
            screen.getByText(t("adminProductListings.edit.unsaved", { count: 2 })),
        ).toBeVisible();
        expect(screen.getByText(t("adminProductListings.edit.noAuction"))).toBeVisible();
        fireEvent.click(save());

        await waitFor(() =>
            expect(toasts.success).toHaveBeenCalledWith(t("adminProductListings.edit.savedToast")),
        );
        expect(api.updateAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            body: {
                expectedVersion: 7,
                url: "https://galerie.example/items/42b",
                auction: { auctionId: null },
            },
            cache: "no-store",
        });
    });

    it("chooses an auction of the listing's own source", async () => {
        api.getAdminProductListing.mockResolvedValue(
            ok({ ...detailDto, auctionId: undefined, auction: undefined }),
        );
        api.adminSearchAuctions.mockResolvedValue(
            ok({ items: [{ ...auctionDto, auctionId: "auc_02" }], size: 1 }),
        );
        api.updateAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
        );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: t("adminProductListings.actions.chooseAuction"),
            }),
        );
        fireEvent.click(await screen.findByRole("button", { name: /Autumn Sale/ }));
        expect(api.adminSearchAuctions).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({ listingSourceId: "ls_01" }),
            }),
        );
        fireEvent.click(save());

        await waitFor(() =>
            expect(api.updateAdminProductListing).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: { expectedVersion: 7, auction: { auctionId: "auc_02" } },
                }),
            ),
        );
    });

    it("replaces the original title in its language and clears the description", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        api.updateAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "UNCHANGED" }),
        );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const title = await screen.findByLabelText(t("adminProductListings.fields.originalTitle"));
        expect(title).toHaveValue("Walnut cabinet");
        fireEvent.change(title, { target: { value: "Walnut cabinet, 1890" } });
        fireEvent.change(
            screen.getByLabelText(t("adminProductListings.fields.originalDescription")),
            { target: { value: "" } },
        );
        fireEvent.click(save());

        await waitFor(() =>
            expect(toasts.success).toHaveBeenCalledWith(
                t("adminProductListings.edit.unchangedToast"),
            ),
        );
        expect(api.updateAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            body: {
                expectedVersion: 7,
                title: { text: "Walnut cabinet, 1890", language: "en" },
                description: null,
            },
            cache: "no-store",
        });
    });

    it("requires a language for new text, notes long titles and names a rejected title", async () => {
        api.getAdminProductListing.mockResolvedValue(
            ok({ ...detailDto, title: undefined, description: undefined }),
        );
        api.updateAdminProductListing.mockResolvedValue({
            data: undefined,
            error: {
                status: 400,
                error: "BAD_BODY_VALUE",
                source: { field: "title.text", type: "BODY" },
                detail: "private diagnostic",
            },
            response: { status: 400 },
        });
        const user = userEvent.setup();
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const title = await screen.findByLabelText(t("adminProductListings.fields.originalTitle"));
        fireEvent.change(title, { target: { value: "x".repeat(129) } });
        expect(screen.getByText(t("adminProductListings.edit.titleTooLong"))).toBeInTheDocument();
        fireEvent.click(save());

        expect(
            await screen.findByText(t("adminProductListings.validation.languageRequired")),
        ).toBeInTheDocument();
        expect(api.updateAdminProductListing).not.toHaveBeenCalled();

        fireEvent.change(title, { target: { value: "✨" } });
        expect(screen.queryByText(t("adminProductListings.edit.titleTooLong"))).toBeNull();
        await chooseSelectOption(
            user,
            screen.getByRole("combobox", { name: t("adminProductListings.fields.titleLanguage") }),
            new Intl.DisplayNames([testI18n.language], { type: "language" }).of("de") ?? "DE",
        );
        fireEvent.click(save());

        expect(
            await screen.findByText(t("adminProductListings.errors.invalidTitle")),
        ).toBeInTheDocument();
        expect(screen.queryByText(/private diagnostic/)).toBeNull();
        expect(api.updateAdminProductListing).toHaveBeenCalledWith(
            expect.objectContaining({
                body: { expectedVersion: 7, title: { text: "✨", language: "de" } },
            }),
        );
    });

    it("keeps saved values at the returned version when the refetch after saving fails", async () => {
        api.getAdminProductListing
            .mockResolvedValueOnce(ok(detailDto))
            .mockResolvedValue(failure(503, "PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE"));
        api.updateAdminProductListing
            .mockResolvedValueOnce(
                ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
            )
            .mockResolvedValueOnce(
                ok({ productListingId: "pl_01", expectedVersion: 9, outcome: "CHANGED" }),
            );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const url = await screen.findByLabelText(t("adminProductListings.fields.url"));
        fireEvent.change(url, { target: { value: "https://galerie.example/items/42b" } });
        fireEvent.click(save());

        await waitFor(() =>
            expect(toasts.success).toHaveBeenCalledWith(t("adminProductListings.edit.savedToast")),
        );
        // The older cached record must not replace the committed values or their version.
        expect(url).toHaveValue("https://galerie.example/items/42b");
        expect(
            screen.queryByRole("button", { name: t("adminProductListings.actions.keepDraft") }),
        ).not.toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.lotNumber")), {
            target: { value: "13" },
        });
        fireEvent.click(save());

        await waitFor(() => expect(api.updateAdminProductListing).toHaveBeenCalledTimes(2));
        expect(api.updateAdminProductListing).toHaveBeenLastCalledWith(
            expect.objectContaining({
                body: { expectedVersion: 8, auction: { lotNumber: "13" } },
            }),
        );
    });

    it("resets the form to the loaded record", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const lotNumber = await screen.findByLabelText(t("adminProductListings.fields.lotNumber"));
        fireEvent.change(lotNumber, { target: { value: "13" } });
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.resetDraft") }),
        );

        expect(lotNumber).toHaveValue("12A");
        expect(save()).toBeDisabled();
        expect(api.updateAdminProductListing).not.toHaveBeenCalled();
    });

    it("keeps the draft after a version conflict and reapplies it only on request", async () => {
        api.getAdminProductListing
            .mockResolvedValueOnce(ok(detailDto))
            .mockResolvedValue(
                ok({ ...detailDto, expectedVersion: 8, url: "https://galerie.example/moved" }),
            );
        api.updateAdminProductListing
            .mockResolvedValueOnce(failure(409, "PRODUCT_LISTING_CONCURRENCY_CONFLICT"))
            .mockResolvedValueOnce(
                ok({ productListingId: "pl_01", expectedVersion: 9, outcome: "CHANGED" }),
            );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const lotNumber = await screen.findByLabelText(t("adminProductListings.fields.lotNumber"));
        fireEvent.change(lotNumber, { target: { value: "13" } });
        fireEvent.click(save());

        expect(
            await screen.findByText(t("adminProductListings.errors.versionConflict")),
        ).toBeInTheDocument();
        expect(
            await screen.findByText(t("adminProductListings.edit.staleShort", { version: 8 })),
        ).toBeInTheDocument();
        expect(lotNumber).toHaveValue("13");
        expect(save()).toBeDisabled();
        expect(api.updateAdminProductListing).toHaveBeenCalledTimes(1);

        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.keepDraft") }),
        );
        expect(screen.getByLabelText(t("adminProductListings.fields.url"))).toHaveValue(
            "https://galerie.example/moved",
        );
        fireEvent.click(save());

        await waitFor(() => expect(api.updateAdminProductListing).toHaveBeenCalledTimes(2));
        expect(api.updateAdminProductListing).toHaveBeenLastCalledWith(
            expect.objectContaining({
                body: { expectedVersion: 8, auction: { lotNumber: "13" } },
            }),
        );
    });

    it("locks editing of a withdrawn listing and restores it after confirmation", async () => {
        api.getAdminProductListing
            .mockResolvedValueOnce(
                ok({ ...detailDto, lifecycle: "WITHDRAWN", availability: undefined }),
            )
            .mockResolvedValue(ok({ ...detailDto, availability: undefined, expectedVersion: 8 }));
        api.restoreAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
        );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        expect(
            await screen.findByText(t("adminProductListings.edit.lockedWithdrawn")),
        ).toBeInTheDocument();
        expect(screen.getByLabelText(t("adminProductListings.fields.url"))).toBeDisabled();
        expect(save()).toBeDisabled();
        expect(
            screen.queryByRole("link", { name: t("adminProductListings.actions.publicPage") }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", {
                name: t("adminProductListings.lifecycle.withdrawAction"),
            }),
        ).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.lifecycle.restoreAction") }),
        );
        const dialog = await screen.findByRole("alertdialog");
        expect(
            within(dialog).getByText(t("adminProductListings.lifecycle.version", { version: 7 })),
        ).toBeInTheDocument();
        expect(api.restoreAdminProductListing).not.toHaveBeenCalled();
        fireEvent.click(
            within(dialog).getByRole("button", {
                name: t("adminProductListings.lifecycle.restoreConfirm"),
            }),
        );

        await waitFor(() =>
            expect(toasts.success).toHaveBeenCalledWith(
                t("adminProductListings.lifecycle.restoredToast"),
            ),
        );
        expect(api.restoreAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            body: { expectedVersion: 7 },
            cache: "no-store",
        });
        await waitFor(() =>
            expect(screen.getByLabelText(t("adminProductListings.fields.url"))).toBeEnabled(),
        );
    });

    it("withdraws with the version shown in the confirmation", async () => {
        api.getAdminProductListing.mockResolvedValueOnce(ok(detailDto)).mockResolvedValue(
            ok({
                ...detailDto,
                lifecycle: "WITHDRAWN",
                availability: undefined,
                expectedVersion: 8,
            }),
        );
        api.withdrawAdminProductListing.mockResolvedValue(ok({}, 204));
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: t("adminProductListings.lifecycle.withdrawAction"),
            }),
        );
        const dialog = await screen.findByRole("alertdialog");
        expect(
            within(dialog).getByText(t("adminProductListings.lifecycle.withdrawConsequence")),
        ).toBeInTheDocument();
        fireEvent.click(
            within(dialog).getByRole("button", {
                name: t("adminProductListings.lifecycle.withdrawConfirm"),
            }),
        );

        await waitFor(() =>
            expect(toasts.success).toHaveBeenCalledWith(
                t("adminProductListings.lifecycle.withdrawnToast"),
            ),
        );
        expect(api.withdrawAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            query: { expectedVersion: 7 },
            cache: "no-store",
        });
        expect(
            await screen.findByText(t("adminProductListings.edit.lockedWithdrawn")),
        ).toBeInTheDocument();
    });

    it("shows a missing listing with a way back", async () => {
        api.getAdminProductListing.mockResolvedValue(failure(404, "PRODUCT_LISTING_NOT_FOUND"));
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        expect(
            await screen.findByRole("heading", {
                name: t("adminProductListings.detail.unavailableTitle"),
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminProductListings.actions.allListings") }),
        ).toHaveAttribute("href", "/en/admin/product-listings");
        expect(
            screen.queryByRole("button", { name: t("adminCommon.retry") }),
        ).not.toBeInTheDocument();
    });

    it("hides protected content when access is denied", async () => {
        api.getAdminProductListing.mockResolvedValue(failure(403, "FORBIDDEN"));
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            t("adminProductListings.errors.forbidden"),
        );
        expect(
            screen.queryByLabelText(t("adminProductListings.fields.url")),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/private diagnostic/)).not.toBeInTheDocument();
    });
});
