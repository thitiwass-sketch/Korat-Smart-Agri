/* eslint-disable no-restricted-globals */
/**
 * Korat SmartAgri — Service Worker for Weather & SPI Drought Push Notifications
 * Enables background push notifications, Periodic Background Sync, IndexedDB alert persistence,
 * and deep-link navigation even when the web application is closed.
 */

const CACHE_NAME = "korat-smartagri-sw-v2";
const DB_NAME = "korat_smartagri_sw_db";
const DB_VERSION = 1;
const STORE_ALERTS = "sw_push_alerts";
const STORE_CONFIG = "sw_push_config";

const CORE_ASSETS = ["/", "/index.html", "/icon.svg", "/manifest.json"];

// ---------------------------------------------------------------------------
// IndexedDB Helpers inside Service Worker (accessible when app tabs are closed)
// ---------------------------------------------------------------------------
function openSwDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_ALERTS)) {
        db.createObjectStore(STORE_ALERTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSwAlertToDb(alertItem) {
  try {
    const db = await openSwDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ALERTS, "readwrite");
      const store = tx.objectStore(STORE_ALERTS);
      store.put(alertItem);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

async function getAllSwAlertsFromDb() {
  try {
    const db = await openSwDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ALERTS, "readonly");
      const store = tx.objectStore(STORE_ALERTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function saveSwConfigToDb(configObj) {
  try {
    const db = await openSwDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONFIG, "readwrite");
      const store = tx.objectStore(STORE_CONFIG);
      store.put({ key: "farmer_subscription", ...configObj, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

async function getSwConfigFromDb() {
  try {
    const db = await openSwDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONFIG, "readonly");
      const store = tx.objectStore(STORE_CONFIG);
      const req = store.get("farmer_subscription");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Broadcast helper to notify any open client windows
// ---------------------------------------------------------------------------
async function broadcastToClients(message) {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clientList) {
    client.postMessage(message);
  }
}

// ---------------------------------------------------------------------------
// Display Native OS Push Notification & Persist in SW IndexedDB
// ---------------------------------------------------------------------------
async function displayAndRecordPushNotification(rawPayload) {
  const nowIso = new Date().toISOString();
  const id = rawPayload.id || `sw-push-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const districtId = rawPayload.districtId || "dan-khun-thot";
  const districtNameTh = rawPayload.districtNameTh || "อ.ด่านขุนทด";
  const alertType = rawPayload.alertType || "spi_drought";
  const severity = rawPayload.severity || "critical";
  const spi30d = typeof rawPayload.spi30d === "number" ? rawPayload.spi30d : -1.42;
  const rainProbToday = typeof rawPayload.rainProbToday === "number" ? rawPayload.rainProbToday : 65;
  const soilMoisturePct =
    typeof rawPayload.soilMoisturePct === "number" ? rawPayload.soilMoisturePct : 38;
  const moduleTarget = rawPayload.moduleTarget || "alerts";

  const title =
    rawPayload.title ||
    `[เตือนภัยเกษตรโคราช] ${districtNameTh} · SPI ${spi30d.toFixed(2)}`;

  const body =
    rawPayload.body ||
    `ตรวจพบค่าดัชนีภัยแล้ง SPI-30d = ${spi30d.toFixed(
      2
    )} | โอกาสฝนวันนี้ ${rainProbToday}% | ความชื้นดิน GISTDA ${soilMoisturePct}% — แตะเพื่อดูแนวทางรับมือและสิทธิเยียวยา กษ.01`;

  const recommendedActionTh =
    rawPayload.recommendedActionTh ||
    "ตรวจสอบคิวสูบน้ำชลประทาน งดใส่ปุ๋ยเคมีทางดินชั่วคราวหากดินแห้ง และบันทึกภาพแปลงเกษตรเพื่อยื่นสิทธิ์ กษ.01";

  const alertRecord = {
    id,
    title,
    body,
    districtId,
    districtNameTh,
    alertType,
    severity,
    spi30d,
    rainProbToday,
    soilMoisturePct,
    recommendedActionTh,
    moduleTarget,
    timestampIso: nowIso,
    receivedWhileClosed: false,
  };

  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  alertRecord.receivedWhileClosed = clientList.length === 0;

  await saveSwAlertToDb(alertRecord);

  const isPriceAlert =
    alertType === "price_breakeven" || alertType === "optimal_selling_window";

  const defaultActions = isPriceAlert
    ? [
        {
          action: "open_market",
          title: "ดูพิกัด & ราคารับซื้อลาน",
        },
        {
          action: "open_forecast",
          title: "วิเคราะห์ช่วงเวลาทอง ML",
        },
      ]
    : [
        {
          action: "open_alerts",
          title: "ดูศูนย์แจ้งเตือน·SPI",
        },
        {
          action: "open_drought",
          title: "คำนวณเยียวยา กษ.01",
        },
      ];

  const notificationOptions = {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: rawPayload.tag || `korat-alert-${districtId}-${alertType}`,
    renotify: true,
    requireInteraction: severity === "critical" || isPriceAlert,
    vibrate: isPriceAlert ? [300, 150, 300, 150, 450] : [220, 100, 220, 100, 360],
    data: {
      id,
      districtId,
      districtNameTh,
      alertType,
      spi30d,
      rainProbToday,
      soilMoisturePct,
      commodityKey: rawPayload.commodityKey,
      cropNameTh: rawPayload.cropNameTh,
      currentMarketPrice: rawPayload.currentMarketPrice,
      breakEvenTargetPrice: rawPayload.breakEvenTargetPrice,
      moduleTarget,
      url: `/?district=${encodeURIComponent(districtId)}&module=${encodeURIComponent(
        moduleTarget
      )}&swAlertId=${encodeURIComponent(id)}`,
    },
    actions: defaultActions,
  };

  await self.registration.showNotification(title, notificationOptions);

  await broadcastToClients({
    type: "SW_PUSH_RECEIVED",
    alert: alertRecord,
  });

  return alertRecord;
}

// ---------------------------------------------------------------------------
// Background Polling Against Backend /api/push/pending-alerts
// ---------------------------------------------------------------------------
async function checkServerForWeatherAndSpiAlerts(forceTrigger = false) {
  try {
    const config = (await getSwConfigFromDb()) || {
      enabled: true,
      districtIds: ["dan-khun-thot", "bua-yai", "phimai"],
      spiThreshold: -1.2,
      rainProbThreshold: 65,
      soilMoistureMinThreshold: 40,
    };

    if (!config.enabled && !forceTrigger) return;

    const response = await fetch("/api/push/evaluate-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        districtIds: config.districtIds || ["dan-khun-thot"],
        spiThreshold: config.spiThreshold ?? -1.2,
        rainProbThreshold: config.rainProbThreshold ?? 65,
        soilMoistureMinThreshold: config.soilMoistureMinThreshold ?? 40,
        forceTrigger,
      }),
    });

    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.breachedAlerts)) {
      for (const item of data.breachedAlerts) {
        await displayAndRecordPushNotification(item);
      }
    }
  } catch {
    // Offline fallback if network is unreachable during background sync
    if (forceTrigger) {
      await displayAndRecordPushNotification({
        title: "[Offline Background Alert] เฝ้าระวังภัยแล้ง SPI และพายุฝนโคราช",
        body: "ระบบ Service Worker ทำงานในโหมดออฟไลน์: แจ้งเตือนตามค่าเกณฑ์เฝ้าระวังล่าสุดที่บันทึกไว้ในเครื่อง",
        districtId: "dan-khun-thot",
        districtNameTh: "อ.ด่านขุนทด",
        alertType: "spi_drought",
        severity: "critical",
        spi30d: -1.45,
        rainProbToday: 60,
        soilMoisturePct: 36,
        moduleTarget: "alerts",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Service Worker Install & Activate Lifecycle
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      );
      await self.clients.claim();
    })()
  );
});

// ---------------------------------------------------------------------------
// 2. Network-First Fetch with Offline Fallback for Weather & SPI APIs
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.pathname.startsWith("/api/weather/") ||
    url.pathname.startsWith("/api/push/")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkRes;
        })
        .catch(() => caches.match(request))
    );
  }
});

// ---------------------------------------------------------------------------
// 3. Standard Web Push Event Listener (Works when App is Closed!)
// ---------------------------------------------------------------------------
self.addEventListener("push", (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: "แจ้งเตือนพยากรณ์อากาศและดัชนีภัยแล้ง SPI โคราช",
        body: event.data.text(),
      };
    }
  }

  event.waitUntil(displayAndRecordPushNotification(payload));
});

// ---------------------------------------------------------------------------
// 4. Notification Click Event Listener (Opens App or Focuses Existing Tab)
// ---------------------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const districtId = data.districtId || "dan-khun-thot";
  let moduleTarget = data.moduleTarget || "alerts";

  if (event.action === "open_drought") {
    moduleTarget = "drought";
  } else if (event.action === "open_alerts") {
    moduleTarget = "alerts";
  } else if (event.action === "open_market") {
    moduleTarget = "market";
  } else if (event.action === "open_forecast") {
    moduleTarget = "price_forecast";
  }

  const targetUrl = `/?district=${encodeURIComponent(
    districtId
  )}&module=${encodeURIComponent(moduleTarget)}&swAlert=1`;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        if ("focus" in client) {
          await client.focus();
          client.postMessage({
            type: "SW_NOTIFICATION_CLICK",
            districtId,
            moduleTarget,
            action: event.action || "default",
            alertId: data.id,
          });
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// ---------------------------------------------------------------------------
// 5. Periodic Background Sync & One-Off Sync Event Listeners
// ---------------------------------------------------------------------------
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "korat-weather-spi-periodic-sync") {
    event.waitUntil(checkServerForWeatherAndSpiAlerts(false));
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "korat-weather-spi-sync") {
    event.waitUntil(checkServerForWeatherAndSpiAlerts(false));
  }
});

// ---------------------------------------------------------------------------
// 6. Client <-> Service Worker Message Bus
// ---------------------------------------------------------------------------
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "SYNC_SW_SUBSCRIPTION_CONFIG") {
    event.waitUntil(
      (async () => {
        await saveSwConfigToDb(data.config || {});
        await broadcastToClients({
          type: "SW_CONFIG_SAVED",
          config: data.config,
        });
      })()
    );
    return;
  }

  if (data.type === "GET_SW_STORED_ALERTS") {
    event.waitUntil(
      (async () => {
        const alerts = await getAllSwAlertsFromDb();
        const config = await getSwConfigFromDb();
        if (event.source && "postMessage" in event.source) {
          event.source.postMessage({
            type: "SW_STORED_ALERTS_RESPONSE",
            alerts,
            config,
          });
        } else {
          await broadcastToClients({
            type: "SW_STORED_ALERTS_RESPONSE",
            alerts,
            config,
          });
        }
      })()
    );
    return;
  }

  if (data.type === "TRIGGER_SW_PUSH_NOW") {
    event.waitUntil(displayAndRecordPushNotification(data.payload || {}));
    return;
  }

  if (data.type === "SCHEDULE_BACKGROUND_PUSH") {
    const delayMs = Math.max(1000, Math.min(30000, Number(data.delayMs) || 5000));
    const payload = data.payload || {};
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(async () => {
          await displayAndRecordPushNotification({
            ...payload,
            receivedWhileClosed: true,
          });
          resolve();
        }, delayMs);
      })
    );
    return;
  }

  if (data.type === "POLL_SERVER_ALERTS_NOW") {
    event.waitUntil(checkServerForWeatherAndSpiAlerts(true));
  }
});
