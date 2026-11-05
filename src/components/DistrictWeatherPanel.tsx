import React, { useState, useMemo } from "react";
import {
  KoratDistrict,
  KoratGeoPlotPin,
  KORAT_DISTRICTS,
  formatDistrictName,
} from "../data/koratAgriData";
import {
  Search,
  CloudLightning,
  CloudRain,
  CloudSun,
  Sun,
  X,
  Droplets,
  Thermometer,
  Radio,
  MapPin,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Wheat,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export type DistrictWeatherConditionKey =
  | "storm"
  | "rain"
  | "cloudy"
  | "sunny_drought";

export function getDistrictWeatherStatus(dist: KoratDistrict): {
  key: DistrictWeatherConditionKey;
  labelTh: string;
  shortTagTh: string;
  accentColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
} {
  if (dist.rainProbToday >= 65) {
    return {
      key: "storm",
      labelTh: "ฝนฟ้าคะนอง·พายุฝน",
      shortTagTh: "พายุ·ฝนหนัก",
      accentColor: "#38BDF8",
      bgClass: "bg-sky-500/15",
      borderClass: "border-sky-400/40",
      textClass: "text-sky-400",
    };
  }
  if (dist.rainProbToday >= 45) {
    return {
      key: "rain",
      labelTh: "มีโอกาสฝนตกปานกลาง",
      shortTagTh: "ฝนปานกลาง",
      accentColor: "#10B981",
      bgClass: "bg-emerald-500/15",
      borderClass: "border-emerald-400/40",
      textClass: "text-emerald-400",
    };
  }
  if (dist.rainProbToday >= 25) {
    return {
      key: "cloudy",
      labelTh: "เมฆบางส่วน·โปร่ง",
      shortTagTh: "เมฆบางส่วน",
      accentColor: "#FBBF24",
      bgClass: "bg-amber-500/15",
      borderClass: "border-amber-400/40",
      textClass: "text-amber-400",
    };
  }
  return {
    key: "sunny_drought",
    labelTh:
      dist.spi30d <= -1.4 ? "แดดจัด·แล้งจัดรุนแรง" : "แดดจัด·เฝ้าระวังแล้ง",
    shortTagTh: dist.spi30d <= -1.4 ? "แล้งรุนแรง" : "แดดจัด",
    accentColor: dist.spi30d <= -1.4 ? "#F87171" : "#F59E0B",
    bgClass: dist.spi30d <= -1.4 ? "bg-rose-500/15" : "bg-orange-500/15",
    borderClass:
      dist.spi30d <= -1.4 ? "border-rose-400/40" : "border-orange-400/40",
    textClass: dist.spi30d <= -1.4 ? "text-rose-400" : "text-orange-400",
  };
}

export const DistrictWeatherIcon: React.FC<{
  condition: DistrictWeatherConditionKey;
  className?: string;
}> = ({ condition, className = "w-4 h-4" }) => {
  if (condition === "storm") {
    return <CloudLightning className={`${className} text-sky-400`} />;
  }
  if (condition === "rain") {
    return <CloudRain className={`${className} text-emerald-400`} />;
  }
  if (condition === "cloudy") {
    return <CloudSun className={`${className} text-amber-400`} />;
  }
  return <Sun className={`${className} text-orange-400`} />;
};

interface DistrictWeatherPanelProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrictId: (id: string) => void;
  geoPlots: KoratGeoPlotPin[];
  onNavigateModule?: (mode: string, anchorId?: string) => void;
}

