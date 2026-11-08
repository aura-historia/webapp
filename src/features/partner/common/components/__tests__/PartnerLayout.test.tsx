import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PartnerLayout } from "@/features/partner/common/components/PartnerLayout.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

const SECTIONS = [
    ["Übersicht", "/de/partners"],
    ["Partner-Anträge", "/de/partners/applications"],
    ["Anbieter", "/de/partners/listing-sources"],
    ["Zugriffstoken", "/de/partners/access-tokens"],
] as const;

function renderLayout(path: string) {
    return renderWithRouter(
        <PartnerLayout>
            <section>Route content</section>
        </PartnerLayout>,
        { initialEntries: [path] },
    );
}

async function findNavigations() {
    // The phone menu and the desktop rail share the dashboard's label; the menu comes first.
    const [menu, rail] = await screen.findAllByRole("navigation", { name: "Partner-Dashboard" });
    return { menu, rail };
}

describe("PartnerLayout", () => {
    it("renders the dashboard navigation and route content without a page title", async () => {
        renderLayout("/de/partners/applications");

        expect(await screen.findByRole("main")).toHaveTextContent("Route content");
        expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
        expect(screen.getAllByRole("navigation", { name: "Partner-Dashboard" })).toHaveLength(2);
    });

    it("links every section and the guides from the rail", async () => {
        renderLayout("/de/partners/applications");
        const { rail } = await findNavigations();

        for (const [name, href] of SECTIONS) {
            expect(within(rail).getByRole("link", { name })).toHaveAttribute("href", href);
        }
        expect(within(rail).getByText("Anleitungen")).toBeInTheDocument();
        expect(within(rail).getByRole("link", { name: "Eigene API-Integration" })).toHaveAttribute(
            "href",
            "/de/partner-program/custom-integration",
        );
        expect(within(rail).getByRole("link", { name: "Partnerprogramm" })).toHaveAttribute(
            "href",
            "/de/partner-program",
        );
    });

    it("marks the current section in the rail", async () => {
        renderLayout("/de/partners/applications");
        const { rail } = await findNavigations();

        expect(within(rail).getByRole("link", { name: "Partner-Anträge" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(within(rail).getByRole("link", { name: "Anbieter" })).not.toHaveAttribute(
            "aria-current",
        );
        expect(within(rail).getByRole("link", { name: "Zugriffstoken" })).not.toHaveAttribute(
            "aria-current",
        );
    });

    // Known source bug: the overview Link has no `activeOptions={{ exact: true }}`, so TanStack
    // Router's fuzzy matching adds aria-current="page" to "Übersicht" on every deeper section.
    // Drop `.fails` once PartnerDashboardNav.tsx passes exact active options to the overview link.
    it("does not mark the overview as current on a deeper section", async () => {
        renderLayout("/de/partners/applications");
        const { rail } = await findNavigations();

        expect(within(rail).getByRole("link", { name: "Übersicht" })).not.toHaveAttribute(
            "aria-current",
        );
    });

    it("marks only the overview on the overview path", async () => {
        renderLayout("/de/partners");
        const { menu, rail } = await findNavigations();

        expect(within(rail).getByRole("link", { name: "Übersicht" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        for (const [name] of SECTIONS.slice(1)) {
            expect(within(rail).getByRole("link", { name })).not.toHaveAttribute("aria-current");
        }
        expect(within(menu).getByRole("button")).toHaveTextContent("Partner-DashboardÜbersicht");
    });

    it("names the current section in the phone menu and lists every section", async () => {
        const user = userEvent.setup();
        renderLayout("/de/partners/applications");
        const { menu } = await findNavigations();

        const trigger = within(menu).getByRole("button");
        expect(trigger).toHaveTextContent("Partner-DashboardPartner-Anträge");

        await user.click(trigger);

        const menuContent = await screen.findByRole("menu");
        for (const [name, href] of SECTIONS) {
            expect(within(menuContent).getByRole("menuitem", { name })).toHaveAttribute(
                "href",
                href,
            );
        }
        expect(
            within(menuContent).getByRole("menuitem", { name: "Partner-Anträge" }),
        ).toHaveAttribute("aria-current", "page");
        expect(within(menuContent).getByRole("menuitem", { name: "Anbieter" })).not.toHaveAttribute(
            "aria-current",
        );
    });
});
