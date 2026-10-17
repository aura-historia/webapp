import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth";
import { useCurrencyPreference } from "@/features/preferences/hooks/useCurrencyPreference.ts";
import { useUnitSystemPreference } from "@/features/preferences/hooks/useUnitSystemPreference.ts";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";

vi.mock("@/features/authentication/hooks/useResolvedAuth", () => ({
    useResolvedAuth: vi.fn(),
}));

vi.mock("@/features/account-management/hooks/usePatchUserAccount.ts", () => ({
    useUpdateUserAccount: vi.fn(),
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: vi.fn(),
}));

function wrapper({ children }: { readonly children: ReactNode }) {
    return (
        <UserPreferencesProvider initialPreferences={{}} locale="de-DE">
            {children}
        </UserPreferencesProvider>
    );
}

function storedPreferences(): Record<string, unknown> {
    return JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
}

function signIn(isAuthenticated: boolean) {
    vi.mocked(useResolvedAuth).mockReturnValue({
        user: isAuthenticated ? { userId: "test", username: "test" } : null,
        isAuthenticated,
        isLoading: false,
        isResolved: true,
        signOut: vi.fn(),
    } as never);
}

describe("locale preference hooks", () => {
    let mutate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        mutate = vi.fn();
        signIn(false);
        vi.mocked(useUpdateUserAccount).mockReturnValue({ mutate } as never);
        vi.mocked(useUserAccount).mockReturnValue({ data: undefined } as never);
    });

    describe("useCurrencyPreference", () => {
        it("defaults to EUR", () => {
            const { result } = renderHook(() => useCurrencyPreference(), { wrapper });

            expect(result.current.currency).toBe("EUR");
        });

        it("stores a new currency locally without touching the account when signed out", () => {
            const { result } = renderHook(() => useCurrencyPreference(), { wrapper });

            act(() => result.current.setCurrency("USD"));

            expect(result.current.currency).toBe("USD");
            expect(storedPreferences().currency).toBe("USD");
            expect(mutate).not.toHaveBeenCalled();
        });

        it("saves a new currency to the account when signed in", () => {
            signIn(true);
            const { result } = renderHook(() => useCurrencyPreference(), { wrapper });

            act(() => result.current.setCurrency("KRW"));

            expect(mutate).toHaveBeenCalledWith({ currency: "KRW" });
        });

        it("adopts the account currency on sign-in", async () => {
            vi.mocked(useUserAccount).mockReturnValue({ data: { currency: "GBP" } } as never);
            const { result } = renderHook(() => useCurrencyPreference(), { wrapper });

            await waitFor(() => expect(result.current.currency).toBe("GBP"));
            expect(storedPreferences().currency).toBe("GBP");
        });
    });

    describe("useUnitSystemPreference", () => {
        it("stores a new unit system and saves it to the account when signed in", () => {
            signIn(true);
            const { result } = renderHook(() => useUnitSystemPreference(), { wrapper });

            act(() => result.current.setUnitSystem("IMPERIAL"));

            expect(result.current.unitSystem).toBe("IMPERIAL");
            expect(storedPreferences().unitSystem).toBe("IMPERIAL");
            expect(mutate).toHaveBeenCalledWith({ unitSystem: "IMPERIAL" });
        });

        it("adopts the account unit system on sign-in", async () => {
            vi.mocked(useUserAccount).mockReturnValue({
                data: { unitSystem: "IMPERIAL" },
            } as never);
            const { result } = renderHook(() => useUnitSystemPreference(), { wrapper });

            await waitFor(() => expect(result.current.unitSystem).toBe("IMPERIAL"));
        });
    });
});
