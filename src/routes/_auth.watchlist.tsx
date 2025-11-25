import { createFileRoute } from "@tanstack/react-router";
import { WatchlistResults } from "@/components/watchlist/WatchlistResults.tsx";

export const Route = createFileRoute("/_auth/watchlist")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 lg:ml-auto lg:mr-auto">
            <WatchlistResults />
        </div>
    );
}
