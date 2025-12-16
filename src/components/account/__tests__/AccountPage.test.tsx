import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountPage } from "../AccountPage.tsx";

const mockUseAuthenticator = vi.hoisted(() => vi.fn());
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
        ChangePassword: ({
            onSuccess,
            onError,
        }: {
            onSuccess?: () => void;
            onError?: () => void;
        }) => (
            <div>
                Change Password Component
                <button type="button" onClick={onSuccess} data-testid="password-success-btn">
                    Trigger Success
                </button>
                <button type="button" onClick={onError} data-testid="password-error-btn">
                    Trigger Error
                </button>
            </div>
        ),
        DeleteUser: ({ onSuccess, onError }: { onSuccess?: () => void; onError?: () => void }) => (
            <div>
                Delete User Component
                <button type="button" onClick={onSuccess} data-testid="delete-success-btn">
                    Trigger Success
                </button>
                <button type="button" onClick={onError} data-testid="delete-error-btn">
                    Trigger Error
                </button>
            </div>
        ),
    },
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

    describe("Logged in user", () => {
        beforeEach(() => {
            mockUseAuthenticator.mockReturnValue({ user: { username: "test" } });
        });

        it("should render account page with all sections", () => {
            renderWithQueryClient(<AccountPage />);

            expect(screen.getByText("Mein Account")).toBeInTheDocument();
            expect(screen.getByText("Passwort ändern")).toBeInTheDocument();
            expect(screen.getByText("Account löschen")).toBeInTheDocument();
        });

        it("should render ChangePassword and DeleteUser components", () => {
            renderWithQueryClient(<AccountPage />);

            expect(screen.getByText("Change Password Component")).toBeInTheDocument();
            expect(screen.getByText("Delete User Component")).toBeInTheDocument();
        });

        it("should show success toast when password changed", async () => {
            const user = userEvent.setup();
            renderWithQueryClient(<AccountPage />);

            await user.click(screen.getByTestId("password-success-btn"));

            expect(mockToast.success).toHaveBeenCalledWith("Passwort erfolgreich geändert!");
        });

        it("should show error toast when password change fails", async () => {
            const user = userEvent.setup();
            renderWithQueryClient(<AccountPage />);

            await user.click(screen.getByTestId("password-error-btn"));

            expect(mockToast.error).toHaveBeenCalledWith("Fehler beim Ändern des Passworts.");
        });

        it("should show success toast when account deleted", async () => {
            const user = userEvent.setup();
            renderWithQueryClient(<AccountPage />);

            await user.click(screen.getByTestId("delete-success-btn"));

            expect(mockToast.success).toHaveBeenCalledWith("Account wurde erfolgreich gelöscht!");
        });

        it("should show error toast when account deletion fails", async () => {
            const user = userEvent.setup();
            renderWithQueryClient(<AccountPage />);

            await user.click(screen.getByTestId("delete-error-btn"));

            expect(mockToast.error).toHaveBeenCalledWith("Fehler beim Löschen des Accounts.");
        });
    });
});
