import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartnerApplication } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import testI18n from "@/i18n/i18nForTests";
import { renderWithRouter } from "@/test/utils.tsx";
import { PartnerApplicationsSection } from "../PartnerApplicationsSection.tsx";

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    withdraw: vi.fn(),
    search: vi.fn(),
    getMyListingSources: vi.fn(),
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
vi.mock("@/client", () => ({ getMyListingSources: mocks.getMyListingSources }));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ isAuthenticated: true, isResolved: true }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const SEND = "Antrag senden";
// The kind cards' labels wrap their description too, so match the start of the name.
const EXISTING_KIND = /^Mein Shop ist schon auf Aura Historia/;
const PROPOSED_KIND = /^Mein Shop ist noch nicht auf Aura Historia/;

const application: PartnerApplication = {
    id: "pa_1",
    state: "SUBMITTED",
    proposal: {
        type: "PROPOSED_LISTING_SOURCE",
        party: { name: "Operator" },
        listingSource: {
            name: "Source",
            listingSourceType: "AUCTION_HOUSE",
            requestedIngestionMethods: ["PARTNER_API"],
        },
    },
};

function existing(id: string, listingSourceId: string, state: PartnerApplication["state"]) {
    return {
        id,
        state,
        proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId },
    } satisfies PartnerApplication;
}

function mockList(data: PartnerApplication[] | undefined, overrides: Record<string, unknown> = {}) {
    const refetch = vi.fn();
    mocks.list.mockReturnValue({ data, isPending: false, isError: false, refetch, ...overrides });
    return refetch;
}

function mockDetail(data: PartnerApplication | undefined, overrides: Record<string, unknown> = {}) {
    const refetch = vi.fn();
    mocks.detail.mockReturnValue({ data, isPending: false, error: null, refetch, ...overrides });
    return refetch;
}

async function renderSection(props: Parameters<typeof PartnerApplicationsSection>[0] = {}) {
    renderWithRouter(<PartnerApplicationsSection {...props} />, {
        initialEntries: ["/de/partners/applications"],
    });
    // An open dialog hides the page from the accessibility tree.
    await (props.createOpen
        ? screen.findByRole("dialog", { name: "Neuer Antrag" })
        : screen.findByRole("heading", { level: 1, name: "Partner-Anträge." }));
}

async function openCreateDialog() {
    await userEvent.click(screen.getAllByRole("button", { name: "Neuer Antrag" })[0]);
    return screen.getByRole("dialog", { name: "Neuer Antrag" });
}

async function fillRequiredProposal() {
    await userEvent.type(screen.getByLabelText("Name des Anbieters"), "New Source");
    await userEvent.type(screen.getByLabelText(/^Betreiber/), "Operator");
}

