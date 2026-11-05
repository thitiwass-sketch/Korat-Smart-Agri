import React, { useState, useEffect } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  DistrictThresholdConfig,
  ThresholdBreachToastItem,
  useThresholdAlertStore,
  thresholdAlertStore,
  evaluateDistrictThresholdBreaches,
} from "../utils/thresholdAlertStore";
import {
  BellRing,
  Droplets,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Zap,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface GlobalThresholdToastContainerProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onOpenThresholdSettings?: () => void;
}

export const GlobalThresholdToastContainer: React.FC<
  GlobalThresholdToastContainerProps
> = ({ selectedDistrict, onSelectDistrict, onOpenThresholdSettings }) => {
  const { activeToasts, dismissToast, clearAllActiveToasts } =
    useThresholdAlertStore(selectedDistrict);
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);

  // Auto-dismiss timer for active toasts unless hovered
  useEffect(() => {
    if (activeToasts.length === 0 || hoveredToastId !== null) return;
    const timer = setTimeout(() => {
      const oldest = activeToasts[activeToasts.length - 1];
      if (oldest) {
        dismissToast(oldest.id);
      }
    }, 8500);
    return () => clearTimeout(timer);
  }, [activeToasts, hoveredToastId, dismissToast]);

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] sm:w-full space-y-3 pointer-events-none"
    >
      {activeToasts.length > 1 && (
        <div className="flex justify-end pointer-events-auto">
          <button
            type="button"
            onClick={clearAllActiveToasts}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B101D]/95 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white shadow-lg cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>ปิดการแจ้งเตือนทั้งหมด ({activeToasts.length})</span>
          </button>
        </div>
      )}

      {activeToasts.map((toast: ThresholdBreachToastItem) => {
        const isSoilMoisture =
          toast.category === "soil_moisture_low" ||
          toast.category === "soil_moisture_high";
        const isCritical = toast.severity === "critical";

        return (
          <div
            key={toast.id}
            role="alert"
            onMouseEnter={() => setHoveredToastId(toast.id)}
            onMouseLeave={() => setHoveredToastId(null)}
            className={`pointer-events-auto rounded-2xl border-2 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.65)] transition-all backdrop-blur-md ${
              isCritical
                ? "bg-[#130D14]/95 border-red-500 text-white"
                : isSoilMoisture
                ? "bg-[#0B1320]/95 border-amber-400 text-white"
                : "bg-[#091526]/95 border-sky-400 text-white"
            }`}
          >
            {/* Top Header Row */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isCritical
                      ? "bg-red-500/25 text-red-300 border border-red-400/50"
                      : isSoilMoisture
                      ? "bg-amber-500/25 text-amber-300 border border-amber-400/50"
                      : "bg-sky-500/25 text-sky-300 border border-sky-400/50"
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5 animate-bounce shrink-0" />
                  <span>
                    {toast.isSimulated
                      ? "THRESHOLD TEST ALERT"
                      : isCritical
                      ? "CRITICAL THRESHOLD BREACH"
                      : "THRESHOLD ALERT TRIGGERED"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  {isSoilMoisture ? (
                    <Droplets className="w-3 h-3 text-amber-400" />
                  ) : (
                    <CloudRain className="w-3 h-3 text-sky-400" />
                  )}
                  <span>{toast.metricLabel}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                aria-label="ปิดหน้าต่างแจ้งเตือน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Title */}
            <div className="mt-2.5 text-sm sm:text-base font-bold text-white leading-snug">
              {toast.title}
            </div>

            {/* Metric Comparison Pill Bar */}
            <div className="mt-2.5 grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400 font-sans">
                  ค่าตรวจวัดจริง
                </div>
                <div
                  className={`text-sm font-bold ${
                    isCritical
                      ? "text-red-400"
                      : isSoilMoisture
                      ? "text-amber-300"
                      : "text-sky-300"
                  }`}
                >
                  {toast.actualValueText}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-sans">
                  เกณฑ์ที่ตั้งไว้
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {toast.thresholdValueText}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-sans">
                  ส่วนต่างเกณฑ์
                </div>
                <div className="text-xs font-bold text-amber-400">
                  {toast.deltaText}
                </div>
              </div>
            </div>

            {/* Body Message & Agronomic Remedial Action */}
            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
              {toast.message}
            </p>
            <div className="mt-2 bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-200 leading-relaxed">
              <strong className="text-emerald-300">คำแนะนำจัดการแปลง: </strong>
              {toast.remedialAction}
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectDistrict(toast.districtId);
                    dismissToast(toast.id);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] font-bold transition-colors cursor-pointer"
                >
                  <span>ดูข้อมูล {toast.districtNameTh}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onOpenThresholdSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenThresholdSettings();
                      dismissToast(toast.id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3 h-3 text-[#2DD4BF]" />
                    <span>ปรับเกณฑ์</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white font-medium px-2 py-1 cursor-pointer"
              >
                รับทราบ
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DistrictThresholdConfiguratorProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  liveSoilMoisturePct?: number;
  liveRainProbPct?: number;
  liveRain14dMm?: number;
  compactMode?: boolean;
}

export const DistrictThresholdConfiguratorCard: React.FC<
  DistrictThresholdConfiguratorProps
> = ({
  selectedDistrict,
  onSelectDistrict,
  liveSoilMoisturePct,
  liveRainProbPct,
  liveRain14dMm,
  compactMode = false,
}) => {
  const { currentConfig, currentBreaches, saveConfig } =
    useThresholdAlertStore(selectedDistrict);

  const [draft, setDraft] = useState<DistrictThresholdConfig>(currentConfig);
  const [savedFeedback, setSavedFeedback] = useState<string>("");
  const [browserPermStatus, setBrowserPermStatus] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  // Sync draft when selectedDistrict changes
  useEffect(() => {
    setDraft(thresholdAlertStore.getConfigForDistrict(selectedDistrict));
    setSavedFeedback("");
  }, [selectedDistrict]);

  const actualSoilMoisture =
    liveSoilMoisturePct ?? selectedDistrict.gistdaSoilMoisturePct;
  const actualRainProb = liveRainProbPct ?? selectedDistrict.rainProbToday;
  const actualRain14d = liveRain14dMm ?? selectedDistrict.forecastRain14dMm;

  const isSoilLowBreached =
    draft.enableSoilMoistureLow &&
    actualSoilMoisture <= draft.soilMoistureMinPct;
  const isSoilHighBreached =
    draft.enableSoilMoistureHigh &&
    actualSoilMoisture >= draft.soilMoistureMaxPct;
  const isRainProbBreached =
    draft.enableRainProbHigh && actualRainProb >= draft.rainProbMaxPct;
  const isRain14dHighBreached =
    draft.enableRain14dHigh && actualRain14d >= draft.rain14dMaxMm;
  const isRain14dLowBreached =
    draft.enableRain14dLow && actualRain14d <= draft.rain14dMinMm;

  const totalDraftBreaches = [
    isSoilLowBreached,
    isSoilHighBreached,
    isRainProbBreached,
    isRain14dHighBreached,
    isRain14dLowBreached,
  ].filter(Boolean).length;

  const handleRequestBrowserPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermStatus(perm);
    } catch {
      // Ignore permission prompt errors in sandboxed iframe
    }
  };

  const handleSaveAndEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const breaches = saveConfig(draft, true);
    if (breaches.length > 0) {
      setSavedFeedback(
        `บันทึกเกณฑ์ ${selectedDistrict.nameTh} สำเร็จ · พบค่าเกินเกณฑ์ ${breaches.length} รายการ และส่ง Toast แจ้งเตือนแล้ว!`
      );
    } else {
      // Even when normal, show an advisory confirmation toast so user sees immediate feedback
      const advisoryToast: ThresholdBreachToastItem = {
        id: `toast_saved_ok_${selectedDistrict.id}_${Date.now()}`,
        districtId: selectedDistrict.id,
        districtNameTh: selectedDistrict.nameTh,
        cropFocus: draft.cropFocus,
        category: "soil_moisture_low",
        severity: "advisory",
        metricLabel: "บันทึกเกณฑ์เฝ้าระวังสำเร็จ",
        actualValueText: `ดิน ${actualSoilMoisture}% · ฝน ${actualRainProb}%`,
        thresholdValueText: `ดิน ≤${draft.soilMoistureMinPct}% · ฝน ≥${draft.rainProbMaxPct}%`,
        deltaText: "อยู่ในเกณฑ์ปกติ",
        title: `เปิดระบบเฝ้าระวัง ${selectedDistrict.nameTh} เรียบร้อยแล้ว`,
        message: `ค่าความชื้นดินปัจจุบัน (${actualSoilMoisture}%) และโอกาสฝนวันนี้ (${actualRainProb}%) ยังอยู่ในเกณฑ์ปลอดภัย ระบบจะส่ง Toast แจ้งเตือนทันทีเมื่อค่าทะลุเกณฑ์ที่ตั้งไว้`,
        remedialAction: `สามารถกดปุ่ม "จำลองเหตุการณ์เกินเกณฑ์" ด้านล่างเพื่อทดสอบหน้าต่างแจ้งเตือนภัยแล้งหรือพายุฝนได้ทันที`,
        createdAtIso: new Date().toISOString(),
        autoDismissMs: 6500,
        isSimulated: true,
      };
      thresholdAlertStore.pushToasts([advisoryToast], draft);
      setSavedFeedback(
        `บันทึกเกณฑ์เฝ้าระวัง ${selectedDistrict.nameTh} เรียบร้อยแล้ว (ค่าปัจจุบันอยู่ในเกณฑ์ปกติ)`
      );
    }
  };

  const handleSimulateBreachToast = (
    mode: "soil_drought" | "heavy_rain" | "waterlogging"
  ) => {
    saveConfig(draft, false);
    if (mode === "soil_drought") {
      const simMoisture = Math.max(14, draft.soilMoistureMinPct - 7);
      const breaches = evaluateDistrictThresholdBreaches(
        selectedDistrict,
        { ...draft, isActive: true, enableSoilMoistureLow: true },
        { soilMoisturePct: simMoisture, isSimulated: true }
      );
      thresholdAlertStore.pushToasts(breaches, draft);
      setSavedFeedback(
        `จำลองเหตุการณ์ความชื้นดินลดต่ำเหลือ ${simMoisture}% (ต่ำกว่าเกณฑ์ ≤ ${draft.soilMoistureMinPct}%) และส่ง Browser Toast แล้ว`
      );
    } else if (mode === "heavy_rain") {
      const simRainProb = Math.min(95, Math.max(75, draft.rainProbMaxPct + 15));
      const simRain14d = Math.max(125, draft.rain14dMaxMm + 22);
      const breaches = evaluateDistrictThresholdBreaches(
        selectedDistrict,
        {
          ...draft,
          isActive: true,
          enableRainProbHigh: true,
          enableRain14dHigh: true,
        },
        {
          rainProbTodayPct: simRainProb,
          forecastRain14dMm: simRain14d,
          isSimulated: true,
        }
      );
      thresholdAlertStore.pushToasts(breaches, draft);
      setSavedFeedback(
        `จำลองเหตุการณ์พายุฝน ${simRainProb}% และฝนสะสม ${simRain14d} มม. เกินเกณฑ์ที่ตั้งไว้ และส่ง Browser Toast แล้ว`
      );
    } else {
      const simMoistureHigh = Math.min(82, Math.max(68, draft.soilMoistureMaxPct + 8));
      const breaches = evaluateDistrictThresholdBreaches(
        selectedDistrict,
        { ...draft, isActive: true, enableSoilMoistureHigh: true },
        { soilMoisturePct: simMoistureHigh, isSimulated: true }
      );
      thresholdAlertStore.pushToasts(breaches, draft);
      setSavedFeedback(
        `จำลองเหตุการณ์ดินแฉะความชื้นสูง ${simMoistureHigh}% (เกินเกณฑ์ ≥ ${draft.soilMoistureMaxPct}%) และส่ง Browser Toast แล้ว`
      );
    }
  };

  const handleScanAllConfiguredDistricts = () => {
    const allSaved = thresholdAlertStore.getAllConfigs();
    const collectedBreaches: ThresholdBreachToastItem[] = [];
    for (const cfg of allSaved) {
      if (!cfg.isActive) continue;
      const dist = KORAT_DISTRICTS.find((d) => d.id === cfg.districtId);
      if (!dist) continue;
      const b = evaluateDistrictThresholdBreaches(dist, cfg);
      if (b.length > 0) {
        collectedBreaches.push(b[0]);
      }
    }
    if (collectedBreaches.length > 0) {
      thresholdAlertStore.pushToasts(collectedBreaches.slice(0, 3), draft);
      setSavedFeedback(
        `สแกนครบทุกอำเภอที่ตั้งค่าไว้: พบพื้นที่เกินเกณฑ์ ${collectedBreaches.length} แห่ง และแสดง Browser Toast แล้ว`
      );
    } else {
      setSavedFeedback("สแกนครบทุกอำเภอแล้ว: ยังไม่มีพื้นที่ใดเกินเกณฑ์ที่ตั้งไว้");
    }
  };

  const handleResetDefault = () => {
    const def = thresholdAlertStore.getConfigForDistrict({
      ...selectedDistrict,
      id: "__reset__",
    } as KoratDistrict);
    const cleanDef: DistrictThresholdConfig = {
      ...def,
      districtId: selectedDistrict.id,
      districtNameTh: selectedDistrict.nameTh,
      cropFocus: selectedDistrict.primaryCrops[0] || "มันสำปะหลัง",
    };
    setDraft(cleanDef);
    saveConfig(cleanDef, false);
    setSavedFeedback("คืนค่าเกณฑ์มาตรฐานประจำโซนอำเภอเรียบร้อยแล้ว");
  };

  return (
    <div
      className={`bg-gradient-to-b from-[#0B101D] via-[#090D18] to-[#070B14] border-2 rounded-3xl shadow-2xl transition-all relative overflow-hidden ${
        totalDraftBreaches > 0
          ? "border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          : "border-[#1E293B] hover:border-[#14B8A6]/50"
      } ${compactMode ? "p-4 sm:p-5" : "p-5 sm:p-7"} space-y-6`}
    >
      {/* Decorative ambient radial glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-[#14B8A6]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]/80 relative z-10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom District Threshold Alert</span>
            </span>
            <span className="text-xs font-mono text-slate-300 bg-[#12192B] px-2.5 py-1 rounded-full border border-[#26354D]">
              {selectedDistrict.nameTh} ({selectedDistrict.zone})
            </span>
            {totalDraftBreaches > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-bold font-mono animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>พบค่าเกินเกณฑ์เฝ้าระวัง {totalDraftBreaches} รายการ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ค่าตรวจวัดจริงทุกรายการอยู่ในเกณฑ์ปกติ</span>
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2">
            <span>ตั้งค่าเกณฑ์แจ้งเตือนปริมาณฝน &amp; ความชื้นดินรายอำเภอ</span>
            <span className="text-xs font-normal font-mono text-[#2DD4BF] px-2 py-0.5 rounded bg-[#14B8A6]/15 border border-[#14B8A6]/30 hidden sm:inline">
              Browser Toast Alert
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            กำหนดระดับความชื้นดิน GISTDA (%) และโอกาส/ปริมาณฝนสะสม (มม.) สำหรับ{" "}
            <strong className="text-white font-semibold">{selectedDistrict.nameTh}</strong>{" "}
            เพื่อรับการแจ้งเตือนแบบป๊อปอัป (Toast Notification) ทันทีเมื่อค่าตรวจวัดจริงทะลุเกณฑ์วิกฤต
          </p>
        </div>

        {/* District Selector & Sound / Browser Notification Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <div className="bg-[#101726] border border-[#223147] rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xs">
            <span className="text-xs font-mono text-slate-400">เลือกอำเภอ:</span>
            <select
              aria-label="เลือกอำเภอที่ต้องการตั้งเกณฑ์แจ้งเตือน"
              value={selectedDistrict.id}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer"
            >
              {KORAT_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0B101D] text-white">
                  {d.nameTh} (ดิน {d.gistdaSoilMoisturePct}% · ฝน {d.rainProbToday}%)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                enableSoundAlert: !prev.enableSoundAlert,
              }))
            }
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              draft.enableSoundAlert
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/25"
                : "bg-[#101726] border-[#223147] text-slate-400 hover:text-slate-200"
            }`}
            title="เปิด/ปิดเสียงแจ้งเตือนสังเคราะห์เมื่อมี Toast เด้ง"
          >
            {draft.enableSoundAlert ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{draft.enableSoundAlert ? "เสียงเตือน: เปิด" : "เสียงเตือน: ปิด"}</span>
          </button>

          {browserPermStatus !== "granted" &&
            browserPermStatus !== "unsupported" && (
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-sky-400" />
                <span>อนุญาต Browser Notification</span>
              </button>
            )}
        </div>
      </div>

      {/* Live Telemetry vs Custom Threshold Comparison Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
        {/* Card 1: GISTDA Soil Moisture */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isSoilLowBreached || isSoilHighBreached
              ? "bg-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
              : "bg-[#0E1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#2DD4BF]" />
              <span>ความชื้นดิน GISTDA ล่าสุด</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                isSoilLowBreached
                  ? "bg-rose-500/25 text-rose-300 border border-rose-500/50"
                  : isSoilHighBreached
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {isSoilLowBreached
                ? "ต่ำกว่าเกณฑ์ (เสี่ยงแล้ง)"
                : isSoilHighBreached
                ? "สูงเกินเกณฑ์ (เสี่ยงแฉะ)"
                : "ชุ่มชื้นปกติ"}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {actualSoilMoisture}%
            </span>
            <span className="text-xs text-slate-400">
              เกณฑ์เตือน: ≤ <strong className="text-amber-400">{draft.soilMoistureMinPct}%</strong>
              {draft.enableSoilMoistureHigh
                ? ` / ≥ ${draft.soilMoistureMaxPct}%`
                : ""}
            </span>
          </div>
          {/* Mini moisture level meter */}
          <div className="mt-2.5 w-full bg-[#162033] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSoilLowBreached
                  ? "bg-rose-500"
                  : isSoilHighBreached
                  ? "bg-amber-400"
                  : "bg-[#14B8A6]"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, actualSoilMoisture))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Daily Rain Probability */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isRainProbBreached
              ? "bg-sky-950/35 border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
              : "bg-[#0E1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <span>โอกาสเกิดฝนวันนี้ (เรดาร์ TMD)</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                isRainProbBreached
                  ? "bg-sky-500/25 text-sky-300 border border-sky-400/50"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {isRainProbBreached ? "เกินเกณฑ์เตือนฝน" : "ปกติ"}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {actualRainProb}%
            </span>
            <span className="text-xs text-slate-400">
              เกณฑ์เตือน: ≥ <strong className="text-sky-300">{draft.rainProbMaxPct}%</strong>
            </span>
          </div>
          {/* Mini rain probability meter */}
          <div className="mt-2.5 w-full bg-[#162033] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isRainProbBreached ? "bg-sky-400" : "bg-[#14B8A6]"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, actualRainProb))}%` }}
            />
          </div>
        </div>

        {/* Card 3: 14-Day Cumulative Forecast Rainfall */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isRain14dHighBreached || isRain14dLowBreached
              ? "bg-amber-950/30 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              : "bg-[#0E1526] border-[#1E293B]"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>ฝนสะสมล่วงหน้า 14 วัน</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                isRain14dHighBreached
                  ? "bg-sky-500/25 text-sky-300 border border-sky-400/50"
                  : isRain14dLowBreached
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {isRain14dHighBreached
                ? "ฝนสะสมสูงเกินเกณฑ์"
                : isRain14dLowBreached
                ? "ฝนสะสมต่ำ (เสี่ยงแล้ง)"
                : "ปกติ"}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between font-mono">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {actualRain14d.toFixed(1)} <span className="text-lg font-medium text-slate-400">มม.</span>
            </span>
            <span className="text-xs text-slate-400">
              เกณฑ์: ≤ <strong className="text-amber-400">{draft.rain14dMinMm}</strong> / ≥ <strong className="text-sky-300">{draft.rain14dMaxMm}</strong> มม.
            </span>
          </div>
          {/* Mini 14-day cumulative meter */}
          <div className="mt-2.5 w-full bg-[#162033] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isRain14dHighBreached
                  ? "bg-sky-400"
                  : isRain14dLowBreached
                  ? "bg-amber-400"
                  : "bg-[#14B8A6]"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (actualRain14d / (draft.rain14dMaxMm * 1.3)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Threshold Sliders Form */}
      <form onSubmit={handleSaveAndEvaluate} className="space-y-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT COLUMN: Soil Moisture Threshold Controls */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#14B8A6]/15 flex items-center justify-center text-[#2DD4BF]">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    1. ตั้งเกณฑ์แจ้งเตือนความชื้นดิน (Soil Moisture Threshold)
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    วัดด้วยดาวเทียม GISTDA Sentinel &amp; เซ็นเซอร์ IoT ประจำสถานี
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#2DD4BF] bg-[#14B8A6]/10 px-2.5 py-1 rounded-full border border-[#14B8A6]/30">
                ค่าจริง: {actualSoilMoisture}%
              </span>
            </div>

            {/* Minimum Soil Moisture (Drought / Water Deficit) */}
            <div className="space-y-2 bg-[#0E1526]/70 border border-[#1E293B] rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2.5 font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.enableSoilMoistureLow}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        enableSoilMoistureLow: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-[#334155] bg-[#0B101D] text-[#14B8A6] focus:ring-[#14B8A6]"
                  />
                  <span>เตือนเมื่อความชื้นดินต่ำกว่าเกณฑ์ (เสี่ยงขาดน้ำ/แล้ง)</span>
                </label>
                <span
                  className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-md ${
                    isSoilLowBreached
                      ? "bg-rose-500/25 text-rose-300 border border-rose-500/50"
                      : "bg-[#14B8A6]/15 text-[#2DD4BF] border border-[#14B8A6]/30"
                  }`}
                >
                  ≤ {draft.soilMoistureMinPct}%
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={55}
                step={1}
                disabled={!draft.enableSoilMoistureLow}
                value={draft.soilMoistureMinPct}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    soilMoistureMinPct: Number(e.target.value),
                  }))
                }
                className="w-full accent-[#14B8A6] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>15% (ดินแห้งจัด)</span>
                <span className="text-[#2DD4BF]">32% (เกณฑ์เริ่มขาดน้ำ)</span>
                <span>55% (ชุ่มชื้นสูง)</span>
              </div>
            </div>

            {/* Maximum Soil Moisture (Waterlogging / Root Rot) */}
            <div className="space-y-2 bg-[#0E1526]/70 border border-[#1E293B] rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2.5 font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.enableSoilMoistureHigh}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        enableSoilMoistureHigh: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-[#334155] bg-[#0B101D] text-amber-500 focus:ring-amber-500"
                  />
                  <span>เตือนเมื่อความชื้นดินสูงเกินเกณฑ์ (เสี่ยงดินแฉะ/รากเน่า)</span>
                </label>
                <span
                  className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-md ${
                    isSoilHighBreached
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/50"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  ≥ {draft.soilMoistureMaxPct}%
                </span>
              </div>
              <input
                type="range"
                min={45}
                max={85}
                step={1}
                disabled={!draft.enableSoilMoistureHigh}
                value={draft.soilMoistureMaxPct}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    soilMoistureMaxPct: Number(e.target.value),
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>45% (เริ่มชื้นจัด)</span>
                <span className="text-amber-400">62% (เสี่ยงรากเน่าทุเรียน/มันฯ)</span>
                <span>85% (ดินอิ่มตัวน้ำขัง)</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Rainfall Threshold Controls (% and mm) */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    2. ตั้งเกณฑ์แจ้งเตือนปริมาณฝน &amp; โอกาสเกิดฝน (Rainfall Threshold)
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    วิเคราะห์เรดาร์ TMD พิมาย &amp; แบบจำลองอุตุนิยมวิทยาเชิงพื้นที่
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30">
                วันนี้ {actualRainProb}% · 14 วัน {actualRain14d.toFixed(0)} มม.
              </span>
            </div>

            {/* Daily Rain Probability (%) */}
            <div className="space-y-2 bg-[#0E1526]/70 border border-[#1E293B] rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2.5 font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.enableRainProbHigh}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        enableRainProbHigh: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-[#334155] bg-[#0B101D] text-sky-500 focus:ring-sky-500"
                  />
                  <span>เตือนเมื่อโอกาสเกิดฝนวันนี้สูงเกินเกณฑ์ (งดพ่นปุ๋ย/สารชีวภัณฑ์)</span>
                </label>
                <span
                  className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-md ${
                    isRainProbBreached
                      ? "bg-sky-500/25 text-sky-300 border border-sky-400/50"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  ≥ {draft.rainProbMaxPct}%
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={90}
                step={5}
                disabled={!draft.enableRainProbHigh}
                value={draft.rainProbMaxPct}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    rainProbMaxPct: Number(e.target.value),
                  }))
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>25% (ฝนปรอย)</span>
                <span className="text-sky-300">60% (ฝนตกหนัก)</span>
                <span>90% (พายุฝนฟ้าคะนอง)</span>
              </div>
            </div>

            {/* 14-Day Cumulative Rainfall High & Low Thresholds (mm) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-2 bg-[#0E1526]/70 border border-[#1E293B] rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.enableRain14dLow}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          enableRain14dLow: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-[#334155] bg-[#0B101D] text-amber-500 focus:ring-amber-500"
                    />
                    <span>ฝน 14 วันต่ำกว่า (แล้ง)</span>
                  </label>
                  <span className="font-mono font-bold text-amber-400">
                    ≤ {draft.rain14dMinMm} มม.
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={85}
                  step={5}
                  disabled={!draft.enableRain14dLow}
                  value={draft.rain14dMinMm}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      rain14dMinMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 font-mono text-right">
                  เสี่ยงฝนทิ้งช่วงกระทบพืชไร่
                </div>
              </div>

              <div className="space-y-2 bg-[#0E1526]/70 border border-[#1E293B] rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.enableRain14dHigh}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          enableRain14dHigh: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-[#334155] bg-[#0B101D] text-sky-500 focus:ring-sky-500"
                    />
                    <span>ฝน 14 วันเกิน (น้ำท่วมขัง)</span>
                  </label>
                  <span className="font-mono font-bold text-sky-300">
                    ≥ {draft.rain14dMaxMm} มม.
                  </span>
                </div>
                <input
                  type="range"
                  min={65}
                  max={220}
                  step={5}
                  disabled={!draft.enableRain14dHigh}
                  value={draft.rain14dMaxMm}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      rain14dMaxMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 font-mono text-right">
                  เสี่ยงน้ำหลากลุ่มน้ำมูล/ลำพระเพลิง
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Live Simulation Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#1E293B]">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-all shadow-[0_4px_16px_rgba(20,184,166,0.3)] cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>
                บันทึกเกณฑ์ {selectedDistrict.nameTh} &amp; แจ้งเตือนทันทีเมื่อเกินเกณฑ์
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#101726] hover:bg-[#1E293B] border border-[#223147] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่ามาตรฐาน</span>
            </button>
          </div>

          {/* Instant Breach Toast Test Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ทดสอบส่ง Browser Toast:</span>
            </span>
            <button
              type="button"
              onClick={() => handleSimulateBreachToast("soil_drought")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span>จำลองความชื้นดินต่ำ</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulateBreachToast("heavy_rain")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>จำลองฝนตกหนักเกินเกณฑ์</span>
            </button>
            <button
              type="button"
              onClick={handleScanAllConfiguredDistricts}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14B8A6]/15 hover:bg-[#14B8A6]/25 border border-[#14B8A6]/40 text-[#2DD4BF] text-xs font-bold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>สแกนทุกอำเภอ</span>
            </button>
          </div>
        </div>

        {savedFeedback && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-4 py-3 text-xs font-medium text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{savedFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setSavedFeedback("")}
              className="text-emerald-400 hover:text-emerald-300 font-bold ml-3 cursor-pointer"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Active Breach Summary Callout if current district telemetry breaches draft thresholds */}
        {currentBreaches.length > 0 && (
          <div className="bg-rose-950/30 border border-rose-500/50 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                สถานะเฝ้าระวังล่าสุดของ {selectedDistrict.nameTh}: พบค่าตรวจวัดจริงทะลุเกณฑ์ที่บันทึกไว้ ({currentBreaches.length} รายการ)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentBreaches.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#080C16] border border-rose-500/35 hover:border-rose-400 rounded-xl p-3.5 text-xs flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-sm">{b.metricLabel}</div>
                    <div className="text-slate-300 font-mono text-xs">
                      ค่าจริง <strong className="text-rose-400 font-bold">{b.actualValueText}</strong>{" "}
                      <span className="text-slate-400 font-normal">({b.thresholdValueText})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      thresholdAlertStore.pushToasts([b], currentConfig)
                    }
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-sm"
                  >
                    แสดง Toast
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
