import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export const PARTNER_PRODUCTS_OPENAPI_SPEC_URL = "/partner-products.openapi.json";

export default function PartnerProductsApiReference() {
    return (
        <div className="min-h-[960px] bg-white" data-testid="partner-products-api-reference">
            <ApiReferenceReact
                configuration={{
                    url: PARTNER_PRODUCTS_OPENAPI_SPEC_URL,
                    hideSearch: true,
                    withDefaultFonts: false,
                }}
            />
        </div>
    );
}
