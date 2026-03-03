import { describe, expect, it } from "vitest";
import { Route } from "../../routes/_auth.tsx";

describe("_auth route", () => {
    it("adds noindex robots meta tag for private pages", () => {
        const head = Route.options.head;
        expect(head).toBeDefined();
        const context = {} as Parameters<NonNullable<typeof head>>[0];
        expect(head?.(context)).toEqual({
            meta: [{ name: "robots", content: "noindex, nofollow" }],
        });
    });
});
