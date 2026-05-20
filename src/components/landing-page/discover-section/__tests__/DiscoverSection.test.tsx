import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@number-flow/react", () => ({
    default: ({ value, suffix }: { value: number; suffix?: string }) => (
        <span data-testid="number-flow">{`${value}${suffix ?? ""}`}</span>
    ),
}));

class TriggeringIntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(el: Element) {
        this.callback(
            [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
        );
    }
    unobserve() {}
    disconnect() {}
}

describe("DiscoverSection", () => {
    describe("static content", () => {
        beforeEach(async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection />);
            });
        });

        it("renders the section title", () => {
            expect(
                screen.getByText(
                    "Wir bringen Transparenz in die undurchsichtige Welt der Online-Antiquitäten",
                ),
            ).toBeInTheDocument();
        });

        it("renders the description paragraphs", () => {
            expect(
                screen.getByText(/Wir durchsuchen täglich das unübersichtliche Angebot/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /Wir erfassen nicht nur aktuelle und neu aufgetauchte Antiquitäten/,
                ),
            ).toBeInTheDocument();
        });

        it("renders all highlights", () => {
            expect(
                screen.getByText("Über 500 Händler, Auktionshäuser und Marktplätze"),
            ).toBeInTheDocument();
            expect(screen.getByText("Echtzeit-Überwachung")).toBeInTheDocument();
            expect(screen.getByText("Vollständig Sprach-unabhängig")).toBeInTheDocument();
        });

        it("renders highlight descriptions", () => {
            expect(
                screen.getByText(/Wir durchsuchen kontinuierlich renommierte Antiquitätenhändler/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /Sowohl neu aufgetauchte Antiquitäten, als auch Preis- und Verfügbarkeits-Updates werden nahezu in Echtzeit erfasst/,
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(/Wir übersetzen jeden Artikel in verschiedene Sprachen/),
            ).toBeInTheDocument();
        });

        it("renders all stat labels", () => {
            expect(screen.getByText("Vernetzte Shops")).toBeInTheDocument();
            expect(screen.getByText("Einzigartige Artikel")).toBeInTheDocument();
            expect(screen.getByText("Nahezu Echtzeit-Updates")).toBeInTheDocument();
            expect(screen.getByText("Länder abgedeckt")).toBeInTheDocument();
        });

        it("renders text-only stat as translation string", () => {
            expect(screen.getByText("24/7+")).toBeInTheDocument();
        });
    });

    describe("stat counts", () => {
        beforeEach(() => {
            vi.stubGlobal("IntersectionObserver", TriggeringIntersectionObserver);
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        function getCountValues() {
            return screen.getAllByTestId("number-flow").map((el) => el.textContent);
        }

        it("uses fallback amounts when no props are provided", async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection />);
            });
            const values = getCountValues();
            expect(values).toContain("500+");
            expect(values).toContain("120000+");
            expect(values).toContain("15+");
        });

        it("uses live shop count over fallback", async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection shopCount={1234} />);
            });
            const values = getCountValues();
            expect(values).toContain("1234+");
            expect(values).not.toContain("500+");
        });

        it("uses live product count over fallback", async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection productCount={56789} />);
            });
            const values = getCountValues();
            expect(values).toContain("56789+");
            expect(values).not.toContain("120000+");
        });

        it("uses both live counts simultaneously", async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection shopCount={999} productCount={88888} />);
            });
            const values = getCountValues();
            expect(values).toContain("999+");
            expect(values).toContain("88888+");
        });

        it("falls back to static amount when one prop is missing", async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection shopCount={999} />);
            });
            const values = getCountValues();
            expect(values).toContain("999+");
            expect(values).toContain("120000+");
        });
    });
});
