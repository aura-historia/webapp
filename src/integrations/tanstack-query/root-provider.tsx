import { Authenticator } from "@aws-amplify/ui-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";

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
        <Authenticator.Provider>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </Authenticator.Provider>
    );
}
