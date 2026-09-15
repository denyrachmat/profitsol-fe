/*
 * File: src-pwa/custom-service-worker.ts
 * VERSI: CLEANEST FIX (No Duplicate Manifest Error)
 */

/// <reference lib="webworker" />

export {};

// 1. Define Self
declare const self: ServiceWorkerGlobalScope;

// 2. DEFINE MANIFEST (HANYA BOLEH 1 KALI DI FILE INI)
// Kita pakai @ts-ignore agar TS tidak error, jadi kita tidak perlu 'declare' yang bikin duplikat.

// @ts-ignore
const manifest = self.__WB_MANIFEST;

// Cuma buat debug aja, biar variabel 'manifest' terpakai
if (manifest) {
  console.log("✅ [SW] Manifest injected");
}

// 3. Alias 'sw' untuk Logic
const sw = self as unknown as ServiceWorkerGlobalScope;

// =========================================================
// LOGIC PUSH NOTIFICATION
// =========================================================

sw.addEventListener("install", () => {
  console.log("✅ [SW] Service Worker Ter-install");
  sw.skipWaiting();
});

sw.addEventListener("activate", () => {
  console.log("✅ [SW] Service Worker Aktif");
  sw.clients.claim();
});

// FETCH (Bypass Cache agar tidak error "Port does not exist")
sw.addEventListener("fetch", (event) => {
  // Kosongkan: Biarkan request ke internet langsung
});

// PUSH (Terima Notif)
sw.addEventListener("push", (event: PushEvent) => {
  console.log("🔥 [SW] PUSH MASUK!");

  let data: any = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Pesan", body: event.data.text() };
    }
  }

  const title = data.title || "Notifikasi";
  const options: NotificationOptions = {
    body: data.body || "Cek aplikasi",
    icon: "/icons/icon-128x128.png",
    data: { url: data.url || "/" },
    requireInteraction: true,
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

// CLICK (Buka Tab)
sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  event.waitUntil(
    sw.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const windowClient = client as WindowClient;
          if (windowClient.url && windowClient.focus) {
            return windowClient.focus();
          }
        }
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(event.notification.data?.url || "/");
        }
      })
  );
});
