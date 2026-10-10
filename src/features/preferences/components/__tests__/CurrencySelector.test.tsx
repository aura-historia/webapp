import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CurrencySelector } from "@/features/preferences/components/CurrencySelector.tsx";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/data/internal/common/Currency.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";

// Mock external dependencies
vi.mock("@/features/authentication/hooks/useResolvedAuth", () => ({
    useResolvedAuth: vi.fn(() => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isResolved: true,
        signOut: vi.fn(),
    })),
}));

vi.mock("@/features/account-management/hooks/usePatchUserAccount.ts", () => ({
    useUpdateUserAccount: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: vi.fn(() => ({ data: undefined })),
}));

vi.mock("react-i18next", async () => {
    const actual = await vi.importActual("react-i18next");
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string) => key,
            i18n: { language: "en" },
        }),
    };
});

function renderCurrencySelector(initialPreferences: Record<string, unknown> = {}) {
    return render(
        <UserPreferencesProvider initialPreferences={initialPreferences} locale="de-DE">
            <CurrencySelector />
        </UserPreferencesProvider>,
    );
}

describe("CurrencySelector", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.mocked(useResolvedAuth).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isResolved: true,
            signOut: vi.fn(),
        } as never);
        vi.mocked(useUpdateUserAccount).mockReturnValue({ mutate: vi.fn() } as never);
        vi.mocked(useUserAccount).mockReturnValue({ data: undefined } as never);
    });

    function authenticateWithMutate() {
        const mutate = vi.fn();
        vi.mocked(useUpdateUserAccount).mockReturnValue({ mutate } as never);
        vi.mocked(useResolvedAuth).mockReturnValue({
            user: { userId: "test", username: "test" },
            isAuthenticated: true,
            isLoading: false,
            isResolved: true,
            signOut: vi.fn(),
        } as never);
        return mutate;
    }

    function openAndSearch(query: string) {
        fireEvent.click(screen.getByRole("button"));
        fireEvent.change(screen.getByRole("combobox"), { target: { value: query } });
    }

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
        fireEvent.click(screen.getByRole("button"));

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(CURRENCIES.length);

        expect(screen.getAllByText("Euro")[0]).toBeInTheDocument();
        expect(screen.getByText("British Pound")).toBeInTheDocument();
        expect(screen.getByText("US Dollar")).toBeInTheDocument();
        expect(screen.getByText("Australian Dollar")).toBeInTheDocument();
        expect(screen.getByText("Canadian Dollar")).toBeInTheDocument();
        expect(screen.getByText("New Zealand Dollar")).toBeInTheDocument();
        expect(screen.getByText("Chinese Yuan")).toBeInTheDocument();
        expect(screen.getByText("Brazilian Real")).toBeInTheDocument();
        expect(screen.getByText("Polish Zloty")).toBeInTheDocument();
        expect(screen.getByText("Turkish Lira")).toBeInTheDocument();
        expect(screen.getByText("Japanese Yen")).toBeInTheDocument();
        expect(screen.getByText("Czech Koruna")).toBeInTheDocument();
        expect(screen.getByText("Russian Ruble")).toBeInTheDocument();
        expect(screen.getByText("United Arab Emirates Dirham")).toBeInTheDocument();
        expect(screen.getByText("Saudi Riyal")).toBeInTheDocument();
        expect(screen.getByText("Hong Kong Dollar")).toBeInTheDocument();
        expect(screen.getByText("Singapore Dollar")).toBeInTheDocument();
        expect(screen.getByText("Swiss Franc")).toBeInTheDocument();
    });

    it("saves selected currency to localStorage", () => {
        renderCurrencySelector();
        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText("US Dollar"));
        const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
        expect(stored.currency).toBe("USD");
    });

    it("syncs backend currency to localStorage on login", async () => {
        const { useUserAccount } = await import(
            "@/features/account-management/hooks/useUserAccount.ts"
        );
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
            await import("@/features/account-management/hooks/usePatchUserAccount.ts"),
        );
        useUpdateUserAccount.mockReturnValue({ mutate } as never);

        const { useResolvedAuth } = vi.mocked(
            await import("@/features/authentication/hooks/useResolvedAuth"),
        );
        useResolvedAuth.mockReturnValue({
            user: { userId: "test", username: "test" },
            isAuthenticated: true,
            isLoading: false,
            isResolved: true,
            signOut: vi.fn(),
        } as never);

        renderCurrencySelector();
        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText("US Dollar"));

        expect(mutate).toHaveBeenCalledWith({ currency: "USD" });
    });

    it("renders one option per supported currency, in catalogue order, with its symbol", () => {
        renderCurrencySelector();
        fireEvent.click(screen.getByRole("button"));

        const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(29);
        CURRENCIES.forEach((code, index) => {
            expect(options[index]).toHaveTextContent(CURRENCY_SYMBOLS[code]);
            expect(options[index]).toHaveTextContent(displayNames.of(code) ?? code);
        });
    });

    it.each([
        ["South African Rand"],
        ["Swedish Krona"],
        ["Danish Krone"],
        ["Norwegian Krone"],
        ["South Korean Won"],
        ["Indian Rupee"],
        ["New Taiwan Dollar"],
        ["Hungarian Forint"],
        ["Romanian Leu"],
        ["Mexican Peso"],
        ["Thai Baht"],
    ])("renders the new currency option %s", (label) => {
        renderCurrencySelector();
        fireEvent.click(screen.getByRole("button"));

        expect(screen.getByRole("option", { name: new RegExp(label) })).toBeInTheDocument();
    });

    it("finds a new currency by its ISO code", () => {
        renderCurrencySelector();
        openAndSearch("sek");

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent("Swedish Krona");
    });

    it("finds a new currency by its localized display name", () => {
        renderCurrencySelector();
        openAndSearch("korean won");

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent("South Korean Won");
    });

    it("finds a new currency by its display symbol", () => {
        renderCurrencySelector();
        openAndSearch("₩");

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent("South Korean Won");
    });

    it("shows the empty message for an unsupported code", () => {
        renderCurrencySelector();
        openAndSearch("xyz");

        expect(screen.queryAllByRole("option")).toHaveLength(0);
        expect(screen.getByText("common.currencySearchEmpty")).toBeInTheDocument();
    });

    it.each([
        ["SEK", "Swedish Krona"],
        ["KRW", "South Korean Won"],
    ])("stores %s in preferences when selected while signed out", (code, label) => {
        renderCurrencySelector();
        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText(label));

        const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
        expect(stored.currency).toBe(code);
        expect(screen.getByRole("button")).toHaveTextContent(label);
        const mutate = vi.mocked(useUpdateUserAccount).mock.results[0]?.value.mutate;
        expect(mutate).not.toHaveBeenCalled();
    });

    it.each([
        ["SEK", "Swedish Krona"],
        ["KRW", "South Korean Won"],
    ])("patches the account with %s when signed in", (code, label) => {
        const mutate = authenticateWithMutate();

        renderCurrencySelector();
        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText(label));

        expect(mutate).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenCalledWith({ currency: code });
        const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
        expect(stored.currency).toBe(code);
    });

    it("syncs a new backend currency into preferences without falling back to EUR", async () => {
        vi.mocked(useUserAccount).mockReturnValue({ data: { currency: "KRW" } } as never);

        renderCurrencySelector();

        await waitFor(() => {
            const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
            expect(stored.currency).toBe("KRW");
        });
        expect(screen.getByRole("button")).toHaveTextContent("₩");
        expect(screen.getByRole("button")).toHaveTextContent("South Korean Won");
        expect(screen.queryByText("€")).not.toBeInTheDocument();
    });
});
