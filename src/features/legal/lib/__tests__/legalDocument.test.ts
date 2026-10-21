import { describe, expect, it } from "vitest";
import { getLegalHeadingAnchor, splitLegalDocument } from "../legalDocument.ts";

describe("getLegalHeadingAnchor", () => {
    it("pads top-level section numbers and keeps the title apart", () => {
        expect(getLegalHeadingAnchor("1. Controller")).toEqual({
            id: "section-1",
            number: "01",
            title: "Controller",
        });
    });

    it("keeps subsection numbers as written", () => {
        expect(getLegalHeadingAnchor("7.1 Withdrawal Instructions", false)).toEqual({
            id: "section-7-1",
            number: "7.1",
            title: "Withdrawal Instructions",
        });
    });

    it("slugs unnumbered headings without diacritics", () => {
        expect(getLegalHeadingAnchor("Öffentliche Quellen & Haftung")).toEqual({
            id: "section-offentliche-quellen-haftung",
            title: "Öffentliche Quellen & Haftung",
        });
    });
});

describe("splitLegalDocument", () => {
    it("separates the opening paragraph, the body and its sections", () => {
        const document = splitLegalDocument(
            "Intro text.\n\n---\n\n## 1. First\n\nBody.\n\n### 1.1 Sub\n\n## 2. Second\n",
        );
        expect(document.intro).toBe("Intro text.");
        expect(document.body.startsWith("## 1. First")).toBe(true);
        expect(document.sections.map((section) => section.title)).toEqual(["First", "Second"]);
    });

    it("keeps a document without sections whole", () => {
        expect(splitLegalDocument("Only text.")).toEqual({
            intro: "",
            body: "Only text.",
            sections: [],
        });
    });
});
