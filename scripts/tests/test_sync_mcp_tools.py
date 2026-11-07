import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
module_spec = importlib.util.spec_from_file_location("sync_mcp_tools", ROOT / "scripts/sync_mcp_tools.py")
sync = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(sync)

TOOL = {
    "_meta": {
        "aura.historia/access": "public",
        "aura.historia/operationId": "getAuction",
        "aura.historia/requiredScopes": [],
    },
    "annotations": {
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
        "readOnlyHint": True,
    },
    "description": "Get one auction.",
    "inputSchema": {"properties": {"auctionId": {"type": "string"}}, "type": "object"},
    "name": "getAuction",
    "outputSchema": {"type": "object"},
    "title": "Get auction",
}


def tool(**changes):
    result = copy.deepcopy(TOOL)
    result.update(changes)
    return result


class SyncMcpToolsTests(unittest.TestCase):
    def test_keeps_only_the_members_webmcp_uses(self):
        [stripped] = sync.strip_tools([tool()])
        self.assertEqual(list(stripped), ["name", "description", "inputSchema", "annotations", "_meta"])
        self.assertEqual(stripped["inputSchema"], TOOL["inputSchema"])

    def test_keeps_the_backend_order(self):
        names = [entry["name"] for entry in sync.strip_tools([tool(name="b"), tool(name="a")])]
        self.assertEqual(names, ["b", "a"])

    def test_synced_list_is_well_formed(self):
        tools = json.loads(sync.OUTPUT.read_text(encoding="utf-8"))
        self.assertEqual(sync.strip_tools(tools), tools)
        self.assertEqual(sync.render(tools), sync.OUTPUT.read_text(encoding="utf-8"))
        self.assertTrue(any(entry["_meta"]["aura.historia/access"] == "public" for entry in tools))

    def test_rejects_invalid_snapshots(self):
        invalid = {
            "empty": [],
            "not an array": {"tools": [TOOL]},
            "duplicate name": [tool(), tool()],
            "name with a space": [tool(name="get auction")],
            "reserved prefix": [tool(name="openAuction")],
            "blank description": [tool(description=" ")],
            "non-object input": [tool(inputSchema={"type": "array"})],
            "missing readOnlyHint": [tool(annotations={})],
            "unknown access": [tool(_meta={"aura.historia/access": "partner"})],
        }
        for label, snapshot in invalid.items():
            with self.subTest(label), self.assertRaises(ValueError):
                sync.strip_tools(snapshot)


if __name__ == "__main__":
    unittest.main()
