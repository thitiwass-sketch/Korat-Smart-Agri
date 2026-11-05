import React, { useState, useMemo } from "react";
import {
  KORAT_DISTRICTS,
  KORAT_FERTILIZER_PRICES,
  KoratDistrict,
} from "../data/koratAgriData";
import {
  getDistrictSoilProfile,
  DistrictSoilNutrientProfile,
} from "../data/koratSoilDatabase";
import {
  TrendingUp,
  Coins,
  Scale,
  Sprout,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  BarChart3,
  LineChart,
  Calculator,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  FlaskConical,
  Info,
} from "lucide-react";

interface FertilizerEfficiencyAnalyticsModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onOpenFertilizerCalculator?: () => void;
}

export type EfficiencyCropKey =
  | "jasmine_rice"
  | "cassava"
  | "maize"
  | "sugarcane";

export type FertilizerRegimeKey =
  | "conventional"
  | "tailored_npk"
  | "precision_integrated";

interface CropEfficiencySpec {
  key: EfficiencyCropKey;
  nameTh: string;
  shortNameTh: string;
  unitLabel: string;
  pricePerKgThb: number;
  unfertilizedBaseYieldKgRai: number;
  potentialMaxYieldKgRai: number;
  conventionalFormulaLabel: string;
  conventionalCostPerRaiThb: number;
  responseSteepnessK: number;
  optimalPhMin: number;
  optimalPhMax: number;
}

const CROP_EFFICIENCY_SPECS: Record<EfficiencyCropKey, CropEfficiencySpec> = {
  jasmine_rice: {
    key: "jasmine_rice",
    nameTh: "ข้าวหอมมะลิ 105 / กข15 (นาปี)",
    shortNameTh: "ข้าวหอมมะลิ",
    unitLabel: "กก./ไร่",
    pricePerKgThb: 15.2,
    unfertilizedBaseYieldKgRai: 390,
    potentialMaxYieldKgRai: 780,
    conventionalFormulaLabel: "16-20-0 / 15-15-15 หว่านรวม",
    conventionalCostPerRaiThb: 1280,
    responseSteepnessK: 0.00145,
    optimalPhMin: 5.5,
    optimalPhMax: 6.5,
  },
  cassava: {
    key: "cassava",
    nameTh: "มันสำปะหลังสด (เชื้อแป้ง 25–30%)",
    shortNameTh: "มันสำปะหลัง",
    unitLabel: "กก./ไร่",
    pricePerKgThb: 3.15,
    unfertilizedBaseYieldKgRai: 2450,
    potentialMaxYieldKgRai: 5600,
    conventionalFormulaLabel: "15-15-15 หว่านครั้งเดียว",
    conventionalCostPerRaiThb: 1490,
    responseSteepnessK: 0.00135,
    optimalPhMin: 5.5,
    optimalPhMax: 6.5,
  },
  maize: {
    key: "maize",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ (เมล็ดแห้ง 14.5%)",
    shortNameTh: "ข้าวโพดเลี้ยงสัตว์",
    unitLabel: "กก./ไร่",
    pricePerKgThb: 10.4,
    unfertilizedBaseYieldKgRai: 640,
    potentialMaxYieldKgRai: 1380,
    conventionalFormulaLabel: "16-20-0 + 46-0-0 ไม่วัดค่าดิน",
    conventionalCostPerRaiThb: 1620,
    responseSteepnessK: 0.0013,
    optimalPhMin: 5.8,
    optimalPhMax: 6.8,
  },
  sugarcane: {
    key: "sugarcane",
    nameTh: "อ้อยโรงงานสด (ความหวาน 12+ CCS)",
    shortNameTh: "อ้อยโรงงาน",
    unitLabel: "กก./ไร่",
    pricePerKgThb: 1.42,
    unfertilizedBaseYieldKgRai: 8200,
    potentialMaxYieldKgRai: 16800,
    conventionalFormulaLabel: "15-15-15 ใส่พร้อมปลูก",
    conventionalCostPerRaiThb: 1850,
    responseSteepnessK: 0.0012,
    optimalPhMin: 5.8,
    optimalPhMax: 7.0,
  },
};

export interface SeasonEfficiencyPoint {
  yearBuddhist: number;
  seasonLabel: string;
  weatherFactorLabel: string;
  conventional: {
    costThbRai: number;
    yieldKgRai: number;
    yieldGainKgRai: number;
    yieldGainPct: number;
    grossRevenueGainThbRai: number;
    netBenefitThbRai: number;
    vcrRatio: number;
    costPerKgGainThb: number;
  };
  tailoredNpk: {
    costThbRai: number;
    yieldKgRai: number;
    yieldGainKgRai: number;
    yieldGainPct: number;
    grossRevenueGainThbRai: number;
    netBenefitThbRai: number;
    vcrRatio: number;
    costPerKgGainThb: number;
  };
  precisionIntegrated: {
    costThbRai: number;
    yieldKgRai: number;
    yieldGainKgRai: number;
    yieldGainPct: number;
    grossRevenueGainThbRai: number;
    netBenefitThbRai: number;
    vcrRatio: number;
    costPerKgGainThb: number;
  };
}

export interface DistrictEfficiencySummary {
  district: KoratDistrict;
  soilProfile: DistrictSoilNutrientProfile;
  soilRetentionFactor: number;
  phEfficiencyFactor: number;
  conventionalCostThbRai: number;
  optimizedCostThbRai: number;
  costSavedThbRai: number;
  costSavedPct: number;
  conventionalYieldKgRai: number;
  optimizedYieldKgRai: number;
  yieldImprovementOverConvKgRai: number;
  yieldImprovementOverConvPct: number;
  yieldImprovementOverBasePct: number;
  vcrConventional: number;
  vcrOptimized: number;
  netGainAdvantageThbRai: number;
  optimalBudgetSweetSpotThbRai: number;
  efficiencyGrade: "A+" | "A" | "B+" | "B";
  timeSeries: SeasonEfficiencyPoint[];
}

/**
 * คำนวณประสิทธิภาพการใช้ปุ๋ย (Fertilizer Use Efficiency & Cost-Yield Analytics)
 * อ้างอิงชุดดิน ค่า CEC, ค่า pH, อินทรียวัตถุ (OM%) และความชื้นดินรายอำเภอ
 */
