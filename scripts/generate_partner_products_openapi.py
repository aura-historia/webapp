from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
from pathlib import Path
from urllib.request import urlopen

SOURCE_URL = "https://raw.githubusercontent.com/aura-historia/backend/refs/heads/develop/docs/swagger.yaml"
SYNC_PATH = "/v1/listing-sources/{listingSourceId}/product-listings"
ASYNC_PATH = f"{SYNC_PATH}/async"
# Asynchronous submission is the recommended mode, so it leads the reference; the
# synchronous batches follow. WooCommerce webhooks belong to the plugin, not this guide.
TARGET_PATHS = (ASYNC_PATH, SYNC_PATH)
TARGET_METHODS = ("post", "patch", "put", "delete")
# Source shipping management (listing-sources:read/write) and listing delivery
# (product-listings:read/write). The shipping paths name their parameters in snake case.
SHIPPING_SOURCE_PATH = "/v1/listing-sources/{listing_source_id}"
SHIPPING_PROFILES_PATH = f"{SHIPPING_SOURCE_PATH}/shipping-profiles"
SHIPPING_PROFILE_PATH = f"{SHIPPING_PROFILES_PATH}/{{shipping_profile_id}}"
SHIPPING_PROFILE_RESTORE_PATH = f"{SHIPPING_PROFILE_PATH}/restore"
SHIPPING_DEFAULT_PATH = f"{SHIPPING_SOURCE_PATH}/shipping-default"
DELIVERY_PATH = f"{SHIPPING_SOURCE_PATH}/product-listings/by-source-id/{{source_listing_id}}/delivery"
DELIVERY_ASYNC_PATH = f"{DELIVERY_PATH}/async"
SHIPPING_OPERATIONS = {
    SHIPPING_PROFILES_PATH: ("get", "post"),
    SHIPPING_PROFILE_PATH: ("get", "put", "delete"),
    SHIPPING_PROFILE_RESTORE_PATH: ("post",),
    SHIPPING_DEFAULT_PATH: ("get", "put", "delete"),
    DELIVERY_ASYNC_PATH: ("post",),
    DELIVERY_PATH: ("get", "patch"),
}
# Every published operation in reference order: batches first, then shipping.
TARGET_OPERATIONS = {
    **{path: TARGET_METHODS for path in TARGET_PATHS},
    **SHIPPING_OPERATIONS,
}
HTTP_METHODS = ("get", "post", "patch", "put", "delete")
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


def discriminator_ref(value: str) -> str:
    if re.fullmatch(r"[A-Za-z0-9._-]+", value):
        return f"#/components/schemas/{value}"
    if re.fullmatch(r"#/components/schemas/[A-Za-z0-9._-]+", value):
        return value
    raise ValueError(f"Unsupported discriminator mapping reference: {value}")


def component_refs(value: object) -> set[str]:
    refs: set[str] = set()
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str):
            if not ref.startswith("#/components/"):
                raise ValueError(f"Unsupported reference: {ref}")
            refs.add(ref)
        for ref in value.get("discriminator", {}).get("mapping", {}).values():
            refs.add(discriminator_ref(ref))
        for child in value.values():
            refs.update(component_refs(child))
    elif isinstance(value, list):
        for child in value:
            refs.update(component_refs(child))
    return refs


def extract_partner_spec(spec: dict) -> dict:
    paths = {
        path: {method: copy.deepcopy(spec["paths"][path][method]) for method in methods}
        for path, methods in TARGET_OPERATIONS.items()
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
        if method in HTTP_METHODS
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
                "Listing-source batch writes in two modes, each with POST, PATCH, PUT and DELETE. "
                "Asynchronous submission (recommended, /async) answers HTTP 202 once entries are "
                "admitted; admitted entries are then processed for you. Synchronous batches answer "
                "HTTP 200 with completed writes and the entries that failed. Both use "
                "product-listings:write and a current grant for the target listing source. "
                "Shipping profiles and the source shipping default are managed synchronously with "
                "listing-sources:read and listing-sources:write. A listing's delivery configuration "
                "is read and changed synchronously with product-listings:read and "
                "product-listings:write, or submitted asynchronously (HTTP 202 on admission, "
                "authority checked during processing). Every shipping operation needs an "
                "administrator or a current Partnership grant for the source, and its responses "
                "are never cached. Shipping terms are advertised arrangements, never quotes."
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
        if method in HTTP_METHODS
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
