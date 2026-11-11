import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { AdminUserPicker } from "../AdminUserPicker.tsx";

const api = vi.hoisted(() => ({ useAdminUsers: vi.fn() }));
vi.mock("../../api/useAdminUsers.ts", () => ({ useAdminUsers: api.useAdminUsers }));

const user = {
    userId: "usr_canonical_1",
    email: "ada@example.test",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "USER",
    tier: "FREE",
};

describe("AdminUserPicker", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        api.useAdminUsers.mockReturnValue({
            data: { pages: [{ items: [user] }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function search(value: string) {
        fireEvent.change(screen.getByLabelText("User account"), { target: { value } });
        act(() => vi.advanceTimersByTime(350));
    }

    it("searches only after input and returns the canonical account identity", () => {
        const onSelect = vi.fn();
        render(<AdminUserPicker id="picker" label="User account" onSelect={onSelect} />);

        expect(api.useAdminUsers).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: "" }),
            false,
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            testI18n.t("adminUsers.filters.query"),
        );

        search(" ada ");
        expect(api.useAdminUsers).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: "ada" }),
            true,
        );

        fireEvent.click(screen.getByRole("button", { name: /Ada Lovelace/ }));
        expect(onSelect).toHaveBeenCalledWith({
            userId: "usr_canonical_1",
            email: "ada@example.test",
            firstName: "Ada",
            lastName: "Lovelace",
        });
        const selected = screen.getByRole("region", {
            name: testI18n.t("adminUsers.picker.selected"),
        });
        expect(selected).toHaveTextContent("Ada Lovelace");
        expect(selected).toHaveTextContent("usr_canonical_1");

        fireEvent.click(
            screen.getByRole("button", { name: testI18n.t("adminUsers.picker.change") }),
        );
        expect(onSelect).toHaveBeenLastCalledWith(undefined);
        expect(screen.getByLabelText("User account")).toHaveFocus();
    });

    it("never offers results for an older search term while the next one is pending", () => {
        const onSelect = vi.fn();
        render(<AdminUserPicker id="picker" label="User account" onSelect={onSelect} />);
        search("ada");

        fireEvent.change(screen.getByLabelText("User account"), { target: { value: "grace" } });

        expect(screen.queryByRole("button", { name: /Ada Lovelace/ })).toBeNull();
        expect(screen.getByRole("status")).toHaveTextContent(
            testI18n.t("adminUsers.picker.loading"),
        );
        expect(api.useAdminUsers).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: "ada" }),
            true,
        );
    });

    it("never turns unmatched search text into a selection", () => {
        api.useAdminUsers.mockReturnValue({
            data: { pages: [{ items: [] }] },
            isPending: false,
            error: null,
            hasNextPage: false,
        });
        const onSelect = vi.fn();
        render(<AdminUserPicker id="picker" label="User account" onSelect={onSelect} />);

        search("usr_typed");

        expect(screen.getByRole("status")).toHaveTextContent(testI18n.t("adminUsers.picker.none"));
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("offers a retry when the search fails", () => {
        const refetch = vi.fn();
        api.useAdminUsers.mockReturnValue({
            data: undefined,
            isPending: false,
            error: new Error("failed"),
            hasNextPage: false,
            refetch,
        });
        render(<AdminUserPicker id="picker" label="User account" onSelect={vi.fn()} />);

        search("ada");

        expect(screen.getByRole("alert")).toHaveTextContent(testI18n.t("adminUsers.picker.failed"));
        fireEvent.click(screen.getByRole("button", { name: testI18n.t("adminCommon.retry") }));
        expect(refetch).toHaveBeenCalledOnce();
    });
});
