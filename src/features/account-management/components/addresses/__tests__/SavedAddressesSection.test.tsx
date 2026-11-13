import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserAddress as UserAddressDto } from "@/client";
import testI18n from "@/i18n/i18nForTests";
import { SavedAddressesSection } from "../SavedAddressesSection.tsx";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
}));
vi.mock("@/client", () => ({
    listUserAddresses: api.list,
    createUserAddress: api.create,
    getUserAddress: api.get,
    updateUserAddress: api.update,
    deleteUserAddress: api.remove,
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children: ReactNode }) => <a href="/login">{children}</a>,
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "user-1", username: "user" }, isLoading: false }),
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);
const RELEASE = "iso-codes-4.20.1";
const dto = (patch: Partial<UserAddressDto> = {}): UserAddressDto => ({
    addressId: "uaddr_1",
    label: "Home",
    geography: {
        referenceRelease: RELEASE,
        addressText: "Torstraße 12\n10119 Berlin",
        country: "DE",
    },
    inputRevision: 1,
    version: 3,
    preferred: true,
    resolution: {
        status: "ACCEPTED",
        derived: { geography: { referenceRelease: RELEASE, country: "DE", subdivision: "DE-BE" } },
        attribution: {
            provider: "Amazon Location Service",
            attributionUrl: "https://example.com/attr",
        },
    },
    ...patch,
});
const ok = (data: unknown, status = 200) => ({ data, response: { status } });
const failure = (status?: number) => ({
    error: {},
    response: status === undefined ? undefined : { status },
});
const serve = (...items: UserAddressDto[]) => api.list.mockResolvedValue(ok({ items }));

function renderSection() {
    render(
        <QueryClientProvider client={new QueryClient()}>
            <SavedAddressesSection />
        </QueryClientProvider>,
    );
}

