import { useEffect, useState, useCallback } from "react";
import {
  KORAT_DISTRICTS,
  KoratDistrict,
  CommodityKey,
} from "../data/koratAgriData";
import { thresholdAlertStore } from "./thresholdAlertStore";

export type SwAlertType =
  | "spi_drought"
  | "heavy_rain"
  | "soil_moisture"
  | "combined"
  | "price_breakeven"
  | "optimal_selling_window";

export interface SwBackgroundAlertItem {
  id: string;
  title: string;
  body: string;
  districtId: string;
  districtNameTh: string;
  alertType: SwAlertType;
  severity: "critical" | "warning";
  spi30d: number;
  rainProbToday: number;
  soilMoisturePct: number;
  recommendedActionTh: string;
  moduleTarget: string;
  timestampIso: string;
  receivedWhileClosed?: boolean;
  commodityKey?: CommodityKey;
  cropNameTh?: string;
  currentMarketPrice?: number;
  breakEvenTargetPrice?: number;
  optimalSellingWindowTh?: string;
  gainProfitBahtPerTon?: number;
}

export interface SwSubscriptionConfig {
  enabled: boolean;
  districtIds: string[];
  spiThreshold: number;
  rainProbThreshold: number;
  soilMoistureMinThreshold: number;
  periodicSyncEnabled: boolean;
  // Mobile Push Alert for Market Prices & Selling Windows
  priceAlertsEnabled: boolean;
  selectedCropForAlert: CommodityKey;
  breakEvenTargetPrice: number;
  optimalWindowNotify: boolean;
}

export interface SwRegistrationStatus {
  supported: boolean;
  registered: boolean;
  activeState: "installing" | "waiting" | "active" | "unsupported" | "error";
  scope: string;
  permission: NotificationPermission | "unsupported";
  pushSubscribed: boolean;
  periodicSyncSupported: boolean;
  lastSyncedAtTh: string;
  storedAlerts: SwBackgroundAlertItem[];
  config: SwSubscriptionConfig;
}

const LOCAL_SW_CONFIG_KEY = "korat_smartagri_sw_push_config_v1";
const LOCAL_SW_ALERTS_KEY = "korat_smartagri_sw_push_alerts_v1";

const DEFAULT_SW_CONFIG: SwSubscriptionConfig = {
  enabled: true,
  districtIds: ["dan-khun-thot", "bua-yai", "phimai", "pak-chong"],
  spiThreshold: -1.2,
  rainProbThreshold: 65,
  soilMoistureMinThreshold: 40,
  periodicSyncEnabled: true,
  priceAlertsEnabled: true,
  selectedCropForAlert: "cassava_fresh",
  breakEvenTargetPrice: 2.85,
  optimalWindowNotify: true,
};

