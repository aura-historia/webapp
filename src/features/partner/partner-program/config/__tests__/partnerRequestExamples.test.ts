import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
    PARTNER_CREATE_EXAMPLE,
    PARTNER_PATCH_EXAMPLE,
    PARTNER_PUT_EXAMPLE,
    PARTNER_WITHDRAW_EXAMPLE,
} from "../partnerRequestExamples.ts";

type Schema = {
    $ref?: string;
    nullable?: boolean;
    type?: string;
    enum?: unknown[];
    required?: string[];
    properties?: Record<string, Schema>;
    additionalProperties?: boolean;
    items?: Schema;
    oneOf?: Schema[];
    anyOf?: Schema[];
    allOf?: Schema[];
    minimum?: number;
    maximum?: number;
    maxItems?: number;
    minLength?: number;
    maxLength?: number;
    format?: string;
};
const spec = JSON.parse(readFileSync("public/partner-products.openapi.json", "utf8"));
const path = "/api/v1/listing-sources/{listingSourceId}/product-listings";

// Validate the OpenAPI 3.0 schema vocabulary used by the partner request examples.
function matches(value: unknown, schema: Schema): boolean {
    if (value === null) return schema.nullable === true;
    if (schema.$ref)
        return matches(value, spec.components.schemas[schema.$ref.split("/").at(-1) as string]);
    if (schema.allOf && !schema.allOf.every((part) => matches(value, part))) return false;
    if (schema.oneOf && schema.oneOf.filter((part) => matches(value, part)).length !== 1)
        return false;
    if (schema.anyOf && !schema.anyOf.some((part) => matches(value, part))) return false;
    if (schema.enum && !schema.enum.includes(value)) return false;
    if (schema.type === "object") {
        if (typeof value !== "object" || Array.isArray(value)) return false;
        const object = value as Record<string, unknown>;
        if (schema.required?.some((key) => !(key in object))) return false;
        return Object.entries(object).every(([key, entry]) => {
            const property = schema.properties?.[key];
            return property ? matches(entry, property) : schema.additionalProperties !== false;
        });
    }
    if (schema.type === "array") {
        return (
            Array.isArray(value) &&
            (schema.maxItems === undefined || value.length <= schema.maxItems) &&
            value.every((entry) => matches(entry, schema.items as Schema))
        );
    }
    if (schema.type === "integer" || schema.type === "number") {
        return (
            typeof value === "number" &&
            (schema.type !== "integer" || Number.isInteger(value)) &&
            (schema.minimum === undefined || value >= schema.minimum) &&
            (schema.maximum === undefined || value <= schema.maximum)
        );
    }
    if (schema.type === "string") {
        if (typeof value !== "string") return false;
        if (schema.minLength !== undefined && value.length < schema.minLength) return false;
        if (schema.maxLength !== undefined && value.length > schema.maxLength) return false;
        if (schema.format === "uri") {
            try {
                new URL(value);
            } catch {
                return false;
            }
        }
        if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) return false;
    }
    return true;
}

describe("partner OpenAPI contract", () => {
    it.each([
        ["post", PARTNER_CREATE_EXAMPLE],
        ["patch", PARTNER_PATCH_EXAMPLE],
        ["put", PARTNER_PUT_EXAMPLE],
        ["delete", PARTNER_WITHDRAW_EXAMPLE],
    ])("validates the %s fixture, embedded examples and empty batch", (method, example) => {
        const operation = spec.paths[path][method as string];
        const body = operation.requestBody.content["application/json"];
        expect(matches(example, body.schema)).toBe(true);
        expect(matches([], body.schema)).toBe(true);
        expect(
            matches(
                Array.from({ length: 101 }, () => example[0]),
                body.schema,
            ),
        ).toBe(false);
        for (const sample of Object.values(body.examples ?? {}) as { value: unknown }[]) {
            expect(matches(sample.value, body.schema)).toBe(true);
        }
        expect(operation.responses["200"]).toBeDefined();
        expect(operation.responses["202"]).toBeUndefined();
    });

    it("rejects stale asking prices, missing create fields and unsupported seller fields", () => {
        const schema = spec.components.schemas.CreateProductListingData;
        const entry = PARTNER_CREATE_EXAMPLE[0];
        expect(matches({ ...entry, price: { currency: "EUR", amount: 42 } }, schema)).toBe(false);
        expect(matches({ ...entry, price: { type: "ON_REQUEST" } }, schema)).toBe(true);
        expect(matches({ ...entry, url: null }, schema)).toBe(false);
        expect(matches({ sourceListingId: "test" }, schema)).toBe(false);
        expect(matches({ ...entry, seller: "test" }, schema)).toBe(false);
    });

    it("resolves every reference and prunes unrelated schemas and security definitions", () => {
        const references = JSON.stringify(spec).matchAll(/"\$ref":"([^"]+)"/g);
        for (const [, reference] of references) {
            let node: unknown = spec;
            for (const segment of reference.slice(2).split("/"))
                node = (node as Record<string, unknown>)[segment];
            expect(node, reference).toBeDefined();
        }
        expect(Object.keys(spec.paths)).toEqual([
            path,
            "/api/v1/webhooks/woocommerce/{listingSourceId}",
        ]);
        expect(spec.components.schemas.OwnUserAccountData).toBeUndefined();
        expect(spec.components.schemas.CreateListingSourceData).toBeUndefined();
        expect(Object.keys(spec.components.securitySchemes).sort()).toEqual([
            "AccessTokenAuth",
            "BearerAuth",
        ]);
        expect(JSON.stringify(spec)).not.toContain("/shops/");
    });

    it("requires webhook signature, allows an optional delivery ID and returns no success body", () => {
        const operation = spec.paths["/api/v1/webhooks/woocommerce/{listingSourceId}"].post;
        expect(
            operation.parameters.find((p: { name: string }) => p.name === "x-wc-webhook-signature")
                .required,
        ).toBe(true);
        expect(
            operation.parameters.find(
                (p: { name: string }) => p.name === "x-wc-webhook-delivery-id",
            ).required,
        ).toBe(false);
        expect(operation.responses["204"].content).toBeUndefined();
        expect(JSON.stringify(spec.components.schemas)).not.toContain("woocommerceWebhookSecret");
    });
});
