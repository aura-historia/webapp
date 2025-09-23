import { SearchBar } from "@/components/search/SearchBar.tsx";
import { Card } from "@/components/ui/card.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: LandingPage,
});

function LandingPage() {
    return (
        <>
            {/* Full screen height search container */}
            <section className="h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-full max-w-4xl px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6 hyphens-auto">
                        Entdecken, vergleichen, sammeln- <br />
                        mit Klarheit im Antiquitätenmarkt
                    </h1>

                    <Card className={"p-6 mt-16"}>
                        <SearchBar />
                    </Card>
                </div>
            </section>

            {/* Scrollable Content */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Discover More Content
                    </h2>
                    <div className="space-y-6 text-gray-700 text-lg">
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
