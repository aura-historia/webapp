// Generates the press page's logo files and brand kit in public/press/ from the wordmark drawn in
// src/features/app-shell/components/navigation/Wordmark.tsx, so the downloads never drift from the
// logo on the site. Run after the wordmark changes and commit the output:
//
//     node scripts/generate-press-kit.mjs
//
// PNGs are rendered with Playwright's Chromium (set CHROMIUM_PATH to use another Chromium binary);
// the ZIP needs the `zip` command line tool.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "public", "press");
/** Built here first, so a missing tool never leaves public/press half-written. */
const BUILD_DIR = join(ROOT, "public", ".press-build");
const WORDMARK_SOURCE = join(
    ROOT,
    "src/features/app-shell/components/navigation/Wordmark.tsx",
);

const PNG_WIDTH = 2400;
const INK = "#170D0E";
const PARCHMENT = "#F4EEE3";
const OXBLOOD = "#4A1520";
/** Clear space around the mark on the oxblood ground: about one capital letter's height. */
const GROUND_PADDING = 29;

function readConstant(source, name) {
    const match = source.match(new RegExp(`export const ${name} =\\s*"([^"]+)"`));
    if (!match) throw new Error(`${name} not found in ${WORDMARK_SOURCE}`);
    return match[1];
}

const source = readFileSync(WORDMARK_SOURCE, "utf8");
const LETTERS = readConstant(source, "WORDMARK_PATH");
const LENS = readConstant(source, "WORDMARK_LOUPE_LENS_PATH");
const HANDLE = readConstant(source, "WORDMARK_LOUPE_HANDLE_PATH");
const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = readConstant(source, "WORDMARK_VIEW_BOX")
    .split(/\s+/)
    .map(Number);

function letters(color) {
    return `<path d="${LETTERS}" fill="${color}"/>`;
}

function loupe(color) {
    return (
        `<path d="${LENS}" stroke="${color}" stroke-width="2" fill="none"/>` +
        `<path d="${HANDLE}" fill="${color}" stroke="${color}" stroke-width="2"/>`
    );
}

/** The one-line wordmark, exactly as the site draws it. */
function inlineMark(color) {
    return {
        box: [VIEW_X, VIEW_Y, VIEW_W, VIEW_H],
        body: letters(color) + loupe(color),
    };
}

// The stacked lockup: AURA centred over a hairline rule over HISTORIA, cut from the same drawing.
const AURA = { x: -1, y: 9, w: 119, h: 33 };
const HISTORIA = { x: 126, y: 9, w: 208, h: 50 };
const STACK_GAP = 9;
const RULE = { w: 164, h: 1.2 };

function stackedMark(color) {
    const auraX = (HISTORIA.w - AURA.w) / 2;
    const ruleY = AURA.h + STACK_GAP;
    const historiaY = ruleY + RULE.h + STACK_GAP;
    const body =
        `<svg x="${auraX}" y="0" width="${AURA.w}" height="${AURA.h}" viewBox="${AURA.x} ${AURA.y} ${AURA.w} ${AURA.h}">${letters(color)}</svg>` +
        `<rect x="${(HISTORIA.w - RULE.w) / 2}" y="${ruleY}" width="${RULE.w}" height="${RULE.h}" fill="${color}"/>` +
        `<svg x="0" y="${historiaY}" width="${HISTORIA.w}" height="${HISTORIA.h}" viewBox="${HISTORIA.x} ${HISTORIA.y} ${HISTORIA.w} ${HISTORIA.h}">${letters(color)}${loupe(color)}</svg>`;
    return { box: [0, 0, HISTORIA.w, historiaY + HISTORIA.h], body };
}

function onGround({ box, body }, ground) {
    // The PNG is rendered on this ground too (see renderPngs), so no edge pixel is translucent.
    const [x, y, w, h] = box;
    const padded = [
        x - GROUND_PADDING,
        y - GROUND_PADDING,
        w + 2 * GROUND_PADDING,
        h + 2 * GROUND_PADDING,
    ];
    return {
        box: padded,
        ground,
        body: `<rect x="${padded[0]}" y="${padded[1]}" width="${padded[2]}" height="${padded[3]}" fill="${ground}"/>${body}`,
    };
}

function toSvg({ box, body }) {
    const [x, y, w, h] = box.map((value) => Number(value.toFixed(2)));
    // Intrinsic size at twice the drawing units, so the file opens at a legible size.
    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aura Historia" viewBox="${x} ${y} ${w} ${h}" width="${Number((w * 2).toFixed(2))}" height="${Number((h * 2).toFixed(2))}">${body}</svg>\n`;
}

