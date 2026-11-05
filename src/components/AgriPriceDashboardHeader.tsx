import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  MapPin,
  ChevronDown,
  Check,
  Search,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { KORAT_DISTRICTS, KoratDistrict, formatDistrictName } from "../data/koratAgriData";

export interface AgriPriceDashboardHeaderProps {
  /** Currently selected district (defaults to Dan Khun Thot if not provided) */
  selectedDistrict?: KoratDistrict;
  /** Callback when user changes focus district via the interactive dropdown */
  onSelectDistrict?: (districtId: string) => void;
  /** Callback when clicking "← แสดงภาพรวมทั้งระบบ (ทุกโมดูล)" */
  onNavigateHome?: () => void;
  /** Callback when clicking "เปิดเครื่องคำนวณกำไรสุทธิ →" CTA */
  onOpenProfitCalculator?: () => void;
  /** Whether to render the top system status bar */
  showTopBar?: boolean;
  /** Whether to render the feature banner at the bottom */
  showFeatureBanner?: boolean;
}

/**
 * AgriPriceDashboardHeader
 * 
 * Redesigned, WCAG AA compliant agricultural price dashboard header with:
 * 1. Top Bar: Active status indicator (pulsing green dot) + Focus location + Global view navigation toggle
 * 2. Main Header: DIT/OAE data source breadcrumbs + Prominent H1 Title + Legible Subtitle + Interactive District Dropdown
 * 3. Feature Banner: Net profit & delayed harvest hidden costs calculator callout with gradient styling & CTA
 */
