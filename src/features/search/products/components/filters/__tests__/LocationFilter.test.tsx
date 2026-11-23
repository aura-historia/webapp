import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import { SearchQueryProvider } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { LocationFilter } from "@/features/search/products/components/filters/LocationFilter.tsx";
import type { SearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";
import { clearCurrentLocation } from "@/features/search/products/lib/currentLocation.ts";
import {
    validateSearchParams,
    validateSearchUrlParams,
} from "@/features/search/products/lib/searchValidation.ts";
import { stubMatchMedia } from "@/test/utils.tsx";

const mocks = vi.hoisted(() => ({
    user: undefined as { userId: string } | undefined,
    addresses: [] as unknown[],
}));

vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: mocks.user, isLoading: false }),
}));
vi.mock("@/features/account-management/hooks/useUserAddresses.ts", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useUserAddressList: () => ({
        data: { pages: [{ items: mocks.addresses }] },
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
    }),
}));

function address(overrides: Partial<UserAddress>): UserAddress {
    return {
        addressId: "uaddr_home",
        label: "Zuhause",
        geography: { addressText: "Marienplatz 1, München" } as UserAddress["geography"],
        inputRevision: 1,
        version: 1,
        preferred: false,
        resolution: {
            status: "ACCEPTED",
            derivedPosition: {
                point: { latitude: 48.137, longitude: 11.575 },
                precision: "PREMISES",
            },
        },
        ...overrides,
    };
}

const READY: SearchOrigin = {
    status: "ready",
    point: { latitude: 48.137, longitude: 11.575 },
    label: "Zuhause",
    key: "address:uaddr_home:1",
};

async function renderFilter(entry: string, origin: SearchOrigin = { status: "none" }) {
    const root = createRootRoute({ component: Outlet });
    const search = createRoute({
        getParentRoute: () => root,
        path: "/$lng/search",
        validateSearch: validateSearchUrlParams,
        component: function SearchRoute() {
            return (
                <LocationFilter
                    searchArgs={validateSearchParams(search.useSearch())}
                    origin={origin}
                    variant="sidebar"
                />
            );
        },
    });
    const login = createRoute({ getParentRoute: () => root, path: "/$lng/login" });
    const account = createRoute({ getParentRoute: () => root, path: "/$lng/me/account" });
    const router = createRouter({
        routeTree: root.addChildren([search, login, account]),
        history: createMemoryHistory({ initialEntries: [entry] }),
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
        render(
            <SearchQueryProvider>
                <UserPreferencesProvider locale="de-DE">
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </UserPreferencesProvider>
            </SearchQueryProvider>,
        );
        await router.load();
    });
    return router;
}

function stubGeolocation(
    respond: (success: PositionCallback, failure: PositionErrorCallback) => void,
) {
    vi.stubGlobal("isSecureContext", true);
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition: respond } });
}

