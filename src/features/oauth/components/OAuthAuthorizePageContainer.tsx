import type { ReactNode } from "react";
import { CONSENT_TITLE_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";

/** The consent page column: 512px, centred, on the parchment ground. */
export function OAuthAuthorizePageContainer({ children }: { readonly children: ReactNode }) {
    return (
        <div className="bg-surface px-5 pt-8 pb-16 text-ink sm:px-6 sm:pt-14 sm:pb-30">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-5 sm:gap-6">{children}</div>
        </div>
    );
}

export function OAuthAuthorizeTitle({ children }: { readonly children: ReactNode }) {
    return <h1 className={CONSENT_TITLE_CLASS}>{children}</h1>;
}
