import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowsingDestination, UserAddress as UserAddressDto } from "@/client";
import testI18n from "@/i18n/i18nForTests";
import { SearchLocationSection } from "../SearchLocationSection.tsx";

const api = vi.hoisted(() => ({
    getDestination: vi.fn(),
    setDestination: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    suggest: vi.fn(),
}));
vi.mock("@/client", () => ({
    getBrowsingDestination: api.getDestination,
    setBrowsingDestination: api.setDestination,
    listUserAddresses: api.list,
    getUserAddress: api.get,
    createUserAddress: api.create,
    updateUserAddress: api.update,
    deleteUserAddress: api.remove,
    suggestAddresses: api.suggest,
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children: ReactNode }) => <a href="/login">{children}</a>,
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "user-1", username: "user" }, isLoading: false }),
}));

/** jsdom has no `matchMedia`: `true` for a desktop with a mouse, `false` for a phone. */
function stubMatchMedia(matches: (query: string) => boolean) {
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: matches(query),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }));
}

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);
const RELEASE = "iso-codes-4.20.1";
const address = (patch: Partial<UserAddressDto> = {}): UserAddressDto => ({
    addressId: "uaddr_1",
    label: "Home",
    geography: { referenceRelease: RELEASE, addressText: "Torstraße 12, 10119 Berlin" },
    inputRevision: 1,
    version: 1,
    preferred: false,
    resolution: { status: "ACCEPTED" },
    ...patch,
});
const STORAGE = address({
    addressId: "uaddr_2",
    label: "Storage unit",
    geography: { referenceRelease: RELEASE, addressText: "Unit 4, Mill Lane" },
    resolution: { status: "AMBIGUOUS" },
});
const ok = (data: unknown, status = 200) => ({ data, response: { status } });
const failure = (status?: number) => ({
    error: {},
    response: status === undefined ? undefined : { status },
});
const destination = (value: BrowsingDestination, version = 4) =>
    api.getDestination.mockResolvedValue(ok({ version, destination: value }));
const addresses = (...items: UserAddressDto[]) => api.list.mockResolvedValue(ok({ items }));

function renderSection() {
    const client = new QueryClient();
    render(
        <QueryClientProvider client={client}>
            <SearchLocationSection />
        </QueryClientProvider>,
    );
    return client;
}

const radio = (choice: string) =>
    screen.getByRole("radio", {
        name: new RegExp(t(`account.searchLocation.choices.${choice}.title`)),
    });
const status = () => screen.getByRole("status");
const current = () => screen.findByRole("status");
const save = () =>
    fireEvent.click(screen.getByRole("button", { name: t("account.searchLocation.save") }));

