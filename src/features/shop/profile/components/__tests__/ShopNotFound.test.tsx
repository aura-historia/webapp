import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { ShopNotFound } from "../ShopNotFound.tsx";

describe("ShopNotFound", () => {
    it("explains that the provider does not exist", async () => {
        await act(async () => renderWithRouter(<ShopNotFound />));

        expect(
            screen.getByRole("heading", { name: "Anbieter nicht gefunden." }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Diese Anbieterseite existiert nicht oder ist nicht mehr auf Aura Historia gelistet.",
            ),
        ).toBeInTheDocument();
    });

    it("links to the provider search", async () => {
        await act(async () => renderWithRouter(<ShopNotFound />));

        const link = screen.getByRole("link", { name: "Anbieter entdecken" });
        expect(link.getAttribute("href")).toMatch(/^\/de\/search\/shops(\?|$)/);
    });
});
