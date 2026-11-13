import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderStatusInfo } from "../ProviderStatusInfo.tsx";

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        to,
        children,
        className,
    }: {
        to: string;
        children: ReactNode;
        className?: string;
    }) => (
        <a href={to.replace("$lng", "de")} className={className}>
            {children}
        </a>
    ),
}));

const props = {
    scope: "listing",
    providerName: "Hartley & Finch",
    sourceUrl: "https://www.hartleyfinch.co.uk/item/1",
    sourceHost: "hartleyfinch.co.uk",
    removalHref: "mailto:contact@aura-historia.com?subject=x",
} as const;

describe("ProviderStatusInfo", () => {
    beforeEach(() => {
        // From 768px: the popover.
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: true,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
        }));
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("opens the details with the reviewed statements in order", async () => {
        render(<ProviderStatusInfo {...props} />);

        const trigger = screen.getByRole("button", { name: "Über dieses Angebot" });
        expect(trigger).toHaveAttribute("aria-expanded", "false");
        await userEvent.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("heading", { name: "Über dieses Angebot" })).toBeInTheDocument();
        const facts = screen.getAllByRole("listitem").map((item) => item.textContent);
        expect(facts).toEqual([
            "Hartley & Finch ist ein unabhängiger Anbieter und kein Partner von Aura Historia.",
            "Automatisch gefunden auf hartleyfinch.co.uk.",
            "Titel, Beschreibung und Bilder gehören dem Anbieter oder den jeweiligen Rechteinhabern. Aura Historia beansprucht daran keine Rechte.",
            "Titel und Beschreibung sind bei Bedarf maschinell übersetzt. Maßgeblich ist der Originaltext auf der Seite des Anbieters.",
            "Bilder werden direkt von der Website des Anbieters geladen; Aura Historia stellt keine eigenen Kopien bereit.",
            "Preis, Verfügbarkeit und Zustand können sich jederzeit ändern; Versandkosten, Steuern oder Zölle können hinzukommen. Maßgeblich sind die Angaben auf der Seite des Anbieters.",
            "Ihr Vertragspartner ist allein der Anbieter; er wickelt Kauf, Bezahlung, Versand und Rückgabe ab.",
            "Aura Historia prüft bei keinem Angebot Richtigkeit, Echtheit oder Provenienz.",
        ]);
        // The source link is the canonical address, not the referral-tagged one.
        expect(screen.getByRole("link", { name: "hartleyfinch.co.uk" })).toHaveAttribute(
            "href",
            props.sourceUrl,
        );
        expect(
            screen.getByRole("link", { name: "Entfernung dieses Angebots beantragen" }),
        ).toHaveAttribute("href", props.removalHref);
        expect(screen.getByRole("link", { name: "Partner werden" })).toHaveAttribute(
            "href",
            "/de/partner-program",
        );
    });

    it("names all listings on a provider page and closes with the close button", async () => {
        render(<ProviderStatusInfo {...props} scope="provider" />);

        await userEvent.click(screen.getByRole("button", { name: "Über diesen Anbieter" }));
        expect(
            screen.getByRole("link", { name: "Entfernung aller Angebote beantragen" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/^Angebote automatisch gefunden auf/, { selector: "span" }),
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Schließen" }));
        expect(
            screen.queryByRole("heading", { name: "Über diesen Anbieter" }),
        ).not.toBeInTheDocument();
    });

    it("leaves out the source line when the provider has no address", async () => {
        render(<ProviderStatusInfo {...props} sourceUrl={undefined} sourceHost={undefined} />);

        await userEvent.click(screen.getByRole("button", { name: "Über dieses Angebot" }));
        expect(screen.queryByTestId("provider-status-fact-found")).not.toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(7);
    });
});
