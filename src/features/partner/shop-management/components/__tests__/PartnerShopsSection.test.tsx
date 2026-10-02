import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerShopsSection } from "../PartnerShopsSection.tsx";

const state = vi.hoisted(() => ({
    data: [
        { listingSourceId: "ls_dealer", listingSourceSlugId: "dealer", name: "Aurora Antiques" },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
}));
const auth = vi.hoisted(() => ({ isAuthenticated: true, isResolved: true }));
const useSources = vi.hoisted(() => vi.fn());
vi.mock("@/features/partner/common/api/useOwnListingSources.ts", () => ({
    useOwnListingSources: useSources,
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => auth,
}));

const emptyMessage =
    "Sie haben derzeit keinen Zugriff auf Angebotsquellen. Eine frühere Freigabe wurde möglicherweise widerrufen.";

describe("granted-source portfolio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        auth.isAuthenticated = true;
        auth.isResolved = true;
        state.data = [
            {
                listingSourceId: "ls_dealer",
                listingSourceSlugId: "dealer",
                name: "Aurora Antiques",
            },
        ];
        state.isPending = false;
        state.isError = false;
        useSources.mockReturnValue(state);
    });

    it("renders only minimal references with no edit controls or detail links", () => {
        render(<PartnerShopsSection />);
        expect(
            screen.getByRole("heading", { name: "Freigegebene Angebotsquellen" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
        expect(screen.getByText("ls_dealer")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(useSources).toHaveBeenCalledWith(true);
    });

    it("renders a loading state while authentication resolves", () => {
        auth.isAuthenticated = false;
        auth.isResolved = false;
        render(<PartnerShopsSection />);
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(useSources).toHaveBeenCalledWith(false);
    });

    it("renders a loading state during the first request", () => {
        state.isPending = true;
        render(<PartnerShopsSection />);
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("explains empty or revoked access", () => {
        state.data = [];
        render(<PartnerShopsSection />);
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it("removes references when a refresh returns an empty grant list", () => {
        const { rerender } = render(<PartnerShopsSection />);
        state.data = [];
        rerender(<PartnerShopsSection />);
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });

    it("hides cached grants on a failed refresh and offers retry", async () => {
        state.isError = true;
        render(<PartnerShopsSection />);
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(state.refetch).toHaveBeenCalledOnce();
    });

    it("hides prior grants after sign-out", () => {
        const { rerender } = render(<PartnerShopsSection />);
        auth.isAuthenticated = false;
        rerender(<PartnerShopsSection />);
        expect(screen.queryByText("Aurora Antiques")).not.toBeInTheDocument();
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
        expect(useSources).toHaveBeenLastCalledWith(false);
    });
});
