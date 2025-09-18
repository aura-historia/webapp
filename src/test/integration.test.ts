import { describe, expect, it } from "vitest";

describe("Environment and Configuration", () => {
    it("should have NODE_ENV defined in test environment", () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });

    it("should be running in test mode", () => {
        expect(process.env.NODE_ENV).toBe("test");
    });
});
