import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminOAuthClientCreateDialog } from "../AdminOAuthClientCreateDialog.tsx";

const mockMutate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminOAuthClientActions.ts", () => ({
    useCreateOAuthClient: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
    },
}));

describe("AdminOAuthClientCreateDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("submits the additional oauth client metadata fields", async () => {
        const user = userEvent.setup();

        render(<AdminOAuthClientCreateDialog open onOpenChange={vi.fn()} />);

        await user.type(screen.getByLabelText("Client-Name"), "Example Client");
        await user.type(screen.getByLabelText("Client-URL"), "https://example.com");
        await user.type(screen.getByLabelText("Logo-URL"), "https://example.com/logo.png");
        await user.type(screen.getByLabelText("AGB-URL"), "https://example.com/tos");
        await user.type(
            screen.getByLabelText("Datenschutzerklärungs-URL"),
            "https://example.com/privacy",
        );
        await user.type(screen.getByLabelText("Redirect-URIs"), "https://example.com/callback");

        await user.click(screen.getByRole("button", { name: "Client anlegen" }));

        expect(mockMutate).toHaveBeenCalledWith(
            {
                clientName: "Example Client",
                clientUri: "https://example.com",
                logoUri: "https://example.com/logo.png",
                tosUri: "https://example.com/tos",
                policyUri: "https://example.com/privacy",
                redirectUris: ["https://example.com/callback"],
                scope: [],
            },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });
});
