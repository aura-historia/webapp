import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalDataForm } from "../PersonalDataForm";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { UserAccountData, UserAccountPatchData } from "@/data/internal/UserAccountData";

const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

vi.mock("@/hooks/useUserAccount");
vi.mock("@/hooks/usePatchUserAccount");

const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe("PersonalDataForm", () => {
    const mockUserData: UserAccountData = {
        userId: "test-user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        language: "en",
        currency: "EUR",
        created: new Date("2024-01-01T00:00:00Z"),
        updated: new Date("2024-01-01T00:00:00Z"),
    };

    let mockMutate: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockMutate = vi.fn();

        const { useUserAccount } = await import("@/hooks/useUserAccount");
        const { useUpdateUserAccount } = await import("@/hooks/usePatchUserAccount");

        vi.mocked(useUserAccount).mockReturnValue({
            data: mockUserData,
            isLoading: false,
            isError: false,
            error: null,
        } as UseQueryResult<UserAccountData>);

        vi.mocked(useUpdateUserAccount).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as unknown as UseMutationResult<UserAccountData, Error, UserAccountPatchData>);
    });

    it("should render form with pre-filled user data", () => {
        renderWithQueryClient(<PersonalDataForm />);

        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    });

    it("should validate firstName minimum length", async () => {
        const user = userEvent.setup();
        renderWithQueryClient(<PersonalDataForm />);

        const firstNameInput = screen.getByLabelText("Vorname");
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "A");
        await user.click(screen.getByRole("button", { name: /änderungen speichern/i }));

        await waitFor(() => {
            expect(screen.getByText(/mindestens 2 zeichen/i)).toBeInTheDocument();
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should validate firstName invalid characters", async () => {
        const user = userEvent.setup();
        renderWithQueryClient(<PersonalDataForm />);

        const firstNameInput = screen.getByLabelText("Vorname");
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "John123");
        await user.click(screen.getByRole("button", { name: /änderungen speichern/i }));

        await waitFor(() => {
            expect(screen.getByText(/nur buchstaben.*erlaubt/i)).toBeInTheDocument();
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should submit form with updated data", async () => {
        const user = userEvent.setup();
        renderWithQueryClient(<PersonalDataForm />);

        const firstNameInput = screen.getByLabelText("Vorname");
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        await user.click(screen.getByRole("button", { name: /änderungen speichern/i }));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                {
                    firstName: "Jane",
                    lastName: "Doe",
                    language: "en",
                    currency: "EUR",
                },
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                }),
            );
        });
    });

    it("should show success toast after successful update", async () => {
        const user = userEvent.setup();

        mockMutate.mockImplementation((_data, options) => {
            options?.onSuccess?.(mockUserData);
        });

        renderWithQueryClient(<PersonalDataForm />);

        await user.click(screen.getByRole("button", { name: /änderungen speichern/i }));

        await waitFor(() => {
            expect(mockToast.success).toHaveBeenCalledWith(
                "Persönliche Daten erfolgreich aktualisiert",
            );
        });
    });

    it("should show spinner and disable button while submitting", async () => {
        const { useUpdateUserAccount } = await import("@/hooks/usePatchUserAccount");

        vi.mocked(useUpdateUserAccount).mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as UseMutationResult<UserAccountData, Error, UserAccountPatchData>);

        renderWithQueryClient(<PersonalDataForm />);

        const submitButton = screen.getByRole("button", { name: /änderungen speichern/i });
        expect(submitButton).toBeDisabled();
    });
});
