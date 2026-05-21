import { SellerFilters } from "@/components/search/filters/SellerFilters";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/client/@tanstack/react-query.gen.ts", () => ({
    simpleSearchShopsOptions: () => ({
        queryKey: ["simpleSearchShops"],
        queryFn: vi.fn().mockResolvedValue({ items: [] }),
        enabled: false,
    }),
}));

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
            seller: [],
            excludeSeller: [],
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

describe("SellerFilters", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with card header", () => {
        render(
            <FormWrapper>
                <SellerFilters />
            </FormWrapper>,
        );

        // "Verkäufer" appears twice: once in card header, once as include filter label
        const sellerTexts = screen.getAllByText("Verkäufer");
        expect(sellerTexts).toHaveLength(2);
    });

    it("renders SellerIncludeFilter", () => {
        render(
            <FormWrapper>
                <SellerFilters />
            </FormWrapper>,
        );

        expect(screen.getByPlaceholderText("Verkäufer suchen...")).toBeInTheDocument();
    });

    it("renders SellerExcludeFilter", () => {
        render(
            <FormWrapper>
                <SellerFilters />
            </FormWrapper>,
        );

        expect(screen.getByText("Verkäufer ausschließen")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Verkäufer suchen..."),
        ).toBeInTheDocument();
    });

    it("renders both seller filters", () => {
        render(
            <FormWrapper>
                <SellerFilters />
            </FormWrapper>,
        );

        const sellerTexts = screen.getAllByText("Verkäufer");
        expect(sellerTexts).toHaveLength(2);
        expect(screen.getByText("Verkäufer ausschließen")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Verkäufer suchen...")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Verkäufer suchen..."),
        ).toBeInTheDocument();
    });
});