describe("immutable application workflow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockList([application]);
        mockDetail(application);
        mocks.getMyListingSources.mockResolvedValue({
            data: {
                items: [
                    {
                        listingSourceId: "ls_owned",
                        listingSourceSlugId: "owned-gallery",
                        name: "Owned Gallery",
                    },
                ],
            },
        });
        mocks.search.mockReturnValue({
            data: [
                {
                    listingSourceId: "ls_canonical",
                    name: "Public Source",
                    operatorName: "Public Operator",
                },
            ],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    describe("list", () => {
        it("renders the page header and minimal own data without timestamps or execution fields", async () => {
            await renderSection();

            expect(
                screen.getByText(/Beantragen Sie Zugriff auf einen Anbieter, den Sie betreiben/),
            ).toBeInTheDocument();
            const open = screen.getByRole("region", { name: "Offen" });
            expect(open).toHaveTextContent("1 wartet auf eine Entscheidung");
            const row = within(open).getByRole("button", { name: /Source/ });
            expect(row).toHaveAttribute("aria-haspopup", "dialog");
            expect(row).toHaveTextContent("Neuer Anbieter · Auktionshaus");
            expect(row).toHaveTextContent(
                "Wartet auf die Prüfung. Bis zur Entscheidung können Sie ihn zurückziehen.",
            );
            expect(within(row).getAllByText("Eingereicht")).toHaveLength(2);
            expect(screen.queryByText("pa_1")).not.toBeInTheDocument();
            expect(screen.queryByText(/PROCESSING|COMPLETED/)).not.toBeInTheDocument();
            expect(screen.queryByRole("region", { name: "Abgeschlossen" })).not.toBeInTheDocument();
            expect(
                screen.getByText(/Mit dem Vorschlag eines öffentlichen Anbieters/),
            ).toBeVisible();
        });

        it("splits open and decided applications and labels every state", async () => {
            mockList([
                application,
                { ...application, id: "pa_review", state: "IN_REVIEW" },
                { ...application, id: "pa_approved", state: "APPROVED" },
                { ...application, id: "pa_rejected", state: "REJECTED" },
                { ...application, id: "pa_withdrawn", state: "WITHDRAWN" },
            ]);
            await renderSection();

            const open = screen.getByRole("region", { name: "Offen" });
            const decided = screen.getByRole("region", { name: "Abgeschlossen" });
            expect(open).toHaveTextContent("2 warten auf eine Entscheidung");
            expect(decided).toHaveTextContent("3 entschieden oder zurückgezogen");
            expect(within(open).getAllByRole("button")).toHaveLength(2);
            expect(within(decided).getAllByRole("button")).toHaveLength(3);

            expect(within(open).getAllByText("In Prüfung")).toHaveLength(2);
            expect(within(open).getByText(/Wir prüfen den Antrag/)).toBeInTheDocument();
            expect(within(decided).getAllByText("Genehmigt")).toHaveLength(2);
            expect(within(decided).getAllByText("Nicht genehmigt")).toHaveLength(2);
            expect(
                within(decided).getByText("Nicht genehmigt. Sie können einen neuen Antrag senden."),
            ).toBeInTheDocument();
            expect(within(decided).getAllByText("Zurückgezogen")).toHaveLength(2);
            expect(
                within(decided).getByText("Sie haben diesen Antrag zurückgezogen."),
            ).toBeInTheDocument();
        });

        it("names existing-provider applications from the granted providers when known", async () => {
            mockList([
                existing("pa_owned", "ls_owned", "SUBMITTED"),
                existing("pa_unknown", "ls_unknown", "SUBMITTED"),
            ]);
            await renderSection();

            const known = await screen.findByRole("button", { name: /Owned Gallery/ });
            expect(known).toHaveTextContent("Bestehender Anbieter · ls_owned");
            const unknown = screen.getByRole("button", { name: /ls_unknown/ });
            expect(unknown).toHaveTextContent("Bestehender Anbieter · Name nicht verfügbar");
            expect(mocks.getMyListingSources).toHaveBeenCalled();
        });

        it("renders a loading state", async () => {
            mockList(undefined, { isPending: true });
            await renderSection();

            expect(screen.getByRole("status")).toHaveTextContent("Partneranträge werden geladen.");
        });

        it("renders a load error and retries", async () => {
            const refetch = mockList(undefined, { isError: true });
            await renderSection();

            const alert = screen.getByRole("alert");
            expect(
                within(alert).getByRole("heading", { name: "Anträge nicht verfügbar." }),
            ).toBeInTheDocument();
            expect(alert).toHaveTextContent("Ihre Partneranträge konnten nicht geladen werden.");
            await userEvent.click(within(alert).getByRole("button", { name: "Erneut versuchen" }));
            expect(refetch).toHaveBeenCalledOnce();
        });

        it("renders the empty list with a new application and a programme link", async () => {
            mockList([]);
            await renderSection();

            expect(
                screen.getByRole("heading", { name: "Noch keine Anträge." }),
            ).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: "Neuer Antrag" })).toHaveLength(2);
            expect(
                screen.getByRole("link", { name: "So funktioniert das Programm" }),
            ).toHaveAttribute("href", "/de/partner-program");

            await userEvent.click(screen.getAllByRole("button", { name: "Neuer Antrag" })[1]);
            expect(screen.getByRole("dialog", { name: "Neuer Antrag" })).toBeInTheDocument();
        });
    });

    describe("details", () => {
        async function openDetails(name: RegExp | string = /Source/) {
            await userEvent.click(await screen.findByRole("button", { name }));
            return screen.getByRole("dialog");
        }

        it("shows the proposed provider's facts", async () => {
            mockDetail({
                ...application,
                proposal: {
                    type: "PROPOSED_LISTING_SOURCE",
                    party: { name: "Operator", email: "ops@example.com" },
                    listingSource: {
                        name: "Source",
                        url: "https://source.example",
                        listingSourceType: "AUCTION_HOUSE",
                        requestedIngestionMethods: ["PARTNER_API", "SHOPIFY"],
                    },
                },
            });
            await renderSection();
            const dialog = await openDetails();

            expect(dialog).toHaveAccessibleName("Source");
            expect(dialog).toHaveAccessibleDescription(
                "Wartet auf die Prüfung. Bis zur Entscheidung können Sie ihn zurückziehen.",
            );
            expect(dialog).toHaveTextContent("Neuer Anbieter · Auktionshaus");
            expect(within(dialog).getByText("Eingereicht")).toBeInTheDocument();
            const facts = Object.fromEntries(
                within(dialog)
                    .getAllByRole("term")
                    .map((term) => [term.textContent, term.nextElementSibling?.textContent]),
            );
            expect(facts).toEqual({
                Website: "https://source.example",
                "Bild-URL": "—",
                Betreiber: "Operator",
                Telefon: "—",
                "E-Mail": "ops@example.com",
                Anbindungen: "Partner-API, Shopify",
                "Antrags-ID": "pa_1",
            });
        });

        it("shows the provider and application IDs for an existing provider", async () => {
            const owned = existing("pa_owned", "ls_owned", "APPROVED");
            mockList([owned]);
            mockDetail(owned);
            await renderSection();
            const dialog = await openDetails(/Owned Gallery/);

            expect(dialog).toHaveAccessibleName("Owned Gallery");
            const terms = within(dialog).getAllByRole("term");
            expect(terms.map((term) => term.textContent)).toEqual(["Anbieter-ID", "Antrags-ID"]);
            expect(terms[0].nextElementSibling).toHaveTextContent("ls_owned");
            expect(terms[1].nextElementSibling).toHaveTextContent("pa_owned");
            expect(within(dialog).getByRole("link", { name: "Anbieter ansehen" })).toHaveAttribute(
                "href",
                "/de/partners/shop-access",
            );
            expect(
                within(dialog).queryByRole("button", { name: "Antrag zurückziehen" }),
            ).not.toBeInTheDocument();
        });

        it("renders withdrawn applications and hides withdrawal", async () => {
            const withdrawn = { ...application, state: "WITHDRAWN" as const };
            mockList([withdrawn]);
            mockDetail(withdrawn);
            await renderSection();
            const dialog = await openDetails();

            expect(within(dialog).getByText("Zurückgezogen")).toBeInTheDocument();
            expect(
                within(dialog).queryByRole("button", { name: "Antrag zurückziehen" }),
            ).not.toBeInTheDocument();
            expect(
                within(dialog).queryByRole("link", { name: "Anbieter ansehen" }),
            ).not.toBeInTheDocument();
        });

        it("requires confirmation before withdrawal and exposes no edit action", async () => {
            mocks.withdraw.mockImplementation((_id: string, options: { onSuccess: () => void }) =>
                options.onSuccess(),
            );
            await renderSection();
            const dialog = await openDetails();

            expect(within(dialog).queryByRole("button", { name: /bearbeiten/i })).toBeNull();
            await userEvent.click(
                within(dialog).getByRole("button", { name: "Antrag zurückziehen" }),
            );
            expect(mocks.withdraw).not.toHaveBeenCalled();

            const confirm = within(dialog).getByRole("group", { name: "Antrag zurückziehen?" });
            await userEvent.click(within(confirm).getByRole("button", { name: "Antrag behalten" }));
            expect(within(dialog).queryByRole("group")).not.toBeInTheDocument();
            expect(mocks.withdraw).not.toHaveBeenCalled();

            await userEvent.click(
                within(dialog).getByRole("button", { name: "Antrag zurückziehen" }),
            );
            await userEvent.click(
                within(
                    within(dialog).getByRole("group", { name: "Antrag zurückziehen?" }),
                ).getByRole("button", { name: "Zurückziehen" }),
            );
            expect(mocks.withdraw).toHaveBeenCalledWith("pa_1", expect.any(Object));
            expect(toast.success).toHaveBeenCalledWith("Antrag zurückgezogen.");
            expect(within(dialog).queryByRole("group")).not.toBeInTheDocument();
        });

        it("closes the details", async () => {
            await renderSection();
            const dialog = await openDetails();

            const closeButtons = within(dialog).getAllByRole("button", { name: "Schließen" });
            await userEvent.click(closeButtons[0]);
            await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        });

        it("shows a loading state while the details load", async () => {
            mockDetail(undefined, { isPending: true });
            await renderSection();
            const dialog = await openDetails();

            expect(dialog).toHaveAccessibleName("Details ansehen");
            expect(within(dialog).getByRole("status")).toHaveTextContent("Antrag wird geladen…");
        });

        it("shows missing application errors and retries", async () => {
            const refetch = mockDetail(undefined, {
                error: new Error("Bewerbung nicht gefunden oder nicht verfügbar."),
            });
            await renderSection();
            const dialog = await openDetails();

            const alert = within(dialog).getByRole("alert");
            expect(alert).toHaveTextContent("Bewerbung nicht gefunden");
            await userEvent.click(within(alert).getByRole("button", { name: "Erneut versuchen" }));
            expect(refetch).toHaveBeenCalledOnce();
        });
    });

    describe("create", () => {
        it("opens when the page asks and reports closing", async () => {
            const onCreateOpenChange = vi.fn();
            await renderSection({ createOpen: true, onCreateOpenChange });

            const dialog = screen.getByRole("dialog", { name: "Neuer Antrag" });
            await userEvent.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
            expect(onCreateOpenChange).toHaveBeenCalledWith(false);
        });

        it("offers both kinds of application and proposes a new provider by default", async () => {
            await renderSection();
            const dialog = await openCreateDialog();

            const kinds = within(dialog).getByRole("group", {
                name: "Was trifft auf Ihren Shop zu?",
            });
            expect(within(kinds).getByRole("radio", { name: EXISTING_KIND })).not.toBeChecked();
            expect(within(kinds).getByRole("radio", { name: PROPOSED_KIND })).toBeChecked();

            const fieldOrder = [
                "Name des Anbieters",
                "Website (optional)",
                "Bild-URL (optional)",
                "Betreiber",
                "Telefon (optional)",
                "E-Mail (optional)",
            ].map((label) => within(dialog).getByLabelText(label));
            for (const [index, field] of fieldOrder.slice(1).entries()) {
                expect(
                    fieldOrder[index].compareDocumentPosition(field) &
                        Node.DOCUMENT_POSITION_FOLLOWING,
                ).toBeTruthy();
            }
            expect(within(dialog).getByLabelText("Betreiber")).toHaveAccessibleDescription(
                "Die Person oder das Unternehmen, das den Anbieter betreibt.",
            );
            expect(
                within(dialog).getByRole("checkbox", { name: "Unsere eigene Integration (API)" }),
            ).not.toBeChecked();
        });

        it.each([
            ["E-Mail (optional)", "invalid-email", "emailInvalid"],
            ["Website (optional)", "invalid-url", "urlInvalid"],
            ["Bild-URL (optional)", "invalid-url", "urlInvalid"],
        ])("shows localized schema errors for invalid %s", async (label, value, validationKey) => {
            await renderSection();
            await openCreateDialog();
            await fillRequiredProposal();
            const input = screen.getByLabelText(label) as HTMLInputElement;
            expect(input.form?.noValidate).toBe(true);
            await userEvent.type(input, value);
            await userEvent.click(screen.getByRole("button", { name: SEND }));
            expect(
                await screen.findByText(
                    testI18n.t(`partnerApplications.create.validation.${validationKey}`),
                ),
            ).toBeInTheDocument();
            expect(input).toHaveAttribute("aria-invalid", "true");
            expect(mocks.create).not.toHaveBeenCalled();
        });

        it("submits the proposed variant with omitted empty contacts", async () => {
            mocks.create.mockImplementation(
                (_proposal: unknown, options: { onSuccess: () => void }) => options.onSuccess(),
            );
            const onCreateOpenChange = vi.fn();
            await renderSection({ onCreateOpenChange });
            await openCreateDialog();
            await fillRequiredProposal();
            await userEvent.click(screen.getByRole("radio", { name: "Auktionshaus" }));
            await userEvent.click(
                screen.getByRole("checkbox", { name: "Unsere eigene Integration (API)" }),
            );
            await userEvent.click(screen.getByRole("button", { name: SEND }));
            await waitFor(() =>
                expect(mocks.create).toHaveBeenCalledWith(
                    {
                        type: "PROPOSED_LISTING_SOURCE",
                        party: { name: "Operator" },
                        listingSource: {
                            name: "New Source",
                            listingSourceType: "AUCTION_HOUSE",
                            requestedIngestionMethods: ["PARTNER_API"],
                        },
                    },
                    expect.any(Object),
                ),
            );
            expect(toast.success).toHaveBeenCalledWith("Antrag gesendet.");
            expect(onCreateOpenChange).toHaveBeenLastCalledWith(false);
            await waitFor(() =>
                expect(
                    screen.queryByRole("dialog", { name: "Neuer Antrag" }),
                ).not.toBeInTheDocument(),
            );
        });

        it("focuses the provider type and announces the error when none is chosen", async () => {
            await renderSection();
            await openCreateDialog();
            await fillRequiredProposal();
            await userEvent.click(screen.getByRole("button", { name: SEND }));
            expect(await screen.findByRole("alert")).toHaveTextContent(
                "Wählen Sie die Art des Anbieters aus.",
            );
            expect(screen.getByRole("radio", { name: "Händler" })).toHaveFocus();
            expect(screen.getByRole("radio", { name: "Auktionshaus" })).toHaveAccessibleDescription(
                /Wählen Sie die Art des Anbieters aus\./,
            );
            expect(mocks.create).not.toHaveBeenCalled();
        });

        it("focuses the first invalid field in page order when nothing is filled", async () => {
            await renderSection();
            await openCreateDialog();
            await userEvent.click(screen.getByRole("button", { name: SEND }));
            await waitFor(() => expect(screen.getByLabelText("Name des Anbieters")).toHaveFocus());
            expect(screen.getAllByText("Dieses Feld ist erforderlich.")).toHaveLength(2);
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Wählen Sie die Art des Anbieters aus.",
            );
            expect(mocks.create).not.toHaveBeenCalled();
        });

        it("focuses the operator after the provider fields when only it is missing", async () => {
            await renderSection();
            await openCreateDialog();
            await userEvent.type(screen.getByLabelText("Name des Anbieters"), "New Source");
            await userEvent.click(screen.getByRole("radio", { name: "Händler" }));
            await userEvent.click(screen.getByRole("button", { name: SEND }));
            await waitFor(() => expect(screen.getByLabelText("Betreiber")).toHaveFocus());
            expect(screen.getByLabelText("Betreiber")).toHaveAttribute("aria-invalid", "true");
        });

        it("clears the provider-type error once a type is chosen", async () => {
            await renderSection();
            await openCreateDialog();
            await fillRequiredProposal();
            await userEvent.click(screen.getByRole("button", { name: SEND }));
            const legend = (await screen.findByRole("alert"))
                .closest("fieldset")
                ?.querySelector("legend");
            expect(legend).toHaveAttribute("data-error", "true");
            await userEvent.click(screen.getByRole("radio", { name: "Marktplatz" }));
            await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
            expect(legend).toHaveAttribute("data-error", "false");
            expect(screen.getByRole("radio", { name: "Marktplatz" })).toHaveAccessibleDescription(
                "Bietet anderen Verkäufern Raum für Festpreisangebote.",
            );
        });

        it("resets the provider type when the application kind changes", async () => {
            await renderSection();
            await openCreateDialog();
            await userEvent.click(screen.getByRole("radio", { name: "Auktionshaus" }));
            await userEvent.click(screen.getByRole("radio", { name: EXISTING_KIND }));
            expect(screen.queryByRole("radio", { name: "Auktionshaus" })).not.toBeInTheDocument();
            expect(screen.queryByLabelText("Name des Anbieters")).not.toBeInTheDocument();
            await userEvent.click(screen.getByRole("radio", { name: PROPOSED_KIND }));
            expect(screen.getByRole("radio", { name: "Auktionshaus" })).not.toBeChecked();
            for (const type of ["Händler", "Marktplatz", "Auktionsplattform"]) {
                expect(screen.getByRole("radio", { name: type })).not.toBeChecked();
            }
        });

        it("selects and submits the public canonical ID, not a slug", async () => {
            await renderSection();
            const dialog = await openCreateDialog();
            await userEvent.click(screen.getByRole("radio", { name: EXISTING_KIND }));
            expect(within(dialog).getByRole("button", { name: SEND })).toBeDisabled();

            await userEvent.type(screen.getByRole("searchbox", { name: "Anbieter" }), "Public");
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 400));
            });
            expect(mocks.search).toHaveBeenLastCalledWith("Public");
            await userEvent.click(
                screen.getByRole("button", {
                    name: /^Public Source\s*Betrieben von Public Operator$/,
                }),
            );

            expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
            expect(dialog).toHaveTextContent("Public SourceBetrieben von Public Operator");
            await userEvent.click(within(dialog).getByRole("button", { name: SEND }));
            await waitFor(() =>
                expect(mocks.create).toHaveBeenCalledWith(
                    { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_canonical" },
                    expect.any(Object),
                ),
            );
        });

        it("changes the chosen provider", async () => {
            await renderSection();
            const dialog = await openCreateDialog();
            await userEvent.click(screen.getByRole("radio", { name: EXISTING_KIND }));
            await userEvent.type(screen.getByRole("searchbox", { name: "Anbieter" }), "Public");
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 400));
            });
            await userEvent.click(screen.getByRole("button", { name: /^Public Source/ }));
            await userEvent.click(within(dialog).getByRole("button", { name: "Ändern" }));

            expect(screen.getByRole("searchbox", { name: "Anbieter" })).toHaveValue("");
            expect(within(dialog).getByRole("button", { name: SEND })).toBeDisabled();
        });
    });
});
