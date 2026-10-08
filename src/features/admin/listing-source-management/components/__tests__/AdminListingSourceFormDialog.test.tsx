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

    it("labels each configuration select in the create form", () => {
        renderDialog();

        expect(
            screen.getByRole("combobox", {
                name: testI18n.t("adminListingSources.fields.configurationType"),
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole("combobox", {
                name: testI18n.t("adminListingSources.fields.ingestionMethod"),
            }),
        ).toBeTruthy();
    });
});
