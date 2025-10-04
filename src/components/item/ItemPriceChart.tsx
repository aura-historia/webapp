import type { ItemEvent } from "@/data/internal/ItemDetails.ts";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";

export function ItemPriceChart({ history }: { readonly history?: readonly ItemEvent[] }) {
    console.log(history);
    return (
        <>
            <Card className="flex flex-col sm:flex-row p-8 gap-4 shadow-md min-w-0">
                <H2>Preisverlauf</H2>
                {/* TODO */}
            </Card>
        </>
    );
}
