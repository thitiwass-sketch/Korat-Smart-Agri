import React from "react";
import {
  KoratDistrict,
  KoratZone,
  KORAT_ZONES,
  formatDistrictName,
} from "../data/koratAgriData";
import {
  Sprout,
  Droplets,
  ArrowRight,
  FlaskConical,
  TrendingUp,
  ShieldAlert,
  Zap,
  BellRing,
  ShieldCheck,
  MapPin,
  Calendar,
  CloudRain,
  Sun,
  SlidersHorizontal,
  Compass,
  Layers,
  Thermometer,
  Sparkles,
} from "lucide-react";
import { DistrictThresholdConfiguratorCard } from "./ThresholdAlertSystem";
import { useTheme } from "../context/ThemeContext";
import type { ThresholdBreachToastItem } from "../utils/thresholdAlertStore";

interface HeroSectionProps {
  selectedDistrict: KoratDistrict;
  selectedStationCode: string;
  onNavigateModule: (mode: any, anchorId?: string) => void;
  onSelectDistrictId: (id: string) => void;
  activeZonePreset: string;
  setActiveZonePreset: (zone: string) => void;
  telemetryHorizonDays: number;
  setTelemetryHorizonDays: (days: number) => void;
  showQuickThresholdConfig: boolean;
  setShowQuickThresholdConfig: React.Dispatch<React.SetStateAction<boolean>>;
  currentConfig: {
    soilMoistureMinPct: number;
    rainProbMaxPct: number;
  };
  currentBreaches: ThresholdBreachToastItem[];
  onOpenCreatorModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedDistrict,
  selectedStationCode,
  onNavigateModule,
  onSelectDistrictId,
  activeZonePreset,
  setActiveZonePreset,
  telemetryHorizonDays,
  setTelemetryHorizonDays,
  showQuickThresholdConfig,
  setShowQuickThresholdConfig,
  currentConfig,
  currentBreaches,
  onOpenCreatorModal,
}) => {
  const { isDark } = useTheme();

  return (
    <section
      aria-labelledby="hero-heading"
      className={`border rounded-2xl p-5 sm:p-6 lg:p-7 space-y-6 shadow-md transition-colors ${
        isDark ? "bg-[#0B101D] border-[#1E293B]" : "bg-white border-slate-200"
      }`}
    >
      {/* =========================================================================
          1. COMPACT HERO TITLE + QUICK STAT BADGES
          - Clear visual hierarchy with prominent H1, spaced subtitle, and 4 quick stat cards
         ========================================================================= */}
      <div
        className={`rounded-2xl p-5 sm:p-6 space-y-4 border transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#10192D] via-[#0B1222] to-[#080C16] border-[#14B8A6]/40 shadow-sm"
            : "bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border-emerald-200/80 shadow-2xs"
        }`}
      >
        {/* Brand & Active Station Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono font-bold flex items-center gap-1.5 ${
                isDark ? "text-[#2DD4BF]" : "text-emerald-700"
              }`}
            >
              <Sprout className="w-4 h-4 shrink-0" />
              <span>Korat SmartAgri</span>
            </span>
            <span className={isDark ? "text-slate-600" : "text-slate-300"} aria-hidden="true">
              ·
            </span>
            <span className={isDark ? "text-slate-300 font-medium" : "text-slate-700 font-medium"}>
              แพลตฟอร์มเกษตรอัจฉริยะ 32 อำเภอ
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-amber-400"
                  : "bg-white border-slate-200 text-amber-700 shadow-2xs"
              }`}
            >
              สถานี {selectedStationCode} · {formatDistrictName(selectedDistrict.nameTh)}
            </span>
          </div>
        </div>

        {/* Compact Hero Headline (H1) */}
        <div>
          <h1
            id="hero-heading"
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            ศูนย์บัญชาการข้อมูลเกษตรอัจฉริยะ{" "}
            <span className={isDark ? "text-[#2DD4BF]" : "text-emerald-700"}>
              นครราชสีมา
            </span>
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1.5 leading-relaxed max-w-3xl ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            เชื่อมโยงข้อมูลดาวเทียมความชื้นดิน <strong>GISTDA</strong> และเรดาร์ตรวจวัดอากาศอัตโนมัติ (AWS) ครบ 32 อำเภอ พยากรณ์ฝนแม่นยำ ลดต้นทุนปุ๋ย เพิ่มผลผลิตและกำไรทุกฤดูกาล
          </p>
        </div>

        {/* Quick Stat Badges (4 Key Telemetry Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Stat 1: ความชื้นดิน GISTDA */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
              isDark
                ? "bg-[#080C16] border-[#1E293B]"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Droplets className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>ความชื้นดิน GISTDA</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-lg sm:text-xl font-bold font-mono ${isDark ? "text-teal-400" : "text-teal-700"}`}>
                {selectedDistrict.gistdaSoilMoisturePct}%
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedDistrict.gistdaSoilMoisturePct >= 40
                  ? "ชื้นเหมาะสม"
                  : selectedDistrict.gistdaSoilMoisturePct >= 28
                  ? "เฝ้าระวังดินแห้ง"
                  : "วิกฤตดินแล้ง"}
              </span>
            </div>
          </div>

          {/* Stat 2: โอกาสฝนวันนี้ */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
              isDark
                ? "bg-[#080C16] border-[#1E293B]"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>โอกาสฝนวันนี้</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-lg sm:text-xl font-bold font-mono ${isDark ? "text-sky-400" : "text-sky-700"}`}>
                {selectedDistrict.rainProbToday}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                14วัน: {selectedDistrict.forecastRain14dMm}มม.
              </span>
            </div>
          </div>

          {/* Stat 3: อุณหภูมิอากาศ */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
              isDark
                ? "bg-[#080C16] border-[#1E293B]"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>อุณหภูมิอากาศ</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-lg sm:text-xl font-bold font-mono ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                {selectedDistrict.maxTempC}°C
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ต่ำสุด {selectedDistrict.minTempC}°C
              </span>
            </div>
          </div>

          {/* Stat 4: ดัชนีแล้ง SPI */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
              isDark
                ? "bg-[#080C16] border-[#1E293B]"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>ดัชนีแล้ง SPI-30d</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={`text-lg sm:text-xl font-bold font-mono ${
                  selectedDistrict.spi30d <= -1.4
                    ? "text-rose-400"
                    : selectedDistrict.spi30d <= -0.8
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {selectedDistrict.spi30d}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {selectedDistrict.droughtRiskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. 2 PRIMARY ACTION BUTTONS (Scan AI / Map)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Button 1: สแกนโรคพืช & ปุ๋ย AI (Primary Scan AI Button) */}
        <button
          type="button"
          onClick={() => onNavigateModule("all", "module-cost")}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[48px]"
        >
          <FlaskConical className="w-4 h-4 shrink-0 text-slate-950" />
          <span>สแกนโรคพืช &amp; ปุ๋ย AI</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>

        {/* Button 2: เริ่มสำรวจพื้นที่ GIS (32 อำเภอ) (Primary Map Button) */}
        <button
          type="button"
          onClick={() => onNavigateModule("all", "module-weather")}
          className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border font-bold text-sm transition-all shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[48px] ${
            isDark
              ? "bg-[#10192D] hover:bg-[#14233D] text-[#38BDF8] border-[#38BDF8]/40 hover:border-[#38BDF8]"
              : "bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-300"
          }`}
        >
          <Compass className="w-4 h-4 shrink-0 text-sky-400" />
          <span>เริ่มสำรวจพื้นที่ GIS (32 อำเภอ)</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* =========================================================================
          3. QUICK SERVICES GRID (6 CARDS)
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            ทางลัดบริการด่วน (Quick Services)
          </span>
          <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            แตะเพื่อเข้าสู่มอดูลหลักทันที
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Card 1: พยากรณ์ฝน & เรดาร์ดาวเทียม */}
          <button
            type="button"
            onClick={() => onNavigateModule("all", "module-weather")}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer min-h-[58px] flex items-center gap-3 ${
              isDark
                ? "bg-[#080C16] border-[#1E293B] hover:border-[#14B8A6]/60 hover:bg-[#101728]"
                : "bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-white shadow-2xs"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isDark ? "bg-[#14B8A6]/20 text-[#2DD4BF]" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              <CloudRain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                พยากรณ์ฝน &amp; เรดาร์
              </div>
              <div className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                GISTDA และ AWS 32 อำเภอ
              </div>
            </div>
          </button>

          {/* Card 2: ราคารับซื้อผลผลิตหน้าลาน */}
          <button
            type="button"
            onClick={() => onNavigateModule("all", "module-market")}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer min-h-[58px] flex items-center gap-3 ${
              isDark
                ? "bg-[#080C16] border-[#1E293B] hover:border-[#14B8A6]/60 hover:bg-[#101728]"
                : "bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-white shadow-2xs"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isDark ? "bg-[#14B8A6]/20 text-[#2DD4BF]" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                ราคารับซื้อผลผลิต
              </div>
              <div className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                ลานมัน·โรงงานน้ำตาล
              </div>
            </div>
          </button>

          {/* Card 3: จับคู่สายพันธุ์พืช AI */}
          <button
            type="button"
            onClick={() => onNavigateModule("all", "module-variety-matcher")}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer min-h-[58px] flex items-center gap-3 ${
              isDark
                ? "bg-[#080C16] border-[#1E293B] hover:border-teal-500/60 hover:bg-[#101728]"
                : "bg-slate-50 border-slate-200 hover:border-teal-400 hover:bg-white shadow-2xs"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                จับคู่สายพันธุ์พืช AI
              </div>
              <div className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                ดิน-น้ำ-อุณหภูมิรายอำเภอ
              </div>
            </div>
          </button>

          {/* Card 4: ปุ๋ยสั่งตัด & ธาตุอาหารดิน */}
          <button
            type="button"
            onClick={() => onNavigateModule("all", "module-cost")}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer min-h-[58px] flex items-center gap-3 ${
              isDark
                ? "bg-amber-950/20 border-amber-900/40 hover:border-amber-500/60 hover:bg-amber-950/30"
                : "bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:bg-white shadow-2xs"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isDark ? "text-amber-200" : "text-amber-900"}`}>
                ปุ๋ยสั่งตัด &amp; ดิน
              </div>
              <div className={`text-[10px] truncate ${isDark ? "text-amber-400/80" : "text-amber-700/80"}`}>
                สูตรแม่ปุ๋ยตามค่าดิน
              </div>
            </div>
          </button>

          {/* Card 5: โซนชลประทาน & แหล่งน้ำ */}
          <button
            type="button"
            onClick={() => onNavigateModule("all", "module-irrigation")}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer min-h-[58px] flex items-center gap-3 ${
              isDark
                ? "bg-sky-950/20 border-sky-900/40 hover:border-sky-500/60 hover:bg-sky-950/30"
                : "bg-sky-50/60 border-sky-200 hover:border-sky-400 hover:bg-white shadow-2xs"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isDark ? "text-sky-200" : "text-sky-900"}`}>
                โซนชลประทาน
              </div>
              <div className={`text-[10px] truncate ${isDark ? "text-sky-400/80" : "text-sky-700/80"}`}>
                คลองส่งน้ำ &amp; อ่าง 4 แห่ง
              </div>
            </div>
          </button>

          {/* Card 6: ปฏิทินเพาะปลูก 4 โซน */}
          <button
            type="button"
            onClick={() => onNavigateModule("all", "module-calendar")}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer min-h-[58px] flex items-center gap-3 ${
              isDark
                ? "bg-[#080C16] border-[#1E293B] hover:border-[#14B8A6]/60 hover:bg-[#101728]"
                : "bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-white shadow-2xs"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                ปฏิทินเพาะปลูก
              </div>
              <div className={`text-[10px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                รอบฤดูกาล 4 โซนโคราช
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. WEATHER RISK & SOIL ALERT BANNER
         ========================================================================= */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all space-y-3 ${
          isDark
            ? "bg-gradient-to-r from-amber-950/40 via-[#0B101D] to-[#080C16] border-amber-500/40 shadow-sm"
            : "bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-300 shadow-2xs"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-xs sm:text-sm font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  การแจ้งเตือนสภาพอากาศและดิน: {formatDistrictName(selectedDistrict.nameTh)}
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    selectedDistrict.droughtRiskLevel === "วิกฤตแล้งรุนแรง"
                      ? "bg-rose-500/20 text-rose-300 border-rose-400/40"
                      : selectedDistrict.droughtRiskLevel === "เฝ้าระวังฝนทิ้งช่วง"
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                  }`}
                >
                  {selectedDistrict.droughtRiskLevel}
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {selectedDistrict.extremeAlertTitle}
              </p>
            </div>
          </div>

          <div className="btn-group-mobile w-full sm:w-auto shrink-0 self-stretch sm:self-center">
            <button
              type="button"
              onClick={() => onNavigateModule("all", "module-alerts")}
              className="btn-mobile-full text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-2xs cursor-pointer rounded-xl"
            >
              <span>ดูเกณฑ์รับมือภัยแล้ง</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowQuickThresholdConfig((prev) => !prev)}
              className={`btn-mobile-full border text-xs font-semibold transition-colors cursor-pointer rounded-xl ${
                isDark
                  ? "bg-[#080C16] border-[#1E293B] text-slate-300 hover:text-white"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1.5" />
              <span>{showQuickThresholdConfig ? "ซ่อนเกณฑ์" : "ตั้งเกณฑ์เตือน"}</span>
            </button>
          </div>
        </div>

        {/* Detailed Advisory & Crop Stage Info */}
        <div
          className={`text-xs p-3 rounded-xl border space-y-1 font-mono ${
            isDark ? "bg-[#080C16]/80 border-slate-800 text-slate-300" : "bg-white border-amber-200 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <span><strong>คำแนะนำแปลง:</strong> {selectedDistrict.extremeAlertDetail}</span>
          </div>
          <div className="text-[11px] text-amber-500">
            <strong>ระยะพืชที่ต้องเฝ้าระวัง:</strong> {selectedDistrict.affectedCropStage} · ชุดดิน: {selectedDistrict.soilSeriesName}
          </div>
        </div>

        {/* Dropdown Threshold Form if opened */}
        {showQuickThresholdConfig && (
          <div className="pt-2">
            <DistrictThresholdConfiguratorCard
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrictId}
              compactMode
            />
          </div>
        )}
      </div>

      {/* Spatial 4-Zone Presets Selector */}
      <div className="space-y-2 pt-2 border-t border-slate-700/40">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            เลือกตามโซนเกษตร (4 โซนภูมิสารสนเทศ)
          </span>
          <span className={`text-[11px] font-mono ${isDark ? "text-[#2DD4BF]" : "text-emerald-700"}`}>
            โซนปัจจุบัน: {selectedDistrict.zone}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KORAT_ZONES.map((zone: KoratZone) => {
            const isSelected = activeZonePreset === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  setActiveZonePreset(zone.id);
                  onSelectDistrictId(zone.repDistrictId);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6] font-bold shadow-xs"
                      : "bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs"
                    : isDark
                    ? "bg-[#080C16] border-[#1E293B] text-slate-300 hover:bg-[#121B30]"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? (isDark ? "text-[#041E1C]" : "text-white") : "text-emerald-500"
                    }`}
                  />
                  <span className="truncate">{zone.title}</span>
                </div>
                <div
                  className={`text-[10px] mt-0.5 truncate font-mono ${
                    isSelected
                      ? isDark ? "text-[#041E1C]/80" : "text-white/80"
                      : isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {zone.rangeLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator Attribution Footnote */}
      <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>ระบบมาตรฐานข้อมูลเปิดภาครัฐ TMD, GISTDA และกระทรวงเกษตรฯ</span>
        </div>
        <button
          type="button"
          onClick={onOpenCreatorModal}
          className="font-mono text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
        >
          พัฒนาโดย: ฐิติวัสส์ กาญจนพิมาย ↗
        </button>
      </div>
    </section>
  );
};
