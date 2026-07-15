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
const sourceRoot = join(projectRoot, "src");
const localesRoot = join(projectRoot, "src/i18n/locales");
const defaultBaseRef = "origin/develop";
const sourceFilePattern = /\.[cm]?[jt]sx?$/;
const pluralSuffixPattern = /_(zero|one|two|few|many|other)$/;
const translationKeyCandidatePattern = /\b[a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+\b/g;

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

function canResolveGitRef(ref: string): boolean {
    try {
        execFileSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], {
            cwd: projectRoot,
            stdio: "ignore",
        });
        return true;
    } catch {
        return false;
    }
}

function tryFetchDefaultBaseRef(): void {
    try {
        execFileSync(
            "git",
            ["fetch", "--depth=1", "origin", "develop:refs/remotes/origin/develop"],
            {
                cwd: projectRoot,
                stdio: "ignore",
            },
        );
    } catch {
        // Some CI checkouts intentionally do not expose or allow fetching the base branch.
    }
}

function resolveBaseRef(): string | null {
    const configuredBaseRef = process.env.TRANSLATION_BASE_REF ?? defaultBaseRef;

    if (canResolveGitRef(configuredBaseRef)) {
        return configuredBaseRef;
    }

    if (configuredBaseRef === defaultBaseRef) {
        tryFetchDefaultBaseRef();

        if (canResolveGitRef(configuredBaseRef)) {
            return configuredBaseRef;
        }
    }

    return null;
}

function readBaseTranslationJson(baseRef: string, relativePath: string): unknown {
    return JSON.parse(
        execFileSync("git", ["show", `${baseRef}:${relativePath}`], {
            cwd: projectRoot,
            encoding: "utf8",
        }),
    );
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

function listRuntimeSourceFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            return listRuntimeSourceFiles(path);
        }

        if (!sourceFilePattern.test(path)) {
            return [];
        }

        if (
            path.includes("/src/i18n/locales/") ||
            path.includes("/src/client/") ||
            path.includes("/__tests__/") ||
            path.endsWith(".test.ts") ||
            path.endsWith(".test.tsx") ||
            path.endsWith(".spec.ts") ||
            path.endsWith(".spec.tsx") ||
            path.endsWith("/src/i18n/translations.test.ts") ||
            path.endsWith("/src/routeTree.gen.ts")
        ) {
            return [];
        }

        return [path];
    });
}

function readRuntimeSourceContents(): string {
    return listRuntimeSourceFiles(sourceRoot)
        .map((path) => readFileSync(path, "utf8"))
        .join("\n");
}

function extractRuntimeKeyCandidates(sourceContents: string): Set<string> {
    return new Set(
        [...sourceContents.matchAll(translationKeyCandidatePattern)].map((match) => match[0]),
    );
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function templateToRegExp(template: string, prefix = ""): RegExp {
    const pattern = escapeRegExp(`${prefix}${template}`).replace(/\\\$\\\{[^}]+\\\}/g, "[^.]+");
    return new RegExp(`^${pattern}$`);
}

function extractDynamicTranslationPatterns(
    sourceContents: string,
    rootKeys: Set<string>,
): RegExp[] {
    const directTemplatePatterns = [...sourceContents.matchAll(/`([^`]*\$\{[^`]*\}[^`]*)`/g)]
        .map((match) => match[1])
        .filter((template) => {
            const rootKey = template.split(/[.${]/)[0];
            return rootKeys.has(rootKey);
        })
        .map((template) => templateToRegExp(template));
    const comparisonHelperPatterns = [
        ...sourceContents.matchAll(/getBarnebysComparisonTranslationKey\(\s*`([^`]+)`\s*\)/g),
    ].map((match) => templateToRegExp(match[1], "compareBarnebysPage."));

    return [
        ...directTemplatePatterns,
        ...comparisonHelperPatterns,
        /^apiErrors\.[^.]+$/,
        /^compareBarnebysPage\.quickVerdicts\.[^.]+\.(label|value)$/,
        /^compareBarnebysPage\.scorecard\.rows\.[^.]+\.(criterion|barnebys|auraHistoria|verdict|whyItMatters)$/,
        /^compareBarnebysPage\.downstream\.sources\.[^.]+$/,
        /^compareBarnebysPage\.faq\.items\.[^.]+\.(question|answer)$/,
        /^compareBarnebysPage\.(advantages|downstream)\.cards\.[^.]+\.(title|description)$/,
        /^partnerProgram\.customIntegrationPage\.guide\.steps\.[^.]+\.(title|description|focus|inputLabel|inputPlaceholder|inputHint|cta|visualTitle|visualCaption)$/,
    ];
}

function getLookupKeys(translationKey: string): string[] {
    const candidates = new Set([translationKey]);
    const pluralBaseKey = translationKey.replace(pluralSuffixPattern, "");

    candidates.add(pluralBaseKey);

    const keyParts = translationKey.split(".");
    const firstArrayIndex = keyParts.findIndex((part) => /^\d+$/.test(part));

    if (firstArrayIndex >= 0) {
        candidates.add(keyParts.slice(0, firstArrayIndex).join("."));
    }

    return [...candidates].filter((key) => key.length > 0);
}

function isTranslationKeyUsed(
    translationKey: string,
    runtimeKeyCandidates: Set<string>,
    dynamicTranslationPatterns: RegExp[],
): boolean {
    const comparisonKeyPrefix = "compareBarnebysPage.";

    return (
        getLookupKeys(translationKey).some((key) => runtimeKeyCandidates.has(key)) ||
        dynamicTranslationPatterns.some((pattern) => pattern.test(translationKey)) ||
        (translationKey.startsWith(comparisonKeyPrefix) &&
            runtimeKeyCandidates.has(translationKey.slice(comparisonKeyPrefix.length)))
    );
}

function formatLocaleList(locales: string[]): string {
    return locales.length > 0 ? locales.join(", ") : "none";
}

const translationFiles = loadCurrentTranslationFiles();
const baseRef = resolveBaseRef();
const translationRootKeys = new Set(
    translationFiles[0]?.leaves.map((leaf) => leaf.key.split(".")[0]),
);
const runtimeSourceContents = readRuntimeSourceContents();
const runtimeKeyCandidates = extractRuntimeKeyCandidates(runtimeSourceContents);
const dynamicTranslationPatterns = extractDynamicTranslationPatterns(
    runtimeSourceContents,
    translationRootKeys,
);

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

    it("does not contain orphan translation keys", () => {
        const orphanKeys = [...new Set(translationFiles[0]?.leaves.map((leaf) => leaf.key))]
            .filter(
                (key) =>
                    !isTranslationKeyUsed(key, runtimeKeyCandidates, dynamicTranslationPatterns),
            )
            .sort();

        expect(orphanKeys).toEqual([]);
    });

    it(`changes every locale when a translation field changes compared to ${defaultBaseRef}`, () => {
        if (!baseRef) {
            console.warn(
                `Skipping translation change comparison because ${defaultBaseRef} is not available. Fetch ${defaultBaseRef} or set TRANSLATION_BASE_REF to enable this assertion.`,
            );
            return;
        }

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
                    flattenTranslationLeaves(
                        readBaseTranslationJson(baseRef, translationFile.relativePath),
                    ),
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
