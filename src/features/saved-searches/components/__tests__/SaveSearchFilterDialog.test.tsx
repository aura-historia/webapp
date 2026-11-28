import type { CountryCode } from "@/data/internal/geography/GeographicCodes.ts";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SaveSearchFilterDialog } from "../SaveSearchFilterDialog.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";

const mockCreateMutate = vi.fn();

vi.mock("@/features/saved-searches/api/useCreateUserSearchFilter.ts", () => ({
    useCreateUserSearchFilter: () => ({ mutate: mockCreateMutate, isPending: false }),
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { subscriptionType: "ultimate" } }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockOrigin = vi.hoisted(() => ({ current: { status: "none" } as SearchOrigin }));
vi.mock("@/features/search/products/hooks/useSearchOrigin.ts", () => ({
    useSearchOrigin: () => mockOrigin.current,
}));

const NEAR_HOME: SearchFilterArguments = {
    q: "Tisch",
    location: {
        kind: "DISTANCE",
        near: { kind: "ADDRESS", addressId: "a1" },
        radius: { amount: 50, unit: "KILOMETERS" },
        distanceOrder: "ASC",
    },
};

async function openAndSave(searchArgs: SearchFilterArguments) {
    const user = userEvent.setup();
    await act(() =>
        renderWithRouter(
            <SaveSearchFilterDialog searchArgs={searchArgs}>
                <button type="button">Öffnen</button>
            </SaveSearchFilterDialog>,
        ),
    );
    await user.click(screen.getByRole("button", { name: "Öffnen" }));
    await user.type(screen.getByRole("textbox", { name: /Name/i }), "Mein Filter");
    await user.click(screen.getByRole("button", { name: "Speichern" }));
    return user;
}

describe("SaveSearchFilterDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockOrigin.current = { status: "none" };
    });

    describe("location", () => {
        it("saves the resolved point and distance, never the address or the order", async () => {
            mockOrigin.current = {
                status: "ready",
                point: { latitude: 51.34, longitude: 12.37 },
                label: "Zuhause",
                key: "address:a1:3",
            };
            await openAndSave(NEAR_HOME);

            const [data] = mockCreateMutate.mock.calls[0];
            expect(data.geography).toEqual({
                countries: [],
                subdivisions: [],
                origin: { latitude: 51.34, longitude: 12.37 },
                radius: { amount: 50, unit: "KILOMETERS" },
                mode: "APPROXIMATE",
            });
        });

        it("names the starting point and says the copy is private", async () => {
            mockOrigin.current = {
                status: "ready",
                point: { latitude: 51.34, longitude: 12.37 },
                label: "Zuhause",
                key: "address:a1:3",
            };
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <SaveSearchFilterDialog searchArgs={NEAR_HOME}>
                        <button type="button">Öffnen</button>
                    </SaveSearchFilterDialog>,
                ),
            );
            await user.click(screen.getByRole("button", { name: "Öffnen" }));

            expect(screen.getByText(/Zuhause/)).toBeInTheDocument();
            expect(screen.getByText(/private Kopie/)).toBeInTheDocument();
        });

        it("saves countries as they are", async () => {
            await openAndSave({
                q: "Tisch",
                location: {
                    kind: "REGION",
                    countries: ["DE", "AT"] as CountryCode[],
                    subdivisions: [],
                },
            });

            const [data] = mockCreateMutate.mock.calls[0];
            expect(data.geography).toEqual({
                countries: ["DE", "AT"] as CountryCode[],
                subdivisions: [],
            });
        });

        it("asks before saving without a starting point that cannot be used", async () => {
            mockOrigin.current = { status: "unavailable", problem: "currentNotKept" };
            const user = await openAndSave({
                ...NEAR_HOME,
                location: {
                    ...NEAR_HOME.location,
                    near: { kind: "CURRENT" },
                } as typeof NEAR_HOME.location,
            });

            expect(mockCreateMutate).not.toHaveBeenCalled();
            expect(screen.getByText(/Kein Ausgangspunkt/)).toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: "Ohne Standort speichern" }));
            const [data] = mockCreateMutate.mock.calls[0];
            expect(data).not.toHaveProperty("geography");
        });

        it("waits while the starting point loads", async () => {
            mockOrigin.current = { status: "loading" };
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <SaveSearchFilterDialog searchArgs={NEAR_HOME}>
                        <button type="button">Öffnen</button>
                    </SaveSearchFilterDialog>,
                ),
            );
            await user.click(screen.getByRole("button", { name: "Öffnen" }));

            expect(screen.getByRole("button", { name: /Wird vorbereitet/ })).toBeDisabled();
        });
    });

    it("opens dialog when trigger is clicked", async () => {
        const user = userEvent.setup();
        await act(() =>
            renderWithRouter(
                <SaveSearchFilterDialog searchArgs={{ q: "Tisch" }}>
                    <button type="button">Speichern</button>
                </SaveSearchFilterDialog>,
            ),
        );

        await user.click(screen.getByRole("button", { name: /Speichern/i }));
        expect(screen.getByRole("textbox", { name: /Name/i })).toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
        const user = userEvent.setup();
        await act(() =>
            renderWithRouter(
                <SaveSearchFilterDialog searchArgs={{ q: "Tisch" }}>
                    <button type="button">Speichern</button>
                </SaveSearchFilterDialog>,
            ),
        );

        await user.click(screen.getByRole("button", { name: /Speichern/i }));
        // Submit button inside dialog – translation key: searchFilter.saveDialog.saveButton = "Speichern"
        const submitButtons = screen.getAllByRole("button", { name: /Speichern/i });
        await user.click(submitButtons[submitButtons.length - 1]);

        expect(screen.getByRole("textbox", { name: /Name/i })).toBeInTheDocument();
        expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    it("calls createFilter with name and searchArgs on valid submit", async () => {
        const user = userEvent.setup();
        mockCreateMutate.mockImplementation((_data: unknown, opts: { onSuccess: () => void }) =>
            opts?.onSuccess?.(),
        );

        await act(() =>
            renderWithRouter(
                <SaveSearchFilterDialog searchArgs={{ q: "Tisch" }}>
                    <button type="button">Speichern</button>
                </SaveSearchFilterDialog>,
            ),
        );

        await user.click(screen.getByRole("button", { name: /Speichern/i }));
        await user.type(screen.getByRole("textbox", { name: /Name/i }), "Mein Filter");
        const submitButtons = screen.getAllByRole("button", { name: /Speichern/i });
        await user.click(submitButtons[submitButtons.length - 1]);

        expect(mockCreateMutate).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Mein Filter" }),
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });
});