function computeDistrictFertilizerAnalytics(
  district: KoratDistrict,
  cropKey: EfficiencyCropKey
): DistrictEfficiencySummary {
  const soilProfile = getDistrictSoilProfile(district.id);
  const crop = CROP_EFFICIENCY_SPECS[cropKey];

  // 1. Soil CEC & Moisture Retention Factor (0.76 - 1.16)
  const cecNorm = Math.min(1.15, Math.max(0.78, 0.72 + soilProfile.soilSeries.cecCmolKg * 0.022));
  const moistureNorm = Math.min(
    1.08,
    Math.max(0.84, 0.76 + (district.gistdaSoilMoisturePct / 100) * 0.52)
  );
  const soilRetentionFactor = Number((cecNorm * 0.65 + moistureNorm * 0.35).toFixed(3));

  // 2. Soil pH Nutrient Availability Factor (Al/Fe phosphorus fixation when pH < 5.5)
  const phDiff =
    soilProfile.soilPh < crop.optimalPhMin
      ? crop.optimalPhMin - soilProfile.soilPh
      : soilProfile.soilPh > crop.optimalPhMax
      ? soilProfile.soilPh - crop.optimalPhMax
      : 0;
  const phEfficiencyFactor = Number(
    Math.max(0.72, Math.min(1.02, 1.0 - phDiff * 0.24)).toFixed(3)
  );

  // 3. Calculate real Tailored NPK + Conditioner Cost from district fertilizerPlan
  const ureaPriceKg = 25.6; // ~1,280 THB / 50kg
  const dapPriceKg = 35.0; // ~1,750 THB / 50kg
  const mopPriceKg = 31.6; // ~1,580 THB / 50kg
  const limePriceKg = 2.4;
  const compostPriceKg = 3.2;

  const cropDoseMultiplier =
    cropKey === "sugarcane"
      ? 1.28
      : cropKey === "maize"
      ? 1.12
      : cropKey === "cassava"
      ? 1.02
      : 0.88;

  const rawTailoredChemicalCost =
    (soilProfile.fertilizerPlan.urea46_0_0KgPerRai * ureaPriceKg +
      soilProfile.fertilizerPlan.dap18_46_0KgPerRai * dapPriceKg +
      soilProfile.fertilizerPlan.mop0_0_60KgPerRai * mopPriceKg) *
    cropDoseMultiplier;

  const tailoredNpkBaseCost = Math.round(
    Math.max(680, Math.min(1650, rawTailoredChemicalCost * 0.78))
  );

  const conditionerAmendmentCost = Math.round(
    soilProfile.limeDolomiteKgPerRai * 0.45 * limePriceKg +
      Math.min(120, soilProfile.fertilizerPlan.organicCompostKgPerRai * 0.4) *
        compostPriceKg
  );

  const precisionIntegratedBaseCost = Math.round(
    tailoredNpkBaseCost * 0.92 + Math.min(240, conditionerAmendmentCost)
  );

  const conventionalBaseCost = Math.round(
    crop.conventionalCostPerRaiThb *
      (soilProfile.overallDeficiencyScore > 65 ? 1.08 : 1.0)
  );

  // 4. Generate 6-Season Historical & Projected Time-Series (พ.ศ. 2564 - 2569)
  const seasonsMeta = [
    {
      yearBuddhist: 2564,
      seasonLabel: "ปี 2564",
      priceInflationFactor: 0.84,
      climateModifier: 0.96,
      soilBuildUpFactor: 1.0,
      weatherFactorLabel: "ฝนปกติ · ราคาปุ๋ยเริ่มขยับ",
    },
    {
      yearBuddhist: 2565,
      seasonLabel: "ปี 2565",
      priceInflationFactor: 1.14,
      climateModifier: 0.98,
      soilBuildUpFactor: 1.04,
      weatherFactorLabel: "วิกฤตปุ๋ยโลกแพง · เน้นลดปุ๋ยเกินจำเป็น",
    },
    {
      yearBuddhist: 2566,
      seasonLabel: "ปี 2566",
      priceInflationFactor: 1.05,
      climateModifier: 0.91,
      soilBuildUpFactor: 1.09,
      weatherFactorLabel: "เอลนีโญฝนทิ้งช่วง · แบ่งใส่ลดสูญเสีย",
    },
    {
      yearBuddhist: 2567,
      seasonLabel: "ปี 2567",
      priceInflationFactor: 0.99,
      climateModifier: 0.95,
      soilBuildUpFactor: 1.14,
      weatherFactorLabel: "ฟื้นฟูความชื้นดิน · ปรับ pH เต็มระบบ",
    },
    {
      yearBuddhist: 2568,
      seasonLabel: "ปี 2568",
      priceInflationFactor: 1.0,
      climateModifier: 1.0,
      soilBuildUpFactor: 1.19,
      weatherFactorLabel: "สมดุลธาตุอาหารสะสม · ลดปุ๋ยเคมีลง 12%",
    },
    {
      yearBuddhist: 2569,
      seasonLabel: "ปี 2569 (คาดการณ์)",
      priceInflationFactor: 0.98,
      climateModifier: 1.03,
      soilBuildUpFactor: 1.24,
      weatherFactorLabel: "ดินร่วนซุย CEC สูงขึ้น · ผลผลิตต่อบาทสูงสุด",
    },
  ];

  const baseUnfertilizedYield = Math.round(
    crop.unfertilizedBaseYieldKgRai *
      (0.82 + (soilProfile.organicMatterPct / 2.2) * 0.25)
  );

  const yieldSpan = crop.potentialMaxYieldKgRai - baseUnfertilizedYield;

  const timeSeries: SeasonEfficiencyPoint[] = seasonsMeta.map((s, idx) => {
    // Regime 1: Conventional Blanket NPK (diminishing efficiency over time due to soil acidification/compaction)
    const convCost = Math.round(conventionalBaseCost * s.priceInflationFactor);
    const convAcidDrag = Math.max(0.76, phEfficiencyFactor - idx * 0.018);
    const convResponse =
      (1 - Math.exp(-crop.responseSteepnessK * convCost * 0.68)) *
      convAcidDrag *
      soilRetentionFactor *
      s.climateModifier;
    const convYieldGain = Math.round(yieldSpan * Math.min(0.62, convResponse));
    const convYield = baseUnfertilizedYield + convYieldGain;
    const convYieldGainPct = Number(
      ((convYieldGain / baseUnfertilizedYield) * 100).toFixed(1)
    );
    const convGrossGain = Math.round(convYieldGain * crop.pricePerKgThb);
    const convNetBenefit = convGrossGain - convCost;
    const convVcr = Number((convGrossGain / Math.max(1, convCost)).toFixed(2));
    const convCostPerKgGain = Number(
      (convCost / Math.max(1, convYieldGain)).toFixed(2)
    );

    // Regime 2: Site-Specific Tailored NPK (ปุ๋ยสั่งตัดตามค่าวิเคราะห์ดิน)
    const tailCost = Math.round(
      tailoredNpkBaseCost * s.priceInflationFactor * (1 - idx * 0.012)
    );
    const tailResponse =
      (1 - Math.exp(-crop.responseSteepnessK * tailCost * 1.05)) *
      (phEfficiencyFactor + 0.08) *
      (soilRetentionFactor + 0.05) *
      s.climateModifier *
      (1 + idx * 0.018);
    const tailYieldGain = Math.round(yieldSpan * Math.min(0.84, tailResponse));
    const tailYield = baseUnfertilizedYield + tailYieldGain;
    const tailYieldGainPct = Number(
      ((tailYieldGain / baseUnfertilizedYield) * 100).toFixed(1)
    );
    const tailGrossGain = Math.round(tailYieldGain * crop.pricePerKgThb);
    const tailNetBenefit = tailGrossGain - tailCost;
    const tailVcr = Number((tailGrossGain / Math.max(1, tailCost)).toFixed(2));
    const tailCostPerKgGain = Number(
      (tailCost / Math.max(1, tailYieldGain)).toFixed(2)
    );

    // Regime 3: Precision Integrated (ปุ๋ยสั่งตัดแบ่งใส่ + โดโลไมท์แก้ดินกรด + ปุ๋ยอินทรีย์สะสม CEC)
    // Multi-year soil health build-up reduces chemical requirement in later years while lifting yield plateau
    const precCost = Math.round(
      precisionIntegratedBaseCost *
        s.priceInflationFactor *
        (1 - idx * 0.024)
    );
    const restoredPhFactor = Math.min(1.04, phEfficiencyFactor + 0.14 + idx * 0.02);
    const precResponse =
      (1 - Math.exp(-crop.responseSteepnessK * precCost * 1.26)) *
      restoredPhFactor *
      Math.min(1.16, soilRetentionFactor + 0.09) *
      s.climateModifier *
      s.soilBuildUpFactor *
      0.86;
    const precYieldGain = Math.round(yieldSpan * Math.min(0.95, precResponse));
    const precYield = baseUnfertilizedYield + precYieldGain;
    const precYieldGainPct = Number(
      ((precYieldGain / baseUnfertilizedYield) * 100).toFixed(1)
    );
    const precGrossGain = Math.round(precYieldGain * crop.pricePerKgThb);
    const precNetBenefit = precGrossGain - precCost;
    const precVcr = Number((precGrossGain / Math.max(1, precCost)).toFixed(2));
    const precCostPerKgGain = Number(
      (precCost / Math.max(1, precYieldGain)).toFixed(2)
    );

    return {
      yearBuddhist: s.yearBuddhist,
      seasonLabel: s.seasonLabel,
      weatherFactorLabel: s.weatherFactorLabel,
      conventional: {
        costThbRai: convCost,
        yieldKgRai: convYield,
        yieldGainKgRai: convYieldGain,
        yieldGainPct: convYieldGainPct,
        grossRevenueGainThbRai: convGrossGain,
        netBenefitThbRai: convNetBenefit,
        vcrRatio: convVcr,
        costPerKgGainThb: convCostPerKgGain,
      },
      tailoredNpk: {
        costThbRai: tailCost,
        yieldKgRai: tailYield,
        yieldGainKgRai: tailYieldGain,
        yieldGainPct: tailYieldGainPct,
        grossRevenueGainThbRai: tailGrossGain,
        netBenefitThbRai: tailNetBenefit,
        vcrRatio: tailVcr,
        costPerKgGainThb: tailCostPerKgGain,
      },
      precisionIntegrated: {
        costThbRai: precCost,
        yieldKgRai: precYield,
        yieldGainKgRai: precYieldGain,
        yieldGainPct: precYieldGainPct,
        grossRevenueGainThbRai: precGrossGain,
        netBenefitThbRai: precNetBenefit,
        vcrRatio: precVcr,
        costPerKgGainThb: precCostPerKgGain,
      },
    };
  });

  // Current year (2568 / index 4) benchmark comparison
  const currentSeason = timeSeries[4];
  const conventionalCostThbRai = currentSeason.conventional.costThbRai;
  const optimizedCostThbRai = currentSeason.precisionIntegrated.costThbRai;
  const costSavedThbRai = conventionalCostThbRai - optimizedCostThbRai;
  const costSavedPct = Number(
    ((costSavedThbRai / Math.max(1, conventionalCostThbRai)) * 100).toFixed(1)
  );

  const conventionalYieldKgRai = currentSeason.conventional.yieldKgRai;
  const optimizedYieldKgRai = currentSeason.precisionIntegrated.yieldKgRai;
  const yieldImprovementOverConvKgRai =
    optimizedYieldKgRai - conventionalYieldKgRai;
  const yieldImprovementOverConvPct = Number(
    (
      (yieldImprovementOverConvKgRai / Math.max(1, conventionalYieldKgRai)) *
      100
    ).toFixed(1)
  );
  const yieldImprovementOverBasePct =
    currentSeason.precisionIntegrated.yieldGainPct;

  const vcrConventional = currentSeason.conventional.vcrRatio;
  const vcrOptimized = currentSeason.precisionIntegrated.vcrRatio;
  const netGainAdvantageThbRai =
    currentSeason.precisionIntegrated.netBenefitThbRai -
    currentSeason.conventional.netBenefitThbRai;

  const optimalBudgetSweetSpotThbRai = Math.round(optimizedCostThbRai / 10) * 10;

  const efficiencyGrade: "A+" | "A" | "B+" | "B" =
    vcrOptimized >= 4.2
      ? "A+"
      : vcrOptimized >= 3.4
      ? "A"
      : vcrOptimized >= 2.7
      ? "B+"
      : "B";

  return {
    district,
    soilProfile,
    soilRetentionFactor,
    phEfficiencyFactor,
    conventionalCostThbRai,
    optimizedCostThbRai,
    costSavedThbRai,
    costSavedPct,
    conventionalYieldKgRai,
    optimizedYieldKgRai,
    yieldImprovementOverConvKgRai,
    yieldImprovementOverConvPct,
    yieldImprovementOverBasePct,
    vcrConventional,
    vcrOptimized,
    netGainAdvantageThbRai,
    optimalBudgetSweetSpotThbRai,
    efficiencyGrade,
    timeSeries,
  };
}

