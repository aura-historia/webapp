import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { AccessTokenEditDialog } from "./AccessTokenEditDialog.tsx";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";

const mutate = vi.hoisted(() => vi.fn());
const mockUserAccount = vi.hoisted(() => ({ role: "USER" as "USER" | "ADMIN" }));
vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { role: mockUserAccount.role } }),
}));
vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useUpdateAccessToken: () => ({ mutate, isPending: false }),
}));

const accessToken: AccessToken = {
    id: "at_01jopaque",
    name: "Sync",
    scopes: ["product-listings:write"],
    expiresAt: new Date("2026-10-01T12:34:56.789Z"),
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUserAccount.role = "USER";
});

it("renames without changing grants or truncating the existing expiry", async () => {
    const user = userEvent.setup();
    render(<AccessTokenEditDialog accessToken={accessToken} open onOpenChange={vi.fn()} />);
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Renamed");
    await user.click(screen.getByLabelText("Ablaufzeitpunkt"));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("combobox", { name: "Stunde" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: "Renamed", scopes: undefined, expiresAt: undefined },
        expect.anything(),
    );
});

it("clears the existing expiry and last scope explicitly", async () => {
    const user = userEvent.setup();
    render(<AccessTokenEditDialog accessToken={accessToken} open onOpenChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Ablaufzeitpunkt entfernen" }));
    await user.click(screen.getByLabelText("Produktangebote schreiben"));
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: undefined, scopes: [], expiresAt: null },
        expect.anything(),
    );
});

it("preserves an existing ingestion grant when changing only the name", async () => {
    const user = userEvent.setup();
    render(
        <AccessTokenEditDialog
            accessToken={{ ...accessToken, scopes: ["listing-sources:write"] }}
            open
            onOpenChange={vi.fn()}
        />,
    );
    expect(screen.getByLabelText("Listing-Quellen verwalten")).toBeChecked();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Renamed");
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: "Renamed", scopes: undefined, expiresAt: undefined },
        expect.anything(),
    );
});

it("renders newly supported grants and replaces them only when edited", async () => {
    const user = userEvent.setup();
    mockUserAccount.role = "ADMIN";
    render(
        <AccessTokenEditDialog
            accessToken={{ ...accessToken, scopes: ["auctions:read", "notifications:write"] }}
            open
            onOpenChange={vi.fn()}
        />,
    );
    expect(screen.getByLabelText("Auktionen lesen")).toBeChecked();
    expect(screen.getByLabelText("Benachrichtigungen verwalten")).toBeChecked();
    expect(screen.getByLabelText("Auktionen verwalten")).not.toBeChecked();
    expect(screen.getByLabelText("Benachrichtigungen lesen")).not.toBeChecked();

    await user.click(screen.getByLabelText("Auktionen lesen"));
    await user.click(screen.getByLabelText("Partnerschaften verwalten"));
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        {
            id: accessToken.id,
            name: undefined,
            scopes: ["notifications:write", "partnerships:write"],
            expiresAt: undefined,
        },
        expect.anything(),
    );
});

it("keeps administrator grants it does not show to other accounts", async () => {
    const user = userEvent.setup();
    render(
        <AccessTokenEditDialog
            accessToken={{ ...accessToken, scopes: ["auctions:read", "watchlist:read"] }}
            open
            onOpenChange={vi.fn()}
        />,
    );
    expect(screen.queryByLabelText("Auktionen lesen")).not.toBeInTheDocument();
    const selectAll = screen.getByRole("checkbox", { name: "Alle Berechtigungen auswählen" });
    expect(selectAll).toHaveAttribute("data-state", "indeterminate");

    await user.click(selectAll);
    await user.click(selectAll);
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: undefined, scopes: ["auctions:read"], expiresAt: undefined },
        expect.anything(),
    );
});

it("sends no scope change when the selection returns to the saved grants", async () => {
    const user = userEvent.setup();
    render(<AccessTokenEditDialog accessToken={accessToken} open onOpenChange={vi.fn()} />);
    const selectAll = screen.getByRole("checkbox", { name: "Alle Berechtigungen auswählen" });

    await user.click(selectAll);
    expect(selectAll).toBeChecked();
    await user.click(selectAll);
    await user.click(screen.getByLabelText("Produktangebote schreiben"));
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: undefined, scopes: undefined, expiresAt: undefined },
        expect.anything(),
    );
});

it("keeps hidden administrator grants when a group action is used", async () => {
    const user = userEvent.setup();
    render(
        <AccessTokenEditDialog
            accessToken={{ ...accessToken, scopes: ["parties:write"] }}
            open
            onOpenChange={vi.fn()}
        />,
    );
    await user.click(
        screen.getByRole("button", {
            name: "Alle auswählen: Konto und Zugriffstoken",
        }),
    );
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        {
            id: accessToken.id,
            name: undefined,
            scopes: [
                "users:read",
                "users:write",
                "access-tokens:read",
                "access-tokens:write",
                "parties:write",
            ],
            expiresAt: undefined,
        },
        expect.anything(),
    );
});