describe("SearchLocationSection", () => {
    afterEach(() => vi.unstubAllGlobals());

    beforeEach(() => {
        vi.clearAllMocks();
        // From 768px with a mouse: the pickers open as popovers.
        stubMatchMedia(() => true);
        addresses(address(), STORAGE);
        destination({ kind: "NONE" });
    });

    it("shows an untouched preference as no search location", async () => {
        renderSection();
        expect(await screen.findByText(t("account.searchLocation.currently"))).toBeInTheDocument();
        expect(
            within(status()).getByText(t("account.searchLocation.current.none")),
        ).toBeInTheDocument();
        expect(radio("NONE")).toBeChecked();
        expect(radio("ADDRESS")).not.toBeChecked();
        expect(screen.getByText(t("account.searchLocation.distinction"))).toBeInTheDocument();
    });

    it("shows the chosen saved address as entered", async () => {
        destination({ kind: "ADDRESS", addressId: "uaddr_1" });
        renderSection();
        expect(await within(await current()).findByText("Home")).toBeInTheDocument();
        expect(within(status()).getByText("Torstraße 12, 10119 Berlin")).toBeInTheDocument();
        expect(radio("ADDRESS")).toBeChecked();
    });

    it("shows a saved country with its postal code", async () => {
        destination({ kind: "COUNTRY_POSTAL", country: "DE", postalCode: "10119" });
        renderSection();
        expect(await within(await current()).findByText("Deutschland")).toBeInTheDocument();
        expect(
            within(status()).getByText(
                t("account.searchLocation.current.postalCode", { postalCode: "10119" }),
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: /Postleitzahl/ })).toHaveValue("10119");
    });

    it("sends a country and postal code exactly as entered with the read version", async () => {
        destination({ kind: "COUNTRY_POSTAL", country: "GB", postalCode: "SW1A 1AA" }, 7);
        api.setDestination.mockResolvedValue(
            ok({
                version: 8,
                destination: { kind: "COUNTRY_POSTAL", country: "GB", postalCode: " EC1A 1BB " },
            }),
        );
        renderSection();
        const postal = await screen.findByRole("textbox", { name: /Postleitzahl/ });
        fireEvent.change(postal, { target: { value: " EC1A 1BB " } });
        save();

        await waitFor(() => expect(api.setDestination).toHaveBeenCalledTimes(1));
        expect(api.setDestination.mock.calls[0][0].body).toEqual({
            expectedVersion: 7,
            destination: { kind: "COUNTRY_POSTAL", country: "GB", postalCode: " EC1A 1BB " },
        });
        await waitFor(() =>
            expect(toast.success).toHaveBeenCalledWith(t("account.searchLocation.toasts.saved")),
        );
    });

    it("clears the search location", async () => {
        destination({ kind: "ADDRESS", addressId: "uaddr_1" }, 2);
        api.setDestination.mockResolvedValue(ok({ version: 3, destination: { kind: "NONE" } }));
        renderSection();
        await within(await current()).findByText("Home");
        fireEvent.click(radio("NONE"));
        save();

        await waitFor(() =>
            expect(api.setDestination.mock.calls[0][0].body).toEqual({
                expectedVersion: 2,
                destination: { kind: "NONE" },
            }),
        );
        await waitFor(() =>
            expect(toast.success).toHaveBeenCalledWith(t("account.searchLocation.toasts.cleared")),
        );
        expect(
            within(status()).getByText(t("account.searchLocation.current.none")),
        ).toBeInTheDocument();
        // A cleared preference after a save here is not a deleted address.
        expect(screen.queryByText(t("account.searchLocation.notice.cleared"))).toBeNull();
    });

    it("requires a saved address or a country before saving", async () => {
        renderSection();
        await screen.findByText(t("account.searchLocation.currently"));
        fireEvent.click(radio("ADDRESS"));
        save();
        expect(
            await screen.findByText(t("account.searchLocation.validation.addressRequired")),
        ).toBeInTheDocument();

        fireEvent.click(radio("COUNTRY_POSTAL"));
        save();
        expect(
            await screen.findByText(t("account.searchLocation.validation.countryRequired")),
        ).toBeInTheDocument();
        expect(api.setDestination).not.toHaveBeenCalled();
    });

    it("rejects a postal code over 64 bytes", async () => {
        destination({ kind: "COUNTRY_POSTAL", country: "DE" });
        renderSection();
        fireEvent.change(await screen.findByRole("textbox", { name: /Postleitzahl/ }), {
            target: { value: "1".repeat(65) },
        });
        save();
        expect(
            await screen.findByText(t("account.searchLocation.validation.postalCodeInvalid")),
        ).toBeInTheDocument();
        expect(api.setDestination).not.toHaveBeenCalled();
    });

    it("picks one of the user's own saved addresses and marks unlocated ones", async () => {
        api.setDestination.mockResolvedValue(
            ok({ version: 5, destination: { kind: "ADDRESS", addressId: "uaddr_2" } }),
        );
        renderSection();
        await screen.findByText(t("account.searchLocation.currently"));
        fireEvent.click(radio("ADDRESS"));
        const trigger = await screen.findByRole("button", {
            name: new RegExp(t("account.searchLocation.address.label")),
        });
        fireEvent.click(trigger);
        const option = await screen.findByRole("option", { name: /Storage unit/ });
        expect(
            within(option).getByText(t("account.searchLocation.address.notLocated")),
        ).toBeInTheDocument();
        fireEvent.click(option);
        expect(
            await screen.findByText(t("account.searchLocation.address.notLocatedHint")),
        ).toBeInTheDocument();
        save();

        await waitFor(() =>
            expect(api.setDestination.mock.calls[0][0].body).toEqual({
                expectedVersion: 4,
                destination: { kind: "ADDRESS", addressId: "uaddr_2" },
            }),
        );
    });

    describe("on phones", () => {
        beforeEach(() => {
            // Below 768px: the bottom sheet.
            stubMatchMedia(() => false);
        });
        it("opens the address picker as a bottom sheet", async () => {
            renderSection();
            await screen.findByText(t("account.searchLocation.currently"));
            fireEvent.click(radio("ADDRESS"));
            const trigger = await screen.findByRole("button", {
                name: new RegExp(t("account.searchLocation.address.label")),
            });
            fireEvent.click(trigger);

            const sheet = await screen.findByRole("dialog");
            expect(
                within(sheet).getByRole("heading", {
                    name: t("account.searchLocation.address.label"),
                }),
            ).toBeInTheDocument();
            fireEvent.click(within(sheet).getByRole("option", { name: /Home/ }));
            // vaul keeps the sheet mounted while it animates out.
            await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
            expect(trigger).toHaveTextContent("Home");
        });
    });

    it("offers to add an address when there are none", async () => {
        addresses();
        renderSection();
        await screen.findByText(t("account.searchLocation.currently"));
        fireEvent.click(radio("ADDRESS"));
        expect(
            await screen.findByText(t("account.searchLocation.address.empty")),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: t("account.searchLocation.address.add") }),
        ).toBeInTheDocument();
    });

    it("offers a retry when the saved addresses cannot be loaded", async () => {
        api.list.mockResolvedValue(failure(503));
        renderSection();
        await screen.findByText(t("account.searchLocation.currently"));
        fireEvent.click(radio("ADDRESS"));
        expect(
            await screen.findByText(t("account.searchLocation.address.loadError")),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(t("account.searchLocation.choices.ADDRESS.descriptionEmpty")),
        ).toBeNull();
        addresses(address());
        fireEvent.click(screen.getByRole("button", { name: t("account.searchLocation.retry") }));
        expect(
            await screen.findByRole("button", {
                name: new RegExp(t("account.searchLocation.address.label")),
            }),
        ).toBeInTheDocument();
    });

    it("refetches after a conflict, keeps the choice and saves it again deliberately", async () => {
        destination({ kind: "COUNTRY_POSTAL", country: "DE", postalCode: "10119" }, 4);
        api.setDestination.mockResolvedValueOnce(failure(409));
        renderSection();
        const postal = await screen.findByRole("textbox", { name: /Postleitzahl/ });
        fireEvent.change(postal, { target: { value: "20095" } });
        destination({ kind: "ADDRESS", addressId: "uaddr_1" }, 6);
        save();

        expect(
            await screen.findByText(t("account.searchLocation.conflict.title")),
        ).toBeInTheDocument();
        expect(await within(await current()).findByText("Home")).toBeInTheDocument();
        expect(radio("COUNTRY_POSTAL")).toBeChecked();
        expect(screen.getByRole("textbox", { name: /Postleitzahl/ })).toHaveValue("20095");
        expect(api.setDestination).toHaveBeenCalledTimes(1);

        api.setDestination.mockResolvedValueOnce(
            ok({
                version: 7,
                destination: { kind: "COUNTRY_POSTAL", country: "DE", postalCode: "20095" },
            }),
        );
        fireEvent.click(
            screen.getByRole("button", { name: t("account.searchLocation.saveAgain") }),
        );
        await waitFor(() => expect(api.setDestination).toHaveBeenCalledTimes(2));
        expect(api.setDestination.mock.calls[1][0].body.expectedVersion).toBe(6);
    });

    it("says when the chosen address was deleted before saving", async () => {
        destination({ kind: "ADDRESS", addressId: "uaddr_1" });
        api.setDestination.mockResolvedValue(failure(404));
        renderSection();
        await within(await current()).findByText("Home");
        fireEvent.click(radio("COUNTRY_POSTAL"));
        fireEvent.click(radio("ADDRESS"));
        addresses(STORAGE);
        save();
        expect(
            await screen.findByText(t("account.searchLocation.validation.addressGone")),
        ).toBeInTheDocument();
    });

    it("keeps the choice when saving fails", async () => {
        api.setDestination.mockResolvedValue(failure(503));
        renderSection();
        await screen.findByText(t("account.searchLocation.currently"));
        save();
        expect(
            await screen.findByText(t("account.searchLocation.saveError.title")),
        ).toBeInTheDocument();
        expect(radio("NONE")).toBeChecked();
    });

    it("shows a cleared preference after the chosen address is deleted", async () => {
        destination({ kind: "ADDRESS", addressId: "uaddr_1" }, 2);
        const client = renderSection();
        await within(await current()).findByText("Home");

        destination({ kind: "NONE" }, 3);
        addresses(STORAGE);
        await client.invalidateQueries();

        expect(
            await screen.findByText(t("account.searchLocation.notice.cleared")),
        ).toBeInTheDocument();
        expect(
            within(status()).getByText(t("account.searchLocation.current.none")),
        ).toBeInTheDocument();
        expect(radio("NONE")).toBeChecked();
    });

    it("looks up a chosen address beyond the loaded page and reports it unavailable when gone", async () => {
        destination({ kind: "ADDRESS", addressId: "uaddr_9" });
        api.get.mockResolvedValue(failure(404));
        renderSection();
        expect(
            await within(await current()).findByText(
                t("account.searchLocation.current.unavailable"),
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("account.searchLocation.notice.unavailable")),
        ).toBeInTheDocument();
        expect(api.get.mock.calls[0][0].path).toEqual({ address_id: "uaddr_9" });
    });

    it("shows an unsupported value without choosing anything", async () => {
        destination({ kind: "SOMETHING_NEW" } as unknown as BrowsingDestination);
        renderSection();
        expect(
            await within(await current()).findByText(
                t("account.searchLocation.current.unsupported"),
            ),
        ).toBeInTheDocument();
        for (const choice of ["NONE", "ADDRESS", "COUNTRY_POSTAL"]) {
            expect(radio(choice)).not.toBeChecked();
        }
        save();
        expect(api.setDestination).not.toHaveBeenCalled();
    });

    it("offers a retry when the search location cannot be loaded", async () => {
        api.getDestination.mockResolvedValue(failure(503));
        renderSection();
        const retry = await screen.findByRole("button", {
            name: t("account.searchLocation.retry"),
        });
        destination({ kind: "NONE" });
        fireEvent.click(retry);
        expect(await screen.findByText(t("account.searchLocation.currently"))).toBeInTheDocument();
    });

    it("asks to sign in again when access ended", async () => {
        api.getDestination.mockResolvedValue(failure(403));
        renderSection();
        expect(
            await screen.findByText(t("account.searchLocation.accessLost.action")),
        ).toBeInTheDocument();
    });
});
