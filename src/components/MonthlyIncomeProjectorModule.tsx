import React, { useState, useMemo, useEffect } from "react";
import {
  KORAT_DISTRICTS,
  KORAT_COMMODITIES,
  KORAT_BUYING_YARDS,
  CROP_COST_PRESETS,
  CommodityKey,
  KoratDistrict,
} from "../data/koratAgriData";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  Coins,
  MapPin,
  Calendar,
  SlidersHorizontal,
  ArrowUpRight,
  CheckCircle2,
  Sprout,
  Scale,
  Building2,
  RotateCcw,
  Layers,
} from "lucide-react";

interface MonthlyIncomeProjectorModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
}

const THAI_MONTHS = [
  { idx: 1, short: "ม.ค.", full: "มกราคม" },
  { idx: 2, short: "ก.พ.", full: "กุมภาพันธ์" },
  { idx: 3, short: "มี.ค.", full: "มีนาคม" },
  { idx: 4, short: "เม.ย.", full: "เมษายน" },
  { idx: 5, short: "พ.ค.", full: "พฤษภาคม" },
  { idx: 6, short: "มิ.ย.", full: "มิถุนายน" },
  { idx: 7, short: "ก.ค.", full: "กรกฎาคม" },
  { idx: 8, short: "ส.ค.", full: "สิงหาคม" },
  { idx: 9, short: "ก.ย.", full: "กันยายน" },
  { idx: 10, short: "ต.ค.", full: "ตุลาคม" },
  { idx: 11, short: "พ.ย.", full: "พฤศจิกายน" },
  { idx: 12, short: "ธ.ค.", full: "ธันวาคม" },
];

// Monthly harvest & market selling weight distribution (sums to 1.0 across peak harvest months)
const CROP_MONTHLY_REVENUE_WEIGHTS: Record<CommodityKey, number[]> = {
  // Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
  cassava_fresh: [0.22, 0.24, 0.18, 0.05, 0, 0, 0, 0, 0, 0.06, 0.11, 0.14],
  cassava_chip: [0.2, 0.25, 0.25, 0.1, 0, 0, 0, 0, 0, 0, 0.08, 0.12],
  sugarcane_fresh: [0.28, 0.28, 0.22, 0.04, 0, 0, 0, 0, 0, 0, 0, 0.18],
  maize_feed: [0.05, 0.08, 0, 0, 0, 0, 0, 0.12, 0.28, 0.27, 0.14, 0.06],
  jasmine_rice: [0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0.08, 0.52, 0.3],
};

// Monthly production cost distribution (land prep, planting, fertilizer, harvest)
const CROP_MONTHLY_COST_WEIGHTS: Record<CommodityKey, number[]> = {
  cassava_fresh: [0.08, 0.08, 0.14, 0.18, 0.14, 0.08, 0.06, 0.04, 0.04, 0.04, 0.06, 0.06],
  cassava_chip: [0.1, 0.1, 0.15, 0.15, 0.12, 0.08, 0.05, 0.05, 0.04, 0.04, 0.06, 0.06],
  sugarcane_fresh: [0.1, 0.12, 0.12, 0.15, 0.14, 0.08, 0.06, 0.05, 0.04, 0.04, 0.04, 0.06],
  maize_feed: [0.04, 0.04, 0.04, 0.12, 0.2, 0.16, 0.12, 0.08, 0.08, 0.06, 0.04, 0.02],
  jasmine_rice: [0.02, 0, 0, 0.04, 0.16, 0.22, 0.14, 0.12, 0.08, 0.06, 0.1, 0.06],
};

/**
 * Computes deterministic, realistic district-specific average yield per rai
 * for a given commodity and Korat district, incorporating soil series, soil moisture, and SPI.
 */
