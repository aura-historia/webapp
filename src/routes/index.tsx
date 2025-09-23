import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: LandingPage,
});

export function LandingPage() {
    return (
        <>
            {/* Full screen height search container */}
            <section className="h-[calc(100vh-5rem)] flex items-center justify-center">
                <div className="w-full max-w-4xl px-4">
                    <H1 className="text-center hyphens-manual">
                        Entdecken, vergleichen, sammeln- <br />
                        mit Klarheit im An&shy;ti&shy;qui&shy;tä&shy;ten&shy;markt
                    </H1>

                    <Card className={"p-6 sm:mt-16 mt-4"}>
                        <SearchBar />
                    </Card>
                </div>
            </section>

            {/* Scrollable Content */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <H2 className="text-center mb-12">Discover More Content</H2>
                    <div className="space-y-6 text-lg">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur.
                        </p>
                        <p>
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                            officia deserunt mollit anim id est laborum. You can add as much content
                            as you need here—articles, feature lists, testimonials, footers, and
                            more. The layout will handle the scroll automatically.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
