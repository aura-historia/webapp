import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountPage } from "../AccountPage.tsx";

const mockUseAuthenticator = vi.hoisted(() => vi.fn());
const mockUseUserAttributes = vi.hoisted(() => vi.fn());
const mockUpdateUserAttributes = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: mockUseAuthenticator,
    AccountSettings: {
        ChangePassword: () => <div>Change Password Component</div>,
        DeleteUser: () => <div>Delete User Component</div>,
    },
}));

vi.mock("@/hooks/useUserAttributes.ts", () => ({
    useUserAttributes: mockUseUserAttributes,
}));

vi.mock("@aws-amplify/auth", () => ({
    updateUserAttributes: mockUpdateUserAttributes,
}));

vi.mock("@tanstack/react-router", async () => {
    const actual = await vi.importActual("@tanstack/react-router");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe("AccountPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockResolvedValue(undefined);
    });

    describe("Not logged in", () => {
        it("should redirect to auth page", async () => {
            mockUseAuthenticator.mockReturnValue({ user: null });
            mockUseUserAttributes.mockReturnValue({
                data: null,
                isLoading: false,
            });

            renderWithQueryClient(<AccountPage />);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth" });
            });
        });
    });

    describe("Logged in user", () => {
        beforeEach(() => {
            mockUseAuthenticator.mockReturnValue({ user: { username: "test" } });
            mockUseUserAttributes.mockReturnValue({
                data: {
                    given_name: "Max",
                    family_name: "Mustermann",
                },
                isLoading: false,
                error: null,
            });
        });

        it("should render profile page with all sections", () => {
            renderWithQueryClient(<AccountPage />);

            expect(screen.getByText("Mein Profil")).toBeInTheDocument();
            expect(screen.getByText("Persönliche Daten ändern")).toBeInTheDocument();
            expect(screen.getByText("Passwort ändern")).toBeInTheDocument();
            expect(screen.getByText("Account löschen")).toBeInTheDocument();
        });

        it("should display user data in form", () => {
            renderWithQueryClient(<AccountPage />);

            expect(screen.getByLabelText("Vorname")).toHaveValue("Max");
            expect(screen.getByLabelText("Nachname")).toHaveValue("Mustermann");
        });

        it("should update profile successfully", async () => {
            const user = userEvent.setup();
            mockUpdateUserAttributes.mockResolvedValue({});

            renderWithQueryClient(<AccountPage />);

            const vornameInput = screen.getByLabelText("Vorname");
            await user.clear(vornameInput);
            await user.type(vornameInput, "Anna");

            await user.click(screen.getByRole("button", { name: /speichern/i }));

            await waitFor(() => {
                expect(mockUpdateUserAttributes).toHaveBeenCalledWith({
                    userAttributes: {
                        given_name: "Anna",
                        family_name: "Mustermann",
                    },
                });
                expect(mockToast.success).toHaveBeenCalledWith(
                    "Dein Profil wurde erfolgreich aktualisiert!",
                );
            });
        });

        it("should show validation error for short name", async () => {
            const user = userEvent.setup();

            renderWithQueryClient(<AccountPage />);

            const vornameInput = screen.getByLabelText("Vorname");
            await user.clear(vornameInput);
            await user.type(vornameInput, "A");

            await user.click(screen.getByRole("button", { name: /speichern/i }));

            expect(await screen.findByText(/mindestens 2 Zeichen/)).toBeInTheDocument();
            expect(mockUpdateUserAttributes).not.toHaveBeenCalled();
        });

        it("should handle update error", async () => {
            const user = userEvent.setup();
            mockUpdateUserAttributes.mockRejectedValue(new Error("Update failed"));

            renderWithQueryClient(<AccountPage />);

            await user.click(screen.getByRole("button", { name: /speichern/i }));

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith(
                    "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
                );
            });
        });
    });

    describe("Loading and Error states", () => {
        it("should show loading message", () => {
            mockUseAuthenticator.mockReturnValue({ user: { username: "test" } });
            mockUseUserAttributes.mockReturnValue({
                data: null,
                isLoading: true,
                error: null,
            });

            const { container } = renderWithQueryClient(<AccountPage />);
            const spinner = container.querySelector(".animate-spin");
            expect(spinner).toBeInTheDocument();
        });

        it("should show error message", () => {
            mockUseAuthenticator.mockReturnValue({ user: { username: "test" } });
            mockUseUserAttributes.mockReturnValue({
                data: null,
                isLoading: false,
                error: new Error("Failed"),
            });

            renderWithQueryClient(<AccountPage />);

            expect(screen.getByText("Fehler beim Laden der Daten!")).toBeInTheDocument();
        });
    });
});