describe("SavedAddressesSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        serve(
            dto(),
            dto({
                addressId: "uaddr_2",
                label: "Storage unit",
                geography: { referenceRelease: RELEASE, addressText: "Unit 4, Mill Lane" },
                preferred: false,
                resolution: { status: "AMBIGUOUS" },
            }),
        );
    });

    it("shows entered text, the user's details and derived location separately", async () => {
        renderSection();
        const home = (await screen.findByRole("heading", { name: "Home" })).closest("li");
        if (!home) throw new Error("row missing");
        const row = within(home);

        expect(row.getByText(t("account.addresses.searchLocation"))).toBeInTheDocument();
        expect(row.getByText(/Torstraße 12/)).toBeInTheDocument();
        expect(row.getByText(t("account.addresses.yourDetails"))).toBeInTheDocument();
        expect(row.getByText(t("account.addresses.status.ACCEPTED.label"))).toBeInTheDocument();
        expect(row.getByText(/DE-BE/)).toBeInTheDocument();
        expect(row.getByRole("link", { name: "Amazon Location Service" })).toHaveAttribute(
            "href",
            "https://example.com/attr",
        );

        const storage = within(
            screen.getByRole("heading", { name: "Storage unit" }).closest("li") as HTMLElement,
        );
        expect(
            storage.getByText(t("account.addresses.status.AMBIGUOUS.label")),
        ).toBeInTheDocument();
        expect(storage.getByText(t("account.addresses.status.AMBIGUOUS.hint"))).toBeInTheDocument();
        // No provider values or attribution without an accepted resolution.
        expect(storage.queryByRole("link")).toBeNull();
        expect(storage.queryByText(t("account.addresses.yourDetails"))).toBeNull();
        expect(storage.queryByText(t("account.addresses.searchLocation"))).toBeNull();
    });

    it("shows the empty state", async () => {
        serve();
        renderSection();
        expect(await screen.findByText(/Adressen/, { selector: "em" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: t("account.addresses.add") })).toBeEnabled();
    });

    it("hides every address once access is lost", async () => {
        api.list.mockResolvedValue(failure(403));
        renderSection();
        expect(
            await screen.findByText(t("account.addresses.accessLost.description")),
        ).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Home" })).toBeNull();
        expect(screen.queryByRole("button", { name: t("account.addresses.add") })).toBeNull();
    });

    it("validates a new address and focuses the first invalid field", async () => {
        renderSection();
        await screen.findByRole("heading", { name: "Home" });
        fireEvent.click(screen.getByRole("button", { name: t("account.addresses.add") }));
        const dialog = await screen.findByRole("dialog");
        fireEvent.click(
            within(dialog).getByRole("button", { name: t("account.addresses.editor.save") }),
        );

        const name = within(dialog).getByLabelText(t("account.addresses.editor.fields.label"));
        await waitFor(() => expect(name).toHaveFocus());
        expect(name).toHaveAttribute("aria-invalid", "true");
        expect(
            within(dialog).getByText(t("account.addresses.validation.addressRequired")),
        ).toBeInTheDocument();
        expect(api.create).not.toHaveBeenCalled();
    });

    it("refreshes after a lost create and offers only a deliberate second save", async () => {
        api.create.mockResolvedValue(failure(undefined));
        renderSection();
        await screen.findByRole("heading", { name: "Home" });
        fireEvent.click(screen.getByRole("button", { name: t("account.addresses.add") }));
        const dialog = await screen.findByRole("dialog");
        fireEvent.change(
            within(dialog).getByLabelText(t("account.addresses.editor.fields.label")),
            {
                target: { value: "Gallery" },
            },
        );
        fireEvent.change(
            within(dialog).getByLabelText(t("account.addresses.editor.fields.address")),
            { target: { value: "Rue de Seine 12, Paris" } },
        );
        fireEvent.click(
            within(dialog).getByRole("button", { name: t("account.addresses.editor.save") }),
        );

        expect(
            await within(dialog).findByText(t("account.addresses.editor.uncertain.checkedTitle")),
        ).toBeInTheDocument();
        expect(api.create).toHaveBeenCalledTimes(1);
        expect(
            within(dialog).getByRole("button", { name: t("account.addresses.editor.saveAgain") }),
        ).toBeEnabled();
        // The draft is kept.
        expect(
            within(dialog).getByLabelText(t("account.addresses.editor.fields.label")),
        ).toHaveValue("Gallery");
    });

    it("keeps the draft after a conflict and saves again at the current version", async () => {
        api.update.mockResolvedValueOnce(failure(409));
        api.get.mockResolvedValue(ok(dto({ version: 5, label: "Home (phone)" })));
        api.update.mockResolvedValueOnce(ok(dto({ version: 6, label: "My home" })));
        renderSection();
        await screen.findByRole("heading", { name: "Home" });
        fireEvent.click(
            screen.getByRole("button", {
                name: t("account.addresses.editNamed", { label: "Home" }),
            }),
        );
        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByText(t("account.addresses.editor.preferredNote")),
        ).toBeInTheDocument();

        const name = within(dialog).getByLabelText(t("account.addresses.editor.fields.label"));
        fireEvent.change(name, { target: { value: "My home" } });
        fireEvent.click(
            within(dialog).getByRole("button", { name: t("account.addresses.editor.saveChanges") }),
        );

        expect(await within(dialog).findByText("Home (phone)")).toBeInTheDocument();
        expect(name).toHaveValue("My home");
        expect(api.update).toHaveBeenCalledTimes(1);

        fireEvent.click(
            within(dialog).getByRole("button", {
                name: t("account.addresses.editor.saveMyVersion"),
            }),
        );
        await waitFor(() => expect(api.update).toHaveBeenCalledTimes(2));
        expect(api.update).toHaveBeenLastCalledWith(
            expect.objectContaining({
                body: expect.objectContaining({ expectedVersion: 5, label: "My home" }),
            }),
        );
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("blocks editing an address with values this app cannot show", async () => {
        serve(
            dto({
                geography: {
                    referenceRelease: "iso-codes-99" as "iso-codes-4.20.1",
                    addressText: "Somewhere",
                },
            }),
        );
        renderSection();
        await screen.findByRole("heading", { name: "Home" });
        fireEvent.click(
            screen.getByRole("button", {
                name: t("account.addresses.editNamed", { label: "Home" }),
            }),
        );
        const dialog = await screen.findByRole("dialog");
        expect(
            within(dialog).getByText(t("account.addresses.editor.unsupported.title")),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", { name: t("account.addresses.editor.saveChanges") }),
        ).toBeDisabled();
    });

    it("deletes only after confirmation, naming the browsing location", async () => {
        api.remove.mockImplementation(async () => {
            serve();
            return { data: undefined, response: { status: 204 } };
        });
        renderSection();
        await screen.findByRole("heading", { name: "Home" });
        fireEvent.click(
            screen.getByRole("button", {
                name: t("account.addresses.deleteNamed", { label: "Home" }),
            }),
        );
        const dialog = await screen.findByRole("alertdialog");
        expect(
            within(dialog).getByText(t("account.addresses.delete.preferred")),
        ).toBeInTheDocument();
        expect(api.remove).not.toHaveBeenCalled();

        fireEvent.click(
            within(dialog).getByRole("button", { name: t("account.addresses.delete.confirm") }),
        );
        await waitFor(() =>
            expect(api.remove).toHaveBeenCalledWith(
                expect.objectContaining({ body: { expectedVersion: 3 } }),
            ),
        );
        await waitFor(() => expect(screen.queryByRole("heading", { name: "Home" })).toBeNull());
    });
});
