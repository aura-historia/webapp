import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdminLayout } from "@/features/admin/common/components/AdminLayout.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

function renderLayout(path: string) {
    return renderWithRouter(
        <AdminLayout>
            <section>Route content</section>
        </AdminLayout>,
        { initialEntries: [path] },
    );
}

async function findNavigations() {
    // The phone menu comes first in the DOM, then the rail.
    const [menu, rail] = await screen.findAllByRole("navigation", { name: "Admin-Bereiche" });
    return { menu, rail };
}

describe("AdminLayout", () => {
    it("renders the route content in main beside the section navigation", async () => {
        renderLayout("/de/admin/users");

        expect(await screen.findByRole("main")).toHaveTextContent("Route content");
        expect(screen.getAllByRole("navigation", { name: "Admin-Bereiche" })).toHaveLength(2);
    });

    it("groups every section in the rail and marks the current one", async () => {
        renderLayout("/de/admin/users");
        const { rail } = await findNavigations();

        for (const group of ["Allgemein", "Partner", "Katalog", "Integrationen"]) {
            expect(within(rail).getByRole("list", { name: group })).toBeInTheDocument();
        }
        expect(within(rail).getAllByRole("link")).toHaveLength(9);
        expect(within(rail).getByRole("link", { name: "Benutzer" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(within(rail).getByRole("link", { name: "Übersicht" })).not.toHaveAttribute(
            "aria-current",
        );
        expect(within(rail).getByRole("link", { name: "OAuth-Clients" })).toHaveAttribute(
            "href",
            "/de/admin/oauth-clients",
        );
    });

    it("names the group and the current section on the phone menu and lists every section", async () => {
        const user = userEvent.setup();
        renderLayout("/de/admin/users");
        const { menu } = await findNavigations();

        const trigger = within(menu).getByRole("button");
        expect(trigger).toHaveTextContent("Admin · Allgemein");
        expect(trigger).toHaveTextContent("Benutzer");

        await user.click(trigger);
        const items = await screen.findAllByRole("menuitem");
        expect(items).toHaveLength(9);
        expect(screen.getByRole("menuitem", { name: "Benutzer" })).toHaveAttribute(
            "aria-current",
            "page",
        );
    });
});
