import { ItemStateFilter } from "@/components/search/filters/ItemStateFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type React from "react";

// Wrapper component to provide form context for tests
const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ItemStateFilter", () => {
    it("renders all item state options with checkboxes", () => {
        render(
            <FormWrapper>
                <ItemStateFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("search.filter.itemState")).toBeInTheDocument();

        // All states should be rendered
        expect(screen.getByText("itemState.listed")).toBeInTheDocument();
        expect(screen.getByText("itemState.available")).toBeInTheDocument();
        expect(screen.getByText("itemState.reserved")).toBeInTheDocument();
        expect(screen.getByText("itemState.sold")).toBeInTheDocument();
        expect(screen.getByText("itemState.removed")).toBeInTheDocument();
        expect(screen.getByText("itemState.unknown")).toBeInTheDocument();

        // All checkboxes should be rendered and checked by default
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(6);
        checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeChecked();
        });
    });

    it("unchecks a status when the checkbox is clicked", async () => {
        render(
            <FormWrapper>
                <ItemStateFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const checkboxes = screen.getAllByRole("checkbox");

        // Uncheck the first checkbox (LISTED)
        await user.click(checkboxes[0]);

        // The first checkbox should now be unchecked
        expect(checkboxes[0]).not.toBeChecked();

        // Other checkboxes should still be checked
        for (let i = 1; i < checkboxes.length; i++) {
            expect(checkboxes[i]).toBeChecked();
        }
    });

    it("checks a status when the checkbox is clicked again", async () => {
        render(
            <FormWrapper
                defaultValues={{
                    itemState: ["AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
                }}
            >
                <ItemStateFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const checkboxes = screen.getAllByRole("checkbox");

        // The first checkbox (LISTED) should be unchecked initially
        expect(checkboxes[0]).not.toBeChecked();

        // Check the first checkbox
        await user.click(checkboxes[0]);

        // The first checkbox should now be checked
        expect(checkboxes[0]).toBeChecked();
    });

    it("applies different opacity to selected vs unselected status badges", () => {
        render(
            <FormWrapper defaultValues={{ itemState: ["LISTED"] }}>
                <ItemStateFilter />
            </FormWrapper>,
        );

        // Get all status badges
        const statusBadges = screen.getAllByText(
            /itemState.listed|itemState.available|itemState.reserved|itemState.sold|itemState.removed|itemState.unknown/,
        );
        expect(statusBadges).toHaveLength(6);

        // First badge (LISTED) should not have opacity class
        const listedBadge = screen.getByText("itemState.listed");
        expect(listedBadge).not.toHaveClass("opacity-35");

        // Other badges should have opacity class
        const availableBadge = screen.getByText("itemState.available");
        expect(availableBadge).toHaveClass("opacity-35");
    });

    it("handles multiple selections and deselections correctly", async () => {
        render(
            <FormWrapper>
                <ItemStateFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const checkboxes = screen.getAllByRole("checkbox");

        // Uncheck multiple checkboxes
        await user.click(checkboxes[0]); // LISTED
        await user.click(checkboxes[2]); // RESERVED
        await user.click(checkboxes[4]); // REMOVED

        // Verify those checkboxes are unchecked
        expect(checkboxes[0]).not.toBeChecked();
        expect(checkboxes[2]).not.toBeChecked();
        expect(checkboxes[4]).not.toBeChecked();

        // Verify other checkboxes are still checked
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[3]).toBeChecked();
        expect(checkboxes[5]).toBeChecked();

        // Check one of them again
        await user.click(checkboxes[2]); // RESERVED
        expect(checkboxes[2]).toBeChecked();
    });

    it("works correctly with initially empty selection", () => {
        render(
            <FormWrapper defaultValues={{ itemState: [] }}>
                <ItemStateFilter />
            </FormWrapper>,
        );

        // All checkboxes should be unchecked
        const checkboxes = screen.getAllByRole("checkbox");
        checkboxes.forEach((checkbox) => {
            expect(checkbox).not.toBeChecked();
        });

        // All badges should have opacity applied
        const badges = screen.getAllByText(
            /itemState.listed|itemState.available|itemState.reserved|itemState.sold|itemState.removed|itemState.unknown/,
        );
        badges.forEach((badge) => {
            expect(badge).toHaveClass("opacity-35");
        });
    });
});
