import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminOAuthClientFiltersForm } from "../AdminOAuthClientFiltersForm.tsx";

describe("AdminOAuthClientFiltersForm", () => {
    it("applies trimmed non-empty filters only", async () => {
        const onApply = vi.fn();
        render(<AdminOAuthClientFiltersForm filters={{ name: "Old" }} onApply={onApply} />);

        expect(screen.getByLabelText(testI18n.t("adminOAuthClients.filters.name"))).toHaveProperty(
            "value",
            "Old",
        );
        fireEvent.change(screen.getByLabelText(testI18n.t("adminOAuthClients.filters.clientId")), {
            target: { value: "  oc_test123  " },
        });
        fireEvent.change(screen.getByLabelText(testI18n.t("adminOAuthClients.filters.name")), {
            target: { value: "   " },
        });
        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.filters.apply") }),
        );

        await waitFor(() => expect(onApply).toHaveBeenCalledWith({ clientId: "oc_test123" }));
    });

    it("clears the fields and filters on reset", () => {
        const onApply = vi.fn();
        render(
            <AdminOAuthClientFiltersForm
                filters={{ clientId: "oc_test123", name: "Cabinet" }}
                onApply={onApply}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminOAuthClients.filters.reset") }),
        );

        expect(onApply).toHaveBeenCalledWith({});
        expect(
            screen.getByLabelText(testI18n.t("adminOAuthClients.filters.clientId")),
        ).toHaveProperty("value", "");
    });
});
