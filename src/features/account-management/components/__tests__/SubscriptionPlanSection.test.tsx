import { screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { SubscriptionPlanSection } from "../SubscriptionPlanSection.tsx";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import { renderWithRouter } from "@/test/utils.tsx";

vi.mock("@/features/account-management/hooks/useUserAccount.ts");
vi.mock("@/hooks/billing/useStripeBilling");

describe("SubscriptionPlanSection", () => {
    const mockUserData: UserAccountData = {
        userId: "test-user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        language: "de",
        currency: "EUR",
        prohibitedContentConsent: false,
        role: "USER",
        subscriptionType: "pro",
        created: new Date("2024-01-01T00:00:00Z"),
        updated: new Date("2024-01-01T00:00:00Z"),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        const { useUserAccount } = await import(
            "@/features/account-management/hooks/useUserAccount.ts"
        );
        const { useStripeBilling } = await import("@/hooks/billing/useStripeBilling");

        vi.mocked(useUserAccount).mockReturnValue({
            data: mockUserData,
            isLoading: false,
            isError: false,
            error: null,
        } as UseQueryResult<UserAccountData>);

        vi.mocked(useStripeBilling).mockReturnValue({
            handleSubscribe: vi.fn(),
            isLoading: false,
        });
    });

    it("renders current subscription plan and manage button", async () => {
        await act(async () => {
            renderWithRouter(<SubscriptionPlanSection />);
        });

        expect(screen.getByText("Abonnement")).toBeInTheDocument();
        expect(screen.getByText("Aktuelles Abo")).toBeInTheDocument();
        expect(screen.getByText("Pro")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Abo verwalten" })).toBeInTheDocument();
    });
});
