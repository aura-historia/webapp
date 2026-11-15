import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SubscriptionType } from "@/data/internal/account/SubscriptionType.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SaveSearchButton } from "../SaveSearchButton.tsx";

const mockUseResolvedAuth = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());
const mockUseUserSearchFilters = vi.hoisted(() => vi.fn());

vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: mockUseResolvedAuth,
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

vi.mock("@/features/saved-searches/api/useUserSearchFilters.ts", () => ({
    useUserSearchFilters: mockUseUserSearchFilters,
}));

vi.mock("@/features/saved-searches/components/SaveSearchFilterDialog.tsx", () => ({
    SaveSearchFilterDialog: ({ children }: { children: ReactNode }) => (
        <div data-testid="save-dialog">{children}</div>
    ),
}));

const buildFilter = (
    id: string,
    state: UserSearchFilter["state"] = "ACTIVE",
): UserSearchFilter => ({
    id,
    userId: "user-1",
    name: id,
    notifications: true,
    state,
    search: { q: "vase" },
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
});

const activeFilters = (count: number) =>
    Array.from({ length: count }, (_, index) => buildFilter(`active-${index}`));

function setMock({
    filters = [],
    subscriptionType = "pro",
    isAuthenticated = true,
}: {
    filters?: UserSearchFilter[];
    subscriptionType?: SubscriptionType;
    isAuthenticated?: boolean;
} = {}) {
    mockUseResolvedAuth.mockReturnValue({ isAuthenticated });
    mockUseUserAccount.mockReturnValue({ data: { subscriptionType } });
    mockUseUserSearchFilters.mockReturnValue({
        data: { items: filters, from: 0, size: filters.length, total: filters.length },
    });
}

const renderButton = () => renderWithQueryClient(<SaveSearchButton searchArgs={{ q: "vase" }} />);
const saveButton = () => screen.getByRole("button", { name: "Suche speichern" });

describe("SaveSearchButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("opens the save dialog below the quota", () => {
        setMock({ filters: activeFilters(4), subscriptionType: "pro" });
        renderButton();
        expect(saveButton()).toBeEnabled();
        expect(screen.getByTestId("save-dialog")).toBeInTheDocument();
    });

    it("is disabled for signed-out visitors", async () => {
        setMock({ isAuthenticated: false });
        renderButton();
        expect(saveButton()).toBeDisabled();
        await userEvent.hover(saveButton().parentElement as HTMLElement);
        expect(await screen.findByRole("tooltip")).toHaveTextContent(
            "Bitte melden Sie sich an oder registrieren Sie sich, um Suchaufträge zu speichern.",
        );
    });

    it("does not count paused or plan-locked filters toward the quota", () => {
        setMock({
            filters: [
                buildFilter("paused", "INACTIVE_BY_USER"),
                buildFilter("locked", "INACTIVE_BY_RESTRICTED_PLAN"),
            ],
            subscriptionType: "free",
        });
        renderButton();
        expect(saveButton()).toBeEnabled();
    });

    it("points Free and Pro to an upgrade at the quota", async () => {
        setMock({ filters: activeFilters(5), subscriptionType: "pro" });
        renderButton();
        expect(saveButton()).toBeDisabled();
        await userEvent.hover(saveButton().parentElement as HTMLElement);
        expect(await screen.findByRole("tooltip")).toHaveTextContent(
            "Upgraden Sie Ihr Abonnement für mehr.",
        );
    });

    it("lets Ultimate save up to 20 active filters", () => {
        setMock({ filters: activeFilters(19), subscriptionType: "ultimate" });
        renderButton();
        expect(saveButton()).toBeEnabled();
    });

    it("stops Ultimate at 20 active filters and suggests pausing one instead of upgrading", async () => {
        setMock({ filters: activeFilters(20), subscriptionType: "ultimate" });
        renderButton();
        expect(saveButton()).toBeDisabled();
        await userEvent.hover(saveButton().parentElement as HTMLElement);
        const tooltip = await screen.findByRole("tooltip");
        expect(tooltip).toHaveTextContent(
            "Sie haben das Maximum von 20 aktiven Suchaufträgen erreicht. Pausieren Sie einen, um einen weiteren hinzuzufügen.",
        );
        expect(tooltip).not.toHaveTextContent("Upgraden");
    });

    it("lets Ultimate save again once a filter at the limit is paused", () => {
        setMock({
            filters: [...activeFilters(19), buildFilter("paused", "INACTIVE_BY_USER")],
            subscriptionType: "ultimate",
        });
        renderButton();
        expect(saveButton()).toBeEnabled();
    });
});
