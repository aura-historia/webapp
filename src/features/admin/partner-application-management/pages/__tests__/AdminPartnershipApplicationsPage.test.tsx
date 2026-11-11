import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminPartnershipApplicationSummary } from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import testI18n from "@/i18n/i18nForTests";
import { AdminPartnershipApplicationsPage } from "../AdminPartnershipApplicationsPage.tsx";

const mocks = vi.hoisted(() => ({ list: vi.fn(), dialog: vi.fn() }));
vi.mock("../../api/useAdminPartnershipApplications.ts", () => ({
    useAdminPartnershipApplications: mocks.list,
}));
vi.mock("../../components/AdminApplicationDetailDialog.tsx", () => ({
    AdminApplicationDetailDialog: (props: { applicationId?: string; summary?: unknown }) => {
        mocks.dialog(props);
        return null;
    },
}));

const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options);

const proposed: AdminPartnershipApplicationSummary = {
    id: "pa_1",
    applicantUserId: "user_1",
    state: "IN_REVIEW",
    created: new Date("2026-11-03T14:08:00Z"),
    updated: new Date("2026-11-06T09:21:00Z"),
    proposal: {
        type: "PROPOSED_LISTING_SOURCE",
        party: { name: "Galerie Lenbach GmbH" },
        listingSource: {
            name: "Galerie Lenbach",
            listingSourceType: "DEALER",
            requestedIngestionMethods: ["WEB_CRAWL"],
        },
    },
};
const existing: AdminPartnershipApplicationSummary = {
    id: "pa_2",
    applicantUserId: "user_2",
    state: "SUBMITTED",
    created: new Date("2026-11-05T10:00:00Z"),
    updated: new Date("2026-11-05T10:00:00Z"),
    proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_01J9X4" },
};

function listResult(overrides: Record<string, unknown> = {}) {
    return {
        data: { pages: [{ items: [proposed, existing], total: 2 }] },
        isPending: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
        ...overrides,
    };
}

describe("AdminPartnershipApplicationsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.list.mockReturnValue(listResult());
    });

    it("lists applications with their provider, status and applicant", () => {
        render(<AdminPartnershipApplicationsPage search={{}} onSearchChange={vi.fn()} />);

        expect(
            screen.getByRole("heading", { level: 1, name: t("adminApplications.pageTitle") }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("adminCommon.result.loadedOfTotal", { loaded: "2", total: "2" })),
        ).toBeInTheDocument();
        expect(screen.getByText("Galerie Lenbach")).toBeInTheDocument();
        expect(screen.getByText("ls_01J9X4")).toBeInTheDocument();
        expect(
            screen.getByText(
                t("adminApplications.list.proposed", {
                    type: t("listingSourceTypes.DEALER"),
                }).toLocaleUpperCase("de"),
            ),
        ).toBeInTheDocument();
        expect(screen.getByText(t("adminApplications.state.IN_REVIEW"))).toBeInTheDocument();
        expect(screen.getByText("user_1")).toBeInTheDocument();
        expect(mocks.list).toHaveBeenCalledWith({});
    });

    it("lists undecided applications above decided ones", () => {
        const approved: AdminPartnershipApplicationSummary = {
            ...existing,
            id: "pa_3",
            state: "APPROVED",
            proposal: { type: "EXISTING_LISTING_SOURCE", listingSourceId: "ls_APPROVED" },
        };
        mocks.list.mockReturnValue(
            listResult({ data: { pages: [{ items: [approved, proposed, existing], total: 3 }] } }),
        );
        render(<AdminPartnershipApplicationsPage search={{}} onSearchChange={vi.fn()} />);

        const [open, decided] = screen.getAllByRole("list");
        expect(open).toHaveAccessibleName(t("adminApplications.groups.open"));
        expect(decided).toHaveAccessibleName(t("adminApplications.groups.decided"));
        expect(within(open).getAllByRole("button")).toHaveLength(2);
        expect(within(open).getByText("ls_01J9X4")).toBeInTheDocument();
        expect(within(decided).getByText("ls_APPROVED")).toBeInTheDocument();
    });

    it("leaves out a group with no applications", () => {
        render(<AdminPartnershipApplicationsPage search={{}} onSearchChange={vi.fn()} />);
        expect(
            screen.getByRole("list", { name: t("adminApplications.groups.open") }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("list", { name: t("adminApplications.groups.decided") }),
        ).toBeNull();
    });

    it("opens an application through the URL without changing the list filters", async () => {
        const onSearchChange = vi.fn();
        render(
            <AdminPartnershipApplicationsPage
                search={{ states: ["IN_REVIEW"] }}
                onSearchChange={onSearchChange}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", {
                name: t("adminApplications.list.open", { name: "Galerie Lenbach" }),
            }),
        );
        expect(onSearchChange).toHaveBeenCalledWith({ states: ["IN_REVIEW"], application: "pa_1" });
    });

    it("passes the opening row to the dialog and keeps the list query unchanged", () => {
        render(
            <AdminPartnershipApplicationsPage
                search={{ states: ["IN_REVIEW"], application: "pa_1" }}
                onSearchChange={vi.fn()}
            />,
        );
        expect(mocks.list).toHaveBeenCalledWith({ states: ["IN_REVIEW"] });
        expect(mocks.dialog).toHaveBeenLastCalledWith(
            expect.objectContaining({ applicationId: "pa_1", summary: proposed }),
        );
    });

    it("applies the status quick filter at once", async () => {
        const user = userEvent.setup();
        const onSearchChange = vi.fn();
        render(<AdminPartnershipApplicationsPage search={{}} onSearchChange={onSearchChange} />);

        await user.click(
            screen.getByRole("button", { name: new RegExp(t("adminApplications.filters.states")) }),
        );
        await user.click(
            await screen.findByRole("menuitemcheckbox", {
                name: t("adminApplications.state.SUBMITTED"),
            }),
        );
        expect(onSearchChange).toHaveBeenCalledWith({ states: ["SUBMITTED"] });
    });

    it("applies panel filters on Apply and removes them through chips", async () => {
        const user = userEvent.setup();
        const onSearchChange = vi.fn();
        const { rerender } = render(
            <AdminPartnershipApplicationsPage search={{}} onSearchChange={onSearchChange} />,
        );

        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.all") }));
        await user.type(
            screen.getByLabelText(t("adminApplications.filters.applicantUserId")),
            " user_1 ",
        );
        await user.click(screen.getByRole("button", { name: t("adminCommon.filters.apply") }));
        expect(onSearchChange).toHaveBeenLastCalledWith({ applicantUserId: "user_1" });

        rerender(
            <AdminPartnershipApplicationsPage
                search={{ applicantUserId: "user_1", sort: "updated", order: "asc" }}
                onSearchChange={onSearchChange}
            />,
        );
        const label = `${t("adminApplications.filters.applicantUserId")}: user_1`;
        await user.click(
            screen.getByRole("button", {
                name: t("adminCommon.filters.remove", { filter: label }),
            }),
        );
        expect(onSearchChange).toHaveBeenLastCalledWith({ sort: "updated", order: "asc" });
    });

    it("sends sort and order only together and omits the default", async () => {
        const user = userEvent.setup();
        const onSearchChange = vi.fn();
        render(
            <AdminPartnershipApplicationsPage
                search={{ sort: "updated", order: "asc" }}
                onSearchChange={onSearchChange}
            />,
        );
        const sort = screen.getByRole("combobox", { name: t("adminCommon.sort") });
        await user.selectOptions(sort, "updated:desc");
        expect(onSearchChange).toHaveBeenLastCalledWith({ sort: "updated", order: "desc" });
        await user.selectOptions(sort, "created:desc");
        expect(onSearchChange).toHaveBeenLastCalledWith({});
    });

    it("loads more while a cursor remains", async () => {
        const fetchNextPage = vi.fn();
        mocks.list.mockReturnValue(listResult({ hasNextPage: true, fetchNextPage }));
        render(<AdminPartnershipApplicationsPage search={{}} onSearchChange={vi.fn()} />);
        await userEvent.click(
            screen.getByRole("button", { name: t("adminApplications.list.loadMoreApplications") }),
        );
        expect(fetchNextPage).toHaveBeenCalled();
    });

    it("offers Reset filters when nothing matches", async () => {
        const onSearchChange = vi.fn();
        mocks.list.mockReturnValue(listResult({ data: { pages: [{ items: [], total: 0 }] } }));
        render(
            <AdminPartnershipApplicationsPage
                search={{ states: ["WITHDRAWN"] }}
                onSearchChange={onSearchChange}
            />,
        );
        expect(screen.getByText(t("adminApplications.noMatches"))).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", { name: t("adminCommon.filters.clearSearch") }),
        );
        expect(onSearchChange).toHaveBeenCalledWith({});
    });

    it("shows the error state with Try again when nothing loaded", async () => {
        const refetch = vi.fn();
        mocks.list.mockReturnValue(
            listResult({ data: undefined, isPending: false, error: new Error("x"), refetch }),
        );
        render(<AdminPartnershipApplicationsPage search={{}} onSearchChange={vi.fn()} />);
        expect(screen.getByRole("alert")).toHaveTextContent(t("adminApplications.loadFailed"));
        await userEvent.click(screen.getByRole("button", { name: t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalled();
    });
});
