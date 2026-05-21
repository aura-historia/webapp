from __future__ import annotations

import json
from pathlib import Path
from urllib.request import urlopen

import yaml

SOURCE_URL = "https://raw.githubusercontent.com/aura-historia/internal-api/refs/heads/master/swagger.yaml"
TARGET_PATH = "/api/v1/shops/{shopId}/products"
TARGET_METHODS = ("put", "post", "patch")
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "partner-products.openapi.json"
def main() -> None:
    with urlopen(SOURCE_URL) as response:  # noqa: S310 - trusted repository source
        spec = yaml.safe_load(response.read().decode("utf-8"))

    selected_path_item = {
        method: spec["paths"][TARGET_PATH][method]
        for method in TARGET_METHODS
        if method in spec["paths"][TARGET_PATH]
    }

    used_tags = {
        tag
        for method_config in selected_path_item.values()
        for tag in method_config.get("tags", [])
    }
    filtered_tags = [tag for tag in spec.get("tags", []) if tag.get("name") in used_tags]

    slim_spec = {
        "openapi": spec["openapi"],
        "info": {
            **spec["info"],
            "title": "Aura Historia Partner Product API Reference",
            "description": (
                "Generated subset of the Aura Historia OpenAPI specification containing only "
                "the partner product batch endpoints and the components they require."
            ),
        },
        "servers": spec.get("servers", []),
        "paths": {
            TARGET_PATH: selected_path_item,
        },
        "components": spec.get("components", {}),
    }

    if filtered_tags:
        slim_spec["tags"] = filtered_tags

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(f"{json.dumps(slim_spec, indent=2)}\n", encoding="utf-8")


if __name__ == "__main__":
    main()
