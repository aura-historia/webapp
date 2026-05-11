import { ShopPartnerStatusFilter } from "@/components/search/filters/ShopPartnerStatusFilter";
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
            partnerStatus: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ShopPartnerStatusFilter", () => {
    it("renders heading and dropdown trigger", () => {
        render(
            <FormWrapper>
                <ShopPartnerStatusFilter />
            </FormWrapper>,
        );
        expect(screen.getByText("Partnerstatus")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("shows placeholder text when no statuses are selected", () => {
        render(
            <FormWrapper>
                <ShopPartnerStatusFilter />
            </FormWrapper>,
        );
        expect(screen.getByText("Auswählen")).toBeInTheDocument();
    });

    it("shows 'All' label when every status is selected", () => {
        render(
            <FormWrapper defaultValues={{ partnerStatus: ["PARTNERED", "SCRAPED"] }}>
                <ShopPartnerStatusFilter />
            </FormWrapper>,
        );
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("lists every partner status option when the dropdown is opened", async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <ShopPartnerStatusFilter />
            </FormWrapper>,
        );
        await user.click(screen.getByRole("combobox"));
        expect(screen.getByText("Offizieller Partner")).toBeInTheDocument();
        expect(screen.getByText("Öffentlich indexiert")).toBeInTheDocument();
    });
});
