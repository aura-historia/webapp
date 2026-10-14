import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartyLocationData, SourceLocationDefaultData } from "@/client";
import type { AdminListingSourceDetail } from "@/data/internal/listing-source/AdminListingSource.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminSourceLocationDefaultSection } from "../AdminSourceLocationDefaultSection.tsx";

const api = vi.hoisted(() => ({
    get: vi.fn(),
    assign: vi.fn(),
    change: vi.fn(),
    clear: vi.fn(),
    listLocations: vi.fn(),
}));
vi.mock("@/client", () => ({
    adminGetSourceLocationDefault: api.get,
    adminAssignSourceLocationDefault: api.assign,
    adminChangeSourceLocationDefaultApplicability: api.change,
    adminClearSourceLocationDefault: api.clear,
    listPartyLocations: api.listLocations,
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "user-1" } }),
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children: ReactNode }) => (
        <a href="/de/admin/parties/pty_1">{children}</a>
    ),
}));

const KEY = "adminListingSources.locationDefault";
const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);
const source: AdminListingSourceDetail = {
    listingSourceId: "ls_1",
    listingSourceSlugId: "antique-house",
    name: "Antique House",
    operator: { partyId: "pty_1", partySlugId: "antique-house", name: "Antique House Ltd" },
    ingestionMethods: ["WEB_CRAWL"],
    presentation: {},
    created: new Date("2026-09-01T10:00:00.000Z"),
    updated: new Date("2026-09-01T10:00:00.000Z"),
};
const location = (patch: Partial<PartyLocationData> = {}): PartyLocationData => ({
    id: "ploc_1",
    partyId: "pty_1",
    label: "Showroom",
    roles: ["BUSINESS_PREMISES"],
    lifecycle: "ACTIVE",
    revision: 2,
    inputRevision: 1,
    ...patch,
});
const sourceDefault = (patch: Partial<SourceLocationDefaultData> = {}): SourceLocationDefaultData =>
    ({
        listingSourceId: "ls_1",
        revision: 1,
        assignment: null,
        eligibility: null,
        ...patch,
    }) as unknown as SourceLocationDefaultData;
const assigned = (patch: Partial<SourceLocationDefaultData> = {}) =>
    sourceDefault({
        revision: 3,
        assignment: {
            partyLocationId: "ploc_1",
            advertisedInventory: { reference: "catalogue", scope: "ADVERTISED_INVENTORY" },
            businessAssociation: { reference: "register", scope: "ASSOCIATED_BUSINESS" },
        },
        eligibility: "ACTIVE",
        ...patch,
    });
const ok = (data: unknown) => ({ data, response: { status: 200 } });
const failure = (status: number, code = "CONFLICT") => ({
    error: { error: code, detail: "evidence catalogue" },
    response: { status },
});
/** Serves this default from now on, as the backend would after a change. */
const serve = (data: SourceLocationDefaultData) => api.get.mockResolvedValue(ok(data));
const serveLocations = (...items: PartyLocationData[]) =>
    api.listLocations.mockResolvedValue(ok({ items, next: null }));
const button = (key: string) => screen.getByRole("button", { name: t(key) });

function renderSection() {
    const client = new QueryClient();
    render(
        <QueryClientProvider client={client}>
            <AdminSourceLocationDefaultSection source={source} />
        </QueryClientProvider>,
    );
}

describe("AdminSourceLocationDefaultSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        serve(sourceDefault());
        serveLocations(
            location(),
            location({ id: "ploc_2", label: "Old depot", lifecycle: "RETIRED" }),
        );
    });

    it("assigns only an active operator location with scoped evidence at the shown revision", async () => {
        api.assign.mockImplementationOnce(async () => {
            const next = assigned({
                revision: 2,
                assignment: {
                    partyLocationId: "ploc_1",
                    advertisedInventory: { reference: "catalogue", scope: "ADVERTISED_INVENTORY" },
                },
            });
            serve(next);
            return ok(next);
        });
        renderSection();

        expect(await screen.findByText(t(`${KEY}.effect.none`))).toBeInTheDocument();
        expect(screen.getByText(t(`${KEY}.fields.noDefault`))).toBeInTheDocument();
        expect(screen.getByText(t(`${KEY}.propagation`))).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: t(`${KEY}.links.operatorLocations`, { name: "Antique House Ltd" }),
            }),
        ).toBeInTheDocument();

        fireEvent.click(button(`${KEY}.actions.assign`));
        const form = screen.getByRole("form", { name: t(`${KEY}.assign.title`) });
        const site = await within(form).findByRole("radio", { name: /Showroom/ });
        expect(within(form).queryByRole("radio", { name: /Old depot/ })).toBeNull();

        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.confirmAssign`) }),
        );
        expect(await within(form).findByText(t(`${KEY}.validation.locationRequired`))).toBeTruthy();

        fireEvent.click(site);
        fireEvent.click(
            within(form).getByRole("checkbox", {
                name: t(`${KEY}.applicability.advertisedInventory.label`),
            }),
        );
        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.confirmAssign`) }),
        );
        expect(
            await within(form).findByText(t(`${KEY}.validation.evidenceRequired`)),
        ).toBeInTheDocument();
        expect(api.assign).not.toHaveBeenCalled();

        fireEvent.change(within(form).getByLabelText(t(`${KEY}.fields.evidenceReference`)), {
            target: { value: "catalogue" },
        });
        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.confirmAssign`) }),
        );

        expect(await screen.findByText(t(`${KEY}.effect.inherits`))).toBeInTheDocument();
        expect(api.assign.mock.calls[0][0].body).toEqual({
            expectedRevision: 1,
            partyLocationId: "ploc_1",
            businessAssociation: null,
            advertisedInventory: { reference: "catalogue", scope: "ADVERTISED_INVENTORY" },
        });
        expect(screen.queryByRole("form")).toBeNull();
    });

    it("explains that a business association alone supplies no listing geography", async () => {
        serve(
            assigned({
                assignment: {
                    partyLocationId: "ploc_1",
                    businessAssociation: { reference: "register", scope: "ASSOCIATED_BUSINESS" },
                },
            }),
        );
        renderSection();

        expect(await screen.findByText(t(`${KEY}.effect.noInventory`))).toBeInTheDocument();
    });

    it("changes only the edited applicability", async () => {
        serve(assigned());
        api.change.mockResolvedValueOnce(ok(assigned({ revision: 4 })));
        renderSection();

        fireEvent.click(
            await screen.findByRole("button", { name: t(`${KEY}.actions.editApplicability`) }),
        );
        const form = screen.getByRole("form", { name: t(`${KEY}.applicabilityForm.title`) });
        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.saveApplicability`) }),
        );
        expect(within(form).getByText(t(`${KEY}.applicabilityForm.noChanges`))).toBeTruthy();
        expect(api.change).not.toHaveBeenCalled();

        fireEvent.click(
            within(form).getByRole("checkbox", {
                name: t(`${KEY}.applicability.businessAssociation.label`),
            }),
        );
        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.saveApplicability`) }),
        );

        await waitFor(() => expect(api.change).toHaveBeenCalledTimes(1));
        expect(api.change.mock.calls[0][0].body).toEqual({
            expectedRevision: 3,
            businessAssociation: null,
        });
    });

    it("shows a retired reference without inventing location content and still allows clearing", async () => {
        serve(
            assigned({
                assignment: { partyLocationId: "ploc_2" },
                eligibility: "RETIRED",
            }),
        );
        api.clear.mockImplementationOnce(async () => {
            const next = sourceDefault({ revision: 4 });
            serve(next);
            return ok(next);
        });
        renderSection();

        expect(await screen.findByText(t(`${KEY}.effect.retired`))).toBeInTheDocument();
        expect(await screen.findByText("Old depot")).toBeInTheDocument();
        expect(screen.getByText("ploc_2")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: t(`${KEY}.actions.editApplicability`) })).toBe(
            null,
        );

        fireEvent.click(button(`${KEY}.actions.clear`));
        expect(screen.getByText(t(`${KEY}.clear.confirmRetired`))).toBeInTheDocument();
        expect(api.clear).not.toHaveBeenCalled();
        fireEvent.click(button(`${KEY}.actions.confirmClear`));

        expect(await screen.findByText(t(`${KEY}.effect.none`))).toBeInTheDocument();
        expect(api.clear.mock.calls[0][0].body).toEqual({ expectedRevision: 3 });
    });

    it("shows only the location ID when the operator's locations do not contain it", async () => {
        serve(assigned({ assignment: { partyLocationId: "ploc_9" } }));
        renderSection();

        expect(await screen.findByText("ploc_9")).toBeInTheDocument();
        expect(
            await screen.findByText(t(`${KEY}.fields.locationDetailsUnavailable`)),
        ).toBeInTheDocument();
    });

    it("refetches after a conflict and resubmits only after the draft is explicitly kept", async () => {
        serve(assigned());
        api.assign.mockImplementationOnce(async () => {
            serve(assigned({ revision: 5 }));
            return failure(409);
        });
        api.assign.mockResolvedValueOnce(ok(assigned({ revision: 6 })));
        renderSection();

        fireEvent.click(await screen.findByRole("button", { name: t(`${KEY}.actions.replace`) }));
        const form = screen.getByRole("form", { name: t(`${KEY}.assign.replaceTitle`) });
        fireEvent.click(await within(form).findByRole("radio", { name: /Showroom/ }));
        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.confirmReplace`) }),
        );

        expect(await within(form).findByText(t(`${KEY}.errors.conflict`))).toBeInTheDocument();
        expect(await within(form).findByText(t(`${KEY}.stale.assign`))).toBeInTheDocument();
        expect(await screen.findByText("5")).toBeInTheDocument();
        expect(
            within(form).getByRole("button", { name: t(`${KEY}.actions.confirmReplace`) }),
        ).toBeDisabled();
        expect(api.assign).toHaveBeenCalledTimes(1);

        fireEvent.click(within(form).getByRole("button", { name: t(`${KEY}.actions.keepDraft`) }));
        fireEvent.click(
            within(form).getByRole("button", { name: t(`${KEY}.actions.confirmReplace`) }),
        );

        await waitFor(() => expect(api.assign).toHaveBeenCalledTimes(2));
        expect(api.assign.mock.calls[0][0].body.expectedRevision).toBe(3);
        expect(api.assign.mock.calls[1][0].body).toMatchObject({
            expectedRevision: 5,
            partyLocationId: "ploc_1",
        });
    });

    it("does not clear again when the default was cleared elsewhere", async () => {
        serve(assigned());
        api.clear.mockImplementationOnce(async () => {
            serve(sourceDefault({ revision: 4 }));
            return failure(409);
        });
        renderSection();

        fireEvent.click(await screen.findByRole("button", { name: t(`${KEY}.actions.clear`) }));
        fireEvent.click(button(`${KEY}.actions.confirmClear`));

        expect(await screen.findByText(t(`${KEY}.stale.alreadyCleared`))).toBeInTheDocument();
        expect(screen.getByText(t(`${KEY}.effect.none`))).toBeInTheDocument();
        expect(button(`${KEY}.actions.confirmClear`)).toBeDisabled();
        expect(screen.queryByRole("button", { name: t(`${KEY}.actions.reviewLatest`) })).toBeNull();
        expect(api.clear).toHaveBeenCalledTimes(1);
    });

    it("hides the loaded default when administrator authority is lost", async () => {
        serve(assigned());
        api.clear.mockImplementationOnce(async () => {
            api.get.mockResolvedValue(failure(403, "FORBIDDEN"));
            return failure(403, "FORBIDDEN");
        });
        renderSection();

        fireEvent.click(await screen.findByRole("button", { name: t(`${KEY}.actions.clear`) }));
        fireEvent.click(button(`${KEY}.actions.confirmClear`));

        // The reset replaces the confirmation and the loaded state with the read's own error.
        expect(
            await screen.findByRole("button", { name: t("adminListingSources.actions.retry") }),
        ).toBeInTheDocument();
        expect(screen.getByText(t(`${KEY}.errors.forbidden`))).toBeInTheDocument();
        expect(screen.queryByText(t(`${KEY}.effect.inherits`))).toBeNull();
        expect(screen.queryByText("catalogue", { exact: false })).toBeNull();
        expect(screen.queryByRole("button", { name: t(`${KEY}.actions.replace`) })).toBeNull();
    });
});
