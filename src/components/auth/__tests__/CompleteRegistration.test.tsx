import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompleteRegistration } from "../CompleteRegistration";

const mockT = vi.hoisted(() => vi.fn((key: string) => key));
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseStore = vi.hoisted(() => vi.fn());
const mockUseRegistrationPolling = vi.hoisted(() => vi.fn());
const mockClearPendingUserData = vi.hoisted(() => vi.fn());
const mockSetAuthComplete = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("@tanstack/react-store", () => ({
    useStore: mockUseStore,
}));

vi.mock("@/hooks/account/useRegistrationPolling", () => ({
    useRegistrationPolling: mockUseRegistrationPolling,
}));

vi.mock("@/stores/registrationStore", () => ({
    registrationStore: {},
    clearPendingUserData: mockClearPendingUserData,
    setAuthComplete: mockSetAuthComplete,
}));

describe("CompleteRegistration", () => {
    const mockPollingStart = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockT.mockImplementation((key: string) => key);
        mockNavigate.mockResolvedValue(undefined);

        // Default store state
        mockUseStore.mockImplementation((_, selector) => {
            const state = {
                pendingUserData: { firstName: "Max", lastName: "Mustermann" },
                isAuthComplete: false,
                isSignUpFlow: true,
            };
            return selector(state);
        });

        // Default polling state
        mockUseRegistrationPolling.mockReturnValue({
            start: mockPollingStart,
            isLoading: false,
            isDone: false,
            isTimeout: false,
            isError: false,
            errorMessage: null,
        });
    });

    describe("Rendering States", () => {
        it("should render null when isAuthComplete is true", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: null,
                    isAuthComplete: true,
                    isSignUpFlow: true,
                };
                return selector(state);
            });

            const { container } = render(<CompleteRegistration />);
            expect(container.firstChild).toBeNull();
        });

        it("should render loading spinner when polling is in progress", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: true,
                isDone: false,
                isTimeout: false,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(screen.getByText("auth.completingRegistration")).toBeInTheDocument();
            const spinner = document.querySelector(".animate-spin");
            expect(spinner).toBeInTheDocument();
        });

        it("should render timeout error card when polling times out", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: true,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(screen.getByText("auth.timeout.title")).toBeInTheDocument();
            expect(screen.getByText("auth.timeout.message")).toBeInTheDocument();
            expect(screen.getByText("auth.timeout.noteLabel")).toBeInTheDocument();
            expect(screen.getByText("auth.timeout.hint")).toBeInTheDocument();
        });

        it("should render error card when polling fails with error", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: false,
                isError: true,
                errorMessage: "Network error occurred",
            });

            render(<CompleteRegistration />);

            expect(screen.getByText("auth.errorTitle")).toBeInTheDocument();
            expect(screen.getByText("Network error occurred")).toBeInTheDocument();
        });

        it("should render unknown error when errorMessage is not provided", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: false,
                isError: true,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(screen.getByText("apiErrors.unknown")).toBeInTheDocument();
        });

        it("should render null when no special state is active", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: null,
                    isAuthComplete: false,
                    isSignUpFlow: true,
                };
                return selector(state);
            });

            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: true,
                isTimeout: false,
                isError: false,
                errorMessage: null,
            });

            const { container } = render(<CompleteRegistration />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe("useEffect Logic", () => {
        it("should not do anything when isAuthComplete is true", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: { firstName: "Max" },
                    isAuthComplete: true,
                    isSignUpFlow: true,
                };
                return selector(state);
            });

            render(<CompleteRegistration />);

            expect(mockClearPendingUserData).not.toHaveBeenCalled();
            expect(mockSetAuthComplete).not.toHaveBeenCalled();
            expect(mockPollingStart).not.toHaveBeenCalled();
        });

        it("should clear pending data and set auth complete when not in sign-up flow", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: { firstName: "Max" },
                    isAuthComplete: false,
                    isSignUpFlow: false,
                };
                return selector(state);
            });

            render(<CompleteRegistration />);

            expect(mockClearPendingUserData).toHaveBeenCalled();
            expect(mockSetAuthComplete).toHaveBeenCalled();
        });

        it("should not start polling when timeout occurred", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: true,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(mockPollingStart).not.toHaveBeenCalled();
        });

        it("should not start polling when error occurred", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: false,
                isError: true,
                errorMessage: "Some error",
            });

            render(<CompleteRegistration />);

            expect(mockPollingStart).not.toHaveBeenCalled();
        });

        it("should set auth complete when no pending data exists", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: null,
                    isAuthComplete: false,
                    isSignUpFlow: true,
                };
                return selector(state);
            });

            render(<CompleteRegistration />);

            expect(mockSetAuthComplete).toHaveBeenCalled();
        });

        it("should set auth complete when polling is done", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: true,
                isTimeout: false,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(mockSetAuthComplete).toHaveBeenCalled();
        });

        it("should start polling when conditions are met", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: { firstName: "Max" },
                    isAuthComplete: false,
                    isSignUpFlow: true,
                };
                return selector(state);
            });

            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: false,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(mockPollingStart).toHaveBeenCalled();
        });

        it("should not start polling when already loading", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: true,
                isDone: false,
                isTimeout: false,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            expect(mockPollingStart).not.toHaveBeenCalled();
        });
    });

    describe("User Interactions", () => {
        it("should retry polling when retry button is clicked in timeout state", async () => {
            const user = userEvent.setup();
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: true,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            const retryButton = screen.getByText("auth.retry");
            await user.click(retryButton);

            expect(mockPollingStart).toHaveBeenCalled();
        });

        it("should retry polling when retry button is clicked in error state", async () => {
            const user = userEvent.setup();
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: false,
                isError: true,
                errorMessage: "Network error",
            });

            render(<CompleteRegistration />);

            const retryButton = screen.getByText("auth.retry");
            await user.click(retryButton);

            expect(mockPollingStart).toHaveBeenCalled();
        });

        it("should navigate to homepage when back button is clicked in timeout state", async () => {
            const user = userEvent.setup();
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: true,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            const backButton = screen.getByText("auth.backToHomepage");
            await user.click(backButton);

            await waitFor(() => {
                expect(mockClearPendingUserData).toHaveBeenCalled();
                expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
                expect(mockSetAuthComplete).toHaveBeenCalled();
            });
        });

        it("should navigate to homepage when back button is clicked in error state", async () => {
            const user = userEvent.setup();
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: false,
                isError: true,
                errorMessage: "Network error",
            });

            render(<CompleteRegistration />);

            const backButton = screen.getByText("auth.backToHomepage");
            await user.click(backButton);

            await waitFor(() => {
                expect(mockClearPendingUserData).toHaveBeenCalled();
                expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
                expect(mockSetAuthComplete).toHaveBeenCalled();
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle rapid state changes gracefully", () => {
            const { rerender } = render(<CompleteRegistration />);

            // Simulate rapid state change
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: true,
                isDone: false,
                isTimeout: false,
                isError: false,
                errorMessage: null,
            });

            rerender(<CompleteRegistration />);

            expect(screen.getByText("auth.completingRegistration")).toBeInTheDocument();
        });

        it("should render timeout UI even when error is also present", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: true,
                isError: true,
                errorMessage: "Some error",
            });

            render(<CompleteRegistration />);

            // Timeout takes priority
            expect(screen.getByText("auth.timeout.title")).toBeInTheDocument();
            expect(screen.queryByText("auth.errorTitle")).not.toBeInTheDocument();
        });

        it("should handle missing pending data gracefully", () => {
            mockUseStore.mockImplementation((_, selector) => {
                const state = {
                    pendingUserData: undefined,
                    isAuthComplete: false,
                    isSignUpFlow: true,
                };
                return selector(state);
            });

            render(<CompleteRegistration />);

            // Should call setAuthComplete when no pending data
            expect(mockSetAuthComplete).toHaveBeenCalled();
        });

        it("should display both retry buttons with correct styling", () => {
            mockUseRegistrationPolling.mockReturnValue({
                start: mockPollingStart,
                isLoading: false,
                isDone: false,
                isTimeout: true,
                isError: false,
                errorMessage: null,
            });

            render(<CompleteRegistration />);

            const retryButton = screen.getByText("auth.retry").closest("button");
            const backButton = screen.getByText("auth.backToHomepage").closest("button");

            expect(retryButton).toHaveClass("w-full", "sm:w-auto");
            expect(backButton).toHaveClass("w-full", "sm:w-auto");
        });
    });
});
