import { TanstackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import { Footer } from "@/components/common/Footer.tsx";
import { Header } from "@/components/common/Header.tsx";
import { Authenticator } from "@aws-amplify/ui-react";
import type { QueryClient } from "@tanstack/react-query";
import type React from "react";
import "../amplify-config.ts";

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "Blitzfilter Webapp",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),

    shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
    return (
        <html lang="de">
            <head>
                <HeadContent />
            </head>
            <body>
                <Authenticator.Provider>
                    <div className={"min-h-screen flex flex-col"}>
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                </Authenticator.Provider>

                <TanstackDevtools
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
