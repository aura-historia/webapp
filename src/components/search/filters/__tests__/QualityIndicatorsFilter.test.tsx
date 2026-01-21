import { QualityIndicatorsFilter } from "@/components/search/filters/QualityIndicatorsFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
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
            originYearSpan: { min: undefined, max: undefined },
            authenticity: [],
            condition: [],
            provenance: [],
            restoration: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("QualityIndicatorsFilter", () => {
    it("renders with card header", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Qualitätsmerkmale")).toBeInTheDocument();
    });

    it("renders OriginYearFilter", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Entstehungsjahr")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();
    });

    it("renders AuthenticityFilter", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Authentizität")).toBeInTheDocument();
    });

    it("renders ConditionFilter", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Zustand")).toBeInTheDocument();
    });

    it("renders ProvenanceFilter", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Herkunftsnachweis")).toBeInTheDocument();
    });

    it("renders RestorationFilter", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Restaurierung")).toBeInTheDocument();
    });

    it("renders all five quality indicator filters", () => {
        render(
            <FormWrapper>
                <QualityIndicatorsFilter />
            </FormWrapper>,
        );

        // All five filters should be present
        expect(screen.getByText("Entstehungsjahr")).toBeInTheDocument();
        expect(screen.getByText("Authentizität")).toBeInTheDocument();
        expect(screen.getByText("Zustand")).toBeInTheDocument();
        expect(screen.getByText("Herkunftsnachweis")).toBeInTheDocument();
        expect(screen.getByText("Restaurierung")).toBeInTheDocument();

        // All four multi-select dropdowns should be present
        const comboboxes = screen.getAllByRole("combobox");
        expect(comboboxes).toHaveLength(4);
    });
});
