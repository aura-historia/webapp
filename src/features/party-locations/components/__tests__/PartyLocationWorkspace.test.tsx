import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartyLocationData } from "@/client";
import testI18n from "@/i18n/i18nForTests";
import { PartyLocationWorkspace } from "../PartyLocationWorkspace.tsx";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    create: vi.fn(),
    correct: vi.fn(),
    lifecycle: vi.fn(),
}));
vi.mock("@/client", () => ({
    listPartyLocations: api.list,
    createPartyLocation: api.create,
    correctPartyLocation: api.correct,
    setPartyLocationLifecycle: api.lifecycle,
}));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children: ReactNode }) => <a href="/privacy">{children}</a>,
}));

const t = (key: string) => testI18n.t(key);
const scope = { viewerCacheKey: "user-1", partyId: "pty_1" };
const dto = (patch: Partial<PartyLocationData> = {}): PartyLocationData => ({
    id: "ploc_1",
    partyId: "pty_1",
    label: "Showroom",
    roles: ["BUSINESS_PREMISES"],
    geography: { referenceRelease: "iso-codes-4.20.1", country: "DE" },
    lifecycle: "ACTIVE",
    revision: 3,
    inputRevision: 1,
    ...patch,
});
const ok = (data: unknown, status = 200) => ({ data, response: { status } });
const failure = (status: number) => ({ error: {}, response: { status } });
/** Serves these locations from now on, as the backend would after a change. */
const serve = (...items: PartyLocationData[]) =>
    api.list.mockResolvedValue(ok({ items, next: null }));

function renderWorkspace() {
    const client = new QueryClient();
    render(
        <QueryClientProvider client={client}>
            <PartyLocationWorkspace scope={scope} />
        </QueryClientProvider>,
    );
}

async function renderLoaded() {
    renderWorkspace();
    return screen.findByRole("heading", { name: "Showroom" });
}

