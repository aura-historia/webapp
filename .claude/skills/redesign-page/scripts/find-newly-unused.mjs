#!/usr/bin/env node
// Lists source files that the app's routes could reach on the base ref but can no longer reach in
// the working tree — the code a redesign made unused. Pre-existing dead code is not listed.
//
// Usage (from the repo root):
//   node .claude/skills/redesign-page/scripts/find-newly-unused.mjs [baseRef]
// baseRef defaults to origin/develop; pass the branch the feature branch was cut from.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseRef = process.argv[2] ?? "origin/develop";
const git = (...args) =>
    execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });

const SOURCE = /\.(tsx?|jsx?|mjs)$/;
const TEST = /__tests__|\.test\.|\.spec\.|test-utils|i18nForTests|setupTests/;
const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"];
const IMPORT =
    /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|import\s*['"]([^'"]+)['"]/g;

function unreachable(ref) {
    const listing = ref
        ? git("ls-tree", "-r", "--name-only", ref, "--", "src")
        : git("ls-files", "--cached", "--others", "--exclude-standard", "--", "src");
    const files = listing
        .split("\n")
        .filter((f) => SOURCE.test(f) && (ref || fs.existsSync(path.join(root, f))));
    const fileSet = new Set(files);
    const read = (f) => (ref ? git("show", `${ref}:${f}`) : fs.readFileSync(path.join(root, f), "utf8"));

    const resolve = (from, spec) => {
        let base;
        if (spec.startsWith("@/")) base = `src/${spec.slice(2)}`;
        else if (spec.startsWith(".")) base = path.posix.join(path.posix.dirname(from), spec);
        else return null;
        return EXTENSIONS.map((e) => base + e).find((candidate) => fileSet.has(candidate)) ?? null;
    };

    const graph = new Map(
        files.map((f) => [
            f,
            [...read(f).matchAll(IMPORT)]
                .map((m) => resolve(f, m[1] ?? m[2] ?? m[3]))
                .filter(Boolean),
        ]),
    );

    // Entry points: route files, top-level src files and the generated API client.
    const stack = files.filter(
        (f) =>
            !TEST.test(f) &&
            (f.startsWith("src/routes/") || !f.slice(4).includes("/") || f.startsWith("src/client/")),
    );
    const reached = new Set();
    while (stack.length) {
        const f = stack.pop();
        if (reached.has(f)) continue;
        reached.add(f);
        stack.push(...(graph.get(f) ?? []));
    }
    return new Set(files.filter((f) => !TEST.test(f) && !reached.has(f)));
}

const before = unreachable(baseRef);
const now = unreachable(null);
const newlyUnused = [...now].filter((f) => !before.has(f)).sort();

if (newlyUnused.length === 0) {
    console.log(`Nothing became unused compared with ${baseRef}.`);
} else {
    console.log(`Unused now but reachable on ${baseRef}:`);
    for (const f of newlyUnused) console.log(`  ${f}`);
}
