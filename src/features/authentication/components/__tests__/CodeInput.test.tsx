import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeInput } from "../CodeInput";

describe("CodeInput", () => {
    it("takes focus when it mounts", () => {
        render(<CodeInput aria-label="Code" />);

        expect(screen.getByRole("textbox", { name: "Code" })).toHaveFocus();
    });

    it("leaves focus alone when a caller opts out", () => {
        render(<CodeInput aria-label="Code" autoFocus={false} />);

        expect(screen.getByRole("textbox", { name: "Code" })).not.toHaveFocus();
    });
});
