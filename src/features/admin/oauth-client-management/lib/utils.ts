import { z } from "zod";

export function parseRedirectUris(value: string): string[] {
    return value
        .split("\n")
        .map((uri) => uri.trim())
        .filter(Boolean);
}

export function isValidHttpsUrl(value: string): boolean {
    if (!z.url().safeParse(value).success) {
        return false;
    }

    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}
