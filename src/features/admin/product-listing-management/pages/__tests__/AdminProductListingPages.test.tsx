import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminProductListingDetails } from "@/client";
import testI18n from "@/i18n/i18nForTests";
import { AdminProductListingDetailPage } from "../AdminProductListingDetailPage.tsx";
import { AdminProductListingsPage } from "../AdminProductListingsPage.tsx";

const api = vi.hoisted(() => ({
    searchAdminProductListings: vi.fn(),
    getAdminProductListing: vi.fn(),
    updateAdminProductListing: vi.fn(),
    withdrawAdminProductListing: vi.fn(),
    restoreAdminProductListing: vi.fn(),
    adminSearchAuctions: vi.fn(),
}));

vi.mock("@/client", () => api);
vi.mock("@tanstack/react-router", () => ({
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
    source: { listingSourceId: "ls_01", name: "Galerie Nord", slugId: "galerie-nord" },
    sourceListingId: "SKU 0042",
    title: { text: "Walnut cabinet", language: "en" },
    price: { type: "MONETARY", amount: 125_050, currency: "EUR" },
    priceEstimateMin: null,
    priceEstimateMax: null,
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
        timing: { biddingOpens: null, scheduledCloses: null, reportedClosedAt: null },
    },
    saleObservation: null,
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

beforeEach(() => {
    // Also drops unconsumed one-off responses, so a failing test cannot leak them into the next.
    vi.resetAllMocks();
});

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
                            title: null,
                            lifecycle: "WITHDRAWN",
                            availability: null,
                            price: { type: "ON_REQUEST" },
                        },
                    ],
                    size: 1,
                }),
            );
        renderWithClient(
            <AdminProductListingsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );

        expect(await screen.findByText("Walnut cabinet")).toHaveAttribute("lang", "en");
        expect(screen.getByText("SKU 0042")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: t("adminProductListings.list.openLabel", { label: "Walnut cabinet" }),
            }),
        ).toHaveAttribute("href", "/en/admin/product-listings/pl_01");
        expect(screen.queryByText(/\d+ (results|Ergebnisse)/)).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.list.loadMore") }),
        );

        const withdrawn = await screen.findByRole("link", {
            name: t("adminProductListings.list.openLabel", { label: "SKU 0043" }),
        });
        const row = within(withdrawn.closest("li") as HTMLElement);
        expect(row.getByText(t("adminProductListings.lifecycles.WITHDRAWN"))).toBeInTheDocument();
        expect(row.getByText(t("adminProductListings.list.noTitle"))).toBeInTheDocument();
        expect(api.searchAdminProductListings).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: { size: 25, searchAfter: "cursor-1" } }),
        );
        expect(screen.getByText(t("adminProductListings.list.end"))).toBeInTheDocument();
    });

    it("applies trimmed exact filters, lifecycle, sort and page size", async () => {
        api.searchAdminProductListings.mockResolvedValue(ok({ items: [], size: 0 }));
        const user = userEvent.setup();
        const onFiltersChange = vi.fn();
        renderWithClient(
            <AdminProductListingsPage
                language="en"
                filters={{}}
                onFiltersChange={onFiltersChange}
            />,
        );
        expect(await screen.findByText(t("adminProductListings.list.empty"))).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.listingSourceId")), {
            target: { value: " ls_01 " },
        });
        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.sourceListingId")), {
            target: { value: " SKU 0042 " },
        });
        await user.click(
            screen.getByRole("combobox", { name: t("adminProductListings.fields.lifecycle") }),
        );
        await user.click(
            screen.getByRole("option", { name: t("adminProductListings.lifecycles.WITHDRAWN") }),
        );
        await user.click(
            screen.getByRole("combobox", { name: t("adminProductListings.filters.sort") }),
        );
        await user.click(
            screen.getByRole("option", { name: t("adminProductListings.sort.created_asc") }),
        );
        await user.click(
            screen.getByRole("combobox", { name: t("adminProductListings.filters.pageSize") }),
        );
        await user.click(screen.getByRole("option", { name: "100" }));
        await user.click(
            screen.getByRole("button", { name: t("adminProductListings.filters.apply") }),
        );

        await waitFor(() =>
            expect(onFiltersChange).toHaveBeenCalledWith({
                listingSourceId: "ls_01",
                sourceListingId: "SKU 0042",
                lifecycle: "WITHDRAWN",
                sort: "created",
                order: "asc",
                size: 100,
            }),
        );
    });

    it("shows a retryable error without exposing API details", async () => {
        api.searchAdminProductListings.mockResolvedValue(
            failure(503, "PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE"),
        );
        renderWithClient(
            <AdminProductListingsPage language="en" filters={{}} onFiltersChange={vi.fn()} />,
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            t("adminProductListings.errors.unavailable"),
        );
        expect(screen.queryByText(/private diagnostic/)).not.toBeInTheDocument();
    });
});

