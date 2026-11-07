# DNS for AI Discovery (DNS-AID)

Aura Historia announces its public MCP server in DNS, following
[DNS for AI Discovery](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
(draft-02) and [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) SVCB records. An agent that knows
the domain finds the server with one DNS query. The records live in the Cloudflare DNS zone for
`aura-historia.com`, not in this repository. This document is the source of truth for what the zone
publishes. It complements `public/llms.txt` and the agent discovery documents the website publishes
(see `docs/architecture-guidelines.md#agent-discovery`). Two [optional records](#optional-records)
point to the website's AI catalog.

## Record

```dns
_mcp._agents.aura-historia.com. 3600 IN SVCB 1 mcp.aura-historia.com. alpn="mcp,h2" port=443 mandatory=alpn,port
```

| Field | Value | Reason |
|---|---|---|
| Owner | `_mcp._agents.aura-historia.com` | The `_agents` entry point for an MCP agent. `mcp.aura-historia.com` is a CNAME to CloudFront and cannot hold an SVCB record, so this name is the primary owner. |
| Priority | `1` | ServiceMode: the record carries the endpoint itself, not an alias. |
| TargetName | `mcp.aura-historia.com.` | The MCP host. Its TLS certificate covers this name, which has no underscore. |
| `alpn` | `"mcp,h2"` | One protocol suite: MCP over HTTP/2, the only HTTP version the CloudFront distribution advertises. |
| `port` | `443` | HTTPS. |
| `mandatory` | `alpn,port` | Clients that do not implement these keys skip the record (RFC 9460, section 8). |

The record carries host and port, not the path. The MCP endpoint is `https://mcp.aura-historia.com/v1`;
clients learn the path from `llms.txt`, the [MCP documentation](https://docs.api.aura-historia.com/mcp.md)
or the [protected resource metadata](https://mcp.aura-historia.com/.well-known/oauth-protected-resource/v1).

Deliberately not published:

- `ipv4hint` and `ipv6hint`: CloudFront addresses change, and stale hints would misdirect clients.
- `_a2a._agents`: Aura Historia runs no A2A agent. Publish records only for endpoints that exist.
- DNS-AID custom keys (`cap`, `cap-sha256`, `bap`, `well-known`) on `_mcp._agents`: the record names
  no capability descriptor. If one is added, use numeric private-use keys until IANA assigns code
  points. The reference implementation, [dns-aid-core](https://github.com/dns-aid/dns-aid-core), uses
  `key65400` (`cap`), `key65401` (`cap-sha256`), `key65402` (`bap`) and `key65409` (`well-known`).
  Update `cap-sha256` with every change to the descriptor.
- Staging: `mcp.stage.aura-historia.com` does not resolve publicly, so it gets no record.

## Optional records

The website publishes the backend's AI catalog ([Agentic Resource Discovery](https://agenticresourcediscovery.org/))
at `https://aura-historia.com/.well-known/ai-catalog.json`. It lists the MCP server card, the OpenAPI
document and the agent skills index, so it is Aura Historia's machine-readable agent index. Two
records can point to it. Both are optional operator steps: agents and scanners already find the
catalog at its well-known path and through the `<link rel="ai-catalog">` in every page head. Publish
them for production only, once the catalog is live there; the zone must stay DNSSEC-signed.

### Agent index

```dns
_index._agents.aura-historia.com. 3600 IN SVCB 1 aura-historia.com. alpn="h2" port=443 key65409="/.well-known/ai-catalog.json" mandatory=alpn,port
```

| Field | Value | Reason |
|---|---|---|
| Owner | `_index._agents.aura-historia.com` | The DNS-AID entry point for an organisation's agent index (draft-02, section 3.2). |
| Priority | `1` | ServiceMode. |
| TargetName | `aura-historia.com.` | The website, which serves the catalog. DNS-AID requires a TargetName without underscores, because clients verify the index host's public TLS certificate. |
| `alpn` | `"h2"` | HTTPS over HTTP/2. Add `h3` only while HTTP/3 is enabled for the zone. |
| `port` | `443` | HTTPS. |
| `key65409` | `"/.well-known/ai-catalog.json"` | DNS-AID's `well-known` parameter, as the reference implementation numbers it: the record carries no path, so this names the catalog. Not mandatory, so clients that ignore it still use the record. |
| `mandatory` | `alpn,port` | As for `_mcp._agents`. |

### ARD catalog pointer

```dns
_catalog._agents.aura-historia.com. 3600 IN TXT "url=https://aura-historia.com/.well-known/ai-catalog.json"
```

The [isitagentready.com](https://isitagentready.com) `ard` check reports this record as an
additional discovery mechanism; it passes on the well-known path alone. ARD 0.91 itself describes
DNS discovery through SVCB records such as `_entries._agents`, which Aura Historia does not publish.

## DNSSEC

The zone must be DNSSEC-signed so that validating resolvers return the record as authenticated (the
`AD` flag). Cloudflare hosts the zone. The domain is registered with Namecheap, which places the DS
record in `.com`.

1. Cloudflare dashboard → `aura-historia.com` → DNS → Settings → enable DNSSEC. Copy the DS values
   Cloudflare shows: key tag, algorithm (13), digest type (2) and digest.
2. Namecheap → Domain List → `aura-historia.com` → Manage → Advanced DNS → DNSSEC → add a DS record
   with those values.
3. Wait until Cloudflare reports DNSSEC as active, then verify (below).

Never disable DNSSEC in Cloudflare or move the zone to other nameservers while the DS record is still
at Namecheap. Validating resolvers would then reject every name in the domain, including the website,
the API and email. Remove the DS record at Namecheap first, wait at least one day (the `.com` DS TTL),
then change Cloudflare.

## Publish or change the record

Cloudflare dashboard → DNS → Records → Add record:

- Type `SVCB`, name `_mcp._agents`, TTL 1 hour
- Priority `1`, target `mcp.aura-historia.com.`
- Value `alpn="mcp,h2" port=443 mandatory=alpn,port`

Or with the Cloudflare API, using a token with DNS edit permission for the zone:

```bash
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" --data '{"type":"SVCB","name":"_mcp._agents.aura-historia.com","ttl":3600,"data":{"priority":1,"target":"mcp.aura-historia.com.","value":"alpn=\"mcp,h2\" port=443 mandatory=alpn,port"}}'
```

Change the record when the MCP host, port or HTTP versions change; for example, add `h3` to `alpn`
once the distribution offers HTTP/3. Update `public/llms.txt` in the same change: both must name the
same MCP host.

The optional records, if published, the same way:

- Type `SVCB`, name `_index._agents`, TTL 1 hour, priority `1`, target `aura-historia.com.`, value
  `alpn="h2" port=443 key65409="/.well-known/ai-catalog.json" mandatory=alpn,port`
- Type `TXT`, name `_catalog._agents`, TTL 1 hour, content
  `"url=https://aura-historia.com/.well-known/ai-catalog.json"`

```bash
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" --data '{"type":"SVCB","name":"_index._agents.aura-historia.com","ttl":3600,"data":{"priority":1,"target":"aura-historia.com.","value":"alpn=\"h2\" port=443 key65409=\"/.well-known/ai-catalog.json\" mandatory=alpn,port"}}'
```

```bash
curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" --data '{"type":"TXT","name":"_catalog._agents.aura-historia.com","ttl":3600,"content":"\"url=https://aura-historia.com/.well-known/ai-catalog.json\""}'
```

Remove both records if the website stops publishing the AI catalog, and change them with its path.

## Verify

```bash
curl -sS -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=_mcp._agents.aura-historia.com&type=SVCB&do=1'
```

Expect `"Status":0`, one SVCB answer with the record above, and `"AD":true` once DNSSEC is active.

```bash
curl -sS -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=aura-historia.com&type=DS'
```

Expect one DS answer that matches the values Cloudflare shows.

If the optional records are published:

```bash
curl -sS -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=_index._agents.aura-historia.com&type=SVCB&do=1'
```

```bash
curl -sS -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=_catalog._agents.aura-historia.com&type=TXT&do=1'
```

Expect one answer each, with `"AD":true`.

The [isitagentready.com](https://isitagentready.com) scanner checks the same names over DNS over HTTPS.
`checks.discoverability.dnsAid.status` in its scan result should be `"pass"`:

```bash
curl -sS -X POST https://isitagentready.com/api/scan -H 'Content-Type: application/json' -d '{"url":"https://aura-historia.com"}'
```
