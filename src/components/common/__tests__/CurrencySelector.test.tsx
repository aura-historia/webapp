import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CurrencySelector } from "@/components/common/CurrencySelector.tsx";
import { UserPreferencesProvider } from "@/hooks/preferences/useUserPreferences.tsx";

// Mock external dependencies
vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: vi.fn(() => ({ user: null })),
}));

vi.mock("@/hooks/account/usePatchUserAccount.ts", () => ({
    useUpdateUserAccount: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/hooks/account/useUserAccount.ts", () => ({
    useUserAccount: vi.fn(() => ({ data: undefined })),
}));

vi.mock("react-i18next", async () => {
    const actual = await vi.importActual("react-i18next");
    return {
        ...actual,
        useTranslation: () => ({ i18n: { language: "en" } }),
    };
});

function renderCurrencySelector(initialPreferences: Record<string, unknown> = {}) {
    return render(
        <UserPreferencesProvider initialPreferences={initialPreferences}>
            <CurrencySelector />
        </UserPreferencesProvider>,
    );
}

describe("CurrencySelector", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("shows EUR as default", () => {
        renderCurrencySelector();
        expect(screen.getByText("€")).toBeInTheDocument();
    });

    it("shows initial currency from preferences", () => {
        renderCurrencySelector({ currency: "GBP" });
        expect(screen.getByText("£")).toBeInTheDocument();
    });

    it("renders all currencies in dropdown", () => {
        renderCurrencySelector();
        fireEvent.click(screen.getByRole("combobox"));
        expect(screen.getAllByText("Euro")[0]).toBeInTheDocument();
        expect(screen.getByText("British Pound")).toBeInTheDocument();
        expect(screen.getByText("US Dollar")).toBeInTheDocument();
    });

    it("saves selected currency to localStorage", () => {
        renderCurrencySelector();
        fireEvent.click(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("US Dollar"));
        const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
        expect(stored.currency).toBe("USD");
    });

    it("syncs backend currency to localStorage on login", async () => {
        const { useUserAccount } = await import("@/hooks/account/useUserAccount.ts");
        vi.mocked(useUserAccount).mockReturnValue({ data: { currency: "GBP" } } as never);

        renderCurrencySelector();

        await waitFor(() => {
            const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
            expect(stored.currency).toBe("GBP");
        });
    });

    it("calls updateAccount when logged in and currency changes", async () => {
        const mutate = vi.fn();
        const { useUpdateUserAccount } = vi.mocked(
            await import("@/hooks/account/usePatchUserAccount.ts"),
        );
        useUpdateUserAccount.mockReturnValue({ mutate } as never);

        const { useAuthenticator } = vi.mocked(await import("@aws-amplify/ui-react"));
        useAuthenticator.mockReturnValue({ user: { username: "test" } } as never);

        renderCurrencySelector();
        fireEvent.click(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("US Dollar"));

        expect(mutate).toHaveBeenCalledWith({ currency: "USD" });
    });
});