describe("AdminProductListingDetailPage", () => {
    it("shows read-only facts and previews an image only on request", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        const { container } = renderWithClient(
            <AdminProductListingDetailPage productListingId="pl_01" language="en" />,
        );

        expect(
            await screen.findByRole("heading", { level: 1, name: "Walnut cabinet" }),
        ).toBeInTheDocument();
        expect(screen.getByText("walnut-cabinet-pl01")).toBeInTheDocument();
        expect(screen.getByText("Two doors and the original key.")).toBeInTheDocument();
        expect(
            screen.getByText(t("adminProductListings.detail.noSaleObservation")),
        ).toBeInTheDocument();
        expect(screen.getByText(t("adminProductListings.detail.convergence"))).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: t("adminProductListings.actions.openAuction") }),
        ).toHaveAttribute("href", "/en/admin/auctions/auc_01");
        expect(container.querySelector("img")).toBeNull();

        const previewButtons = screen.getAllByRole("button", {
            name: t("adminProductListings.actions.showPreview"),
        });
        fireEvent.click(previewButtons[1] as HTMLElement);

        const images = container.querySelectorAll("img");
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute("src", "https://galerie.example/a.jpg");
        expect(images[0]).toHaveAttribute("referrerpolicy", "no-referrer");
        expect(images[0]).toHaveAttribute(
            "alt",
            t("adminProductListings.edit.imagePreviewAlt", { position: 2 }),
        );

        // An edited URL is not loaded until the administrator asks for its preview again.
        fireEvent.change(
            screen.getByLabelText(t("adminProductListings.edit.imageLabel", { position: 2 })),
            { target: { value: "https://other.example/c.jpg" } },
        );
        expect(container.querySelector("img")).toBeNull();
        expect(
            screen.getAllByRole("button", {
                name: t("adminProductListings.actions.showPreview"),
            }),
        ).toHaveLength(2);
    });

    it("saves only changed facts with the loaded version and reports the outcome", async () => {
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
        fireEvent.change(url, { target: { value: "https://galerie.example/items/42b" } });
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.detachAuction") }),
        );
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        expect(await screen.findByText(t("adminProductListings.edit.saved"))).toBeInTheDocument();
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

    it("replaces the original title in its language and clears the description", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        api.updateAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
        );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const title = await screen.findByLabelText(t("adminProductListings.fields.originalTitle"));
        expect(title).toHaveValue("Walnut cabinet");
        fireEvent.change(title, { target: { value: "Walnut cabinet, 1890" } });
        fireEvent.change(
            screen.getByLabelText(t("adminProductListings.fields.originalDescription")),
            {
                target: { value: "" },
            },
        );
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        expect(await screen.findByText(t("adminProductListings.edit.saved"))).toBeInTheDocument();
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
            ok({ ...detailDto, title: null, description: null }),
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
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        const title = await screen.findByLabelText(t("adminProductListings.fields.originalTitle"));
        const save = screen.getByRole("button", { name: t("adminProductListings.actions.save") });
        fireEvent.change(title, { target: { value: "x".repeat(129) } });
        expect(screen.getByText(t("adminProductListings.edit.titleTooLong"))).toBeInTheDocument();
        fireEvent.click(save);

        expect(
            await screen.findByText(t("adminProductListings.validation.languageRequired")),
        ).toBeInTheDocument();
        expect(api.updateAdminProductListing).not.toHaveBeenCalled();

        fireEvent.change(title, { target: { value: "✨" } });
        expect(screen.queryByText(t("adminProductListings.edit.titleTooLong"))).toBeNull();
        await userEvent.click(
            screen.getByRole("combobox", { name: t("adminProductListings.fields.titleLanguage") }),
        );
        await userEvent.click(await screen.findByRole("option", { name: "DE" }));
        fireEvent.click(save);

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
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        expect(await screen.findByText(t("adminProductListings.edit.saved"))).toBeInTheDocument();
        // The older cached record must not replace the committed values or their version.
        expect(url).toHaveValue("https://galerie.example/items/42b");
        expect(
            screen.queryByRole("button", { name: t("adminProductListings.actions.keepDraft") }),
        ).not.toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(t("adminProductListings.fields.lotNumber")), {
            target: { value: "13" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        await waitFor(() => expect(api.updateAdminProductListing).toHaveBeenCalledTimes(2));
        expect(api.updateAdminProductListing).toHaveBeenLastCalledWith(
            expect.objectContaining({
                body: { expectedVersion: 8, auction: { lotNumber: "13" } },
            }),
        );
    });

    it("does not send a request without changes", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        fireEvent.click(
            await screen.findByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        expect(
            await screen.findByText(t("adminProductListings.edit.noChanges")),
        ).toBeInTheDocument();
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
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        expect(
            await screen.findByText(t("adminProductListings.errors.versionConflict")),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("adminProductListings.edit.stale", { version: 8 })),
        ).toBeInTheDocument();
        expect(lotNumber).toHaveValue("13");
        expect(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        ).toBeDisabled();
        expect(api.updateAdminProductListing).toHaveBeenCalledTimes(1);

        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.keepDraft") }),
        );
        expect(screen.getByLabelText(t("adminProductListings.fields.url"))).toHaveValue(
            "https://galerie.example/moved",
        );
        fireEvent.click(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        );

        await waitFor(() => expect(api.updateAdminProductListing).toHaveBeenCalledTimes(2));
        expect(api.updateAdminProductListing).toHaveBeenLastCalledWith(
            expect.objectContaining({
                body: { expectedVersion: 8, auction: { lotNumber: "13" } },
            }),
        );
    });

    it("locks editing of a withdrawn listing and restores it after confirmation", async () => {
        api.getAdminProductListing
            .mockResolvedValueOnce(ok({ ...detailDto, lifecycle: "WITHDRAWN", availability: null }))
            .mockResolvedValue(ok({ ...detailDto, availability: null, expectedVersion: 8 }));
        api.restoreAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
        );
        renderWithClient(<AdminProductListingDetailPage productListingId="pl_01" language="en" />);

        expect(
            await screen.findByText(t("adminProductListings.edit.withdrawnLocked")),
        ).toBeInTheDocument();
        expect(screen.getByLabelText(t("adminProductListings.fields.url"))).toBeDisabled();
        expect(
            screen.getByRole("button", { name: t("adminProductListings.actions.save") }),
        ).toBeDisabled();
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

        expect(
            await screen.findByText(t("adminProductListings.lifecycle.restored")),
        ).toBeInTheDocument();
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
                availability: null,
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

        expect(
            await screen.findByText(t("adminProductListings.lifecycle.withdrawn")),
        ).toBeInTheDocument();
        expect(api.withdrawAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            query: { expectedVersion: 7 },
            cache: "no-store",
        });
        expect(
            await screen.findByText(t("adminProductListings.edit.withdrawnLocked")),
        ).toBeInTheDocument();
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
