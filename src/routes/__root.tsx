import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    HeadContent,
    Scripts,
    createRootRouteWithContext,
    useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import { Footer } from "@/components/common/Footer.tsx";
import { Header } from "@/components/common/Header.tsx";
import type { QueryClient } from "@tanstack/react-query";
import type React from "react";
import { Toaster } from "sonner";
import "../amplify-config.ts";

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    head: () => {
        return {
            meta: [
                {
                    charSet: "utf-8",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    title: "Aura Historia (Preview)",
                },
            ],
            links: [
                {
                    rel: "stylesheet",
                    href: appCss,
                },
            ],
        };
    },

    shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
    const matches = useMatches();
    const isLandingPage = matches.some((match) => match.routeId === "/");

    return (
        <html lang="de">
            <head>
                <HeadContent />
            </head>
            <body
                className={
                    isLandingPage
                        ? "[background:var(--linear-gradient-main)]"
                        : "[background-image:repeating-linear-gradient(45deg,var(--border)_0,var(--border)_1px,transparent_1px,transparent_40px)] bg-fixed"
                }
            >
                <div className={"min-h-screen flex flex-col"}>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
                <Toaster position="top-center" richColors />
                <TanStackDevtools
                    config={{
                        position: "bottom-left",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
