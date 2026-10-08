import { describe, expect, it } from "vitest";
import {
    DEFAULT_ADMIN_USER_FILTERS,
    mapToAdminUserSearchQuery,
    validateAdminUserSearch,
} from "../adminUserSearch.ts";

describe("admin user search", () => {
    it("maps only declared filters and keeps the continuation cursor as an opaque string", () => {
        expect(
            mapToAdminUserSearchQuery(
                {
                    query: " ada ",
                    email: " example.test ",
                    firstName: "Ada",
                    lastName: "Lovelace",
                    tier: ["PRO", "ULTIMATE"],
                    role: ["ADMIN"],
                    createdFrom: "2026-01-02",
                    createdTo: "2026-02-03",
                    updatedFrom: "2026-03-04",
                    updatedTo: "2026-04-05",
                    sort: "name",
                    order: "desc",
                },
                "cursor/with+opaque-characters",
            ),
        ).toEqual({
            size: 21,
            query: "ada",
            email: "example.test",
            firstName: "Ada",
            lastName: "Lovelace",
            tier: ["PRO", "ULTIMATE"],
            role: ["ADMIN"],
            "created[min]": "2026-01-02T00:00:00.000Z",
            "created[max]": "2026-02-03T23:59:59.999Z",
            "updated[min]": "2026-03-04T00:00:00.000Z",
            "updated[max]": "2026-04-05T23:59:59.999Z",
            sort: "name",
            order: "desc",
            searchAfter: "cursor/with+opaque-characters",
        });
    });

    it("defaults to name sorting and drops malformed filter values without parsing opaque IDs", () => {
        const search = validateAdminUserSearch({
            userId: "usr_custom/id+part",
            sort: "score",
            order: "sideways",
            createdFrom: "2026-02-30",
            role: ["ADMIN", "OWNER"],
        });

        expect(search.userId).toBe("usr_custom/id+part");
        expect(search.sort).toBe("name");
        expect(search.order).toBe("asc");
        expect(search.createdFrom).toBeUndefined();
        expect(search.role).toEqual(["ADMIN"]);
        expect(mapToAdminUserSearchQuery(DEFAULT_ADMIN_USER_FILTERS)).toEqual({
            size: 21,
            sort: "name",
            order: "asc",
        });
    });
});
