import { useQuery } from "@tanstack/react-query";

type SubdivisionNames = Readonly<Record<string, string>>;

type SubdivisionRecord = { readonly code: string; readonly name: string };

/** Code → official local name, read from the vendored release (`Bayern`, `Île-de-France`). */
async function loadSubdivisionNames(): Promise<SubdivisionNames> {
    const release = (await import("../../../../reference/iso-codes-4.20.1/iso_3166-2.json"))
        .default as { readonly "3166-2": readonly SubdivisionRecord[] };
    return Object.fromEntries(release["3166-2"].map((record) => [record.code, record.name]));
}

/**
 * ISO 3166-2 region names, which `Intl` does not provide. Every language shows the official local
 * names of the iso-codes 4.20.1 release; the data is not translated. Until it has loaded,
 * `formatSubdivisionName` returns the code. Pass `enabled: false` while no region is shown, so the
 * release is not downloaded for nothing.
 */
export function useSubdivisionNames(enabled = true) {
    const query = useQuery({
        queryKey: ["subdivisionNames"],
        queryFn: loadSubdivisionNames,
        enabled,
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
    });
    const names = query.data;
    return {
        names,
        formatSubdivisionName: (code: string): string => names?.[code] ?? code,
    };
}
