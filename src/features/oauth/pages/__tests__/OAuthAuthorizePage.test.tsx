import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";
import { ACCESS_TOKEN_SCOPES } from "@/data/internal/access-tokens/AccessTokenScope.ts";

const mockClientData = vi.hoisted(() => ({
    clientId: "01970f22-2bf0-7000-8000-000000000010",
    clientName: "Test Partner App",
    tosUri: "https://client.example/terms",
    policyUri: "https://client.example/privacy",
    clientUri: "https://client.example",
    logoUri: "https://client.example/logo.png",
    redirectUris: ["https://client.example/callback"],
    scopes: ["product-listings:write" as const, "watchlist:read" as const],
}));

const mockUseOAuthClient = vi.hoisted(() =>
    vi.fn().mockReturnValue({
        data: mockClientData,
        isLoading: false,
        isError: false,
    }),
);

const mockUseOAuthListingSources = vi.hoisted(() =>
    vi.fn().mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
    }),
);

vi.mock("@/features/oauth/hooks/useOAuthClient.ts", () => ({
    useOAuthClient: mockUseOAuthClient,
}));

vi.mock("@/features/oauth/hooks/useOAuthListingSources.ts", () => ({
    useOAuthListingSources: mockUseOAuthListingSources,
}));

const defaultSearchParams: OAuthAuthorizeSearchParams = {
    response_type: "code",
    client_id: "01970f22-2bf0-7000-8000-000000000010",
    redirect_uri: "https://client.example/callback",
    scope: "product-listings:write watchlist:read",
    state: "csrf-state-123",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
    requires_listing_source_id: false,
};

