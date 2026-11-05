import React, { useState, useEffect } from "react";
import {
  KORAT_DISTRICTS,
  KoratDistrict,
  CommodityKey,
  KORAT_COMMODITIES,
  CROP_FORECAST_PROFILES,
} from "../data/koratAgriData";
import { useServiceWorkerPush } from "../utils/serviceWorkerPushManager";
import {
  BellRing,
  Radio,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CloudLightning,
  Droplets,
  Flame,
  Smartphone,
  Download,
  WifiOff,
  Send,
  RefreshCw,
  MapPin,
  TrendingUp,
  Sparkles,
  Coins,
  Target,
  ArrowRight,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition-colors whitespace-nowrap cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>ติดตั้งแอปรับแจ้งเตือน (PWA)</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111827] hover:bg-[#1E293B] text-emerald-300 border border-emerald-500/35 transition-colors whitespace-nowrap cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span>ติดตั้งแอป &amp; แจ้งเตือนพื้นหลัง</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#0B101D] border border-emerald-500/40 p-5 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                ติดตั้งแอป Korat SmartAgri บนหน้าจอหลัก
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ปิด
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              เมื่อติดตั้งแอปลงบนหน้าจอมือถือหรือคอมพิวเตอร์ ระบบ{" "}
              <strong className="text-emerald-300">
                Service Worker (`/sw.js`)
              </strong>{" "}
              จะทำงานอยู่เบื้องหลังเพื่อส่งแจ้งเตือนพายุฝนและดัชนีภัยแล้ง SPI
              ให้เกษตรกรได้ทันทีแม้ปิดหน้าต่างเบราว์เซอร์ไปแล้ว
            </p>
            {isIOS ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-200 space-y-1">
                <div className="font-bold text-amber-300">
                  สำหรับ iPhone / iPad (Safari):
                </div>
                <div>
                  1. แตะปุ่ม <strong>แชร์ (Share)</strong> บนแถบด้านล่างของ Safari
                </div>
                <div>
                  2. เลื่อนลงแล้วแตะ{" "}
                  <strong>เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)</strong>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-200 space-y-1">
                <div className="font-bold text-emerald-300">
                  สำหรับ Chrome / Edge / Android:
                </div>
                <div>
                  1. คลิกไอคอน <strong>ติดตั้งแอป (Install Korat SmartAgri)</strong>{" "}
                  ที่แถบที่อยู่ด้านบนของเบราว์เซอร์ หรือเมนู ⋮ &gt; ติดตั้งแอป
                </div>
                <div>
                  2. กดอนุญาตการแจ้งเตือน (Allow Notifications) เพื่อรับแจ้งเตือนภัยแล้ง SPI แม้ขณะปิดแอป
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 text-xs transition-colors cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xl">
      <WifiOff className="w-4 h-4" />
      <span>
        โหมดออฟไลน์ (Service Worker Cache) — แสดงข้อมูลพยากรณ์และค่า SPI ล่าสุดที่บันทึกในเครื่อง
      </span>
    </div>
  );
};

interface ServiceWorkerPushControlPanelProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
}

export const ServiceWorkerPushControlPanel: React.FC<
  ServiceWorkerPushControlPanelProps
