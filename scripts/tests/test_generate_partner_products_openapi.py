import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
module_spec = importlib.util.spec_from_file_location("extractor", ROOT / "scripts/generate_partner_products_openapi.py")
extractor = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(extractor)


class ExtractPartnerSpecTests(unittest.TestCase):
    def setUp(self):
        self.spec = json.loads((ROOT / "public/partner-products.openapi.json").read_text(encoding="utf-8"))

    def test_prunes_unrelated_and_transitively_resolves_components(self):
        self.spec["components"]["schemas"]["PrivateAdminData"] = {"type": "object"}
        self.spec["components"]["securitySchemes"]["UnrelatedAuth"] = {"type": "http", "scheme": "basic"}
        result = extractor.extract_partner_spec(self.spec)
        self.assertNotIn("PrivateAdminData", result["components"]["schemas"])
        self.assertNotIn("UnrelatedAuth", result["components"]["securitySchemes"])
        for ref in extractor.component_refs(result):
            _, _, kind, name = ref.split("/")
            self.assertIn(name, result["components"][kind])

    def test_repairs_prices_without_mutating_input_or_estimates(self):
        price = {"currency": "EUR", "amount": 4200}
        sample = {"sourceListingId": "test", "price": price, "priceEstimateMin": copy.deepcopy(price)}
        operation = self.spec["paths"][extractor.TARGET_PATH]["post"]
        operation["requestBody"]["content"]["application/json"]["examples"] = {"stale": {"value": [sample]}}
        result = extractor.extract_partner_spec(self.spec)
        example = result["paths"][extractor.TARGET_PATH]["post"]["requestBody"]["content"]["application/json"]["examples"]["stale"]["value"][0]
        self.assertEqual("MONETARY", example["price"]["type"])
        self.assertNotIn("type", example["priceEstimateMin"])
        self.assertNotIn("type", price)

    def test_resolves_bare_and_local_discriminator_mapping_targets(self):
        schema = self.spec["components"]["schemas"]["CreateProductListingData"]
        schema["discriminator"] = {
            "propertyName": "type",
            "mapping": {
                "bare": "DiscriminatorOnlyData",
                "local": "#/components/schemas/LocalDiscriminatorOnlyData",
            },
        }
        for name in ("DiscriminatorOnlyData", "LocalDiscriminatorOnlyData"):
            self.spec["components"]["schemas"][name] = {
                "type": "object", "properties": {"price": {"$ref": "#/components/schemas/PriceData"}},
            }
        result = extractor.extract_partner_spec(self.spec)
        for name in ("DiscriminatorOnlyData", "LocalDiscriminatorOnlyData", "PriceData"):
            self.assertIn(name, result["components"]["schemas"])
        self.assertEqual(schema["discriminator"], result["components"]["schemas"]["CreateProductListingData"]["discriminator"])

    def test_rejects_unsupported_discriminator_uri_forms(self):
        for target in ("https://example.com/spec.yaml#/PriceData", "./spec.yaml#/PriceData",
                       "spec.yaml#/components/schemas/PriceData", "#/definitions/PriceData",
                       "#/components/securitySchemes/BearerAuth"):
            with self.subTest(target=target):
                with self.assertRaisesRegex(ValueError, "Unsupported discriminator mapping reference"):
                    extractor.component_refs({"discriminator": {"mapping": {"price": target}}})

    def test_fails_if_a_required_method_or_component_is_missing(self):
        del self.spec["paths"][extractor.TARGET_PATH]["delete"]
        with self.assertRaises(KeyError):
            extractor.extract_partner_spec(self.spec)
        self.setUp()
        del self.spec["components"]["schemas"]["CreateProductListingData"]
        with self.assertRaises(KeyError):
            extractor.extract_partner_spec(self.spec)

    def test_retains_path_parameters_and_inherited_security(self):
        self.spec["paths"][extractor.TARGET_PATH]["parameters"] = [{"name": "listingSourceId", "in": "path"}]
        self.spec["security"] = [{"AccessTokenAuth": []}]
        del self.spec["paths"][extractor.TARGET_PATH]["post"]["security"]
        result = extractor.extract_partner_spec(self.spec)
        self.assertEqual(self.spec["security"], result["security"])
        self.assertEqual(self.spec["paths"][extractor.TARGET_PATH]["parameters"], result["paths"][extractor.TARGET_PATH]["parameters"])


if __name__ == "__main__":
    unittest.main()
