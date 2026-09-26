import { MerchantFilters } from "@/features/search/products/components/filters/MerchantFilters";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock public listing-source search.
vi.mock("@/client/@tanstack/react-query.gen.ts", () => ({
    searchPublicListingSourcesOptions: () => ({
        queryKey: ["searchPublicListingSources"],
        queryFn: vi.fn().mockResolvedValue({ items: [] }),
        enabled: false,
    }),
}));

// Create a new QueryClient for each test
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            listingSourceId: [],
            excludeListingSourceId: [],
            ...defaultValues,
        },
    });
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
    );
};

describe("MerchantFilters", () => {
    it("renders with card header", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        expect(screen.getByText("Angebotsquellen")).toBeInTheDocument();
    });

    it("renders MerchantIncludeFilter", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        expect(screen.getByText("Angebotsquelle einschließen")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Angebotsquellen suchen...")).toBeInTheDocument();
    });

    it("renders MerchantExcludeFilter", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        expect(screen.getByText("Angebotsquelle ausschließen")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Angebotsquellen suchen..."),
        ).toBeInTheDocument();
    });

    it("renders both merchant filters", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        expect(screen.getByText("Angebotsquelle einschließen")).toBeInTheDocument();
        expect(screen.getByText("Angebotsquelle ausschließen")).toBeInTheDocument();

        // Both search inputs should be present
        expect(screen.getByPlaceholderText("Angebotsquellen suchen...")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Angebotsquellen suchen..."),
        ).toBeInTheDocument();
    });
});
