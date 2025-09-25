import { Authenticator } from "@aws-amplify/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import "@aws-amplify/ui-react/styles.css";
import "../amplify-config.ts";

export const Route = createFileRoute("/auth")({
    component: AuthPage,
});

function AuthPage() {
    return (
        <div className="flex flex-row min-h-screen justify-center items-center">
            <Authenticator />
        </div>
    );
}