export const FertilizerEfficiencyAnalyticsModule: React.FC<
  FertilizerEfficiencyAnalyticsModuleProps
> = ({ selectedDistrict, onSelectDistrict, onOpenFertilizerCalculator }) => {
  // Determine default crop from district's primary crops
  const getInitialCropForDistrict = (d: KoratDistrict): EfficiencyCropKey => {
    const first = d.primaryCrops[0] || "";
    if (first.includes("มันสำปะหลัง")) return "cassava";
    if (first.includes("ข้าวโพด")) return "maize";
    if (first.includes("อ้อย")) return "sugarcane";
    return "jasmine_rice";
  };

  const [selectedCropKey, setSelectedCropKey] = useState<EfficiencyCropKey>(
    () => getInitialCropForDistrict(selectedDistrict)
  );
  const [farmAreaRai, setFarmAreaRai] = useState<number>(20);
  const [simulatedBudgetThbRai, setSimulatedBudgetThbRai] =
    useState<number>(1050);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState<number>(4); // Default 2568
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [districtSearchQuery, setDistrictSearchQuery] = useState<string>("");
  const [sortByMetric, setSortByMetric] = useState<
    "vcr" | "net_gain" | "cost_saved" | "yield_gain"
  >("vcr");
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const cropSpec = CROP_EFFICIENCY_SPECS[selectedCropKey];

  // Compute analytics for all 32 districts for the selected crop
  const allDistrictAnalytics = useMemo(() => {
    return KORAT_DISTRICTS.map((d) =>
      computeDistrictFertilizerAnalytics(d, selectedCropKey)
    );
  }, [selectedCropKey]);

  // Active district analytics
  const activeAnalytics = useMemo(() => {
    return (
      allDistrictAnalytics.find(
        (item) => item.district.id === selectedDistrict.id
      ) || allDistrictAnalytics[0]
    );
  }, [allDistrictAnalytics, selectedDistrict.id]);

  // Sync budget slider to sweet spot when district or crop changes
  React.useEffect(() => {
    setSimulatedBudgetThbRai(activeAnalytics.optimalBudgetSweetSpotThbRai);
  }, [activeAnalytics.optimalBudgetSweetSpotThbRai, selectedDistrict.id, selectedCropKey]);

  const activeSeasonPoint =
    activeAnalytics.timeSeries[selectedSeasonIndex] ||
    activeAnalytics.timeSeries[4];

  // Diminishing marginal return curve points for the interactive Spending Optimizer (300 - 2,400 THB/rai)
  const responseCurveData = useMemo(() => {
    const points: {
      spendThbRai: number;
      conventionalYieldGainKg: number;
      precisionYieldGainKg: number;
      conventionalNetBenefitThb: number;
      precisionNetBenefitThb: number;
      precisionVcr: number;
      marginalReturnPerBaht: number;
    }[] = [];

    const baseUnfertilizedYield = Math.round(
      cropSpec.unfertilizedBaseYieldKgRai *
        (0.82 + (activeAnalytics.soilProfile.organicMatterPct / 2.2) * 0.25)
    );
    const yieldSpan = cropSpec.potentialMaxYieldKgRai - baseUnfertilizedYield;

    let prevRev = 0;
    let prevSpend = 200;

    for (let spend = 300; spend <= 2400; spend += 100) {
      // Conventional curve plateaus lower and suffers leaching/acidification drag
      const convFraction =
        (1 - Math.exp(-cropSpec.responseSteepnessK * spend * 0.68)) *
        activeAnalytics.phEfficiencyFactor *
        activeAnalytics.soilRetentionFactor *
        0.74;
      const convYieldGainKg = Math.round(yieldSpan * Math.min(0.65, convFraction));
      const convGrossRev = Math.round(convYieldGainKg * cropSpec.pricePerKgThb);
      const convNetBenefitThb = convGrossRev - spend;

      // Precision Integrated curve reaches higher plateau at lower spend
      const precFraction =
        (1 - Math.exp(-cropSpec.responseSteepnessK * spend * 1.28)) *
        Math.min(1.04, activeAnalytics.phEfficiencyFactor + 0.16) *
        Math.min(1.14, activeAnalytics.soilProfile.soilSeries.cecCmolKg > 12 ? 1.06 : 0.98);
      const precYieldGainKg = Math.round(yieldSpan * Math.min(0.95, precFraction));
      const precGrossRev = Math.round(precYieldGainKg * cropSpec.pricePerKgThb);
      const precNetBenefitThb = precGrossRev - spend;
      const precisionVcr = Number((precGrossRev / spend).toFixed(2));
      const marginalReturnPerBaht = Number(
        ((precGrossRev - prevRev) / Math.max(1, spend - prevSpend)).toFixed(2)
      );

      prevRev = precGrossRev;
      prevSpend = spend;

      points.push({
        spendThbRai: spend,
        conventionalYieldGainKg: convYieldGainKg,
        precisionYieldGainKg: precYieldGainKg,
        conventionalNetBenefitThb: convNetBenefitThb,
        precisionNetBenefitThb: precNetBenefitThb,
        precisionVcr,
        marginalReturnPerBaht,
      });
    }
    return points;
  }, [activeAnalytics, cropSpec]);

  // Evaluate simulated farmer budget on the curve
  const simulatedOutcome = useMemo(() => {
    const baseUnfertilizedYield = Math.round(
      cropSpec.unfertilizedBaseYieldKgRai *
        (0.82 + (activeAnalytics.soilProfile.organicMatterPct / 2.2) * 0.25)
    );
    const yieldSpan = cropSpec.potentialMaxYieldKgRai - baseUnfertilizedYield;

    const convFraction =
      (1 -
        Math.exp(
          -cropSpec.responseSteepnessK * simulatedBudgetThbRai * 0.68
        )) *
      activeAnalytics.phEfficiencyFactor *
      activeAnalytics.soilRetentionFactor *
      0.74;
    const convYieldGainKg = Math.round(yieldSpan * Math.min(0.65, convFraction));
    const convGrossRev = Math.round(convYieldGainKg * cropSpec.pricePerKgThb);
    const convNetBenefit = convGrossRev - simulatedBudgetThbRai;

    const precFraction =
      (1 -
        Math.exp(
          -cropSpec.responseSteepnessK * simulatedBudgetThbRai * 1.28
        )) *
      Math.min(1.04, activeAnalytics.phEfficiencyFactor + 0.16) *
      Math.min(
        1.14,
        activeAnalytics.soilProfile.soilSeries.cecCmolKg > 12 ? 1.06 : 0.98
      );
    const precYieldGainKg = Math.round(yieldSpan * Math.min(0.95, precFraction));
    const precGrossRev = Math.round(precYieldGainKg * cropSpec.pricePerKgThb);
    const precNetBenefit = precGrossRev - simulatedBudgetThbRai;
    const precVcr = Number(
      (precGrossRev / Math.max(1, simulatedBudgetThbRai)).toFixed(2)
    );

    // Marginal return at current budget (+100 THB step)
    const nextFraction =
      (1 -
        Math.exp(
          -cropSpec.responseSteepnessK * (simulatedBudgetThbRai + 100) * 1.28
        )) *
      Math.min(1.04, activeAnalytics.phEfficiencyFactor + 0.16) *
      Math.min(
        1.14,
        activeAnalytics.soilProfile.soilSeries.cecCmolKg > 12 ? 1.06 : 0.98
      );
    const nextGrossRev =
      Math.round(yieldSpan * Math.min(0.95, nextFraction)) *
      cropSpec.pricePerKgThb;
    const marginalBahtPerAdditionalBaht = Number(
      ((nextGrossRev - precGrossRev) / 100).toFixed(2)
    );

    const statusZone: "under_invested" | "optimal_sweet_spot" | "over_fertilized" =
      marginalBahtPerAdditionalBaht >= 1.65
        ? "under_invested"
        : marginalBahtPerAdditionalBaht >= 0.95
        ? "optimal_sweet_spot"
        : "over_fertilized";

    return {
      baseUnfertilizedYield,
      convYieldGainKg,
      convGrossRev,
      convNetBenefit,
      precYieldGainKg,
      precTotalYieldKg: baseUnfertilizedYield + precYieldGainKg,
      precGrossRev,
      precNetBenefit,
      precVcr,
      marginalBahtPerAdditionalBaht,
      statusZone,
    };
  }, [activeAnalytics, cropSpec, simulatedBudgetThbRai]);

  // Budget allocation breakdown (Urea 46-0-0, DAP 18-46-0, MOP 0-0-60, Soil Amendment)
  const budgetAllocationBreakdown = useMemo(() => {
    const plan = activeAnalytics.soilProfile.fertilizerPlan;
    const needsLime = activeAnalytics.soilProfile.soilPh < 5.6;

    const rawUreaBaht = plan.urea46_0_0KgPerRai * 25.6;
    const rawDapBaht = plan.dap18_46_0KgPerRai * 35.0;
    const rawMopBaht = plan.mop0_0_60KgPerRai * 31.6;
    const rawAmendmentBaht = needsLime ? 180 : 120;
    const rawTotal =
      rawUreaBaht + rawDapBaht + rawMopBaht + rawAmendmentBaht || 1;

    const ureaShare = rawUreaBaht / rawTotal;
    const dapShare = rawDapBaht / rawTotal;
    const mopShare = rawMopBaht / rawTotal;
    const amendmentShare = rawAmendmentBaht / rawTotal;

    const ureaBahtRai = Math.round(simulatedBudgetThbRai * ureaShare);
    const dapBahtRai = Math.round(simulatedBudgetThbRai * dapShare);
    const mopBahtRai = Math.round(simulatedBudgetThbRai * mopShare);
    const amendmentBahtRai = Math.max(
      0,
      simulatedBudgetThbRai - (ureaBahtRai + dapBahtRai + mopBahtRai)
    );

    return [
      {
        label: "แม่ปุ๋ยยูเรีย (46-0-0) · เร่งการเจริญเติบโตและใบ",
        formulaCode: "46-0-0",
        bahtPerRai: ureaBahtRai,
        kgPerRai: Number((ureaBahtRai / 25.6).toFixed(1)),
        totalFarmBaht: ureaBahtRai * farmAreaRai,
        totalFarmKg: Number(((ureaBahtRai / 25.6) * farmAreaRai).toFixed(0)),
        sharePct: Math.round(ureaShare * 100),
        accentClass: "bg-[#2DD4BF]",
      },
      {
        label: "แม่ปุ๋ยไดแอมโมเนียมฟอสเฟต (18-46-0) · เร่งรากและแตกกอ",
        formulaCode: "18-46-0",
        bahtPerRai: dapBahtRai,
        kgPerRai: Number((dapBahtRai / 35.0).toFixed(1)),
        totalFarmBaht: dapBahtRai * farmAreaRai,
        totalFarmKg: Number(((dapBahtRai / 35.0) * farmAreaRai).toFixed(0)),
        sharePct: Math.round(dapShare * 100),
        accentClass: "bg-[#38BDF8]",
      },
      {
        label: "แม่ปุ๋ยโพแทสเซียมคลอไรด์ (0-0-60) · เร่งน้ำหนัก/แป้ง/ความหวาน",
        formulaCode: "0-0-60",
        bahtPerRai: mopBahtRai,
        kgPerRai: Number((mopBahtRai / 31.6).toFixed(1)),
        totalFarmBaht: mopBahtRai * farmAreaRai,
        totalFarmKg: Number(((mopBahtRai / 31.6) * farmAreaRai).toFixed(0)),
        sharePct: Math.round(mopShare * 100),
        accentClass: "bg-[#FBBF24]",
      },
      {
        label: needsLime
          ? "โดโลไมท์แก้ดินกรด + ปุ๋ยอินทรีย์เพิ่มค่า CEC"
          : "ปุ๋ยอินทรีย์อัดเม็ดเพิ่มความชื้นและค่า CEC ดิน",
        formulaCode: needsLime ? "Dolomite + OM" : "Organic OM",
        bahtPerRai: amendmentBahtRai,
        kgPerRai: Number((amendmentBahtRai / 2.8).toFixed(0)),
        totalFarmBaht: amendmentBahtRai * farmAreaRai,
        totalFarmKg: Number(((amendmentBahtRai / 2.8) * farmAreaRai).toFixed(0)),
        sharePct: Math.max(
          5,
          100 -
            (Math.round(ureaShare * 100) +
              Math.round(dapShare * 100) +
              Math.round(mopShare * 100))
        ),
        accentClass: "bg-emerald-400",
      },
    ];
  }, [activeAnalytics, simulatedBudgetThbRai, farmAreaRai]);

  // Unique zones for filtering the 32-district table
  const uniqueZones = useMemo(() => {
    return Array.from(new Set(KORAT_DISTRICTS.map((d) => d.zone)));
  }, []);

  // Filtered & sorted 32-district ranking
  const filteredDistrictRanking = useMemo(() => {
    return allDistrictAnalytics
      .filter((item) => {
        if (zoneFilter !== "all" && item.district.zone !== zoneFilter) {
          return false;
        }
        if (districtSearchQuery.trim() !== "") {
          const q = districtSearchQuery.trim().toLowerCase();
          return (
            item.district.nameTh.toLowerCase().includes(q) ||
            item.district.nameEn.toLowerCase().includes(q) ||
            item.soilProfile.soilSeries.seriesNameTh.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortByMetric === "vcr") return b.vcrOptimized - a.vcrOptimized;
        if (sortByMetric === "net_gain")
          return b.netGainAdvantageThbRai - a.netGainAdvantageThbRai;
        if (sortByMetric === "cost_saved")
          return b.costSavedThbRai - a.costSavedThbRai;
        return (
          b.yieldImprovementOverConvPct - a.yieldImprovementOverConvPct
        );
      });
  }, [allDistrictAnalytics, zoneFilter, districtSearchQuery, sortByMetric]);

  // Provincial aggregate averages across all 32 districts
  const provincialSummary = useMemo(() => {
    const avgCostSaved = Math.round(
      allDistrictAnalytics.reduce((acc, d) => acc + d.costSavedThbRai, 0) /
        allDistrictAnalytics.length
    );
    const avgYieldBoostPct = Number(
      (
        allDistrictAnalytics.reduce(
          (acc, d) => acc + d.yieldImprovementOverConvPct,
          0
        ) / allDistrictAnalytics.length
      ).toFixed(1)
    );
    const avgVcrOptimized = Number(
      (
        allDistrictAnalytics.reduce((acc, d) => acc + d.vcrOptimized, 0) /
        allDistrictAnalytics.length
      ).toFixed(2)
    );
    const topDistrict = [...allDistrictAnalytics].sort(
      (a, b) => b.vcrOptimized - a.vcrOptimized
    )[0];

    return {
      avgCostSaved,
      avgYieldBoostPct,
      avgVcrOptimized,
      topDistrict,
    };
  }, [allDistrictAnalytics]);

  const handleCopyReport = () => {
    const summaryText = [
      `รายงานวิเคราะห์ประสิทธิภาพการใช้ปุ๋ยและความคุ้มค่า (Fertilizer Efficiency Analytics)`,
      `พื้นที่: ${selectedDistrict.nameTh} (${selectedDistrict.zone})`,
      `ชุดดิน: ${activeAnalytics.soilProfile.soilSeries.seriesNameTh} | pH ${activeAnalytics.soilProfile.soilPh} | CEC ${activeAnalytics.soilProfile.soilSeries.cecCmolKg} cmol/kg`,
      `พืชเศรษฐกิจ: ${cropSpec.nameTh} (${farmAreaRai} ไร่)`,
      `----------------------------------------`,
      `1. ต้นทุนปุ๋ยสูตรทั่วไปตามความเคยชิน: ${activeAnalytics.conventionalCostThbRai.toLocaleString()} บาท/ไร่ (ผลผลิต ${activeAnalytics.conventionalYieldKgRai.toLocaleString()} กก./ไร่ | VCR ${activeAnalytics.vcrConventional} เท่า)`,
      `2. ต้นทุนปุ๋ยแม่นยำตามค่าดิน (Precision Integrated): ${activeAnalytics.optimizedCostThbRai.toLocaleString()} บาท/ไร่ (ผลผลิต ${activeAnalytics.optimizedYieldKgRai.toLocaleString()} กก./ไร่ | VCR ${activeAnalytics.vcrOptimized} เท่า)`,
      `3. ประหยัดต้นทุนค่าปุ๋ย: ${activeAnalytics.costSavedThbRai.toLocaleString()} บาท/ไร่ (รวม ${
        (activeAnalytics.costSavedThbRai * farmAreaRai).toLocaleString()
      } บาท สำหรับ ${farmAreaRai} ไร่)`,
      `4. ผลผลิตเพิ่มขึ้น: +${activeAnalytics.yieldImprovementOverConvKgRai.toLocaleString()} กก./ไร่ (+${activeAnalytics.yieldImprovementOverConvPct}%)`,
      `5. กำไรสุทธิเพิ่มขึ้นรวมทั้งแปลง (${farmAreaRai} ไร่): +${(
        activeAnalytics.netGainAdvantageThbRai * farmAreaRai
      ).toLocaleString()} บาท/ฤดู`,
    ].join("\n");

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // SVG Chart helper dimensions for the 6-season Cost vs Yield Improvement time-series
  const svgWidth = 740;
  const svgHeight = 290;
  const padLeft = 56;
  const padRight = 56;
  const padTop = 28;
  const padBottom = 42;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const maxCostChart = useMemo(() => {
    const vals = activeAnalytics.timeSeries.flatMap((p) => [
      p.conventional.costThbRai,
      p.tailoredNpk.costThbRai,
      p.precisionIntegrated.costThbRai,
    ]);
    return Math.ceil(Math.max(...vals, 1800) / 200) * 200;
  }, [activeAnalytics.timeSeries]);

  const maxYieldPctChart = useMemo(() => {
    const vals = activeAnalytics.timeSeries.flatMap((p) => [
      p.conventional.yieldGainPct,
      p.tailoredNpk.yieldGainPct,
      p.precisionIntegrated.yieldGainPct,
    ]);
    return Math.ceil(Math.max(...vals, 60) / 10) * 10;
  }, [activeAnalytics.timeSeries]);

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Executive Header */}
      <div className="bg-gradient-to-r from-[#0B101D] via-[#0F172A] to-[#0B101D] border-b border-[#1E293B] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#2DD4BF] font-medium">
              <LineChart className="w-4 h-4" />
              <span>FERTILIZER EFFICIENCY & YIELD ROI ANALYTICS</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">
                วิเคราะห์ต้นทุนปุ๋ยเทียบการเพิ่มผลผลิตรายอำเภอ (พ.ศ. 2564–2569)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              แดชบอร์ดวิเคราะห์ประสิทธิภาพการใช้ปุ๋ยและความคุ้มค่าต่อผลผลิต (ครบ 32 อำเภอ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              เปรียบเทียบต้นทุนการใช้ปุ๋ยต่อไร่ (บาท/ไร่) กับอัตราการเพิ่มผลผลิตตามชุดดินและค่าวิเคราะห์ดินจริงของ{" "}
              <span className="text-[#FBBF24] font-semibold">
                {selectedDistrict.nameTh}
              </span>{" "}
              ({activeAnalytics.soilProfile.soilSeries.seriesNameTh} · pH{" "}
              {activeAnalytics.soilProfile.soilPh} · CEC{" "}
              {activeAnalytics.soilProfile.soilSeries.cecCmolKg} cmol/kg)
              เพื่อค้นหาจุดลงทุนค่าปุ๋ยที่ให้ผลตอบแทนสุทธิสูงสุดและลดการใส่ปุ๋ยเกินความจำเป็น
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">คัดลอกสรุปความคุ้มค่าแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#2DD4BF]" />
                  <span>คัดลอกรายงานความคุ้มค่า</span>
                </>
              )}
            </button>

            {onOpenFertilizerCalculator && (
              <button
                type="button"
                onClick={onOpenFertilizerCalculator}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#14B8A6] text-slate-950 font-bold text-xs transition-colors shadow-lg cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>เปิดเครื่องคำนวณสูตรปุ๋ยสั่งตัด</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Controls Bar: District Selector + Economic Crop Selector + Farm Area */}
        <div className="mt-6 pt-5 border-t border-[#1E293B] grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* District Selector */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              เลือกอำเภอที่ต้องการวิเคราะห์ประสิทธิภาพปุ๋ย (32 อำเภอ)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#2DD4BF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDistrict.id}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B101D] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-[#2DD4BF]"
              >
                {KORAT_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameTh} ({d.zone}) — pH {d.defaultSoilTest.soilPh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop Segmented Filter */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              เลือกชนิดพืชเศรษฐกิจ (เปรียบเทียบการตอบสนองต่อปุ๋ย)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#0B101D] border border-slate-800 rounded-xl">
              {(Object.keys(CROP_EFFICIENCY_SPECS) as EfficiencyCropKey[]).map(
                (key) => {
                  const spec = CROP_EFFICIENCY_SPECS[key];
                  const isActive = selectedCropKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCropKey(key)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
                        isActive
                          ? "bg-[#0D9488] text-slate-950 font-bold shadow"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      {spec.shortNameTh}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Farm Size Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ขนาดพื้นที่เพาะปลูกของเกษตรกร:{" "}
              <span className="text-[#FBBF24] font-bold">{farmAreaRai} ไร่</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={150}
                step={1}
                value={farmAreaRai}
                onChange={(e) => setFarmAreaRai(Number(e.target.value))}
                className="w-full accent-[#2DD4BF] cursor-pointer"
              />
              <input
                type="number"
                min={1}
                max={500}
                value={farmAreaRai}
                onChange={(e) =>
                  setFarmAreaRai(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
                }
                className="w-16 px-2 py-1.5 bg-[#0B101D] border border-slate-700 rounded-lg text-xs text-center text-white font-semibold tabular-nums"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Top 4 KPI Summary Cards for Selected District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI 1: Fertilizer Cost Saving */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ประหยัดต้นทุนปุ๋ยต่อไร่ (เทียบสูตรทั่วไป)</span>
              <Coins className="w-4 h-4 text-[#2DD4BF]" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2DD4BF] tabular-nums">
                  -{activeAnalytics.costSavedThbRai.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  บาท/ไร่ (-{activeAnalytics.costSavedPct}%)
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                จากเดิม {activeAnalytics.conventionalCostThbRai.toLocaleString()}{" "}
                เหลือ{" "}
                <span className="text-white font-semibold">
                  {activeAnalytics.optimizedCostThbRai.toLocaleString()} บาท/ไร่
                </span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-800/80 text-xs text-emerald-300 flex items-center justify-between">
              <span>ประหยัดรวม ({farmAreaRai} ไร่):</span>
              <span className="font-bold tabular-nums">
                {(activeAnalytics.costSavedThbRai * farmAreaRai).toLocaleString()}{" "}
                บาท/ฤดู
              </span>
            </div>
          </div>

          {/* KPI 2: Yield Improvement */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ผลผลิตเพิ่มขึ้นต่อไร่ (Yield Gain)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">
                  +{activeAnalytics.yieldImprovementOverConvKgRai.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  กก./ไร่ (+{activeAnalytics.yieldImprovementOverConvPct}%)
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                ผลผลิตแม่นยำ{" "}
                <span className="text-white font-semibold">
                  {activeAnalytics.optimizedYieldKgRai.toLocaleString()} กก./ไร่
                </span>{" "}
                (เพิ่มขึ้น +{activeAnalytics.yieldImprovementOverBasePct}% จากไม่ใส่ปุ๋ย)
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
              <span>ผลผลิตเพิ่มรวม ({farmAreaRai} ไร่):</span>
              <span className="font-bold text-emerald-300 tabular-nums">
                +
                {(
                  activeAnalytics.yieldImprovementOverConvKgRai * farmAreaRai
                ).toLocaleString()}{" "}
                กก.
              </span>
            </div>
          </div>

          {/* KPI 3: Value-Cost Ratio (VCR / Fertilizer ROI) */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ผลตอบแทนต่อเงินค่าปุ๋ย 1 บาท (VCR)</span>
              <Scale className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#FBBF24] tabular-nums">
                  {activeAnalytics.vcrOptimized.toFixed(2)}x
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  บาทผลผลิต / 1 บาทปุ๋ย
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                สูงกว่าการหว่านสูตรทั่วไป ({activeAnalytics.vcrConventional.toFixed(2)}x) · เกรด{" "}
                <span className="text-[#FBBF24] font-bold">
                  {activeAnalytics.efficiencyGrade}
                </span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
              <span>ต้นทุนปุ๋ยต่อผลผลิตส่วนเพิ่ม 1 กก.:</span>
              <span className="font-bold text-[#38BDF8] tabular-nums">
                {activeSeasonPoint.precisionIntegrated.costPerKgGainThb.toFixed(
                  2
                )}{" "}
                บาท/กก.
              </span>
            </div>
          </div>

          {/* KPI 4: Net Profit Gain per Rai & Total Farm */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>กำไรสุทธิเพิ่มขึ้น (ลดค่าปุ๋ย + ได้ผลผลิตเพิ่ม)</span>
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                  +{activeAnalytics.netGainAdvantageThbRai.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  บาท/ไร่/ฤดู
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                งบปุ๋ยจุดคุ้มค่าสูงสุดแนะนำ:{" "}
                <span className="text-[#2DD4BF] font-semibold">
                  {activeAnalytics.optimalBudgetSweetSpotThbRai.toLocaleString()}{" "}
                  บาท/ไร่
                </span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-800/80 text-xs text-[#FBBF24] flex items-center justify-between">
              <span>ผลประโยชน์สุทธิรวม ({farmAreaRai} ไร่):</span>
              <span className="font-extrabold tabular-nums">
                +
                {(
                  activeAnalytics.netGainAdvantageThbRai * farmAreaRai
                ).toLocaleString()}{" "}
                บาท
              </span>
            </div>
          </div>
        </div>

        {/* Main Section 1: 6-Season Historical & Projected Time-Series Chart (Cost vs Yield Improvement Over Time) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Dual-Metric SVG Time-Series Chart */}
          <div className="lg:col-span-8 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#2DD4BF]" />
                  <span>
                    แนวโน้มต้นทุนปุ๋ย (บาท/ไร่) เทียบอัตราการเพิ่มผลผลิต (%) รายปี (พ.ศ. 2564–2569)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  แท่งกราฟแสดงต้นทุนปุ๋ยต่อไร่ (แกนซ้าย) · เส้นกราฟแสดง % ผลผลิตที่เพิ่มขึ้นเทียบแปลงไม่ใส่ปุ๋ย (แกนขวา) ของ{" "}
                  <span className="text-slate-200 font-semibold">
                    {selectedDistrict.nameTh}
                  </span>
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-600 inline-block" />
                  <span>สูตรทั่วไป (15-15-15)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#38BDF8] inline-block" />
                  <span>ปุ๋ยสั่งตัดตามค่าดิน</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#2DD4BF] inline-block" />
                  <span>แม่นยำบูรณาการ (ปุ๋ยสั่งตัด+ปรับ pH)</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[580px] select-none"
                role="img"
                aria-label="กราฟเปรียบเทียบต้นทุนปุ๋ยและการเพิ่มผลผลิตรายปี"
              >
                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = padTop + plotH - ratio * plotH;
                  const costLabel = Math.round(ratio * maxCostChart);
                  const yieldPctLabel = Math.round(ratio * maxYieldPctChart);
                  return (
                    <g key={idx}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="#1E293B"
                        strokeDasharray={idx === 0 ? undefined : "4 4"}
                        strokeWidth={1}
                      />
                      {/* Left Y-Axis: Fertilizer Cost (THB/rai) */}
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px] font-mono"
                      >
                        ฿{costLabel}
                      </text>
                      {/* Right Y-Axis: Yield Gain (%) */}
                      <text
                        x={svgWidth - padRight + 8}
                        y={y + 4}
                        textAnchor="start"
                        className="fill-emerald-400 text-[10px] font-mono"
                      >
                        +{yieldPctLabel}%
                      </text>
                    </g>
                  );
                })}

                {/* Grouped Bars for Fertilizer Cost per Rai across 6 seasons */}
                {activeAnalytics.timeSeries.map((pt, idx) => {
                  const groupSlotW = plotW / activeAnalytics.timeSeries.length;
                  const centerX = padLeft + groupSlotW * idx + groupSlotW / 2;
                  const barW = 16;

                  const convBarH =
                    (pt.conventional.costThbRai / maxCostChart) * plotH;
                  const tailBarH =
                    (pt.tailoredNpk.costThbRai / maxCostChart) * plotH;
                  const precBarH =
                    (pt.precisionIntegrated.costThbRai / maxCostChart) * plotH;

                  const isSelected = selectedSeasonIndex === idx;

                  return (
                    <g
                      key={pt.yearBuddhist}
                      onClick={() => setSelectedSeasonIndex(idx)}
                      className="cursor-pointer"
                    >
                      {/* Highlight Band for Active Season */}
                      {isSelected && (
                        <rect
                          x={centerX - groupSlotW / 2 + 6}
                          y={padTop - 8}
                          width={groupSlotW - 12}
                          height={plotH + 14}
                          rx={8}
                          fill="#1E293B"
                          fillOpacity={0.55}
                          stroke="#2DD4BF"
                          strokeOpacity={0.4}
                        />
                      )}

                      {/* Bar 1: Conventional Cost */}
                      <rect
                        x={centerX - barW * 1.6}
                        y={padTop + plotH - convBarH}
                        width={barW}
                        height={convBarH}
                        rx={3}
                        fill="#475569"
                        fillOpacity={0.85}
                      />

                      {/* Bar 2: Tailored NPK Cost */}
                      <rect
                        x={centerX - barW * 0.5}
                        y={padTop + plotH - tailBarH}
                        width={barW}
                        height={tailBarH}
                        rx={3}
                        fill="#38BDF8"
                        fillOpacity={0.75}
                      />

                      {/* Bar 3: Precision Integrated Cost */}
                      <rect
                        x={centerX + barW * 0.6}
                        y={padTop + plotH - precBarH}
                        width={barW}
                        height={precBarH}
                        rx={3}
                        fill="#2DD4BF"
                        fillOpacity={0.9}
                      />

                      {/* X-Axis Year Label */}
                      <text
                        x={centerX}
                        y={svgHeight - 14}
                        textAnchor="middle"
                        className={`text-[11px] font-semibold ${
                          isSelected ? "fill-[#FBBF24]" : "fill-slate-300"
                        }`}
                      >
                        {pt.seasonLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Polyline 1: Conventional Yield Gain % */}
                <polyline
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  points={activeAnalytics.timeSeries
                    .map((pt, idx) => {
                      const groupSlotW =
                        plotW / activeAnalytics.timeSeries.length;
                      const x = padLeft + groupSlotW * idx + groupSlotW / 2;
                      const y =
                        padTop +
                        plotH -
                        (pt.conventional.yieldGainPct / maxYieldPctChart) *
                          plotH;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Polyline 2: Tailored NPK Yield Gain % */}
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  points={activeAnalytics.timeSeries
                    .map((pt, idx) => {
                      const groupSlotW =
                        plotW / activeAnalytics.timeSeries.length;
                      const x = padLeft + groupSlotW * idx + groupSlotW / 2;
                      const y =
                        padTop +
                        plotH -
                        (pt.tailoredNpk.yieldGainPct / maxYieldPctChart) *
                          plotH;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Polyline 3: Precision Integrated Yield Gain % */}
                <polyline
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth={3}
                  points={activeAnalytics.timeSeries
                    .map((pt, idx) => {
                      const groupSlotW =
                        plotW / activeAnalytics.timeSeries.length;
                      const x = padLeft + groupSlotW * idx + groupSlotW / 2;
                      const y =
                        padTop +
                        plotH -
                        (pt.precisionIntegrated.yieldGainPct /
                          maxYieldPctChart) *
                          plotH;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Data Nodes on Yield Lines */}
                {activeAnalytics.timeSeries.map((pt, idx) => {
                  const groupSlotW = plotW / activeAnalytics.timeSeries.length;
                  const x = padLeft + groupSlotW * idx + groupSlotW / 2;
                  const yConv =
                    padTop +
                    plotH -
                    (pt.conventional.yieldGainPct / maxYieldPctChart) * plotH;
                  const yPrec =
                    padTop +
                    plotH -
                    (pt.precisionIntegrated.yieldGainPct / maxYieldPctChart) *
                      plotH;
                  return (
                    <g
                      key={`dots-${pt.yearBuddhist}`}
                      onClick={() => setSelectedSeasonIndex(idx)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={yConv}
                        r={3.5}
                        fill="#0B101D"
                        stroke="#94A3B8"
                        strokeWidth={2}
                      />
                      <circle
                        cx={x}
                        cy={yPrec}
                        r={5}
                        fill="#FBBF24"
                        stroke="#0B101D"
                        strokeWidth={2}
                      />
                      <text
                        x={x}
                        y={yPrec - 9}
                        textAnchor="middle"
                        className="fill-[#FBBF24] text-[10px] font-bold font-mono"
                      >
                        +{pt.precisionIntegrated.yieldGainPct}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Season Selector Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                คลิกเลือกปีเพาะปลูกเพื่อดูรายละเอียดต้นทุนปุ๋ยและผลตอบแทนรายปี:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeAnalytics.timeSeries.map((pt, idx) => (
                  <button
                    key={pt.yearBuddhist}
                    type="button"
                    onClick={() => setSelectedSeasonIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedSeasonIndex === idx
                        ? "bg-[#FBBF24] text-slate-950 font-bold"
                        : "bg-[#111827] text-slate-300 hover:text-white border border-slate-800"
                    }`}
                  >
                    {pt.seasonLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Selected Season Side-by-Side Regime Inspector */}
          <div className="lg:col-span-4 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-[#FBBF24] font-semibold">
                <span>เจาะลึกรายปีเพาะปลูก · {activeSeasonPoint.seasonLabel}</span>
                <span className="text-slate-400">
                  {selectedDistrict.nameTh}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                เปรียบเทียบ 3 แนวทางการจัดการปุ๋ย ({cropSpec.shortNameTh})
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                สภาวะแวดล้อม: {activeSeasonPoint.weatherFactorLabel}
              </p>
            </div>

            <div className="space-y-3">
              {/* Regime Card 1: Conventional */}
              <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    1. สูตรทั่วไปตามความเคยชิน ({cropSpec.conventionalFormulaLabel})
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    VCR {activeSeasonPoint.conventional.vcrRatio}x
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <div className="text-slate-400">ต้นทุนปุ๋ย</div>
                    <div className="font-bold text-white tabular-nums">
                      {activeSeasonPoint.conventional.costThbRai.toLocaleString()}{" "}
                      บ./ไร่
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">ผลผลิตที่ได้</div>
                    <div className="font-bold text-slate-200 tabular-nums">
                      {activeSeasonPoint.conventional.yieldKgRai.toLocaleString()}{" "}
                      กก. (+{activeSeasonPoint.conventional.yieldGainPct}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">กำไรจากปุ๋ย</div>
                    <div className="font-bold text-slate-300 tabular-nums">
                      +{activeSeasonPoint.conventional.netBenefitThbRai.toLocaleString()}{" "}
                      บ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Regime Card 2: Site-Specific Tailored NPK */}
              <div className="p-3.5 rounded-xl bg-[#111827] border border-sky-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#38BDF8]">
                    2. ปุ๋ยสั่งตัดตามค่าวิเคราะห์ดิน ({activeAnalytics.soilProfile.fertilizerPlan.recommendedFormulaLabel})
                  </span>
                  <span className="text-xs font-mono text-[#38BDF8] font-bold">
                    VCR {activeSeasonPoint.tailoredNpk.vcrRatio}x
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <div className="text-slate-400">ต้นทุนปุ๋ย</div>
                    <div className="font-bold text-[#38BDF8] tabular-nums">
                      {activeSeasonPoint.tailoredNpk.costThbRai.toLocaleString()}{" "}
                      บ./ไร่
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">ผลผลิตที่ได้</div>
                    <div className="font-bold text-white tabular-nums">
                      {activeSeasonPoint.tailoredNpk.yieldKgRai.toLocaleString()}{" "}
                      กก. (+{activeSeasonPoint.tailoredNpk.yieldGainPct}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">กำไรจากปุ๋ย</div>
                    <div className="font-bold text-[#38BDF8] tabular-nums">
                      +{activeSeasonPoint.tailoredNpk.netBenefitThbRai.toLocaleString()}{" "}
                      บ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Regime Card 3: Precision Integrated (Recommended Winner) */}
              <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-[#2DD4BF]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2DD4BF]">
                    3. แม่นยำบูรณาการ (ปุ๋ยสั่งตัดแบ่งใส่ + ปรับ pH/CEC ดิน)
                  </span>
                  <span className="text-xs font-mono text-[#FBBF24] font-bold">
                    VCR {activeSeasonPoint.precisionIntegrated.vcrRatio}x
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <div className="text-slate-400">ต้นทุนปุ๋ย</div>
                    <div className="font-bold text-[#2DD4BF] tabular-nums">
                      {activeSeasonPoint.precisionIntegrated.costThbRai.toLocaleString()}{" "}
                      บ./ไร่
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">ผลผลิตที่ได้</div>
                    <div className="font-bold text-emerald-300 tabular-nums">
                      {activeSeasonPoint.precisionIntegrated.yieldKgRai.toLocaleString()}{" "}
                      กก. (+{activeSeasonPoint.precisionIntegrated.yieldGainPct}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">กำไรจากปุ๋ย</div>
                    <div className="font-bold text-[#FBBF24] tabular-nums">
                      +{activeSeasonPoint.precisionIntegrated.netBenefitThbRai.toLocaleString()}{" "}
                      บ.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agronomic Insight Box */}
            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <span>ทำไมการปรับปรุงดินคู่ปุ๋ยสั่งตัดจึงลดต้นทุนได้ต่อเนื่อง?</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                ในพื้นที่ {selectedDistrict.nameTh} ({activeAnalytics.soilProfile.soilSeries.seriesNameTh})
                การปรับค่า pH จาก {activeAnalytics.soilProfile.soilPh} และเพิ่มอินทรียวัตถุช่วยให้รากพืชดูดฟอสฟอรัสและโพแทสเซียมที่ตกค้างในดินได้ดีขึ้น{" "}
                <span className="text-emerald-300 font-semibold">
                  ลดการสูญเสียปุ๋ยจากการชะล้างได้ถึง {Math.round((1 - activeAnalytics.phEfficiencyFactor * 0.82) * 100)}%
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Section 2: Interactive Fertilizer Spending Optimizer & Diminishing Marginal Returns Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Budget Slider & Marginal Return Curve */}
          <div className="lg:col-span-7 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#FBBF24]" />
                  <span>
                    จำลองจุดคุ้มทุนและเพดานงบค่าปุ๋ยที่เหมาะสม (Diminishing Returns Optimizer)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ทดลองปรับงบค่าปุ๋ยต่อไร่เพื่อตรวจสอบว่าเงินทุก 100 บาทที่ใส่เพิ่ม สร้างผลผลิตคุ้มค่าปุ๋ยหรือไม่
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSimulatedBudgetThbRai(
                    activeAnalytics.optimalBudgetSweetSpotThbRai
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-[#2DD4BF] text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                ตั้งค่าตามจุดเหมาะสมที่สุด ({activeAnalytics.optimalBudgetSweetSpotThbRai.toLocaleString()} บ./ไร่)
              </button>
            </div>

            {/* Interactive Budget Slider */}
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  งบประมาณค่าปุ๋ยที่คุณต้องการใช้ต่อไร่:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-[#FBBF24] tabular-nums">
                    {simulatedBudgetThbRai.toLocaleString()} บาท/ไร่
                  </span>
                  <span className="text-xs text-slate-400">
                    (รวม {farmAreaRai} ไร่ ={" "}
                    {(simulatedBudgetThbRai * farmAreaRai).toLocaleString()} บาท)
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={300}
                max={2400}
                step={50}
                value={simulatedBudgetThbRai}
                onChange={(e) =>
                  setSimulatedBudgetThbRai(Number(e.target.value))
                }
                className="w-full accent-[#FBBF24] cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>฿300/ไร่ (ใส่ปุ๋ยน้อยเกินไป)</span>
                <span className="text-[#2DD4BF] font-bold">
                  ★ จุดเหมาะสมที่สุด ฿{activeAnalytics.optimalBudgetSweetSpotThbRai}/ไร่
                </span>
                <span>฿2,400/ไร่ (เกินจุดคุ้มทุน/เฝ้าระวังปุ๋ยสูญเสีย)</span>
              </div>
            </div>

            {/* Zone Diagnostic Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                simulatedOutcome.statusZone === "optimal_sweet_spot"
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  : simulatedOutcome.statusZone === "under_invested"
                  ? "bg-sky-950/30 border-sky-500/40 text-sky-200"
                  : "bg-amber-950/30 border-amber-500/40 text-amber-200"
              }`}
            >
              {simulatedOutcome.statusZone === "optimal_sweet_spot" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#FBBF24] shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm text-white">
                  {simulatedOutcome.statusZone === "optimal_sweet_spot"
                    ? "อยู่ในช่วงจุดคุ้มค่าสูงสุด (Optimal Spending Sweet Spot)"
                    : simulatedOutcome.statusZone === "under_invested"
                    ? "ยังสามารถเพิ่มงบปุ๋ยเพื่อรับผลผลิตที่คุ้มค่าสูงกว่านี้ได้ (Under-Invested Zone)"
                    : "เตือนภัย: เริ่มเข้าสู่เขตผลตอบแทนลดน้อยถอยลง (Over-Fertilization / Diminishing Returns)"}
                </div>
                <p className="leading-relaxed">
                  ที่ระดับงบ{" "}
                  <span className="font-bold text-white">
                    {simulatedBudgetThbRai.toLocaleString()} บาท/ไร่
                  </span>{" "}
                  จะได้ผลผลิตรวม{" "}
                  <span className="font-bold text-white">
                    {simulatedOutcome.precTotalYieldKg.toLocaleString()} กก./ไร่
                  </span>{" "}
                  (เพิ่มขึ้น +{simulatedOutcome.precYieldGainKg.toLocaleString()} กก./ไร่) ·
                  การใส่เงินค่าปุ๋ยเพิ่มอีก 1 บาท ณ จุดนี้ จะสร้างรายได้ผลผลิตกลับมา{" "}
                  <span className="font-bold underline">
                    {simulatedOutcome.marginalBahtPerAdditionalBaht.toFixed(2)} บาท
                  </span>{" "}
                  (VCR เฉลี่ยทั้งแปลง = {simulatedOutcome.precVcr}x)
                </p>
              </div>
            </div>

            {/* Visual Marginal Return Step Bars across Spending Brackets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  กราฟเปรียบเทียบกำไรสุทธิจากปุ๋ย (บาท/ไร่) ตามระดับงบประมาณ
                </span>
                <span>คลิกที่แท่งงบประมาณเพื่อเลือกจำลอง</span>
              </div>
              <div className="grid grid-cols-11 gap-1.5 items-end h-36 pt-4 px-2 bg-[#111827] border border-slate-800 rounded-xl">
                {responseCurveData
                  .filter((_, i) => i % 2 === 0)
                  .map((pt) => {
                    const maxNet = Math.max(
                      ...responseCurveData.map((d) => d.precisionNetBenefitThb),
                      1000
                    );
                    const barHeightPct = Math.max(
                      12,
                      Math.round((pt.precisionNetBenefitThb / maxNet) * 100)
                    );
                    const isCurrent =
                      Math.abs(pt.spendThbRai - simulatedBudgetThbRai) <= 100;
                    const isSweetSpot =
                      Math.abs(
                        pt.spendThbRai -
                          activeAnalytics.optimalBudgetSweetSpotThbRai
                      ) <= 100;

                    return (
                      <button
                        key={pt.spendThbRai}
                        type="button"
                        onClick={() => setSimulatedBudgetThbRai(pt.spendThbRai)}
                        className="flex flex-col items-center justify-end h-full group cursor-pointer"
                        title={`งบ ${pt.spendThbRai} บ./ไร่ → กำไรสุทธิ +${pt.precisionNetBenefitThb.toLocaleString()} บ./ไร่ (VCR ${pt.precisionVcr}x)`}
                      >
                        <div className="text-[9px] font-mono text-slate-400 mb-1">
                          {pt.precisionVcr}x
                        </div>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            isCurrent
                              ? "bg-[#FBBF24]"
                              : isSweetSpot
                              ? "bg-[#2DD4BF]"
                              : pt.marginalReturnPerBaht < 1.0
                              ? "bg-rose-500/60"
                              : "bg-slate-600 group-hover:bg-slate-400"
                          }`}
                          style={{ height: `${barHeightPct}%` }}
                        />
                        <div
                          className={`text-[10px] font-mono mt-1.5 pb-1 ${
                            isCurrent
                              ? "text-[#FBBF24] font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          ฿{pt.spendThbRai}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Optimal Budget Breakdown into Exact NPK Bags & Farm Spending Plan */}
          <div className="lg:col-span-5 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-[#2DD4BF] font-semibold">
                <span>SMART SPENDING ALLOCATION</span>
                <span>สำหรับแปลง {farmAreaRai} ไร่</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                แผนจัดสรรงบค่าปุ๋ย {simulatedBudgetThbRai.toLocaleString()} บาท/ไร่ ให้คุ้มค่าที่สุด
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                สัดส่วนการจัดซื้อแม่ปุ๋ยและสารปรับปรุงดินตามค่าวิเคราะห์ดินของ{" "}
                <span className="text-white font-semibold">
                  {selectedDistrict.nameTh}
                </span>{" "}
                (OM {activeAnalytics.soilProfile.organicMatterPct}% · P{" "}
                {activeAnalytics.soilProfile.availablePPpm} ppm · K{" "}
                {activeAnalytics.soilProfile.exchangeableKPpm} ppm)
              </p>
            </div>

            <div className="space-y-3">
              {budgetAllocationBreakdown.map((item) => (
                <div
                  key={item.formulaCode}
                  className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FBBF24] shrink-0">
                      {item.bahtPerRai.toLocaleString()} บ./ไร่ ({item.sharePct}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.accentClass}`}
                      style={{ width: `${Math.min(100, item.sharePct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      อัตราใช้:{" "}
                      <strong className="text-slate-200">
                        {item.kgPerRai} กก./ไร่
                      </strong>
                    </span>
                    <span>
                      รวม {farmAreaRai} ไร่:{" "}
                      <strong className="text-[#2DD4BF]">
                        {item.totalFarmKg.toLocaleString()} กก. (
                        {item.totalFarmBaht.toLocaleString()} บาท)
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Application Timing Advice */}
            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-[#2DD4BF]">
                จังหวะการแบ่งใส่เพื่อเพิ่มประสิทธิภาพปุ๋ยสูงสุด:
              </div>
              <p className="text-slate-300 leading-relaxed">
                {
                  activeAnalytics.soilProfile.fertilizerPlan
                    .splitApplicationScheduleTh
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Section 3: 32-District Fertilizer Efficiency Leaderboard & Cross-District Matrix */}
        <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2DD4BF]" />
                <span>
                  ตารางเปรียบเทียบประสิทธิภาพการใช้ปุ๋ยและความคุ้มค่ารายอำเภอ (ครบทั้ง 32 อำเภอ)
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ค่าเฉลี่ยทั้งจังหวัดนครราชสีมา: ประหยัดต้นทุนปุ๋ย{" "}
                <span className="text-[#2DD4BF] font-semibold">
                  {provincialSummary.avgCostSaved} บาท/ไร่
                </span>{" "}
                · ผลผลิตเพิ่มเฉลี่ย{" "}
                <span className="text-emerald-400 font-semibold">
                  +{provincialSummary.avgYieldBoostPct}%
                </span>{" "}
                · ค่าเฉลี่ย VCR{" "}
                <span className="text-[#FBBF24] font-semibold">
                  {provincialSummary.avgVcrOptimized}x
                </span>
              </p>
            </div>

            {/* Search, Zone Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={districtSearchQuery}
                  onChange={(e) => setDistrictSearchQuery(e.target.value)}
                  placeholder="ค้นหาอำเภอ หรือชุดดิน..."
                  className="pl-8 pr-3 py-1.5 bg-[#111827] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#111827] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="all">ทุกโซนการเกษตร (32 อำเภอ)</option>
                {uniqueZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>

              <select
                value={sortByMetric}
                onChange={(e) =>
                  setSortByMetric(
                    e.target.value as
                      | "vcr"
                      | "net_gain"
                      | "cost_saved"
                      | "yield_gain"
                  )
                }
                className="px-3 py-1.5 bg-[#111827] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="vcr">เรียงตามความคุ้มค่า (VCR สูงสุด)</option>
                <option value="net_gain">เรียงตามกำไรสุทธิเพิ่มขึ้นสูงสุด</option>
                <option value="cost_saved">เรียงตามการประหยัดค่าปุ๋ยสูงสุด</option>
                <option value="yield_gain">เรียงตาม % ผลผลิตเพิ่มขึ้นสูงสุด</option>
              </select>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[460px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#111827] text-slate-300 sticky top-0 z-10 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">อำเภอ / โซน</th>
                  <th className="py-3 px-3.5 font-semibold">ชุดดินหลัก · pH · CEC</th>
                  <th className="py-3 px-3.5 font-semibold text-right">
                    ต้นทุนสูตรทั่วไป
                  </th>
                  <th className="py-3 px-3.5 font-semibold text-right">
                    ต้นทุนแม่นยำ (แนะนำ)
                  </th>
                  <th className="py-3 px-3.5 font-semibold text-right">
                    ประหยัดค่าปุ๋ย
                  </th>
                  <th className="py-3 px-3.5 font-semibold text-right">
                    ผลผลิตเพิ่มขึ้น
                  </th>
                  <th className="py-3 px-3.5 font-semibold text-right">
                    ความคุ้มค่า (VCR)
                  </th>
                  <th className="py-3 px-3.5 font-semibold text-right">
                    กำไรสุทธิเพิ่ม/ไร่
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredDistrictRanking.map((row, idx) => {
                  const isSelected = row.district.id === selectedDistrict.id;
                  return (
                    <tr
                      key={row.district.id}
                      onClick={() => onSelectDistrict(row.district.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#0D9488]/20 hover:bg-[#0D9488]/25"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="py-3 px-3.5 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono w-5">
                            {idx + 1}.
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{row.district.nameTh}</span>
                              {isSelected && (
                                <span className="text-[10px] text-[#2DD4BF] font-bold">
                                  (กำลังเลือก)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {row.district.zone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-300">
                        <div className="font-medium text-slate-200 truncate max-w-[210px]">
                          {row.soilProfile.soilSeries.seriesNameTh}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          pH {row.soilProfile.soilPh} · CEC{" "}
                          {row.soilProfile.soilSeries.cecCmolKg} · OM{" "}
                          {row.soilProfile.organicMatterPct}%
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-slate-400 tabular-nums">
                        {row.conventionalCostThbRai.toLocaleString()} บ.
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-[#2DD4BF] tabular-nums">
                        {row.optimizedCostThbRai.toLocaleString()} บ.
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-emerald-400 tabular-nums">
                        -{row.costSavedThbRai.toLocaleString()} บ. (-
                        {row.costSavedPct}%)
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono text-emerald-300 tabular-nums">
                        +{row.yieldImprovementOverConvKgRai.toLocaleString()} กก. (+
                        {row.yieldImprovementOverConvPct}%)
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-[#FBBF24] tabular-nums">
                        {row.vcrOptimized.toFixed(2)}x{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({row.efficiencyGrade})
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-bold text-white tabular-nums">
                        +{row.netGainAdvantageThbRai.toLocaleString()} บ./ไร่
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
