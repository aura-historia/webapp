import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { AdminListingSourceDetail } from "@/data/internal/listing-source/AdminListingSource.ts";
import { AdminListingSourceFormDialog } from "../AdminListingSourceFormDialog.tsx";

const api = vi.hoisted(() => ({
    create: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    update: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
}));
vi.mock("../../api/useAdminListingSources.ts", () => ({
    AdminListingSourceRequestError: class extends Error {},
    useCreateAdminListingSource: () => api.create,
    useUpdateAdminListingSource: () => api.update,
}));
vi.mock("@/features/admin/party-management/components/AdminPartyPicker.tsx", () => ({
    AdminPartyPicker: () => null,
}));

const source: AdminListingSourceDetail = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL"],
    presentation: { url: "https://antique.example" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

function renderDialog(props: { source?: AdminListingSourceDetail } = {}) {
    return render(
        <AdminListingSourceFormDialog
            {...props}
            open
            onOpenChange={vi.fn()}
            onCreated={vi.fn()}
            onUpdated={vi.fn()}
        />,
    );
}

describe("AdminListingSourceFormDialog", () => {
    beforeEach(() => vi.clearAllMocks());

    it("explains rejected presentation URLs in the edit form", async () => {
        renderDialog({ source });
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.url")), {
            target: { value: "ftp://antique.example" },
        });
        fireEvent.change(screen.getByLabelText(testI18n.t("adminListingSources.fields.image")), {
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

    it("starts without an ingestion method and allows adding and removing the last entry", () => {
        renderDialog();

        const configurationType = testI18n.t("adminListingSources.fields.configurationType");
        expect(screen.queryByRole("combobox", { name: configurationType })).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: testI18n.t("adminListingSources.actions.addMethod"),
            }),
        );
        expect(screen.getByRole("combobox", { name: configurationType })).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: testI18n.t("adminListingSources.actions.removeMethod"),
            }),
        );
        expect(screen.queryByRole("combobox", { name: configurationType })).not.toBeInTheDocument();
    });

    describe("currency validation in the edit form", () => {
        const multiMethodSource: AdminListingSourceDetail = {
            ...source,
            ingestionMethods: ["WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE"],
        };

        function fillReplacementConfiguration(currencies: readonly [string, string, string]) {
            fireEvent.click(screen.getByRole("checkbox"));
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
