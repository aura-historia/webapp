import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
    AdminActiveChips,
    AdminCell,
    AdminFilterPanel,
    AdminLedger,
    AdminLedgerRow,
    AdminLoadMore,
    AdminPrimaryCell,
    AdminQuickMulti,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";

describe("AdminToolbar", () => {
    it("submits the search on Enter and toggles the filter panel", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        const onChange = vi.fn();
        render(
            <AdminToolbar
                label="Benutzer filtern"
                search={{ label: "Name oder E-Mail", value: "clara", onChange, onSubmit }}
                panelCount={2}
                panel={() => <p>Panel content</p>}
            />,
        );

        await user.type(screen.getByRole("searchbox", { name: "Name oder E-Mail" }), "{Enter}");
        expect(onSubmit).toHaveBeenCalledOnce();

        const toggle = screen.getByRole("button", { name: /Alle Filter/ });
        expect(toggle).toHaveTextContent("2");
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText("Panel content")).not.toBeInTheDocument();

        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("Panel content")).toBeInTheDocument();
    });

    it("names the panel button Filters when it is the only control", () => {
        render(<AdminToolbar label="Partnerschaften filtern" panel={() => null} />);
        expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
    });
});

describe("AdminQuickMulti", () => {
    it("summarises the selection and applies a change at once", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <AdminQuickMulti
                label="Status"
                values={["SUBMITTED"]}
                options={[
                    { value: "SUBMITTED", label: "Eingereicht" },
                    { value: "IN_REVIEW", label: "In Prüfung" },
                ]}
                onChange={onChange}
            />,
        );

        const trigger = screen.getByRole("button", { name: /Status/ });
        expect(trigger).toHaveTextContent("Eingereicht");
        await user.click(trigger);
        await user.click(await screen.findByRole("menuitemcheckbox", { name: "In Prüfung" }));
        expect(onChange).toHaveBeenCalledWith(["SUBMITTED", "IN_REVIEW"]);
    });
});

describe("AdminFilterPanel and chips", () => {
    it("applies on submit, resets on Reset, and removes chips one by one or all", async () => {
        const user = userEvent.setup();
        const onApply = vi.fn();
        const onReset = vi.fn();
        const remove = vi.fn();
        const clearAll = vi.fn();
        render(
            <>
                <AdminFilterPanel onApply={onApply} onReset={onReset}>
                    <span>Fields</span>
                </AdminFilterPanel>
                <AdminActiveChips
                    chips={[{ key: "role", label: "Rolle: Administrator", onRemove: remove }]}
                    onClearAll={clearAll}
                />
            </>,
        );

        await user.click(screen.getByRole("button", { name: "Filter anwenden" }));
        await user.click(screen.getByRole("button", { name: "Zurücksetzen" }));
        await user.click(
            screen.getByRole("button", { name: "Filter Rolle: Administrator entfernen" }),
        );
        await user.click(screen.getByRole("button", { name: "Alle entfernen" }));

        expect(onApply).toHaveBeenCalledOnce();
        expect(onReset).toHaveBeenCalledOnce();
        expect(remove).toHaveBeenCalledOnce();
        expect(clearAll).toHaveBeenCalledOnce();
    });

    it("renders nothing without active filters", () => {
        const { container } = render(<AdminActiveChips chips={[]} onClearAll={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });
});

describe("AdminLedger", () => {
    it("lists rows as buttons with their cells and keeps the heading row out of the tree", async () => {
        const user = userEvent.setup();
        const onOpen = vi.fn();
        render(
            <AdminLedger
                label="Benutzerkonten"
                columns="2fr 1fr 16px"
                headings={["Konto", "Rolle"]}
            >
                <AdminLedgerRow aria-label="Konto clara@example.com öffnen" onClick={onOpen}>
                    <AdminPrimaryCell title="Clara Neumann" sub="clara@example.com" />
                    <AdminCell head="Rolle">Benutzer</AdminCell>
                </AdminLedgerRow>
            </AdminLedger>,
        );

        const list = screen.getByRole("list", { name: "Benutzerkonten" });
        expect(list).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Konto clara@example.com öffnen" }));
        expect(onOpen).toHaveBeenCalledOnce();
    });
});

describe("AdminLoadMore", () => {
    it("offers the next page, shows loading, the end and a failed page", async () => {
        const user = userEvent.setup();
        const onLoadMore = vi.fn();
        const { rerender } = render(
            <AdminLoadMore
                hasNextPage
                isFetchingNextPage={false}
                onLoadMore={onLoadMore}
                label="Mehr laden"
                endLabel="Alles geladen."
            />,
        );
        await user.click(screen.getByRole("button", { name: "Mehr laden" }));
        expect(onLoadMore).toHaveBeenCalledOnce();

        rerender(
            <AdminLoadMore
                hasNextPage
                isFetchingNextPage
                onLoadMore={onLoadMore}
                label="Mehr laden"
            />,
        );
        expect(screen.getByRole("button", { name: "Wird geladen…" })).toBeDisabled();

        rerender(
            <AdminLoadMore
                hasNextPage
                isFetchingNextPage={false}
                isError
                onLoadMore={onLoadMore}
                label="Mehr laden"
            />,
        );
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Weitere Einträge konnten nicht geladen werden.",
        );
        expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeInTheDocument();

        rerender(
            <AdminLoadMore
                hasNextPage={false}
                isFetchingNextPage={false}
                onLoadMore={onLoadMore}
                label="Mehr laden"
                endLabel="Alles geladen."
            />,
        );
        expect(screen.getByRole("status")).toHaveTextContent("Alles geladen.");
    });
});

describe("AdminInlineConfirm", () => {
    it("focuses Cancel and confirms with the named action", async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        render(
            <AdminInlineConfirm
                message="Dieses Konto sperren?"
                confirmLabel="Konto sperren"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.getByRole("group", { name: "Dieses Konto sperren?" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Abbrechen" })).toHaveFocus();
        await user.click(screen.getByRole("button", { name: "Konto sperren" }));
        expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("locks both buttons while pending", () => {
        render(
            <AdminInlineConfirm
                message="Löschen?"
                confirmLabel="Löschen"
                pending
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );
        expect(screen.getByRole("button", { name: "Abbrechen" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Löschen" })).toBeDisabled();
    });
});
