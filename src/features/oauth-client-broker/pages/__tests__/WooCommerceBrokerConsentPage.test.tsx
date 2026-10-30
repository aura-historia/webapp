import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { WooCommerceBrokerConsentPage } from "@/features/oauth-client-broker/pages/WooCommerceBrokerConsentPage.tsx";
import type { BrokerConsentSearchParams } from "@/features/oauth-client-broker/lib/brokerConsentSearchParams.ts";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";

const TRANSACTION_ID = "q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I";
const MERCHANT_REDIRECT_URI =
    "https://shop.example/wp-admin/admin.php?page=aura-historia-partner-connect";

const mockUseBrokerConsent = vi.hoisted(() => vi.fn());
vi.mock("@/features/oauth-client-broker/hooks/useBrokerConsent.ts", () => ({
    useBrokerConsent: mockUseBrokerConsent,
}));

const mockUseOAuthClient = vi.hoisted(() => vi.fn());
vi.mock("@/features/oauth/hooks/useOAuthClient.ts", () => ({
    useOAuthClient: mockUseOAuthClient,
}));

const mockUseOAuthListingSources = vi.hoisted(() => vi.fn());
vi.mock("@/features/oauth/hooks/useOAuthListingSources.ts", () => ({
    useOAuthListingSources: mockUseOAuthListingSources,
}));

const pendingConsent = {
    status: "pending" as const,
    transactionId: TRANSACTION_ID,
    clientId: "oc_01m5vyvraxecksre2zepjcza88",
    merchantRedirectUri: MERCHANT_REDIRECT_URI,
    recipient: "https://shop.example/",
    scopes: ["product-listings:write"],
};

function sources(items: Array<{ listingSourceId: string; name: string }>, hasMore = false) {
    return {
        sources: items,
        isPending: false,
        isError: false,
        hasMore,
        canLoadMore: hasMore,
        isLoadingMore: false,
        isLoadMoreError: false,
        loadMore: vi.fn(),
        retry: vi.fn(),
    };
}

async function renderPage(searchParams: BrokerConsentSearchParams) {
    await act(async () =>
        renderWithRouter(<WooCommerceBrokerConsentPage searchParams={searchParams} />),
    );
}

function formFields(button: HTMLElement) {
    const form = button.closest("form");
    if (!form) throw new Error("Form not found");
    return {
        action: form.getAttribute("action"),
        method: form.getAttribute("method"),
        fields: Object.fromEntries(new FormData(form)),
    };
}

describe("WooCommerceBrokerConsentPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseBrokerConsent.mockReturnValue({
            isPending: false,
            isError: false,
            data: pendingConsent,
        });
        mockUseOAuthClient.mockReturnValue({
            data: {
                clientId: pendingConsent.clientId,
                clientName: "Aura Historia for WooCommerce",
                tosUri: "",
                policyUri: "",
                clientUri: "",
                logoUri: "",
                redirectUris: [],
                scopes: ["product-listings:write"],
            },
            isLoading: false,
            isError: false,
        });
        mockUseOAuthListingSources.mockReturnValue(
            sources([{ listingSourceId: "ls_6rd827eqfefsva9teecmwa3ate", name: "Shop Example" }]),
        );
    });

    it("shows the stored recipient, client and scopes", async () => {
        await renderPage({ transaction_id: TRANSACTION_ID });

        expect(mockUseBrokerConsent).toHaveBeenCalledWith(TRANSACTION_ID);
        expect(mockUseOAuthClient).toHaveBeenCalledWith(pendingConsent.clientId);
        expect(screen.getByText("Empfänger der Verbindung")).toBeInTheDocument();
        expect(screen.getByText("shop.example")).toBeInTheDocument();
        expect(screen.getByText(MERCHANT_REDIRECT_URI)).toBeInTheDocument();
        expect(screen.getByText("Aura Historia for WooCommerce")).toBeInTheDocument();
        expect(screen.getByText("product-listings:write")).toBeInTheDocument();
        expect(screen.getByText("Shop Example")).toBeInTheDocument();
    });

    it("submits only the transaction reference and the chosen source", async () => {
        await renderPage({ transaction_id: TRANSACTION_ID });

        const approve = formFields(
            screen.getByRole("button", {
                name: "Aura Historia for WooCommerce den Zugriff auf Ihr Konto erlauben",
            }),
        );
        expect(approve).toEqual({
            action: "/api/oauth/broker/woocommerce/approve",
            method: "post",
            fields: {
                lng: "de",
                transaction_id: TRANSACTION_ID,
                listing_source_id: "ls_6rd827eqfefsva9teecmwa3ate",
            },
        });

        const deny = formFields(
            screen.getByRole("button", {
                name: "Autorisierung für Aura Historia for WooCommerce ablehnen",
            }),
        );
        expect(deny.action).toBe("/api/oauth/broker/woocommerce/deny");
        expect(deny.fields).toEqual(approve.fields);
    });

    it("requires a choice among several sources before approval", async () => {
        mockUseOAuthListingSources.mockReturnValue(
            sources([
                { listingSourceId: "ls_6rd827eqfefsva9teecmwa3ate", name: "Shop Example" },
                { listingSourceId: "ls_11j55nbvjfe7ds34s7gya899a9", name: "Second Shop" },
            ]),
        );
        await renderPage({ transaction_id: TRANSACTION_ID });

        const approveButton = screen.getByRole("button", {
            name: "Aura Historia for WooCommerce den Zugriff auf Ihr Konto erlauben",
        });
        expect(approveButton).toBeDisabled();
        expect(formFields(approveButton).fields).not.toHaveProperty("listing_source_id");

        await userEvent.click(screen.getByText("Second Shop"));

        expect(approveButton).toBeEnabled();
        expect(formFields(approveButton).fields.listing_source_id).toBe(
            "ls_11j55nbvjfe7ds34s7gya899a9",
        );
    });

    it("does not preselect a single loaded source while more pages exist", async () => {
        mockUseOAuthListingSources.mockReturnValue(
            sources(
                [{ listingSourceId: "ls_6rd827eqfefsva9teecmwa3ate", name: "Shop Example" }],
                true,
            ),
        );
        await renderPage({ transaction_id: TRANSACTION_ID });

        expect(
            screen.getByRole("button", {
                name: "Aura Historia for WooCommerce den Zugriff auf Ihr Konto erlauben",
            }),
        ).toBeDisabled();
    });

    it("explains a recipient that is not registered for the chosen source", async () => {
        await renderPage({
            transaction_id: TRANSACTION_ID,
            broker_error: "recipient_not_registered",
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Diese Website ist für den gewählten Anbieter nicht hinterlegt",
        );
        expect(screen.getByRole("alert")).toHaveTextContent("shop.example");
    });

    it.each([
        ["declined", "Verbindung abgelehnt"],
        ["answered", "Diese Verbindungsanfrage wurde bereits beantwortet"],
        ["invalid", "Diese Verbindungsanfrage ist nicht mehr gültig"],
    ] as const)("shows the %s state without decision forms", async (status, title) => {
        mockUseBrokerConsent.mockReturnValue({
            isPending: false,
            isError: false,
            data: { status },
        });
        await renderPage({ transaction_id: TRANSACTION_ID });

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it.each([
        [{ broker_error: "session_mismatch" as const }, "Verbindung konnte nicht bestätigt werden"],
        [{ broker_error: "unavailable" as const }, "Verbindung nicht verfügbar"],
        [
            { broker_error: "invalid_request" as const },
            "Diese Verbindungsanfrage ist nicht mehr gültig",
        ],
        [{}, "Diese Verbindungsanfrage ist nicht mehr gültig"],
        [{ transaction_id: "not-a-reference" }, "Diese Verbindungsanfrage ist nicht mehr gültig"],
    ])("shows a terminal page for %o without reading the transaction", async (search, title) => {
        await renderPage(search);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(mockUseBrokerConsent).not.toHaveBeenCalled();
    });

    it("shows a loading frame while the transaction is read", async () => {
        mockUseBrokerConsent.mockReturnValue({ isPending: true, isError: false, data: undefined });
        await renderPage({ transaction_id: TRANSACTION_ID });

        expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it.each([
        [
            "unavailable client metadata",
            () =>
                mockUseOAuthClient.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                    isError: true,
                    error: new OAuthConsentUnavailableError(),
                }),
            "Autorisierung nicht verfügbar",
        ],
        [
            "unreadable source grants",
            () =>
                mockUseOAuthListingSources.mockReturnValue({
                    ...sources([]),
                    isError: true,
                }),
            "Anbieter konnten nicht geladen werden",
        ],
        [
            "no granted source",
            () => mockUseOAuthListingSources.mockReturnValue(sources([])),
            "Kein Anbieter verfügbar",
        ],
    ])("offers no decision with %s", async (_, arrange, title) => {
        arrange();
        await renderPage({ transaction_id: TRANSACTION_ID });

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows the unavailable state when the transaction cannot be read", async () => {
        mockUseBrokerConsent.mockReturnValue({ isPending: false, isError: true, data: undefined });
        await renderPage({ transaction_id: TRANSACTION_ID });

        expect(screen.getByText("Verbindung nicht verfügbar")).toBeInTheDocument();
    });
});
