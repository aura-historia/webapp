import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";

const OPTIONS = [
    { value: "A", label: "Option A" },
    { value: "B", label: "Option B" },
    { value: "C", label: "Option C" },
];

describe("CheckboxMultiSelect – requireSelection", () => {
    it("allows deselecting an option when 2 are selected", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CheckboxMultiSelect
                options={OPTIONS}
                value={["A", "B"]}
                onChange={onChange}
                requireSelection
            />,
        );

        await user.click(screen.getByRole("combobox"));
        // getAllByText returns trigger badge first, then dropdown option – click the last one
        const optionElements = screen.getAllByText("Option A");
        await user.click(optionElements[optionElements.length - 1]);
        await user.click(document.body);

        const lastCall = onChange.mock.calls.at(-1)?.[0] as string[];
        expect(lastCall).not.toContain("A");
        expect(lastCall).toContain("B");
    });

    it("blocks deselecting the last remaining option", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CheckboxMultiSelect
                options={OPTIONS}
                value={["A"]}
                onChange={onChange}
                requireSelection
            />,
        );

        await user.click(screen.getByRole("combobox"));
        const optionElements = screen.getAllByText("Option A");
        await user.click(optionElements[optionElements.length - 1]);
        await user.click(document.body);

        const lastCall = onChange.mock.calls.at(-1)?.[0] as string[];
        expect(lastCall).toContain("A");
    });

    it("applies cursor-not-allowed styling to the last remaining selected option", async () => {
        const user = userEvent.setup();

        render(
            <CheckboxMultiSelect
                options={OPTIONS}
                value={["A"]}
                onChange={vi.fn()}
                requireSelection
                requireSelectionLabel="Mindestens 1 erforderlich"
            />,
        );

        await user.click(screen.getByRole("combobox"));

        const optionElements = screen.getAllByText("Option A");
        const dropdownOption = optionElements[optionElements.length - 1];
        const hasBlockedStyle = (() => {
            let node: Element | null = dropdownOption;
            while (node) {
                if (node.className?.includes?.("cursor-not-allowed")) return true;
                node = node.parentElement;
            }
            return false;
        })();
        expect(hasBlockedStyle).toBe(true);
    });

    it("blocks deselecting all via toggle-all when requireSelection is true", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <CheckboxMultiSelect
                options={OPTIONS}
                value={["A", "B", "C"]}
                onChange={onChange}
                requireSelection
                allSelectedLabel="Alle"
            />,
        );

        await user.click(screen.getByRole("combobox"));
        const alleElements = screen.getAllByText("Alle");
        await user.click(alleElements[alleElements.length - 1]);
        await user.click(document.body);

        const lastCall = onChange.mock.calls.at(-1)?.[0] as string[];
        expect(lastCall).toHaveLength(3);
    });
});
