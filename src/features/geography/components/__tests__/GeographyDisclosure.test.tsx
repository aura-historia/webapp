import { describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";
import { renderWithRouter } from "@/test/utils.tsx";
import {
    GeographyDisclosure,
    type GeographyDisclosureKind,
} from "@/features/geography/components/GeographyDisclosure.tsx";

describe("GeographyDisclosure", () => {
    it.each<[GeographyDisclosureKind, string]>([
        ["privateAddress", "Gespeicherte Adressen sind privat"],
        ["savedOrigin", "private Kopie ihres Suchstandorts"],
        ["browserLocation", "Ihr Browser fragt"],
        ["publicPartyLocation", "Aktive Standorte sind öffentlich"],
    ])("renders the %s copy with the privacy link", async (kind, expectedText) => {
        await act(async () => {
            renderWithRouter(<GeographyDisclosure kind={kind} />);
        });

        expect(await screen.findByText(new RegExp(expectedText))).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
            "href",
            "/de/privacy",
        );
    });
});
