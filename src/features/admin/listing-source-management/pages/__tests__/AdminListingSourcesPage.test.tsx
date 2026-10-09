import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type {
    AdminListingSourceDetail,
    AdminListingSourceSummary,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { AdminListingSourcesPage } from "../AdminListingSourcesPage.tsx";

const api = vi.hoisted(() => ({
    useAdminListingSources: vi.fn(),
    useAdminListingSource: vi.fn(),
    useDeleteAdminListingSource: vi.fn(),
    formDialog: vi.fn(),
}));
vi.mock("../../api/useAdminListingSources.ts", () => ({
    useAdminListingSources: api.useAdminListingSources,
    useAdminListingSource: api.useAdminListingSource,
    useDeleteAdminListingSource: api.useDeleteAdminListingSource,
}));
vi.mock("../../components/AdminListingSourceFiltersForm.tsx", () => ({
    AdminListingSourceFiltersForm: () => null,
}));
vi.mock("../../components/AdminListingSourceFormDialog.tsx", () => ({
    AdminListingSourceFormDialog: (props: unknown) => {
        api.formDialog(props);
        return null;
    },
}));

const updated = new Date("2026-09-02T11:00:00.000Z");
const detail: AdminListingSourceDetail = {
    listingSourceId: "ls_01SOURCE",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "party_01", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL"],
    presentation: { url: "https://antique.example" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated,
};
const summary: AdminListingSourceSummary = {
    ...detail,
    referralConfiguration: { type: "PARTNERIZE", camref: "ref-01" },
};

function mockList(items: readonly AdminListingSourceSummary[]) {
    api.useAdminListingSources.mockReturnValue({
        data: { pages: [{ items, total: items.length }] },
        isPending: false,
        error: null,
        hasNextPage: false,
    });
}

function mockDetail(source: AdminListingSourceDetail) {
    api.useAdminListingSource.mockImplementation((id?: string, enabled?: boolean) =>
        id && enabled
            ? { data: source, isPending: false, error: null }
            : { data: undefined, isPending: true, error: null },
    );
}

function openDetails() {
    fireEvent.click(
        screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.details") }),
    );
}

describe("AdminListingSourcesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.useDeleteAdminListingSource.mockReturnValue({
            isPending: false,
            error: null,
            reset: vi.fn(),
            mutate: vi.fn(),
        });
    });

    it("shows the referral from a summary that is as fresh as the detail", () => {
        mockList([summary]);
        mockDetail(detail);
        render(<AdminListingSourcesPage />);
        openDetails();

        expect(
            screen.getByText(
                testI18n.t("adminListingSources.referral.partnerizeValue", { camref: "ref-01" }),
            ),
        ).toBeTruthy();

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.edit") }),
        );
        expect(api.formDialog).toHaveBeenLastCalledWith(
            expect.objectContaining({
                source: detail,
                referralConfiguration: summary.referralConfiguration,
                open: true,
            }),
        );
    });

    it("reports a missing referral as not provided when the summary is current", () => {
        mockList([{ ...detail }]);
        mockDetail(detail);
        render(<AdminListingSourcesPage />);
        openDetails();

        const referralLabel = screen.getByText(
            testI18n.t("adminListingSources.fields.referralConfiguration"),
        );
        expect(referralLabel.nextElementSibling?.textContent).toBe(
            testI18n.t("adminListingSources.fields.notProvided"),
        );
    });

    it("reports referral data as unavailable when the summary predates the detail", () => {
        mockList([summary]);
        mockDetail({ ...detail, updated: new Date("2026-09-03T09:00:00.000Z") });
        render(<AdminListingSourcesPage />);
        openDetails();

        expect(
            screen.getByText(testI18n.t("adminListingSources.fields.referralUnavailable")),
        ).toBeTruthy();
        expect(
            screen.queryByText(
                testI18n.t("adminListingSources.referral.partnerizeValue", { camref: "ref-01" }),
            ),
        ).toBeNull();

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.edit") }),
        );
        expect(api.formDialog).toHaveBeenLastCalledWith(
            expect.objectContaining({ referralConfiguration: undefined, open: true }),
        );
    });

    it("reports referral data as unavailable for a created source that is not in the list", () => {
        mockList([]);
        mockDetail(detail);
        render(<AdminListingSourcesPage />);

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminListingSources.actions.create") }),
        );
        const [{ onCreated }] = api.formDialog.mock.lastCall as [
            { onCreated: (id: string) => void },
        ];
        act(() => onCreated("ls_01SOURCE"));

        expect(
            screen.getByText(testI18n.t("adminListingSources.fields.referralUnavailable")),
        ).toBeTruthy();
    });
});
