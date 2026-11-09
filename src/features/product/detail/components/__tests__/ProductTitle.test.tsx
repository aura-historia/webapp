import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductTitle } from "../ProductTitle.tsx";
import {
    isTitleClampable,
    productTitleSize,
    TITLE_CLAMP_CHARACTERS,
} from "@/features/product/detail/lib/titleSize.ts";

const titleOf = (length: number) => "a".repeat(length);

describe("productTitleSize", () => {
    it.each([
        [1, "short"],
        [60, "short"],
        [61, "medium"],
        [110, "medium"],
        [111, "long"],
        [400, "long"],
    ] as const)("sizes a %i-character title as %s", (length, size) => {
        expect(productTitleSize(titleOf(length))).toBe(size);
    });

    it("ignores surrounding whitespace", () => {
        expect(productTitleSize(`   ${titleOf(60)}   `)).toBe("short");
    });

    it("clamps only titles over the threshold", () => {
        expect(isTitleClampable(titleOf(TITLE_CLAMP_CHARACTERS))).toBe(false);
        expect(isTitleClampable(titleOf(TITLE_CLAMP_CHARACTERS + 1))).toBe(true);
    });
});

describe("ProductTitle", () => {
    it("renders a short title at the largest size without a toggle", () => {
        render(<ProductTitle title="Louis XV dressing table" />);

        const heading = screen.getByRole("heading", { level: 1, name: "Louis XV dressing table" });
        expect(heading).toHaveClass("sm:text-[clamp(34px,3.2vw,46px)]");
        expect(heading).not.toHaveClass("line-clamp-4");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("steps a long title down without clamping it", () => {
        render(<ProductTitle title={titleOf(150)} />);

        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading).toHaveClass("sm:text-[clamp(26px,2.1vw,30px)]");
        expect(heading).not.toHaveClass("line-clamp-4");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("clamps a very long title and toggles the full title", async () => {
        const user = userEvent.setup();
        const title = titleOf(TITLE_CLAMP_CHARACTERS + 20);
        render(<ProductTitle title={title} />);

        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading).toHaveTextContent(title);
        expect(heading).toHaveClass("line-clamp-4");

        const toggle = screen.getByRole("button", { name: "Ganzen Titel anzeigen" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(toggle).toHaveAttribute("aria-controls", heading.id);

        await user.click(toggle);

        expect(heading).not.toHaveClass("line-clamp-4");
        expect(screen.getByRole("button", { name: "Weniger anzeigen" })).toHaveAttribute(
            "aria-expanded",
            "true",
        );
    });
});
