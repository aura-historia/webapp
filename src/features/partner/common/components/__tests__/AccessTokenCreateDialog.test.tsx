import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";
import {
    ACCESS_TOKEN_SCOPE_GROUPS,
    ACCESS_TOKEN_SCOPE_METADATA,
    ACCESS_TOKEN_SCOPES,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import testI18n from "@/i18n/i18nForTests.ts";

const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());
const mockReset = vi.hoisted(() => vi.fn());

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

    it("offers every supported scope in labelled groups with none selected", () => {
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);

        for (const group of ACCESS_TOKEN_SCOPE_GROUPS) {
            expect(
                screen.getByRole("group", { name: testI18n.t(group.label) }),
            ).toBeInTheDocument();
        }
        expect(screen.getAllByRole("checkbox")).toHaveLength(ACCESS_TOKEN_SCOPES.length);
        for (const scope of ACCESS_TOKEN_SCOPES) {
            expect(
                screen.getByLabelText(testI18n.t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)),
            ).not.toBeChecked();
        }
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
                    onSuccess?: (createdToken: {
                        accessToken: {
                            id: string;
                            name: string;
                            scopes: never[];
                            tokenType: "BEARER";
                            expiresAt: null;
                            created: Date;
                            updated: Date;
                        };
                        plaintextToken: string;
                    }) => void;
                },
            ) => {
                options?.onSuccess?.({
                    accessToken: {
                        id: "token-1",
                        name: "Product sync",
                        scopes: [],
                        tokenType: "BEARER",
                        expiresAt: null,
                        created: new Date("2026-07-06T10:00:00Z"),
                        updated: new Date("2026-07-06T10:00:00Z"),
                    },
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
