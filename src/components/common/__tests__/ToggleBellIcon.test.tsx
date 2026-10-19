import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToggleBellIcon } from "@/components/common/ToggleBellIcon.tsx";

describe("ToggleBellIcon", () => {
    it("does not animate on its first render", () => {
        const { container } = render(<ToggleBellIcon on={true} />);
        const icon = container.querySelector("svg");
        expect(icon).toHaveClass("lucide-bell-ring");
        expect(icon).not.toHaveClass("animate-bell-ring");
    });

    it("rings when alerts turn on", () => {
        const { container, rerender } = render(<ToggleBellIcon on={false} />);
        rerender(<ToggleBellIcon on={true} />);
        const icon = container.querySelector("svg");
        expect(icon).toHaveClass("lucide-bell-ring", "animate-bell-ring", "fill-current");
    });

    it("settles when alerts turn off", () => {
        const { container, rerender } = render(<ToggleBellIcon on={true} />);
        rerender(<ToggleBellIcon on={false} />);
        const icon = container.querySelector("svg");
        expect(icon).toHaveClass("lucide-bell", "animate-bell-settle");
    });

    it("lets reduced motion switch the animation off", () => {
        const { container } = render(<ToggleBellIcon on={false} />);
        expect(container.querySelector("svg")).toHaveClass("motion-reduce:animate-none");
    });
});
