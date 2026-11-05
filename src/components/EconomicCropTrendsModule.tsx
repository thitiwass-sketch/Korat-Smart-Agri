import React, { useState, useMemo } from "react";
import {
  KORAT_ECONOMIC_CROPS,
  KORAT_DISTRICTS,
  KORAT_ASSETS,
  KoratDistrict,
  formatDistrictName,
} from "../data/koratAgriData";
import { useTheme } from "../context/ThemeContext";
import {
  AlertTriangle,
  CheckCircle2,
  Sprout,
  Calculator,
  Sparkles,
  MapPin,
  Mountain,
  CloudSun,
  Award,
  ShoppingBag,
  Compass,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface EconomicCropTrendsModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
}

interface KoratTropicalFruitSpec {
  id: "durian" | "rambutan" | "mangosteen";
  nameTh: string;
  scientificName: string;
  badgeText: string;
  keyDistrictsText: string;
  districtIds: string[];
  signatureHighlights: string;
  harvestSeason: string;
  harvestMonthsRange: number[]; // 1-indexed months (5 = May .. 8 = Aug)
  avgYieldKgPerRai: number;
  wholesalePriceBahtPerKg: number;
  giDirectPreorderPriceBahtPerKg: number;
  agritourismAddOnBahtPerRai: number;
}

const KORAT_TROPICAL_FRUITS_DATA: KoratTropicalFruitSpec[] = [
  {
    id: "durian",
    nameTh: "ทุเรียน (Durian · หมอนทองปากช่อง-เขาใหญ่ GI)",
    scientificName: "Durio zibethinus (Mon Thong)",
    badgeText: "ขึ้นทะเบียน GI ทุเรียนปากช่อง-เขาใหญ่",
    keyDistrictsText: "ปากช่อง · ครบุรี · เสิงสาง · วังน้ำเขียว · หนองบุญมาก",
    districtIds: [
      "pak-chong",
      "khon-buri",
      "soeng-sang",
      "wang-nam-khiao",
      "nong-bun-mak",
    ],
    signatureHighlights:
      "พันธุ์หมอนทองเป็นหลัก เนื้อละเอียด แห้งมัน กลิ่นหอมละมุน ละมุนลิ้น ไม่หวานแหลม (เช่น ทุเรียนปากช่อง-เขาใหญ่ ได้รับขึ้นทะเบียนสิ่งบ่งชี้ทางภูมิศาสตร์ GI)",
    harvestSeason: "พฤษภาคม – กรกฎาคม",
    harvestMonthsRange: [5, 6, 7],
    avgYieldKgPerRai: 1650,
    wholesalePriceBahtPerKg: 135,
    giDirectPreorderPriceBahtPerKg: 195,
    agritourismAddOnBahtPerRai: 18000,
  },
  {
    id: "rambutan",
    nameTh: "เงาะ (Rambutan · พันธุ์โรงเรียนโคราช)",
    scientificName: "Nephelium lappaceum (Rongrien)",
    badgeText: "เนื้อแห้ง กรอบ ร่อน ไม่ติดเมล็ด",
    keyDistrictsText: "ครบุรี · เสิงสาง · วังน้ำเขียว · หนองบุญมาก",
    districtIds: ["khon-buri", "soeng-sang", "wang-nam-khiao", "nong-bun-mak"],
    signatureHighlights:
      "พันธุ์โรงเรียนเป็นหลัก เปลือกแดงสด ขนยาวปลายเขียว เนื้อแห้ง กรอบ ร่อน ไม่ติดเมล็ด รสชาติหวานหอมจากแร่ธาตุดินภูเขาไฟเก่าและดินร่วนปนทราย",
    harvestSeason: "มิถุนายน – สิงหาคม",
    harvestMonthsRange: [6, 7, 8],
    avgYieldKgPerRai: 2100,
    wholesalePriceBahtPerKg: 28,
    giDirectPreorderPriceBahtPerKg: 45,
    agritourismAddOnBahtPerRai: 9500,
  },
  {
    id: "mangosteen",
    nameTh: "มังคุด (Mangosteen · มังคุดผิวสวยเนื้อขาวฟู)",
    scientificName: "Garcinia mangostana",
    badgeText: "ผลผลิตหายาก ราคาพรีเมียม",
    keyDistrictsText: "วังน้ำเขียว · ปากช่อง · ครบุรี",
    districtIds: ["wang-nam-khiao", "pak-chong", "khon-buri"],
    signatureHighlights:
      "เปลือกบาง เนื้อขาวฟูเป็นกลีบ รสชาติหวานซ่อนเปรี้ยว สดชื่น ผลผลิตยังมีปริมาณน้อยเมื่อเทียบกับทุเรียน จึงเป็นที่ต้องการสูงของนักท่องเที่ยวและตลาดพรีเมียม",
    harvestSeason: "มิถุนายน – สิงหาคม",
    harvestMonthsRange: [6, 7, 8],
    avgYieldKgPerRai: 1350,
    wholesalePriceBahtPerKg: 55,
    giDirectPreorderPriceBahtPerKg: 88,
    agritourismAddOnBahtPerRai: 12000,
  },
];

