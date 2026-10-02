import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PartnerProductsApiReference, {
    PARTNER_PRODUCTS_OPENAPI_SPEC_URL,
} from "../PartnerProductsApiReference.tsx";

const apiReference = vi.hoisted(() => vi.fn((_props: { configuration: unknown }) => null));
vi.mock("@scalar/api-reference-react", () => ({ ApiReferenceReact: apiReference }));

afterEach(cleanup);

describe("embedded partner reference", () => {
    it("loads the public subset without a request client or persisted credentials", () => {
        render(<PartnerProductsApiReference />);
        expect(apiReference).toHaveBeenCalledWith(
            expect.objectContaining({
                configuration: expect.objectContaining({
                    url: PARTNER_PRODUCTS_OPENAPI_SPEC_URL,
                    hideClientButton: true,
                    hideTestRequestButton: true,
                    persistAuth: false,
                }),
            }),
            undefined,
        );
        const configuration = apiReference.mock.calls[0]?.[0];
        expect(JSON.stringify(configuration)).not.toContain("woocommerceWebhookSecret");
    });
});
