#!/usr/bin/env node
// Merges new or changed strings into every locale file and deletes keys, keeping the repo's
// 2-space JSON formatting.
//
// Usage (from the repo root):
//   node .claude/skills/redesign-page/scripts/merge-translations.mjs <changes.json>
//
// changes.json:
// {
//   "set": {
//     "en": { "searchFilters": { "heading": "My <em>search filters.</em>" } },
//     "de": { "searchFilters": { "heading": "Meine <em>Suchaufträge.</em>" } },
//     "es": { … }, "fr": { … }, "it": { … }
//   },
//   "delete": ["searchFilters.title", "searchFilters.totalElements_one"]
// }
//
// Every locale in "set" must define the same keys; the script refuses otherwise, because
// src/i18n/translations.test.ts requires identical key sets and changes in every locale.
import fs from "node:fs";
import path from "node:path";

const LOCALES = ["de", "en", "es", "fr", "it"];
const changesPath = process.argv[2];
if (!changesPath) {
    console.error("Usage: merge-translations.mjs <changes.json>");
    process.exit(1);
}
const { set = {}, delete: remove = [] } = JSON.parse(fs.readFileSync(changesPath, "utf8"));

function leaves(value, prefix = "") {
    if (value === null || typeof value !== "object") return [prefix];
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

const setLocales = Object.keys(set);
if (setLocales.length > 0) {
    const missing = LOCALES.filter((l) => !setLocales.includes(l));
    if (missing.length) {
        console.error(`"set" is missing locales: ${missing.join(", ")}`);
        process.exit(1);
    }
    const reference = leaves(set.en).sort().join("\n");
    for (const locale of LOCALES) {
        if (leaves(set[locale]).sort().join("\n") !== reference) {
            console.error(`"set.${locale}" does not define the same keys as "set.en".`);
            process.exit(1);
        }
    }
}

function merge(target, source) {
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            if (!target[key] || typeof target[key] !== "object") target[key] = {};
            merge(target[key], value);
        } else {
            target[key] = value;
        }
    }
}

function deleteKey(target, dotted) {
    const parts = dotted.split(".");
    const parents = [target];
    for (const part of parts.slice(0, -1)) {
        const next = parents.at(-1)?.[part];
        if (!next || typeof next !== "object") return false;
        parents.push(next);
    }
    const last = parts.at(-1);
    if (!(last in parents.at(-1))) return false;
    delete parents.at(-1)[last];
    // Drop objects the deletion left empty.
    for (let i = parents.length - 1; i > 0; i--) {
        if (Object.keys(parents[i]).length === 0) delete parents[i - 1][parts[i - 1]];
    }
    return true;
}

for (const locale of LOCALES) {
    const file = path.join("src", "i18n", "locales", locale, "translation.json");
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    if (set[locale]) merge(json, set[locale]);
    const missing = remove.filter((key) => !deleteKey(json, key));
    fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
    console.log(`${locale}: updated${missing.length ? ` (not found: ${missing.join(", ")})` : ""}`);
}
console.log("Next: npx vitest run src/i18n/translations.test.ts");
