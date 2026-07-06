import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerApplicationsSection } from "@/features/partner/dashboard/components/PartnerApplicationsSection.tsx";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";

const mockUsePartnerApplications = vi.hoisted(() => vi.fn());
const mockUsePartnerApplicationDetails = vi.hoisted(() => vi.fn());
const mockCreatePartnerApplicationMutate = vi.hoisted(() => vi.fn());
const mockDeletePartnerApplicationMutate = vi.hoisted(() => vi.fn());
const mockUpdatePartnerApplicationMutate = vi.hoisted(() => vi.fn());
const mockUsePartnerDashboardShopSearch = vi.hoisted(() => vi.fn());

vi.mock("@/features/partner/dashboard/api/usePartnerApplications.ts", () => ({
    usePartnerApplications: mockUsePartnerApplications,
    usePartnerApplicationDetails: mockUsePartnerApplicationDetails,
    useCreatePartnerApplication: () => ({
        mutate: mockCreatePartnerApplicationMutate,
        isPending: false,
    }),
    useDeletePartnerApplication: () => ({
        mutate: mockDeletePartnerApplicationMutate,
        isPending: false,
    }),
    useUpdatePartnerApplication: () => ({
        mutate: mockUpdatePartnerApplicationMutate,
        isPending: false,
    }),
}));

vi.mock("@/features/partner/dashboard/api/usePartnerDashboardShopSearch.ts", () => ({
    usePartnerDashboardShopSearch: mockUsePartnerDashboardShopSearch,
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
    },
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        params,
        to,
        ...props
    }: {
        readonly children: ReactNode;
        readonly params?: Record<string, string>;
        readonly to: string;
    }) => {
        const href = params?.shopSlugId ? to.replace("$shopSlugId", params.shopSlugId) : to;
        return (
            <a href={href} {...props}>
                {children}
            </a>
        );
    },
}));

const submittedApplication: PartnerApplication = {
    id: "app-submitted",
    applicantUserId: "user-1",
    businessState: "SUBMITTED",
    executionState: "PROCESSING",
    payload: {
        type: "NEW",
        shopName: "Vintage Shop",
        shopType: "MARKETPLACE",
        shopDomains: ["vintage.example.com"],
    },
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
};

const approvedApplication: PartnerApplication = {
    id: "app-approved",
    applicantUserId: "user-1",
    businessState: "APPROVED",
    executionState: "COMPLETED",
    payload: {
        type: "EXISTING",
        shopId: "shop-1",
        shopSlugId: "vintage-shop",
        shopName: "Approved Antiques",
        shopType: "AUCTION_HOUSE",
        shopDomains: ["approved.example.com"],
    },
    created: new Date("2024-01-03T00:00:00Z"),
    updated: new Date("2024-01-04T00:00:00Z"),
};

