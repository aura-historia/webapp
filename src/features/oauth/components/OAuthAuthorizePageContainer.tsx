import type { ReactNode } from "react";

export function OAuthAuthorizePageContainer({ children }: { readonly children: ReactNode }) {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 px-8 lg:px-4 lg:mx-auto">
            {children}
        </div>
    );
}
