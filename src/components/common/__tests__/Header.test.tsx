import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "../Header.tsx";

const mockUseAuthenticator = vi.hoisted(() => vi.fn());
const mockUseUserAttributes = vi.hoisted(() => vi.fn());

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: mockUseAuthenticator,
}));

vi.mock("@/hooks/useUserAttributes.ts", () => ({
    useUserAttributes: mockUseUserAttributes,
}));

const setupAuthMock = (isLoggedIn = false) => {
    mockUseAuthenticator.mockReturnValue({
        toSignUp: vi.fn(),
        toSignIn: vi.fn(),
        user: isLoggedIn ? {} : null,
        signOut: vi.fn(),
    });
};

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Not logged in user", () => {
        beforeEach(async () => {
            setupAuthMock(false);
            mockUseUserAttributes.mockReturnValue({ data: undefined });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render Blitzfilter logo link", () => {
            const logoLink = screen.getByText("Blitzfilter");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should render auth buttons with correct text", () => {
            expect(screen.getByText("Registrieren")).toBeInTheDocument();
            expect(screen.getByText("Einloggen")).toBeInTheDocument();
        });
    });

    describe("Logged in user", () => {
        beforeEach(async () => {
            setupAuthMock(true);
            mockUseUserAttributes.mockReturnValue({
                data: {
                    given_name: "Max",
                    family_name: "Mustermann",
                },
            });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render Blitzfilter logo link", () => {
            const logoLink = screen.getByText("Blitzfilter");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should show AccountImage for logged in user", () => {
            const profileContainer = screen.getByRole("button");
            expect(profileContainer).toBeInTheDocument();
        });

        it("should show dropdown menu items when clicked", async () => {
            const user = userEvent.setup();
            const dropdownTrigger = screen.getByRole("button");

            await user.click(dropdownTrigger);

            expect(screen.getByText("Mein Account")).toBeInTheDocument();
            expect(screen.getByText("Profil bearbeiten")).toBeInTheDocument();
            expect(screen.getByText("Ausloggen")).toBeInTheDocument();
        });

        it("should not show auth buttons", () => {
            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
        });
    });
});
