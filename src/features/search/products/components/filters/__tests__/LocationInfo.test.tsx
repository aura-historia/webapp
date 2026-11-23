import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocationInfo } from "@/features/search/products/components/filters/LocationInfo.tsx";
import { stubMatchMedia } from "@/test/utils.tsx";

describe("LocationInfo", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("explains where locations come from in a popover on wide screens", async () => {
        stubMatchMedia(() => true);
        render(<LocationInfo />);

        await userEvent.click(screen.getByRole("button", { name: /Standorte/ }));
        const dialog = await screen.findByRole("dialog");
        expect(dialog).toHaveTextContent("Der Ort eines Angebots stammt vom Anbieter");

        await userEvent.click(screen.getByRole("button", { name: "Schließen" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("uses a bottom sheet on phones", async () => {
        stubMatchMedia(() => false);
        render(<LocationInfo />);

        await userEvent.click(screen.getByRole("button", { name: /Standorte/ }));
        expect(await screen.findByText(/Der Ort eines Angebots stammt vom Anbieter/)).toBeVisible();
    });
});
