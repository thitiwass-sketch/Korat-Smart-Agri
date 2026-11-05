/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  KORAT_DISTRICTS,
  KORAT_COMMODITIES,
  KORAT_BUYING_YARDS,
  INITIAL_KORAT_GEO_PLOTS,
  KoratGeoPlotPin,
  formatDistrictName,
} from "./data/koratAgriData";
import { WeatherForecastModule } from "./components/WeatherForecastModule";
import { MarketPriceTrackerModule } from "./components/MarketPriceTrackerModule";
import { DroughtCompensationModule } from "./components/DroughtCompensationModule";
import { EconomicCropTrendsModule } from "./components/EconomicCropTrendsModule";
import { CostAndFertilizerModule } from "./components/CostAndFertilizerModule";
import { PriceForecastingAiModule } from "./components/PriceForecastingAiModule";
import { NotificationCenterModule } from "./components/NotificationCenterModule";
import { ExecutiveSummaryCharts } from "./components/ExecutiveSummaryCharts";
import { MarketInsightsSummary } from "./components/MarketInsightsSummary";
import { SmartCropCalendarModule } from "./components/SmartCropCalendarModule";
import { PremiumFruitInsightsModule } from "./components/PremiumFruitInsightsModule";
import { MonthlyIncomeProjectorModule } from "./components/MonthlyIncomeProjectorModule";
import { IrrigationZoneManagementModule } from "./components/IrrigationZoneManagementModule";
import { FarmPlotQrGeneratorModule } from "./components/FarmPlotQrGeneratorModule";
import { AgriClinicReportModule } from "./components/AgriClinicReportModule";
import { ClimateHeatmapModule } from "./components/ClimateHeatmapModule";
import { CropVarietyMatcherModule } from "./components/CropVarietyMatcherModule";
import { FertilizerEfficiencyAnalyticsModule } from "./components/FertilizerEfficiencyAnalyticsModule";
import { CropPestAlertModule } from "./components/CropPestAlertModule";
import { FourPartnershipEcosystemModule } from "./components/FourPartnershipEcosystemModule";
import { CommunityForumModule } from "./components/CommunityForumModule";
import {
  PWAInstallButton,
  OfflineIndicator,
} from "./components/ServiceWorkerPushControlPanel";
import { swPushManager } from "./utils/serviceWorkerPushManager";
import { AgriChatbotDrawer } from "./components/AgriChatbotDrawer";
import {
  GlobalThresholdToastContainer,
  DistrictThresholdConfiguratorCard,
} from "./components/ThresholdAlertSystem";
import { useThresholdAlertStore } from "./utils/thresholdAlertStore";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { HeaderNav } from "./components/HeaderNav";
import { HeroSection } from "./components/HeroSection";
import { DistrictWeatherPanel } from "./components/DistrictWeatherPanel";
import {
  Download,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  Lock,
  Search,
  SlidersHorizontal,
  MapPin,
  Droplets,
  CloudRain,
  CloudLightning,
  CloudSun,
  Sun,
  Sprout,
  ArrowRight,
  FlaskConical,
  TrendingUp,
  BellRing,
  GraduationCap,
  Building2,
  X,
  Mail,
  ExternalLink,
  Handshake,
  MessageSquare,
  Users,
} from "lucide-react";


type ActiveViewMode =
  | "all"
  | "weather"
  | "climate_heatmap"
  | "variety_matcher"
  | "irrigation"
  | "calendar"
  | "alerts"
  | "market"
  | "income"
  | "drought"
  | "crops"
  | "fruits"
  | "cost"
  | "fertilizer_efficiency"
  | "pest_alerts"
  | "partnerships"
  | "forum"
  | "clinic"
  | "qrcode"
  | "forecast";

const VIEW_MODE_META: Record<
  ActiveViewMode,
  { label: string; description: string; sectionId?: string }