function calculateDistrictAvgYieldPerRai(
  district: KoratDistrict,
  commodityKey: CommodityKey
): {
  districtAvgYieldPerRai: number;
  provincialBaselineYield: number;
  yieldUnit: string;
  suitabilityFactorPct: number;
  yieldExplanationTh: string;
} {
  const preset = CROP_COST_PRESETS.find((p) => p.cropKey === commodityKey);
  // For cassava_chip, dried chips yield is ~42% of fresh root weight (approx 1,600 kg/rai)
  const provincialBaselineYield =
    commodityKey === "cassava_chip"
      ? 1620
      : preset
      ? preset.defaultYieldPerRai
      : 3650;

  const yieldUnit =
    commodityKey === "sugarcane_fresh" ? "ตัน/ไร่" : "กก./ไร่";

  // Calculate district agronomic modifier (0.84 to 1.18)
  const moistureBonus = (district.gistdaSoilMoisturePct - 36) * 0.0035;
  const spiBonus = district.spi30d * 0.035;

  // Check if crop matches district's primary crops
  const cropMatchBonus =
    (commodityKey.startsWith("cassava") &&
      district.primaryCrops.some((c) => c.includes("มันสำปะหลัง"))) ||
    (commodityKey === "sugarcane_fresh" &&
      district.primaryCrops.some((c) => c.includes("อ้อย"))) ||
    (commodityKey === "maize_feed" &&
      district.primaryCrops.some((c) => c.includes("ข้าวโพด"))) ||
    (commodityKey === "jasmine_rice" &&
      district.primaryCrops.some((c) => c.includes("ข้าว")))
      ? 0.06
      : -0.03;

  const rawMultiplier = Math.min(
    1.18,
    Math.max(0.84, 1.0 + moistureBonus + spiBonus + cropMatchBonus)
  );

  const districtAvgYieldPerRai =
    commodityKey === "sugarcane_fresh"
      ? Number((provincialBaselineYield * rawMultiplier).toFixed(2))
      : Math.round(provincialBaselineYield * rawMultiplier);

  const suitabilityFactorPct = Math.round(rawMultiplier * 100);

  const yieldExplanationTh = `${district.soilSeriesName} · ความชื้นดิน ${district.gistdaSoilMoisturePct}% · SPI ${district.spi30d}`;

  return {
    districtAvgYieldPerRai,
    provincialBaselineYield,
    yieldUnit,
    suitabilityFactorPct,
    yieldExplanationTh,
  };
}

export const MonthlyIncomeProjectorModule: React.FC<
  MonthlyIncomeProjectorModuleProps
