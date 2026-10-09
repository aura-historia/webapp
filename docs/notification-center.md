# Notification center

Notifications are private account data. `useNotifications` requests `listNotifications`
with language and an opaque cursor, maps the response through
`src/data/internal/notification/Notification.ts`, and partitions its query cache by
viewer and language. Currency preferences do not affect notification requests or
historical price snapshots.

The mapper selects a domain payload from `NotificationData.kind`. Watchlist changes
use internal `ListingPrice` and `ListingAvailability` values; nullable prices and
availability remain nullable. Monetary prices retain the immutable source currency,
and `ON_REQUEST` remains distinct from an unknown price. Search matches and
partnership approval/rejection snapshots also map before rendering. Removed audit
fields are not reconstructed.

Only `notificationId` identifies a notification for mutation. Clicking a listing
marks all of its `unseenNotificationIds` through the selected-bulk
`updateNotificationsSeen` operation (`PATCH /me/notifications`, explicit IDs plus
`seen`). Single notification actions use `updateNotificationSeen` or
`deleteNotification`. Mark-all uses `updateAllNotificationsSeen`
(`PATCH /me/notifications/all`); delete-all uses the collection DELETE.

Mutation endpoints return 204 with no notification body. After success, the hooks
update loaded notification pages and listing unread projections, then invalidate
related queries, including generated detail-query keys and saved-search matches.
Requests that fail leave caches untouched, so no optimistic rollback is necessary.
Each mutation captures its initiating account before sending the request. Cache
commits are discarded if that account is no longer active, including after pending
queries have been cancelled. Notification and other viewer-partitioned caches are
updated and invalidated only for that account. Shop-profile `sourceProductListings`
caches are included in unread-state updates and invalidation.

Pagination serializes the returned `[created timestamp, notification ID]` tuple as
JSON for the next request and stops for absent or repeated cursors. Page sizes do
not represent a global notification total; the center shows a count only after the
last page. The bell checks all loaded pages for unread notifications.

Redacted titles use the existing localized untitled label; missing images use a
placeholder. Image URLs must use HTTP or HTTPS. Missing title slugs produce no
listing link. Notification dates use localized calendar dates with the root route's
server-resolved visitor timezone (UTC fallback). SSR and the first client render
share that timezone; rendering does not read the browser timezone or current clock.

Partnership snapshots retain the canonical application ID for application
consumers. The notification UI displays their decisions; it
does not invent routes for application details.

Notifications use the existing account notification purpose described in all
five privacy-policy locales. They add no persistent browser storage, processors,
tracking, retention changes, or public caching of personalized responses.
