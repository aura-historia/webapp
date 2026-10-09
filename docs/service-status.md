# Service status

The site shows a notice above the header when the backend API is in maintenance or
disrupted. The admin overview shows the same check in more detail. There is no manual
switch: the notice follows the public health endpoints.

## Contract

Each check requests both public probes in parallel with `cache: "no-store"` and a 10 s
timeout:

| `GET /api/v1/health` | `GET /api/v1/ready` | Result | Visitors see |
|---|---|---|---|
| 503 | any | maintenance | maintenance notice |
| 2xx | 2xx | operational | nothing |
| 2xx | anything else | disruption | disruption notice |
| anything else | any | disruption | disruption notice |

"Anything else" includes non-2xx statuses, network failures and timeouts. Readiness
covers Postgres and the OpenSearch product index. Liveness stays 200 while those
dependencies fail, so liveness alone would miss broken search.

To announce maintenance, make `/api/v1/health` return 503. The response must carry the
API Gateway CORS headers; otherwise the browser cannot read the status and the site
shows the disruption notice instead.

## Behaviour

- Checks run only in the browser (`serviceStatusQueryOptions`). Server and first client
  render show nothing, so SSR and prerendered markup stay deterministic. The notice may
  appear shortly after load.
- A failed check is retried twice before a notice appears, so brief failures are not
  shown.
- Checks repeat every 2 minutes while operational and every 30 seconds while degraded,
  and on window focus or reconnect once older than 1 minute. Hidden tabs and offline
  browsers do not poll.
- The banner and the admin panel share one query cache entry. The admin panel adds
  per-probe status, latency, last check time and an on-demand recheck.
- Checks run from each visitor's browser. A visitor whose own connection fails while the
  browser still reports online sees the disruption notice.
