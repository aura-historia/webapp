import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton";

export function ItemCardSkeleton() {
    return (
        <Card
            data-testid="item-card-skeleton"
            className={"flex flex-col sm:flex-row p-8 gap-4 shadow-md min-w-0"}
        >
            <div className={"flex-shrink-0 flex sm:justify-start justify-center"}>
                <Skeleton className={"size-48 rounded-lg"} />
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between"}>
                <div className={"flex flex-row justify-between w-full"}>
                    <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
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
                        "flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-end w-full mt-4 sm:mt-0"
                    }
                >
                    <Skeleton className={"h-8 w-32"} />

                    <div className={"flex flex-col gap-2 sm:items-end flex-shrink-0 sm:ml-2"}>
                        <Skeleton className={"h-10 w-24 rounded-md"} />
                        <Skeleton className={"h-10 w-48 rounded-md"} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
