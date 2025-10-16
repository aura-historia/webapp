import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import i18n from "@/i18n/i18n.ts";
import { I18nextProvider } from "react-i18next";

export function getContext() {
    const queryClient = new QueryClient();
    return {
        queryClient,
    };
}

export function Provider({
    children,
    queryClient,
}: {
    readonly children: React.ReactNode;
    readonly queryClient: QueryClient;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        </QueryClientProvider>
    );
}
