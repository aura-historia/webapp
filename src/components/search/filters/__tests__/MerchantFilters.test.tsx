import { MerchantFilters } from "@/components/search/filters/MerchantFilters";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the searchShops API
vi.mock("@/client/@tanstack/react-query.gen.ts", () => ({
    searchShopsMutation: () => ({
        mutationFn: vi.fn(),
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
            merchant: [],
            excludeMerchant: [],
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

        // "Händler" appears twice: once in card header, once as include filter label
        const merchantTexts = screen.getAllByText("Händler");
        expect(merchantTexts).toHaveLength(2);
    });

    it("renders MerchantIncludeFilter", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        // "Händler" appears twice: card header and filter label
        const merchantTexts = screen.getAllByText("Händler");
        expect(merchantTexts).toHaveLength(2);
        expect(screen.getByPlaceholderText("Händler suchen...")).toBeInTheDocument();
    });

    it("renders MerchantExcludeFilter", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        expect(screen.getByText("Händler ausschließen")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Händler suchen..."),
        ).toBeInTheDocument();
    });

    it("renders both merchant filters", () => {
        render(
            <FormWrapper>
                <MerchantFilters />
            </FormWrapper>,
        );

        // Both filter labels should be present
        // "Händler" appears twice: card header and include filter label
        const merchantTexts = screen.getAllByText("Händler");
        expect(merchantTexts).toHaveLength(2);
        expect(screen.getByText("Händler ausschließen")).toBeInTheDocument();

        // Both search inputs should be present
        expect(screen.getByPlaceholderText("Händler suchen...")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Händler suchen..."),
        ).toBeInTheDocument();
    });
});
