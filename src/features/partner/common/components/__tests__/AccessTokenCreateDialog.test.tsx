import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { AccessTokenCreateDialog } from "@/features/partner/common/components/AccessTokenCreateDialog.tsx";

const mockCreateAccessTokenMutate = vi.hoisted(() => vi.fn());

vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useCreateAccessToken: () => ({
        mutate: mockCreateAccessTokenMutate,
        isPending: false,
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
        render(<AccessTokenCreateDialog open onOpenChange={vi.fn()} />);

        await user.type(screen.getByLabelText("Name"), "Product sync");
        await user.click(screen.getByLabelText("Produkte schreiben"));
        await user.type(screen.getByLabelText("Ablaufzeitpunkt"), "2026-08-01T12:00");
        await user.click(screen.getByRole("button", { name: "Token erstellen" }));

        expect(mockCreateAccessTokenMutate).toHaveBeenCalledWith(
            {
                name: "Product sync",
                scopes: ["products:write"],
                expiresAt: new Date("2026-08-01T12:00"),
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
    });
});
