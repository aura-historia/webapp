import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";
import {
    ACCESS_TOKEN_SCOPE_GROUPS,
    ACCESS_TOKEN_SCOPE_METADATA,
    ACCESS_TOKEN_SCOPES,
    accessTokenScopeGroupsFor,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import testI18n from "@/i18n/i18nForTests.ts";

const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockReset = vi.hoisted(() => vi.fn());
const mockUserAccount = vi.hoisted(() => ({ role: "USER" as "USER" | "ADMIN" }));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { role: mockUserAccount.role } }),
}));

vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useCreateAccessToken: () => ({
        mutate: mockCreateAccessTokenMutate,
        isPending: false,
        reset: mockReset,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
    },
}));

describe("AccessTokenCreateDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserAccount.role = "USER";
    });

    it("validates the required token name", async () => {
        const user = userEvent.setup();
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: "Token erstellen" }));

        expect(screen.getByText("Bitte geben Sie einen Token-Namen ein.")).toBeInTheDocument();
        expect(mockCreateAccessTokenMutate).not.toHaveBeenCalled();
    });

    it("submits optional scopes and expiration", async () => {
        const user = userEvent.setup();
        render(
            <AccessTokenCreateDialog
                open
                onOpenChange={vi.fn()}
                defaultValues={{ name: "", scopes: [], expiresAt: "2026-08-01T00:00" }}
            />,
        );
        expect(screen.getByLabelText("Listing-Quellen verwalten")).not.toBeChecked();

        await user.type(screen.getByLabelText("Name"), "Product sync");
        await user.click(screen.getByLabelText("Produktangebote schreiben"));
        await user.click(screen.getByLabelText("Ablaufzeitpunkt"));
        await user.click(screen.getByRole("button", { name: "Sonntag, 2. August 2026" }));
        await user.click(screen.getByRole("combobox", { name: "Stunde" }));
        await user.click(screen.getByRole("option", { name: "12" }));
        await user.click(screen.getByRole("combobox", { name: "Minute" }));
        await user.click(screen.getByRole("option", { name: "37" }));
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));

        expect(mockCreateAccessTokenMutate).toHaveBeenCalledWith(
            {
                name: "Product sync",
                scopes: ["product-listings:write"],
                expiresAt: new Date("2026-08-02T12:37"),
            },
            { onSuccess: expect.any(Function) },
        );
    });

    it("clears a chosen expiration so creation remains optional", async () => {
        const user = userEvent.setup();
        render(
            <AccessTokenCreateDialog
                open
                onOpenChange={vi.fn()}
                defaultValues={{ name: "No expiry", scopes: [], expiresAt: "2026-08-01T12:00" }}
            />,
        );
        await user.click(screen.getByRole("button", { name: "Ablaufzeitpunkt entfernen" }));
        expect(screen.getByRole("combobox", { name: "Stunde" })).toBeDisabled();
        expect(screen.getByRole("combobox", { name: "Minute" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));
        expect(mockCreateAccessTokenMutate).toHaveBeenCalledWith(
            { name: "No expiry", scopes: [], expiresAt: undefined },
            { onSuccess: expect.any(Function) },
        );
    });

    it("grants ingestion configuration access only when explicitly selected", async () => {
        const user = userEvent.setup();
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);
        await user.type(screen.getByLabelText("Name"), "Ingestion configuration");
        await user.click(screen.getByLabelText("Listing-Quellen verwalten"));
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));

        expect(mockCreateAccessTokenMutate).toHaveBeenCalledWith(
            {
                name: "Ingestion configuration",
                scopes: ["listing-sources:write"],
                expiresAt: undefined,
            },
            { onSuccess: expect.any(Function) },
        );
    });

    it("offers every supported scope to administrators in labelled groups with none selected", () => {
        mockUserAccount.role = "ADMIN";
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);

        for (const group of ACCESS_TOKEN_SCOPE_GROUPS) {
            const label = "administratorLabel" in group ? group.administratorLabel : group.label;
            expect(screen.getByRole("group", { name: testI18n.t(label) })).toBeInTheDocument();
        }
        // One checkbox per scope plus the select-all control.
        expect(screen.getAllByRole("checkbox")).toHaveLength(ACCESS_TOKEN_SCOPES.length + 1);
        for (const scope of ACCESS_TOKEN_SCOPES) {
            expect(
                screen.getByLabelText(testI18n.t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)),
            ).not.toBeChecked();
        }
    });

    it("offers administrator-only scopes to administrator accounts only", () => {
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);

        const visibleScopes = accessTokenScopeGroupsFor(false).flatMap((group) => group.scopes);
        expect(visibleScopes).not.toContain("auctions:read");
        expect(
            screen.queryByRole("group", {
                name: testI18n.t("partnerAccessTokens.scopeGroups.administration"),
            }),
        ).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Auktionen lesen")).not.toBeInTheDocument();
        expect(screen.getAllByRole("checkbox")).toHaveLength(visibleScopes.length + 1);
        expect(screen.getByText(`0 von ${visibleScopes.length} ausgewählt`)).toBeInTheDocument();
    });

    it("selects and clears every visible scope at once, without administrator scopes", async () => {
        const user = userEvent.setup();
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);
        const selectAll = screen.getByRole("checkbox", { name: "Alle Berechtigungen auswählen" });
        const visibleScopes = accessTokenScopeGroupsFor(false).flatMap((group) => group.scopes);

        await user.click(screen.getByLabelText("Merkliste lesen"));
        expect(selectAll).toHaveAttribute("data-state", "indeterminate");

        await user.click(selectAll);
        expect(selectAll).toBeChecked();
        expect(screen.getByText(/Dieses Token erhält jede Berechtigung/)).toBeInTheDocument();

        await user.type(screen.getByLabelText("Name"), "Everything");
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));
        expect(mockCreateAccessTokenMutate).toHaveBeenLastCalledWith(
            { name: "Everything", scopes: visibleScopes, expiresAt: undefined },
            { onSuccess: expect.any(Function) },
        );
    });

    it("clears every scope when all are selected", async () => {
        const user = userEvent.setup();
        mockUserAccount.role = "ADMIN";
        render(
            <AccessTokenCreateDialog
                open
                onOpenChange={vi.fn()}
                defaultValues={{ name: "All", scopes: [...ACCESS_TOKEN_SCOPES], expiresAt: "" }}
            />,
        );
        const selectAll = screen.getByRole("checkbox", { name: "Alle Berechtigungen auswählen" });
        expect(selectAll).toBeChecked();

        await user.click(selectAll);
        expect(selectAll).not.toBeChecked();
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));
        expect(mockCreateAccessTokenMutate).toHaveBeenCalledWith(
            { name: "All", scopes: [], expiresAt: undefined },
            { onSuccess: expect.any(Function) },
        );
    });

    it("selects and clears one group at a time", async () => {
        const user = userEvent.setup();
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);
        const groupLabel = testI18n.t("partnerAccessTokens.scopeGroups.account");

        await user.click(screen.getByRole("button", { name: `Alle in ${groupLabel} auswählen` }));
        for (const label of [
            "Benutzerdaten lesen",
            "Benutzerdaten aktualisieren",
            "Zugriffstoken lesen",
            "Zugriffstoken verwalten",
        ]) {
            expect(screen.getByLabelText(label)).toBeChecked();
        }
        expect(screen.getByLabelText("Merkliste lesen")).not.toBeChecked();

        await user.click(screen.getByRole("button", { name: `Alle in ${groupLabel} abwählen` }));
        expect(screen.getByLabelText("Benutzerdaten lesen")).not.toBeChecked();
        expect(
            screen.getByRole("checkbox", { name: "Alle Berechtigungen auswählen" }),
        ).not.toBeChecked();
    });

    it("keeps write scopes independent of their read siblings", async () => {
        const user = userEvent.setup();
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);
        await user.type(screen.getByLabelText("Name"), "Saved searches");
        await user.click(screen.getByLabelText("Gespeicherte Suchen verwalten"));
        await user.click(screen.getByLabelText("Benachrichtigungen lesen"));

        expect(screen.getByLabelText("Gespeicherte Suchen lesen")).not.toBeChecked();
        expect(screen.getByLabelText("Benachrichtigungen verwalten")).not.toBeChecked();

        await user.click(screen.getByRole("button", { name: "Token erstellen" }));

        expect(mockCreateAccessTokenMutate).toHaveBeenCalledWith(
            {
                name: "Saved searches",
                scopes: ["search-filters:write", "notifications:read"],
                expiresAt: undefined,
            },
            { onSuccess: expect.any(Function) },
        );
    });

    it("shows and copies the plaintext token after creation", async () => {
        const user = userEvent.setup();
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        mockCreateAccessTokenMutate.mockImplementation(
            (
                _input: unknown,
                options?: {
                    onSuccess?: (createdToken: { id: string; plaintextToken: string }) => void;
                },
            ) => {
                options?.onSuccess?.({
                    id: "token-1",
                    plaintextToken: "aurahistoria_plaintext_token",
                });
            },
        );
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);

        await user.type(screen.getByLabelText("Name"), "Product sync");
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));

        expect(screen.getByRole("heading", { name: "Zugriffstoken erstellt" })).toBeInTheDocument();
        expect(screen.getByDisplayValue("aurahistoria_plaintext_token")).toBeInTheDocument();
        expect(
            screen.getByText(/Dieses Token wird nur einmal im Klartext angezeigt/),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Zugriffstoken kopieren" }));

        expect(writeText).toHaveBeenCalledWith("aurahistoria_plaintext_token");
        expect(toast.success).toHaveBeenCalledWith("Zugriffstoken wurde kopiert.");

        await user.click(screen.getByRole("button", { name: "Ich habe das Token gespeichert" }));
        expect(mockReset).toHaveBeenCalledOnce();
        expect(screen.queryByDisplayValue("aurahistoria_plaintext_token")).not.toBeInTheDocument();
    });
});
