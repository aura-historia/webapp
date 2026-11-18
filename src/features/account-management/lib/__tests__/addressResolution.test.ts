import { describe, expect, it } from "vitest";
import { USER_ADDRESS_RESOLUTION_STATUSES } from "@/data/internal/geography/UserAddress.ts";
import { locationDisplay } from "../addressResolution.ts";

describe("locationDisplay", () => {
    it("shows the location once located and nothing while the lookup runs", () => {
        expect(locationDisplay("ACCEPTED")).toBe("located");
        expect(locationDisplay("PENDING")).toBe("pending");
    });

    it("treats every other outcome as not located", () => {
        const others = [...USER_ADDRESS_RESOLUTION_STATUSES, "UNKNOWN" as const].filter(
            (status) => status !== "ACCEPTED" && status !== "PENDING",
        );
        expect(others).toHaveLength(6);
        for (const status of others) expect(locationDisplay(status)).toBe("notLocated");
    });
});
