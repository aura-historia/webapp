import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@aws-amplify/auth";
import { WatchlistResults } from "@/components/watchlist/WatchlistResults.tsx";

export const Route = createFileRoute("/watchlist")({
    beforeLoad: async () => {
        try {
            await getCurrentUser();
        } catch {
            throw redirect({
                to: "/auth",
                search: {
                    redirect: "/watchlist",
                },
            });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 lg:ml-auto lg:mr-auto">
            <WatchlistResults />
        </div>
    );
}
