import { MerchantSourceFilter } from "@/features/search/products/components/filters/MerchantSourceFilter.tsx";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { render, screen, within } from "@testing-library/react";
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
        queryFn: vi.fn().mockResolvedValue({
            items: [
                {
                    listingSourceId: "ls_1",
                    listingSourceSlugId: "source-one",
                    name: "Source One",
                    operator: { name: "Operator One" },
                },
            ],
        }),
        enabled: false,
    }),
}));

function SelectedIds() {
    const { control } = useFormContext();
    const ids = useWatch({ control, name: "excludeListingSourceId" }) as string[] | undefined;
    return <output data-testid="selected-source-ids">{ids?.join(",")}</output>;
}

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
            excludeListingSourceId: [],
            ...defaultValues,
        },
    });
    return (
        <QueryClientProvider client={queryClient}>
            <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
    );
};

describe("MerchantSourceFilter (exclude)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with correct heading and placeholder", () => {
        render(
            <FormWrapper>
                <MerchantSourceFilter mode="exclude" />
            </FormWrapper>,
        );

        expect(screen.getByText("Anbieter ausschließen")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Auszuschließende Anbieter suchen")).toBeInTheDocument();
    });

    it("allows entering search text in the input", async () => {
        render(
            <FormWrapper>
                <MerchantSourceFilter mode="exclude" />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Auszuschließende Anbieter suchen");

        await user.type(input, "Test");

        expect(input).toHaveValue("Test");
    });

    it("shows the retained label for a selected excluded source ID", () => {
        render(
            <FormWrapper
                defaultValues={{
                    excludeListingSourceId: ["ls_existing"],
                    excludeListingSourceLabels: ["Existing Source"],
                }}
            >
                <MerchantSourceFilter mode="exclude" />
            </FormWrapper>,
        );

        expect(screen.getByText("Existing Source")).toBeInTheDocument();
        expect(screen.queryByText("ls_existing")).not.toBeInTheDocument();
    });

    it("keeps the public name visible while storing the excluded source ID", async () => {
        render(
            <FormWrapper>
                <MerchantSourceFilter mode="exclude" />
                <SelectedIds />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Auszuschließende Anbieter suchen");
        await user.type(input, "Source");
        const option = await screen.findByText("Source One");
        await user.click(option);

        expect(
            within(screen.getByRole("list", { name: "Ausgeschlossene Anbieter" })).getByText(
                "Source One",
            ),
        ).toBeInTheDocument();
        expect(screen.getByTestId("selected-source-ids")).toHaveTextContent("ls_1");
    });

    it("handles special characters in search input", async () => {
        render(
            <FormWrapper>
                <MerchantSourceFilter mode="exclude" />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Auszuschließende Anbieter suchen");

        await user.type(input, "Special & Chars");

        expect(input).toHaveValue("Special & Chars");
    });

    it("clears search input correctly", async () => {
        render(
            <FormWrapper>
                <MerchantSourceFilter mode="exclude" />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Auszuschließende Anbieter suchen");

        await user.type(input, "Initial Value");
        await user.clear(input);

        expect(input).toHaveValue("");
    });

    it("displays multiple selected merchants as badges", () => {
        render(
            <FormWrapper defaultValues={{ excludeListingSourceId: ["ls_1", "ls_2"] }}>
                <MerchantSourceFilter mode="exclude" />
            </FormWrapper>,
        );

        expect(screen.getByText("ls_1")).toBeInTheDocument();
        expect(screen.getByText("ls_2")).toBeInTheDocument();
    });
});
