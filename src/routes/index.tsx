import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    return (
        <div className="text-center">
            <h1>Welcome to Blitzfilter</h1>
        </div>
    );
}
