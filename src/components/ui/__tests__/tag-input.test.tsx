import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TagInput } from "@/components/ui/tag-input.tsx";

describe("TagInput", () => {
    it("adds a tag on Enter and clears the draft", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={[]} onChange={onChange} />);
        const input = screen.getByRole("textbox");
        await user.type(input, "Tisch{Enter}");

        expect(onChange).toHaveBeenCalledWith(["Tisch"]);
        expect(input).toHaveValue("");
    });

    it("adds a tag on comma", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={[]} onChange={onChange} />);
        await user.type(screen.getByRole("textbox"), "Stuhl,");

        expect(onChange).toHaveBeenCalledWith(["Stuhl"]);
    });

    it("ignores empty input on Enter", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={[]} onChange={onChange} />);
        await user.type(screen.getByRole("textbox"), "{Enter}");

        expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores duplicate tags", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={["Tisch"]} onChange={onChange} />);
        await user.type(screen.getByRole("textbox"), "Tisch{Enter}");

        expect(onChange).not.toHaveBeenCalled();
    });

    it("removes a tag when its remove button is clicked", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={["Tisch", "Stuhl"]} onChange={onChange} />);
        await user.click(screen.getByRole("button", { name: "Tisch" }));

        expect(onChange).toHaveBeenCalledWith(["Stuhl"]);
    });

    it("uses removeTagLabel for the remove button's accessible name", () => {
        render(
            <TagInput
                value={["Tisch"]}
                onChange={vi.fn()}
                removeTagLabel={(tag) => `Entfernen: ${tag}`}
            />,
        );

        expect(screen.getByRole("button", { name: "Entfernen: Tisch" })).toBeInTheDocument();
    });

    it("removes the last tag on Backspace when the input is empty", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={["Tisch", "Stuhl"]} onChange={onChange} />);
        await user.click(screen.getByRole("textbox"));
        await user.keyboard("{Backspace}");

        expect(onChange).toHaveBeenCalledWith(["Tisch"]);
    });

    it("does not remove a tag on Backspace when the input has text", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<TagInput value={["Tisch"]} onChange={onChange} />);
        await user.type(screen.getByRole("textbox"), "ab{Backspace}");

        expect(onChange).not.toHaveBeenCalled();
    });

    it("adds the draft on blur", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <div>
                <TagInput value={[]} onChange={onChange} />
                <button type="button">other</button>
            </div>,
        );
        await user.type(screen.getByRole("textbox"), "Tisch");
        await user.click(screen.getByRole("button", { name: "other" }));

        expect(onChange).toHaveBeenCalledWith(["Tisch"]);
    });

    it("blocks a term shorter than minLength and shows the message", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <TagInput
                value={[]}
                onChange={onChange}
                minLength={3}
                minLengthMessage="Mindestens 3 Zeichen"
            />,
        );
        const input = screen.getByRole("textbox");
        await user.type(input, "ab{Enter}");

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue("ab");
        expect(screen.getByText("Mindestens 3 Zeichen")).toBeInTheDocument();
    });

    it("clears the too-short message once the user keeps typing", async () => {
        const user = userEvent.setup();

        render(
            <TagInput
                value={[]}
                onChange={vi.fn()}
                minLength={3}
                minLengthMessage="Mindestens 3 Zeichen"
            />,
        );
        const input = screen.getByRole("textbox");
        await user.type(input, "ab{Enter}");
        expect(screen.getByText("Mindestens 3 Zeichen")).toBeInTheDocument();

        await user.type(input, "c");
        expect(screen.queryByText("Mindestens 3 Zeichen")).not.toBeInTheDocument();
    });

    it("forwards id so the field can be associated with a label", () => {
        render(<TagInput value={[]} onChange={vi.fn()} id="query-terms" />);

        expect(screen.getByRole("textbox")).toHaveAttribute("id", "query-terms");
    });
});
