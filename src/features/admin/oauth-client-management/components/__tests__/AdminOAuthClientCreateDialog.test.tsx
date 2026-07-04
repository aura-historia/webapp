import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminOAuthClientCreateDialog } from "../AdminOAuthClientCreateDialog.tsx";

const mockMutate = vi.hoisted(() => vi.fn());

async function completeRequiredFields(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Client-Name"), "Example Client");
    await user.type(screen.getByLabelText("Client-URL"), "https://example.com");
    await user.type(screen.getByLabelText("Logo-URL"), "https://example.com/logo.png");
    await user.type(screen.getByLabelText("AGB-URL"), "https://example.com/tos");
    await user.type(
        screen.getByLabelText("Datenschutzerklärungs-URL"),
        "https://example.com/privacy",
    );
    await user.type(screen.getByLabelText("Redirect-URIs"), "https://example.com/callback");
}

vi.mock("@/features/admin/oauth-client-management/hooks/useAdminOAuthClientActions.ts", () => ({
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

        await completeRequiredFields(user);
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

    it("shows copyable credentials after creating a client", async () => {
        const user = userEvent.setup();
        mockMutate.mockImplementation((_input, { onSuccess }) => {
            onSuccess({
                clientId: "client-123",
                clientSecret: "secret-456",
                clientName: "Example Client",
                clientUri: "https://example.com",
                logoUri: "https://example.com/logo.png",
                tosUri: "https://example.com/tos",
                policyUri: "https://example.com/privacy",
                redirectUris: ["https://example.com/callback"],
                scope: [],
                createdAt: new Date("2024-01-01T00:00:00Z"),
            });
        });

        render(<AdminOAuthClientCreateDialog open onOpenChange={vi.fn()} />);

        await completeRequiredFields(user);
        await user.click(screen.getByRole("button", { name: "Client anlegen" }));

        expect(
            screen.getByRole("heading", { name: "OAuth-Client erfolgreich angelegt" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Kopieren Sie die Client-ID und das Client-Secret und bewahren Sie beide sicher auf. Das Client-Secret wird nur einmal angezeigt.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("client-123")).toBeInTheDocument();
        expect(screen.getByDisplayValue("secret-456")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Link kopieren" })).toHaveLength(2);
        expect(screen.getByRole("button", { name: "Schließen" })).toBeInTheDocument();
    });
});
