import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminListingSourceFiltersForm } from "../AdminListingSourceFiltersForm.tsx";

function platformInput() {
    return screen.getByLabelText(testI18n.t("adminListingSources.fields.platformTechnology"));
}

function apply() {
    fireEvent.click(
        screen.getByRole("button", { name: testI18n.t("adminListingSources.filters.apply") }),
    );
}

describe("AdminListingSourceFiltersForm", () => {
    it("applies a platform code in its canonical case", async () => {
        const onApply = vi.fn();
        render(<AdminListingSourceFiltersForm filters={{}} onApply={onApply} />);

        fireEvent.change(platformInput(), { target: { value: " shopware " } });
        apply();

        await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
        expect(onApply).toHaveBeenCalledWith({
            platformTechnology: "SHOPWARE",
            sort: "name",
            order: "asc",
        });
    });

    it("explains a malformed platform code and does not apply it", async () => {
        const onApply = vi.fn();
        render(<AdminListingSourceFiltersForm filters={{}} onApply={onApply} />);

        fireEvent.change(platformInput(), { target: { value: "shop-ware" } });
        apply();

        expect(
            await screen.findByText(
                testI18n.t("adminListingSources.validation.platformTechnology"),
            ),
        ).toBeInTheDocument();
        expect(platformInput()).toHaveAttribute("aria-invalid", "true");
        expect(onApply).not.toHaveBeenCalled();
    });

    it("starts from the applied platform filter", () => {
        render(
            <AdminListingSourceFiltersForm
                filters={{ platformTechnology: "BIGCOMMERCE" }}
                onApply={vi.fn()}
            />,
        );

        expect(platformInput()).toHaveValue("BIGCOMMERCE");
    });
});