const TROPICAL_ORCHARD_DISTRICT_IDS = [
  "pak-chong",
  "khon-buri",
  "soeng-sang",
  "wang-nam-khiao",
  "nong-bun-mak",
];

export const EconomicCropTrendsModule: React.FC<
  EconomicCropTrendsModuleProps
> = ({ selectedDistrict, onSelectDistrict }) => {
  const { isDark } = useTheme();
  const [selectedCropId, setSelectedCropId] = useState<string>("tropical_fruits");
  const [imgError, setImgError] = useState<boolean>(false);

  // Interactive Sugarcane Fresh vs Burned & Biomass Calculator
  const [caneAreaRai, setCaneAreaRai] = useState<number>(20);
  const [caneYieldPerRai, setCaneYieldPerRai] = useState<number>(12.5);
  const [caneCcs, setCaneCcs] = useState<number>(12.0);

  // Interactive Tropical Fruit GI + Agritourism + Online Pre-Order Simulator
  const [selectedFruitId, setSelectedFruitId] = useState<
    "durian" | "rambutan" | "mangosteen"
  >("durian");
  const [orchardAreaRai, setOrchardAreaRai] = useState<number>(10);
  const [preorderSharePct, setPreorderSharePct] = useState<number>(60);

  const selectedCrop =
    KORAT_ECONOMIC_CROPS.find((c) => c.id === selectedCropId) ||
    KORAT_ECONOMIC_CROPS[0];

  const activeFruit = useMemo(
    () =>
      KORAT_TROPICAL_FRUITS_DATA.find((f) => f.id === selectedFruitId) ||
      KORAT_TROPICAL_FRUITS_DATA[0],
    [selectedFruitId]
  );

  const orchardDistricts = useMemo(() => {
    return TROPICAL_ORCHARD_DISTRICT_IDS.map((id) =>
      KORAT_DISTRICTS.find((d) => d.id === id)
    ).filter((d): d is KoratDistrict => Boolean(d));
  }, []);

  // Tropical Fruit Revenue Comparison Math
  const totalFruitKg = orchardAreaRai * activeFruit.avgYieldKgPerRai;
  const traditionalWholesaleRevenue = Math.round(
    totalFruitKg * activeFruit.wholesalePriceBahtPerKg
  );

  const preorderKg = totalFruitKg * (preorderSharePct / 100);
  const remainingWholesaleKg = totalFruitKg - preorderKg;
  const modernGiDirectRevenue = Math.round(
    preorderKg * activeFruit.giDirectPreorderPriceBahtPerKg +
      remainingWholesaleKg * activeFruit.wholesalePriceBahtPerKg +
      orchardAreaRai * activeFruit.agritourismAddOnBahtPerRai
  );
  const orchardValueAddedDelta =
    modernGiDirectRevenue - traditionalWholesaleRevenue;

  // Sugarcane math
  const totalCaneTons = caneAreaRai * caneYieldPerRai;
  const baseCanePricePerTon = 1420 + (caneCcs - 10) * 85.2;
  const freshCaneSupportBonus = totalCaneTons * 120; // 120 Baht/ton fresh cane incentive
  const caneTrashTons = totalCaneTons * 0.14; // ~14% harvestable dry trash leaf biomass
  const caneTrashBiomassRevenue = Math.round(caneTrashTons * 900); // 900 Baht/ton biomass
  const freshCaneTotalRevenue = Math.round(
    totalCaneTons * baseCanePricePerTon +
      freshCaneSupportBonus +
      caneTrashBiomassRevenue
  );

  const burnedCanePricePerTon =
    1420 + (Math.max(8, caneCcs - 1.2) - 10) * 85.2 - 30;
  const burnedCaneTotalRevenue = Math.round(
    totalCaneTons * burnedCanePricePerTon
  );
  const freshVsBurnedAdvantage = freshCaneTotalRevenue - burnedCaneTotalRevenue;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`space-y-4 border-b pb-5 transition-colors ${
        isDark ? "border-[#1E293B]" : "border-slate-200"
      }`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-md border font-medium ${
                isDark
                  ? "bg-[#14B8A6]/15 text-[#2DD4BF] border-[#14B8A6]/40"
                  : "bg-teal-50 text-teal-800 border-teal-300"
              }`}
            >
              ยุทธศาสตร์เกษตรจังหวัดนครราชสีมา
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              ศูนย์วิจัยพืชไร่และไม้ผลนครราชสีมา
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              พืชหลักใน {formatDistrictName(selectedDistrict.nameTh)}:{" "}
              <strong className={isDark ? "text-[#FBBF24]" : "text-amber-700 font-bold"}>
                {selectedDistrict.primaryCrops.join(", ")}
              </strong>
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            แนวโน้มพืชเศรษฐกิจหลัก ผลไม้เมืองร้อนมูลค่าสูง (ทุเรียน·เงาะ·มังคุด) และการจัดการความเสี่ยงระดับพื้นที่
          </h2>
        </div>

        {/* 6 Crop Option Selector Menu Buttons: Equal Width, Centered, Mobile-Responsive */}
        <div
          className={`w-full max-w-full p-1.5 sm:p-2 rounded-2xl border transition-colors grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-center ${
            isDark
              ? "bg-[#080C16] border-[#1E293B]"
              : "bg-slate-100 border-slate-300 shadow-2xs"
          }`}
        >
          {KORAT_ECONOMIC_CROPS.map((crop, idx) => {
            const isSelected = crop.id === selectedCropId;
            const shortTitles = [
              "มันสำปะหลัง",
              "อ้อยโรงงาน",
              "ข้าวโพดเลี้ยงสัตว์",
              "ข้าวหอมมะลิ GI",
              "ถั่วหรั่ง·พืชทางเลือก",
              "ผลไม้เมืองร้อน (ทุเรียน·เงาะ·มังคุด)",
            ];
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCropId(crop.id)}
                className={`w-full min-h-[44px] h-full px-2.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center text-center ${
                  isSelected
                    ? isDark
                      ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                      : "bg-teal-700 text-white shadow-xs"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-700 hover:text-slate-950 hover:bg-white"
                }`}
              >
                <span className="truncate">{shortTitles[idx] || crop.nameTh}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Crop Deep-Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Crop Intelligence & Agronomic Strategy */}
        <div className="lg:col-span-7 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div className="border-b border-[#1E293B] pb-4">
            <div className="text-xs font-mono text-[#2DD4BF] font-bold">
              {selectedCrop.rankLabel} · {selectedCrop.nameEn}
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {selectedCrop.nameTh}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2">
              <span>
                พื้นที่ปลูกในโคราช:{" "}
                <strong className="font-mono tabular-nums text-[#FBBF24]">
                  {selectedCrop.koratPlantedAreaRai}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                ผลผลิตรวม:{" "}
                <strong className="font-mono tabular-nums text-white">
                  {selectedCrop.annualOutputTons}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                ความต้องการน้ำ:{" "}
                <strong className="font-mono tabular-nums text-[#2DD4BF]">
                  {selectedCrop.waterRequirementM3PerRai} ลบ.ม./ไร่
                </strong>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-white">
              ทิศทางและแนวโน้มสำคัญ: {selectedCrop.strategicFocusTitle}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedCrop.strategicSummary}
            </p>
          </div>

          {/* Risk / Disease Early Warning Box */}
          <div className="bg-[#F59E0B]/12 border border-[#F59E0B]/40 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FBBF24]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FBBF24]" />
              <span>{selectedCrop.riskAlertTitle}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedCrop.riskAlertDescription}
            </p>
          </div>

          {/* Recommended Varieties & Action Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#1E293B]">
            <div>
              <div className="text-xs font-bold text-[#2DD4BF] mb-2 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>พันธุ์แนะนำสำหรับสภาพดินและน้ำในโคราช</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedCrop.recommendedVarieties.map((v) => (
                  <li key={v} className="leading-relaxed">
                    • {v}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-[#FBBF24] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>
                  แนวทางปฏิบัติเพื่อเพิ่มผลตอบแทน ({selectedCrop.netMarginRangeBahtPerRai})
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedCrop.actionChecklist.map((item) => (
                  <li key={item} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Cassava CMV Visual Surveillance & District Status */}
        <div className="lg:col-span-5 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="text-xs font-mono text-[#2DD4BF] mb-1">
              ระบบเฝ้าระวังโรคใบด่างมันสำปะหลัง (Cassava Mosaic Virus - SLCMV)
            </div>
            <h4 className="text-base font-bold text-white">
              คู่มือจำแนกอาการใบด่างและสถานะเฝ้าระวังรายอำเภอในโคราช
            </h4>

            <div className="mt-3 rounded-xl overflow-hidden border border-[#1E293B] bg-[#080C16] relative">
              {!imgError ? (
                <img
                  src={KORAT_ASSETS.cassavaCmvGuide}
                  alt="ภาพเปรียบเทียบใบมันสำปะหลังปกติกับอาการโรคใบด่างมันสำปะหลัง CMV ในจังหวัดนครราชสีมา"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-[#080C16] flex items-center justify-center p-4 text-center text-xs text-slate-300">
                  แผนภาพเปรียบเทียบอาการโรคใบด่างมันสำปะหลัง (SLCMV) · สังเกตจุดด่างเหลืองสลับเขียวและใบหงิกงอ
                </div>
              )}
              <div className="bg-[#080C16]/95 text-slate-200 px-3.5 py-2.5 text-xs border-t border-[#1E293B]">
                <strong className="text-[#FBBF24]">จุดสังเกตสำคัญ:</strong> ใบยอดอ่อนแสดงอาการด่างเหลืองสลับเขียวชัดเจน แผ่นใบบิดเบี้ยวหงิกงอ ลำต้นแคระแกร็น ห้ามนำท่อนพันธุ์ไปปลูกต่อเด็ดขาด
              </div>
            </div>

            {/* District CMV Status Mini-Table */}
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-200 mb-2">
                ระดับการเฝ้าระวังโรคใบด่างมันสำปะหลังรายอำเภอ
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {KORAT_DISTRICTS.slice(0, 6).map((dist) => (
                  <div
                    key={dist.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      dist.id === selectedDistrict.id
                        ? "border-[#2DD4BF] bg-[#132238]"
                        : "border-[#1E293B] bg-[#080C16]"
                    }`}
                  >
                    <span className="font-medium text-white">{dist.nameTh}</span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        dist.cmvOutbreakStatus === "เฝ้าระวังสูง"
                          ? "text-red-400"
                          : dist.cmvOutbreakStatus === "พบจุดระบาดประปราย"
                          ? "text-[#FBBF24]"
                          : "text-[#2DD4BF]"
                      }`}
                    >
                      {dist.cmvOutbreakStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          NEW FEATURED HUB: KORAT HIGH-VALUE TROPICAL FRUITS
          (ทุเรียน · เงาะ · มังคุด โซนเขาและตอนใต้ของจังหวัดนครราชสีมา)
          ===================================================================== */}
      <div className="bg-[#0B101D] border-2 border-[#14B8A6]/50 shadow-[0_0_32px_rgba(20,184,166,0.12)] rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Top Section Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KORAT HIGH-VALUE TROPICAL FRUITS · พืชเศรษฐกิจทางเลือกรายได้สูงโซนเขาและตอนใต้</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              วิเคราะห์ศักยภาพการปลูกผลไม้เมืองร้อนในจังหวัดนครราชสีมา: ทุเรียน · เงาะโรงเรียน · มังคุด
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              การปลูกผลไม้เมืองร้อนอย่าง <strong className="text-white">ทุเรียน เงาะ และมังคุด</strong> ในจังหวัดนครราชสีมา (โคราช) มีการเติบโตอย่างต่อเนื่องและกลายเป็นพืชเศรษฐกิจทางเลือกที่สร้างรายได้สูง โดยเฉพาะในพื้นที่โซนเขาและตอนใต้ริมเขตอุทยานแห่งชาติ
            </p>
          </div>

          {/* 5 Core Orchard Districts Quick Switcher */}
          <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3 space-y-1.5 shrink-0">
            <div className="text-[11px] font-mono text-[#FBBF24] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>5 อำเภอพื้นที่ปลูกหลัก (คลิกเพื่อดูข้อมูลสภาพดิน-น้ำ):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {orchardDistricts.map((dist) => {
                const isCurr = dist.id === selectedDistrict.id;
                return (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() => onSelectDistrict?.(dist.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                      isCurr
                        ? "bg-[#14B8A6] text-[#041E1C] font-bold border-[#14B8A6]"
                        : "bg-[#101728] text-slate-200 border-[#1E293B] hover:border-[#2DD4BF]"
                    }`}
                  >
                    {dist.nameTh} (ชื้น {dist.gistdaSoilMoisturePct}%)
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 1. วิเคราะห์ศักยภาพพื้นที่ปลูก (Microclimate & Geography - 4 Pillars) */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
            <Mountain className="w-4 h-4" />
            <span>1. วิเคราะห์ศักยภาพพื้นที่ปลูก (MICROCLIMATE &amp; GEOGRAPHY OF SOUTHERN KORAT)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Geography */}
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2DD4BF]">
                  พื้นที่ปลูกหลัก 5 อำเภอโซนใต้-ริมเขา
                </span>
                <MapPin className="w-4 h-4 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ตั้งอยู่ในอำเภอตอนใต้และริมเขตอุทยานแห่งชาติเขาใหญ่–ทับลาน ได้แก่{" "}
                <strong className="text-white">
                  อ.ปากช่อง, อ.ครบุรี, อ.เสิงสาง, อ.วังน้ำเขียว และ อ.หนองบุญมาก
                </strong>
              </p>
            </div>

            {/* Pillar 2: Volcanic & Loam Soil */}
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FBBF24]">
                  สภาพดินภูเขาไฟเก่าแร่ธาตุสูง
                </span>
                <Sprout className="w-4 h-4 text-[#FBBF24]" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                เป็น <strong className="text-white">ดินภูเขาไฟเก่าและดินร่วนปนทราย</strong> ที่มีแร่ธาตุฟอสฟอรัส-โพแทสเซียมและอินทรียวัตถุสูง ธาตุอาหารสมบูรณ์ โครงสร้างดินโปร่งระบายน้ำได้ดีเยี่ยม
              </p>
            </div>

            {/* Pillar 3: Microclimate */}
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#38BDF8]">
                  สภาพอากาศผืนป่าดงพญาเย็น-เขาใหญ่
                </span>
                <CloudSun className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                มีความชื้นสัมพัทธ์สูงจากผืนป่ามรดกโลกดงพญาเย็น-เขาใหญ่ และ{" "}
                <strong className="text-white">อากาศเย็นสบายในคืนช่วงฤดูแล้ง</strong> ช่วยกระตุ้นการสะสมอาหาร การแทงช่อดอก และการติดผลได้ดี
              </p>
            </div>

            {/* Pillar 4: Signature Taste Identity */}
            <div className="bg-[#080C16] border border-[#14B8A6]/45 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2DD4BF]">
                  อัตลักษณ์รสชาติผลไม้โคราช
                </span>
                <Award className="w-4 h-4 text-[#FBBF24]" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                ผลไม้โคราชมีจุดเด่นเฉพาะตัวคือ{" "}
                <strong className="text-[#FBBF24]">
                  &ldquo;หวาน มัน เนื้อแน่น ไม่เละ และกลิ่นไม่ฉุนจัด&rdquo;
                </strong>{" "}
                เนื่องจากสภาพอากาศเย็นกลางคืนและแร่ธาตุในดินเฉพาะตัว
              </p>
            </div>
          </div>
        </div>

        {/* 2. เจาะลึกผลไม้แต่ละชนิดในนครราชสีมา (Comparison Matrix Table + Interactive Cards) */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-[#FBBF24] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#2DD4BF]" />
            <span>2. เจาะลึกผลไม้เมืองร้อนทั้ง 3 ชนิดในจังหวัดนครราชสีมา (พื้นที่ปลูกสำคัญ · จุดเด่น · ช่วงออกตลาด)</span>
          </div>

          <div className="overflow-x-auto bg-[#080C16] border border-[#1E293B] rounded-xl p-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">ชนิดผลไม้เศรษฐกิจ</th>
                  <th className="py-2.5 px-4 font-semibold">พื้นที่ปลูกสำคัญในโคราช</th>
                  <th className="py-2.5 px-4 font-semibold">จุดเด่นและลักษณะเฉพาะ (อัตลักษณ์ท้องถิ่น/GI)</th>
                  <th className="py-2.5 px-4 font-semibold whitespace-nowrap">ช่วงผลผลิตออกตลาด</th>
                  <th className="py-2.5 pl-4 font-semibold text-right whitespace-nowrap">ราคาขายตรง/GI เฉลี่ย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-slate-200">
                {KORAT_TROPICAL_FRUITS_DATA.map((fruit) => {
                  const isSelected = fruit.id === selectedFruitId;
                  return (
                    <tr
                      key={fruit.id}
                      onClick={() => setSelectedFruitId(fruit.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-[#132238]" : "hover:bg-[#101728]"
                      }`}
                    >
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{fruit.nameTh.split(" (")[0]}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF]">
                            {fruit.badgeText}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {fruit.scientificName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#FBBF24] whitespace-nowrap">
                        {fruit.keyDistrictsText}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-md">
                        {fruit.signatureHighlights}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#2DD4BF] whitespace-nowrap">
                        {fruit.harvestSeason}
                      </td>

                      <td className="py-3.5 pl-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="text-sm font-bold text-white">
                          ฿{fruit.giDirectPreorderPriceBahtPerKg} /กก.
                        </div>
                        <div className="text-[11px] text-slate-400">
                          หน้าสวนขายส่ง ฿{fruit.wholesalePriceBahtPerKg}/กก.
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. โอกาสและแนวโน้มทางเศรษฐกิจ (3 Economic Pillars) + Interactive Orchard Value-Add Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
          {/* Left 6 Cols: 3 Economic Opportunity Pillars */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>3. โอกาสและแนวโน้มทางเศรษฐกิจของไม้ผลเมืองร้อนโคราช</span>
            </div>

            <div className="space-y-3">
              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    การท่องเที่ยวเชิงเกษตร (Agritourism)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    สวนผลไม้ใน <strong className="text-[#2DD4BF]">อ.ปากช่อง และ อ.วังน้ำเขียว</strong> (รวมถึง อ.ครบุรี-เสิงสาง) เปิดให้นักท่องเที่ยวเข้าชมสวนและชิมผลไม้สด ๆ จากต้น ร่วมกับกิจกรรมท่องเที่ยวธรรมชาติเขาใหญ่–ทับลานตลอดช่วงฤดูผลไม้ (พ.ค.–ส.ค.) สร้างรายได้เสริมจากค่าเข้าชม คาเฟ่ในสวน และของฝากแปรรูป
                  </p>
                </div>
              </div>

              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24] flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    สินค้า GI และอัตลักษณ์ท้องถิ่น (Geographical Indication)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    การได้รับการรับรอง <strong className="text-[#FBBF24]">สิ่งบ่งชี้ทางภูมิศาสตร์ (GI เช่น ทุเรียนปากช่อง-เขาใหญ่)</strong> และการตรวจสอบย้อนกลับระดับความสุกแก่ (เปอร์เซ็นต์น้ำหนักแห้ง) ช่วยเพิ่มมูลค่าผลผลิตและสร้างความเชื่อมั่นระดับพรีเมียมให้กับผู้บริโภค
                  </p>
                </div>
              </div>

              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#818CF8] flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    การตลาดออนไลน์และระบบจองต้น (Direct Pre-order)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    เกษตรกรยุคใหม่ในโคราชนิยม <strong className="text-white">ขายตรงสู่ผู้บริโภคผ่านช่องทางออนไลน์และระบบจองผลผลิตรายต้น (Tree Pre-order)</strong> โดยไม่ต้องผ่านคนกลาง พร้อมจัดส่งแบบควบคุมอุณหภูมิถึงบ้านภายใน 24 ชั่วโมง
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Interactive GI + Agritourism + Pre-Order Revenue Simulator */}
          <div className="lg:col-span-6 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div>
                <div className="text-xs font-mono font-bold text-[#FBBF24]">
                  ORCHARD VALUE-ADD SIMULATOR
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  จำลองรายได้สวนผลไม้โคราช: ขายส่งล้ง vs ระบบ GI + จองต้นออนไลน์ + ท่องเที่ยวเชิงเกษตร
                </h4>
              </div>
            </div>

            {/* Fruit Selector Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {KORAT_TROPICAL_FRUITS_DATA.map((f) => {
                const active = f.id === selectedFruitId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFruitId(f.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6]"
                        : "bg-[#0B101D] text-slate-300 border-[#1E293B] hover:border-slate-600"
                    }`}
                  >
                    {f.nameTh.split(" (")[0]}
                  </button>
                );
              })}
            </div>

            {/* Sliders for Orchard Area & Online Pre-order % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">พื้นที่สวนที่ให้ผลผลิตแล้ว:</span>
                  <strong className="font-mono text-[#2DD4BF]">
                    {orchardAreaRai} ไร่
                  </strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={orchardAreaRai}
                  onChange={(e) => setOrchardAreaRai(Number(e.target.value))}
                  aria-label="ปรับพื้นที่สวนผลไม้ (ไร่)"
                  className="w-full accent-[#14B8A6]"
                />
                <div className="text-[11px] font-mono text-slate-400">
                  ผลผลิตรวมประมาณ {totalFruitKg.toLocaleString("th-TH")} กก./ปี
                </div>
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">สัดส่วนขายตรงออนไลน์/จองต้น:</span>
                  <strong className="font-mono text-[#FBBF24]">
                    {preorderSharePct}%
                  </strong>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={preorderSharePct}
                  onChange={(e) => setPreorderSharePct(Number(e.target.value))}
                  aria-label="ปรับสัดส่วนการขายตรงออนไลน์และระบบจองต้น"
                  className="w-full accent-[#14B8A6]"
                />
                <div className="text-[11px] font-mono text-slate-400">
                  ราคาจองตรง ฿{activeFruit.giDirectPreorderPriceBahtPerKg}/กก. (ขายส่ง ฿
                  {activeFruit.wholesalePriceBahtPerKg}/กก.)
                </div>
              </div>
            </div>

            {/* Revenue Comparison Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5">
                <div className="text-xs text-slate-400">
                  1) ขายเหมาหน้าสวนผ่านพ่อค้าคนกลางแบบเดิม
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-200 mt-1">
                  ฿{traditionalWholesaleRevenue.toLocaleString("th-TH")}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  เฉลี่ย ฿
                  {Math.round(
                    traditionalWholesaleRevenue / orchardAreaRai
                  ).toLocaleString("th-TH")}{" "}
                  /ไร่
                </div>
              </div>

              <div className="bg-[#14B8A6]/12 border border-[#14B8A6]/45 rounded-xl p-3.5">
                <div className="text-xs font-bold text-[#2DD4BF]">
                  2) โมเดลเกษตรสมัยใหม่ (GI + จองต้น + ท่องเที่ยวสวน)
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#2DD4BF] mt-1">
                  ฿{modernGiDirectRevenue.toLocaleString("th-TH")}
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-1">
                  รวมรายได้ท่องเที่ยวเชิงเกษตร +฿
                  {(
                    orchardAreaRai * activeFruit.agritourismAddOnBahtPerRai
                  ).toLocaleString("th-TH")}
                </div>
              </div>
            </div>

            <div className="bg-[#10192E] border border-[#6366F1]/40 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
              <span className="text-slate-200">
                มูลค่าเพิ่มสุทธิที่เกษตรกรได้รับเพิ่มขึ้น ({orchardAreaRai} ไร่):
              </span>
              <strong className="text-base font-mono tabular-nums text-[#FBBF24]">
                +฿{orchardValueAddedDelta.toLocaleString("th-TH")} /ปี
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Comparison: Sugarcane Zero-Burn Calculator & Alternative Short-Cycle Crops Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Sugarcane Fresh vs Burned PM2.5 Calculator */}
        <div className="lg:col-span-6 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
              <Calculator className="w-4 h-4 text-[#2DD4BF]" />
              <h3 className="text-base font-bold text-white">
                คำนวณผลตอบแทนการตัดอ้อยสดลดการเผา + ขายใบอ้อยชีวมวล
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  พื้นที่ปลูก (ไร่)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={caneAreaRai}
                  onChange={(e) =>
                    setCaneAreaRai(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  ผลผลิต (ตัน/ไร่)
                </label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  step={0.5}
                  value={caneYieldPerRai}
                  onChange={(e) =>
                    setCaneYieldPerRai(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  ความหวาน (CCS)
                </label>
                <input
                  type="number"
                  min={8}
                  max={18}
                  step={0.5}
                  value={caneCcs}
                  onChange={(e) =>
                    setCaneCcs(Math.max(8, Number(e.target.value) || 10))
                  }
                  className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1E293B]">
              <div className="bg-[#14B8A6]/12 border border-[#14B8A6]/40 rounded-xl p-3.5">
                <div className="text-xs font-bold text-[#2DD4BF]">
                  ทางเลือกที่ 1: ตัดอ้อยสด 100% + ขายใบอ้อย
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#2DD4BF] mt-1">
                  ฿{freshCaneTotalRevenue.toLocaleString("th-TH")}
                </div>
                <div className="text-xs text-slate-300 mt-1 space-y-0.5 font-mono tabular-nums">
                  <div>
                    • เงินส่งเสริมอ้อยสด: +฿
                    {freshCaneSupportBonus.toLocaleString("th-TH")}
                  </div>
                  <div>
                    • ขายใบอ้อย ({caneTrashTons.toFixed(1)} ตัน): +฿
                    {caneTrashBiomassRevenue.toLocaleString("th-TH")}
                  </div>
                </div>
              </div>

              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5">
                <div className="text-xs font-bold text-slate-300">
                  ทางเลือกที่ 2: อ้อยไฟไหม้ (ถูกหักเงินและเสีย CCS)
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                  ฿{burnedCaneTotalRevenue.toLocaleString("th-TH")}
                </div>
                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                  <div>• ถูกหักเงินอ้อยไฟไหม้หน้าโรงงาน</div>
                  <div>• สูญเสียความหวานเฉลี่ย 1.2 CCS และไม่มีรายได้ใบอ้อย</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-200 bg-[#080C16] border border-[#1E293B] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
            <span>
              ส่วนต่างรายได้ที่เพิ่มขึ้นจากการตัดอ้อยสดทั้งแปลง ({totalCaneTons.toFixed(0)} ตัน):
            </span>
            <strong className="font-mono tabular-nums text-[#2DD4BF] text-sm">
              +฿{freshVsBurnedAdvantage.toLocaleString("th-TH")}
            </strong>
          </div>
        </div>

        {/* Right 6 cols: Alternative Drought-Resilient Short-Cycle Crops Comparison Table */}
        <div className="lg:col-span-6 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5">
          <div className="pb-3 border-b border-[#1E293B]">
            <h3 className="text-base font-bold text-white">
              ตารางเปรียบเทียบพืชทางเลือกอายุสั้นและพืชตระกูลถั่วบำรุงดิน (ลดความเสี่ยงภัยแล้ง)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              เปรียบเทียบการใช้น้ำ อายุเก็บเกี่ยว และผลตอบแทนสุทธิต่อไร่ เทียบกับการทำนาปรังในพื้นที่เสี่ยงขาดน้ำ
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400">
                  <th className="py-2.5 pr-2 font-medium">ชนิดพืชทางเลือก</th>
                  <th className="py-2.5 px-2 font-medium text-right">อายุเก็บเกี่ยว</th>
                  <th className="py-2.5 px-2 font-medium text-right">
                    การใช้น้ำ (ลบ.ม./ไร่)
                  </th>
                  <th className="py-2.5 px-2 font-medium text-right">ตรึงไนโตรเจน</th>
                  <th className="py-2.5 pl-2 font-medium text-right">
                    กำไรสุทธิเฉลี่ย/ไร่
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                <tr>
                  <td className="py-3 pr-2 font-semibold text-white">
                    ถั่วหรั่ง (Bambara Groundnut)
                    <div className="font-normal text-slate-400">
                      ทนแล้งจัด เหมาะกับดินทรายบัวใหญ่-ด่านขุนทด
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                    95–110 วัน
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-[#2DD4BF] font-semibold">
                    280
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                    +8 กก. N/ไร่
                  </td>
                  <td className="py-3 pl-2 text-right font-mono tabular-nums font-bold text-white">
                    5,400 – 7,900 บ.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-2 font-semibold text-white">
                    ถั่วเขียวผิวมันหลังนา (พันธุ์ มทส.1 / ชัยนาท)
                    <div className="font-normal text-slate-400">
                      อาศัยความชื้นหลังเกี่ยวข้าวทุ่งสัมฤทธิ์
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                    65–70 วัน
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-[#2DD4BF] font-semibold">
                    240
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                    +7 กก. N/ไร่
                  </td>
                  <td className="py-3 pl-2 text-right font-mono tabular-nums font-bold text-white">
                    3,200 – 4,600 บ.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-2 font-semibold text-white">
                    ถั่วลิสงหลังนา (พันธุ์ขอนแก่น 6 / ไทนาน 9)
                    <div className="font-normal text-slate-400">
                      ตลาดรับซื้อฝักสดและแปรรูปราคาดี
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                    95–105 วัน
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-[#2DD4BF] font-semibold">
                    350
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-200">
                    +9 กก. N/ไร่
                  </td>
                  <td className="py-3 pl-2 text-right font-mono tabular-nums font-bold text-white">
                    4,800 – 6,900 บ.
                  </td>
                </tr>
                <tr className="bg-[#080C16]">
                  <td className="py-3 pr-2 font-medium text-slate-300">
                    เปรียบเทียบ: ข้าวนาปรัง (นอกเขตชลประทาน)
                    <div className="font-normal text-[#FBBF24]">
                      เสี่ยงขาดน้ำสูงเมื่อเขื่อนลำตะคองน้ำน้อย
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-400">
                    115–120 วัน
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-red-400 font-semibold">
                    1,250
                  </td>
                  <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-500">
                    0 กก.
                  </td>
                  <td className="py-3 pl-2 text-right font-mono tabular-nums text-slate-400">
                    1,800 – 3,100 บ.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
