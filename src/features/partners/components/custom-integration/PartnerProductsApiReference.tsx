import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useEffect } from "react";
import "@scalar/api-reference-react/style.css";
import partnerProductsApiReferenceCss from "./PartnerProductsApiReference.css?raw";

export const PARTNER_PRODUCTS_OPENAPI_SPEC_URL = "/partner-products.openapi.json";

function isSamePageHashUpdate(url: string | URL | null | undefined) {
    if (!url || import.meta.env.SSR) {
        return false;
    }

    const nextUrl = new URL(url, globalThis.location.href);
    return (
        nextUrl.origin === globalThis.location.origin &&
        nextUrl.pathname === globalThis.location.pathname &&
        nextUrl.search === globalThis.location.search &&
        nextUrl.hash !== ""
    );
}

export default function PartnerProductsApiReference() {
    useEffect(() => {
        const originalPushState = globalThis.history.pushState;
        const originalReplaceState = globalThis.history.replaceState;

        globalThis.history.pushState = function pushStateWithoutScalarHashRouting(
            data: unknown,
            unused: string,
            url?: string | URL | null,
        ) {
            if (isSamePageHashUpdate(url)) {
                return;
            }

            return originalPushState.call(this, data, unused, url);
        };

        globalThis.history.replaceState = function replaceStateWithoutScalarHashRouting(
            data: unknown,
            unused: string,
            url?: string | URL | null,
        ) {
            if (isSamePageHashUpdate(url)) {
                return;
            }

            return originalReplaceState.call(this, data, unused, url);
        };

        return () => {
            globalThis.history.pushState = originalPushState;
            globalThis.history.replaceState = originalReplaceState;
        };
    }, []);

    return (
        <div
            className="partner-products-api-reference h-[min(960px,calc(100dvh_-_64px))] w-full bg-background"
            data-testid="partner-products-api-reference"
        >
            <ApiReferenceReact
                configuration={{
                    url: PARTNER_PRODUCTS_OPENAPI_SPEC_URL,
                    darkMode: false,
                    forceDarkModeState: "light",
                    hideDarkModeToggle: true,
                    hideSearch: true,
                    layout: "modern",
                    redirect: () => null,
                    theme: "none",
                    withDefaultFonts: false,
                    customCss: partnerProductsApiReferenceCss,
                }}
            />
        </div>
    );
}
