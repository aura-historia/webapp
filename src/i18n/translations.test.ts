import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type TranslationLeaf = {
    key: string;
    value: unknown;
};

type TranslationFile = {
    locale: string;
    path: string;
    relativePath: string;
    leaves: TranslationLeaf[];
};

const projectRoot = process.cwd();
const localesRoot = join(projectRoot, "src/i18n/locales");
const baseRef = "origin/develop";

function flattenTranslationLeaves(value: unknown, keyPrefix = ""): TranslationLeaf[] {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return [{ key: keyPrefix, value }];
        }

        return value.flatMap((nestedValue, index) =>
            flattenTranslationLeaves(
                nestedValue,
                keyPrefix ? `${keyPrefix}.${index}` : String(index),
            ),
        );
    }

    if (value === null || typeof value !== "object") {
        return [{ key: keyPrefix, value }];
    }

    const entries = Object.entries(value);

    if (entries.length === 0) {
        return [{ key: keyPrefix, value }];
    }

    return entries.flatMap(([key, nestedValue]) =>
        flattenTranslationLeaves(nestedValue, keyPrefix ? `${keyPrefix}.${key}` : key),
    );
}

function readTranslationJson(path: string): unknown {
    return JSON.parse(readFileSync(path, "utf8"));
}

function readBaseTranslationJson(relativePath: string): unknown {
    try {
        return JSON.parse(
            execFileSync("git", ["show", `${baseRef}:${relativePath}`], {
                cwd: projectRoot,
                encoding: "utf8",
            }),
        );
    } catch (error) {
        throw new Error(
            `Could not read ${relativePath} from ${baseRef}. Ensure ${baseRef} is fetched before running translation tests.`,
            { cause: error },
        );
    }
}

function loadCurrentTranslationFiles(): TranslationFile[] {
    return readdirSync(localesRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
            const relativePath = `src/i18n/locales/${entry.name}/translation.json`;
            const path = join(projectRoot, relativePath);

            return {
                locale: entry.name,
                path,
                relativePath,
                leaves: flattenTranslationLeaves(readTranslationJson(path)),
            };
        })
        .sort((left, right) => left.locale.localeCompare(right.locale));
}

function toTranslationMap(leaves: TranslationLeaf[]): Map<string, unknown> {
    return new Map(leaves.map((leaf) => [leaf.key, leaf.value]));
}

function formatLocaleList(locales: string[]): string {
    return locales.length > 0 ? locales.join(", ") : "none";
}

const translationFiles = loadCurrentTranslationFiles();

describe("translations", () => {
    it("has only non-empty string values", () => {
        const invalidValues = translationFiles.flatMap((translationFile) =>
            translationFile.leaves
                .filter(
                    ({ key, value }) =>
                        key.length === 0 || typeof value !== "string" || value.trim().length === 0,
                )
                .map(({ key, value }) => ({
                    locale: translationFile.locale,
                    key,
                    value,
                })),
        );

        expect(invalidValues).toEqual([]);
    });

    it("has the same translation keys in every locale", () => {
        const keysByLocale = new Map(
            translationFiles.map((translationFile) => [
                translationFile.locale,
                new Set(translationFile.leaves.map((leaf) => leaf.key)),
            ]),
        );
        const allKeys = new Set([...keysByLocale.values()].flatMap((keys) => [...keys]));
        const missingKeys = [...allKeys]
            .flatMap((key) =>
                translationFiles
                    .filter(
                        (translationFile) => !keysByLocale.get(translationFile.locale)?.has(key),
                    )
                    .map((translationFile) => `${translationFile.locale}: ${key}`),
            )
            .sort();

        expect(missingKeys).toEqual([]);
    });

    it(`changes every locale when a translation field changes compared to ${baseRef}`, () => {
        const currentTranslationsByLocale = new Map(
            translationFiles.map((translationFile) => [
                translationFile.locale,
                toTranslationMap(translationFile.leaves),
            ]),
        );
        const baseTranslationsByLocale = new Map(
            translationFiles.map((translationFile) => [
                translationFile.locale,
                toTranslationMap(
                    flattenTranslationLeaves(readBaseTranslationJson(translationFile.relativePath)),
                ),
            ]),
        );
        const baseKeysByLocale = [...baseTranslationsByLocale.values()].map(
            (translations) => new Set(translations.keys()),
        );
        const sharedBaseKeys = [
            ...new Set(baseKeysByLocale.flatMap((translationKeys) => [...translationKeys])),
        ].filter((key) => baseKeysByLocale.every((translationKeys) => translationKeys.has(key)));
        const incompleteChanges = sharedBaseKeys
            .map((key) => {
                const changedLocales = translationFiles
                    .filter(
                        (translationFile) =>
                            currentTranslationsByLocale.get(translationFile.locale)?.get(key) !==
                            baseTranslationsByLocale.get(translationFile.locale)?.get(key),
                    )
                    .map((translationFile) => translationFile.locale);

                if (
                    changedLocales.length === 0 ||
                    changedLocales.length === translationFiles.length
                ) {
                    return null;
                }

                const unchangedLocales = translationFiles
                    .map((translationFile) => translationFile.locale)
                    .filter((locale) => !changedLocales.includes(locale));

                return `${key}: changed in ${formatLocaleList(changedLocales)}; unchanged in ${formatLocaleList(unchangedLocales)}`;
            })
            .filter((change): change is string => change !== null)
            .sort();

        expect(incompleteChanges).toEqual([]);
    });
});
