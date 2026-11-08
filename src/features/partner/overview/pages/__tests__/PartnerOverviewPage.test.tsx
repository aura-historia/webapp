import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import type { PartnerApplication } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { PartnerOverviewPage } from "../PartnerOverviewPage.tsx";

const mocks = vi.hoisted(() => ({
    applications: vi.fn(),
    tokens: vi.fn(),
    sources: vi.fn(),
    auth: { isAuthenticated: true, isResolved: true },
}));
vi.mock("@/features/partner/application-management/api/usePartnerApplications.ts", () => ({
    usePartnerApplications: mocks.applications,
}));
vi.mock("@/features/partner/access-token-management/api/useAccessTokens.ts", () => ({
    useAccessTokens: mocks.tokens,
}));
vi.mock("@/features/partner/common/api/useOwnListingSources.ts", () => ({
    useOwnListingSources: mocks.sources,
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => mocks.auth,
}));

const DAY = 24 * 60 * 60 * 1000;

function proposed(id: string, name: string, state: PartnerApplication["state"]) {
    return {
        id,
        state,
        proposal: {
            type: "PROPOSED_LISTING_SOURCE",
            party: { name: "Operator" },
            listingSource: {
                name,
                listingSourceType: "DEALER",
                requestedIngestionMethods: [],
            },
        },
    } satisfies PartnerApplication;
}

function token(id: string, name: string, expiresAt: Date | null): AccessToken {
    return { id, name, scopes: [], expiresAt };
}

function mockApplications(data: PartnerApplication[] | undefined, overrides = {}) {
    const refetch = vi.fn();
    mocks.applications.mockReturnValue({
        data,
        isPending: false,
        isError: false,
        refetch,
        ...overrides,
    });
    return refetch;
}

function mockTokens(data: AccessToken[] | undefined, overrides = {}) {
    const refetch = vi.fn();
    mocks.tokens.mockReturnValue({
        data,
        dataUpdatedAt: data ? 1 : 0,
        isPending: false,
        isError: false,
        refetch,
        ...overrides,
    });
    return refetch;
}

function mockSources(
    sources: { listingSourceId: string; listingSourceSlugId: string; name: string }[],
    overrides = {},
) {
    const retry = vi.fn();
    mocks.sources.mockReturnValue({
        sources,
        isPending: false,
        isError: false,
        hasMore: false,
        canLoadMore: false,
        isLoadingMore: false,
        isLoadMoreError: false,
        loadMore: vi.fn(),
        retry,
        ...overrides,
    });
    return retry;
}

async function renderOverview() {
    renderWithRouter(<PartnerOverviewPage />, { initialEntries: ["/de/partners"] });
    await screen.findByRole("heading", { level: 1, name: "Partner-Dashboard." });
}

/** A glance tile is the block that carries `aria-busy` around its mono label. */
function tile(label: string) {
    const glance = screen.getByRole("region", { name: "Auf einen Blick" });
    const element = within(glance)
        .getAllByText(label)
        .map((labelElement) => labelElement.parentElement)
        .find((parent) => parent?.hasAttribute("aria-busy"));
    if (!element) throw new Error(`No glance tile ${label}`);
    return element;
}

function step(title: string) {
    const steps = screen.getByRole("region", { name: "So verbinden Sie sich." });
    const element = within(steps).getByRole("heading", { level: 3, name: title }).closest("li");
    if (!element) throw new Error(`No step ${title}`);
    return element;
}

