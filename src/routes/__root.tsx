import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    useMatches,
    Link,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import { Footer } from "@/components/common/Footer.tsx";
import { Header } from "@/components/common/Header.tsx";
import type { QueryClient } from "@tanstack/react-query";
import type React from "react";
import { Toaster } from "sonner";
import "@/lib/polyfills/url";
import "@/amplify-config.ts";
import "@/api-config.ts";
import { SearchX } from "lucide-react";
import { H2 } from "@/components/typography/H2";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getLocale } from "@/lib/server/i18n.server.ts";
import i18n from "@/i18n/i18n.ts";

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
    beforeLoad: async () => {
        // Set locale for initial server side rendering based on browsers pref
        const locale = await getLocale();
        if (i18n.language !== locale) {
            await i18n.changeLanguage(locale);
        }
    },
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
});

function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H2>{t("notFound.title")}</H2>
                    <p className="text-base text-muted-foreground">{t("notFound.description")}</p>
                </div>
                <Button asChild>
                    <Link to="/">{t("notFound.goHome")}</Link>
                </Button>
            </div>
        </div>
    );
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
    const matches = useMatches();
    const isLandingPage = matches.some((match) => match.routeId === "/");
    const { i18n } = useTranslation();

    return (
        <html lang={i18n.language || "en"}>
            <head>
                <HeadContent />
            </head>
            <body
                className={
                    isLandingPage
                        ? "[background:var(--linear-gradient-main)]"
                        : "bg-[repeating-linear-gradient(45deg,var(--border)_0,var(--border)_1px,transparent_1px,transparent_40px)] bg-fixed"
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
