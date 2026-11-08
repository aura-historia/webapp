import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerApplicationsPage } from "@/features/partner/application-management/pages/PartnerApplicationsPage.tsx";

const mockSearch = vi.hoisted(() => ({ value: {} as { create?: true } }));
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
    useSearch: () => mockSearch.value,
    useNavigate: () => mockNavigate,
}));

vi.mock(
    "@/features/partner/application-management/components/PartnerApplicationsSection.tsx",
    () => ({
        PartnerApplicationsSection: ({
            createOpen,
            onCreateOpenChange,
        }: {
            createOpen?: boolean;
            onCreateOpenChange?: (open: boolean) => void;
        }) => (
            <section>
                <p>{`createOpen: ${String(createOpen)}`}</p>
                <button type="button" onClick={() => onCreateOpenChange?.(false)}>
                    close
                </button>
                <button type="button" onClick={() => onCreateOpenChange?.(true)}>
                    open
                </button>
            </section>
        ),
    }),
);

describe("PartnerApplicationsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearch.value = {};
    });

    it("leaves the create dialog to the section without ?create", async () => {
        const user = userEvent.setup();
        render(<PartnerApplicationsPage />);

        expect(screen.getByText("createOpen: undefined")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "close" }));
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("opens the create dialog from ?create=true and clears it on close", async () => {
        const user = userEvent.setup();
        mockSearch.value = { create: true };
        render(<PartnerApplicationsPage />);

        expect(screen.getByText("createOpen: true")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "open" }));
        expect(mockNavigate).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "close" }));
        expect(mockNavigate).toHaveBeenCalledWith({ search: {}, replace: true });
    });
});