> = ({ selectedDistrict, onSelectDistrict }) => {
  const {
    status,
    updateConfig,
    requestPermission,
    triggerDistrictPush,
    triggerPriceBreakevenPush,
    triggerOptimalWindowPush,
    pollAllSubscribedDistricts,
  } = useServiceWorkerPush();

  const [countdownSec, setCountdownSec] = useState<number>(0);
  const [statusFeedback, setStatusFeedback] = useState<string>("");

  useEffect(() => {
    if (countdownSec <= 0) return;
    const timer = setInterval(() => {
      setCountdownSec((prev) => {
        if (prev <= 1) {
          setStatusFeedback(
            `Service Worker ส่งแจ้งเตือนพื้นหลังสำหรับ ${selectedDistrict.nameTh} สำเร็จแล้ว!`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownSec, selectedDistrict.nameTh]);

  const handleToggleDistrictSubscription = (districtId: string) => {
    const current = status.config.districtIds;
    const exists = current.includes(districtId);
    const nextIds = exists
      ? current.filter((id) => id !== districtId)
      : [...current, districtId];
    updateConfig({
      districtIds: nextIds.length > 0 ? nextIds : [selectedDistrict.id],
    });
  };

  const handleDelayedBackgroundTest = async () => {
    await requestPermission();
    setCountdownSec(5);
    setStatusFeedback(
      `กำลังส่งคำสั่งไปยัง Service Worker (/sw.js)... คุณสามารถพับหน้าจอหรือสลับแท็บได้ ระบบจะส่งแจ้งเตือนในอีก 5 วินาที`
    );
    await triggerDistrictPush(selectedDistrict, "spi_drought", 5000);
  };

  const isSelectedDistrictSubscribed = status.config.districtIds.includes(
    selectedDistrict.id
  );

  return (
    <div className="bg-[#0B121C] border border-emerald-500/35 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              SERVICE WORKER WEB PUSH · BACKGROUND SPI &amp; WEATHER DAEMON
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                status.registered
                  ? "bg-teal-500/20 text-teal-300 border border-teal-400/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {status.registered
                ? `SW Active (/sw.js · ซิงค์ล่าสุด ${status.lastSyncedAtTh})`
                : "SW กำลังเริ่มต้น..."}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            ระบบแจ้งเตือนพยากรณ์อากาศและภัยแล้ง SPI ผ่าน Service Worker (รับแจ้งเตือนได้แม้ปิดแอปพลิเคชัน)
          </h3>
          <p className="text-xs text-slate-300">
            ทำงานผ่าน <code className="text-emerald-300">/sw.js</code> ร่วมกับ{" "}
            <strong className="text-emerald-300">Web Push API</strong>,{" "}
            <strong className="text-sky-300">Periodic Background Sync</strong>{" "}
            และฐานข้อมูล <strong className="text-amber-300">IndexedDB</strong>{" "}
            ในระดับเบราว์เซอร์ เพื่อให้เกษตรกรได้รับแจ้งเตือนเมื่อค่า SPI
            หรือพายุฝนในอำเภอที่ติดตามเกินเกณฑ์ แม้ขณะพับหน้าจอหรือปิดแท็บแอปไปแล้ว
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={async () => {
              const granted = await requestPermission();
              setStatusFeedback(
                granted
                  ? "เปิดสิทธิ์ OS Push Notification และซิงค์เกณฑ์เฝ้าระวังเข้ากับ Service Worker สำเร็จ!"
                  : "บันทึกเกณฑ์เฝ้าระวังลงใน Service Worker IndexedDB สำเร็จ!"
              );
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span>
              {status.permission === "granted"
                ? "เปิดรับแจ้งเตือนพื้นหลังแล้ว (OS Push Ready)"
                : "ขอสิทธิ์รับแจ้งเตือนเมื่อปิดแอป (Enable Push)"}
            </span>
          </button>

          <PWAInstallButton />
        </div>
      </div>

      {/* Feedback Banner or Countdown */}
      {(countdownSec > 0 || statusFeedback) && (
        <div
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs ${
            countdownSec > 0
              ? "bg-amber-500/15 border-amber-400/50 text-amber-200"
              : "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 shrink-0 ${
                countdownSec > 0 ? "animate-spin text-amber-300" : "text-emerald-300"
              }`}
            />
            <span>
              {countdownSec > 0
                ? `กำลังจำลองส่งแจ้งเตือนขณะปิดแอปสำหรับ ${selectedDistrict.nameTh} ในอีก ${countdownSec} วินาที... (ลองสลับแท็บหรือพับหน้าต่างเบราว์เซอร์ได้เลย)`
                : statusFeedback}
            </span>
          </div>
          {statusFeedback && countdownSec === 0 && (
            <button
              type="button"
              onClick={() => setStatusFeedback("")}
              className="text-[11px] underline text-slate-300 hover:text-white cursor-pointer"
            >
              รับทราบ
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Left = Background Thresholds & Subscribed Districts | Right = Instant & Background Test Triggers + SW IndexedDB Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 6 cols: Threshold Sliders & District Watchlist saved in SW IndexedDB */}
        <div className="lg:col-span-6 bg-[#111B27] border border-white/10 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              1. ตั้งค่าเกณฑ์เฝ้าระวังใน Service Worker (ทำงานแม้ปิดแอป)
            </span>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={status.config.enabled}
                onChange={(e) => updateConfig({ enabled: e.target.checked })}
                className="accent-emerald-400 rounded cursor-pointer"
              />
              <span>เปิดเฝ้าระวังพื้นหลังอัตโนมัติ</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* SPI Drought Threshold */}
            <div className="bg-[#0B121C] border border-white/10 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  เกณฑ์ภัยแล้ง SPI
                </span>
                <span className="font-mono font-bold text-white">
                  ≤ {status.config.spiThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={-2.0}
                max={-0.5}
                step={0.05}
                value={status.config.spiThreshold}
                onChange={(e) =>
                  updateConfig({ spiThreshold: Number(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                ปัจจุบัน {selectedDistrict.nameTh}:{" "}
                <strong className="text-amber-300 font-mono">
                  {selectedDistrict.spi30d.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Heavy Rain Probability Threshold */}
            <div className="bg-[#0B121C] border border-white/10 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-sky-300 font-semibold flex items-center gap-1">
                  <CloudLightning className="w-3 h-3" />
                  เกณฑ์พายุฝนวันนี้
                </span>
                <span className="font-mono font-bold text-white">
                  ≥ {status.config.rainProbThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                step={5}
                value={status.config.rainProbThreshold}
                onChange={(e) =>
                  updateConfig({ rainProbThreshold: Number(e.target.value) })
                }
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                ปัจจุบัน {selectedDistrict.nameTh}:{" "}
                <strong className="text-sky-300 font-mono">
                  {selectedDistrict.rainProbToday}%
                </strong>
              </div>
            </div>

            {/* Soil Moisture Min Threshold */}
            <div className="bg-[#0B121C] border border-white/10 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  ความชื้นดินขั้นต่ำ
                </span>
                <span className="font-mono font-bold text-white">
                  ≤ {status.config.soilMoistureMinThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                step={2}
                value={status.config.soilMoistureMinThreshold}
                onChange={(e) =>
                  updateConfig({
                    soilMoistureMinThreshold: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                ปัจจุบัน {selectedDistrict.nameTh}:{" "}
                <strong className="text-emerald-300 font-mono">
                  {selectedDistrict.gistdaSoilMoisturePct}%
                </strong>
              </div>
            </div>
          </div>

          {/* Subscribed Districts Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                อำเภอที่ลงทะเบียนรับแจ้งเตือนพื้นหลัง ({status.config.districtIds.length}{" "}
                อำเภอ):
              </span>
              <button
                type="button"
                onClick={() =>
                  handleToggleDistrictSubscription(selectedDistrict.id)
                }
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  isSelectedDistrictSubscribed
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              >
                {isSelectedDistrictSubscribed
                  ? `✓ ติดตาม ${selectedDistrict.nameTh} อยู่`
                  : `+ เพิ่ม ${selectedDistrict.nameTh} เข้าคิวเฝ้าระวัง`}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#0B121C] rounded-lg border border-white/10">
              {KORAT_DISTRICTS.map((dist) => {
                const isSub = status.config.districtIds.includes(dist.id);
                return (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() => handleToggleDistrictSubscription(dist.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      isSub
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : "bg-white/5 hover:bg-white/15 text-slate-400"
                    }`}
                  >
                    <span>{dist.nameTh.replace("อ.", "")}</span>
                    <span className="font-mono text-[10px] opacity-80">
                      ({dist.spi30d.toFixed(1)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 6 cols: Action Triggers (Immediate + Delayed Closed-App Simulation) & SW IndexedDB Alert Log */}
        <div className="lg:col-span-6 bg-[#111B27] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                2. ทดสอบส่ง Push Notification ผ่าน Service Worker ({selectedDistrict.nameTh})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                IndexedDB Log: {status.storedAlerts.length} รายการ
              </span>
            </div>

            {/* 3 Trigger Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await triggerDistrictPush(selectedDistrict, "spi_drought", 0);
                  setStatusFeedback(
                    `ส่งแจ้งเตือนดัชนีภัยแล้ง SPI (${selectedDistrict.spi30d.toFixed(
                      2
                    )}) ของ ${selectedDistrict.nameTh} ผ่าน Service Worker แล้ว`
                  );
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>ส่ง Push ภัยแล้ง SPI ทันที</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await triggerDistrictPush(selectedDistrict, "heavy_rain", 0);
                  setStatusFeedback(
                    `ส่งแจ้งเตือนพยากรณ์อากาศ (${selectedDistrict.rainProbToday}%) ของ ${selectedDistrict.nameTh} ผ่าน Service Worker แล้ว`
                  );
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors cursor-pointer"
              >
                <CloudLightning className="w-3.5 h-3.5 shrink-0" />
                <span>ส่ง Push พายุฝนทันที</span>
              </button>

              <button
                type="button"
                onClick={handleDelayedBackgroundTest}
                disabled={countdownSec > 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {countdownSec > 0
                    ? `ส่งในอีก ${countdownSec} วินาที...`
                    : "จำลองแจ้งเตือนขณะพับจอ (5 วิ)"}
                </span>
              </button>
            </div>

            {/* Service Worker Background Alert Log (Persisted in IndexedDB) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  ประวัติการแจ้งเตือนจาก Service Worker (รวมรายการที่ได้รับขณะปิดแอป):
                </span>
                <button
                  type="button"
                  onClick={pollAllSubscribedDistricts}
                  className="inline-flex items-center gap-1 text-emerald-300 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>สแกนทุกอำเภอที่ติดตาม</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {status.storedAlerts.slice(0, 5).map((alertItem) => (
                  <div
                    key={alertItem.id}
                    className="bg-[#0B121C] border border-white/10 rounded-lg p-2.5 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            alertItem.severity === "critical"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                          }`}
                        >
                          {alertItem.alertType === "spi_drought"
                            ? `SPI ${alertItem.spi30d.toFixed(2)}`
                            : `ฝน ${alertItem.rainProbToday}%`}
                        </span>
                        <span className="font-bold text-slate-100">
                          {alertItem.title}
                        </span>
                        {alertItem.receivedWhileClosed && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                            Background SW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {alertItem.body}
                      </p>
                    </div>

                    {onSelectDistrict && (
                      <button
                        type="button"
                        onClick={() => onSelectDistrict(alertItem.districtId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] text-emerald-300 shrink-0 cursor-pointer"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>ดูพื้นที่</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module: Mobile Push Alert for Market Price Break-even & Optimal Selling Window */}
      <div className="bg-gradient-to-r from-[#0C1A2E] via-[#0B1526] to-[#0A1A1E] border border-teal-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold font-mono">
                <Coins className="w-3.5 h-3.5" />
                MARKET PRICE BREAK-EVEN &amp; OPTIMAL SELLING WINDOW MOBILE PUSH
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                ● ส่งตรงเข้ามือถือเกษตรกร
              </span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>แจ้งเตือนราคาตลาดแตะจุดคุ้มทุน (Break-even) และช่วงเวลาทอง (Optimal Window)</span>
            </h4>
            <p className="text-xs text-slate-300">
              ส่ง Push Notification เข้ามือถือทันทีเมื่อราคารับซื้อโรงงาน/ลานมันในโคราชแตะจุดคุ้มทุนเป้าหมาย หรือเมื่อเข้าสู่กรอบเวลาที่ได้ราคาพรีเมียมก่อนผลผลิตล้นตลาด
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                updateConfig({
                  priceAlertsEnabled: !status.config.priceAlertsEnabled,
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                status.config.priceAlertsEnabled
                  ? "bg-teal-500 text-slate-950 hover:bg-teal-400"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>
                {status.config.priceAlertsEnabled
                  ? "เปิดแจ้งเตือนราคาเข้ามือถือแล้ว"
                  : "ปิดแจ้งเตือนราคา"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Col 1-7: Parameters & Break-even setting */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Commodity */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  เลือกพืชเศรษฐกิจที่ต้องการแจ้งเตือน:
                </label>
                <select
                  value={status.config.selectedCropForAlert || "cassava_fresh"}
                  onChange={(e) => {
                    const key = e.target.value as CommodityKey;
                    const defaultTarget =
                      key === "cassava_fresh"
                        ? 2.85
                        : key === "cassava_chip"
                        ? 7.2
                        : key === "sugarcane_fresh"
                        ? 1350
                        : key === "maize_feed"
                        ? 10.2
                        : 15200;
                    updateConfig({
                      selectedCropForAlert: key,
                      breakEvenTargetPrice: defaultTarget,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs text-white bg-[#080C16] border border-teal-500/40 rounded-xl focus:outline-none focus:border-teal-400 font-mono"
                >
                  {KORAT_COMMODITIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.nameTh} ({c.unit}) · เฉลี่ย ฿{c.provincialAvgPrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Break-even Target Price Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    ราคาเป้าหมายจุดคุ้มทุน (Break-even):
                  </label>
                  <span className="text-[11px] font-mono font-bold text-teal-300">
                    ฿{status.config.breakEvenTargetPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={
                      status.config.selectedCropForAlert === "sugarcane_fresh" ||
                      status.config.selectedCropForAlert === "jasmine_rice"
                        ? 10
                        : 0.05
                    }
                    value={status.config.breakEvenTargetPrice}
                    onChange={(e) =>
                      updateConfig({
                        breakEvenTargetPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs text-white bg-[#080C16] border border-teal-500/40 rounded-xl focus:outline-none focus:border-teal-400 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const key = status.config.selectedCropForAlert;
                      const preset =
                        key === "cassava_fresh"
                          ? 2.85
                          : key === "cassava_chip"
                          ? 7.2
                          : key === "sugarcane_fresh"
                          ? 1350
                          : key === "maize_feed"
                          ? 10.2
                          : 15200;
                      updateConfig({ breakEvenTargetPrice: preset });
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40 text-[11px] font-bold hover:bg-teal-500/30 whitespace-nowrap cursor-pointer"
                  >
                    ค่าแนะนำ
                  </button>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080E18] border border-white/10 cursor-pointer hover:border-teal-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={status.config.priceAlertsEnabled}
                  onChange={(e) =>
                    updateConfig({ priceAlertsEnabled: e.target.checked })
                  }
                  className="rounded accent-teal-400"
                />
                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-teal-400" />
                    แจ้งเตือนเมื่อราคาแตะจุดคุ้มทุน
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ส่ง Push Notification เมื่อราคาโรงงาน &gt;= ฿{status.config.breakEvenTargetPrice}
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080E18] border border-white/10 cursor-pointer hover:border-teal-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={status.config.optimalWindowNotify}
                  onChange={(e) =>
                    updateConfig({ optimalWindowNotify: e.target.checked })
                  }
                  className="rounded accent-teal-400"
                />
                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    แจ้งเตือนช่วงเวลาทอง (Optimal Window)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    AI Prophet เตือนช่วงราคาพรีเมียมก่อนคิวยาว
                  </div>
                </div>
              </label>
            </div>

            {/* Action Test Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={async () => {
                  await requestPermission();
                  const cropKey = status.config.selectedCropForAlert || "cassava_fresh";
                  const crop = KORAT_COMMODITIES.find((c) => c.key === cropKey);
                  const currentPrice = crop ? crop.provincialAvgPrice : 3.15;
                  await triggerPriceBreakevenPush(
                    cropKey,
                    crop ? crop.nameTh : "มันสำปะหลังสด",
                    currentPrice,
                    status.config.breakEvenTargetPrice,
                    selectedDistrict,
                    0
                  );
                  setStatusFeedback(
                    `ส่ง Push Notification แจ้งเตือนจุดคุ้มทุน (${crop?.nameTh} ฿${currentPrice}) ตรงเข้ามือถือแล้ว!`
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>ทดสอบส่งแจ้งเตือนจุดคุ้มทุนเข้ามือถือ</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await requestPermission();
                  const cropKey = status.config.selectedCropForAlert || "cassava_fresh";
                  const crop = KORAT_COMMODITIES.find((c) => c.key === cropKey);
                  const profile = CROP_FORECAST_PROFILES[cropKey];
                  const currentPrice = crop ? crop.provincialAvgPrice : 3.15;
                  await triggerOptimalWindowPush(
                    cropKey,
                    crop ? crop.nameTh : "มันสำปะหลังสด",
                    currentPrice,
                    profile ? profile.optimalSellingWindow : "ปลาย พ.ย. - ธ.ค.",
                    profile ? profile.recommendationSignal : "แนะนำขายช่วงต้นหีบ",
                    selectedDistrict,
                    0
                  );
                  setStatusFeedback(
                    `ส่ง Push Notification แจ้งเตือนช่วงเวลาทอง (${crop?.nameTh}) ตรงเข้ามือถือแล้ว!`
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>ทดสอบส่งแจ้งเตือนช่วงเวลาทองเข้ามือถือ</span>
              </button>
            </div>
          </div>

          {/* Col 8-12: Smartphone Notification Lockscreen Mockup */}
          <div className="lg:col-span-5 bg-[#070D18] border border-teal-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/10">
              <span className="flex items-center gap-1 text-teal-300 font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                จำลองการแสดงผลบนจอมือถือ (Lockscreen / Notification Shade)
              </span>
              <span className="font-mono text-[10px]">สั่น + เสียงแจ้งเตือน</span>
            </div>

            {/* Notification Card Mockup */}
            <div className="bg-[#101F33] border-l-4 border-l-teal-400 border border-teal-500/30 rounded-xl p-3 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-teal-300 flex items-center gap-1">
                  <span>🌾 KORAT SMARTAGRI PUSH</span>
                </span>
                <span>เมื่อสักครู่</span>
              </div>
              <div className="text-xs font-bold text-white">
                [SW Push · ทะลุจุดคุ้มทุน] {KORAT_COMMODITIES.find((c) => c.key === (status.config.selectedCropForAlert || "cassava_fresh"))?.nameTh} แตะ ฿{KORAT_COMMODITIES.find((c) => c.key === (status.config.selectedCropForAlert || "cassava_fresh"))?.provincialAvgPrice}
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                ราคารับซื้อใน {selectedDistrict.nameTh} ทะลุจุดคุ้มทุน ฿{status.config.breakEvenTargetPrice} ได้กำไรสุทธิส่วนเพิ่ม แนะนำเปรียบเทียบจุดรับซื้อที่คุ้มค่าเดินทางที่สุด
              </p>
              <div className="pt-2 flex items-center gap-2 border-t border-white/10">
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-400/40">
                  ดูพิกัด &amp; ราคารับซื้อลาน
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-medium">
                  วิเคราะห์ช่วงเวลาทอง ML
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
