import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { mapToAdminOverview } from "@/data/internal/admin/AdminOverview.ts";
import { adminOverviewFixture } from "@/data/internal/admin/__tests__/adminOverviewFixture.ts";
import { AdminOverviewPage } from "../AdminOverviewPage.tsx";

const api = vi.hoisted(() => ({ useAdminOverview: vi.fn() }));
vi.mock("../../api/useAdminOverview.ts", () => ({ useAdminOverview: api.useAdminOverview }));
vi.mock("../../components/AdminServiceStatusPanel.tsx", () => ({
    AdminServiceStatusPanel: () => <div data-testid="service-status-panel" />,
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        to,
        params,
    }: {
        children: ReactNode;
        to: string;
        params: { lng: string };
    }) => <a href={to.replace("$lng", params.lng)}>{children}</a>,
}));

const t = testI18n.t.bind(testI18n);
const overview = mapToAdminOverview(adminOverviewFixture);

function card(titleKey: string) {
    return screen.getByRole("region", { name: t(titleKey) });
}

function summaryTile(labelKey: string) {
    const totals = screen.getByRole("list", { name: t("adminOverview.summary.label") });
    const label = within(totals).getByText(t(labelKey));
    return label.closest("li") as HTMLElement;
}

function countFor(region: HTMLElement, labelKey: string) {
    const term = within(region).getByText(t(labelKey), { selector: "dt" });
    return term.nextElementSibling?.textContent;
}

describe("AdminOverviewPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function renderLoaded() {
        api.useAdminOverview.mockReturnValue({ data: overview, error: null, isPending: false });
        render(<AdminOverviewPage language="de" />);
    }

    it("summarises each aggregate total, including zero", () => {
        renderLoaded();

        expect(within(summaryTile("adminOverview.users.title")).getByText("12")).toBeTruthy();
        expect(
            within(summaryTile("adminOverview.users.title")).getByText(
                t("adminOverview.totals.administrators", { count: 1, value: "1" }),
            ),
        ).toBeTruthy();
        expect(
            within(summaryTile("adminOverview.applications.label")).getByText(
                t("adminOverview.totals.awaitingReview", { count: 3, value: "3" }),
            ),
        ).toBeTruthy();
        expect(within(summaryTile("adminOverview.parties.title")).getByText("0")).toBeTruthy();
        expect(within(summaryTile("adminOverview.partnerships.title")).getByText("2")).toBeTruthy();
        expect(
            within(summaryTile("adminOverview.productListings.title")).getByText("40"),
        ).toBeTruthy();
        expect(
            within(summaryTile("adminOverview.productListings.title")).getByText(
                t("adminOverview.totals.active", { count: 30, value: "30" }),
            ),
        ).toBeTruthy();
    });

    it("renders breakdowns with explicit zero counts", () => {
        renderLoaded();

        const users = card("adminOverview.users.title");
        expect(countFor(users, "adminOverview.users.tiers.free")).toBe("9");
        // The role split is not shown; administrators appear only on the Users tile.
        expect(within(users).queryByText("Administrator")).toBeNull();

        const applications = card("adminOverview.applications.label");
        expect(countFor(applications, "adminOverview.applications.states.inReview")).toBe("1");
        expect(countFor(applications, "adminOverview.applications.states.rejected")).toBe("0");

        const listings = card("adminOverview.productListings.title");
        expect(countFor(listings, "adminOverview.productListings.lifecycle.withdrawn")).toBe("10");
        expect(countFor(listings, "adminOverview.productListings.availability.soldOut")).toBe("4");
        expect(countFor(listings, "adminOverview.productListings.activeWithoutAvailability")).toBe(
            "2",
        );
    });

    it("calls out applications awaiting review with a link to review them", () => {
        renderLoaded();

        const applications = card("adminOverview.applications.label");
        expect(applications).toHaveTextContent(
            t("adminOverview.applications.awaitingReview", { count: 3, value: "3" }).replace(
                /<\/?strong>/g,
                "",
            ),
        );
        expect(
            within(applications)
                .getByRole("link", { name: t("adminOverview.applications.review") })
                .getAttribute("href"),
        ).toBe("/de/admin/partnership-applications");
    });

    it("shows overlapping method assignments without summing them into a source total", () => {
        renderLoaded();

        expect(
            within(summaryTile("adminOverview.listingSources.title")).getByText("3"),
        ).toBeTruthy();
        const sources = card("adminOverview.listingSources.title");
        // Three sources, four assignments: no summed figure appears.
        expect(within(sources).queryByText("4")).toBeNull();
        expect(countFor(sources, "adminOverview.listingSources.methods.webCrawl")).toBe("2");
        expect(countFor(sources, "adminOverview.listingSources.methods.partnerApi")).toBe("1");
        expect(countFor(sources, "adminOverview.listingSources.withoutIngestionMethod")).toBe("1");
        expect(
            within(sources).getByText(t("adminOverview.listingSources.overlapNote")),
        ).toBeTruthy();
    });

    it("links every total to its admin section, and no panel carries a section link", () => {
        renderLoaded();

        const tiles: [string, string][] = [
            ["adminOverview.users.title", "/de/admin/users"],
            ["adminOverview.applications.label", "/de/admin/partnership-applications"],
            ["adminOverview.partnerships.title", "/de/admin/partnerships"],
            ["adminOverview.parties.title", "/de/admin/parties"],
            ["adminOverview.listingSources.title", "/de/admin/listing-sources"],
            ["adminOverview.productListings.title", "/de/admin/product-listings"],
        ];
        for (const [key, href] of tiles) {
            expect(within(summaryTile(key)).getByRole("link").getAttribute("href")).toBe(href);
        }
        expect(within(card("adminOverview.users.title")).queryByRole("link")).toBeNull();
        expect(within(card("adminOverview.listingSources.title")).queryByRole("link")).toBeNull();
        expect(within(card("adminOverview.productListings.title")).queryByRole("link")).toBeNull();
    });

    it("shows a loading state without placeholder counts", () => {
        api.useAdminOverview.mockReturnValue({ data: undefined, error: null, isPending: true });

        render(<AdminOverviewPage language="de" />);

        expect(screen.getByText(t("adminOverview.loading"))).toBeTruthy();
        expect(screen.queryByText("0")).toBeNull();
        expect(screen.queryByRole("list", { name: t("adminOverview.summary.label") })).toBeNull();
    });

    it("shows an error with retry instead of zero counts when unavailable", async () => {
        const refetch = vi.fn();
        api.useAdminOverview.mockReturnValue({
            data: undefined,
            error: new Error(t("adminOverview.errors.unavailable")),
            isPending: false,
            refetch,
        });

        render(<AdminOverviewPage language="de" />);

        expect(screen.getByRole("alert")).toHaveTextContent(t("adminOverview.unavailable"));
        expect(screen.queryByText("0")).toBeNull();
        // Service status does not depend on the counters loading.
        expect(screen.getByTestId("service-status-panel")).toBeTruthy();
        await userEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it("keeps the last snapshot visible and flags it when a refresh fails", () => {
        api.useAdminOverview.mockReturnValue({
            data: overview,
            error: new Error("refresh failed"),
            isPending: false,
        });

        render(<AdminOverviewPage language="de" />);

        expect(screen.getByRole("alert")).toHaveTextContent(t("adminOverview.errors.outOfDate"));
        expect(within(summaryTile("adminOverview.users.title")).getByText("12")).toBeTruthy();
    });
});
