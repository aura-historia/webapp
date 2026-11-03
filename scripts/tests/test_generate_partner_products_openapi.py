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
        operation = self.spec["paths"][extractor.SYNC_PATH]["post"]
        operation["requestBody"]["content"]["application/json"]["examples"] = {"stale": {"value": [sample]}}
        result = extractor.extract_partner_spec(self.spec)
        example = result["paths"][extractor.SYNC_PATH]["post"]["requestBody"]["content"]["application/json"]["examples"]["stale"]["value"][0]
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
        for path in extractor.TARGET_PATHS:
            with self.subTest(path=path):
                del self.spec["paths"][path]["delete"]
                with self.assertRaises(KeyError):
                    extractor.extract_partner_spec(self.spec)
                self.setUp()
        del self.spec["components"]["schemas"]["CreateProductListingData"]
        with self.assertRaises(KeyError):
            extractor.extract_partner_spec(self.spec)
        self.setUp()
        del self.spec["components"]["schemas"]["AsyncProductListingBatchReport"]
        with self.assertRaises(KeyError):
            extractor.extract_partner_spec(self.spec)

    def test_lists_async_then_sync_batches_with_every_method_and_no_webhook(self):
        self.spec["paths"]["/v1/webhooks/woocommerce/{listingSourceId}"] = {
            "post": {"operationId": "postWoocommerceWebhook", "responses": {"204": {"description": "ok"}}},
        }
        result = extractor.extract_partner_spec(self.spec)
        self.assertEqual([extractor.ASYNC_PATH, extractor.SYNC_PATH], list(result["paths"]))
        for path in extractor.TARGET_PATHS:
            self.assertEqual(list(extractor.TARGET_METHODS), list(result["paths"][path]))
        self.assertNotIn("webhook", json.dumps(result).lower())
        self.assertNotIn("woocommerce", json.dumps(result).lower())

    def test_keeps_complete_async_admission_contract(self):
        result = extractor.extract_partner_spec(self.spec)
        for method in extractor.TARGET_METHODS:
            operation = result["paths"][extractor.ASYNC_PATH][method]
            accepted = operation["responses"]["202"]
            self.assertEqual(
                "#/components/schemas/AsyncProductListingBatchReport",
                accepted["content"]["application/json"]["schema"]["$ref"],
            )
            self.assertEqual(
                "#/components/headers/AsyncProductListingIdempotencyKey",
                accepted["headers"]["Idempotency-Key"]["$ref"],
            )
            self.assertIn(
                {"$ref": "#/components/parameters/AsyncProductListingIdempotencyKey"},
                operation["parameters"],
            )
        report = result["components"]["schemas"]["AsyncProductListingBatchReport"]
        self.assertEqual(["submissionId", "acceptedCount", "failures"], report["required"])
        self.assertIn("AsyncProductListingBatchFailure", result["components"]["schemas"])
        self.assertIn("AsyncProductListingIdempotencyKey", result["components"]["parameters"])
        self.assertIn("AsyncProductListingIdempotencyKey", result["components"]["headers"])

    def test_published_reference_matches_the_pinned_contract(self):
        import yaml

        pinned = yaml.safe_load((ROOT / "openapi/swagger.yaml").read_text(encoding="utf-8"))
        self.assertEqual(extractor.extract_partner_spec(pinned), self.spec)

    def test_retains_path_parameters_and_inherited_security(self):
        self.spec["paths"][extractor.SYNC_PATH]["parameters"] = [{"name": "listingSourceId", "in": "path"}]
        self.spec["security"] = [{"AccessTokenAuth": []}]
        del self.spec["paths"][extractor.SYNC_PATH]["post"]["security"]
        result = extractor.extract_partner_spec(self.spec)
        self.assertEqual(self.spec["security"], result["security"])
        self.assertEqual(self.spec["paths"][extractor.SYNC_PATH]["parameters"], result["paths"][extractor.SYNC_PATH]["parameters"])


if __name__ == "__main__":
    unittest.main()