describe("PartyLocationWorkspace", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        serve(dto());
    });

    it("hides locations when the viewer is not authorized", async () => {
        api.list.mockResolvedValue(failure(403));
        renderWorkspace();

        expect(await screen.findByText(t("partyLocations.errors.forbidden"))).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Showroom" })).toBeNull();
    });

    it("retires and restores only after confirmation, at the shown revision", async () => {
        const respond = (patch: Partial<PartyLocationData>) => async () => {
            serve(dto(patch));
            return ok(dto(patch));
        };
        api.lifecycle
            .mockImplementationOnce(respond({ lifecycle: "RETIRED", revision: 4 }))
            .mockImplementationOnce(respond({ lifecycle: "ACTIVE", revision: 5 }));
        await renderLoaded();
        expect(screen.getByText(t("partyLocations.eligibility.ACTIVE"))).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.retire") }));
        expect(screen.getByText(t("partyLocations.consequences.retire"))).toBeInTheDocument();
        expect(api.lifecycle).not.toHaveBeenCalled();
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.actions.confirmRetire") }),
        );

        await screen.findByText(t("partyLocations.eligibility.RETIRED"));
        expect(api.lifecycle.mock.calls[0][0]).toMatchObject({
            path: { party_id: "pty_1", location_id: "ploc_1" },
            body: { expectedRevision: 3, lifecycle: "RETIRED" },
        });
        expect(screen.queryByRole("button", { name: t("partyLocations.actions.correct") })).toBe(
            null,
        );
        // Focus moves to the action that replaced the retire button, not to the document body.
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: t("partyLocations.actions.restore") }),
            ).toHaveFocus(),
        );

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.restore") }));
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.actions.confirmRestore") }),
        );
        await screen.findByText(t("partyLocations.eligibility.ACTIVE"));
        expect(api.lifecycle.mock.calls[1][0].body).toEqual({
            expectedRevision: 4,
            lifecycle: "ACTIVE",
        });
    });

    it("relocates to a new identity only after confirmation", async () => {
        const created = dto({ id: "ploc_2", label: "New showroom", revision: 1 });
        api.create.mockImplementationOnce(async () => {
            serve(dto({ lifecycle: "RETIRED", revision: 4 }), created);
            return ok(created, 201);
        });
        await renderLoaded();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.relocate") }));
        expect(screen.getByText(t("partyLocations.consequences.relocate"))).toBeInTheDocument();
        expect(
            screen.getByText(t("geography.disclosure.publicPartyLocation"), { exact: false }),
        ).toBeInTheDocument();
        const label = screen.getByLabelText(t("partyLocations.fields.label"));
        expect(label).toHaveValue("Showroom");
        expect(screen.getByLabelText(t("partyLocations.fields.country"))).toHaveValue("");
        fireEvent.change(label, { target: { value: "New showroom" } });
        fireEvent.change(screen.getByLabelText(t("partyLocations.fields.addressText")), {
            target: { value: "Rue 1" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.relocate.submit") }),
        );

        const confirm = await screen.findByRole("button", {
            name: t("partyLocations.actions.confirmRelocate"),
        });
        expect(api.create).not.toHaveBeenCalled();
        fireEvent.click(confirm);

        await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
        const request = api.create.mock.calls[0][0];
        expect(request.body).toEqual({
            label: "New showroom",
            roles: ["BUSINESS_PREMISES"],
            geography: { referenceRelease: "iso-codes-4.20.1", addressText: "Rue 1" },
            relocates: { id: "ploc_1", revision: 3 },
        });
        expect(request.headers["Idempotency-Key"]).toEqual(expect.any(String));
        expect(await screen.findByRole("heading", { name: "New showroom" })).toBeInTheDocument();
        // The previous location stays listed, retired, next to the new one.
        expect(
            await screen.findByText(t("partyLocations.eligibility.RETIRED")),
        ).toBeInTheDocument();
    });

    it("keeps the draft after a conflict and applies only its changes to the latest revision", async () => {
        // Another manager added a role before this correction reached the backend.
        api.correct
            .mockImplementationOnce(async () => {
                serve(dto({ revision: 5, roles: ["BUSINESS_PREMISES", "WAREHOUSE"] }));
                return failure(409);
            })
            .mockResolvedValueOnce(ok(dto({ label: "Renamed", revision: 6 })));
        await renderLoaded();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.correct") }));
        const label = screen.getByLabelText(t("partyLocations.fields.label"));
        fireEvent.change(label, { target: { value: "Renamed" } });
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        );

        expect(
            await screen.findByText(t("partyLocations.editor.stale.correct")),
        ).toBeInTheDocument();
        expect(label).toHaveValue("Renamed");
        expect(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        ).toBeDisabled();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.editor.keepDraft") }));
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        );

        await waitFor(() => expect(api.correct).toHaveBeenCalledTimes(2));
        expect(api.correct.mock.calls[0][0].body).toEqual({
            expectedRevision: 3,
            correction: "SAME_SITE",
            label: "Renamed",
        });
        // The concurrently added role is not reverted by the kept draft.
        expect(api.correct.mock.calls[1][0].body).toEqual({
            expectedRevision: 5,
            correction: "SAME_SITE",
            label: "Renamed",
        });
    });

    it("discards the draft after a conflict and restarts from the latest revision", async () => {
        api.correct.mockImplementationOnce(async () => {
            serve(dto({ label: "Gallery", revision: 5 }));
            return failure(409);
        });
        await renderLoaded();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.correct") }));
        const label = screen.getByLabelText(t("partyLocations.fields.label"));
        fireEvent.change(label, { target: { value: "Renamed" } });
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        );

        fireEvent.click(
            await screen.findByRole("button", { name: t("partyLocations.editor.discardDraft") }),
        );

        expect(label).toHaveValue("Gallery");
        expect(screen.queryByText(t("partyLocations.editor.stale.correct"))).toBeNull();
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        );
        // The latest version is the new baseline, so an untouched draft has nothing to send.
        expect(await screen.findByText(t("partyLocations.editor.noChanges"))).toBeInTheDocument();
        expect(api.correct).toHaveBeenCalledTimes(1);
    });

    it("blocks a kept draft once the location is no longer active", async () => {
        api.correct.mockImplementationOnce(async () => {
            serve(dto({ lifecycle: "RETIRED", revision: 4 }));
            return failure(409);
        });
        await renderLoaded();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.correct") }));
        fireEvent.change(screen.getByLabelText(t("partyLocations.fields.label")), {
            target: { value: "Renamed" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        );

        expect(
            await screen.findByText(t("partyLocations.editor.staleInactive")),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: t("partyLocations.editor.keepDraft") }),
        ).toBeNull();
        expect(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        ).toBeDisabled();
    });

    it("refetches the location instead of retrying a conflicting lifecycle change", async () => {
        api.lifecycle.mockImplementationOnce(async () => {
            serve(dto({ label: "Gallery", revision: 4 }));
            return failure(409);
        });
        await renderLoaded();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.retire") }));
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.actions.confirmRetire") }),
        );

        expect(await screen.findByText(t("partyLocations.errors.conflict"))).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: "Gallery" })).toBeInTheDocument();
        expect(api.lifecycle).toHaveBeenCalledTimes(1);
        expect(screen.getByText(t("partyLocations.eligibility.ACTIVE"))).toBeInTheDocument();
    });

    it("does not send a correction without changes", async () => {
        await renderLoaded();

        fireEvent.click(screen.getByRole("button", { name: t("partyLocations.actions.correct") }));
        fireEvent.click(
            screen.getByRole("button", { name: t("partyLocations.editor.correct.submit") }),
        );

        expect(await screen.findByText(t("partyLocations.editor.noChanges"))).toBeInTheDocument();
        expect(api.correct).not.toHaveBeenCalled();
    });
});
