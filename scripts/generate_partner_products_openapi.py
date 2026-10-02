from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

SOURCE_URL = "https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml"
TARGET_PATH = "/api/v1/listing-sources/{listingSourceId}/product-listings"
WEBHOOK_PATH = "/api/v1/webhooks/woocommerce/{listingSourceId}"
TARGET_METHODS = ("post", "patch", "put", "delete")
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "partner-products.openapi.json"


def fix_price_examples(value: object) -> None:
    """Upstream examples sometimes still use the pre-tagged asking price."""
    if isinstance(value, dict):
        price = value.get("price")
        if isinstance(price, dict) and "currency" in price and "amount" in price:
            price.setdefault("type", "MONETARY")
        for child in value.values():
            fix_price_examples(child)
    elif isinstance(value, list):
        for child in value:
            fix_price_examples(child)


def component_refs(value: object) -> set[str]:
    refs: set[str] = set()
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str):
            if not ref.startswith("#/components/"):
                raise ValueError(f"Unsupported reference: {ref}")
            refs.add(ref)
        for ref in value.get("discriminator", {}).get("mapping", {}).values():
            refs.add(ref)
        for child in value.values():
            refs.update(component_refs(child))
    elif isinstance(value, list):
        for child in value:
            refs.update(component_refs(child))
    return refs


def extract_partner_spec(spec: dict) -> dict:
    paths = {
        TARGET_PATH: {method: copy.deepcopy(spec["paths"][TARGET_PATH][method]) for method in TARGET_METHODS},
        WEBHOOK_PATH: {"post": copy.deepcopy(spec["paths"][WEBHOOK_PATH]["post"])},
    }
    for path, item in paths.items():
        if "parameters" in spec["paths"][path]:
            item["parameters"] = copy.deepcopy(spec["paths"][path]["parameters"])
    components: dict = {}
    pending = component_refs(paths)
    security = [
        operation.get("security", spec.get("security", []))
        for item in paths.values()
        for method, operation in item.items()
        if method in TARGET_METHODS
    ]
    pending.update(
        f"#/components/securitySchemes/{name}"
        for requirements in security
        for requirement in requirements
        for name in requirement
    )
    visited: set[str] = set()
    while pending:
        ref = pending.pop()
        if ref in visited:
            continue
        visited.add(ref)
        _, root, kind, name = ref.split("/")
        if root != "components":
            raise ValueError(f"Unsupported reference: {ref}")
        component = copy.deepcopy(spec["components"][kind][name])
        components.setdefault(kind, {})[name] = component
        pending.update(component_refs(component) - visited)
    result = {
        "openapi": spec["openapi"],
        "info": {
            "title": "Aura Historia Partner Listing API Reference",
            "version": spec["info"]["version"],
            "description": (
                "Synchronous listing-source batch writes and server-to-server WooCommerce webhooks. "
                "Use product-listings:write and a current grant for the target listing source. "
                "Batch HTTP 200 reports completed writes; WooCommerce HTTP 204 only acknowledges "
                "confirmed admission or an authorized no-op, not completed ingestion."
            ),
        },
        "x-source-url": SOURCE_URL,
        "x-source-contract-sha256": hashlib.sha256(
            json.dumps(spec, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest(),
        "servers": spec.get("servers", []),
        "paths": paths,
        "components": {kind: dict(sorted(entries.items())) for kind, entries in sorted(components.items())},
    }

    if "security" in spec:
        result["security"] = spec["security"]
    used_tags = {
        tag
        for item in paths.values()
        for method, operation in item.items()
        if method in TARGET_METHODS
        for tag in operation.get("tags", [])
    }
    result["tags"] = [tag for tag in spec.get("tags", []) if tag.get("name") in used_tags]
    fix_price_examples(result)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract partner docs without regenerating the client.")
    parser.add_argument("--input", type=Path, help="The exact YAML/JSON contract used for client generation")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    args = parser.parse_args()
    if args.input:
        text = args.input.read_text(encoding="utf-8")
    else:
        with urlopen(SOURCE_URL) as response:  # noqa: S310 - trusted repository source
            text = response.read().decode("utf-8")
    if text.lstrip().startswith("{"):
        spec = json.loads(text)
    else:
        import yaml

        spec = yaml.safe_load(text)
    result = extract_partner_spec(spec)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(f"{json.dumps(result, indent=2)}\n", encoding="utf-8")


if __name__ == "__main__":
    main()
