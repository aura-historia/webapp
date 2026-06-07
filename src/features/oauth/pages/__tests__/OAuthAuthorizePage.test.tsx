import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

const mockClientData = vi.hoisted(() => ({
    clientId: "01970f22-2bf0-7000-8000-000000000010",
    clientName: "Test Partner App",
    tosUri: "https://client.example/terms",
    policyUri: "https://client.example/privacy",
    clientUri: "https://client.example",
    logoUri: "https://client.example/logo.png",
    redirectUris: ["https://client.example/callback"],
    scopes: ["products:write" as const, "shops:manage" as const],
}));

const mockUseOAuthClient = vi.hoisted(() =>
    vi.fn().mockReturnValue({
        data: mockClientData,
        isLoading: false,
        isError: false,
    }),
);

vi.mock("@/features/oauth/hooks/useOAuthClient.ts", () => ({
    useOAuthClient: mockUseOAuthClient,
}));

const defaultSearchParams = {
    response_type: "code",
    client_id: "01970f22-2bf0-7000-8000-000000000010",
    redirect_uri: "https://client.example/callback",
    scope: "products:write shops:manage",
    state: "csrf-state-123",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
};

describe("OAuthAuthorizePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseOAuthClient.mockReturnValue({
            data: mockClientData,
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

        expect(screen.getByText("products:write")).toBeInTheDocument();
        expect(
            screen.getByText("Produkte in Ihrem Namen erstellen oder aktualisieren."),
        ).toBeInTheDocument();
        expect(screen.getByText("shops:manage")).toBeInTheDocument();
        expect(screen.getByText("Ihre Shop-Einstellungen verwalten.")).toBeInTheDocument();
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
            response_type: "code",
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            redirect_uri: "https://client.example/callback",
            scope: "products:write shops:manage",
            state: "csrf-state-123",
            code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            code_challenge_method: "S256",
        });
    });

    it("redirects to redirect_uri with access_denied on deny click", async () => {
        const user = userEvent.setup();
        const mockLocationHref = vi.fn();
        const locationProxy = new Proxy(
            {},
            {
                set(_target, prop, value) {
                    if (prop === "href") {
                        mockLocationHref(value);
                    }
                    return true;
                },
            },
        );
        Object.defineProperty(window, "location", {
            value: locationProxy,
            writable: true,
            configurable: true,
        });

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        await user.click(
            screen.getByRole("button", {
                name: "Autorisierung für Test Partner App ablehnen",
            }),
        );

        expect(mockLocationHref).toHaveBeenCalledWith(
            expect.stringContaining("error=access_denied"),
        );
        expect(mockLocationHref).toHaveBeenCalledWith(
            expect.stringContaining("state=csrf-state-123"),
        );
    });

    it("redirects to redirect_uri without state when deny click has no state", async () => {
        const user = userEvent.setup();
        const mockLocationHref = vi.fn();
        const locationProxy = new Proxy(
            {},
            {
                set(_target, prop, value) {
                    if (prop === "href") {
                        mockLocationHref(value);
                    }
                    return true;
                },
            },
        );
        Object.defineProperty(window, "location", {
            value: locationProxy,
            writable: true,
            configurable: true,
        });

        await act(async () =>
            renderWithRouter(
                <OAuthAuthorizePage searchParams={{ ...defaultSearchParams, state: undefined }} />,
            ),
        );

        await user.click(
            screen.getByRole("button", {
                name: "Autorisierung für Test Partner App ablehnen",
            }),
        );

        const redirectUrl = new URL(String(mockLocationHref.mock.calls[0]?.[0]));
        expect(redirectUrl.searchParams.get("error")).toBe("access_denied");
        expect(redirectUrl.searchParams.has("state")).toBe(false);
    });

    it("shows loading spinner when client data is loading", async () => {
        mockUseOAuthClient.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={defaultSearchParams} />),
        );

        expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
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
            scope: "products:write",
        };

        await act(async () =>
            renderWithRouter(<OAuthAuthorizePage searchParams={singleScopeParams} />),
        );

        expect(screen.getByText("products:write")).toBeInTheDocument();
        expect(screen.queryByText("shops:manage")).not.toBeInTheDocument();
    });
});
