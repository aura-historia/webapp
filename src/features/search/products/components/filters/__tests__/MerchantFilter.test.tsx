import { MerchantIncludeFilter } from "@/features/search/products/components/filters/MerchantIncludeFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/features/search/products/hooks/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

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

// Wrapper component to provide form context and QueryClient for tests
const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const queryClient = createTestQueryClient();
    const methods = useForm({
        defaultValues: {
            listingSourceId: [],
            ...defaultValues,
        },
    });
    return (
        <QueryClientProvider client={queryClient}>
            <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
    );
};

describe("MerchantIncludeFilter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with correct heading and placeholder", () => {
        render(
            <FormWrapper>
                <MerchantIncludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Angebotsquelle einschließen")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Angebotsquellen suchen...")).toBeInTheDocument();
    });

    it("allows entering search text in the input", async () => {
        render(
            <FormWrapper>
                <MerchantIncludeFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Angebotsquellen suchen...");

        await user.type(input, "Test");

        expect(input).toHaveValue("Test");
    });

    it("shows pre-populated merchant values as badges when provided", () => {
        render(
            <FormWrapper defaultValues={{ listingSourceId: ["ls_existing"] }}>
                <MerchantIncludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("ls_existing")).toBeInTheDocument();
    });

    it("handles special characters in search input", async () => {
        render(
            <FormWrapper>
                <MerchantIncludeFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Angebotsquellen suchen...");

        await user.type(input, "Special & Chars");

        expect(input).toHaveValue("Special & Chars");
    });

    it("clears search input correctly", async () => {
        render(
            <FormWrapper>
                <MerchantIncludeFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Angebotsquellen suchen...");

        await user.type(input, "Initial Value");
        await user.clear(input);

        expect(input).toHaveValue("");
    });

    it("displays multiple selected merchants as badges", () => {
        render(
            <FormWrapper defaultValues={{ listingSourceId: ["ls_1", "ls_2"] }}>
                <MerchantIncludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("ls_1")).toBeInTheDocument();
        expect(screen.getByText("ls_2")).toBeInTheDocument();
    });
});