function loadInitialSwConfig(): SwSubscriptionConfig {
  try {
    const raw = localStorage.getItem(LOCAL_SW_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SW_CONFIG, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SW_CONFIG;
}

function loadInitialSwAlerts(): SwBackgroundAlertItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_SW_ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    {
      id: "sw-seed-price-breakeven",
      title: "[SW Push · แตะจุดคุ้มทุน Break-even] มันสำปะหลังสดแตะ 3.25 บ./กก.",
      body: "ราคารับซื้อโรงแป้งเสิงสาง-ครบุรี พุ่งทะลุจุดคุ้มทุนเป้าหมาย (2.85 บ./กก.) โดยให้กำไรสุทธิส่วนเพิ่มกว่า +฿400/ตัน — แตะเพื่อดูเส้นทางและคิวเท",
      districtId: "soeng-sang",
      districtNameTh: "อ.เสิงสาง",
      alertType: "price_breakeven",
      severity: "warning",
      spi30d: -0.45,
      rainProbToday: 30,
      soilMoisturePct: 54,
      commodityKey: "cassava_fresh",
      cropNameTh: "มันสำปะหลังสด (เชื้อแป้ง 25%)",
      currentMarketPrice: 3.25,
      breakEvenTargetPrice: 2.85,
      gainProfitBahtPerTon: 400,
      recommendedActionTh:
        "ราคาตลาดแตะจุดคุ้มทุนและให้กำไรสุทธิสูงสุดรอบสัปดาห์ แนะนำตรวจสอบคิวโรงงานแป้งมันและทยอยขายล็อตแรก",
      moduleTarget: "market",
      timestampIso: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      receivedWhileClosed: true,
    },
    {
      id: "sw-seed-optimal-window",
      title: "[SW Push · ช่วงเวลาทอง Optimal Window] แนะนำขายผลผลิตล็อตแรก",
      body: "แบบจำลอง AI คาดการณ์เข้าสู่ 'ช่วงเวลาทอง' ที่โรงแป้งกำลังแย่งซื้อหัวมันสดก่อนช่วงเทศกาลตรุษจีน คิวเทยังไม่แออัด",
      districtId: "dan-khun-thot",
      districtNameTh: "อ.ด่านขุนทด",
      alertType: "optimal_selling_window",
      severity: "warning",
      spi30d: -1.35,
      rainProbToday: 25,
      soilMoisturePct: 34,
      commodityKey: "cassava_fresh",
      cropNameTh: "มันสำปะหลังสด",
      currentMarketPrice: 3.12,
      breakEvenTargetPrice: 2.85,
      optimalSellingWindowTh: "ปลายเดือนพฤศจิกายน – ธันวาคม (หลีกเลี่ยงช่วงขุดชนกัน ม.ค.–ก.พ.)",
      recommendedActionTh:
        "นำผลผลิตออกขายช่วงต้นหีบเพื่อหลีกเลี่ยงคิวนาน 8-14 ชม. และราคาอ่อนตัวช่วง ม.ค.-ก.พ.",
      moduleTarget: "price_forecast",
      timestampIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      receivedWhileClosed: true,
    },
    {
      id: "sw-seed-drought-dkt",
      title: "[Service Worker Background] เตือนภัยแล้ง SPI วิกฤต · อ.ด่านขุนทด",
      body: "ดัชนีภัยแล้ง SPI-30d = -1.35 (ต่ำกว่าเกณฑ์ -1.20) | ความชื้นดิน 34% — แนะนำสำรองน้ำและตรวจสอบสิทธิ์เยียวยา กษ.01",
      districtId: "dan-khun-thot",
      districtNameTh: "อ.ด่านขุนทด",
      alertType: "spi_drought",
      severity: "critical",
      spi30d: -1.35,
      rainProbToday: 25,
      soilMoisturePct: 34,
      recommendedActionTh:
        "งดใส่ปุ๋ยเคมีทางดินชั่วคราว คลุมโคนต้นมันสำปะหลัง และบันทึกภาพแปลงเกษตรเพื่อยื่นคำร้อง กษ.01",
      moduleTarget: "drought",
      timestampIso: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      receivedWhileClosed: true,
    },
    {
      id: "sw-seed-spi-buayai",
      title: "[Service Worker Background] เฝ้าระวังภัยแล้งรุนแรง · อ.บัวใหญ่",
      body: "ดัชนีภัยแล้ง SPI-30d = -1.64 | โอกาสฝน 20% | ความชื้นดิน GISTDA 28% — แจ้งเตือนอัตโนมัติขณะปิดแอปพลิเคชัน",
      districtId: "bua-yai",
      districtNameTh: "อ.บัวใหญ่",
      alertType: "spi_drought",
      severity: "critical",
      spi30d: -1.64,
      rainProbToday: 20,
      soilMoisturePct: 28,
      recommendedActionTh:
        "ประสานคิวสูบน้ำหมุนเวียนและตรวจสอบเกณฑ์เงินช่วยเหลือเกษตรกรผู้ประสบภัยพิบัติ กษ.01",
      moduleTarget: "drought",
      timestampIso: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      receivedWhileClosed: true,
    },
  ];
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class ServiceWorkerPushManager {
  private listeners = new Set<() => void>();
  private registration: ServiceWorkerRegistration | null = null;
  private navigationClickCallback:
    | ((districtId: string, moduleTarget: string) => void)
    | null = null;

  private status: SwRegistrationStatus = {
    supported:
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "Notification" in window,
    registered: false,
    activeState: "installing",
    scope: "/",
    permission:
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported",
    pushSubscribed: false,
    periodicSyncSupported: false,
    lastSyncedAtTh: new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    storedAlerts: loadInitialSwAlerts(),
    config: loadInitialSwConfig(),
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.initServiceWorker();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) {
      l();
    }
  }

  public getStatus(): SwRegistrationStatus {
    return this.status;
  }

  public setNavigationClickHandler(
    cb: (districtId: string, moduleTarget: string) => void
  ) {
    this.navigationClickCallback = cb;
  }

  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      this.status = {
        ...this.status,
        supported: false,
        activeState: "unsupported",
      };
      this.notify();
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      this.registration = reg;

      const periodicSyncSupported = "periodicSync" in reg;
      const activeWorker = reg.active || reg.waiting || reg.installing;
      const state = activeWorker ? activeWorker.state : "active";

      this.status = {
        ...this.status,
        supported: true,
        registered: true,
        activeState:
          state === "activated" || state === "activating"
            ? "active"
            : state === "installed"
            ? "waiting"
            : "installing",
        scope: reg.scope,
        permission:
          "Notification" in window ? Notification.permission : "unsupported",
        periodicSyncSupported,
        lastSyncedAtTh: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
      this.notify();

      navigator.serviceWorker.ready.then(async (readyReg) => {
        this.registration = readyReg;
        this.status = {
          ...this.status,
          registered: true,
          activeState: "active",
          periodicSyncSupported: "periodicSync" in readyReg,
        };
        this.notify();

        // Sync initial config to SW IndexedDB & Backend
        await this.syncConfigToServiceWorker(this.status.config);
        this.requestStoredAlertsFromSw();
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === "SW_PUSH_RECEIVED" && data.alert) {
          this.appendAlertRecord(data.alert);
        } else if (
          data.type === "SW_STORED_ALERTS_RESPONSE" &&
          Array.isArray(data.alerts)
        ) {
          if (data.alerts.length > 0) {
            this.mergeStoredAlerts(data.alerts);
          }
        } else if (data.type === "SW_NOTIFICATION_CLICK") {
          if (this.navigationClickCallback) {
            this.navigationClickCallback(
              data.districtId || "dan-khun-thot",
              data.moduleTarget || "alerts"
            );
          }
        }
      });

      return reg;
    } catch {
      this.status = {
        ...this.status,
        activeState: "error",
      };
      this.notify();
      return null;
    }
  }

  private appendAlertRecord(alert: SwBackgroundAlertItem) {
    const exists = this.status.storedAlerts.some((a) => a.id === alert.id);
    const updated = exists
      ? this.status.storedAlerts.map((a) => (a.id === alert.id ? alert : a))
      : [alert, ...this.status.storedAlerts].slice(0, 30);

    try {
      localStorage.setItem(LOCAL_SW_ALERTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    this.status = {
      ...this.status,
      storedAlerts: updated,
      lastSyncedAtTh: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    this.notify();

    // Also mirror into in-app global toast stack so user sees immediate visual confirmation
    const distObj =
      KORAT_DISTRICTS.find((d) => d.id === alert.districtId) ||
      KORAT_DISTRICTS[0];
    thresholdAlertStore.pushToasts([
      {
        id: alert.id,
        districtId: distObj.id,
        districtNameTh: distObj.nameTh,
        cropFocus: distObj.primaryCrops[0] || "พืชเศรษฐกิจหลัก",
        category:
          alert.alertType === "heavy_rain"
            ? "rain_prob_high"
            : "soil_moisture_low",
        severity: alert.severity,
        title: alert.title,
        message: alert.body,
        metricLabel:
          alert.alertType === "spi_drought"
            ? "ดัชนีภัยแล้ง SPI-30d (Service Worker Push)"
            : alert.alertType === "heavy_rain"
            ? "โอกาสเกิดพายุฝน (Service Worker Push)"
            : "ความชื้นดิน GISTDA (Service Worker Push)",
        actualValueText:
          alert.alertType === "spi_drought"
            ? `SPI ${alert.spi30d.toFixed(2)}`
            : alert.alertType === "heavy_rain"
            ? `${alert.rainProbToday}%`
            : `${alert.soilMoisturePct}%`,
        thresholdValueText:
          alert.alertType === "spi_drought"
            ? `เกณฑ์ ≤ ${this.status.config.spiThreshold.toFixed(2)}`
            : alert.alertType === "heavy_rain"
            ? `เกณฑ์ ≥ ${this.status.config.rainProbThreshold}%`
            : `เกณฑ์ ≤ ${this.status.config.soilMoistureMinThreshold}%`,
        deltaText: "แจ้งเตือนผ่าน Service Worker",
        remedialAction: alert.recommendedActionTh,
        createdAtIso: alert.timestampIso || new Date().toISOString(),
        autoDismissMs: 9000,
        isSimulated: Boolean(alert.receivedWhileClosed),
      },
    ]);
  }

  private mergeStoredAlerts(swAlerts: SwBackgroundAlertItem[]) {
    const map = new Map<string, SwBackgroundAlertItem>();
    for (const item of [...swAlerts, ...this.status.storedAlerts]) {
      map.set(item.id, item);
    }
    const merged = Array.from(map.values())
      .sort(
        (a, b) =>
          new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
      )
      .slice(0, 30);

    try {
      localStorage.setItem(LOCAL_SW_ALERTS_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }

    this.status = {
      ...this.status,
      storedAlerts: merged,
    };
    this.notify();
  }

  public requestStoredAlertsFromSw() {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "GET_SW_STORED_ALERTS",
      });
    } else if (this.registration?.active) {
      this.registration.active.postMessage({
        type: "GET_SW_STORED_ALERTS",
      });
    }
  }

  public async requestNotificationPermissionAndSubscribe(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.status = {
        ...this.status,
        permission: perm,
      };
      this.notify();

      const reg =
        this.registration || (await navigator.serviceWorker.ready.catch(() => null));
      if (reg && "pushManager" in reg && perm === "granted") {
        try {
          const vapidRes = await fetch("/api/push/vapid-public-key");
          const vapidData = await vapidRes.json();
          const existingSub = await reg.pushManager.getSubscription();
          const sub =
            existingSub ||
            (await reg.pushManager
              .subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                  vapidData.publicKey
                ) as unknown as BufferSource,
              })
              .catch(() => null));

          this.status = {
            ...this.status,
            pushSubscribed: Boolean(sub) || perm === "granted",
          };
          this.notify();
        } catch {
          this.status = {
            ...this.status,
            pushSubscribed: perm === "granted",
          };
          this.notify();
        }
      }

      await this.syncConfigToServiceWorker(this.status.config);
      return perm === "granted";
    } catch {
      return false;
    }
  }

  public async syncConfigToServiceWorker(newConfig: SwSubscriptionConfig) {
    this.status = {
      ...this.status,
      config: newConfig,
      lastSyncedAtTh: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    try {
      localStorage.setItem(LOCAL_SW_CONFIG_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    this.notify();

    // Post config to Service Worker IndexedDB
    const targetSw =
      navigator.serviceWorker?.controller || this.registration?.active;
    if (targetSw) {
      targetSw.postMessage({
        type: "SYNC_SW_SUBSCRIPTION_CONFIG",
        config: newConfig,
      });
    }

    // Register Periodic Background Sync / Sync if supported
    if (this.registration) {
      try {
        const anyReg = this.registration as unknown as {
          periodicSync?: {
            register: (
              tag: string,
              options: { minInterval: number }
            ) => Promise<void>;
          };
          sync?: { register: (tag: string) => Promise<void> };
        };
        if (anyReg.periodicSync && newConfig.periodicSyncEnabled) {
          await anyReg.periodicSync.register(
            "korat-weather-spi-periodic-sync",
            {
              minInterval: 15 * 60 * 1000,
            }
          );
        }
        if (anyReg.sync) {
          await anyReg.sync.register("korat-weather-spi-sync");
        }
      } catch {
        // Periodic sync may require installed PWA permission; gracefully ignore
      }
    }

    // Also register subscription config on Express backend
    try {
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "korat-farmer-web-client",
          districtIds: newConfig.districtIds,
          spiThreshold: newConfig.spiThreshold,
          rainProbThreshold: newConfig.rainProbThreshold,
          soilMoistureMinThreshold: newConfig.soilMoistureMinThreshold,
        }),
      });
    } catch {
      // ignore network error in offline mode
    }
  }

  public async triggerServiceWorkerAlertForDistrict(
    district: KoratDistrict,
    alertMode: "spi_drought" | "heavy_rain" | "soil_moisture" = "spi_drought",
    delayMs = 0
  ) {
    const title =
      alertMode === "spi_drought"
        ? `[SW Push · ภัยแล้ง SPI] ${district.nameTh} (SPI ${district.spi30d.toFixed(
            2
          )})`
        : alertMode === "heavy_rain"
        ? `[SW Push · พายุฝนฟ้าคะนอง] ${district.nameTh} (โอกาสฝน ${district.rainProbToday}%)`
        : `[SW Push · ความชื้นดินวิกฤต] ${district.nameTh} (ความชื้นดิน ${district.gistdaSoilMoisturePct}%)`;

    const body =
      alertMode === "spi_drought"
        ? `แจ้งเตือนผ่าน Service Worker: ดัชนีภัยแล้ง SPI-30d ของ ${
            district.nameTh
          } อยู่ที่ ${district.spi30d.toFixed(2)} | ความชื้นดิน ${
            district.gistdaSoilMoisturePct
          }% | พืชหลัก: ${district.primaryCrops.join(", ")}`
        : alertMode === "heavy_rain"
        ? `แจ้งเตือนผ่าน Service Worker: พยากรณ์ฝนวันนี้ ${district.rainProbToday}% (สะสม 14 วัน ${district.forecastRain14dMm} มม.) ใน ${district.nameTh} งดพ่นปุ๋ยทางใบและสารชีวภัณฑ์`
        : `แจ้งเตือนผ่าน Service Worker: ความชื้นดินระดับรากใน ${district.nameTh} อยู่ที่ ${district.gistdaSoilMoisturePct}% ควรเปิดระบบน้ำหยดหรือสูบน้ำเสริม`;

    const payload: SwBackgroundAlertItem = {
      id: `sw-push-${district.id}-${Date.now()}`,
      title,
      body,
      districtId: district.id,
      districtNameTh: district.nameTh,
      alertType: alertMode,
      severity:
        district.spi30d <= -1.2 || district.gistdaSoilMoisturePct <= 38
          ? "critical"
          : "warning",
      spi30d: district.spi30d,
      rainProbToday: district.rainProbToday,
      soilMoisturePct: district.gistdaSoilMoisturePct,
      recommendedActionTh:
        alertMode === "spi_drought"
          ? `ตรวจสอบคิวสูบน้ำชลประทานใน ${district.nameTh} และประเมินสิทธิ์เงินเยียวยาเกษตรกรผู้ประสบภัยพิบัติ กษ.01`
          : `ติดตามเรดาร์ฝนและความชื้นดินรายชั่วโมงใน ${district.nameTh} เพื่อวางแผนการจัดการแปลงเกษตร`,
      moduleTarget: alertMode === "spi_drought" ? "drought" : "alerts",
      timestampIso: new Date(Date.now() + delayMs).toISOString(),
      receivedWhileClosed: delayMs > 0,
    };

    const targetSw =
      navigator.serviceWorker?.controller || this.registration?.active;

    if (delayMs > 0) {
      if (targetSw) {
        targetSw.postMessage({
          type: "SCHEDULE_BACKGROUND_PUSH",
          delayMs,
          payload,
        });
      } else {
        setTimeout(() => {
          this.appendAlertRecord(payload);
        }, delayMs);
      }
      return;
    }

    if (targetSw) {
      targetSw.postMessage({
        type: "TRIGGER_SW_PUSH_NOW",
        payload,
      });
    } else {
      this.appendAlertRecord(payload);
    }
  }

  public async triggerPriceBreakevenAlert(
    commodityKey: CommodityKey,
    cropNameTh: string,
    currentPrice: number,
    targetPrice: number,
    district: KoratDistrict,
    delayMs = 0
  ) {
    const isProfitable = currentPrice >= targetPrice;
    const priceDiff = Number((currentPrice - targetPrice).toFixed(2));
    const title = isProfitable
      ? `[SW Push · ทะลุจุดคุ้มทุน] ${cropNameTh} แตะ ฿${currentPrice.toFixed(2)}`
      : `[SW Push · ใกล้จุดคุ้มทุน] ${cropNameTh} ฿${currentPrice.toFixed(2)}`;

    const body = isProfitable
      ? `ราคารับซื้อใน ${district.nameTh} อยู่ที่ ฿${currentPrice.toFixed(2)} สูงกว่าจุดคุ้มทุน ${targetPrice.toFixed(2)} (+฿${priceDiff}) กำไรสุทธิคาดการณ์เกินเป้า แนะนำตรวจสอบคิวโรงงานและเตรียมผลผลิต`
      : `ราคาตลาดขยับเข้าใกล้จุดคุ้มทุน (${targetPrice.toFixed(2)} บ.) ปัจจุบันอยู่ที่ ฿${currentPrice.toFixed(2)} ขาดอีกเพียง ฿${Math.abs(priceDiff)} บ.`;

    const payload: SwBackgroundAlertItem = {
      id: `sw-price-${district.id}-${Date.now()}`,
      title,
      body,
      districtId: district.id,
      districtNameTh: district.nameTh,
      alertType: "price_breakeven",
      severity: isProfitable ? "critical" : "warning",
      spi30d: district.spi30d,
      rainProbToday: district.rainProbToday,
      soilMoisturePct: district.gistdaSoilMoisturePct,
      commodityKey,
      cropNameTh,
      currentMarketPrice: currentPrice,
      breakEvenTargetPrice: targetPrice,
      gainProfitBahtPerTon: isProfitable ? Math.round(priceDiff * 1000) : 0,
      recommendedActionTh:
        "เปิดหน้าต่างเปรียบเทียบจุดรับซื้อและค่าน้ำมันรถบรรทุกเพื่อเลือกโรงงานที่ให้กำไรสุทธิสูงสุด",
      moduleTarget: "market",
      timestampIso: new Date(Date.now() + delayMs).toISOString(),
      receivedWhileClosed: delayMs > 0,
    };

    const targetSw =
      navigator.serviceWorker?.controller || this.registration?.active;

    if (delayMs > 0) {
      if (targetSw) {
        targetSw.postMessage({
          type: "SCHEDULE_BACKGROUND_PUSH",
          delayMs,
          payload,
        });
      } else {
        setTimeout(() => {
          this.appendAlertRecord(payload);
        }, delayMs);
      }
      return;
    }

    if (targetSw) {
      targetSw.postMessage({
        type: "TRIGGER_SW_PUSH_NOW",
        payload,
      });
    } else {
      this.appendAlertRecord(payload);
    }
  }

  public async triggerOptimalWindowAlert(
    commodityKey: CommodityKey,
    cropNameTh: string,
    currentPrice: number,
    optimalWindowTh: string,
    recommendationSignalTh: string,
    district: KoratDistrict,
    delayMs = 0
  ) {
    const title = `[SW Push · ช่วงเวลาทองขายผลผลิต] ${cropNameTh} (${district.nameTh})`;
    const body = `AI พยากรณ์เข้าสู่ 'ช่วงเวลาทอง (Optimal Window)': ${optimalWindowTh} สัญญาณแนะนำ: "${recommendationSignalTh}" ราคาตลาดปัจจุบัน ฿${currentPrice.toFixed(2)}`;

    const payload: SwBackgroundAlertItem = {
      id: `sw-optimal-${district.id}-${Date.now()}`,
      title,
      body,
      districtId: district.id,
      districtNameTh: district.nameTh,
      alertType: "optimal_selling_window",
      severity: "warning",
      spi30d: district.spi30d,
      rainProbToday: district.rainProbToday,
      soilMoisturePct: district.gistdaSoilMoisturePct,
      commodityKey,
      cropNameTh,
      currentMarketPrice: currentPrice,
      optimalSellingWindowTh: optimalWindowTh,
      recommendedActionTh: `สัญญาณ: ${recommendationSignalTh} — หลีกเลี่ยงช่วงผลผลิตกระจุกตัวเพื่อไม่ให้โดนกดราคา`,
      moduleTarget: "price_forecast",
      timestampIso: new Date(Date.now() + delayMs).toISOString(),
      receivedWhileClosed: delayMs > 0,
    };

    const targetSw =
      navigator.serviceWorker?.controller || this.registration?.active;

    if (delayMs > 0) {
      if (targetSw) {
        targetSw.postMessage({
          type: "SCHEDULE_BACKGROUND_PUSH",
          delayMs,
          payload,
        });
      } else {
        setTimeout(() => {
          this.appendAlertRecord(payload);
        }, delayMs);
      }
      return;
    }

    if (targetSw) {
      targetSw.postMessage({
        type: "TRIGGER_SW_PUSH_NOW",
        payload,
      });
    } else {
      this.appendAlertRecord(payload);
    }
  }

  public async pollServerAlertsViaServiceWorker() {
    const targetSw =
      navigator.serviceWorker?.controller || this.registration?.active;
    if (targetSw) {
      targetSw.postMessage({
        type: "POLL_SERVER_ALERTS_NOW",
      });
    } else {
      try {
        const res = await fetch("/api/push/evaluate-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            districtIds: this.status.config.districtIds,
            spiThreshold: this.status.config.spiThreshold,
            rainProbThreshold: this.status.config.rainProbThreshold,
            soilMoistureMinThreshold:
              this.status.config.soilMoistureMinThreshold,
            forceTrigger: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.breachedAlerts) && data.breachedAlerts[0]) {
            this.appendAlertRecord({
              ...data.breachedAlerts[0],
              timestampIso: new Date().toISOString(),
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

export const swPushManager = new ServiceWorkerPushManager();

export function useServiceWorkerPush() {
  const [status, setStatus] = useState<SwRegistrationStatus>(() =>
    swPushManager.getStatus()
  );

  useEffect(() => {
    return swPushManager.subscribe(() => {
      setStatus({ ...swPushManager.getStatus() });
    });
  }, []);

  const updateConfig = useCallback(
    async (partial: Partial<SwSubscriptionConfig>) => {
      const merged = { ...swPushManager.getStatus().config, ...partial };
      await swPushManager.syncConfigToServiceWorker(merged);
    },
    []
  );

  const requestPermission = useCallback(async () => {
    return swPushManager.requestNotificationPermissionAndSubscribe();
  }, []);

  const triggerDistrictPush = useCallback(
    async (
      district: KoratDistrict,
      mode: "spi_drought" | "heavy_rain" | "soil_moisture" = "spi_drought",
      delayMs = 0
    ) => {
      await swPushManager.triggerServiceWorkerAlertForDistrict(
        district,
        mode,
        delayMs
      );
    },
    []
  );

  const triggerPriceBreakevenPush = useCallback(
    async (
      commodityKey: CommodityKey,
      cropNameTh: string,
      currentPrice: number,
      targetPrice: number,
      district: KoratDistrict,
      delayMs = 0
    ) => {
      await swPushManager.triggerPriceBreakevenAlert(
        commodityKey,
        cropNameTh,
        currentPrice,
        targetPrice,
        district,
        delayMs
      );
    },
    []
  );

  const triggerOptimalWindowPush = useCallback(
    async (
      commodityKey: CommodityKey,
      cropNameTh: string,
      currentPrice: number,
      optimalWindowTh: string,
      recommendationSignalTh: string,
      district: KoratDistrict,
      delayMs = 0
    ) => {
      await swPushManager.triggerOptimalWindowAlert(
        commodityKey,
        cropNameTh,
        currentPrice,
        optimalWindowTh,
        recommendationSignalTh,
        district,
        delayMs
      );
    },
    []
  );

  const pollAllSubscribedDistricts = useCallback(async () => {
    await swPushManager.pollServerAlertsViaServiceWorker();
  }, []);

  return {
    status,
    updateConfig,
    requestPermission,
    triggerDistrictPush,
    triggerPriceBreakevenPush,
    triggerOptimalWindowPush,
    pollAllSubscribedDistricts,
  };
}
