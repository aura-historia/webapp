import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartiesPage } from "../AdminPartiesPage.tsx";

const api = vi.hoisted(() => ({
    useAdminParties: vi.fn(),
    navigate: vi.fn(),
    onCreated: undefined as ((partyId: string) => void) | undefined,
}));
vi.mock("../../api/useAdminParties.ts", () => ({ useAdminParties: api.useAdminParties }));
vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => api.navigate,
    Link: ({
        children,
        params,
        ...props
    }: {
        children: ReactNode;
        params: (previous: Record<string, string>) => Record<string, string>;
        "aria-label"?: string;
    }) => (
        <a href={`/en/admin/parties/${params({ lng: "en" }).partyId}`} {...props}>
            {children}
        </a>
    ),
}));
vi.mock("../../components/AdminPartyFormDialog.tsx", () => ({
    AdminPartyFormDialog: ({ onCreated }: { onCreated: (partyId: string) => void }) => {
        api.onCreated = onCreated;
        return null;
    },
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
        expect(
            screen
                .getAllByRole("link", {
                    name: testI18n.t("adminParties.actions.detailsFor", { name: "Atelier Bleu" }),
                })
                .map((link) => link.getAttribute("href")),
        ).toEqual(["/en/admin/parties/p1", "/en/admin/parties/p2"]);
    });

    it("opens the page of a newly created organization", () => {
        api.useAdminParties.mockReturnValue({
            data: { pages: [{ items: [] }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
        render(<AdminPartiesPage />);

        api.onCreated?.("p3");

        expect(api.navigate).toHaveBeenCalledTimes(1);
        const [{ to, params }] = api.navigate.mock.calls[0];
        expect(to).toBe("/$lng/admin/parties/$partyId");
        expect(params({ lng: "en" })).toEqual({ lng: "en", partyId: "p3" });
    });
});