export const AgriPriceDashboardHeader: React.FC<AgriPriceDashboardHeaderProps> = ({
  selectedDistrict = KORAT_DISTRICTS.find((d) => d.id === "dan-khun-thot") || KORAT_DISTRICTS[1],
  onSelectDistrict,
  onNavigateHome,
  onOpenProfitCalculator,
  showTopBar = true,
  showFeatureBanner = true,
}) => {
  const { isDark } = useTheme();

  // Interactive District Selector Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute District Code (e.g. Dan Khun Thot is index 1 -> NMA-02)
  const districtIndex = KORAT_DISTRICTS.findIndex((d) => d.id === selectedDistrict.id);
  const stationCode = `NMA-${String((districtIndex >= 0 ? districtIndex : 1) + 1).padStart(2, "0")}`;

  // Filter 32 Korat districts for the interactive dropdown
  const filteredDistricts = KORAT_DISTRICTS.filter((d) => {
    if (!districtSearch.trim()) return true;
    const query = districtSearch.toLowerCase();
    return (
      d.nameTh.toLowerCase().includes(query) ||
      d.nameEn.toLowerCase().includes(query) ||
      d.zone.toLowerCase().includes(query)
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus search field when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle keyboard ESC to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen]);

  return (
    <header className="w-full space-y-4 font-sans transition-colors">
      {/* =========================================================================
          1. TOP BAR: System Status & Global Navigation
         ========================================================================= */}
      {showTopBar && (
        <section
          aria-label="สถานะระบบและการนำทาง"
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl border transition-all shadow-md ${
            isDark
              ? "bg-[#090E1A] border-slate-800 text-slate-100"
              : "bg-slate-900 border-slate-800 text-slate-100" // Intentional dark command bar for high contrast
          }`}
        >
          {/* Left: Active Live Status + Focus Location Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
            {/* Pulsing Green Live Status Dot */}
            <span className="relative flex h-2.5 w-2.5" title="ระบบกำลังทำงานและอัปเดตราคาแบบเรียลไทม์">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            </span>

            {/* Status Context & Focus Location */}
            <span className="font-medium text-emerald-400">โหมดแสดงผลเฉพาะโมดูล</span>
            <span className="text-slate-600 hidden xs:inline" aria-hidden="true">·</span>
            <span className="text-slate-300 font-medium hidden sm:inline">ราคารับซื้อผลผลิต</span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

            {/* Focus Location Text */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-xs">
              <span className="text-slate-300 font-sans">พื้นที่โฟกัส:</span>
              <strong className="text-amber-300 font-semibold">
                {formatDistrictName(selectedDistrict.nameTh)}
              </strong>
              <span className="text-teal-400 font-bold">({stationCode})</span>
            </div>
          </div>

          {/* Right: Global View Toggle Button */}
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/70 hover:bg-teal-900/80 active:scale-98 border border-teal-500/50 hover:border-teal-400 shadow-xs hover:shadow-teal-500/20 transition-all duration-150 cursor-pointer whitespace-nowrap self-start sm:self-auto min-h-[38px] focus:outline-hidden focus:ring-2 focus:ring-teal-400"
              title="สลับกลับไปดูภาพรวมทุกโมดูลในระบบ Korat SmartAgri"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>แสดงภาพรวมทั้งระบบ (ทุกโมดูล)</span>
            </button>
          )}
        </section>
      )}

      {/* =========================================================================
          2. MAIN HEADER SECTION: Breadcrumbs, Title, Subtitle, & District Selector
         ========================================================================= */}
      <section
        aria-label="หัวข้อราคาสินค้าเกษตรและตัวเลือกอำเภอ"
        className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-xs ${
          isDark
            ? "bg-[#0B101D] border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          {/* Left Column: Breadcrumbs + H1 Title + Subtitle */}
          <div className="space-y-1.5 max-w-3xl">
            {/* Data Source Breadcrumbs (High Contrast Teal / Deep Teal) */}
            <div
              className={`flex flex-wrap items-center gap-1.5 text-xs font-mono font-medium ${
                isDark ? "text-teal-400" : "text-teal-700 font-semibold"
              }`}
            >
              <span>สำนักงานเศรษฐกิจการเกษตร (สศก.)</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"} aria-hidden="true">·</span>
              <span>กรมการค้าภายใน (DIT)</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"} aria-hidden="true">·</span>
              <span>ราคารับซื้อหน้าโรงงานและลานมันโคราช</span>
            </div>

            {/* Primary Prominent Title (H1) - Strict WCAG Contrast: text-white in dark, text-slate-900 in light */}
            <h1
              className={`text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              ราคาผลผลิตทางการเกษตร
            </h1>

            {/* Subtitle - Crisp, legible contrast avoiding faint text */}
            <p
              className={`text-sm sm:text-base font-normal leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              กราฟแนวโน้มย้อนหลัง 30 วัน และเปรียบเทียบราคารับซื้อรายลาน
            </p>
          </div>

          {/* Right Column: Interactive Location Selector Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <div className="flex flex-col items-start lg:items-end gap-1">
              <span
                className={`text-[11px] font-mono ${
                  isDark ? "text-slate-400" : "text-slate-500 font-medium"
                }`}
              >
                จุดอ้างอิงคำนวณระยะทาง &amp; ค่าขนส่ง:
              </span>

              {/* Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
                className={`group flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer min-h-[44px] shadow-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 ${
                  isDark
                    ? "bg-[#0E1526] hover:bg-[#141E34] text-slate-200 border-slate-700/80 hover:border-amber-400/80"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-amber-500"
                }`}
                title="คลิกเพื่อเลือกอำเภออ้างอิงสำหรับการคำนวณระยะทางและราคารับซื้อ"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                    คำนวณระยะทางและราคาอ้างอิงจาก:
                  </span>
                  <strong className="text-amber-500 underline underline-offset-2 font-bold">
                    {formatDistrictName(selectedDistrict.nameTh)}
                  </strong>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>
            </div>

            {/* Dropdown Menu (32 Korat Districts with Search) */}
            {isDropdownOpen && (
              <div
                role="listbox"
                aria-label="รายชื่ออำเภอในจังหวัดนครราชสีมา 32 อำเภอ"
                className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? "bg-[#0E1526]/98 border-slate-700 text-slate-100 divide-y divide-slate-800"
                    : "bg-white/98 border-slate-300 text-slate-900 divide-y divide-slate-200"
                }`}
              >
                {/* Search Box Header */}
                <div className="p-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      isDark
                        ? "bg-[#080C16] border-slate-700/80 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      placeholder="ค้นหาชื่ออำเภอในโคราช..."
                      className="w-full bg-transparent text-xs focus:outline-hidden"
                    />
                    {districtSearch && (
                      <button
                        type="button"
                        onClick={() => setDistrictSearch("")}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                    <span>นครราชสีมา (32 อำเภอ)</span>
                    <span>พบ {filteredDistricts.length} รายการ</span>
                  </div>
                </div>

                {/* District Options List */}
                <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredDistricts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      ไม่พบอำเภอที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    filteredDistricts.map((d, idx) => {
                      const isSelected = d.id === selectedDistrict.id;
                      const dStationCode = `NMA-${String(
                        KORAT_DISTRICTS.findIndex((dist) => dist.id === d.id) + 1
                      ).padStart(2, "0")}`;

                      return (
                        <button
                          key={d.id}
                          role="option"
                          aria-selected={isSelected}
                          type="button"
                          onClick={() => {
                            if (onSelectDistrict) {
                              onSelectDistrict(d.id);
                            }
                            setIsDropdownOpen(false);
                            setDistrictSearch("");
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? isDark
                                ? "bg-amber-400/15 text-amber-300 font-bold border border-amber-400/40"
                                : "bg-amber-50 text-amber-900 font-bold border border-amber-300"
                              : isDark
                              ? "hover:bg-slate-800/80 text-slate-200"
                              : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-400 w-12">
                              {dStationCode}
                            </span>
                            <div>
                              <div className="font-medium">{formatDistrictName(d.nameTh)}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {d.nameEn} · โซน{d.zone}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURE BANNER: Harvest Delay & Net Profit Strategy Callout
         ========================================================================= */}
      {showFeatureBanner && (
        <section
          aria-label="แบนเนอร์แนะนำเครื่องคำนวณกำไรสุทธิ"
          className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-lg ${
            isDark
              ? "bg-gradient-to-r from-emerald-950/70 via-[#0A1320] to-[#090E1A] border-emerald-500/35"
              : "bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-300/80 shadow-emerald-500/5"
          }`}
        >
          {/* Ambient Glow Graphic in Corner */}
          <div
            className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Content Area: Trending Icon + Headline + Badge + Subtitle */}
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Rounded Trending Icon Container */}
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDark
                    ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>

              {/* Text Description */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    กำลังวางแผนชะลอการเก็บเกี่ยวเพื่อรอราคาดีขึ้น?
                  </h3>

                  {/* "ใหม่" (New) Emerald Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isDark
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>ใหม่</span>
                  </span>
                </div>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  คำนวณต้นทุนแฝง (ค่าแรงงาน, ความเสี่ยงสภาพอากาศ, โรคพืช, % แป้งลดลง) และเปรียบเทียบ{" "}
                  <strong className={isDark ? "text-emerald-300 font-semibold" : "text-emerald-800 font-bold"}>
                    “กำไรสุทธิแท้จริง (Net Profit)”
                  </strong>
                </p>
              </div>
            </div>

            {/* Right Action: Primary CTA Button */}
            {onOpenProfitCalculator && (
              <div className="shrink-0 self-start md:self-center">
                <button
                  type="button"
                  onClick={onOpenProfitCalculator}
                  className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 shadow-md hover:shadow-emerald-500/25 transition-all duration-200 cursor-pointer min-h-[42px] focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                >
                  <span>เปิดเครื่องคำนวณกำไรสุทธิ</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </header>
  );
};

export default AgriPriceDashboardHeader;
