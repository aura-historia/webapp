import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartyLocationData } from "@/client";
import { PartyLocationSelector } from "../PartyLocationSelector.tsx";

const api = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/client", () => ({ listPartyLocations: api.list }));

const dto = (patch: Partial<PartyLocationData>): PartyLocationData => ({
    id: "ploc_1",
    partyId: "pty_1",
    label: "Showroom",
    roles: [],
    lifecycle: "ACTIVE",
    revision: 1,
    inputRevision: 1,
    ...patch,
});

describe("PartyLocationSelector", () => {
    beforeEach(() => {
        api.list.mockResolvedValue({
            data: {
                items: [
                    dto({ id: "ploc_1", label: "Showroom" }),
                    dto({ id: "ploc_2", label: "Old depot", lifecycle: "RETIRED" }),
                ],
                next: null,
            },
            response: { status: 200 },
        });
    });

    it("offers only active locations and selects none by default", async () => {
        const onChange = vi.fn();
        render(
            <QueryClientProvider client={new QueryClient()}>
                <PartyLocationSelector
                    scope={{ viewerCacheKey: "user-1", partyId: "pty_1" }}
                    name="default-location"
                    legend="Default location"
                    onChange={onChange}
                />
            </QueryClientProvider>,
        );

        const option = await screen.findByRole("radio", { name: /Showroom/ });
        expect(option).not.toBeChecked();
        expect(screen.queryByRole("radio", { name: /Old depot/ })).toBeNull();

        fireEvent.click(option);
        expect(onChange).toHaveBeenCalledWith("ploc_1");
    });
});
