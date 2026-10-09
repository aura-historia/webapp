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

function countFor(region: HTMLElement, labelKey: string) {
    const term = within(region).getByText(t(labelKey), { selector: "dt" });
    return term.nextElementSibling?.textContent;
}

describe("AdminOverviewPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders aggregate totals, breakdowns and explicit zero counts", () => {
        api.useAdminOverview.mockReturnValue({ data: overview, error: null, isPending: false });

        render(<AdminOverviewPage language="de" />);

        const users = card("adminOverview.users.title");
        expect(within(users).getByText("12")).toBeTruthy();
        expect(countFor(users, "adminOverview.users.tiers.free")).toBe("9");
        expect(countFor(users, "adminOverview.users.roles.admin")).toBe("1");

        const applications = card("adminOverview.applications.title");
        expect(countFor(applications, "adminOverview.applications.states.inReview")).toBe("1");
        expect(countFor(applications, "adminOverview.applications.states.rejected")).toBe("0");

        expect(within(card("adminOverview.parties.title")).getByText("0")).toBeTruthy();

        const listings = card("adminOverview.productListings.title");
        expect(countFor(listings, "adminOverview.productListings.lifecycle.withdrawn")).toBe("10");
        expect(countFor(listings, "adminOverview.productListings.availability.soldOut")).toBe("4");
        expect(countFor(listings, "adminOverview.productListings.activeWithoutAvailability")).toBe(
            "2",
        );
    });

    it("shows overlapping method assignments next to the distinct source total", () => {
        api.useAdminOverview.mockReturnValue({ data: overview, error: null, isPending: false });

        render(<AdminOverviewPage language="de" />);

        const sources = card("adminOverview.listingSources.title");
        // Three sources, four assignments: the total is shown as reported, not summed.
        expect(within(sources).getByText("3")).toBeTruthy();
        expect(within(sources).queryByText("4")).toBeNull();
        expect(countFor(sources, "adminOverview.listingSources.methods.webCrawl")).toBe("2");
        expect(countFor(sources, "adminOverview.listingSources.methods.partnerApi")).toBe("1");
        expect(
            within(sources).getByText(t("adminOverview.listingSources.methodAssignmentsNote")),
        ).toBeTruthy();
    });

    it("links every section to its migrated admin route", () => {
        api.useAdminOverview.mockReturnValue({ data: overview, error: null, isPending: false });

        render(<AdminOverviewPage language="de" />);

        const expected: [string, string][] = [
            ["adminOverview.users.link", "/de/admin/users"],
            ["adminOverview.applications.link", "/de/admin/partnership-applications"],
            ["adminOverview.listingSources.link", "/de/admin/shops"],
            ["adminOverview.parties.link", "/de/admin/parties"],
            ["adminOverview.partnerships.link", "/de/admin/partnerships"],
            ["adminOverview.otherSections.auctions", "/de/admin/auctions"],
            ["adminOverview.otherSections.oauthClients", "/de/admin/oauth-clients"],
        ];
        for (const [key, href] of expected) {
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
        expect(within(card("adminOverview.users.title")).getByText("12")).toBeTruthy();
    });
});
