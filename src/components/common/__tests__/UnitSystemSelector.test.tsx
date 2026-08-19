import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnitSystemSelector } from "@/components/common/UnitSystemSelector.tsx";
import { UserPreferencesProvider } from "@/hooks/preferences/useUserPreferences.tsx";
import { UNIT_SYSTEMS } from "@/data/internal/common/UnitSystem.ts";

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
        useTranslation: () => ({
            t: (key: string) => key,
            i18n: { language: "en" },
        }),
    };
});

function renderUnitSystemSelector(initialPreferences: Record<string, unknown> = {}) {
    return render(
        <UserPreferencesProvider initialPreferences={initialPreferences} locale="de-DE">
            <UnitSystemSelector />
        </UserPreferencesProvider>,
    );
}

describe("UnitSystemSelector", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("shows METRIC as default, prefixed with the unit system label", () => {
        renderUnitSystemSelector();
        expect(
            screen.getByText("common.unitSystemPrefix: auth.unitSystems.METRIC"),
        ).toBeInTheDocument();
    });

    it("shows initial unit system from preferences, prefixed with the unit system label", () => {
        renderUnitSystemSelector({ unitSystem: "IMPERIAL" });
        expect(
            screen.getByText("common.unitSystemPrefix: auth.unitSystems.IMPERIAL"),
        ).toBeInTheDocument();
    });

    it("renders all unit systems in dropdown", () => {
        renderUnitSystemSelector();
        fireEvent.click(screen.getByRole("combobox"));

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(UNIT_SYSTEMS.length);

        expect(screen.getByText("auth.unitSystems.IMPERIAL")).toBeInTheDocument();
    });

    it("saves selected unit system to localStorage", () => {
        renderUnitSystemSelector();
        fireEvent.click(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("auth.unitSystems.IMPERIAL"));
        const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
        expect(stored.unitSystem).toBe("IMPERIAL");
    });

    it("syncs backend unit system to localStorage on login", async () => {
        const { useUserAccount } = await import("@/hooks/account/useUserAccount.ts");
        vi.mocked(useUserAccount).mockReturnValue({ data: { unitSystem: "IMPERIAL" } } as never);

        renderUnitSystemSelector();

        await waitFor(() => {
            const stored = JSON.parse(localStorage.getItem("user-preferences") ?? "{}");
            expect(stored.unitSystem).toBe("IMPERIAL");
        });
    });

    it("calls updateAccount when logged in and unit system changes", async () => {
        const { useUserAccount } = await import("@/hooks/account/useUserAccount.ts");
        vi.mocked(useUserAccount).mockReturnValue({ data: undefined } as never);

        const mutate = vi.fn();
        const { useUpdateUserAccount } = vi.mocked(
            await import("@/hooks/account/usePatchUserAccount.ts"),
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

        renderUnitSystemSelector();
        fireEvent.click(screen.getByRole("combobox"));
        fireEvent.click(screen.getByText("auth.unitSystems.IMPERIAL"));

        expect(mutate).toHaveBeenCalledWith({ unitSystem: "IMPERIAL" });
    });
});
