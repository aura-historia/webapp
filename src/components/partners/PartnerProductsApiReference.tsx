import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export const PARTNER_PRODUCTS_OPENAPI_SPEC_URL = "/partner-products.openapi.json";

const PARTNER_PRODUCTS_API_REFERENCE_CUSTOM_CSS = `
.scalar-app {
    --scalar-font: "Manrope Variable", sans-serif;
    --scalar-font-code: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
    --scalar-radius: 8px;
    --scalar-radius-lg: 18px;
    --scalar-radius-xl: 28px;
    --scalar-sidebar-padding: 20px;
}

.light-mode {
    --scalar-background-1: #fcf9ef;
    --scalar-background-2: #f7f4e9;
    --scalar-background-3: #f1eee4;
    --scalar-background-accent: rgba(66, 18, 15, 0.08);
    --scalar-color-1: #1c1c16;
    --scalar-color-2: #534341;
    --scalar-color-3: #675c57;
    --scalar-color-accent: #42120f;
    --scalar-border-color: #d8c1bf;
    --scalar-button-1: #42120f;
    --scalar-button-1-hover: #5d2722;
    --scalar-button-1-color: #ffffff;
}

.dark-mode {
    --scalar-background-1: #1c1c16;
    --scalar-background-2: #252520;
    --scalar-background-3: #31312a;
    --scalar-background-accent: rgba(255, 180, 171, 0.12);
    --scalar-color-1: #f4f1e7;
    --scalar-color-2: #d8c1bf;
    --scalar-color-3: #a08d8b;
    --scalar-color-accent: #ffb4ab;
    --scalar-border-color: #534341;
    --scalar-button-1: #ffb4ab;
    --scalar-button-1-hover: #da8d84;
    --scalar-button-1-color: #390b09;
}

.scalar-app .references-layout {
    min-height: 960px;
}

.scalar-app .references-sidebar {
    background: linear-gradient(180deg, var(--scalar-background-2) 0%, var(--scalar-background-1) 100%);
}
`;

export default function PartnerProductsApiReference() {
    return (
        <div
            className="partner-products-api-reference min-h-[960px] w-full bg-background"
            data-testid="partner-products-api-reference"
        >
            <ApiReferenceReact
                configuration={{
                    url: PARTNER_PRODUCTS_OPENAPI_SPEC_URL,
                    hideSearch: true,
                    layout: "modern",
                    theme: "alternate",
                    withDefaultFonts: false,
                    customCss: PARTNER_PRODUCTS_API_REFERENCE_CUSTOM_CSS,
                }}
            />
        </div>
    );
}
