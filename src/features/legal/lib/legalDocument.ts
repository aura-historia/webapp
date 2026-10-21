export interface LegalHeadingAnchor {
    /** Stable fragment id, shared by the heading and its contents link. */
    readonly id: string;
    /** The heading's own numbering ("01", "7.1"), shown apart from its title. */
    readonly number?: string;
    readonly title: string;
}

export interface LegalDocument {
    /** Markdown before the first section heading: the document's opening paragraph. */
    readonly intro: string;
    /** Markdown from the first section heading on. */
    readonly body: string;
    readonly sections: LegalHeadingAnchor[];
}

const SECTION_HEADING = /^##\s+(.+?)\s*#*\s*$/;
const NUMBERED_HEADING = /^(\d+(?:\.\d+)*)\.?\s+(.+)$/;

function slugify(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Splits a heading such as "1. Controller" into its number and title. Top-level section numbers
 * are padded to two digits ("01") to line up in the contents list.
 */
export function getLegalHeadingAnchor(text: string, padNumber = true): LegalHeadingAnchor {
    const heading = text.trim();
    const match = NUMBERED_HEADING.exec(heading);
    if (!match) {
        return { id: `section-${slugify(heading)}`, title: heading };
    }
    const [, rawNumber, title] = match;
    const number = padNumber && !rawNumber.includes(".") ? rawNumber.padStart(2, "0") : rawNumber;
    return { id: `section-${rawNumber.replaceAll(".", "-")}`, number, title };
}

export function splitLegalDocument(markdown: string): LegalDocument {
    const lines = markdown.split(/\r?\n/);
    const firstSection = lines.findIndex((line) => SECTION_HEADING.test(line));
    if (firstSection === -1) {
        return { intro: "", body: markdown, sections: [] };
    }

    const intro = lines
        .slice(0, firstSection)
        .join("\n")
        .replace(/(\s|^)-{3,}\s*$/, "")
        .trim();
    const bodyLines = lines.slice(firstSection);
    const sections = bodyLines.flatMap((line) => {
        const match = SECTION_HEADING.exec(line);
        return match ? [getLegalHeadingAnchor(match[1].replace(/[*_`]/g, ""))] : [];
    });

    return { intro, body: bodyLines.join("\n"), sections };
}