describe("PartnerOverviewPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.isAuthenticated = true;
        mocks.auth.isResolved = true;
        mockApplications([
            proposed("pa_1", "Aurora Antiques", "SUBMITTED"),
            proposed("pa_2", "Brass & Oak", "IN_REVIEW"),
            proposed("pa_3", "Cobalt Rooms", "APPROVED"),
            proposed("pa_4", "Delft Hall", "REJECTED"),
        ]);
        mockTokens([
            token("at_1", "Product sync", null),
            token("at_2", "Shop import", new Date(Date.now() + 5 * DAY)),
            token("at_3", "Old sync", new Date(Date.now() - DAY)),
        ]);
        mockSources([
            { listingSourceId: "ls_1", listingSourceSlugId: "aurora", name: "Aurora Antiques" },
            { listingSourceId: "ls_2", listingSourceSlugId: "cobalt", name: "Cobalt Rooms" },
        ]);
    });

    it("shows the counts at a glance", async () => {
        await renderOverview();

        const applications = tile("Partner-Anträge");
        expect(applications).toHaveTextContent("2offen");
        expect(applications).toHaveTextContent("1 in Prüfung · 4 insgesamt");
        expect(within(applications).getByRole("link", { name: "Anträge ansehen" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );

        const providers = tile("Anbieter");
        expect(providers).toHaveTextContent("2mit Zugriff");
        expect(providers).toHaveTextContent(
            "Sie können dafür Angebote senden, besitzen sie aber nicht",
        );
        expect(within(providers).getByRole("link", { name: "Anbieter ansehen" })).toHaveAttribute(
            "href",
            "/de/partners/shop-access",
        );

        const tokens = tile("Zugriffstoken");
        expect(tokens).toHaveTextContent("2aktiv");
        expect(tokens).toHaveTextContent("1 läuft in den nächsten 14 Tagen ab");
        expect(within(tokens).getByRole("link", { name: "Zugriffstoken ansehen" })).toHaveAttribute(
            "href",
            "/de/partners/access-tokens",
        );
    });

    it("counts expiring tokens in the plural and totals without any", async () => {
        mockTokens([
            token("at_1", "A", new Date(Date.now() + DAY)),
            token("at_2", "B", new Date(Date.now() + 2 * DAY)),
        ]);
        await renderOverview();
        expect(tile("Zugriffstoken")).toHaveTextContent("2 laufen in den nächsten 14 Tagen ab");
    });

    it("totals tokens when none expire soon", async () => {
        mockTokens([token("at_1", "A", null), token("at_2", "B", new Date(Date.now() - DAY))]);
        await renderOverview();
        const tokens = tile("Zugriffstoken");
        expect(tokens).toHaveTextContent("1aktiv");
        expect(tokens).toHaveTextContent("2 insgesamt");
    });

    it("marks an incomplete provider count with a plus", async () => {
        mockSources(
            [{ listingSourceId: "ls_1", listingSourceSlugId: "aurora", name: "Aurora Antiques" }],
            { hasMore: true, canLoadMore: true },
        );
        await renderOverview();

        expect(tile("Anbieter")).toHaveTextContent("1+mit Zugriff");
        expect(step("Auf Freigabe warten")).toHaveTextContent("1+ Anbieter");
    });

    it("shows one tile's error with a retry while the other tiles still render", async () => {
        const refetch = mockTokens(undefined, { isError: true });
        await renderOverview();

        const tokens = tile("Zugriffstoken");
        expect(within(tokens).getByRole("alert")).toHaveTextContent("Konnte nicht geladen werden.");
        expect(within(tokens).queryByRole("link")).not.toBeInTheDocument();
        await userEvent.click(within(tokens).getByRole("button", { name: "Erneut versuchen" }));
        expect(refetch).toHaveBeenCalledOnce();

        expect(tile("Partner-Anträge")).toHaveTextContent("2offen");
        expect(tile("Anbieter")).toHaveTextContent("2mit Zugriff");
        expect(screen.getAllByRole("alert")).toHaveLength(1);
        expect(within(step("Zugriffstoken erstellen")).queryByRole("link")).toBeNull();
    });

    it("retries the providers tile through the shared list", async () => {
        const retry = mockSources([], { isError: true });
        await renderOverview();

        await userEvent.click(
            within(tile("Anbieter")).getByRole("button", { name: "Erneut versuchen" }),
        );
        expect(retry).toHaveBeenCalledOnce();
    });

    it("keeps a tile busy while it loads", async () => {
        mockApplications(undefined, { isPending: true });
        await renderOverview();

        expect(tile("Partner-Anträge")).toHaveAttribute("aria-busy", "true");
        expect(tile("Anbieter")).toHaveAttribute("aria-busy", "false");
    });

    it("marks the steps already done", async () => {
        await renderOverview();

        expect(step("Zugang für Ihren Shop beantragen")).toHaveTextContent("Beantragt");
        expect(step("Auf Freigabe warten")).toHaveTextContent("2 Anbieter");
        expect(step("Zugriffstoken erstellen")).toHaveTextContent("2 aktiv");
        for (const title of [
            "Zugang für Ihren Shop beantragen",
            "Auf Freigabe warten",
            "Zugriffstoken erstellen",
        ]) {
            expect(within(step(title)).queryByRole("link")).not.toBeInTheDocument();
        }

        const connect = step("Shop verbinden");
        expect(
            within(connect).getByRole("link", { name: /Partner Connect für Shopify/ }),
        ).toHaveAttribute("target", "_blank");
        expect(
            within(connect).getByRole("link", { name: /Partner Connect für WooCommerce/ }),
        ).toHaveAttribute("rel", "noopener noreferrer");
        expect(
            within(connect).getByRole("link", { name: "Eigene API-Integration" }),
        ).toHaveAttribute("href", "/de/partner-program/custom-integration");
    });

    it("offers to create the first application and token when there is none", async () => {
        mockApplications([]);
        mockTokens([token("at_1", "Old sync", new Date(Date.now() - DAY))]);
        mockSources([]);
        await renderOverview();

        const applications = tile("Partner-Anträge");
        expect(applications).toHaveTextContent("0offen");
        expect(applications).toHaveTextContent("Noch keine Anträge");
        expect(within(applications).getByRole("link", { name: "Neuer Antrag" })).toHaveAttribute(
            "href",
            "/de/partners/applications?create=true",
        );
        expect(tile("Anbieter")).toHaveTextContent("Noch kein Zugriff gewährt");

        expect(
            within(step("Zugang für Ihren Shop beantragen")).getByRole("link", {
                name: "Neuer Antrag",
            }),
        ).toHaveAttribute("href", "/de/partners/applications?create=true");
        expect(step("Auf Freigabe warten")).not.toHaveTextContent(
            "Zugang für Ihren Shop beantragen",
        );
        expect(within(step("Auf Freigabe warten")).queryByRole("link")).toBeNull();
        expect(
            within(step("Zugriffstoken erstellen")).getByRole("link", {
                name: "Neues Zugriffstoken",
            }),
        ).toHaveAttribute("href", "/de/partners/access-tokens?create=true");
    });

    it("offers a new application when every application was withdrawn or not approved", async () => {
        mockApplications([
            proposed("pa_1", "Aurora Antiques", "WITHDRAWN"),
            proposed("pa_2", "Delft Hall", "REJECTED"),
        ]);
        await renderOverview();

        const apply = step("Zugang für Ihren Shop beantragen");
        expect(apply).not.toHaveTextContent("Beantragt");
        expect(within(apply).getByRole("link", { name: "Neuer Antrag" })).toHaveAttribute(
            "href",
            "/de/partners/applications?create=true",
        );
    });

    it("explains a new account's empty token tile", async () => {
        mockTokens([]);
        await renderOverview();
        expect(tile("Zugriffstoken")).toHaveTextContent(
            "Erstellen Sie eines, wenn Sie Ihren Shop verbinden",
        );
    });

    it("lists the three most recent applications and tokens", async () => {
        mockSources([]);
        mockApplications([
            proposed("pa_1", "Aurora Antiques", "SUBMITTED"),
            proposed("pa_2", "Brass & Oak", "IN_REVIEW"),
            proposed("pa_3", "Cobalt Rooms", "APPROVED"),
            proposed("pa_4", "Delft Hall", "REJECTED"),
            {
                id: "pa_5",
                state: "SUBMITTED",
                proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_x" },
            },
        ]);
        mockTokens([
            token("at_1", "Zeta", new Date(Date.now() - DAY)),
            token("at_2", "Beta", null),
            token("at_3", "Alpha", new Date(Date.now() + 30 * DAY)),
            token("at_4", "Gamma", null),
        ]);
        await renderOverview();

        const recentApplications = screen.getByRole("region", { name: "Partner-Anträge" });
        const applicationLinks = within(recentApplications).getAllByRole("listitem");
        expect(applicationLinks.map((item) => item.textContent)).toEqual([
            expect.stringContaining("Aurora Antiques"),
            expect.stringContaining("Brass & Oak"),
            expect.stringContaining("Cobalt Rooms"),
        ]);
        expect(within(applicationLinks[0]).getByRole("link")).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
        expect(
            within(recentApplications).getByRole("link", { name: "Alle ansehen: Partner-Anträge" }),
        ).toHaveAttribute("href", "/de/partners/applications");

        const recentTokens = screen.getByRole("region", { name: "Zugriffstoken" });
        const tokenItems = within(recentTokens).getAllByRole("listitem");
        expect(tokenItems.map((item) => item.firstChild?.textContent)).toEqual([
            "Alpha",
            "Beta",
            "Gamma",
        ]);
        expect(tokenItems[0]).toHaveTextContent(/Läuft ab am/);
        expect(tokenItems[1]).toHaveTextContent("Läuft nicht ab");
        expect(
            within(recentTokens).getByRole("link", { name: "Alle ansehen: Zugriffstoken" }),
        ).toHaveAttribute("href", "/de/partners/access-tokens");
    });

    it("says when there is nothing recent yet", async () => {
        mockApplications([]);
        mockTokens([]);
        await renderOverview();

        expect(screen.getByRole("region", { name: "Partner-Anträge" })).toHaveTextContent(
            "Sie haben noch keine Partneranträge eingereicht.",
        );
        expect(screen.getByRole("region", { name: "Zugriffstoken" })).toHaveTextContent(
            "Sie haben noch keine Zugriffstoken gespeichert.",
        );
    });

    it("names an existing-provider application from the granted providers", async () => {
        mockApplications([
            {
                id: "pa_1",
                state: "SUBMITTED",
                proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_2" },
            },
        ]);
        await renderOverview();

        const recentApplications = screen.getByRole("region", { name: "Partner-Anträge" });
        expect(
            within(recentApplications).getByRole("link", { name: /Cobalt Rooms/ }),
        ).toHaveTextContent("Bestehender Anbieter · ls_2");
    });
});
