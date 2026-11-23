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
        expected = generator.render(generator.load_records())
        self.assertEqual(expected, generator.OUTPUT.read_text(encoding="utf-8"))

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
