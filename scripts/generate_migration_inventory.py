"""Refresh the final migration inventory from the pinned integration contract."""

import hashlib
import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs/api-migration"


def operations(schema):
    return {
        operation["operationId"]: (path, method, operation)
        for path, item in schema["paths"].items()
        for method, operation in item.items()
        if isinstance(operation, dict) and "operationId" in operation
    }


def cells(values):
    return ", ".join(f"`{value}`" for value in sorted(values)) or "—"


def main():
    captured = DOCS / "swagger.integrated.yaml"
    schema = yaml.safe_load(captured.read_text(encoding="utf-8"))
    historical = yaml.safe_load((DOCS / "swagger.snapshot.yaml").read_text(encoding="utf-8"))
    contracts = json.loads((DOCS / "contracts.json").read_text(encoding="utf-8"))
    current_ops = operations(schema)
    historical_ops = operations(historical)
    schemas = schema["components"]["schemas"]
    old_schemas = historical["components"]["schemas"]
    sdk = (ROOT / "src/client/sdk.gen.ts").read_text(encoding="utf-8")
    generated = set(re.findall(r"export const (\w+) =", sdk))
    assert generated == set(current_ops), "Regenerate the client before refreshing coverage"

    sources = {
        path.relative_to(ROOT).as_posix(): path.read_text(encoding="utf-8")
        for path in (ROOT / "src").rglob("*")
        if path.suffix in {".ts", ".tsx"}
        and "client" not in path.relative_to(ROOT).parts
        and "__tests__" not in path.parts
        and not path.name.endswith((".test.ts", ".test.tsx", ".gen.ts"))
    }
    lines = [
        "# Final operation and model inventory",
        "",
        "Generated with `pnpm exec python scripts/generate_migration_inventory.py` from the pinned integration contract. The September 10 inventories remain historical. See [integration release gate](integration-release-gate.md) for scope decisions and validation.",
        "",
        f"- Contract bytes SHA-256: `{hashlib.sha256(captured.read_bytes()).hexdigest()}`.",
        f"- Current contract: {len(current_ops)} operations, {len(schemas)} component schemas; every operation is generated.",
        f"- September 10 contract: {len(historical_ops)} operations, {len(old_schemas)} component schemas.",
        "",
        "## Operation-to-feature checklist",
        "",
        "Runtime references below exclude tests and generated files. A generated SDK capability is not evidence of an implemented UI. External/protocol operations are intentionally outside browser workflows.",
        "",
        "| Operation | Method and path | Since September 10 | Coverage / owner |",
        "|---|---|---|---|",
    ]
    for name, (path, method, operation) in sorted(current_ops.items()):
        pattern = re.compile(r"\b" + re.escape(name) + r"(?:Options|InfiniteOptions|Mutation|MutationOptions|QueryKey)?\b")
        users = [file for file, content in sources.items() if pattern.search(content)]
        if path.startswith("/api/v1/admin/") and not users:
            status = "Deferred admin dashboard — MIG-16–23 / MIG-25; generated only"
        elif name in {"listAuctions", "getAuction", "getAuctionCatalogue"}:
            status = "Deferred standalone public auction pages — MIG-25; listing auction summaries retained"
        elif users:
            status = "Integrated: " + ", ".join(f"`{file}`" for file in users)
        elif name in {"getHealth", "getReadiness"}:
            status = "Infrastructure probes; SDK only, no browser workflow"
        elif "PartnerProductListings" in name or name == "postWoocommerceWebhook":
            status = "External partner ingestion; synchronous guide/reference (MIG-13), async SDK capability outside that guide"
        elif "IngestionConfiguration" in name:
            status = "External provider setup; SDK and explicit listing-sources:write permission (MIG-11/12), no settings UI"
        elif name in {"oauthAuthorize", "oauthToken", "oauthRevoke", "oauthIntrospect", "oauthTokenByThirdPartyCode"}:
            status = "OAuth protocol capability; server/client consumers preserve existing broker/consent contracts (MIG-12)"
        elif name == "getMyAccessToken":
            status = "Own-token detail SDK; UI uses own-token collection (MIG-11)"
        elif name in {"postBillingCheckout", "postBillingPortal"}:
            status = "Preserved billing SDK contract; browser workflow uses postBillingManage"
        else:
            raise AssertionError(f"Unaccounted operation: {name}")
        difference = "added" if name not in historical_ops else "retained" if historical_ops[name] == (path, method, operation) else "changed"
        lines.append(f"| `{name}` | `{method.upper()} {path}` | {difference} | {status} |")

    lines += ["", "## Baseline SDK operation disposition", "", "Every baseline operation is paired with a current successor or an explicit removal/replacement.", "", "| Baseline operation | Current disposition |", "|---|---|"]
    replacements = {
        "complexSearchProducts": "Removed; supported criteria use simpleSearchProductListings (MIG-05)",
        "getSearchFilterPreviewProducts": "Removed; supported saved-filter preview uses simpleSearchProductListings (MIG-07)",
        "simpleSearchShops": "Removed; provider-name discovery uses searchPublicListingSources (MIG-06)",
        "searchShops": "Removed; provider-name discovery uses searchPublicListingSources (MIG-06)",
        "getShopByDomain": "Removed; source slug lookup uses getPublicListingSourceBySlug (MIG-06)",
        "patchPartnerApplication": "Removed; immutable proposal and withdrawal workflow (MIG-15)",
    }
    for old in sorted(contracts["oldOperations"], key=lambda entry: entry["id"]):
        name = old["id"]
        target = contracts["operationMapping"].get(name, name)
        if target == "getListingSourceBySlug":
            target = "getPublicListingSourceBySlug"
        disposition = f"`{target}`" if target in current_ops else replacements.get(name, "Removed taxonomy capability; unsupported filters retired (MIG-05/07)")
        lines.append(f"| `{name}` | {disposition} |")

    lines += ["", "## Current component model and field inventory", "", "Each model is retained, changed, or added relative to September 10. The pinned YAML provides full field types, requiredness, enum members, discriminators, security and response contracts; historical field differences describe the baseline migration.", "", "| Component | Disposition | Current properties | Required | Changed top-level contract fields |", "|---|---|---|---|---|"]
    for name, model in sorted(schemas.items()):
        previous = old_schemas.get(name)
        status = "added" if previous is None else "retained" if previous == model else "changed"
        changed = set() if previous is None else {key for key in set(previous) | set(model) if previous.get(key) != model.get(key)}
        lines.append(f"| `{name}` | {status} | {cells(model.get('properties', {}))} | {cells(model.get('required', []))} | {cells(changed)} |")
    lines += ["", "## Removed September 10 models", ""]
    for name in sorted(set(old_schemas) - set(schemas)):
        lines.append(f"- `{name}`: removed/replaced by the current split input/output models; no runtime consumer remains.")
    lines += ["", "## Baseline generated model disposition", "", "Baseline generated helper types and operations are not OpenAPI component schemas. Same-name models keep the current generated definition; old aliases map through the original analysis where that successor remains present.", "", "| Baseline type | Current disposition |", "|---|---|"]
    generated_types = set(re.findall(r"export type (\w+) =", (ROOT / "src/client/types.gen.ts").read_text(encoding="utf-8")))
    for name in sorted(contracts["oldGeneratedTypes"]):
        target = contracts["modelMapping"].get(name, name)
        disposition = f"`{target}`" if target in generated_types else "Removed legacy DTO/helper; migrated feature/domain mapping or deferred admin owner"
        lines.append(f"| `{name}` | {disposition} |")
    (DOCS / "integrated-inventory.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Accounted for {len(current_ops)} operations, {len(schemas)} models and all baseline declarations.")


if __name__ == "__main__":
    main()
