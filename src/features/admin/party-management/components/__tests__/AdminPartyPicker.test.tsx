import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartyPicker } from "../AdminPartyPicker.tsx";

const api = vi.hoisted(() => ({ useAdminParties: vi.fn() }));
vi.mock("../../api/useAdminParties.ts", () => ({ useAdminParties: api.useAdminParties }));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, className }: { children: ReactNode; className?: string }) => (
        <a href="/en/admin/parties" className={className}>
            {children}
        </a>
    ),
}));

const party = {
    partyId: "party_canonical_1",
    partySlugId: "atelier-bleu",
    name: "Atelier Bleu",
    contact: { email: "info@example.test" },
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-02T11:00:00.000Z"),
};

describe("AdminPartyPicker", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.useAdminParties.mockReturnValue({
            data: { pages: [{ items: [party] }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
    });

    it("returns the canonical Party IDs and never creates a record from search text", () => {
        const onSelect = vi.fn();
        render(<AdminPartyPicker onSelect={onSelect} />);

        const search = screen.getByLabelText(testI18n.t("adminParties.picker.label"));
        fireEvent.change(search, { target: { value: "Atelier" } });
        expect(api.useAdminParties).toHaveBeenLastCalledWith({ query: "Atelier" }, true);

        fireEvent.click(screen.getByRole("button", { name: /Atelier Bleu/ }));
        expect(onSelect).toHaveBeenCalledWith({
            partyId: "party_canonical_1",
            partySlugId: "atelier-bleu",
        });
        expect(screen.getByText("party_canonical_1 · atelier-bleu")).toBeTruthy();
        expect(
            screen.queryByRole("button", { name: testI18n.t("adminParties.actions.create") }),
        ).toBeNull();
    });

    it("prompts before typing and links to the organizations when nothing matches", () => {
        api.useAdminParties.mockReturnValue({
            data: { pages: [{ items: [] }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
        render(<AdminPartyPicker onSelect={vi.fn()} />);
        expect(screen.getByRole("status")).toHaveTextContent(
            testI18n.t("adminParties.filters.query"),
        );

        fireEvent.change(screen.getByLabelText(testI18n.t("adminParties.picker.label")), {
            target: { value: "nobody" },
        });
        expect(screen.getByRole("status")).toHaveTextContent(
            testI18n.t("adminParties.picker.noMatches"),
        );
        expect(
            screen.getByRole("link", { name: testI18n.t("adminParties.picker.openOrganizations") }),
        ).toBeInTheDocument();
    });

    it("clears the selection on Change and returns focus to the search", () => {
        const onSelect = vi.fn();
        render(<AdminPartyPicker onSelect={onSelect} />);
        fireEvent.change(screen.getByLabelText(testI18n.t("adminParties.picker.label")), {
            target: { value: "Atelier" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Atelier Bleu/ }));
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminParties.picker.change") }),
        );
        expect(onSelect).toHaveBeenLastCalledWith(undefined);
        expect(screen.getByLabelText(testI18n.t("adminParties.picker.label"))).toHaveFocus();
    });
});
