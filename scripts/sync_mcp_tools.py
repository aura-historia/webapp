#!/usr/bin/env python3
"""Sync the backend's MCP tool snapshot into the website's WebMCP tool list.

The input is the backend's `docs/mcp-tools.json`: the `tools` array of an anonymous `2026-07-28`
`tools/list`, protected tools included. The output keeps only the members WebMCP registration
uses (`name`, `description`, `inputSchema`, `annotations` and `_meta`) in the backend's order;
the output schemas, most of the file, never reach the browser. Download the input from a fixed
backend commit; the sync never fetches a moving file.
"""
import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "mcp/mcp-tools.json"
KEPT_MEMBERS = ("name", "description", "inputSchema", "annotations", "_meta")
ACCESS_CLASSES = ("public", "protected")
# WebMCP tool names: 1-128 ASCII alphanumerics, `_`, `-` or `.`.
TOOL_NAME = re.compile(r"[A-Za-z0-9_.-]{1,128}")
# The webapp's own navigation tools use this prefix; `registerTool` rejects a second tool of the same name.
RESERVED_PREFIX = "open"


def strip_tools(tools: object) -> list[dict]:
    if not isinstance(tools, list) or not tools:
        raise ValueError("The snapshot must be a non-empty tools array")

    stripped = []
    names = set()
    for tool in tools:
        if not isinstance(tool, dict):
            raise ValueError("Every tool must be an object")
        name = tool.get("name")
        if not isinstance(name, str) or not TOOL_NAME.fullmatch(name):
            raise ValueError(f"Invalid tool name: {name!r}")
        if name in names:
            raise ValueError(f"Duplicate tool name: {name}")
        if name.startswith(RESERVED_PREFIX):
            raise ValueError(f"{name} uses the prefix reserved for the webapp's navigation tools")
        names.add(name)

        description = tool.get("description")
        if not isinstance(description, str) or not description.strip():
            raise ValueError(f"{name} has no description")
        input_schema = tool.get("inputSchema")
        if not isinstance(input_schema, dict) or input_schema.get("type") != "object":
            raise ValueError(f"{name} has no object input schema")
        annotations = tool.get("annotations")
        if not isinstance(annotations, dict) or not isinstance(annotations.get("readOnlyHint"), bool):
            raise ValueError(f"{name} has no readOnlyHint annotation")
        meta = tool.get("_meta")
        if not isinstance(meta, dict) or meta.get("aura.historia/access") not in ACCESS_CLASSES:
            raise ValueError(f"{name} has no aura.historia/access class")

        stripped.append({member: tool[member] for member in KEPT_MEMBERS})
    return stripped


def render(tools: object) -> str:
    return json.dumps(strip_tools(tools), indent=2, ensure_ascii=False) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="The backend's docs/mcp-tools.json")
    parser.add_argument("--check", action="store_true", help="Verify the synced list without writing it")
    arguments = parser.parse_args()

    generated = render(json.loads(arguments.input.read_text(encoding="utf-8"))).encode("utf-8")
    if arguments.check:
        if not OUTPUT.is_file() or OUTPUT.read_bytes() != generated:
            raise SystemExit("mcp/mcp-tools.json is stale; run scripts/sync_mcp_tools.py --input <snapshot>")
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_bytes(generated)


if __name__ == "__main__":
    main()
