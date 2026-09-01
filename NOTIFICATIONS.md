# Notifications

Real-time in-app notifications and PWA push notifications.

## What It Does

Delivers approval/approval-adjacent notifications to users in real time via Socket.IO, plus web push via the PWA service worker.

## Real-time (Socket.IO) — `src/boot/socket.js`

- Client connects to the Socket.IO server on app boot
- Listens for the `server-stxi` event
- When a notification for the current user arrives (`app === "portal_notif"` and `data.username_dest === store.authDet.username`), it:
  - Shows a `$q.notify` toast (with the notification's color/type, 10s timeout)
  - Refreshes the inbox via `getNotif()`

## Notification Center (MainLayout header bell)

Implemented in `src/layouts/MainLayout.vue`:

- **Inbox / Outbox tabs**
  - Inbox: approvals received (`amshd_stat <> 'receive'` filtered to current user)
  - Outbox: approvals sent (`amshd_stat = 'sent'`)
- **Unread badge** (count of inbox items without `readed_at`)
- **Mark all as read** → `ams/readAllNotif`
- **Search** → opens the `dataFilter.vue` dialog to filter by sender / subject
- **Load More** — paginated via `initPage`
- Clicking a notification opens the **Approval Action** in an app dialog (`viewApps` with the token URL)

## PWA Push — `src-pwa/`

- Service worker via Workbox (see `quasar.config.js` / `src-pwa/register-service-worker`)
- `register-service-worker` keeps the app installable/updatable and supports push notifications

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List inbox/outbox notifications | `ams/approveHist` (POST with filter + page) |
| Mark all as read | `ams/readAllNotif` |

## Key Files

- `src/boot/socket.js` — Socket.IO client boot
- `src/layouts/MainLayout.vue` — notification UI (`getNotif`, `onClickNotification`, `onClickReadAll`, `onClickMoreNotif`, `onClickSearchOption`)
- `src-pwa/` — service worker + manifest