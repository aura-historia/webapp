import { ShopSearchShopTypeFilter } from "@/components/search/filters/ShopSearchShopTypeFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type React from "react";

const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            shopType: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ShopSearchShopTypeFilter", () => {
    it("renders heading and dropdown trigger", () => {
        render(
            <FormWrapper>
                <ShopSearchShopTypeFilter />
            </FormWrapper>,
        );
        expect(screen.getByText("Shop-Typ")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("lists every shop type option", async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <ShopSearchShopTypeFilter />
            </FormWrapper>,
        );
        await user.click(screen.getByRole("combobox"));
        expect(screen.getByText("Auktionshaus")).toBeInTheDocument();
        expect(screen.getByText("Auktionsplattform")).toBeInTheDocument();
        expect(screen.getByText("Händler")).toBeInTheDocument();
        expect(screen.getByText("Marktplatz")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
    });
});