describe("PartnerApplicationsSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePartnerApplications.mockReturnValue({
            data: [submittedApplication, approvedApplication],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
        mockUsePartnerApplicationDetails.mockReturnValue({
            data: submittedApplication,
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
        mockDeletePartnerApplicationMutate.mockImplementation(
            (_applicationId: string, options?: { onSuccess?: () => void }) => {
                options?.onSuccess?.();
            },
        );
        mockUpdatePartnerApplicationMutate.mockImplementation(
            (_input: unknown, options?: { onSuccess?: () => void }) => {
                options?.onSuccess?.();
            },
        );
        mockUsePartnerDashboardShopSearch.mockReturnValue({
            data: [
                {
                    shopId: "550e8400-e29b-41d4-a716-446655440000",
                    shopSlugId: "aurora-antiques",
                    name: "Aurora Antiques",
                    partnerStatus: "SCRAPED",
                },
            ],
            isPending: false,
        });
    });

    it("renders all current applications and their business states", () => {
        render(<PartnerApplicationsSection />);

        expect(screen.getByText("Vintage Shop")).toBeInTheDocument();
        expect(screen.getByText("Approved Antiques")).toBeInTheDocument();
        expect(screen.getByText("approved.example.com")).toBeInTheDocument();
        expect(screen.getByText("Eingereicht")).toBeInTheDocument();
        expect(screen.getByText("Genehmigt")).toBeInTheDocument();
        expect(screen.queryByText("In Verarbeitung")).not.toBeInTheDocument();
        expect(screen.queryByText("Abgeschlossen")).not.toBeInTheDocument();
    });

    it("shows an empty state when the user has no applications", () => {
        mockUsePartnerApplications.mockReturnValue({
            data: [],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerApplicationsSection />);

        expect(
            screen.getByText("Sie haben noch keine Partneranträge eingereicht."),
        ).toBeInTheDocument();
    });

    it("renders skeleton rows while loading applications", () => {
        mockUsePartnerApplications.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerApplicationsSection />);

        expect(screen.getByRole("status")).toHaveTextContent("Partneranträge werden geladen.");
    });

    it("offers retry when applications fail to load", async () => {
        const user = userEvent.setup();
        const refetch = vi.fn();
        mockUsePartnerApplications.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
            refetch,
        });

        render(<PartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Erneut versuchen/i }));

        expect(refetch).toHaveBeenCalledOnce();
    });

    it("opens the application detail dialog and requests the selected application", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getAllByRole("button", { name: "Details ansehen" })[0]);

        expect(mockUsePartnerApplicationDetails).toHaveBeenLastCalledWith("app-submitted", true);
        expect(screen.getByRole("dialog")).toHaveTextContent("Antragsdetails");
        expect(screen.getByLabelText("Antragsfortschritt")).toBeInTheDocument();
        expect(screen.queryByText("In Verarbeitung")).not.toBeInTheDocument();
    });

    it("confirms and deletes a pending application from the detail dialog", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getAllByRole("button", { name: "Details ansehen" })[0]);
        await user.click(screen.getByRole("button", { name: "Antrag löschen" }));

        expect(screen.getByRole("alertdialog")).toHaveTextContent("Diesen Partnerantrag löschen?");

        await user.click(screen.getByRole("button", { name: "Löschen" }));

        expect(mockDeletePartnerApplicationMutate).toHaveBeenCalledWith(
            "app-submitted",
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
        expect(toast.success).toHaveBeenCalledWith("Partnerantrag wurde gelöscht.");
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("edits a pending new-shop application from the detail dialog", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getAllByRole("button", { name: "Details ansehen" })[0]);
        await user.click(screen.getByRole("button", { name: "Antrag bearbeiten" }));
        await user.clear(screen.getByLabelText(/Shop-Name/));
        await user.type(screen.getByLabelText(/Shop-Name/), "Updated Vintage Shop");
        await user.clear(screen.getByLabelText(/Domains/));
        await user.type(screen.getByLabelText(/Domains/), "https://www.updated.example.com");
        await user.type(screen.getByLabelText("Telefon"), "+49 30 123456");
        await user.type(screen.getByLabelText("E-Mail"), "shop@example.com");
        await user.type(screen.getByLabelText("Adresszeile"), "Unter den Linden 1");
        await user.type(screen.getByLabelText("Ort"), "Berlin");
        await user.type(screen.getByLabelText("Ländercode"), "DE");
        await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));

        await waitFor(() => expect(mockUpdatePartnerApplicationMutate).toHaveBeenCalledOnce());
        expect(mockUpdatePartnerApplicationMutate).toHaveBeenCalledWith(
            {
                partnerApplicationId: "app-submitted",
                shopName: "Updated Vintage Shop",
                shopType: "MARKETPLACE",
                shopDomains: ["updated.example.com"],
                shopUrl: null,
                shopImage: null,
                shopStructuredAddress: {
                    addressline: "Unter den Linden 1",
                    addresslineExtra: undefined,
                    locality: "Berlin",
                    region: undefined,
                    postalCode: undefined,
                    country: "DE",
                },
                shopPhone: "+49 30 123456",
                shopEmail: "shop@example.com",
            },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
        expect(toast.success).toHaveBeenCalledWith("Partnerantrag wurde aktualisiert.");
    });

    it("hides the delete action for decided applications", async () => {
        const user = userEvent.setup();
        mockUsePartnerApplicationDetails.mockReturnValue({
            data: approvedApplication,
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerApplicationsSection />);

        await user.click(screen.getAllByRole("button", { name: "Details ansehen" })[1]);

        expect(screen.queryByRole("button", { name: "Antrag löschen" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Antrag bearbeiten" })).not.toBeInTheDocument();
    });

    it("opens the create application dialog and submits a new shop application", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Neuer Antrag/i }));
        await user.type(screen.getByLabelText(/Shop-Name/), "New Partner Shop");
        await user.type(screen.getByLabelText(/Domains/), "https://www.partner.example.com");
        await user.type(screen.getByLabelText("Adresszeile"), "Main Street 1");
        await user.type(screen.getByLabelText("Ort"), "Berlin");
        await user.type(screen.getByLabelText("Ländercode"), "DE");
        await user.click(screen.getByRole("button", { name: "Antrag einreichen" }));

        await waitFor(() => expect(mockCreatePartnerApplicationMutate).toHaveBeenCalledOnce());
        expect(mockCreatePartnerApplicationMutate).toHaveBeenCalledWith(
            {
                type: "NEW",
                shopName: "New Partner Shop",
                shopType: "MARKETPLACE",
                shopDomains: ["partner.example.com"],
                shopUrl: null,
                shopImage: null,
                shopStructuredAddress: {
                    addressline: "Main Street 1",
                    addresslineExtra: undefined,
                    locality: "Berlin",
                    region: undefined,
                    postalCode: undefined,
                    country: "DE",
                },
                shopPhone: null,
                shopEmail: null,
            },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("submits an existing shop application with the entered shop id", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Neuer Antrag/i }));
        await user.click(screen.getByRole("combobox", { name: "Antragstyp" }));
        await user.click(screen.getByRole("option", { name: "Bestehender Shop" }));
        await user.type(screen.getByPlaceholderText("Shops nach Namen suchen …"), "Aurora");
        await user.click(screen.getByText("Aurora Antiques"));
        await user.click(screen.getByRole("button", { name: "Antrag einreichen" }));

        await waitFor(() => expect(mockCreatePartnerApplicationMutate).toHaveBeenCalledOnce());
        expect(mockCreatePartnerApplicationMutate).toHaveBeenCalledWith(
            {
                type: "EXISTING",
                shopId: "550e8400-e29b-41d4-a716-446655440000",
            },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("keeps the submit action disabled when no existing shop is selected", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Neuer Antrag/i }));
        await user.click(screen.getByRole("combobox", { name: "Antragstyp" }));
        await user.click(screen.getByRole("option", { name: "Bestehender Shop" }));

        expect(screen.getByRole("button", { name: "Antrag einreichen" })).toBeDisabled();
        expect(mockCreatePartnerApplicationMutate).not.toHaveBeenCalled();
    });

    it("shows field-level reasons and highlights invalid fields after an invalid submit", async () => {
        const user = userEvent.setup();

        render(<PartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Neuer Antrag/i }));
        await user.click(screen.getByRole("button", { name: "Antrag einreichen" }));

        expect(screen.getByText("Bitte geben Sie den Shop-Namen ein.")).toBeInTheDocument();
        expect(screen.getByText("Bitte geben Sie mindestens eine Domain ein.")).toBeInTheDocument();
        expect(screen.getByLabelText(/Shop-Name/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText(/Domains/)).toHaveAttribute("aria-invalid", "true");
        expect(mockCreatePartnerApplicationMutate).not.toHaveBeenCalled();
    });
});
