import { H1 } from "@/components/typography/H1.tsx";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface OAuthAuthorizePageSkeletonProps {
    readonly requestedScopes: readonly string[];
    readonly title: string;
}

export function OAuthAuthorizePageSkeleton({
    requestedScopes,
    title,
}: OAuthAuthorizePageSkeletonProps) {
    return (
        <div className="w-full max-w-lg mx-auto flex flex-col gap-4" aria-busy="true">
            <H1>{title}</H1>

            <Card className="gap-4">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Skeleton className="size-16 shrink-0 rounded-sm" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Skeleton className="h-7 w-48 max-w-full" />
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>

                    {requestedScopes.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <Skeleton className="h-5 w-28" />
                            <ul className="flex flex-col gap-2">
                                {requestedScopes.map((scope) => (
                                    <li
                                        key={scope}
                                        className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <Skeleton className="h-5 w-24 rounded-sm" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-start gap-2 rounded-sm bg-surface-container-highest/40 p-3">
                        <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
                        <Skeleton className="h-4 flex-1" />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
                    <Skeleton className="h-9 w-full sm:w-24" />
                    <Skeleton className="h-9 w-full sm:w-20" />
                </CardFooter>
            </Card>
        </div>
    );
}
