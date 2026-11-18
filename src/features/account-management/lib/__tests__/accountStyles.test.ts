import { FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";

describe("FOCUS_CLASS", () => {
    it("draws a solid brass ring on keyboard focus despite outline-none", () => {
        const classes = FOCUS_CLASS.split(" ");

        // Tailwind v4's outline-none sets the outline style that outline-2 reads; without an
        // explicit focus-visible style the ring stays invisible on every field and button.
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