> = ({ selectedDistrict, onSelectDistrict }) => {
  const [selectedCropKey, setSelectedCropKey] =
    useState<CommodityKey>("cassava_fresh");
  const [areaRai, setAreaRai] = useState<number>(20);
  const [secondaryCropAreaRai, setSecondaryCropAreaRai] = useState<number>(10);
  const [enableSecondaryCrop, setEnableSecondaryCrop] = useState<boolean>(true);
  const [secondaryCropKey, setSecondaryCropKey] =
    useState<CommodityKey>("maize_feed");

  const [priceSourceMode, setPriceSourceMode] = useState<
    "local_yard" | "provincial_avg" | "custom"
  >("local_yard");

  // Compute default district yield & tracked price for selected crop
  const primaryYieldMeta = useMemo(
    () => calculateDistrictAvgYieldPerRai(selectedDistrict, selectedCropKey),
    [selectedDistrict, selectedCropKey]
  );

  const primaryCommodityMeta = useMemo(
    () =>
      KORAT_COMMODITIES.find((c) => c.key === selectedCropKey) ||
      KORAT_COMMODITIES[0],
    [selectedCropKey]
  );

  // Find best/nearest buying yard in or near the selected district for this commodity
  const nearestYardForPrimary = useMemo(() => {
    const matchingYards = KORAT_BUYING_YARDS.filter(
      (y) => y.commodityKey === selectedCropKey
    );
    const exactDistrictYard = matchingYards.find(
      (y) => y.districtId === selectedDistrict.id
    );
    if (exactDistrictYard) return exactDistrictYard;
    return matchingYards[0] || null;
  }, [selectedCropKey, selectedDistrict.id]);

  const trackedLocalPrice = useMemo(() => {
    if (priceSourceMode === "local_yard" && nearestYardForPrimary) {
      return nearestYardForPrimary.priceToday;
    }
    return primaryCommodityMeta.provincialAvgPrice;
  }, [priceSourceMode, nearestYardForPrimary, primaryCommodityMeta]);

  const [customPriceOverride, setCustomPriceOverride] = useState<number>(
    trackedLocalPrice
  );
  const [customYieldOverride, setCustomYieldOverride] = useState<number>(
    primaryYieldMeta.districtAvgYieldPerRai
  );

  // Sync overrides when district or crop changes
  useEffect(() => {
    setCustomYieldOverride(primaryYieldMeta.districtAvgYieldPerRai);
  }, [primaryYieldMeta.districtAvgYieldPerRai]);

  useEffect(() => {
    setCustomPriceOverride(trackedLocalPrice);
  }, [trackedLocalPrice]);

  const activeUnitPrice =
    priceSourceMode === "custom" ? customPriceOverride : trackedLocalPrice;
  const activeYieldPerRai = customYieldOverride;

  // Convert price & yield into Baht per Rai accurately based on unit
  // Note: jasmine_rice has provincialAvgPrice in บาท/ตัน (e.g. 15,850), while yield is in กก./ไร่ (e.g. 610 kg = 0.61 ton)
  const calculateGrossRevenuePerRai = (
    cropKey: CommodityKey,
    unitPrice: number,
    yieldPerRai: number
  ): number => {
    if (cropKey === "jasmine_rice") {
      // unitPrice is Baht/Ton, yieldPerRai is Kg/Rai
      return Math.round((unitPrice / 1000) * yieldPerRai);
    }
    // For cassava_fresh (Baht/Kg * Kg/Rai), cassava_chip (Baht/Kg * Kg/Rai),
    // maize_feed (Baht/Kg * Kg/Rai), sugarcane_fresh (Baht/Ton * Ton/Rai)
    return Math.round(unitPrice * yieldPerRai);
  };

  const primaryGrossPerRai = useMemo(
    () =>
      calculateGrossRevenuePerRai(
        selectedCropKey,
        activeUnitPrice,
        activeYieldPerRai
      ),
    [selectedCropKey, activeUnitPrice, activeYieldPerRai]
  );

  const primaryCostPerRai = useMemo(() => {
    const preset = CROP_COST_PRESETS.find((p) => p.cropKey === selectedCropKey);
    if (!preset) return 4850;
    const c = preset.defaultCostsPerRai;
    return (
      c.landPrepBaht +
      c.seedOrStemBaht +
      c.fertilizerBaht +
      c.cropProtectionBaht +
      c.laborAndHarvestBaht +
      c.transportAndRentBaht
    );
  }, [selectedCropKey]);

  // Secondary crop calculations (for year-round monthly income diversification)
  const secondaryYieldMeta = useMemo(
    () => calculateDistrictAvgYieldPerRai(selectedDistrict, secondaryCropKey),
    [selectedDistrict, secondaryCropKey]
  );
  const secondaryCommodityMeta = useMemo(
    () =>
      KORAT_COMMODITIES.find((c) => c.key === secondaryCropKey) ||
      KORAT_COMMODITIES[3],
    [secondaryCropKey]
  );
  const secondaryGrossPerRai = useMemo(
    () =>
      calculateGrossRevenuePerRai(
        secondaryCropKey,
        secondaryCommodityMeta.provincialAvgPrice,
        secondaryYieldMeta.districtAvgYieldPerRai
      ),
    [
      secondaryCropKey,
      secondaryCommodityMeta.provincialAvgPrice,
      secondaryYieldMeta.districtAvgYieldPerRai,
    ]
  );
  const secondaryCostPerRai = useMemo(() => {
    const preset = CROP_COST_PRESETS.find((p) => p.cropKey === secondaryCropKey);
    if (!preset) return 4500;
    const c = preset.defaultCostsPerRai;
    return (
      c.landPrepBaht +
      c.seedOrStemBaht +
      c.fertilizerBaht +
      c.cropProtectionBaht +
      c.laborAndHarvestBaht +
      c.transportAndRentBaht
    );
  }, [secondaryCropKey]);

  // Build 12-Month Projected Income & Cashflow Schedule
  const monthlyProjectionData = useMemo(() => {
    const primaryTotalGross = primaryGrossPerRai * areaRai;
    const primaryTotalCost = primaryCostPerRai * areaRai;

    const secondaryTotalGross = enableSecondaryCrop
      ? secondaryGrossPerRai * secondaryCropAreaRai
      : 0;
    const secondaryTotalCost = enableSecondaryCrop
      ? secondaryCostPerRai * secondaryCropAreaRai
      : 0;

    const revWeights1 = CROP_MONTHLY_REVENUE_WEIGHTS[selectedCropKey];
    const costWeights1 = CROP_MONTHLY_COST_WEIGHTS[selectedCropKey];
    const revWeights2 = CROP_MONTHLY_REVENUE_WEIGHTS[secondaryCropKey];
    const costWeights2 = CROP_MONTHLY_COST_WEIGHTS[secondaryCropKey];

    let cumulativeNet = 0;

    return THAI_MONTHS.map((m, idx) => {
      const primaryRev = Math.round(primaryTotalGross * revWeights1[idx]);
      const secondaryRev = Math.round(secondaryTotalGross * revWeights2[idx]);
      const grossIncome = primaryRev + secondaryRev;

      const primaryCost = Math.round(primaryTotalCost * costWeights1[idx]);
      const secondaryCost = Math.round(secondaryTotalCost * costWeights2[idx]);
      const monthlyCost = primaryCost + secondaryCost;

      const netMonthlyIncome = grossIncome - monthlyCost;
      cumulativeNet += netMonthlyIncome;

      return {
        monthShort: m.short,
        monthFull: m.full,
        primaryRev,
        secondaryRev,
        grossIncome,
        monthlyCost,
        netMonthlyIncome,
        cumulativeNet,
      };
    });
  }, [
    primaryGrossPerRai,
    areaRai,
    primaryCostPerRai,
    enableSecondaryCrop,
    secondaryGrossPerRai,
    secondaryCropAreaRai,
    secondaryCostPerRai,
    selectedCropKey,
    secondaryCropKey,
  ]);

  // Summary KPIs
  const summaryMetrics = useMemo(() => {
    const totalAnnualGross = monthlyProjectionData.reduce(
      (acc, r) => acc + r.grossIncome,
      0
    );
    const totalAnnualCost = monthlyProjectionData.reduce(
      (acc, r) => acc + r.monthlyCost,
      0
    );
    const totalAnnualNet = totalAnnualGross - totalAnnualCost;
    const avgMonthlyGross = Math.round(totalAnnualGross / 12);
    const avgMonthlyNet = Math.round(totalAnnualNet / 12);

    const peakMonth = [...monthlyProjectionData].sort(
      (a, b) => b.grossIncome - a.grossIncome
    )[0];

    return {
      totalAnnualGross,
      totalAnnualCost,
      totalAnnualNet,
      avgMonthlyGross,
      avgMonthlyNet,
      peakMonth,
    };
  }, [monthlyProjectionData]);

  // All 5 commodities comparison for the selected district
  const districtAllCropsComparison = useMemo(() => {
    return KORAT_COMMODITIES.map((com) => {
      const yMeta = calculateDistrictAvgYieldPerRai(selectedDistrict, com.key);
      const localYard =
        KORAT_BUYING_YARDS.find(
          (y) => y.commodityKey === com.key && y.districtId === selectedDistrict.id
        ) || KORAT_BUYING_YARDS.find((y) => y.commodityKey === com.key);

      const trackedPrice = localYard
        ? localYard.priceToday
        : com.provincialAvgPrice;

      const grossPerRai = calculateGrossRevenuePerRai(
        com.key,
        trackedPrice,
        yMeta.districtAvgYieldPerRai
      );

      return {
        commodity: com,
        yieldPerRai: yMeta.districtAvgYieldPerRai,
        yieldUnit: yMeta.yieldUnit,
        suitabilityPct: yMeta.suitabilityFactorPct,
        trackedPrice,
        yardName: localYard ? localYard.yardName : "ราคาเฉลี่ยจังหวัด",
        grossPerRai,
        avgMonthlyPerRai: Math.round(grossPerRai / 12),
        totalForPlot: grossPerRai * areaRai,
      };
    });
  }, [selectedDistrict, areaRai]);

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
      {/* Top Module Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B1324] to-[#080C16] px-6 py-5 border-b border-[#1E293B]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#2DD4BF]">
              <Coins className="w-4 h-4 text-[#FBBF24]" />
              <span>PROJECTED MONTHLY FARM INCOME CALCULATOR · โมดูลคำนวณรายได้คาดการณ์รายเดือน</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FBBF24]">
                พื้นที่: {selectedDistrict.nameTh} ({selectedDistrict.zone})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ระบบคำนวณรายได้คาดการณ์รายเดือนและกระแสเงินสดเกษตรกร (ราคาผลผลิตที่ติดตาม × ผลผลิตเฉลี่ยต่อไร่รายอำเภอ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
              ดึงข้อมูลราคารับซื้อผลผลิตล่าสุดจากลานมัน-โรงงานน้ำตาล-ท่าข้าวในจังหวัดนครราชสีมา คูณกับค่าผลผลิตเฉลี่ยต่อไร่จำเพาะของแต่ละอำเภอ (ปรับตามชุดดิน ความชื้นดิน GISTDA และดัชนี SPI) เพื่อวางแผนกระแสเงินสดรายเดือนตลอดทั้งปี
            </p>
          </div>

          {/* District Selector Synced with Global State */}
          <div className="flex items-center gap-2 bg-[#080C16] border border-[#1E293B] rounded-xl px-3.5 py-2 self-start">
            <MapPin className="w-4 h-4 text-[#2DD4BF] shrink-0" />
            <div className="text-xs">
              <div className="text-[10px] font-mono text-slate-400">
                เลือกอำเภอเพื่อดึงผลผลิตเฉลี่ยต่อไร่
              </div>
              <select
                value={selectedDistrict.id}
                onChange={(e) => onSelectDistrict?.(e.target.value)}
                aria-label="เลือกอำเภอสำหรับคำนวณรายได้คาดการณ์รายเดือน"
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {KORAT_DISTRICTS.map((d, idx) => (
                  <option
                    key={d.id}
                    value={d.id}
                    className="bg-[#0B101D] text-white"
                  >
                    {String(idx + 1).padStart(2, "0")} · {d.nameTh} (ความชื้นดิน{" "}
                    {d.gistdaSoilMoisturePct}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Transparent Formula Banner: Price x District Yield/Rai x Area */}
        <div className="bg-[#080C16] border border-[#14B8A6]/45 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-[#2DD4BF]">
              สมการคำนวณรายได้คาดการณ์ประจำอำเภอ ({selectedDistrict.nameTh})
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-mono">
              <span className="px-3 py-1 rounded-lg bg-[#0B101D] border border-[#1E293B] text-[#FBBF24] font-bold">
                ราคาที่ติดตาม: {activeUnitPrice.toLocaleString()} {primaryCommodityMeta.unit}
              </span>
              <span className="text-slate-400 font-bold">×</span>
              <span className="px-3 py-1 rounded-lg bg-[#0B101D] border border-[#1E293B] text-[#2DD4BF] font-bold">
                ผลผลิตเฉลี่ย {selectedDistrict.nameTh}: {activeYieldPerRai.toLocaleString()}{" "}
                {primaryYieldMeta.yieldUnit}
              </span>
              <span className="text-slate-400 font-bold">×</span>
              <span className="px-3 py-1 rounded-lg bg-[#0B101D] border border-[#1E293B] text-white font-bold">
                พื้นที่ {areaRai} ไร่
              </span>
              <span className="text-slate-400 font-bold">=</span>
              <span className="px-3.5 py-1 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6] text-[#2DD4BF] font-bold">
                ฿{(primaryGrossPerRai * areaRai).toLocaleString()} / รอบการผลิต
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              อ้างอิงศักยภาพชุดดิน: {primaryYieldMeta.yieldExplanationTh} (ดัชนีผลผลิตอำเภอ{" "}
              <strong className="text-white">
                {primaryYieldMeta.suitabilityFactorPct}%
              </strong>{" "}
              ของค่าเฉลี่ยมาตรฐานจังหวัด)
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPriceSourceMode("local_yard");
              setCustomYieldOverride(primaryYieldMeta.districtAvgYieldPerRai);
              setCustomPriceOverride(trackedLocalPrice);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B101D] hover:bg-[#141E33] border border-[#1E293B] text-xs font-semibold text-slate-200 transition-colors self-start lg:self-center cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>รีเซ็ตตามค่าเฉลี่ยอำเภอ</span>
          </button>
        </div>

        {/* Main 12-Col Grid: Left 5 Cols Controls + Right 7 Cols Monthly Chart & KPI Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Crop, Price Source & District Yield Controls */}
          <div className="lg:col-span-5 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FBBF24]">
              <SlidersHorizontal className="w-4 h-4" />
              <span>ตั้งค่าพืชเศรษฐกิจ พื้นที่ปลูก และแหล่งอ้างอิงราคา</span>
            </div>

            {/* 1. Primary Crop Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                1. เลือกพืชเศรษฐกิจหลักที่ติดตามราคา
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KORAT_COMMODITIES.map((com) => {
                  const isSelected = selectedCropKey === com.key;
                  return (
                    <button
                      key={com.key}
                      type="button"
                      onClick={() => setSelectedCropKey(com.key)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#141E36] border-[#2DD4BF] text-white font-bold shadow-xs"
                          : "bg-[#0B101D] border-[#1E293B] text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <div className="truncate">{com.nameTh}</div>
                      <div className="text-[11px] font-mono text-[#FBBF24] mt-0.5">
                        {com.provincialAvgPrice.toLocaleString()} {com.unit}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Source Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                2. แหล่งข้อมูลราคาผลผลิตที่นำมาคำนวณ
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#0B101D] p-1 rounded-xl border border-[#1E293B] text-[11px]">
                <button
                  type="button"
                  onClick={() => setPriceSourceMode("local_yard")}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    priceSourceMode === "local_yard"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  ราคาลานรับซื้อใกล้สุด
                </button>
                <button
                  type="button"
                  onClick={() => setPriceSourceMode("provincial_avg")}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    priceSourceMode === "provincial_avg"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  ราคาเฉลี่ยจังหวัด
                </button>
                <button
                  type="button"
                  onClick={() => setPriceSourceMode("custom")}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    priceSourceMode === "custom"
                      ? "bg-[#F59E0B] text-slate-950 font-bold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  กำหนดราคาเอง
                </button>
              </div>
              {nearestYardForPrimary && priceSourceMode === "local_yard" && (
                <div className="text-[11px] font-mono text-[#2DD4BF] bg-[#0B101D] border border-[#1E293B] rounded-lg px-3 py-1.5">
                  อ้างอิง: {nearestYardForPrimary.yardName} (
                  {nearestYardForPrimary.priceToday.toLocaleString()}{" "}
                  {primaryCommodityMeta.unit})
                </div>
              )}
            </div>

            {/* 3. Custom Price & District Yield Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">ราคาผลผลิต:</span>
                  <span className="font-mono font-bold text-[#FBBF24]">
                    {activeUnitPrice.toLocaleString()} {primaryCommodityMeta.unit}
                  </span>
                </div>
                <input
                  type="number"
                  step={selectedCropKey === "jasmine_rice" || selectedCropKey === "sugarcane_fresh" ? 20 : 0.05}
                  value={activeUnitPrice}
                  onChange={(e) => {
                    setPriceSourceMode("custom");
                    setCustomPriceOverride(Math.max(0.5, Number(e.target.value) || 0));
                  }}
                  aria-label="ปรับราคาผลผลิตต่อหน่วย"
                  className="w-full bg-[#080C16] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">ผลผลิตเฉลี่ย/ไร่:</span>
                  <span className="font-mono font-bold text-[#2DD4BF]">
                    {activeYieldPerRai.toLocaleString()} {primaryYieldMeta.yieldUnit}
                  </span>
                </div>
                <input
                  type="number"
                  step={selectedCropKey === "sugarcane_fresh" ? 0.5 : 50}
                  value={activeYieldPerRai}
                  onChange={(e) =>
                    setCustomYieldOverride(Math.max(1, Number(e.target.value) || 1))
                  }
                  aria-label="ปรับผลผลิตเฉลี่ยต่อไร่"
                  className="w-full bg-[#080C16] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* 4. Cultivation Area (Rai) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  3. พื้นที่เพาะปลูกพืชหลัก ({areaRai} ไร่)
                </span>
                <span className="font-mono text-[#2DD4BF] font-bold">
                  รายได้ต่อไร่: ฿{primaryGrossPerRai.toLocaleString()}/ไร่
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={150}
                step={1}
                value={areaRai}
                onChange={(e) => setAreaRai(Number(e.target.value))}
                aria-label="พื้นที่เพาะปลูกพืชหลัก (ไร่)"
                className="w-full accent-[#14B8A6]"
              />
              <div className="flex items-center gap-1.5 pt-1">
                {[5, 10, 20, 40, 80].map((presetRai) => (
                  <button
                    key={presetRai}
                    type="button"
                    onClick={() => setAreaRai(presetRai)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                      areaRai === presetRai
                        ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6] font-bold"
                        : "bg-[#0B101D] text-slate-300 border-[#1E293B] hover:border-slate-600"
                    }`}
                  >
                    {presetRai} ไร่
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Optional Secondary Crop for Year-Round Monthly Income */}
            <div className="pt-3 border-t border-[#1E293B] space-y-2.5">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableSecondaryCrop}
                    onChange={(e) => setEnableSecondaryCrop(e.target.checked)}
                    className="rounded accent-[#14B8A6] w-4 h-4"
                  />
                  <span>เพิ่มพืชเสริม/พืชหลังนาเพื่อกระจายรายได้รายเดือน</span>
                </span>
                <span className="text-[11px] font-mono text-[#FBBF24]">
                  +{secondaryCropAreaRai} ไร่
                </span>
              </label>

              {enableSecondaryCrop && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      ชนิดพืชเสริม
                    </label>
                    <select
                      value={secondaryCropKey}
                      onChange={(e) =>
                        setSecondaryCropKey(e.target.value as CommodityKey)
                      }
                      aria-label="เลือกชนิดพืชเสริม"
                      className="w-full bg-[#080C16] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {KORAT_COMMODITIES.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      พื้นที่ปลูกพืชเสริม (ไร่)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={secondaryCropAreaRai}
                      onChange={(e) =>
                        setSecondaryCropAreaRai(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      aria-label="พื้นที่ปลูกพืชเสริม"
                      className="w-full bg-[#080C16] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 7 Cols: KPI Strip + 12-Month Projected Income Recharts Visualization */}
          <div className="lg:col-span-7 space-y-4">
            {/* 4 Key Income KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#080C16] border border-[#14B8A6]/50 rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-[#2DD4BF]">
                  รายได้คาดการณ์เฉลี่ย/เดือน
                </div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  ฿{summaryMetrics.avgMonthlyGross.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  เฉลี่ย 12 เดือน (Gross/Mo)
                </div>
              </div>

              <div className="bg-[#080C16] border border-[#F59E0B]/50 rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-[#FBBF24]">
                  กำไรสุทธิเฉลี่ย/เดือน
                </div>
                <div className="text-lg font-bold text-[#FBBF24] font-mono mt-1">
                  ฿{summaryMetrics.avgMonthlyNet.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  หลังหักต้นทุนเพาะปลูก
                </div>
              </div>

              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-slate-400">
                  รายได้รวมทั้งปีคาดการณ์
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  ฿{summaryMetrics.totalAnnualGross.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  กำไรสุทธิปีละ ฿{summaryMetrics.totalAnnualNet.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5">
                <div className="text-[11px] font-mono text-slate-400">
                  เดือนที่รายได้สูงสุด (Peak)
                </div>
                <div className="text-lg font-bold text-[#38BDF8] font-mono mt-1">
                  {summaryMetrics.peakMonth.monthShort} (฿
                  {summaryMetrics.peakMonth.grossIncome.toLocaleString()})
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ช่วงเก็บเกี่ยวผลผลิตหลัก
                </div>
              </div>
            </div>

            {/* Recharts 12-Month Income & Cashflow Chart */}
            <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono font-bold text-[#2DD4BF]">
                    12-MONTH PROJECTED FARM INCOME &amp; CASHFLOW (ม.ค. – ธ.ค.)
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    กราฟรายได้คาดการณ์รายเดือน ต้นทุนเพาะปลูก และกำไรสุทธิสะสม ({selectedDistrict.nameTh})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  หน่วย: บาท (THB)
                </span>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={monthlyProjectionData}
                    margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis
                      dataKey="monthShort"
                      stroke="#94A3B8"
                      tick={{ fill: "#CBD5E1", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      tick={{ fill: "#CBD5E1", fontSize: 11 }}
                      tickFormatter={(v) =>
                        `${Math.round(Number(v) / 1000).toLocaleString()}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0B101D",
                        borderColor: "#14B8A6",
                        borderRadius: "12px",
                        color: "#F8FAFC",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [
                        `฿${Number(value ?? 0).toLocaleString("th-TH")}`,
                        String(name ?? ""),
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <ReferenceLine y={0} stroke="#475569" />
                    <Bar
                      dataKey="grossIncome"
                      name="รายได้คาดการณ์รายเดือน"
                      fill="#14B8A6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="monthlyCost"
                      name="ต้นทุนเพาะปลูกรายเดือน"
                      fill="#F43F5E"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeNet"
                      name="กำไรสุทธิสะสม"
                      stroke="#FBBF24"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#FBBF24" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Comparison Table: All Tracked Crops in Selected District (Price x District Avg Yield/Rai) */}
        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono font-bold text-[#FBBF24]">
                DISTRICT CROP YIELD × TRACKED PRICE MATRIX ({selectedDistrict.nameTh})
              </div>
              <h3 className="text-base font-bold text-white">
                ตารางเปรียบเทียบผลผลิตเฉลี่ยต่อไร่ × ราคารับซื้อที่ติดตาม = รายได้คาดการณ์ ในพื้นที่ {selectedDistrict.nameTh}
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              คลิกที่แถวพืชเพื่อสลับนำมาคำนวณกราฟรายเดือนด้านบนทันที
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-[#1E293B] text-[11px] font-mono text-slate-400">
                  <th className="py-2.5 px-3">พืชเศรษฐกิจที่ติดตาม</th>
                  <th className="py-2.5 px-3">จุดรับซื้ออ้างอิง</th>
                  <th className="py-2.5 px-3 text-right">ราคารับซื้อล่าสุด</th>
                  <th className="py-2.5 px-3 text-right">
                    ผลผลิตเฉลี่ยต่อไร่ ({selectedDistrict.nameTh})
                  </th>
                  <th className="py-2.5 px-3 text-right">รายได้คาดการณ์ / ไร่</th>
                  <th className="py-2.5 px-3 text-right">
                    รายได้รวม ({areaRai} ไร่)
                  </th>
                  <th className="py-2.5 px-3 text-right">เฉลี่ยต่อเดือน ({areaRai} ไร่)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-xs">
                {districtAllCropsComparison.map((item) => {
                  const isCurrent = item.commodity.key === selectedCropKey;
                  return (
                    <tr
                      key={item.commodity.key}
                      onClick={() => setSelectedCropKey(item.commodity.key)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-[#14B8A6]/12 font-semibold"
                          : "hover:bg-[#0E1525]"
                      }`}
                    >
                      <td className="py-3 px-3 text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCurrent ? "bg-[#2DD4BF]" : "bg-slate-600"
                            }`}
                          />
                          <span>{item.commodity.nameTh}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.yardName}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#FBBF24]">
                        {item.trackedPrice.toLocaleString()} {item.commodity.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#2DD4BF]">
                        {item.yieldPerRai.toLocaleString()} {item.yieldUnit}{" "}
                        <span className="text-[10px] text-slate-400">
                          ({item.suitabilityPct}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">
                        ฿{item.grossPerRai.toLocaleString()}/ไร่
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                        ฿{item.totalForPlot.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#38BDF8] font-bold">
                        ฿{Math.round(item.totalForPlot / 12).toLocaleString()}/ด.
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
