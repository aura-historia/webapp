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
            within(summaryTile("adminOverview.applications.title")).getByText(
                `${t("adminOverview.summary.awaitingReview")}: 3`,
            ),
        ).toBeTruthy();
        expect(within(summaryTile("adminOverview.parties.title")).getByText("0")).toBeTruthy();
        expect(within(summaryTile("adminOverview.partnerships.title")).getByText("2")).toBeTruthy();
        expect(
            within(summaryTile("adminOverview.productListings.title")).getByText("40"),
        ).toBeTruthy();
    });

    it("renders breakdowns with explicit zero counts", () => {
        renderLoaded();

        const users = card("adminOverview.users.title");
        expect(countFor(users, "adminOverview.users.tiers.free")).toBe("9");
        expect(countFor(users, "adminOverview.users.roles.admin")).toBe("1");

        const applications = card("adminOverview.applications.title");
        expect(countFor(applications, "adminOverview.applications.states.inReview")).toBe("1");
        expect(countFor(applications, "adminOverview.applications.states.rejected")).toBe("0");

        const listings = card("adminOverview.productListings.title");
        expect(countFor(listings, "adminOverview.productListings.lifecycle.withdrawn")).toBe("10");
        expect(countFor(listings, "adminOverview.productListings.availability.soldOut")).toBe("4");
        expect(countFor(listings, "adminOverview.productListings.activeWithoutAvailability")).toBe(
            "2",
        );
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
            within(sources).getByText(t("adminOverview.listingSources.methodAssignmentsNote")),
        ).toBeTruthy();
    });

    it("links totals and panels to their migrated admin routes", () => {
        renderLoaded();

        const tiles: [string, string][] = [
            ["adminOverview.users.title", "/de/admin/users"],
            ["adminOverview.applications.title", "/de/admin/partnership-applications"],
            ["adminOverview.partnerships.title", "/de/admin/partnerships"],
            ["adminOverview.parties.title", "/de/admin/parties"],
            ["adminOverview.listingSources.title", "/de/admin/shops"],
        ];
        for (const [key, href] of tiles) {
            expect(within(summaryTile(key)).getByRole("link").getAttribute("href")).toBe(href);
        }
        expect(
            within(summaryTile("adminOverview.productListings.title")).queryByRole("link"),
        ).toBeNull();

        const panels: [string, string][] = [
            ["adminOverview.users.link", "/de/admin/users"],
            ["adminOverview.applications.link", "/de/admin/partnership-applications"],
            ["adminOverview.listingSources.link", "/de/admin/shops"],
        ];
        for (const [key, href] of panels) {
            expect(screen.getByRole("link", { name: t(key) }).getAttribute("href")).toBe(href);
        }
    });

    it("shows a loading state without placeholder counts", () => {
        api.useAdminOverview.mockReturnValue({ data: undefined, error: null, isPending: true });

        render(<AdminOverviewPage language="de" />);

        expect(screen.getByText(t("adminOverview.loading"))).toBeTruthy();
        expect(screen.queryByText("0")).toBeNull();
        expect(screen.queryByRole("region")).toBeNull();
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

        expect(screen.getByRole("alert").textContent).toContain(
            t("adminOverview.errors.unavailable"),
        );
        expect(screen.queryByText("0")).toBeNull();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminOverview.actions.retry") }),
        );
        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it("keeps the last snapshot visible and flags it when a refresh fails", () => {
        api.useAdminOverview.mockReturnValue({
            data: overview,
            error: new Error("refresh failed"),
            isPending: false,
        });

        render(<AdminOverviewPage language="de" />);

        expect(screen.getByRole("alert").textContent).toBe(t("adminOverview.errors.stale"));
        expect(within(summaryTile("adminOverview.users.title")).getByText("12")).toBeTruthy();
    });
});
