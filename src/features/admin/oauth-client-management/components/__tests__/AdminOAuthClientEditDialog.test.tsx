import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminOAuthClientEditDialog } from "../AdminOAuthClientEditDialog.tsx";

const mockMutate = vi.hoisted(() => vi.fn());

vi.mock("@/features/admin/oauth-client-management/hooks/useAdminOAuthClientActions.ts", () => ({
    usePatchOAuthClient: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
    },
}));

const client = {
    clientId: "client-123",
    clientSecret: "secret-123",
    clientName: "Example Client",
    tosUri: "https://example.com/tos",
    policyUri: "https://example.com/privacy",
    clientUri: "https://example.com",
    logoUri: "https://example.com/logo.png",
    redirectUris: ["https://example.com/callback"],
    scope: ["shops:manage", "products:write"] as const,
    createdAt: new Date("2024-01-01T00:00:00Z"),
};

describe("AdminOAuthClientEditDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads and submits the additional oauth client metadata fields", async () => {
        const user = userEvent.setup();

        render(<AdminOAuthClientEditDialog client={client} open onOpenChange={vi.fn()} />);

        expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
        expect(screen.getByDisplayValue("https://example.com/logo.png")).toBeInTheDocument();
        expect(screen.getByDisplayValue("https://example.com/tos")).toBeInTheDocument();
        expect(screen.getByDisplayValue("https://example.com/privacy")).toBeInTheDocument();

        await user.clear(screen.getByLabelText("Client-URL"));
        await user.type(screen.getByLabelText("Client-URL"), "https://example.org");

        await user.click(screen.getByRole("button", { name: "Speichern" }));

        expect(mockMutate).toHaveBeenCalledWith(
            {
                clientId: "client-123",
                clientName: "Example Client",
                clientUri: "https://example.org",
                logoUri: "https://example.com/logo.png",
                tosUri: "https://example.com/tos",
                policyUri: "https://example.com/privacy",
                redirectUris: ["https://example.com/callback"],
                scope: ["shops:manage", "products:write"],
            },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });
});
