import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import type React from "react";

export function ItemCardSkeleton({ key }: { key?: React.Key }) {
    return (
        <Card key={key} className={"flex flex-col sm:flex-row p-8 gap-4 shadow-md min-w-0"}>
            <div className={"flex-shrink-0 flex sm:justify-start justify-center"}>
                <Skeleton className={"size-48 sm:size-48 rounded-lg bg-muted"} />
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between"}>
                <div className={"flex flex-row justify-between w-full"}>
                    <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
                        <Skeleton className={"h-8 w-64 bg-muted"} />
                        <Skeleton className={"h-6 w-40 bg-muted"} />
                        <Skeleton className={"h-5 w-24 bg-muted rounded-full"} />
                    </div>

                    <div className={"ml-auto flex-shrink-0"}>
                        <Skeleton className={"size-10 rounded-md bg-muted"} />
                    </div>
                </div>

                <div
                    className={
                        "flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-end w-full mt-4 sm:mt-0"
                    }
                >
                    <Skeleton className={"h-8 w-32 bg-muted"} />

                    <div className={"flex flex-col gap-2 sm:items-end flex-shrink-0 sm:ml-2"}>
                        <Skeleton className={"h-10 w-24 bg-muted rounded-md"} />
                        <Skeleton className={"h-10 w-48 bg-muted rounded-md"} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
