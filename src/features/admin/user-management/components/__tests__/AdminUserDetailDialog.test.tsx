import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminUserDetailDialog } from "../AdminUserDetailDialog.tsx";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), remove: vi.fn() }));
vi.mock("@/client", () => ({
    adminGetUser: api.get,
    adminPatchUser: api.patch,
    adminDeleteUser: api.remove,
}));

const account = {
    userId: "usr_01",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: "Lovelace",
    language: "en",
    currency: "EUR",
    measurementUnit: "METRIC",
    showUnassessedOrSensitiveContent: false,
    tier: "FREE",
    role: "USER",
};

function renderDialog(props: Partial<Parameters<typeof AdminUserDetailDialog>[0]> = {}) {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const onOpenChange = vi.fn();
    render(
        createElement(
            QueryClientProvider,
            { client },
            <AdminUserDetailDialog userId="usr_01" onOpenChange={onOpenChange} {...props} />,
        ),
    );
    return { onOpenChange };
}

describe("AdminUserDetailDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

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
        expect(
            screen.getByRole("button", { name: testI18n.t("adminUsers.detail.close") }),
        ).toBeInTheDocument();
        expect(api.get).toHaveBeenCalledWith({
            path: { userId: "opaque/user+01" },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
    });

    it("offers every supported currency and patches a newly supported one", async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: account, response: { status: 200, ok: true } });
        api.patch.mockResolvedValue({
            data: { ...account, currency: "SEK" },
            response: { status: 200, ok: true },
        });
        renderDialog();

        const currency = await screen.findByLabelText(testI18n.t("adminUsers.fields.currency"));
        // 29 currencies plus the "not set" option.
        expect(currency.querySelectorAll("option")).toHaveLength(30);
        await user.selectOptions(currency, "SEK");
        await user.click(
            screen.getByRole("button", { name: testI18n.t("adminUsers.actions.saveProfile") }),
        );

        await waitFor(() =>
            expect(api.patch).toHaveBeenCalledWith({
                path: { userId: "usr_01" },
                body: { currency: "SEK" },
                cache: "no-store",
            }),
        );
    });

    it("renders the security controls for the displayed user", async () => {
        api.get.mockResolvedValue({ data: account, response: { status: 200, ok: true } });
        const renderSecurityActions = vi.fn((userId: string) => <p>controls for {userId}</p>);

        renderDialog({ renderSecurityActions });

        expect(await screen.findByText("controls for usr_01")).toBeInTheDocument();
        expect(renderSecurityActions).toHaveBeenCalledWith("usr_01");
    });

    it("deletes the user after confirmation and closes the dialog", async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: account, response: { status: 200, ok: true } });
        api.remove.mockResolvedValue({ response: { status: 204, ok: true } });
        const { onOpenChange } = renderDialog();

        await user.click(
            await screen.findByRole("button", { name: testI18n.t("adminUsers.actions.delete") }),
        );
        await user.click(
            screen.getByRole("button", { name: testI18n.t("adminUsers.actions.confirmDelete") }),
        );

        await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
        expect(api.remove).toHaveBeenCalledWith({ path: { userId: "usr_01" }, cache: "no-store" });
    });

    it("keeps the dialog open and shows the error when deletion fails", async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: account, response: { status: 200, ok: true } });
        api.remove.mockResolvedValue({ error: {}, response: { status: 500, ok: false } });
        const { onOpenChange } = renderDialog();

        await user.click(
            await screen.findByRole("button", { name: testI18n.t("adminUsers.actions.delete") }),
        );
        await user.click(
            screen.getByRole("button", { name: testI18n.t("adminUsers.actions.confirmDelete") }),
        );

        await waitFor(() => expect(api.remove).toHaveBeenCalledTimes(1));
        expect(await screen.findByRole("alert")).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();
    });
});
