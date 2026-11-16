import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { cancelRefetches } from "../cancelRefetches.ts";

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

describe("cancelRefetches", () => {
    let client: QueryClient;
    const key = ["productListings", "detail", "vase"];

    beforeEach(() => {
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    it("lets a first load finish for the loader awaiting it, then invalidates it", async () => {
        const response = deferred<string>();
        const loader = client.ensureQueryData({ queryKey: key, queryFn: () => response.promise });

        await cancelRefetches(client, { queryKey: ["productListings"] });
        response.resolve("before write");

        await expect(loader).resolves.toBe("before write");
        await Promise.resolve();
        expect(client.getQueryState(key)?.isInvalidated).toBe(true);
    });

    it("cancels a refetch and keeps the cached data", async () => {
        client.setQueryData(key, "cached");
        const response = deferred<string>();
        void client
            .fetchQuery({ queryKey: key, queryFn: () => response.promise, staleTime: 0 })
            .catch(() => undefined);
        expect(client.getQueryState(key)?.fetchStatus).toBe("fetching");

        await cancelRefetches(client, { queryKey: ["productListings"] });
        response.resolve("stale response");
        await Promise.resolve();

        expect(client.getQueryState(key)?.fetchStatus).toBe("idle");
        expect(client.getQueryData(key)).toBe("cached");
    });

    it("respects the caller's predicate", async () => {
        client.setQueryData(key, "cached");
        const response = deferred<string>();
        void client.fetchQuery({ queryKey: key, queryFn: () => response.promise, staleTime: 0 });

        await cancelRefetches(client, { queryKey: ["productListings"], predicate: () => false });

        expect(client.getQueryState(key)?.fetchStatus).toBe("fetching");
        response.resolve("fresh");
    });

    it("does not invalidate a first load whose query was removed meanwhile", async () => {
        const response = deferred<string>();
        const loader = client
            .ensureQueryData({ queryKey: key, queryFn: () => response.promise })
            .catch(() => undefined);

        await cancelRefetches(client, { queryKey: ["productListings"] });
        client.removeQueries({ queryKey: key });
        client.setQueryData(key, "next viewer");
        response.resolve("previous viewer");
        await loader;
        await Promise.resolve();

        expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    });
});
