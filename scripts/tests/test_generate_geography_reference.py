import importlib.util
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
module_spec = importlib.util.spec_from_file_location(
    "geography_reference", ROOT / "scripts/generate_geography_reference.py"
)
generator = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(generator)


class GenerateGeographyReferenceTests(unittest.TestCase):
    def test_generated_tables_are_current(self):
        for path, expected in generator.outputs().items():
            self.assertEqual(expected, path.read_bytes(), path.name)

    def test_subdivision_names_use_translations_and_fall_back_to_release_names(self):
        records = generator.load_records()
        translations = generator.load_translations()
        german = generator.render_names(records, translations, "de")
        french = generator.render_names(records, translations, "fr")
        self.assertIn('"DE-BY": "Bayern",', german)
        self.assertIn('"DE-BY": "Bavière",', french)
        self.assertIn("SPDX-License-Identifier: LGPL-2.1-or-later", french)

    def test_po_parser_skips_fuzzy_and_untranslated_entries(self):
        entries = generator.parse_po(
            "#. Name for QQ-A\nmsgid \"Alpha\"\nmsgstr \"Alfa\"\n\n"
            "#. Name for QQ-B\n#, fuzzy\nmsgid \"Beta\"\nmsgstr \"Wrong\"\n\n"
            "#. Name for QQ-C\nmsgid \"Gamma\"\nmsgstr \"\"\n"
        )
        self.assertEqual({"QQ-A": ("Alpha", "Alfa")}, entries)

    def test_ignores_translations_of_outdated_release_names(self):
        records = {"2": [{"code": "QQ-A", "name": "Alpha"}]}
        names = generator.render_names(records, {"de": {"QQ-A": ("Old", "Alt")}}, "de")
        self.assertIn('"QQ-A": "Alpha",', names)

    def test_generated_tables_retain_the_source_license_notice(self):
        output = generator.OUTPUT.read_text(encoding="utf-8")
        self.assertIn("SPDX-License-Identifier: LGPL-2.1-or-later", output)
        self.assertTrue((generator.SOURCE / "LGPL-2.1-or-later.txt").is_file())

    def test_rejects_a_changed_source_release(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory)
            for part in generator.HASHES:
                shutil.copy(generator.SOURCE / f"iso_3166-{part}.json", source)
            with (source / "iso_3166-1.json").open("a", encoding="utf-8") as file:
                file.write("\n")
            with self.assertRaises(ValueError):
                generator.load_records(source)

    def test_rejects_subdivisions_of_unknown_countries(self):
        records = generator.load_records()
        records["2"] = [*records["2"], {"code": "QQ-01"}]
        with self.assertRaises(ValueError):
            generator.render(records)


if __name__ == "__main__":
    unittest.main()
