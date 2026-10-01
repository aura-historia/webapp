import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { AccessTokenEditDialog } from "./AccessTokenEditDialog.tsx";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";

const mutate = vi.hoisted(() => vi.fn());
vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useUpdateAccessToken: () => ({ mutate, isPending: false }),
}));

const accessToken: AccessToken = {
    id: "at_01jopaque",
    name: "Sync",
    scopes: ["product-listings:write"],
    maskedToken: "aurahistoria_prefix_****",
    tokenType: "BEARER",
    expiresAt: new Date("2026-10-01T12:34:56.789Z"),
    created: new Date("2026-09-01T00:00:00Z"),
    updated: new Date("2026-09-01T00:00:00Z"),
};

beforeEach(() => vi.clearAllMocks());

it("renames without changing grants or truncating the existing expiry", async () => {
    const user = userEvent.setup();
    render(<AccessTokenEditDialog accessToken={accessToken} open onOpenChange={vi.fn()} />);
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Renamed");
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: "Renamed", scopes: undefined, expiresAt: undefined },
        expect.anything(),
    );
});

it("clears the existing expiry and last scope explicitly", async () => {
    const user = userEvent.setup();
    render(<AccessTokenEditDialog accessToken={accessToken} open onOpenChange={vi.fn()} />);
    await user.clear(screen.getByLabelText("Ablaufzeitpunkt"));
    await user.click(screen.getByLabelText("Produktangebote schreiben"));
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(mutate).toHaveBeenCalledWith(
        { id: accessToken.id, name: undefined, scopes: [], expiresAt: null },
        expect.anything(),
    );
});
