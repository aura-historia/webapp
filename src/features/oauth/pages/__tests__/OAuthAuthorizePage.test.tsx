import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { OAuthConsentUnavailableError } from "@/features/oauth/api/oauthConsentMetadata.ts";
import {
    ACCESS_TOKEN_SCOPES,
    ACCESS_TOKEN_SCOPE_METADATA,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import testI18n from "@/i18n/i18nForTests.ts";
import { env } from "@/env.ts";
import type { PartnerApplicationState } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@tanstack/react-router")>()),
    useNavigate: () => navigate,
}));

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

type ListingSourcesState = {
    sources: { listingSourceId: string; name: string }[];
    isPending?: boolean;
    isError?: boolean;
    hasMore?: boolean;
};

const loadMoreListingSources = vi.hoisted(() => vi.fn());
const mockUseOAuthListingSources = vi.hoisted(() => vi.fn());

function listingSourcesState({
    sources,
    isPending = false,
    isError = false,
    hasMore = false,
}: ListingSourcesState) {
    return {
        sources,
        isPending,
        isError,
        hasMore,
        canLoadMore: hasMore,
        isLoadingMore: false,
        isLoadMoreError: false,
        loadMore: loadMoreListingSources,
        isRefreshing: false,
        retry: retryListingSources,
    };
}

const retryListingSources = vi.hoisted(() => vi.fn());
const refetchApplications = vi.hoisted(() => vi.fn());
const mockUsePartnerApplications = vi.hoisted(() => vi.fn());
vi.mock(
    "@/features/partner/application-management/api/usePartnerApplications.ts",
    async (importOriginal) => ({
        ...(await importOriginal<
            typeof import("@/features/partner/application-management/api/usePartnerApplications.ts")
        >()),
        usePartnerApplications: mockUsePartnerApplications,
    }),
);