function positionError(code: number): GeolocationPositionError {
    return { code, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as never;
}

const DISTANCE = "/de/search?q=commode&near=address:uaddr_home&radius=50&unit=KILOMETERS";

describe("LocationFilter", () => {
    beforeEach(() => {
        mocks.user = undefined;
        mocks.addresses = [];
        stubMatchMedia(() => true);
        clearCurrentLocation();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe("by region", () => {
        it("picks a region with the keyboard and removes it again", async () => {
            const user = userEvent.setup();
            const router = await renderFilter("/de/search?q=commode");
            await user.click(screen.getByRole("radio", { name: "Nach Region" }));
            const input = screen.getByRole("combobox", { name: "Länder und Regionen" });

            await user.type(input, "bayern");
            await screen.findByRole("option", { name: /^Bayern/ });
            await user.keyboard("{ArrowDown}{ArrowUp}{Enter}");

            await waitFor(() =>
                expect(router.state.location.search).toMatchObject({ regions: ["DE-BY"] }),
            );
            await user.click(await screen.findByRole("button", { name: "Bayern entfernen" }));
            await waitFor(() => expect(router.state.location.search).not.toHaveProperty("regions"));
        });

        it("says when no place matches and clears the search with Escape", async () => {
            const user = userEvent.setup();
            await renderFilter("/de/search?q=commode&countries=AT");
            const input = screen.getByRole("combobox", { name: "Länder und Regionen" });

            await user.type(input, "zzzz");
            expect(await screen.findByText("Kein Land und keine Region gefunden")).toBeVisible();
            await user.keyboard("{Escape}");
            expect(input).toHaveValue("");
        });

        it("picks a suggestion with Enter when it has focus", async () => {
            const user = userEvent.setup();
            const router = await renderFilter("/de/search?q=commode&countries=AT");
            await user.type(
                screen.getByRole("combobox", { name: "Länder und Regionen" }),
                "schweiz",
            );
            const option = await screen.findByRole("option", { name: /^Schweiz/ });
            fireEvent.keyDown(option, { key: "Enter" });
            await waitFor(() =>
                expect(router.state.location.search).toMatchObject({ countries: ["AT", "CH"] }),
            );
        });

        it("switches mode with the arrow keys", async () => {
            const user = userEvent.setup();
            await renderFilter("/de/search?q=commode");
            screen.getByRole("radio", { name: "Nach Entfernung" }).focus();
            await user.keyboard("{ArrowLeft}");
            expect(screen.getByRole("radio", { name: "Nach Region" })).toHaveAttribute(
                "aria-checked",
                "true",
            );
        });
    });

    describe("by distance", () => {
        it("validates and applies the distance and unit", async () => {
            const user = userEvent.setup();
            const router = await renderFilter(DISTANCE, READY);
            const radius = screen.getByLabelText("Im Umkreis von");

            await user.clear(radius);
            fireEvent.blur(radius);
            expect(await screen.findByText("Geben Sie eine Entfernung ein.")).toBeVisible();
            await user.type(radius, "abc{Enter}");
            expect(await screen.findByText("Geben Sie eine Zahl ein, etwa 50.")).toBeVisible();
            await user.clear(radius);
            await user.type(radius, "0{Enter}");
            expect(await screen.findByText("Geben Sie eine Entfernung über 0 ein.")).toBeVisible();
            await user.clear(radius);
            await user.type(radius, "99999{Enter}");
            expect(await screen.findByText("Höchstens 20.000 km.")).toBeVisible();
            await user.clear(radius);
            await user.type(radius, "120{Enter}");
            await waitFor(() => expect(router.state.location.search.radius).toBe(120));

            await user.selectOptions(screen.getByLabelText("Entfernungseinheit"), "MILES");
            await waitFor(() => expect(router.state.location.search.unit).toBe("MILES"));
        });

        it("counts exact addresses only on request", async () => {
            const user = userEvent.setup();
            const router = await renderFilter(DISTANCE, READY);
            await user.click(screen.getByRole("radio", { name: /Nur genaue Adressen/ }));
            await waitFor(() => expect(router.state.location.search.proximity).toBe("STRICT"));
        });

        it("lists saved addresses as starting points, unlocated ones disabled", async () => {
            const user = userEvent.setup();
            mocks.user = { userId: "user-1" };
            mocks.addresses = [
                address({ addressId: "uaddr_office", label: "Büro" }),
                address({ addressId: "uaddr_home", label: "Zuhause", preferred: true }),
                address({
                    addressId: "uaddr_cabin",
                    label: "Hütte",
                    resolution: { status: "NO_MATCH" } as UserAddress["resolution"],
                }),
            ];
            const router = await renderFilter("/de/search?q=commode");

            await user.click(screen.getByRole("button", { name: /In der Nähe von: Überall/ }));
            const listbox = await screen.findByRole("listbox", { name: "In der Nähe von" });
            const options = within(listbox).getAllByRole("option");
            expect(options.map((option) => option.textContent)).toEqual([
                expect.stringContaining("Überall"),
                expect.stringContaining("Zuhause"),
                expect.stringContaining("Büro"),
                expect.stringContaining("Hütte"),
            ]);
            expect(screen.getByRole("option", { name: /Hütte/ })).toHaveAttribute(
                "aria-disabled",
                "true",
            );

            await user.click(screen.getByRole("option", { name: /Büro/ }));
            await waitFor(() =>
                expect(router.state.location.search.near).toBe("address:uaddr_office"),
            );
        });

        it("uses the current location the user asked for", async () => {
            const user = userEvent.setup();
            stubGeolocation((success) =>
                success({ coords: { latitude: 51.34, longitude: 12.37 } } as GeolocationPosition),
            );
            const router = await renderFilter("/de/search?q=commode");

            await user.click(screen.getByRole("button", { name: /In der Nähe von: Überall/ }));
            await user.click(
                await screen.findByRole("button", { name: "Meinen aktuellen Standort verwenden" }),
            );
            await waitFor(() => expect(router.state.location.search.near).toBe("current"));
        });

        it("does not offer to retry a denied location", async () => {
            const user = userEvent.setup();
            stubGeolocation((_success, failure) => failure(positionError(1)));
            await renderFilter("/de/search?q=commode");

            await user.click(screen.getByRole("button", { name: /In der Nähe von: Überall/ }));
            await user.click(
                await screen.findByRole("button", { name: "Meinen aktuellen Standort verwenden" }),
            );
            expect(await screen.findByRole("alert")).toHaveTextContent(/gesperrt/);
            expect(screen.queryByRole("button", { name: "Erneut versuchen" })).toBeNull();
        });

        it("offers to retry when the location was unavailable", async () => {
            const user = userEvent.setup();
            stubGeolocation((_success, failure) => failure(positionError(2)));
            await renderFilter("/de/search?q=commode");

            await user.click(screen.getByRole("button", { name: /In der Nähe von: Überall/ }));
            await user.click(
                await screen.findByRole("button", { name: "Meinen aktuellen Standort verwenden" }),
            );
            await user.click(await screen.findByRole("button", { name: "Erneut versuchen" }));
            expect(await screen.findByRole("alert")).toHaveTextContent(/nicht ermitteln/);
        });

        it("offers the current location again after a reload", async () => {
            stubGeolocation((success) =>
                success({ coords: { latitude: 51.34, longitude: 12.37 } } as GeolocationPosition),
            );
            const user = userEvent.setup();
            const router = await renderFilter(
                "/de/search?q=commode&near=current&radius=25&unit=KILOMETERS",
                { status: "unavailable", problem: "currentNotKept" },
            );

            await user.click(
                await screen.findByRole("button", { name: "Standort erneut verwenden" }),
            );
            await waitFor(() => expect(router.state.location.search.near).toBe("current"));
        });

        it.each([
            ["signedOut", "Anmelden"],
            ["addressNotLocated", "Adresse bearbeiten"],
        ] as const)("links to the fix for %s", async (problem, action) => {
            await renderFilter(DISTANCE, {
                status: "unavailable",
                problem,
                label: "Zuhause",
            });
            expect(await screen.findByRole("link", { name: action })).toBeVisible();
        });

        it("shows a failed address load as an error without an action", async () => {
            await renderFilter(DISTANCE, { status: "unavailable", problem: "loadFailed" });
            expect(await screen.findByRole("alert")).toHaveTextContent(
                "Die gespeicherte Adresse konnte nicht geladen werden.",
            );
        });
    });
});