describe("OAuthAuthorizePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseOAuthClient.mockReturnValue({
            data: mockClientData,
            isLoading: false,
            isError: false,
        });
        mockUseOAuthListingSources.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });
    });

    it("renders the authorization page with client name", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByText("Anwendung autorisieren")).toBeInTheDocument();
        expect(screen.getByText("Test Partner App")).toBeInTheDocument();
    });

    it("displays app logo and client metadata links", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByAltText("Logo von Test Partner App")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: "Mehr über diese App",
            }),
        ).toHaveAttribute("href", "https://client.example");
        expect(
            screen.getByRole("link", {
                name: "Datenschutz",
            }),
        ).toHaveAttribute("href", "https://client.example/privacy");
        expect(
            screen.getByRole("link", {
                name: "Nutzungsbedingungen",
            }),
        ).toHaveAttribute("href", "https://client.example/terms");
    });

    it("displays requested scope tags with short descriptions", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByText("product-listings:write")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Produktangebote im Rahmen der Ihrem Konto gewährten Zugriffsrechte erstellen, aktualisieren oder löschen.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("watchlist:read")).toBeInTheDocument();
        expect(screen.getByText("Die Angebote in Ihrer Merkliste lesen.")).toBeInTheDocument();
    });

    it("displays the authorization description with app name", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(
            screen.getByText(/"Test Partner App" möchte auf Ihr Aura-Historia-Konto zugreifen/),
        ).toBeInTheDocument();
    });

    it("displays security note", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByText(/Sie können diesen Zugriff jederzeit/)).toBeInTheDocument();
    });

    it("renders authorize and decline buttons", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(
            screen.getByRole("button", {
                name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: "Autorisierung für Test Partner App ablehnen",
            }),
        ).toBeInTheDocument();
    });

    it("submits approval through a native form with OAuth fields", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        const form = approveButton.closest("form");

        if (!form) {
            throw new Error("Approve form not found");
        }

        expect(form).toHaveAttribute("action", "/api/oauth/authorize/approve");
        expect(form).toHaveAttribute("method", "post");

        const formData = new FormData(form);
        expect(Object.fromEntries(formData)).toEqual({
            lng: "de",
            requires_listing_source_id: "false",
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            scope: "product-listings:write watchlist:read",
            state: "csrf-state-123",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        });
    });

    it("submits denial through the server form so redirects and broker state are validated", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );
        const deny = screen.getByRole("button", {
            name: "Autorisierung für Test Partner App ablehnen",
        });
        expect(deny).toHaveAttribute("type", "submit");
        expect(deny).toHaveAttribute("name", "decision");
        expect(deny).toHaveAttribute("value", "deny");
        const formId = deny.getAttribute("form");
        expect(formId).toBeTruthy();
        expect(document.getElementById(formId ?? "")).toHaveAttribute(
            "action",
            "/api/oauth/authorize/approve",
        );
    });
    it("shows skeleton when client data is loading", async () => {
        mockUseOAuthClient.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        const { container } = await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(container.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
        expect(screen.queryByText("Test Partner App")).not.toBeInTheDocument();
    });

    it("shows error state when client fetch fails", async () => {
        mockUseOAuthClient.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByText("Ungültige Autorisierungsanfrage")).toBeInTheDocument();
        expect(
            screen.getByText(/Die Anwendung konnte nicht identifiziert werden/),
        ).toBeInTheDocument();
    });

    it("explains unavailable metadata without presenting an approval form", async () => {
        mockUseOAuthClient.mockImplementation(() => ({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new OAuthConsentUnavailableError(),
        }));
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );
        expect(screen.getByText("Autorisierung nicht verfügbar")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /den Zugriff/ })).not.toBeInTheDocument();
    });

    it("renders every supported scope exactly as requested using the shared metadata", async () => {
        mockUseOAuthClient.mockImplementation(() => ({
            data: { ...mockClientData, scopes: [...ACCESS_TOKEN_SCOPES] },
            isLoading: false,
            isError: false,
        }));
        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, scope: ACCESS_TOKEN_SCOPES.join(" ") }}
                />,
            ),
        );
        expect(screen.getAllByRole("listitem")).toHaveLength(ACCESS_TOKEN_SCOPES.length);
        for (const scope of ACCESS_TOKEN_SCOPES)
            expect(screen.getByText(scope)).toBeInTheDocument();
    });

    it("renders without scopes when scope param is missing", async () => {
        const searchParamsWithoutScope = {
            ...defaultSearchParams,
            scope: undefined,
        };

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={searchParamsWithoutScope} />),
        );

        expect(screen.getByText("Test Partner App")).toBeInTheDocument();
        expect(screen.queryByText("Produkte verwalten")).not.toBeInTheDocument();
        expect(
            screen.queryByText("Diese Anwendung fordert folgende Berechtigungen an:"),
        ).not.toBeInTheDocument();
    });

    it("renders scope list with correct aria-label", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        const scopeList = screen.getByRole("list", {
            name: "Diese Anwendung fordert folgende Berechtigungen an:",
        });
        expect(scopeList).toBeInTheDocument();

        const scopeItems = screen.getAllByRole("listitem");
        expect(scopeItems).toHaveLength(2);
    });

    it("passes correct client_id to useOAuthClient hook", async () => {
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(mockUseOAuthClient).toHaveBeenCalledWith("01970f22-2bf0-7000-8000-000000000010");
    });

    it("submits the only available partner shop separately from the redirect URI", async () => {
        mockUseOAuthListingSources.mockReturnValue({
            data: [{ listingSourceId: "shop-1", name: "Only Shop" }],
            isLoading: false,
            isError: false,
        });

        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />,
            ),
        );

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        const form = approveButton.closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }

        const formData = new FormData(form);
        expect(formData.get("redirect_uri")).toBe("https://client.example/callback");
        expect(formData.get("listing_source_id")).toBe("shop-1");
        expect(screen.getByText("Ausgewählte Listing-Quelle")).toBeInTheDocument();
        expect(screen.getByText("Only Shop")).toBeInTheDocument();
    });

    it("shows an error when a partner shop is required but none are available", async () => {
        mockUseOAuthListingSources.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        });

        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />,
            ),
        );

        expect(screen.getByText("Keine Listing-Quelle verfügbar")).toBeInTheDocument();
        expect(
            screen.getByText(/Für diese Integration benötigen Sie Zugriff auf eine Listing-Quelle/),
        ).toBeInTheDocument();
    });

    it("lets the user choose a partner shop when multiple are available", async () => {
        const user = userEvent.setup();
        mockUseOAuthListingSources.mockReturnValue({
            data: [
                { listingSourceId: "shop-1", name: "First Shop" },
                { listingSourceId: "shop-2", name: "Second Shop" },
            ],
            isLoading: false,
            isError: false,
        });

        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />,
            ),
        );

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        expect(approveButton).toBeDisabled();

        await user.click(screen.getByRole("radio", { name: /Second Shop/ }));

        expect(approveButton).toBeEnabled();
        expect(screen.queryByText("Ausgewählte Listing-Quelle")).not.toBeInTheDocument();
        expect(screen.getByText("Second Shop")).toBeInTheDocument();

        const form = approveButton.closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }

        const formData = new FormData(form);
        expect(formData.get("redirect_uri")).toBe("https://client.example/callback");
        expect(formData.get("listing_source_id")).toBe("shop-2");
    });

    it("clears a manual partner shop selection when the authorization request changes", async () => {
        const user = userEvent.setup();
        let updateSearchParams: (searchParams: typeof defaultSearchParams) => void = () => {};
        mockUseOAuthListingSources.mockReturnValue({
            data: [
                { listingSourceId: "shop-1", name: "First Shop" },
                { listingSourceId: "shop-2", name: "Second Shop" },
            ],
            isLoading: false,
            isError: false,
        });

        function OAuthAuthorizePageHarness() {
            const [searchParams, setSearchParams] = useState({
                ...defaultSearchParams,
                requires_listing_source_id: true,
            });
            updateSearchParams = setSearchParams;

            return <OAuthAuthorizePage searchParams={searchParams} />;
        }

        await act(async () => renderWithRouter(<OAuthAuthorizePageHarness />));

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        await user.click(screen.getByRole("radio", { name: /Second Shop/ }));
        expect(approveButton).toBeEnabled();

        act(() =>
            updateSearchParams({
                ...defaultSearchParams,
                state: "next-csrf-state",
                requires_listing_source_id: true,
            }),
        );

        await waitFor(() => expect(approveButton).toBeDisabled());
        const form = approveButton.closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }

        expect(new FormData(form).get("redirect_uri")).toBe("https://client.example/callback");
        expect(new FormData(form).has("listing_source_id")).toBe(false);
    });

    it("omits optional approval fields and unsafe client links when values are missing", async () => {
        mockUseOAuthClient.mockReturnValue({
            data: {
                ...mockClientData,
                clientUri: "http://client.example",
                logoUri: undefined,
                policyUri: "not-a-url",
                tosUri: undefined,
            },
            isLoading: false,
            isError: false,
        });
        const searchParamsWithoutOptionals = {
            ...defaultSearchParams,
            scope: undefined,
            state: undefined,
        };

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={searchParamsWithoutOptionals} />),
        );

        expect(screen.queryByAltText("Logo von Test Partner App")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Mehr über diese App" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Datenschutz" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Nutzungsbedingungen" })).not.toBeInTheDocument();

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        const form = approveButton.closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }

        const formData = new FormData(form);
        expect(formData.has("scope")).toBe(false);
        expect(formData.has("state")).toBe(false);
    });

    it("handles single scope correctly", async () => {
        const singleScopeParams = {
            ...defaultSearchParams,
            scope: "product-listings:write",
        };

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={singleScopeParams} />),
        );

        expect(screen.getByText("product-listings:write")).toBeInTheDocument();
        expect(screen.queryByText("watchlist:read")).not.toBeInTheDocument();
    });
});
