import React, { useState, useRef, useEffect } from "react";
import {
  KORAT_DISTRICTS,
  KoratDistrict,
} from "../data/koratAgriData";
import {
  Sprout,
  GraduationCap,
  Download,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  CloudRain,
  ThermometerSun,
  Layers,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  LineChart,
  ShieldAlert,
  Handshake,
  MessageSquare,
  QrCode,
  Droplets,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PWAInstallButton, OfflineIndicator } from "./ServiceWorkerPushControlPanel";
import { useTheme } from "../context/ThemeContext";

export interface NavCategory {
  id: string;
  labelTh: string;
  items: {
    id: string;
    labelTh: string;
    subLabelTh?: string;
    anchorId?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "climate_forecast",
    labelTh: "ภูมิอากาศ & พยากรณ์",
    items: [
      {
        id: "weather",
        labelTh: "พยากรณ์ฝน & แผนที่ความชื้น",
        subLabelTh: "เรดาร์ดาวเทียม GISTDA และ AWS 32 อำเภอ",
        anchorId: "module-weather",
        icon: CloudRain,
      },
      {
        id: "climate_heatmap",
        labelTh: "แผนที่จุลภูมิอากาศ (Climate Heatmap)",
        subLabelTh: "ความร้อน อุณหภูมิ ดิน และชั้นข้อมูล GIS",
        anchorId: "module-climate-heatmap",
        icon: Layers,
      },
      {
        id: "alerts",
        labelTh: "ศูนย์แจ้งเตือนภัยแล้ง & ดรรชนี SPI",
        subLabelTh: "ประเมินฝนทิ้งช่วงและสัญญาณเตือนวิกฤต",
        anchorId: "module-alerts",
        icon: ThermometerSun,
      },
      {
        id: "irrigation",
        labelTh: "โซนชลประทาน & จัดสรรน้ำ",
        subLabelTh: "คลองส่งน้ำ อ่างเก็บน้ำหลัก 4 แห่ง",
        anchorId: "module-irrigation",
        icon: Droplets,
      },
    ],
  },
  {
    id: "smart_agri",
    labelTh: "การเกษตรอัจฉริยะ",
    items: [
      {
        id: "variety_matcher",
        labelTh: "จับคู่สายพันธุ์พืช AI",
        subLabelTh: "คัดเลือกพันธุ์ตามสภาพดิน-น้ำประจำอำเภอ",
        anchorId: "module-variety-matcher",
        icon: Sparkles,
        badge: "AI",
        badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      },
      {
        id: "calendar",
        labelTh: "ปฏิทินเพาะปลูกอัจฉริยะ",
        subLabelTh: "ไทม์ไลน์ปลูก-ใส่ปุ๋ย-เก็บเกี่ยว 4 โซนโคราช",
        anchorId: "module-calendar",
        icon: Calendar,
      },
      {
        id: "cost",
        labelTh: "ต้นทุน & ปุ๋ยสั่งตัดรายอำเภอ",
        subLabelTh: "สูตรปุ๋ยเคมีตามค่าวิเคราะห์ดิน กรมพัฒนาที่ดิน",
        anchorId: "module-cost",
        icon: Coins,
      },
      {
        id: "fertilizer_efficiency",
        labelTh: "วิเคราะห์ความคุ้มค่าปุ๋ย (ROI)",
        subLabelTh: "คำนวณกำไรส่วนต่างต่อไร่ก่อนสั่งซื้อ",
        anchorId: "module-fertilizer-efficiency",
        icon: LineChart,
      },
      {
        id: "pest_alerts",
        labelTh: "เตือนภัยโรค & แมลงศัตรูพืช",
        subLabelTh: "SLCMV มันสำปะหลัง, หนอนกระทู้ข้าวโพด",
        anchorId: "module-pest-alerts",
        icon: ShieldAlert,
        badge: "เฝ้าระวัง",
        badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      },
      {
        id: "clinic",
        labelTh: "คลินิกเกษตร AI วินิจฉัยโรค",
        subLabelTh: "สแกนภาพใบพืชและแนะนำวิธีรักษา",
        anchorId: "module-clinic",
        icon: ShieldCheck,
      },
      {
        id: "qrcode",
        labelTh: "สร้าง QR Code แปลงเกษตร",
        subLabelTh: "ตรวจสอบย้อนกลับมาตรฐาน GAP / ส่งออก",
        anchorId: "module-qrcode",
        icon: QrCode,
      },
    ],
  },
  {
    id: "market_prices",
    labelTh: "ตลาด & ราคา",
    items: [
      {
        id: "market",
        labelTh: "ราคารับซื้อผลผลิตหน้าลานมัน/โรงงาน",
        subLabelTh: "มันสำปะหลัง อ้อย ข้าวโพด ข้าวหอมมะลิ",
        anchorId: "module-market",
        icon: DollarSign,
      },
      {
        id: "forecast",
        labelTh: "วิเคราะห์แนวโน้มราคา AI (30 วัน)",
        subLabelTh: "พยากรณ์ทิศทางราคาเพื่อจังหวะเก็บเกี่ยวที่ดีสุด",
        anchorId: "module-forecast",
        icon: TrendingUp,
        badge: "AI 30d",
        badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      },
      {
        id: "income",
        labelTh: "รายได้คาดการณ์รายเดือน",
        subLabelTh: "จำลองกระแสเงินสดและผลตอบแทนตามแปลง",
        anchorId: "module-income",
        icon: Coins,
      },
      {
        id: "crops",
        labelTh: "ข้อมูลพืชเศรษฐกิจโคราช",
        subLabelTh: "สถิติผลผลิตต่อไร่และรอบฤดูกาล",
        anchorId: "module-crops",
        icon: Sprout,
      },
      {
        id: "fruits",
        labelTh: "ผลไม้พรีเมียม GI (ทุเรียน/เงาะ)",
        subLabelTh: "ทุเรียนปากช่อง GI, ทุเรียนน้ำแร่เสิงสาง",
        anchorId: "module-fruits",
        icon: Sparkles,
      },
      {
        id: "drought",
        labelTh: "ภัยแล้ง & สิทธิชดเชย กษ.01",
        subLabelTh: "ตรวจสอบเกณฑ์เยียวยาภัยพิบัติด้านพืช",
        anchorId: "module-drought",
        icon: CheckCircle2,
      },
    ],
  },
  {
    id: "community_network",
    labelTh: "เสวนา & เครือข่าย",
    items: [
      {
        id: "forum",
        labelTh: "เสวนาเกษตรกรโคราช (เว็บบอร์ด)",
        subLabelTh: "แลกเปลี่ยนประสบการณ์ ถาม-ตอบ 32 อำเภอ",
        anchorId: "module-forum",
        icon: MessageSquare,
        badge: "ถาม-ตอบ",
        badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      },
      {
        id: "partnerships",
        labelTh: "พันธมิตร 4P & สินเชื่อ ธ.ก.ส.",
        subLabelTh: "ดอกเบี้ยพิเศษ 2.5% และโบนัสรับซื้อโรงงาน",
        anchorId: "module-partnerships",
        icon: Handshake,
        badge: "ดอกเบี้ย 2.5%",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
    ],
  },
];

interface HeaderNavProps {
  selectedDistrict: KoratDistrict;
  selectedStationCode: string;
  selectedDistrictId: string;
  onSelectDistrictId: (id: string) => void;
  viewMode: string;
  onNavigateModule: (mode: string, anchorId?: string) => void;
  onExportCsv: () => void;
  onOpenCreatorModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  selectedDistrict,
  selectedStationCode,
  selectedDistrictId,
  onSelectDistrictId,
  viewMode,
  onNavigateModule,
  onExportCsv,
  onOpenCreatorModal,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDropdownItemClick = (mode: string, anchorId?: string) => {
    onNavigateModule(mode, anchorId);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  // Find active category
  const isCategoryActive = (category: NavCategory) => {
    return category.items.some((item) => item.id === viewMode);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors shadow-sm">
      {/* Top Main Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Brand Identity + Academic Attribution */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNavigateModule("all");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            aria-label="กลับสู่หน้าภาพรวม Korat SmartAgri"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                isDark
                  ? "bg-[#14B8A6]/15 border border-[#14B8A6]/50 text-[#2DD4BF] group-hover:bg-[#14B8A6] group-hover:text-[#041E1C]"
                  : "bg-emerald-600 text-white shadow-sm group-hover:bg-emerald-700"
              }`}
            >
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className={`text-base sm:text-lg font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Korat
                </span>
                <span className={isDark ? "text-[#2DD4BF] font-extrabold text-base sm:text-lg" : "text-emerald-700 font-extrabold text-base sm:text-lg"}>
                  SmartAgri
                </span>
              </div>
              <p className={`text-[11px] font-mono leading-tight mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                ระบบสารสนเทศเกษตรอัจฉริยะ · 32 อำเภอ
              </p>
            </div>
          </button>

          {/* Creator Attribution (Compact button) */}
          <button
            type="button"
            onClick={onOpenCreatorModal}
            className={`hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
              isDark
                ? "bg-[#0B101D]/90 hover:bg-[#111A2E] border-[#1E293B] text-slate-300 hover:text-white hover:border-[#14B8A6]/60"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 shadow-2xs"
            }`}
            title="คลิกเพื่อดูข้อมูลผู้พัฒนา: ฐิติวัสส์ กาญจนพิมาย (มรภ.นครราชสีมา)"
          >
            <GraduationCap className={`w-3.5 h-3.5 ${isDark ? "text-[#FBBF24]" : "text-amber-600"}`} />
            <span className="font-semibold text-[11px]">
              ฐิติวัสส์ กาญจนพิมาย
            </span>
            <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              (มรภ.นครราชสีมา)
            </span>
          </button>
        </div>

        {/* Right Controls: District Selector, Theme Toggle, CSV Export, PWA, Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick District Selector (Touch Target >= 44px) */}
          <div
            className={`rounded-xl px-3 py-1.5 flex items-center gap-2 border text-xs transition-colors min-h-[44px] ${
              isDark
                ? "bg-[#0F172A] border-[#22324B] text-white"
                : "bg-white border-slate-300 text-slate-800 shadow-2xs"
            }`}
          >
            <span className={`font-mono font-bold hidden md:inline text-[11px] ${isDark ? "text-[#2DD4BF]" : "text-emerald-700"}`}>
              {selectedStationCode}
            </span>
            <span className="text-slate-400 hidden md:inline">·</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => onSelectDistrictId(e.target.value)}
              aria-label="เลือกอำเภอเป้าหมาย"
              className={`text-xs font-semibold bg-transparent focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px] min-h-[44px] ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              {KORAT_DISTRICTS.map((dist, idx) => (
                <option
                  key={dist.id}
                  value={dist.id}
                  className={isDark ? "bg-[#0B101D] text-white" : "bg-white text-slate-900"}
                >
                  {String(idx + 1).padStart(2, "0")} · {dist.nameTh} (ฝน {dist.rainProbToday}%)
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button (☀️ / 🌙) - Touch Target >= 44x44px */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isDark
                ? "bg-[#0F172A] border-[#22324B] text-amber-400 hover:bg-[#1E293B] hover:text-amber-300"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
            }`}
            title={isDark ? "สลับเป็นโหมดสว่าง (Light Mode สำหรับใช้งานกลางแจ้ง)" : "สลับเป็นโหมดมืด (Dark Mode สำหรับการถนอมสายตา)"}
            aria-label={isDark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* PWA Install */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* CSV Export - Touch Target >= 44px */}
          <button
            type="button"
            onClick={onExportCsv}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[44px] ${
              isDark
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
                : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
            }`}
            title="ส่งออกรายงานข้อมูลสถานการณ์เกษตรทั้ง 32 อำเภอ เป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          {/* Mobile Hamburger Toggle Button (Touch Target >= 44px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`lg:hidden min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "bg-[#0F172A] border-[#22324B] text-white hover:bg-[#1E293B]"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-2xs"
            }`}
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนูหลัก"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-rose-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <OfflineIndicator />

      {/* Desktop Main Navigation Bar: Consolidated into Clean Categorized Dropdowns */}
      <nav
        aria-label="แถบเมนูหมวดหมู่หลัก"
        ref={dropdownRef}
        className={`hidden lg:flex items-center gap-1.5 px-4 sm:px-6 lg:px-8 py-1.5 border-t text-xs font-medium ${
          isDark
            ? "border-[#1E293B]/80 bg-[#080C16]/90 text-slate-300"
            : "border-slate-200 bg-slate-50/90 text-slate-700"
        }`}
      >
        {/* Direct Link: ภาพรวมทั้งระบบ (Overview) */}
        <button
          type="button"
          onClick={() => {
            onNavigateModule("all");
            setActiveDropdown(null);
          }}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
            viewMode === "all"
              ? isDark
                ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                : "bg-emerald-700 text-white shadow-xs"
              : isDark
              ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>ภาพรวมทั้งระบบ</span>
        </button>

        {/* Categorized Dropdowns */}
        {NAV_CATEGORIES.map((category) => {
          const isCategoryOpen = activeDropdown === category.id;
          const hasActiveChild = isCategoryActive(category);

          return (
            <div key={category.id} className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(isCategoryOpen ? null : category.id)
                }
                className={`px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
                  hasActiveChild
                    ? isDark
                      ? "bg-[#14B8A6]/20 text-[#2DD4BF] border border-[#14B8A6]/50"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : isCategoryOpen
                    ? isDark
                      ? "bg-slate-800 text-white"
                      : "bg-slate-200 text-slate-900"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                aria-expanded={isCategoryOpen}
              >
                <span>{category.labelTh}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Flyout */}
              {isCategoryOpen && (
                <div
                  className={`absolute top-full left-0 mt-1.5 w-80 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isDark
                      ? "bg-[#0B101D] border-[#1E293B] text-slate-200"
                      : "bg-white border-slate-200 text-slate-800 shadow-xl"
                  }`}
                >
                  <div className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider border-b mb-1 ${
                    isDark ? "text-slate-400 border-[#1E293B]" : "text-slate-500 border-slate-100"
                  }`}>
                    หมวด: {category.labelTh}
                  </div>

                  <div className="flex flex-col items-center w-full gap-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = viewMode === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleDropdownItemClick(item.id, item.anchorId)
                          }
                          className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl transition-all flex items-center justify-center text-center gap-2 cursor-pointer group ${
                            isItemActive
                              ? isDark
                                ? "bg-[#14B8A6]/20 text-[#2DD4BF] font-bold"
                                : "bg-emerald-50 text-emerald-800 font-bold"
                              : isDark
                              ? "hover:bg-[#131D33] text-slate-200"
                              : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-bold truncate">
                            {item.labelTh}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor || ""}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Responsive Hamburger Mobile/Tablet Drawer (Screens < lg) */}
      {mobileMenuOpen && (
        <>
          {/* Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="เมนูหลักระบบสารสนเทศเกษตรโคราช"
            className={`lg:hidden border-t max-h-[80vh] overflow-y-auto px-4 py-5 animate-in slide-in-from-top-3 duration-200 relative z-40 ${
              isDark
                ? "bg-[#080C16] border-[#1E293B] text-slate-200"
                : "bg-white border-slate-200 text-slate-800 shadow-xl"
            }`}
          >
            {/* Centered Max-Width Container for Mobile Device Screens */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center space-y-4">
              {/* Quick Overview button */}
              <button
                type="button"
                onClick={() => {
                  onNavigateModule("all");
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-[48px] h-12 px-4 rounded-xl font-bold flex items-center justify-center text-center gap-2.5 transition-all cursor-pointer ${
                  viewMode === "all"
                    ? isDark
                      ? "bg-[#14B8A6] text-[#041E1C] shadow-sm"
                      : "bg-emerald-700 text-white shadow-sm"
                    : isDark
                    ? "bg-[#111827] text-white hover:bg-[#1a2336]"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                <Sprout className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">ภาพรวมระบบ (ทุกโมดูล)</span>
              </button>

              {/* Grouped Mobile Categories: Container with Flexbox items-center and w-full */}
              {NAV_CATEGORIES.map((category) => (
                <div key={category.id} className="w-full flex flex-col items-center space-y-2">
                  <div
                    className={`text-xs font-mono font-bold uppercase tracking-wider text-center w-full px-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {category.labelTh}
                  </div>

                  {/* Menu Items Container: flex flex-col items-center */}
                  <div className="flex flex-col items-center w-full gap-2">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = viewMode === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleDropdownItemClick(item.id, item.anchorId)
                          }
                          className={`w-full min-h-[48px] h-12 px-4 rounded-xl transition-all flex items-center justify-center text-center gap-2.5 cursor-pointer ${
                            isItemActive
                              ? isDark
                                ? "bg-[#14B8A6]/20 border border-[#14B8A6]/60 text-[#2DD4BF] font-bold shadow-xs"
                                : "bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold shadow-xs"
                              : isDark
                              ? "bg-[#0E1525] border border-[#1E293B] text-slate-200 hover:bg-[#16223A]"
                              : "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-bold truncate">
                            {item.labelTh}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                item.badgeColor || ""
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Bottom Mobile Actions: Creator & CSV */}
              <div className="w-full pt-3 border-t border-slate-700/30 flex flex-col items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onOpenCreatorModal();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[48px] h-12 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center text-center gap-2 transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#0B101D] border-[#1E293B] text-slate-300 hover:text-white"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">ผู้ออกแบบและพัฒนา: ฐิติวัสส์ กาญจนพิมาย (มรภ.นครราชสีมา)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportCsv();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center text-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>ดาวน์โหลดรายงาน CSV 32 อำเภอ</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR (Screens < lg)
          Fast thumb navigation for mobile users with 44x44px minimum touch targets
          ========================================================================= */}
      <nav
        aria-label="แถบนำทางด่วนด้านล่างสำหรับมือถือ"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl px-2 py-1.5 transition-colors shadow-[0_-4px_24px_rgba(0,0,0,0.15)] ${
          isDark
            ? "bg-[#080C16]/95 border-slate-800 text-slate-300"
            : "bg-white/95 border-slate-200 text-slate-700"
        }`}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
          {/* 1: ภาพรวม */}
          <button
            type="button"
            onClick={() => {
              onNavigateModule("all");
              setMobileMenuOpen(false);
            }}
            aria-current={viewMode === "all" && !mobileMenuOpen ? "page" : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              viewMode === "all" && !mobileMenuOpen
                ? isDark
                  ? "text-[#2DD4BF] bg-teal-500/15 font-bold"
                  : "text-emerald-800 bg-emerald-50 font-bold"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sprout className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">ภาพรวม</span>
          </button>

          {/* 2: พยากรณ์ฝน */}
          <button
            type="button"
            onClick={() => {
              onNavigateModule("weather", "module-weather");
              setMobileMenuOpen(false);
            }}
            aria-current={viewMode === "weather" && !mobileMenuOpen ? "page" : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              viewMode === "weather" && !mobileMenuOpen
                ? isDark
                  ? "text-[#2DD4BF] bg-teal-500/15 font-bold"
                  : "text-emerald-800 bg-emerald-50 font-bold"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CloudRain className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">พยากรณ์</span>
          </button>

          {/* 3: ราคาตลาด */}
          <button
            type="button"
            onClick={() => {
              onNavigateModule("market", "module-market");
              setMobileMenuOpen(false);
            }}
            aria-current={viewMode === "market" && !mobileMenuOpen ? "page" : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              viewMode === "market" && !mobileMenuOpen
                ? isDark
                  ? "text-[#2DD4BF] bg-teal-500/15 font-bold"
                  : "text-emerald-800 bg-emerald-50 font-bold"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">ราคาตลาด</span>
          </button>

          {/* 4: ปุ๋ยสั่งตัด */}
          <button
            type="button"
            onClick={() => {
              onNavigateModule("cost", "module-cost");
              setMobileMenuOpen(false);
            }}
            aria-current={viewMode === "cost" && !mobileMenuOpen ? "page" : undefined}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              viewMode === "cost" && !mobileMenuOpen
                ? isDark
                  ? "text-[#2DD4BF] bg-teal-500/15 font-bold"
                  : "text-emerald-800 bg-emerald-50 font-bold"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Coins className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">ปุ๋ยสั่งตัด</span>
          </button>

          {/* 5: เมนูทั้งหมด */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "ปิดเมนูทั้งหมด" : "เปิดเมนูโมดูลทั้งหมด"}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              mobileMenuOpen
                ? isDark
                  ? "text-amber-400 bg-amber-500/15 font-bold"
                  : "text-amber-800 bg-amber-100 font-bold"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-rose-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            <span className="text-[10px] tracking-tight">
              {mobileMenuOpen ? "ปิด" : "เมนู"}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};
