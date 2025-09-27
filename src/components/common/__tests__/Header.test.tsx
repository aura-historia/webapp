import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "../Header.tsx";

const mockUseAuthenticator = vi.hoisted(() => vi.fn());

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: mockUseAuthenticator,
}));

const setupAuthMock = (user: { username: string } | null = null) => {
    mockUseAuthenticator.mockReturnValue({
        toSignUp: vi.fn(),
        toSignIn: vi.fn(),
        user,
        signOut: vi.fn(),
    });
};

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Not logged in user", () => {
        beforeEach(async () => {
            setupAuthMock();
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render Blitzfilter logo link", () => {
            const logoLink = screen.getByText("Blitzfilter");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should renders auth buttons with correct text", () => {
            expect(screen.getByText("Registrieren")).toBeInTheDocument();
            expect(screen.getByText("Einloggen")).toBeInTheDocument();
        });
    });

    describe("Logged in user", () => {
        beforeEach(async () => {
            setupAuthMock({ username: "TestUser" });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render Blitzfilter logo link", () => {
            const logoLink = screen.getByText("Blitzfilter");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should show welcome message and logout button", () => {
            expect(screen.getByText("Hallo TestUser!")).toBeInTheDocument();
            expect(screen.getByText("Ausloggen")).toBeInTheDocument();
        });

        it("should not show auth buttons", () => {
            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
        });
    });
});