> = {
  all: {
    label: "ภาพรวมทั้งระบบ",
    description: "แผงควบคุมสารสนเทศการเกษตรครบทุกโมดูลและรายชื่อ 32 อำเภอ",
  },
  weather: {
    label: "พยากรณ์ฝน·แผนที่ความชื้น & โลจิสติกส์",
    description:
      "เรดาร์พยากรณ์ฝน แผนที่ความชื้นดิน GISTDA และพิกัดศูนย์ขนส่งสหกรณ์/สถานีเชื้อเพลิงเครื่องจักรกลหนัก",
    sectionId: "module-weather",
  },
  climate_heatmap: {
    label: "แผนที่ความร้อนจุลภูมิอากาศ 32 อำเภอ (Climate Heatmap)",
    description:
      "วิเคราะห์อุณหภูมิผิวดิน (Ground Temp) ความชื้นสัมพัทธ์ (%RH) และจับคู่เขตจุลภูมิอากาศที่เหมาะสมกับสายพันธุ์พืชเฉพาะเจาะจงครบ 32 อำเภอ",
    sectionId: "module-climate-heatmap",
  },
  variety_matcher: {
    label: "ระบบ AI จับคู่สายพันธุ์พืชผลผลิตสูงสุด (Crop Variety Matcher)",
    description:
      "ใช้ AI วิเคราะห์เปรียบเทียบข้อมูลภูมิอากาศจาก Climate Heatmap กับความเหมาะสมของสายพันธุ์พืชย่อย เพื่อแนะนำสายพันธุ์ที่ให้ผลผลิตสูงสุดในแต่ละโซนของโคราช",
    sectionId: "module-variety-matcher",
  },
  irrigation: {
    label: "บริหารจัดการโซนชลประทาน",
    description:
      "โครงข่ายคลองส่งน้ำชลประทาน สถานีสูบน้ำ และระบบจัดสรรคิวสูบน้ำหมุนเวียนในพื้นที่เสี่ยงภัยแล้ง",
    sectionId: "module-irrigation",
  },
  calendar: {
    label: "ปฏิทินเพาะปลูกอัจฉริยะ",
    description: "คำแนะนำพืชเหมาะสมรายเดือนแยกตามโซนเกษตรนิเวศและความชื้นดิน",
    sectionId: "module-calendar",
  },
  alerts: {
    label: "ศูนย์แจ้งเตือนภัย·SPI",
    description: "ระบบเฝ้าระวังพายุฤดูร้อน ฝนทิ้งช่วง และดัชนีภัยแล้ง SPI รายอำเภอ",
    sectionId: "module-alerts",
  },
  market: {
    label: "ราคารับซื้อผลผลิต",
    description: "ราคารับซื้อหน้าลานมัน-โรงงานน้ำตาลโคราช และกราฟย้อนหลัง 30 วัน",
    sectionId: "module-market",
  },
  income: {
    label: "รายได้คาดการณ์รายเดือน",
    description:
      "คำนวณรายได้คาดการณ์รายเดือนจากราคาผลผลิตที่ติดตามคูณผลผลิตเฉลี่ยต่อไร่รายอำเภอ",
    sectionId: "module-income",
  },
  drought: {
    label: "ภัยแล้ง·ชดเชย กษ.01",
    description: "ประเมินความเสี่ยงพืชผลจากค่า SPI คำนวณเงินเยียวยา กษ.01 และเปรียบเทียบประกันภัยพืชผล",
    sectionId: "module-drought",
  },
  fruits: {
    label: "ผลไม้พรีเมียม GI",
    description: "แผนที่ความร้อนจุลภูมิอากาศ (ทุเรียน·เงาะ·มังคุด) และเครื่องมือวางแผนวันเก็บเกี่ยวโซนใต้โคราช",
    sectionId: "module-fruits",
  },
  crops: {
    label: "พืชเศรษฐกิจ",
    description: "แนวโน้มพืชเศรษฐกิจหลักและโอกาสทางการตลาดเกษตรมูลค่าสูงจังหวัดนครราชสีมา",
    sectionId: "module-crops",
  },
  cost: {
    label: "ต้นทุน·ปุ๋ยสั่งตัด & สแกนโรคพืช AI",
    description: "เครื่องคำนวณสูตรผสมแม่ปุ๋ยสั่งตัดรายอำเภอ กล้องวินิจฉัยโรคใบพืช AI และจุดคุ้มทุน",
    sectionId: "module-cost",
  },
  fertilizer_efficiency: {
    label: "วิเคราะห์ประสิทธิภาพปุ๋ย·ความคุ้มค่าผลผลิต (Fertilizer Efficiency Analytics)",
    description:
      "เปรียบเทียบต้นทุนการใช้ปุ๋ยต่อไร่กับอัตราการเพิ่มผลผลิตตามชุดดินและค่าวิเคราะห์ดินรายปี ครบ 32 อำเภอ เพื่อปรับงบปุ๋ยให้คุ้มค่าสูงสุด",
    sectionId: "module-fertilizer-efficiency",
  },
  pest_alerts: {
    label: "เตือนภัยโรคและศัตรูพืช 4 พืชหลัก (Pest & Disease Alert)",
    description:
      "ระบบเฝ้าระวัง แจ้งเตือน และควบคุมการระบาดของโรคและแมลงศัตรูพืชสำคัญ (มันสำปะหลัง อ้อย ข้าวโพด ข้าวหอมมะลิ) ครบ 32 อำเภอโคราช พร้อมแนวทางป้องกัน รักษา และระเบียบกรมวิชาการเกษตร",
    sectionId: "module-pest-alerts",
  },
  partnerships: {
    label: "พันธมิตร 4P·สิทธิประโยชน์ร่วม (ธ.ก.ส./โรงงานน้ำตาล/โรงงานแป้งมัน)",
    description:
      "ความร่วมมือรัฐ-เอกชน-ประชาชน (Public-Private-People Partnership): เชื่อมโยง ธ.ก.ส. สินเชื่อดอกเบี้ยต่ำ 2.5%, โรงงานน้ำตาล (โบนัสอ้อยสด +120 บ./ตัน), โรงงานแป้งมัน (โบนัสแป้งสูง +300 บ./ตัน) และสหกรณ์การเกษตร 32 อำเภอ สำหรับเกษตรกรที่ปฏิบัติตามเกณฑ์ SmartAgri",
    sectionId: "module-partnerships",
  },
  forum: {
    label: "เสวนาเกษตรกรโคราช·เว็บบอร์ดชุมชน (Community Forum)",
    description:
      "กระดานสนทนาแลกเปลี่ยน ถาม-ตอบ ปัญหาโรคพืช เทคนิคปุ๋ยสั่งตัด สิทธิประโยชน์พันธมิตร 4P และเครื่องมือจัดการเนื้อหา (Moderation) ครบ 32 อำเภอ",
    sectionId: "module-forum",
  },
  clinic: {
    label: "คลินิกเกษตร AI · ใบสั่งยารักษาโรคพืช",
    description:
      "ถ่ายภาพใบพืชหรือพืชผลเพื่อออกใบรายงานวินิจฉัยโรคพืชและแผนการรักษาฟื้นฟูครบวงจรด้วย AI",
    sectionId: "module-clinic",
  },
  qrcode: {
    label: "สร้าง QR แปลงเกษตร·สหกรณ์",
    description:
      "สร้างและดาวน์โหลดบัตร QR Code ข้อมูลแปลงเกษตรและรายงานผลผลิตดิจิทัลสำหรับให้เจ้าหน้าที่สหกรณ์สแกน",
    sectionId: "module-qrcode",
  },
  forecast: {
    label: "วิเคราะห์ราคา AI",
    description: "แบบจำลองคาดการณ์แนวโน้มราคาผลผลิตล่วงหน้าด้วย AI และคำแนะนำจังหวะจำหน่าย",
    sectionId: "module-forecast",
  },
};

