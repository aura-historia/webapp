import { describe, expect, it } from "vitest";
import { Route } from "../_auth.tsx";

describe("_auth route", () => {
    it("adds noindex robots meta tag for private pages", () => {
        const head = Route.options.head;
        expect(head).toBeDefined();
        expect(head?.({} as never)).toEqual({
            meta: [{ name: "robots", content: "noindex, nofollow" }],
        });
    });
});