const LOGOS = [
    { name: "aura-historia-wordmark-ink", mark: inlineMark(INK) },
    { name: "aura-historia-wordmark-parchment", mark: inlineMark(PARCHMENT) },
    { name: "aura-historia-wordmark-oxblood", mark: onGround(inlineMark(PARCHMENT), OXBLOOD) },
    { name: "aura-historia-wordmark-stacked-ink", mark: stackedMark(INK) },
    { name: "aura-historia-wordmark-stacked-parchment", mark: stackedMark(PARCHMENT) },
    {
        name: "aura-historia-wordmark-stacked-oxblood",
        mark: onGround(stackedMark(PARCHMENT), OXBLOOD),
    },
];

// The colour values and fact sheet repeat BRAND_COLOURS and the English fact sheet in
// src/features/press and src/i18n; pressKitFiles.test.ts checks that they still agree.
const COLOURS = `Aura Historia colours
=====================

Mostly parchment and ink. Oxblood is the brand colour and is used as a fill; brass is a quiet
accent, set as text only on ink.

Parchment     #F4EEE3   RGB 244 238 227   The page ground.
Ink           #170D0E   RGB 23 13 14      Text, and the dark ground.
Oxblood       #4A1520   RGB 74 21 32      The brand colour, used as a fill.
Brass         #B8935A   RGB 184 147 90    The accent. As text only on ink.
Brass light   #E2C9A0   RGB 226 201 160   Emphasis in headlines on ink.
Sand          #D9CDB8   RGB 217 205 184   Quiet data marks and dividers.

Typefaces (SIL Open Font License, Google Fonts): Newsreader for headlines and object names,
Geist for text and interface, Geist Mono for labels and figures.
`;

const FACT_SHEET = `Aura Historia fact sheet
========================

What it is      A global platform for search and discovery in art and antiques
Founded         2026
Based in        Leipzig, Germany
Team            Four people, across web engineering, data automation and interface design
Languages       English, German, French, Spanish and Italian
Markets         Europe and the United States first; further markets follow
AI assistants   Connects to Claude and ChatGPT through a public MCP server
Website         https://aura-historia.com

Current catalogue figures, descriptions and the brand guidelines:
https://aura-historia.com/en/press

Press contact: contact@aura-historia.com

Name: write "Aura Historia", two words, both capitalised. Aura Historia links to the original
listing; it does not sell, value or authenticate objects.

The logos in this kit may be used, unchanged, in editorial coverage of Aura Historia. They do not
imply a partnership, sponsorship or endorsement. Anything else needs our written permission.
`;

async function renderPngs(logos) {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    try {
        const page = await browser.newPage({ deviceScaleFactor: 1 });
        for (const { name, svg, box, ground } of logos) {
            const height = Math.round((PNG_WIDTH * box[3]) / box[2]);
            await page.setViewportSize({ width: PNG_WIDTH, height });
            await page.setContent(
                `<style>html,body{margin:0;background:${ground ?? "transparent"}}img{display:block;width:${PNG_WIDTH}px;height:${height}px}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}">`,
            );
            await page.locator("img").evaluate((img) => img.decode());
            await page.screenshot({
                path: join(BUILD_DIR, `${name}.png`),
                // Transparent files stay transparent; a file with its own ground is opaque to the edge.
                omitBackground: !ground,
                clip: { x: 0, y: 0, width: PNG_WIDTH, height },
            });
        }
    } finally {
        await browser.close();
    }
}

async function main() {
    rmSync(BUILD_DIR, { recursive: true, force: true });
    mkdirSync(BUILD_DIR, { recursive: true });

    const rendered = LOGOS.map(({ name, mark }) => ({
        name,
        box: mark.box,
        ground: mark.ground,
        svg: toSvg(mark),
    }));
    for (const { name, svg } of rendered) writeFileSync(join(BUILD_DIR, `${name}.svg`), svg);
    await renderPngs(rendered);

    writeFileSync(join(BUILD_DIR, "aura-historia-colours.txt"), COLOURS);
    writeFileSync(join(BUILD_DIR, "aura-historia-fact-sheet.txt"), FACT_SHEET);

    const kitFiles = [
        ...rendered.flatMap(({ name }) => [`${name}.svg`, `${name}.png`]),
        "aura-historia-colours.txt",
        "aura-historia-fact-sheet.txt",
    ];
    // -X leaves out extra file attributes; modification times are still stored, so the archive
    // changes on every run. Commit it only together with a real change to its files.
    execFileSync("zip", ["-q", "-X", "aura-historia-brand-kit.zip", ...kitFiles], {
        cwd: BUILD_DIR,
    });

    rmSync(OUTPUT_DIR, { recursive: true, force: true });
    renameSync(BUILD_DIR, OUTPUT_DIR);
    console.log(`Wrote ${kitFiles.length + 1} files to public/press/`);
}

await main();