export const DistrictWeatherPanel: React.FC<DistrictWeatherPanelProps> = ({
  selectedDistrict,
  onSelectDistrictId,
  geoPlots,
  onNavigateModule,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherFilter, setWeatherFilter] = useState<
    "all" | DistrictWeatherConditionKey
  >("all");

  const districtIndex = KORAT_DISTRICTS.findIndex(
    (d) => d.id === selectedDistrict.id
  );
  const selectedStationCode = `NMA-${String(
    districtIndex >= 0 ? districtIndex + 1 : 1
  ).padStart(2, "0")}`;

  const isDroughtRisk =
    selectedDistrict.spi30d <= -1.0 ||
    selectedDistrict.droughtRiskLevel.includes("แล้ง") ||
    selectedDistrict.droughtRiskLevel.includes("ทิ้งช่วง");

  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return KORAT_DISTRICTS.map((dist, idx) => ({
      dist,
      code: `NMA-${String(idx + 1).padStart(2, "0")}`,
      pinCode: `AWS-30${String(idx + 1).padStart(2, "0")}`,
      weatherStatus: getDistrictWeatherStatus(dist),
    })).filter((item) => {
      if (
        weatherFilter !== "all" &&
        item.weatherStatus.key !== weatherFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.dist.nameTh.toLowerCase().includes(q) ||
        item.dist.nameEn.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.pinCode.toLowerCase().includes(q) ||
        item.dist.zone.toLowerCase().includes(q) ||
        item.weatherStatus.labelTh.toLowerCase().includes(q) ||
        item.dist.primaryCrops.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, weatherFilter]);

  // Major Korat Cash Crops 2x2 Grid Data
  const cropPrices = [
    {
      id: "cassava",
      nameTh: "มันสำปะหลังสด (25%)",
      price: "3.15",
      unit: "บาท/กก.",
      delta: "+0.05",
      isPositive: true,
      sub: "ลานมัน & แป้งมันโคราช",
      tag: "พืชเศรษฐกิจ #1",
    },
    {
      id: "jasmine_rice",
      nameTh: "ข้าวเปลือกหอมมะลิ 105",
      price: "15.85",
      unit: "บาท/กก.",
      delta: "+0.10",
      isPositive: true,
      sub: "ความชื้น 15% โรงสีทุ่งสัมฤทธิ์",
      tag: "ข้าวหอม GI โคราช",
    },
    {
      id: "feed_corn",
      nameTh: "ข้าวโพดเลี้ยงสัตว์",
      price: "10.65",
      unit: "บาท/กก.",
      delta: "-0.05",
      isPositive: false,
      sub: "ความชื้น 14.5% ไซโลอาหารสัตว์",
      tag: "โรงงานแปรรูป",
    },
    {
      id: "sugar_cane",
      nameTh: "อ้อยโรงงาน (10 C.C.S.)",
      price: "1,420",
      unit: "บาท/ตัน",
      delta: "+15.00",
      isPositive: true,
      sub: "โรงงานน้ำตาลครบุรี & พิมาย",
      tag: "ฤดูกาลหีบอ้อย",
    },
  ];

  return (
    <div className="space-y-5 pb-28 sm:pb-32">
      {/* ============================================================== */}
      {/* 1. WEATHER ALERT SUMMARY (Card with District Info & Advisory)  */}
      {/* ============================================================== */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
          isDark
            ? "bg-[#0B101D] border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* District & Status Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-700/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-800"
              }`}>
                <MapPin className="w-3 h-3 text-emerald-500" />
                {formatDistrictName(selectedDistrict.nameTh)}
              </span>
              <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                isDark ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-slate-100 text-slate-700"
              }`}>
                {selectedStationCode}
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {selectedDistrict.zone} · แปลงเกษตร {geoPlots.length} แปลง
            </p>
          </div>

          {/* Risk Level Badge */}
          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                isDroughtRisk
                  ? isDark
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-amber-50 border-amber-300 text-amber-800"
                  : isDark
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
              }`}
            >
              {isDroughtRisk ? (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              ) : (
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
              )}
              {selectedDistrict.droughtRiskLevel}
            </span>
            <div className={`text-[10px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              SPI-30d: <strong className={isDroughtRisk ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{selectedDistrict.spi30d}</strong>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <div className={`p-2.5 rounded-xl border text-center ${
            isDark ? "bg-[#080C16] border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-center gap-1 text-[11px] text-sky-400">
              <CloudRain className="w-3.5 h-3.5" />
              <span className="font-sans">ฝน 14 วัน</span>
            </div>
            <div className={`text-sm font-mono font-extrabold mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {selectedDistrict.forecastRain14dMm} <span className="text-[10px] font-normal text-slate-400">มม.</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border text-center ${
            isDark ? "bg-[#080C16] border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-center gap-1 text-[11px] text-teal-400">
              <Droplets className="w-3.5 h-3.5" />
              <span className="font-sans">ความชื้นดิน</span>
            </div>
            <div className={`text-sm font-mono font-extrabold mt-1 ${
              selectedDistrict.gistdaSoilMoisturePct < 35
                ? "text-amber-400"
                : isDark ? "text-white" : "text-slate-900"
            }`}>
              {selectedDistrict.gistdaSoilMoisturePct}%
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border text-center ${
            isDark ? "bg-[#080C16] border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-center gap-1 text-[11px] text-rose-400">
              <Thermometer className="w-3.5 h-3.5" />
              <span className="font-sans">อุณหภูมิ</span>
            </div>
            <div className={`text-xs font-mono font-extrabold mt-1 truncate ${isDark ? "text-white" : "text-slate-900"}`}>
              {selectedDistrict.minTempC}° - {selectedDistrict.maxTempC}°
            </div>
          </div>
        </div>

        {/* Agricultural Advisory */}
        <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
          isDroughtRisk
            ? isDark
              ? "bg-amber-950/20 border-amber-500/30 text-amber-200/90"
              : "bg-amber-50/80 border-amber-200 text-amber-900"
            : isDark
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200/90"
            : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
        }`}>
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <Wheat className="w-3.5 h-3.5 text-amber-400" />
            <span>คำแนะนำพืชหลัก ({selectedDistrict.primaryCrops.slice(0, 2).join(", ")}):</span>
          </div>
          <p>
            {isDroughtRisk
              ? "ดัชนีฝนทิ้งช่วง ความชื้นหน้าดินต่ำกว่า 40% แนะนำชะลอการหว่านปุ๋ยเคมีเม็ด และเปิดใช้น้ำหยดหรือคลุมฟางแปลงมันสำปะหลัง/อ้อย"
              : "ความชื้นผิวดินอยู่ในเกณฑ์สมดุล เหมาะต่อการบำรุงกอข้าวและมันสำปะหลัง หมั่นตรวจแปลงหลังฝนตก"}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CROP PRICE GRID (2x2 Layout of Korat Major Cash Crops)       */}
      {/* ============================================================== */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
          isDark
            ? "bg-[#0B101D] border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isDark ? "bg-emerald-400" : "bg-emerald-600"}`} />
            <h3 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              ราคารับซื้อผลผลิตหลัก (เฉลี่ยโคราช)
            </h3>
          </div>
          {onNavigateModule && (
            <button
              type="button"
              onClick={() => onNavigateModule("market", "module-market")}
              className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
                isDark ? "text-teal-400 hover:text-teal-300" : "text-emerald-700 hover:text-emerald-800"
              }`}
            >
              <span>ดูกราฟ 30 วัน</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {cropPrices.map((crop) => (
            <button
              key={crop.id}
              type="button"
              onClick={() => onNavigateModule?.("market", "module-market")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                isDark
                  ? "bg-[#080C16] border-slate-800 hover:border-teal-500/50 hover:bg-[#101728]"
                  : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded truncate ${
                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
                }`}>
                  {crop.tag}
                </span>
                <span
                  className={`inline-flex items-center text-[10px] font-mono font-bold ${
                    crop.isPositive ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {crop.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {crop.delta}
                </span>
              </div>

              <div className={`text-xs font-bold truncate group-hover:text-emerald-500 transition-colors ${
                isDark ? "text-slate-200" : "text-slate-900"
              }`}>
                {crop.nameTh}
              </div>

              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {crop.price}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {crop.unit}
                </span>
              </div>

              <p className={`text-[10px] truncate mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {crop.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DISTRICT WEATHER LIST (32 AWS Stations with Filter & Search) */}
      {/* ============================================================== */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm transition-colors ${
          isDark
            ? "bg-[#0B101D] border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Card Header with Real AWS Station Label */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                isDark
                  ? "bg-teal-500/20 text-[#2DD4BF] border border-teal-500/40"
                  : "bg-emerald-700 text-white"
              }`}
            >
              32
            </div>
            <div>
              <h2
                className={`text-sm sm:text-base font-extrabold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                32 สถานีตรวจวัด AWS ประจำอำเภอ
              </h2>
              <p
                className={`text-[11px] ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                คลิกเลือกอำเภอเพื่อสลับพิกัดพยากรณ์และราคารับซื้อทันที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold shrink-0 text-emerald-500">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">LIVE</span>
          </div>
        </div>

        {/* 1. Instant Search Input */}
        <div className="relative">
          <Search
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาอำเภอ เช่น ห้วยแถลง, พิมาย, ปากช่อง, บัวใหญ่..."
            aria-label="ค้นหาอำเภอในจังหวัดนครราชสีมา"
            className={`w-full text-xs rounded-xl pl-9 pr-9 py-2.5 border transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-[#080C16] border-slate-800 text-white placeholder-slate-500 focus:ring-teal-500/50 focus:border-teal-500"
                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-emerald-500/40 focus:border-emerald-600"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="ล้างคำค้นหา"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Weather Condition Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "ทั้งหมด (32)" },
              { id: "storm", label: "พายุ·ฝนหนัก" },
              { id: "rain", label: "ฝนปานกลาง" },
              { id: "cloudy", label: "เมฆบางส่วน" },
              { id: "sunny_drought", label: "แดดจัด·เสี่ยงแล้ง" },
            ] as const
          ).map((filterTab) => {
            const active = weatherFilter === filterTab.id;
            return (
              <button
                key={filterTab.id}
                type="button"
                onClick={() => setWeatherFilter(filterTab.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer min-h-[32px] ${
                  active
                    ? isDark
                      ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6] font-bold shadow-xs"
                      : "bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs"
                    : isDark
                    ? "bg-[#080C16] text-slate-300 border-slate-800 hover:border-slate-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {filterTab.id !== "all" && (
                  <DistrictWeatherIcon
                    condition={filterTab.id}
                    className="w-3 h-3"
                  />
                )}
                <span>{filterTab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. High-Contrast Scrollable District List (Touch target >= 44px) */}
        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {filteredDistricts.length === 0 ? (
            <div
              className={`p-8 text-center rounded-xl border text-xs ${
                isDark
                  ? "bg-[#080C16] border-slate-800 text-slate-400"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              ไม่พบอำเภอที่ตรงกับคำค้นหา "{searchQuery}"
            </div>
          ) : (
            filteredDistricts.map(({ dist, code, weatherStatus }) => {
              const isSelected = dist.id === selectedDistrict.id;

              return (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => onSelectDistrictId(dist.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between gap-3 cursor-pointer min-h-[52px] ${
                    isSelected
                      ? isDark
                        ? "bg-[#14233D] border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-md"
                        : "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
                      : isDark
                      ? "bg-[#080C16] border-slate-800 hover:border-slate-700 hover:bg-[#101728]"
                      : "bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Condition Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 ${weatherStatus.bgClass} ${weatherStatus.borderClass}`}
                    >
                      <DistrictWeatherIcon
                        condition={weatherStatus.key}
                        className="w-4 h-4"
                      />
                      <span
                        className={`text-[10px] font-mono font-bold leading-none mt-1 ${weatherStatus.textClass}`}
                      >
                        {dist.maxTempC}°
                      </span>
                    </div>

                    {/* District Name and Code */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold truncate ${
                            isSelected
                              ? isDark
                                ? "text-white"
                                : "text-emerald-950 font-extrabold"
                              : isDark
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          {formatDistrictName(dist.nameTh)}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                            isDark
                              ? "bg-slate-800 border-slate-700 text-slate-300"
                              : "bg-slate-200 border-slate-300 text-slate-700"
                          }`}
                        >
                          {code}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {dist.zone} ·{" "}
                        {dist.primaryCrops.slice(0, 2).join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Right Telemetry Numbers */}
                  <div className="text-right shrink-0 font-mono space-y-0.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[11px] text-slate-400 font-sans">
                        โอกาสฝน:
                      </span>
                      <span
                        className={`text-xs font-extrabold ${
                          dist.rainProbToday >= 50
                            ? isDark
                              ? "text-sky-400"
                              : "text-sky-600 font-bold"
                            : isDark
                            ? "text-emerald-400"
                            : "text-emerald-700"
                        }`}
                      >
                        {dist.rainProbToday}%
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400">
                      <span>ดิน {dist.gistdaSoilMoisturePct}%</span>
                      <span>·</span>
                      <span
                        className={
                          dist.spi30d <= -1.0
                            ? "text-amber-500 font-bold"
                            : ""
                        }
                      >
                        SPI {dist.spi30d}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
