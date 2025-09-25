import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";

export default function SearchContainer() {
    return (
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
    );
}
