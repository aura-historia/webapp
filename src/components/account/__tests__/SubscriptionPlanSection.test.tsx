import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { SubscriptionPlanSection } from "../SubscriptionPlanSection.tsx";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";

vi.mock("@/hooks/account/useUserAccount");

describe("SubscriptionPlanSection", () => {
    const mockUserData: UserAccountData = {
        userId: "test-user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        language: "en",
        currency: "EUR",
        prohibitedContentConsent: false,
        subscriptionType: "pro",
        created: new Date("2024-01-01T00:00:00Z"),
        updated: new Date("2024-01-01T00:00:00Z"),
    };

    beforeEach(async () => {
        const { useUserAccount } = await import("@/hooks/account/useUserAccount");

        vi.mocked(useUserAccount).mockReturnValue({
            data: mockUserData,
            isLoading: false,
            isError: false,
            error: null,
        } as UseQueryResult<UserAccountData>);
    });

    it("renders current subscription plan and manage button", () => {
        render(<SubscriptionPlanSection />);

        expect(screen.getByText("Abonnement")).toBeInTheDocument();
        expect(screen.getByText("Aktueller Plan")).toBeInTheDocument();
        expect(screen.getByText("Pro")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Abo verwalten" })).toBeInTheDocument();
    });
});
