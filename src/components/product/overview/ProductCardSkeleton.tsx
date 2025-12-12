import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export function ProductCardSkeleton() {
    return (
        <Card
            data-testid="product-card-skeleton"
            className={"flex flex-col lg:flex-row p-8 gap-4 shadow-md min-w-0 w-full"}
        >
            <div className={"flex-shrink-0 flex lg:justify-start justify-center"}>
                <Skeleton className={"size-48 rounded-lg"} />
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between"}>
                <div className={"flex flex-row justify-between w-full gap-4"}>
                    <div className={"flex flex-col gap-2 overflow-hidden"}>
                        <Skeleton className={"h-8 w-64"} />
                        <Skeleton className={"h-6 w-40"} />
                        <Skeleton className={"h-5 w-24 rounded-full"} />
                    </div>

                    <div className={"ml-auto flex-shrink-0"}>
                        <Skeleton className={"size-10 rounded-md"} />
                    </div>
                </div>

                <div
                    className={
                        "flex flex-col lg:flex-row gap-4 lg:items-end lg:gap-0 justify-between w-full mt-4 lg:mt-0"
                    }
                >
                    <Skeleton className={"h-8 w-32"} />

                    <div className={"flex flex-col gap-2 lg:items-end flex-shrink-0"}>
                        <Skeleton className={"h-10 w-full lg:w-24 flex-shrink-0 rounded-md"} />
                        <Skeleton className={"h-10 w-full lg:w-48 flex-shrink-0 rounded-md"} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
