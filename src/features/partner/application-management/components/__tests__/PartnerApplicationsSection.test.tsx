import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerApplicationsSection } from "../PartnerApplicationsSection.tsx";
import testI18n from "@/i18n/i18nForTests";
const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    withdraw: vi.fn(),
    search: vi.fn(),
}));
vi.mock("../../api/usePartnerApplications.ts", () => ({
    usePartnerApplications: mocks.list,
    usePartnerApplicationDetails: mocks.detail,
    useCreatePartnerApplication: () => ({ mutate: mocks.create, isPending: false, reset: vi.fn() }),
    useWithdrawPartnerApplication: () => ({
        mutate: mocks.withdraw,
        isPending: false,
        reset: vi.fn(),
    }),
}));
vi.mock("../../api/useApplicationListingSourceSearch.ts", () => ({
    useApplicationListingSourceSearch: mocks.search,
}));
const application = {
    id: "pa_1",
    state: "SUBMITTED",
    proposal: {
        type: "PROPOSED_LISTING_SOURCE",
        party: { name: "Operator" },
        listingSource: { name: "Source", requestedIngestionMethods: ["PARTNER_API"] },
    },
};
describe("immutable application workflow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockReturnValue({ data: [application], isPending: false, isError: false });
        mocks.detail.mockReturnValue({ data: application, isPending: false });
        mocks.search.mockReturnValue({
            data: [
                {
                    listingSourceId: "ls_canonical",
                    name: "Public Source",
                    operatorName: "Public Operator",
                },
            ],
            isPending: false,
        });
    });
    it("renders minimal own data without timestamps or execution fields", () => {
        render(<PartnerApplicationsSection />);
        expect(screen.getByText("Source")).toBeInTheDocument();
        expect(screen.getByText("pa_1")).toBeInTheDocument();
        expect(screen.queryByText(/PROCESSING|COMPLETED/)).not.toBeInTheDocument();
    });
    it("renders the empty list", () => {
        mocks.list.mockReturnValue({ data: [], isPending: false });
        render(<PartnerApplicationsSection />);
        expect(screen.getByText(/keine|Keine/)).toBeInTheDocument();
    });
    it("renders withdrawn applications and hides withdrawal", async () => {
        mocks.list.mockReturnValue({
            data: [{ ...application, state: "WITHDRAWN" }],
            isPending: false,
        });
        mocks.detail.mockReturnValue({
            data: { ...application, state: "WITHDRAWN" },
            isPending: false,
        });
        render(<PartnerApplicationsSection />);
        await userEvent.click(screen.getByRole("button", { name: /Details/ }));
        expect(screen.getAllByText("Zurückgezogen")).toHaveLength(2);
        expect(
            screen.queryByRole("button", { name: "Bewerbung zurückziehen" }),
        ).not.toBeInTheDocument();
    });
    it("requires confirmation before withdrawal and exposes no edit action", async () => {
        render(<PartnerApplicationsSection />);
        await userEvent.click(screen.getByRole("button", { name: /Details/ }));
        expect(screen.queryByRole("button", { name: /bearbeiten/i })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Bewerbung zurückziehen" }));
        expect(mocks.withdraw).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole("button", { name: "Bewerbung zurückziehen" }));
        expect(mocks.withdraw).toHaveBeenCalledWith("pa_1", expect.any(Object));
    });
    it("shows missing application errors", async () => {
        mocks.detail.mockReturnValue({
            isPending: false,
            error: new Error("Bewerbung nicht gefunden oder nicht verfügbar."),
        });
        render(<PartnerApplicationsSection />);
        await userEvent.click(screen.getByRole("button", { name: /Details/ }));
        expect(screen.getByRole("alert")).toHaveTextContent("Bewerbung nicht gefunden");
    });
    it.each([
        ["E-Mail (optional)", "invalid-email", "emailInvalid"],
        ["Quellen-URL (optional)", "invalid-url", "urlInvalid"],
        ["Bild-URL (optional)", "invalid-url", "urlInvalid"],
    ])("shows localized schema errors for invalid %s", async (label, value, validationKey) => {
        render(<PartnerApplicationsSection />);
        await userEvent.click(screen.getByRole("button", { name: /Neue|Neuer/ }));
        await userEvent.type(screen.getByLabelText("Name des Betreibers"), "Operator");
        await userEvent.type(screen.getByLabelText("Name der Angebotsquelle"), "Source");
        const input = screen.getByLabelText(label) as HTMLInputElement;
        expect(input.form?.noValidate).toBe(true);
        await userEvent.type(input, value);
        await userEvent.click(screen.getByRole("button", { name: "Antrag einreichen" }));
        expect(
            await screen.findByText(
                testI18n.t(`partnerApplications.create.validation.${validationKey}`),
            ),
        ).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(mocks.create).not.toHaveBeenCalled();
    });
    it("submits the proposed variant with omitted empty contacts", async () => {
        render(<PartnerApplicationsSection />);
        await userEvent.click(screen.getByRole("button", { name: /Neue|Neuer/ }));
        await userEvent.type(screen.getByLabelText("Name des Betreibers"), "Operator");
        await userEvent.type(screen.getByLabelText("Name der Angebotsquelle"), "New Source");
        await userEvent.click(screen.getByLabelText("Partner-API"));
        await userEvent.click(
            screen.getByRole("button", {
                name: /Antrag einreichen|Bewerbung.*senden|Antrag.*senden|Bewerbung einreichen/,
            }),
        );
        await waitFor(() =>
            expect(mocks.create).toHaveBeenCalledWith(
                {
                    type: "PROPOSED_LISTING_SOURCE",
                    party: { name: "Operator" },
                    listingSource: {
                        name: "New Source",
                        requestedIngestionMethods: ["PARTNER_API"],
                    },
                },
                expect.any(Object),
            ),
        );
    });
    it("selects and submits the public canonical ID, not a slug", async () => {
        render(<PartnerApplicationsSection />);
        await userEvent.click(screen.getByRole("button", { name: /Neue|Neuer/ }));
        await userEvent.selectOptions(
            screen.getByLabelText("Art des Vorschlags"),
            "EXISTING_LISTING_SOURCE",
        );
        await userEvent.type(screen.getByLabelText("Bestehende Angebotsquelle"), "Public");
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 400));
        });
        await userEvent.click(
            screen.getByRole("button", { name: "Public Source · Public Operator" }),
        );
        await userEvent.click(
            screen.getByRole("button", {
                name: /Antrag einreichen|Bewerbung.*senden|Antrag.*senden|Bewerbung einreichen/,
            }),
        );
        await waitFor(() =>
            expect(mocks.create).toHaveBeenCalledWith(
                { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_canonical" },
                expect.any(Object),
            ),
        );
    });
});
