import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { AdminListingSourceDetail } from "@/data/internal/listing-source/AdminListingSource.ts";
import { AdminListingSourceFormDialog } from "../AdminListingSourceFormDialog.tsx";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const api = vi.hoisted(() => ({
    create: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    update: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
}));
vi.mock("../../api/useAdminListingSources.ts", () => ({
    AdminListingSourceRequestError: class extends Error {
        constructor(
            message: string,
            readonly status: number,
        ) {
            super(message);
        }
    },
    useCreateAdminListingSource: () => api.create,
    useUpdateAdminListingSource: () => api.update,
}));
vi.mock("@/features/admin/party-management/components/AdminPartyPicker.tsx", () => ({
    AdminPartyPicker: ({
        onSelect,
    }: {
        readonly onSelect: (identity?: { readonly partyId: string }) => void;
    }) => (
        <button type="button" onClick={() => onSelect({ partyId: "party_01" })}>
            Pick operator
        </button>
    ),
}));

const source: AdminListingSourceDetail = {
    listingSourceType: "DEALER",
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL"],
    presentation: { url: "https://antique.example" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

const callbacks = { onOpenChange: vi.fn(), onCreated: vi.fn(), onUpdated: vi.fn() };

function renderDialog(props: { source?: AdminListingSourceDetail } = {}) {
    return render(<AdminListingSourceFormDialog {...props} open {...callbacks} />);
}

function sourceType(type: string) {
    return within(
        screen.getByRole("radiogroup", {
            name: testI18n.t("adminListingSources.fields.listingSourceType"),
        }),
    ).getByRole("radio", { name: testI18n.t(`listingSourceTypes.${type}`) });
}

describe("AdminListingSourceFormDialog", () => {
    beforeEach(() => vi.clearAllMocks());

    it("explains rejected presentation URLs in the edit form", async () => {
        renderDialog({ source });
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.website")), {
            target: { value: "ftp://antique.example" },
        });
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.imageUrl")), {
            target: { value: "not a url" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.save") }),
        );

        await waitFor(() =>
            expect(
                screen.getAllByText(testI18n.t("adminListingSources.validation.invalidUrl")),
            ).toHaveLength(2),
        );
        expect(api.update.mutate).not.toHaveBeenCalled();
    });

    it("edits the recorded platform technology and rejects malformed codes", async () => {
        renderDialog({ source: { ...source, platformTechnology: "SHOPIFY" } });
        const platform = screen.getByLabelText(
            testI18n.t("adminListingSources.fields.platformTechnology"),
        );
        expect(platform).toHaveValue("SHOPIFY");
        const save = screen.getByRole("button", {
            name: testI18n.t("adminListingSources.actions.save"),
        });

        fireEvent.change(platform, { target: { value: "shop-ware" } });
        fireEvent.click(save);
        expect(
            await screen.findByText(
                testI18n.t("adminListingSources.validation.platformTechnology"),
            ),
        ).toBeInTheDocument();
        expect(api.update.mutate).not.toHaveBeenCalled();

        fireEvent.change(platform, { target: { value: "shopware" } });
        fireEvent.click(save);
        await waitFor(() => expect(api.update.mutate).toHaveBeenCalledTimes(1));
        expect(api.update.mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                values: expect.objectContaining({ platformTechnology: "shopware" }),
            }),
            expect.any(Object),
        );
    });

    it("requires a source type before creating a source", async () => {
        renderDialog();
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.name")), {
            target: { value: "Antique House" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Pick operator" }));
        expect(
            screen.getByRole("heading", { name: testI18n.t("adminListingSources.form.newTitle") }),
        ).toBeInTheDocument();
        for (const radio of screen.getAllByRole("radio", { name: /./ })) {
            if (radio.getAttribute("name") !== "admin-listing-source-operator-type") {
                expect(radio).not.toBeChecked();
            }
        }
        fireEvent.click(
            screen.getByRole("button", {
                name: testI18n.t("adminListingSources.actions.create"),
            }),
        );

        expect(
            await screen.findByText(
                testI18n.t("adminListingSources.validation.listingSourceTypeRequired"),
            ),
        ).toBeInTheDocument();
        expect(api.create.mutate).not.toHaveBeenCalled();
    });

    it("reclassifies a source in the edit form", async () => {
        const user = userEvent.setup();
        renderDialog({ source });
        expect(
            screen.getByRole("heading", {
                name: testI18n.t("adminListingSources.form.editNamed", { name: "Antique House" }),
            }),
        ).toBeInTheDocument();
        expect(sourceType("DEALER")).toBeChecked();

        await user.click(sourceType("AUCTION_HOUSE"));
        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminListingSources.actions.save"),
            }),
        );

        await waitFor(() => expect(api.update.mutate).toHaveBeenCalledTimes(1));
        expect(api.update.mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                values: expect.objectContaining({
                    listingSourceType: "AUCTION_HOUSE",
                }),
            }),
            expect.any(Object),
        );
    });

    it("creates a source with a normalized platform technology", async () => {
        const user = userEvent.setup();
        renderDialog();
        await user.click(sourceType("MARKETPLACE"));
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.name")), {
            target: { value: "Antique House" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Pick operator" }));
        fireEvent.change(
            screen.getByLabelText(testI18n.t("adminListingSources.fields.platformTechnology")),
            { target: { value: "bigcommerce" } },
        );
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.create") }),
        );

        await waitFor(() => expect(api.create.mutate).toHaveBeenCalledTimes(1));
        expect(api.create.mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Antique House",
                listingSourceType: "MARKETPLACE",
                operatorPartyId: "party_01",
                platformTechnology: "bigcommerce",
            }),
            expect.any(Object),
        );
    });

    it("starts without an ingestion method and allows adding and removing the last entry", async () => {
        const user = userEvent.setup();
        renderDialog();
        const woo = testI18n.t("adminListingSources.methods.WOOCOMMERCE");
        expect(screen.queryByRole("region", { name: woo })).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminListingSources.actions.addMethod"),
            }),
        );
        await user.click(await screen.findByRole("menuitem", { name: woo }));
        const card = screen.getByRole("region", { name: woo });
        expect(
            within(card).getByLabelText(testI18n.t("adminListingSources.fields.secret")),
        ).toHaveAttribute("type", "password");

        await user.click(
            within(card).getByRole("button", {
                name: testI18n.t("adminListingSources.form.removeMethod", { method: woo }),
            }),
        );
        expect(screen.queryByRole("region", { name: woo })).not.toBeInTheDocument();
    });

    it("clears a typed webhook secret after a failed create", async () => {
        const user = userEvent.setup();
        api.create.mutate.mockImplementation((_values, options) =>
            options.onError(new Error("Request failed")),
        );
        renderDialog();
        await user.click(sourceType("DEALER"));
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.name")), {
            target: { value: "Antique House" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Pick operator" }));
        await user.click(
            screen.getByRole("button", {
                name: testI18n.t("adminListingSources.actions.addMethod"),
            }),
        );
        await user.click(
            await screen.findByRole("menuitem", {
                name: testI18n.t("adminListingSources.methods.WOOCOMMERCE"),
            }),
        );
        const secret = screen.getByLabelText(testI18n.t("adminListingSources.fields.secret"));
        fireEvent.change(secret, { target: { value: "s3cret" } });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.create") }),
        );

        await waitFor(() => expect(api.create.mutate).toHaveBeenCalledTimes(1));
        expect(api.create.mutate.mock.calls[0][0].configurations[0].webhookSecret).toBe("s3cret");
        expect(await screen.findByText("Request failed")).toBeInTheDocument();
        await waitFor(() =>
            expect(
                screen.getByLabelText(testI18n.t("adminListingSources.fields.secret")),
            ).toHaveValue(""),
        );
    });

    it("creates a source for a new operator organization", async () => {
        const user = userEvent.setup();
        renderDialog();
        await user.click(sourceType("AUCTION_PLATFORM"));
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.name")), {
            target: { value: "Nordic Bids" },
        });
        await user.click(
            screen.getByRole("radio", {
                name: testI18n.t("adminListingSources.operator.newShort"),
            }),
        );
        expect(screen.queryByRole("button", { name: "Pick operator" })).not.toBeInTheDocument();
        fireEvent.change(
            screen.getByLabelText(testI18n.t("adminListingSources.fields.operatorName")),
            { target: { value: "Nordic Bids AB" } },
        );
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.create") }),
        );

        await waitFor(() => expect(api.create.mutate).toHaveBeenCalledTimes(1));
        expect(api.create.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ operatorType: "NEW", operatorName: "Nordic Bids AB" }),
            expect.any(Object),
        );
    });

    it("shows the fixed operator and slug, and edits ingestion only behind the switch", () => {
        renderDialog({ source: { ...source, ingestionMethods: ["WOOCOMMERCE"] } });

        expect(screen.getByText("Antique House Ltd")).toBeInTheDocument();
        expect(screen.getByText(testI18n.t("adminListingSources.form.fixed"))).toBeInTheDocument();
        expect(
            screen.getByText(
                testI18n.t("adminListingSources.form.slug", { slug: "antique-house" }),
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("combobox", {
                name: testI18n.t("adminListingSources.fields.referral"),
            }),
        ).toHaveValue("KEEP");

        const toggle = screen.getByRole("switch", {
            name: testI18n.t("adminListingSources.form.replaceConfiguration"),
        });
        expect(toggle).toHaveAttribute("aria-checked", "false");
        expect(
            screen.queryByLabelText(testI18n.t("adminListingSources.fields.secret")),
        ).not.toBeInTheDocument();

        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute("aria-checked", "true");
        expect(
            screen.getByLabelText(testI18n.t("adminListingSources.fields.secret")),
        ).toHaveAttribute("placeholder", testI18n.t("adminListingSources.form.secretPlaceholder"));
    });

    it("closes and reloads the source when an update conflicts", async () => {
        const { AdminListingSourceRequestError } = await import(
            "../../api/useAdminListingSources.ts"
        );
        api.update.mutate.mockImplementation((_input, options) =>
            options.onError(new AdminListingSourceRequestError("Changed elsewhere", 409)),
        );
        renderDialog({ source });
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.name")), {
            target: { value: "Antique House Berlin" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.save") }),
        );

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Changed elsewhere"));
        expect(callbacks.onOpenChange).toHaveBeenCalledWith(false);
        expect(callbacks.onUpdated).toHaveBeenCalledWith("ls_01SOURCE");
    });

    describe("currency validation in the edit form", () => {
        const multiMethodSource: AdminListingSourceDetail = {
            ...source,
            ingestionMethods: ["WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE"],
        };

        function fillReplacementConfiguration(currencies: readonly [string, string, string]) {
            fireEvent.click(screen.getByRole("switch"));
            fireEvent.change(
                screen.getByLabelText(testI18n.t("adminListingSources.fields.fallbackCurrency")),
                { target: { value: currencies[0] } },
            );
            fireEvent.change(
                screen.getByLabelText(testI18n.t("adminListingSources.fields.domain")),
                { target: { value: "store.example" } },
            );
            const currencyInputs = screen.getAllByLabelText(
                testI18n.t("adminListingSources.fields.currency"),
            );
            expect(currencyInputs).toHaveLength(2);
            currencyInputs.forEach((input, index) => {
                fireEvent.change(input, { target: { value: currencies[index + 1] } });
            });
            fireEvent.click(
                screen.getByRole("button", {
                    name: testI18n.t("adminListingSources.actions.save"),
                }),
            );
        }

        it("shows the unsupported-currency message on each invalid field and does not submit", async () => {
            renderDialog({ source: multiMethodSource });
            fillReplacementConfiguration(["XYZ", "ABC", "EURO"]);

            await waitFor(() =>
                expect(
                    screen.getAllByText(
                        testI18n.t("adminListingSources.validation.unsupportedCurrency"),
                    ),
                ).toHaveLength(3),
            );
            expect(
                screen.getByLabelText(testI18n.t("adminListingSources.fields.fallbackCurrency")),
            ).toHaveAttribute("aria-invalid", "true");
            expect(api.update.mutate).not.toHaveBeenCalled();
        });

        it("submits newly supported and empty currencies", async () => {
            renderDialog({ source: multiMethodSource });
            fillReplacementConfiguration(["SEK", " krw ", ""]);

            await waitFor(() => expect(api.update.mutate).toHaveBeenCalledTimes(1));
            expect(
                screen.queryByText(
                    testI18n.t("adminListingSources.validation.unsupportedCurrency"),
                ),
            ).not.toBeInTheDocument();
            expect(api.update.mutate).toHaveBeenCalledWith(
                {
                    source: multiMethodSource,
                    values: expect.objectContaining({
                        replaceIngestionConfiguration: true,
                        configurations: [
                            expect.objectContaining({
                                ingestionMethod: "WEB_CRAWL",
                                fallbackCurrency: "SEK",
                            }),
                            expect.objectContaining({
                                ingestionMethod: "SHOPIFY",
                                currency: " krw ",
                            }),
                            expect.objectContaining({
                                ingestionMethod: "WOOCOMMERCE",
                                currency: "",
                            }),
                        ],
                    }),
                },
                expect.any(Object),
            );
        });
    });
});
