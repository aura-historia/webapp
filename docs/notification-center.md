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

Pagination serializes the returned `[created timestamp, notification ID]` tuple as
JSON for the next request and stops for absent or repeated cursors. Page sizes do
not represent a global notification total; the center shows a count only after the
last page. The bell checks all loaded pages for unread notifications.

Redacted titles use the existing localized untitled label; missing images use a
placeholder. Image URLs must use HTTP or HTTPS. Missing title slugs produce no
listing link. Notification dates use localized calendar dates in UTC, so server
and client rendering do not depend on the current clock or host timezone.

Partnership snapshots retain the canonical application ID for the application
migration to consume. The existing notification UI displays their decisions; it
does not invent routes for application details.

This migration uses the existing account notification purpose described in all
five privacy-policy locales. It adds no persistent browser storage, processors,
tracking, retention changes, or public caching of personalized responses.
