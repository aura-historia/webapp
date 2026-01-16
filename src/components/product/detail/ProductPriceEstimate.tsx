import type { PriceEstimate } from "@/data/internal/PriceEstimate.ts";

interface ProductPriceEstimateProps {
    readonly priceEstimate: PriceEstimate;
}

export function ProductPriceEstimate({ priceEstimate }: ProductPriceEstimateProps) {
    const min = priceEstimate.min;
    const max = priceEstimate.max;

    if (!min && !max) return;

    let priceText: string;
    if (min && max) {
        priceText = `${min} - ${max}`;
    } else if (min) {
        priceText = `Mind. ${min}`;
    } else {
        priceText = `Max. ${max}`;
    }

    return (
        <div className="flex flex-row gap-2">
            <span className="text-sm text-muted-foreground">Schätzung: {priceText}</span>
        </div>
    );
}
