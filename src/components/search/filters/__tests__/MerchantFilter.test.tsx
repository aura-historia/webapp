import { MerchantFilter } from "@/components/search/filters/MerchantFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/search/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

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
            merchant: [],
            ...defaultValues,
        },
    });
    return (
        <QueryClientProvider client={queryClient}>
            <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
    );
};

describe("MerchantFilter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with correct heading and placeholder", () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Händler")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Händler suchen...")).toBeInTheDocument();
    });

    it("allows entering search text in the input", async () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Händler suchen...");

        await user.type(input, "Test");

        expect(input).toHaveValue("Test");
    });

    it("shows pre-populated merchant values as badges when provided", () => {
        render(
            <FormWrapper defaultValues={{ merchant: ["Existing Merchant"] }}>
                <MerchantFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Existing Merchant")).toBeInTheDocument();
    });

    it("handles special characters in search input", async () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Händler suchen...");

        await user.type(input, "Special & Chars");

        expect(input).toHaveValue("Special & Chars");
    });

    it("clears search input correctly", async () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Händler suchen...");

        await user.type(input, "Initial Value");
        await user.clear(input);

        expect(input).toHaveValue("");
    });

    it("displays multiple selected merchants as badges", () => {
        render(
            <FormWrapper defaultValues={{ merchant: ["Merchant One", "Merchant Two"] }}>
                <MerchantFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Merchant One")).toBeInTheDocument();
        expect(screen.getByText("Merchant Two")).toBeInTheDocument();
    });
});