const KORAT_ZONES = [
  {
    id: "all",
    title: "ครอบคลุมทั้งจังหวัด (32 อำเภอ)",
    rangeLabel: "13.8 ล้านไร่",
    repDistrictId: "dan-khun-thot",
  },
  {
    id: "west",
    title: "โซนตะวันตก-ที่ราบสูง (ด่านขุนทด/ปากช่อง)",
    rangeLabel: "ฝน 65–75%",
    repDistrictId: "pak-chong",
  },
  {
    id: "north",
    title: "โซนทุ่งสัมฤทธิ์-เหนือ (พิมาย/ชุมพวง/บัวใหญ่)",
    rangeLabel: "ข้าวหอมมะลิ GI",
    repDistrictId: "phimai",
  },
  {
    id: "south",
    title: "โซนใต้-ดงพญาเย็น (ครบุรี/เสิงสาง/วังน้ำเขียว)",
    rangeLabel: "มันสำปะหลัง·อ้อย",
    repDistrictId: "soeng-sang",
  },
];

function MainApp() {
  const { isDark } = useTheme();
  const [selectedDistrictId, setSelectedDistrictId] =
    useState<string>("huai-thalaeng");
  const [viewMode, setViewMode] = useState<ActiveViewMode>("all");
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(2);
  const [geoPlots, setGeoPlots] = useState<KoratGeoPlotPin[]>(
    INITIAL_KORAT_GEO_PLOTS
  );
  const [activeZonePreset, setActiveZonePreset] = useState<string>("all");
  const [telemetryHorizonDays, setTelemetryHorizonDays] = useState<number>(14);

  const handleAddPlotPin = (newPlot: KoratGeoPlotPin) => {
    setGeoPlots((prev) => [newPlot, ...prev]);
  };

  const selectedDistrictIndex = useMemo(() => {
    const idx = KORAT_DISTRICTS.findIndex((d) => d.id === selectedDistrictId);
    return idx >= 0 ? idx : 0;
  }, [selectedDistrictId]);

  const selectedDistrict = KORAT_DISTRICTS[selectedDistrictIndex];
  const selectedStationCode = `NMA-${String(selectedDistrictIndex + 1).padStart(2, "0")}`;

  const [showQuickThresholdConfig, setShowQuickThresholdConfig] =
    useState<boolean>(false);
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);
  const { currentConfig, currentBreaches, triggerDistrictCheck } =
    useThresholdAlertStore(selectedDistrict);
  const isInitialMountRef = useRef<boolean>(true);

  // Automatically check and fire browser-based toast notification when user selects a district whose rainfall/soil moisture threshold is breached
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    triggerDistrictCheck(selectedDistrict);
  }, [selectedDistrict, triggerDistrictCheck]);

  const handleNavigateModule = (mode: string, sectionId?: string) => {
    setViewMode(mode as ActiveViewMode);
    setTimeout(() => {
      if (mode === "all" && sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      if (mode !== "all") {
        const activeContainer =
          document.getElementById("active-module-viewport") ||
          (sectionId ? document.getElementById(sectionId) : null);
        if (activeContainer) {
          activeContainer.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 40);
  };

  // Real CSV Export of Korat Agricultural Intelligence Report
  const handleExportCsvReport = () => {
    const headers = [
      "หมวดหมู่ข้อมูล",
      "พื้นที่/จุดรับซื้อ",
      "รายการ/พืชเศรษฐกิจ",
      "ค่าตัวเลขหลัก",
      "หน่วย",
      "รายละเอียดเพิ่มเติม",
    ];

    const rows: string[][] = [
      [
        "พยากรณ์อากาศและ SPI",
        selectedDistrict.nameTh,
        "โอกาสเกิดฝนวันนี้",
        String(selectedDistrict.rainProbToday),
        "%",
        `SPI-30d: ${selectedDistrict.spi30d} (${selectedDistrict.droughtRiskLevel})`,
      ],
      [
        "พยากรณ์อากาศและ SPI",
        selectedDistrict.nameTh,
        "ความชื้นดินดาวเทียม GISTDA",
        String(selectedDistrict.gistdaSoilMoisturePct),
        "%",
        selectedDistrict.extremeAlertTitle,
      ],
      ...KORAT_BUYING_YARDS.slice(0, 8).map((yard) => [
        "ราคารับซื้อหน้าโรงงาน/ลานโคราช",
        yard.districtName,
        yard.yardName,
        String(yard.priceToday),
        yard.commodityKey === "sugarcane_fresh" ||
        yard.commodityKey === "jasmine_rice"
          ? "บาท/ตัน"
          : "บาท/กก.",
        yard.qualityConditionNote,
      ]),
      ...KORAT_COMMODITIES.map((com) => [
        "ราคาเฉลี่ยจังหวัดนครราชสีมา",
        "ทั้งจังหวัดนครราชสีมา",
        com.nameTh,
        String(com.provincialAvgPrice),
        com.unit,
        com.standardSpec,
      ]),
    ];

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Korat_Smart_Agri_Report_${selectedDistrict.id}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Register Service Worker Push Notification deep-link click listener
  useEffect(() => {
    swPushManager.setNavigationClickHandler((districtId, targetModule) => {
      if (districtId && KORAT_DISTRICTS.some((d) => d.id === districtId)) {
        setSelectedDistrictId(districtId);
      }
      if (targetModule === "alerts") {
        handleNavigateModule("alerts", "module-alerts");
      } else if (targetModule === "weather") {
        handleNavigateModule("weather", "module-weather");
      }
    });
  }, []);

  return (
    <div
      className={`${
        isDark
          ? "theme-studiocheck-dark bg-[#060911] text-[#F8FAFC]"
          : "theme-korat-light bg-[#F8FAFC] text-slate-900"
      } min-h-screen flex flex-col app-ambient-backdrop selection:bg-emerald-500 selection:text-white transition-colors duration-200`}
    >
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-700 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400 font-bold text-sm"
      >
        ข้ามไปยังเนื้อหาหลัก (Skip to main content)
      </a>

      {/* Screen Reader Live Status Region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {`ขณะนี้เลือกพื้นที่ ${formatDistrictName(selectedDistrict.nameTh)} โหมดแสดงผล ${VIEW_MODE_META[viewMode]?.label || "ทั้งหมด"}`}
      </div>

      {/* Refactored Clean Header & Navigation Bar */}
      <HeaderNav
        selectedDistrict={selectedDistrict}
        selectedStationCode={selectedStationCode}
        selectedDistrictId={selectedDistrictId}
        onSelectDistrictId={setSelectedDistrictId}
        viewMode={viewMode}
        onNavigateModule={handleNavigateModule}
        onExportCsv={handleExportCsvReport}
        onOpenCreatorModal={() => setShowCreatorModal(true)}
      />

      {/* Main Content Container (1440px Desktop Baseline, pb-24 for Mobile Bottom Nav) */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-[1420px] w-full mx-auto px-4 sm:px-7 py-6 pb-24 lg:pb-8 space-y-8 focus:outline-none"
      >
        {/* Active Single-Module Header Bar when user selects a specific menu tab (viewMode !== "all" and not market) */}
        {viewMode !== "all" && viewMode !== "market" && (
          <div
            id="active-module-viewport"
            className={`${
              isDark
                ? "bg-[#0B101D] border-[#14B8A6]/50 text-slate-300"
                : "bg-white border-emerald-300 text-slate-700 shadow-sm"
            } border rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md scroll-mt-28`}
          >
            <div className="space-y-1">
              <div
                className={`flex flex-wrap items-center gap-2 text-xs font-mono ${
                  isDark ? "text-[#2DD4BF]" : "text-emerald-700 font-semibold"
                }`}
              >
                <span className="font-semibold uppercase tracking-wider">โหมดแสดงผลเฉพาะโมดูล</span>
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>·</span>
                <span>{VIEW_MODE_META[viewMode].label}</span>
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>·</span>
                <span className={isDark ? "text-[#FBBF24]" : "text-amber-700 font-bold"}>
                  พื้นที่โฟกัส: {formatDistrictName(selectedDistrict.nameTh)} ({selectedStationCode})
                </span>
              </div>
              <p className={`text-xs sm:text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {VIEW_MODE_META[viewMode].description}
              </p>
            </div>

            <div className="btn-group-mobile w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleNavigateModule("all")}
                className={`btn-mobile-full rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C]"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                <span>← แสดงภาพรวมทั้งระบบ (ทุกโมดูล)</span>
              </button>
            </div>
          </div>
        )}

        {/* StudioCheck-Style Split Telemetry Command Console (7 Cols Left / 5 Cols Right) — Rendered in Overview Mode */}
        {viewMode === "all" && (
          <>
            <section
              aria-label="แผงควบคุมสารสนเทศการเกษตรและรายชื่อ 32 อำเภอ จังหวัดนครราชสีมา"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* LEFT: Main Dashboard (65-70% Width) */}
              <div className="lg:col-span-8">
                <HeroSection
                  selectedDistrict={selectedDistrict}
                  selectedStationCode={selectedStationCode}
                  onNavigateModule={handleNavigateModule}
                  onSelectDistrictId={setSelectedDistrictId}
                  activeZonePreset={activeZonePreset}
                  setActiveZonePreset={setActiveZonePreset}
                  telemetryHorizonDays={telemetryHorizonDays}
                  setTelemetryHorizonDays={setTelemetryHorizonDays}
                  showQuickThresholdConfig={showQuickThresholdConfig}
                  setShowQuickThresholdConfig={setShowQuickThresholdConfig}
                  currentConfig={currentConfig}
                  currentBreaches={currentBreaches}
                  onOpenCreatorModal={() => setShowCreatorModal(true)}
                />
              </div>

              {/* RIGHT: Sidebar (30-35% Width) */}
              <div className="lg:col-span-4">
                <DistrictWeatherPanel
                  selectedDistrict={selectedDistrict}
                  onSelectDistrictId={setSelectedDistrictId}
                  geoPlots={geoPlots}
                  onNavigateModule={handleNavigateModule}
                />
              </div>
            </section>

            {/* Market Insights Summary: Top 5 Korat Commodities with 7-Day Sparkline Charts */}
            <MarketInsightsSummary
              selectedDistrict={selectedDistrict}
              onNavigateMarket={() => handleNavigateModule("market", "module-market")}
            />

            {/* Top Dashboard Executive Summary Data Visualization (Recharts: Monthly Rainfall & Price Trends) */}
            <ExecutiveSummaryCharts
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </>
        )}

        {/* Weather & Probabilistic Forecasting */}
        {(viewMode === "all" || viewMode === "weather") && (
          <section id="module-weather" className="scroll-mt-20">
            <WeatherForecastModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              plots={geoPlots}
              onAddPlotPin={handleAddPlotPin}
            />
          </section>
        )}

        {/* Climate Heatmap: 32-District Ground Temperature & Relative Humidity Micro-Climate Matcher */}
        {(viewMode === "all" || viewMode === "climate_heatmap") && (
          <section id="module-climate-heatmap" className="scroll-mt-20">
            <ClimateHeatmapModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onOpenVarietyMatcher={() =>
                handleNavigateModule("variety_matcher", "module-variety-matcher")
              }
            />
          </section>
        )}

        {/* AI Crop Variety Matcher: Climate Heatmap vs Crop Variety Yield Optimization */}
        {(viewMode === "all" || viewMode === "variety_matcher") && (
          <section id="module-variety-matcher" className="scroll-mt-20">
            <CropVarietyMatcherModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onOpenClimateHeatmap={() =>
                handleNavigateModule("climate_heatmap", "module-climate-heatmap")
              }
            />
          </section>
        )}

        {/* Irrigation Zone Management & Canal Water Coordination */}
        {(viewMode === "all" || viewMode === "irrigation") && (
          <section id="module-irrigation" className="scroll-mt-20">
            <IrrigationZoneManagementModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onJumpToGisMap={() => handleNavigateModule("weather", "module-weather")}
            />
          </section>
        )}

        {/* Smart Crop Planting Calendar by Korat Agro-Zone & Soil Moisture / Cumulative Rainfall */}
        {(viewMode === "all" || viewMode === "calendar") && (
          <section id="module-calendar" className="scroll-mt-20">
            <SmartCropCalendarModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </section>
        )}

        {/* Notification Center & SPI / Extreme Weather Push Alert Triggers */}
        {(viewMode === "all" || viewMode === "alerts") && (
          <section id="module-alerts" className="scroll-mt-20">
            <NotificationCenterModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onUnreadCountChange={(count) => setUnreadAlertCount(count)}
            />
          </section>
        )}

        {/* Agri-Market Price Tracker */}
        {(viewMode === "all" || viewMode === "market") && (
          <section id="module-market" className="scroll-mt-20">
            <MarketPriceTrackerModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onNavigateToForecast={() =>
                handleNavigateModule("forecast", "module-forecast")
              }
              onNavigateHome={() => handleNavigateModule("all")}
              isIsolatedView={viewMode === "market"}
            />
          </section>
        )}

        {/* Projected Monthly Farm Income Calculator (Price x District Avg Yield/Rai) */}
        {(viewMode === "all" || viewMode === "income") && (
          <section id="module-income" className="scroll-mt-20">
            <MonthlyIncomeProjectorModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </section>
        )}

        {/* Drought & Government Disaster Compensation (กษ.01) */}
        {(viewMode === "all" || viewMode === "drought") && (
          <section id="module-drought" className="scroll-mt-20">
            <DroughtCompensationModule
              selectedDistrict={selectedDistrict}
              onAddPlotPin={handleAddPlotPin}
            />
          </section>
        )}

        {/* Premium Fruit Insights (Durian, Rambutan, Mangosteen Microclimate Heatmap & Harvest Planner) */}
        {(viewMode === "all" || viewMode === "fruits") && (
          <section id="module-fruits" className="scroll-mt-20">
            <PremiumFruitInsightsModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </section>
        )}

        {/* Economic Crop Trends in Korat */}
        {(viewMode === "all" || viewMode === "crops") && (
          <section id="module-crops" className="scroll-mt-20">
            <EconomicCropTrendsModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </section>
        )}

        {/* Production Cost & Fertilizer Calculator */}
        {(viewMode === "all" || viewMode === "cost") && (
          <section id="module-cost" className="scroll-mt-20">
            <CostAndFertilizerModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onOpenEfficiencyAnalytics={() =>
                handleNavigateModule(
                  "fertilizer_efficiency",
                  "module-fertilizer-efficiency"
                )
              }
            />
          </section>
        )}

        {/* Fertilizer Efficiency Analytics Dashboard: Cost vs Yield Improvement Over Time */}
        {(viewMode === "all" || viewMode === "fertilizer_efficiency") && (
          <section id="module-fertilizer-efficiency" className="scroll-mt-20">
            <FertilizerEfficiencyAnalyticsModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onOpenFertilizerCalculator={() =>
                handleNavigateModule("cost", "module-cost")
              }
            />
          </section>
        )}

        {/* Crop Disease and Pest Alert System (Cassava, Sugarcane, Corn, Jasmine Rice) */}
        {(viewMode === "all" || viewMode === "pest_alerts") && (
          <section id="module-pest-alerts" className="scroll-mt-20">
            <CropPestAlertModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onNavigateToClinic={() => handleNavigateModule("clinic", "module-clinic")}
            />
          </section>
        )}

        {/* Public-Private-People Partnership (4P) Ecosystem: BAAC Green Credit 2.5%, Sugar & Cassava Starch Mills Bonus */}
        {(viewMode === "all" || viewMode === "partnerships") && (
          <section id="module-partnerships" className="scroll-mt-20">
            <FourPartnershipEcosystemModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onNavigateModule={(mod, sec) =>
                handleNavigateModule(mod as ActiveViewMode, sec)
              }
            />
          </section>
        )}

        {/* Community Forum: Farmer Q&A, Advice Sharing, Discussions & Basic Moderation Tools */}
        {(viewMode === "all" || viewMode === "forum") && (
          <section id="module-forum" className="scroll-mt-20">
            <CommunityForumModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
              onNavigateToClinic={() => handleNavigateModule("clinic", "module-clinic")}
              onNavigateToPartnerships={() =>
                handleNavigateModule("partnerships", "module-partnerships")
              }
            />
          </section>
        )}

        {/* Agri-Clinic Report: AI Leaf & Crop Photo Diagnostic Report with Remedial Treatments */}
        {(viewMode === "all" || viewMode === "clinic") && (
          <section id="module-clinic" className="scroll-mt-20">
            <AgriClinicReportModule
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </section>
        )}

        {/* Farm Plot & Crop Report QR Code Generator for Cooperative Officers */}
        {(viewMode === "all" || viewMode === "qrcode") && (
          <section id="module-qrcode" className="scroll-mt-20">
            <FarmPlotQrGeneratorModule
              selectedDistrict={selectedDistrict}
              plots={geoPlots}
              onSelectDistrict={(id) => setSelectedDistrictId(id)}
            />
          </section>
        )}

        {/* Market Price Trends & AI Prediction */}
        {(viewMode === "all" || viewMode === "forecast") && (
          <section id="module-forecast" className="scroll-mt-20">
            <PriceForecastingAiModule selectedDistrict={selectedDistrict} />
          </section>
        )}
      </main>

      {/* Dark Obsidian Telemetry Footer */}
      <footer className="bg-[#080C16] border-t border-[#1E293B] mt-12 py-8 px-4 sm:px-8">
        <div className="max-w-[1420px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-slate-400">
          <div className="space-y-1">
            <div className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>Korat</span>
              <span className="text-[#2DD4BF]">SmartAgri</span>
              <span className="text-slate-400 font-normal">
                (โคราชสมาร์ทอกริ) — แพลตฟอร์มสารสนเทศเพื่อการตัดสินใจทางการเกษตร จังหวัดนครราชสีมา (ครบ 32 อำเภอ)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-slate-400">
              <span>อ้างอิงมาตรฐานข้อมูล: กรมอุตุนิยมวิทยา (TMD)</span>
              <span aria-hidden="true">·</span>
              <span>สำนักงานเศรษฐกิจการเกษตร (สศก.)</span>
              <span aria-hidden="true">·</span>
              <span>กรมส่งเสริมการเกษตร (Digital DOAE)</span>
              <span aria-hidden="true">·</span>
              <span>GISTDA</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreatorModal(true)}
            className="p-3.5 rounded-xl border border-slate-800 hover:border-teal-500/50 bg-[#0B101D]/70 text-left md:text-right space-y-1 text-slate-300 transition-all cursor-pointer group block shadow-xs"
            title="คลิกเพื่อดูข้อมูลผู้ออกแบบสร้างสรรค์และพัฒนา"
          >
            <div className="font-bold text-[#FBBF24] text-xs sm:text-sm group-hover:text-[#FDE68A] transition-colors">
              ออกแบบสร้างสรรค์พัฒนา: ฐิติวัสส์ กาญจนพิมาย
            </div>
            <div className="text-slate-200 text-xs font-medium">คณะเทคโนโลยีอุตสาหกรรม</div>
            <div className="text-slate-400 text-xs">มหาวิทยาลัยราชภัฏนครราชสีมา</div>
          </button>
        </div>
      </footer>

      {/* Creator & Academic Developer Profile Modal */}
      {showCreatorModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="creator-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowCreatorModal(false)}
        >
          <div
            className="bg-[#0B1222] border border-[#14B8A6]/60 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowCreatorModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-[#111827] border border-[#1E293B] hover:border-[#14B8A6] transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge & Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14B8A6]/20 to-[#F59E0B]/20 border border-[#14B8A6]/50 flex items-center justify-center text-[#2DD4BF] shadow-inner">
                <GraduationCap className="w-6 h-6 text-[#FBBF24]" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#2DD4BF] uppercase tracking-wider font-semibold">
                  Creative Design &amp; Engineering Attribution
                </span>
                <h2 id="creator-modal-title" className="text-lg font-bold text-white">
                  ข้อมูลผู้ออกแบบสร้างสรรค์และพัฒนาระบบ
                </h2>
              </div>
            </div>

            {/* Main Profile Card */}
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="border-b border-[#1E293B] pb-3">
                <div className="text-xs text-slate-400 font-mono">ผู้ออกแบบสร้างสรรค์พัฒนา (Creator &amp; Lead Engineer)</div>
                <div className="text-xl font-bold text-[#FBBF24] mt-0.5">
                  ฐิติวัสส์ กาญจนพิมาย
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Thitiwas Kanchanaphimai
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 text-slate-200">
                  <Building2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">คณะเทคโนโลยีอุตสาหกรรม</strong>
                    <div className="text-slate-400">
                      มหาวิทยาลัยราชภัฏนครราชสีมา (NRRU)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-200">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-slate-400">อีเมลติดต่อ: </span>
                    <a
                      href="mailto:thitiwas.k@nrru.ac.th"
                      className="font-mono text-sky-300 hover:underline"
                    >
                      thitiwas.k@nrru.ac.th
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Scope & Academic Contribution */}
            <div className="space-y-2 text-xs text-slate-300 bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-[#2DD4BF]" />
                <span>วิสัยทัศน์โครงการ Korat SmartAgri</span>
              </div>
              <p className="leading-relaxed text-slate-300 text-[11.5px]">
                แพลตฟอร์มสารสนเทศการเกษตรอัจฉริยะเพื่อการตัดสินใจเชิงพื้นที่ ครอบคลุม 32 อำเภอ จังหวัดนครราชสีมา 
                บูรณาการข้อมูลสภาพอากาศ GISTDA, TMD, แผนที่จุลภูมิอากาศ (Climate Heatmap), ดรรชนีภัยแล้ง SPI-30d, 
                ระบบจับคู่สายพันธุ์พืช (Crop Variety Matcher), ปุ๋ยสั่งตัด และปัญญาประดิษฐ์ (AI) เพื่อยกระดับรายได้และความมั่นคงของเกษตรกรโคราช
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreatorModal(false)}
                className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors cursor-pointer"
              >
                เข้าใจแล้ว / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Browser-Based Threshold Alert Toast Notification Stack */}
      <GlobalThresholdToastContainer
        selectedDistrict={selectedDistrict}
        onSelectDistrict={(id) => setSelectedDistrictId(id)}
        onOpenThresholdSettings={() => {
          setShowQuickThresholdConfig(true);
          handleNavigateModule("all", "module-weather");
        }}
      />

      {/* Multi-Turn Gemini Agri-Advisor Chatbot Drawer */}
      <AgriChatbotDrawer selectedDistrict={selectedDistrict} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
