import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";

describe("NAV_FOCUS_CLASS", () => {
    it("draws a solid ring on keyboard focus despite outline-none", () => {
        const classes = NAV_FOCUS_CLASS.split(" ");

        // Tailwind v4's outline-none sets the outline style that outline-2 reads; without an
        // explicit focus-visible style the ring stays invisible.
        expect(classes).toContain("outline-none");
        expect(classes).toEqual(
            expect.arrayContaining([
                "focus-visible:outline-2",
                "focus-visible:outline-solid",
                "focus-visible:outline-offset-3",
                "focus-visible:outline-brass",
            ]),
        );
    });
});