function applicationsState(states: readonly PartnerApplicationState[] = []) {
    return {
        data: states.map((state, index) => ({
            id: `application-${index}`,
            state,
            proposal: {
                type: "PROPOSED_LISTING_SOURCE" as const,
                party: { name: "Lenbach Kunsthandel" },
                listingSource: {
                    name: `Galerie ${index}`,
                    listingSourceType: "DEALER" as const,
                    requestedIngestionMethods: [],
                },
            },
        })),
        isPending: false,
        isError: false,
        refetch: refetchApplications,
    };
}

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
        mockUseOAuthListingSources.mockReturnValue(listingSourcesState({ sources: [] }));
        mockUsePartnerApplications.mockReturnValue(applicationsState());
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
        mockUseOAuthClient.mockReturnValue({
            data: { ...mockClientData, scopes: [...ACCESS_TOKEN_SCOPES] },
            isLoading: false,
            isError: false,
        });
        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByText("product-listings:write")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Produktangebote im Rahmen der Ihrem Konto gewährten Zugriffsrechte erstellen, aktualisieren, zurückziehen, wiederherstellen oder löschen, etwa von Quellen, die Sie verwalten. Mit Administratorzugriff umfasst dies alle Angebote.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("watchlist:read")).toBeInTheDocument();
        expect(screen.getByText("Die Angebote in Ihrer Merkliste lesen.")).toBeInTheDocument();
        expect(screen.queryByText("listing-sources:write")).not.toBeInTheDocument();
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
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            scope: "product-listings:write watchlist:read",
            state: "csrf-state-123",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        });
    });

    it.each(["merchant-state", undefined])(
        "preserves client-side denial with state %s",
        async (state) => {
            await act(async () =>
                renderWithRouter(
                    <OAuthAuthorizePage searchParams={{ ...defaultSearchParams, state }} />,
                ),
            );
            const deny = screen.getByRole("button", {
                name: "Autorisierung für Test Partner App ablehnen",
            });
            expect(deny).toHaveAttribute("type", "button");
            await userEvent.setup().click(deny);
            const redirected = new URL(navigate.mock.calls[0][0].href);
            expect(redirected.origin).toBe("https://client.example");
            expect(redirected.pathname).toBe("/callback");
            expect(redirected.searchParams.get("error")).toBe("access_denied");
            expect(redirected.searchParams.get("state")).toBe(state ?? null);
            expect(redirected.searchParams.has("listing_source_id")).toBe(false);
        },
    );

    it.each([
        ["an unregistered redirect URI", { redirect_uri: "https://attacker.example/callback" }],
        [
            "an unregistered HTTPS destination with state",
            { redirect_uri: "https://example.com/qa-oauth-callback", state: "qa-browser-consent" },
        ],
        [
            "a redirect URI that only shares the registered prefix",
            { redirect_uri: "https://client.example/callback/../other" },
        ],
        [
            "a redirect URI with an added query",
            { redirect_uri: "https://client.example/callback?next=https://attacker.example" },
        ],
        ["metadata for another client", { client_id: "oc_other_client" }],
    ])("reports %s without offering approval or a denial redirect", async (_, change) => {
        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage searchParams={{ ...defaultSearchParams, ...change }} />,
            ),
        );

        expect(screen.getByText("Ungültige Autorisierungsanfrage")).toBeInTheDocument();
        expect(screen.queryByText("Test Partner App")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByRole("list")).not.toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(document.querySelector("form")).not.toBeInTheDocument();
        expect(navigate).not.toHaveBeenCalled();
    });

    it("sends a direct request for the WooCommerce broker callback back to WordPress", async () => {
        const mutableEnv = env as { VITE_APP_URL?: string };
        const previousAppUrl = mutableEnv.VITE_APP_URL;
        mutableEnv.VITE_APP_URL = "https://aura-historia.com";
        try {
            await act(async () =>
                renderWithRouter(
                    <OAuthAuthorizePage
                        searchParams={{
                            ...defaultSearchParams,
                            redirect_uri:
                                "https://aura-historia.com/api/oauth/client/redirect-broker/woocommerce",
                        }}
                    />,
                ),
            );

            expect(screen.getByText("Verbindung in WordPress starten")).toBeInTheDocument();
            expect(screen.queryByRole("button")).not.toBeInTheDocument();
            expect(document.querySelector("form")).not.toBeInTheDocument();
        } finally {
            mutableEnv.VITE_APP_URL = previousAppUrl;
        }
    });

    it("offers consent for a registered redirect URI with a query and keeps it on denial", async () => {
        const redirectUri = "https://client.example/callback?tenant=north&return=/admin";
        mockUseOAuthClient.mockReturnValue({
            data: { ...mockClientData, redirectUris: [redirectUri] },
            isLoading: false,
            isError: false,
        });

        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, redirect_uri: redirectUri }}
                />,
            ),
        );

        const form = screen
            .getByRole("button", { name: "Test Partner App den Zugriff auf Ihr Konto erlauben" })
            .closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }
        expect(new FormData(form).get("redirect_uri")).toBe(redirectUri);

        await userEvent
            .setup()
            .click(
                screen.getByRole("button", { name: "Autorisierung für Test Partner App ablehnen" }),
            );
        const denied = new URL(navigate.mock.calls[0][0].href);
        expect(`${denied.origin}${denied.pathname}`).toBe("https://client.example/callback");
        expect([...denied.searchParams]).toEqual([
            ["tenant", "north"],
            ["return", "/admin"],
            ["error", "access_denied"],
            ["error_description", "The user denied the authorization request"],
            ["state", "csrf-state-123"],
        ]);
    });

    it("carries an MCP request to the direct callback without listing-source routing", async () => {
        const mcpSearchParams: OAuthAuthorizeSearchParams = {
            ...defaultSearchParams,
            redirect_uri: "https://claude.ai/api/mcp/auth_callback",
            scope: "watchlist:read",
            state: "mcp-state",
            resource: "https://mcp.aura-historia.com/v1",
        };
        mockUseOAuthClient.mockReturnValue({
            data: {
                ...mockClientData,
                redirectUris: ["https://claude.ai/api/mcp/auth_callback"],
                scopes: [...ACCESS_TOKEN_SCOPES],
            },
            isLoading: false,
            isError: false,
        });
        mockUseOAuthListingSources.mockReturnValue(
            listingSourcesState({
                sources: [{ listingSourceId: "ls_cached", name: "Cached source" }],
            }),
        );

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={mcpSearchParams} />),
        );

        expect(mockUseOAuthListingSources).toHaveBeenCalledWith(false);
        expect(screen.queryByText("Cached source")).not.toBeInTheDocument();
        expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
            expect.stringContaining("watchlist:read"),
        ]);

        const form = screen
            .getByRole("button", { name: "Test Partner App den Zugriff auf Ihr Konto erlauben" })
            .closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }
        expect(Object.fromEntries(new FormData(form))).toEqual({
            lng: "de",
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://claude.ai/api/mcp/auth_callback",
            scope: "watchlist:read",
            state: "mcp-state",
            resource: "https://mcp.aura-historia.com/v1",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        });

        await userEvent
            .setup()
            .click(
                screen.getByRole("button", { name: "Autorisierung für Test Partner App ablehnen" }),
            );
        const denied = new URL(navigate.mock.calls[0][0].href);
        expect(`${denied.origin}${denied.pathname}`).toBe(
            "https://claude.ai/api/mcp/auth_callback",
        );
        expect(Object.fromEntries(denied.searchParams)).toEqual({
            error: "access_denied",
            error_description: "The user denied the authorization request",
            state: "mcp-state",
        });
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

        expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
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
        for (const scope of ACCESS_TOKEN_SCOPES) {
            expect(screen.getByText(scope)).toBeInTheDocument();
            expect(
                screen
                    .getByText(testI18n.t(ACCESS_TOKEN_SCOPE_METADATA[scope].description))
                    .closest("li"),
            ).toBe(screen.getByText(scope).closest("li"));
        }
    });

    it("shows read and write scopes independently and unknown scopes without a description", async () => {
        mockUseOAuthClient.mockImplementation(() => ({
            data: { ...mockClientData, scopes: ["search-filters:write", "auctions:read"] },
            isLoading: false,
            isError: false,
        }));
        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{
                        ...defaultSearchParams,
                        scope: "search-filters:write auctions:read future:read",
                    }}
                />,
            ),
        );
        const items = screen.getAllByRole("listitem");
        expect(items.map((item) => item.querySelector("code")?.textContent)).toEqual([
            "search-filters:write",
            "auctions:read",
            "future:read",
        ]);
        expect(screen.queryByText("search-filters:read")).not.toBeInTheDocument();
        expect(screen.queryByText("auctions:write")).not.toBeInTheDocument();
        expect(
            screen.getByText(testI18n.t(ACCESS_TOKEN_SCOPE_METADATA["auctions:read"].description)),
        ).toBeInTheDocument();
        expect(items[2].textContent).toBe("future:read");
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
        mockUseOAuthListingSources.mockReturnValue(
            listingSourcesState({ sources: [{ listingSourceId: "shop-1", name: "Only Shop" }] }),
        );

        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />,
            ),
        );

        expect(
            screen.getByText(/Diese Auswahl beschränkt die Token-Berechtigungen nicht/),
        ).toBeInTheDocument();

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        const form = approveButton.closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }

        const formData = new FormData(form);
        expect(formData.get("redirect_uri")).toBe("https://client.example/callback");
        expect(formData.get("requires_listing_source_id")).toBe("true");
        expect(formData.get("listing_source_id")).toBe("shop-1");
        expect(screen.getByText("Ausgewählter Anbieter")).toBeInTheDocument();
        expect(screen.getByText("Only Shop")).toBeInTheDocument();
    });

    describe("without a provider", () => {
        const providerSearch = { ...defaultSearchParams, requires_listing_source_id: true };

        it("asks to apply and offers a registered way back instead of authorizing", async () => {
            const user = userEvent.setup();
            await act(async () =>
                renderWithRouter(<OAuthAuthorizePage searchParams={providerSearch} />),
            );

            expect(screen.getByText(/Ihr Konto hat/)).toHaveTextContent(
                "Ihr Konto hat noch keinen Anbieter.",
            );
            expect(screen.getByRole("list", { name: "So verbinden Sie Ihren Shop" })).toBeVisible();
            expect(
                screen.queryByRole("button", {
                    name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
                }),
            ).not.toBeInTheDocument();
            expect(screen.queryByText("product-listings:write")).not.toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: "Aufnahme beantragen" }));
            const dialog = await screen.findByRole("dialog");
            expect(dialog).toHaveTextContent("Für Ihre Verbindung mit Test Partner App.");

            await user.keyboard("{Escape}");
            await user.click(
                screen.getByRole("button", {
                    name: "Ohne Verbindung zu Test Partner App zurückkehren",
                }),
            );
            expect(navigate).toHaveBeenCalledOnce();
            const href = new URL(navigate.mock.calls[0][0].href);
            expect(href.origin + href.pathname).toBe("https://client.example/callback");
            expect(href.searchParams.get("error")).toBe("access_denied");
            expect(href.searchParams.get("state")).toBe("csrf-state-123");
            expect(href.searchParams.has("code")).toBe(false);
        });

        it.each([
            ["pending", { isPending: true }],
            ["failed", { isError: true }],
            ["incomplete", { hasMore: true }],
        ] as const)("does not treat a %s grant read as no provider", async (_label, state) => {
            mockUseOAuthListingSources.mockReturnValue(
                listingSourcesState({ sources: [], ...state }),
            );
            await act(async () =>
                renderWithRouter(<OAuthAuthorizePage searchParams={providerSearch} />),
            );
            expect(screen.queryByText(/Ihr Konto hat/)).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Aufnahme beantragen" }),
            ).not.toBeInTheDocument();
        });

        it("follows an open application and checks access again", async () => {
            const user = userEvent.setup();
            mockUsePartnerApplications.mockReturnValue(
                applicationsState(["REJECTED", "IN_REVIEW"]),
            );
            await act(async () =>
                renderWithRouter(<OAuthAuthorizePage searchParams={providerSearch} />),
            );

            expect(screen.getByText(/Ihr Antrag ist/)).toHaveTextContent(
                "Ihr Antrag ist in Prüfung.",
            );
            expect(screen.getByText("Galerie 1")).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Aufnahme beantragen" }),
            ).not.toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: "Zugriff erneut prüfen" }));
            expect(retryListingSources).toHaveBeenCalledOnce();
            expect(refetchApplications).toHaveBeenCalledOnce();
            expect(screen.getByRole("status")).toHaveTextContent(
                "Noch kein Zugriff auf einen Anbieter.",
            );
        });

        it("waits for the grant after approval and offers a new application after a rejection", async () => {
            mockUsePartnerApplications.mockReturnValue(applicationsState(["APPROVED"]));
            const { unmount } = await act(async () =>
                renderWithRouter(<OAuthAuthorizePage searchParams={providerSearch} />),
            );
            expect(screen.getByText(/Genehmigt\./)).toHaveTextContent(
                "Genehmigt. Der Zugriff folgt.",
            );
            expect(screen.getByRole("button", { name: "Zugriff erneut prüfen" })).toBeVisible();
            unmount();

            mockUsePartnerApplications.mockReturnValue(applicationsState(["REJECTED"]));
            await act(async () =>
                renderWithRouter(<OAuthAuthorizePage searchParams={providerSearch} />),
            );
            expect(
                screen.getByText(
                    "Ihr letzter Antrag wurde nicht genehmigt. Sie können einen neuen senden.",
                ),
            ).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Erneut beantragen" })).toBeVisible();
        });

        it("keeps the panel when a check fails and shows the consent once access is granted", async () => {
            let state = listingSourcesState({ sources: [] });
            mockUseOAuthListingSources.mockImplementation(() => state);
            mockUsePartnerApplications.mockReturnValue(applicationsState(["APPROVED"]));
            let refresh: () => void = () => {};
            function Harness() {
                const [, setVersion] = useState(0);
                refresh = () => setVersion((version) => version + 1);
                return <OAuthAuthorizePage searchParams={providerSearch} />;
            }
            await act(async () => renderWithRouter(<Harness />));

            state = listingSourcesState({ sources: [], isError: true });
            act(() => refresh());
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Ihr Zugriff konnte nicht geprüft werden",
            );
            expect(screen.getByRole("button", { name: "Zugriff erneut prüfen" })).toBeVisible();

            state = listingSourcesState({
                sources: [{ listingSourceId: "shop-1", name: "Galerie Lenbach" }],
            });
            act(() => refresh());
            expect(screen.getByRole("status")).toHaveTextContent(
                "Sie haben jetzt Zugriff auf Galerie Lenbach.",
            );
            const approveButton = screen.getByRole("button", {
                name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
            });
            expect(approveButton).toBeEnabled();
            const form = approveButton.closest("form");
            if (!form) throw new Error("Approve form not found");
            expect(new FormData(form).get("listing_source_id")).toBe("shop-1");
        });

        it("keeps an unregistered callback on the local error", async () => {
            await act(async () =>
                renderWithRouter(
                    <OAuthAuthorizePage
                        searchParams={{
                            ...providerSearch,
                            redirect_uri: "https://evil.example/cb",
                        }}
                    />,
                ),
            );
            expect(screen.getByText("Ungültige Autorisierungsanfrage")).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /Ohne Verbindung/ }),
            ).not.toBeInTheDocument();
        });
    });

    it("lets the user choose a partner shop when multiple are available", async () => {
        const user = userEvent.setup();
        mockUseOAuthListingSources.mockReturnValue(
            listingSourcesState({
                sources: [
                    { listingSourceId: "shop-1", name: "First Shop" },
                    { listingSourceId: "shop-2", name: "Second Shop" },
                ],
            }),
        );

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

    it("reaches and submits a provider from the final page of grants", async () => {
        const user = userEvent.setup();
        const firstPage = [
            { listingSourceId: "shop-1", name: "First Shop" },
            { listingSourceId: "shop-2", name: "Second Shop" },
        ];
        let state = listingSourcesState({ sources: firstPage, hasMore: true });
        mockUseOAuthListingSources.mockImplementation(() => state);
        let refresh: () => void = () => {};
        function OAuthAuthorizePageHarness() {
            const [, setVersion] = useState(0);
            refresh = () => setVersion((version) => version + 1);
            return (
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />
            );
        }
        await act(async () => renderWithRouter(<OAuthAuthorizePageHarness />));

        const approveButton = screen.getByRole("button", {
            name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
        });
        expect(approveButton).toBeDisabled();
        expect(
            screen.getByText(
                "Weitere Anbieter sind verfügbar. Diese Liste ist noch nicht vollständig.",
            ),
        ).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Weitere Anbieter anzeigen" }));
        expect(loadMoreListingSources).toHaveBeenCalledOnce();

        // A distinct source may share a name with one on an earlier page.
        state = listingSourcesState({
            sources: [...firstPage, { listingSourceId: "shop-9", name: "First Shop" }],
        });
        act(() => refresh());
        expect(
            screen.queryByRole("button", { name: "Weitere Anbieter anzeigen" }),
        ).not.toBeInTheDocument();
        const [, lastPageRadio] = screen.getAllByRole("radio", { name: /First Shop/ });
        await user.click(lastPageRadio);
        expect(approveButton).toBeEnabled();
        const form = approveButton.closest("form");
        if (!form) {
            throw new Error("Approve form not found");
        }
        expect(new FormData(form).get("listing_source_id")).toBe("shop-9");

        // Pages restarted after a grant change no longer include the choice.
        state = listingSourcesState({ sources: firstPage, hasMore: true });
        act(() => refresh());
        expect(approveButton).toBeDisabled();
        expect(new FormData(form).has("listing_source_id")).toBe(false);
    });

    it("asks for a choice when one loaded provider is not the last page", async () => {
        mockUseOAuthListingSources.mockReturnValue(
            listingSourcesState({
                sources: [{ listingSourceId: "shop-1", name: "First Shop" }],
                hasMore: true,
            }),
        );
        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />,
            ),
        );
        expect(screen.getByRole("radio", { name: /First Shop/ })).not.toBeChecked();
        expect(screen.queryByText("Ausgewählter Anbieter")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: "Test Partner App den Zugriff auf Ihr Konto erlauben",
            }),
        ).toBeDisabled();
    });

    it("withholds provider choices when the grant read fails", async () => {
        mockUseOAuthListingSources.mockReturnValue(
            listingSourcesState({ sources: [], isError: true }),
        );
        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage
                    searchParams={{ ...defaultSearchParams, requires_listing_source_id: true }}
                />,
            ),
        );
        expect(screen.getByText("Anbieter konnten nicht geladen werden")).toBeInTheDocument();
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
        expect(document.querySelector("form")).not.toBeInTheDocument();
    });

    it.each([
        { state: "next-csrf-state" },
        { code_challenge: "next-challenge" },
        { requires_listing_source_id: false },
    ])("clears a manual partner shop selection when the request changes: %j", async (change) => {
        const user = userEvent.setup();
        let updateSearchParams: (searchParams: typeof defaultSearchParams) => void = () => {};
        mockUseOAuthListingSources.mockReturnValue(
            listingSourcesState({
                sources: [
                    { listingSourceId: "shop-1", name: "First Shop" },
                    { listingSourceId: "shop-2", name: "Second Shop" },
                ],
            }),
        );

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
                requires_listing_source_id: true,
                ...change,
            }),
        );

        await waitFor(() => {
            if (change.requires_listing_source_id === false) {
                expect(approveButton).toBeEnabled();
            } else {
                expect(approveButton).toBeDisabled();
            }
        });
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
