import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminSidebar } from "../AdminSidebar.tsx";

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        to,
        params,
        className,
    }: {
        children: ReactNode;
        to: string;
        params: { lng: string };
        className?: string;
    }) => (
        <a href={to.replace("$lng", params.lng)} className={className}>
            {children}
        </a>
    ),
}));

const t = testI18n.t.bind(testI18n);

describe("AdminSidebar", () => {
    it("links every admin section for the current language", () => {
        render(<AdminSidebar language="fr" />);

        const nav = screen.getByRole("navigation", { name: t("adminNavigation.label") });
        const expected: [string, string][] = [
            ["adminNavigation.items.overview", "/fr/admin/overview"],
            ["adminNavigation.items.users", "/fr/admin/users"],
            ["adminNavigation.items.applications", "/fr/admin/partnership-applications"],
            ["adminNavigation.items.partnerships", "/fr/admin/partnerships"],
            ["adminNavigation.items.organizations", "/fr/admin/parties"],
            ["adminNavigation.items.listingSources", "/fr/admin/shops"],
            ["adminNavigation.items.auctions", "/fr/admin/auctions"],
            ["adminNavigation.items.oauthClients", "/fr/admin/oauth-clients"],
        ];

        const links = within(nav).getAllByRole("link");
        expect(links).toHaveLength(expected.length);
        for (const [key, href] of expected) {
            expect(
                within(nav)
                    .getByRole("link", { name: t(key) })
                    .getAttribute("href"),
            ).toBe(href);
        }
    });

    it("styles the router's active link state", () => {
        render(<AdminSidebar language="de" />);

        const link = screen.getByRole("link", { name: t("adminNavigation.items.overview") });
        expect(link.className).toContain("data-[status=active]:border-primary");
    });
});
