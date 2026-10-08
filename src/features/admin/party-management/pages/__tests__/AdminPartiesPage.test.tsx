import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartiesPage } from "../AdminPartiesPage.tsx";

const api = vi.hoisted(() => ({ useAdminParties: vi.fn() }));
vi.mock("../../api/useAdminParties.ts", () => ({ useAdminParties: api.useAdminParties }));
vi.mock("../../components/AdminPartyDetailDialog.tsx", () => ({
    AdminPartyDetailDialog: () => null,
}));
vi.mock("../../components/AdminPartyFormDialog.tsx", () => ({
    AdminPartyFormDialog: () => null,
}));

const baseParty = {
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

describe("AdminPartiesPage", () => {
    it("shows the not-provided fallback only when no contact value exists", () => {
        api.useAdminParties.mockReturnValue({
            data: {
                pages: [
                    {
                        items: [
                            { ...baseParty, partyId: "p1", contact: { email: "a@example.test" } },
                            { ...baseParty, partyId: "p2", contact: {} },
                        ],
                    },
                ],
            },
            isPending: false,
            error: null,
            hasNextPage: false,
        });

        render(<AdminPartiesPage />);

        expect(screen.getByText("a@example.test")).toBeTruthy();
        expect(screen.getAllByText(testI18n.t("adminParties.fields.notProvided"))).toHaveLength(1);
    });
});
