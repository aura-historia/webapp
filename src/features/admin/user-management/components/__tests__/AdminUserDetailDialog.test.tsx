import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminUserDetailDialog } from "../AdminUserDetailDialog.tsx";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), remove: vi.fn() }));
vi.mock("@/client", () => ({
    adminGetUser: api.get,
    adminPatchUser: api.patch,
    adminDeleteUser: api.remove,
}));

describe("AdminUserDetailDialog", () => {
    it("renders documented account fields without legacy audit or address fields", async () => {
        api.get.mockResolvedValue({
            data: {
                userId: "opaque/user+01",
                email: "ada@example.test",
                firstName: "Ada",
                lastName: null,
                language: "en",
                currency: "EUR",
                measurementUnit: "METRIC",
                showUnassessedOrSensitiveContent: true,
                tier: "PRO",
                role: "USER",
                created: "2020-01-01T00:00:00.000Z",
                updated: "2026-01-01T00:00:00.000Z",
                structuredAddress: { city: "London" },
            },
            response: { status: 200, ok: true },
        });
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        render(
            createElement(
                QueryClientProvider,
                { client },
                <AdminUserDetailDialog userId="opaque/user+01" onOpenChange={vi.fn()} />,
            ),
        );

        await waitFor(() =>
            expect(screen.getByDisplayValue("ada@example.test")).toBeInTheDocument(),
        );
        expect(screen.getByText("opaque/user+01")).toBeInTheDocument();
        expect(screen.getByLabelText(testI18n.t("adminUsers.fields.language"))).toHaveValue("en");
        expect(screen.getByLabelText(testI18n.t("adminUsers.fields.currency"))).toHaveValue("EUR");
        expect(screen.queryByText(testI18n.t("adminUsers.sort.created"))).not.toBeInTheDocument();
        expect(screen.queryByText(testI18n.t("adminUsers.sort.updated"))).not.toBeInTheDocument();
        expect(screen.queryByText(/address/i)).not.toBeInTheDocument();
        expect(api.get).toHaveBeenCalledWith({
            path: { userId: "opaque/user+01" },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
    });
});
