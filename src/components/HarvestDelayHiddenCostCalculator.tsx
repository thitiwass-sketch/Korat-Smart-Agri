import React, { useState, useMemo } from "react";
import {
  CommodityKey,
  CROP_FORECAST_PROFILES,
  KORAT_COMMODITIES,
  KoratDistrict,
} from "../data/koratAgriData";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scale,
  DollarSign,
  CloudRain,
  Bug,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  RotateCcw,
} from "lucide-react";

interface HarvestDelayHiddenCostCalculatorProps {
  selectedCommodity: CommodityKey;
  selectedDistrict: KoratDistrict;
  simulatedVolumeTons: number;
  onVolumeChange?: (tons: number) => void;
}

type ScenarioPreset =
  | "normal"
  | "wet_rain"
  | "drought_hard"
  | "disease_outbreak"
  | "custom";

interface TimeHorizonAnalysis {
  label: string;
  days: number;
  nominalPricePerUnit: number;
  qualityDropUnit: number;
  effectiveQualityValue: number;
  qualityPricePenaltyPerUnit: number;
  effectivePricePerUnit: number;
  physicalWeatherLossPct: number;
  pestDiseaseLossPct: number;
  totalVolumeLossPct: number;
  effectiveVolumeTons: number;
  grossRevenueBaht: number;
  baseProductionCostBaht: number;
  baseHarvestCostBaht: number;
  extraLaborMachineryCostBaht: number;
  extraFieldMaintenanceCostBaht: number;
  opportunityCostNextCropBaht: number;
  totalCostBaht: number;
  realNetProfitBaht: number;
  deltaGrossRevenueVsToday: number;
  deltaNetProfitVsToday: number;
  isGrossIllusion: boolean; // Revenue looks up, but Net Profit is down!
  verdict: "highly_profitable" | "slightly_profitable" | "break_even" | "net_loss" | "baseline";
}

export const HarvestDelayHiddenCostCalculator: React.FC<
  HarvestDelayHiddenCostCalculatorProps
> = ({
  selectedCommodity,
  selectedDistrict,
  simulatedVolumeTons,
  onVolumeChange,
}) => {
  const profile = CROP_FORECAST_PROFILES[selectedCommodity];
  const commodityMeta =
    KORAT_COMMODITIES.find((c) => c.key === selectedCommodity) ||
    KORAT_COMMODITIES[0];

  const isPerTon = commodityMeta.tonsMultiplier === 1; // e.g. sugarcane or rice (Baht/Ton), else Baht/Kg
  const unitLabel = profile.unit; // "บาท/กก." or "บาท/ตัน"

  // Base field specs
  const [volumeTons, setVolumeTons] = useState<number>(simulatedVolumeTons || 35);
  const [estimatedPlantedRai, setEstimatedPlantedRai] = useState<number>(
    Math.max(1, Math.round((simulatedVolumeTons || 35) / 3.5))
  );
  const [baseProductionCostPerRai, setBaseProductionCostPerRai] = useState<number>(5500); // ฿/ไร่

  // Active Preset Scenario
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset>("normal");
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"net_profit" | "hidden_costs" | "sensitivity">("net_profit");

  // Specific Delay Parameters (Customizable)
  // 1. Quality / Starch % degradation per 30-day delay
  const [initialQualityValue, setInitialQualityValue] = useState<number>(
    commodityMeta.baseQualityVal || (selectedCommodity === "cassava_fresh" ? 28 : 10)
  );
  // Quality degradation rate per 30 days (e.g. -1.8% starch per 30d in cassava)
  const [qualityDropRatePer30d, setQualityDropRatePer30d] = useState<number>(
    selectedCommodity === "cassava_fresh" ? 1.8 : selectedCommodity === "sugarcane_fresh" ? 0.6 : 0.8
  );
  // Penalty rate per unit of quality dropped (e.g. 0.06 ฿/kg per 1% starch in cassava, or 85 ฿/ton per CCS in cane)
  const [qualityPenaltyPerDropUnit, setQualityPenaltyPerDropUnit] = useState<number>(
    selectedCommodity === "cassava_fresh" ? 0.06 : selectedCommodity === "sugarcane_fresh" ? 85 : 0.08
  );

  // 2. Extra Labor & Machinery rental cost per ton per 30 days delay (฿/ton)
  const [baseHarvestCostPerTon, setBaseHarvestCostPerTon] = useState<number>(
    selectedCommodity === "cassava_fresh" ? 350 : selectedCommodity === "sugarcane_fresh" ? 280 : 320
  );
  const [extraLaborCostPerTonPer30d, setExtraLaborCostPerTonPer30d] = useState<number>(120);

  // 3. Weather Physical Loss % per 30 days delay (rot, breakage due to hard soil, lodging)
  const [weatherLossPctPer30d, setWeatherLossPctPer30d] = useState<number>(2.5);

  // 4. Pest & Disease Loss % per 30 days delay (SLCMV, mealybugs, root rot, fungal)
  const [diseaseLossPctPer30d, setDiseaseLossPctPer30d] = useState<number>(2.0);

  // 5. Monthly Field Maintenance & Security (฿/month for whole plot)
  const [fieldMaintenancePerMonth, setFieldMaintenancePerMonth] = useState<number>(800);

  // 6. Opportunity Cost of Delayed Next Planting Cycle (฿/rai/month)
  const [opportunityCostPerRaiPerMonth, setOpportunityCostPerRaiPerMonth] = useState<number>(250);

  // Synchronize with parent volume if changed outside
  React.useEffect(() => {
    if (simulatedVolumeTons && simulatedVolumeTons !== volumeTons) {
      setVolumeTons(simulatedVolumeTons);
      setEstimatedPlantedRai(Math.max(1, Math.round(simulatedVolumeTons / 3.5)));
    }
  }, [simulatedVolumeTons]);

  const handleVolumeInput = (val: number) => {
    const safeVal = Math.max(1, Math.min(val, 2000));
    setVolumeTons(safeVal);
    setEstimatedPlantedRai(Math.max(1, Math.round(safeVal / 3.5)));
    if (onVolumeChange) onVolumeChange(safeVal);
  };

  // Preset Applicator
  const applyPreset = (preset: ScenarioPreset) => {
    setActiveScenario(preset);
    if (preset === "normal") {
      setQualityDropRatePer30d(selectedCommodity === "cassava_fresh" ? 1.5 : 0.6);
      setExtraLaborCostPerTonPer30d(100);
      setWeatherLossPctPer30d(1.8);
      setDiseaseLossPctPer30d(1.5);
      setFieldMaintenancePerMonth(600);
      setOpportunityCostPerRaiPerMonth(200);
    } else if (preset === "wet_rain") {
      // Late rain or wet clay soil -> starch plummets, high rot, trucks stuck in mud
      setQualityDropRatePer30d(selectedCommodity === "cassava_fresh" ? 3.2 : 1.4);
      setExtraLaborCostPerTonPer30d(220); // towing trucks, wet soil digging
      setWeatherLossPctPer30d(5.5);
      setDiseaseLossPctPer30d(3.8); // root rot increases drastically in waterlogged soil
      setFieldMaintenancePerMonth(1000);
      setOpportunityCostPerRaiPerMonth(350);
    } else if (preset === "drought_hard") {
      // Extreme drought -> soil cracks, tubers snap off in hard earth, heavy manual labor
      setQualityDropRatePer30d(selectedCommodity === "cassava_fresh" ? 1.0 : 0.4);
      setExtraLaborCostPerTonPer30d(190); // hard digging labor
      setWeatherLossPctPer30d(4.5); // broken tubers left behind in rock-hard clay
      setDiseaseLossPctPer30d(1.5);
      setFieldMaintenancePerMonth(700);
      setOpportunityCostPerRaiPerMonth(250);
    } else if (preset === "disease_outbreak") {
      // Cassava Mosaic Disease (SLCMV) or stem rot spreading unchecked
      setQualityDropRatePer30d(selectedCommodity === "cassava_fresh" ? 2.5 : 1.0);
      setExtraLaborCostPerTonPer30d(140);
      setWeatherLossPctPer30d(2.0);
      setDiseaseLossPctPer30d(7.0); // high defect rate at factory gate
      setFieldMaintenancePerMonth(900);
      setOpportunityCostPerRaiPerMonth(300);
    }
  };

  // Perform Calculations across 4 time horizons: Today, +30d, +60d, +90d
  const timeHorizons: TimeHorizonAnalysis[] = useMemo(() => {
    const horizons = [
      { label: "ขายทันที (วันนี้)", days: 0, nominalPrice: profile.currentPrice },
      { label: "ชะลอขาย +30 วัน", days: 30, nominalPrice: profile.forecast30dPrice },
      { label: "ชะลอขาย +60 วัน", days: 60, nominalPrice: profile.forecast60dPrice },
      { label: "ชะลอขาย +90 วัน", days: 90, nominalPrice: profile.forecast90dPrice },
    ];

    const baseProductionCostTotal = baseProductionCostPerRai * estimatedPlantedRai;

    // Baseline calculations for Today (t=0)
    const baseHarvestCostToday = baseHarvestCostPerTon * volumeTons;
    const nominalGrossRevenueToday = Math.round(
      profile.currentPrice * commodityMeta.tonsMultiplier * volumeTons
    );
    const totalCostToday = baseProductionCostTotal + baseHarvestCostToday;
    const netProfitToday = nominalGrossRevenueToday - totalCostToday;

    return horizons.map((h, idx) => {
      const months = h.days / 30;

      // 1. Quality & Starch drop
      const qualityDrop = idx === 0 ? 0 : qualityDropRatePer30d * months;
      const effectiveQuality = Math.max(0, initialQualityValue - qualityDrop);
      const qualityPenalty = qualityDrop * qualityPenaltyPerDropUnit;
      const effectivePrice = Math.max(0.1, h.nominalPrice - qualityPenalty);

      // 2. Physical volume losses (Weather + Disease)
      const weatherLossPct = idx === 0 ? 0 : Math.min(30, weatherLossPctPer30d * months);
      const diseaseLossPct = idx === 0 ? 0 : Math.min(30, diseaseLossPctPer30d * months);
      const totalLossPct = Math.min(50, weatherLossPct + diseaseLossPct);
      const effectiveVolume = Number((volumeTons * (1 - totalLossPct / 100)).toFixed(2));

      // 3. Gross Revenue after quality penalty and volume shrinkage
      const effectiveRevenuePerTon = effectivePrice * commodityMeta.tonsMultiplier;
      const grossRevenue = Math.round(effectiveRevenuePerTon * effectiveVolume);

      // 4. Costs
      const baseHarvestCost = Math.round(baseHarvestCostPerTon * effectiveVolume);
      const extraLaborCost = idx === 0 ? 0 : Math.round(extraLaborCostPerTonPer30d * months * effectiveVolume);
      const extraFieldMaint = idx === 0 ? 0 : Math.round(fieldMaintenancePerMonth * months);
      const opportunityCost = idx === 0 ? 0 : Math.round(opportunityCostPerRaiPerMonth * estimatedPlantedRai * months);

      const totalCost =
        baseProductionCostTotal +
        baseHarvestCost +
        extraLaborCost +
        extraFieldMaint +
        opportunityCost;

      const realNetProfit = grossRevenue - totalCost;

      const deltaGrossRevenue = grossRevenue - nominalGrossRevenueToday;
      const deltaNetProfit = realNetProfit - netProfitToday;

      // Gross Revenue Illusion occurs when nominal or actual gross revenue is higher, but net profit is strictly lower!
      const isGrossIllusion = deltaGrossRevenue > 0 && deltaNetProfit < 0;

      let verdict: TimeHorizonAnalysis["verdict"] = "baseline";
      if (idx === 0) {
        verdict = "baseline";
      } else if (deltaNetProfit > 5000) {
        verdict = "highly_profitable";
      } else if (deltaNetProfit > 0) {
        verdict = "slightly_profitable";
      } else if (Math.abs(deltaNetProfit) <= 1000) {
        verdict = "break_even";
      } else {
        verdict = "net_loss";
      }

      return {
        label: h.label,
        days: h.days,
        nominalPricePerUnit: h.nominalPrice,
        qualityDropUnit: Number(qualityDrop.toFixed(2)),
        effectiveQualityValue: Number(effectiveQuality.toFixed(2)),
        qualityPricePenaltyPerUnit: Number(qualityPenalty.toFixed(2)),
        effectivePricePerUnit: Number(effectivePrice.toFixed(2)),
        physicalWeatherLossPct: Number(weatherLossPct.toFixed(1)),
        pestDiseaseLossPct: Number(diseaseLossPct.toFixed(1)),
        totalVolumeLossPct: Number(totalLossPct.toFixed(1)),
        effectiveVolumeTons: effectiveVolume,
        grossRevenueBaht: grossRevenue,
        baseProductionCostBaht: baseProductionCostTotal,
        baseHarvestCostBaht: baseHarvestCost,
        extraLaborMachineryCostBaht: extraLaborCost,
        extraFieldMaintenanceCostBaht: extraFieldMaint,
        opportunityCostNextCropBaht: opportunityCost,
        totalCostBaht: totalCost,
        realNetProfitBaht: realNetProfit,
        deltaGrossRevenueVsToday: deltaGrossRevenue,
        deltaNetProfitVsToday: deltaNetProfit,
        isGrossIllusion,
        verdict,
      };
    });
  }, [
    baseHarvestCostPerTon,
    baseProductionCostPerRai,
    commodityMeta.tonsMultiplier,
    diseaseLossPctPer30d,
    estimatedPlantedRai,
    extraLaborCostPerTonPer30d,
    fieldMaintenancePerMonth,
    initialQualityValue,
    opportunityCostPerRaiPerMonth,
    profile.currentPrice,
    profile.forecast30dPrice,
    profile.forecast60dPrice,
    profile.forecast90dPrice,
    qualityDropRatePer30d,
    qualityPenaltyPerDropUnit,
    volumeTons,
    weatherLossPctPer30d,
  ]);

  const todayAnalysis = timeHorizons[0];
  const analysis30d = timeHorizons[1];
  const analysis60d = timeHorizons[2];
  const analysis90d = timeHorizons[3];

  // Best Horizon for Real Net Profit
  const bestHorizon = useMemo(() => {
    let best = timeHorizons[0];
    for (const h of timeHorizons) {
      if (h.realNetProfitBaht > best.realNetProfitBaht) {
        best = h;
      }
    }
    return best;
  }, [timeHorizons]);

  // Check if any horizon triggers Gross Revenue Illusion
  const illusionHorizon = timeHorizons.find((h) => h.isGrossIllusion);

  // Break-even sensitivity calculation: How much higher must the price be in 30 days to break even?
  const breakEven30dPrice = useMemo(() => {
    const totalExtraCost30d =
      analysis30d.extraLaborMachineryCostBaht +
      analysis30d.extraFieldMaintenanceCostBaht +
      analysis30d.opportunityCostNextCropBaht;
    const requiredRevenue = todayAnalysis.grossRevenueBaht + totalExtraCost30d;
    const requiredPricePerTon = requiredRevenue / analysis30d.effectiveVolumeTons;
    const requiredPricePerUnit =
      commodityMeta.tonsMultiplier === 1000
        ? requiredPricePerTon / 1000 + analysis30d.qualityPricePenaltyPerUnit
        : requiredPricePerTon + analysis30d.qualityPricePenaltyPerUnit;
    return Number(requiredPricePerUnit.toFixed(2));
  }, [
    analysis30d.effectiveVolumeTons,
    analysis30d.extraFieldMaintenanceCostBaht,
    analysis30d.extraLaborMachineryCostBaht,
    analysis30d.opportunityCostNextCropBaht,
    analysis30d.qualityPricePenaltyPerUnit,
    commodityMeta.tonsMultiplier,
    todayAnalysis.grossRevenueBaht,
  ]);

  return (
    <div className="bg-[#0B101D] card-ambient-glow border border-[#1E293B] rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Module Title & Core Value Proposition */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]/80 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#2DD4BF] uppercase tracking-wider mb-1.5">
            <Scale className="w-4 h-4 text-[#14B8A6]" />
            <span>โมเดลเศรษฐศาสตร์ชะลอการเก็บเกี่ยว (Harvest Delay Economic Engine)</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#FBBF24]">เขต {selectedDistrict.nameTh}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
            <span>คำนวณต้นทุนแฝง & วิเคราะห์ “กำไรสุทธิ” แท้จริง</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/15 text-[#2DD4BF] border border-teal-500/30 font-medium">
              Real Net Profit vs Gross Revenue
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            ก้าวข้ามการดูแค่ <strong className="text-white">“ราคาป้ายและรายได้รวม”</strong> ด้วยการประเมิน 4 ปัจจัยต้นทุนแฝงจริง:
            การลดลงของ % เชื้อแป้ง/คุณภาพ, ค่าแรงและรถเกี่ยวช่วงฤดูชนกัน, ความเสี่ยงฝนชุก-แล้งจัด, และการสูญเสียจากโรคพืชสะสม
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#121A2B] border border-[#1E293B] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("net_profit")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "net_profit"
                ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-[#2DD4BF] border border-teal-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>เปรียบเทียบกำไรสุทธิ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hidden_costs")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "hidden_costs"
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>เจาะลึก 4 ต้นทุนแฝง</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sensitivity")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sensitivity"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>จุดคุ้มทุน (Break-Even)</span>
          </button>
        </div>
      </div>

      {/* Gross Revenue Illusion Warning Banner (When applicable) */}
      {illusionHorizon && (
        <div className="bg-gradient-to-r from-amber-950/70 via-rose-950/60 to-[#0F172A] border border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg animate-fade-in relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  แจ้งเตือนภาพลวงตารายได้รวม (Gross Revenue Illusion)
                </span>
                <span className="text-xs text-slate-400">พบในตัวเลือก {illusionHorizon.label}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                แม้ราคาหน้าโรงงานช่วง {illusionHorizon.label} จะดูเหมือนทำให้รายได้รวมเพิ่มขึ้น{" "}
                <strong className="text-emerald-400 font-mono">
                  +฿{illusionHorizon.deltaGrossRevenueVsToday.toLocaleString("th-TH")}
                </strong>{" "}
                แต่เมื่อหักต้นทุนแฝง (% แป้งลดลง -{illusionHorizon.qualityDropUnit}%, ค่าแรงขุดสูงขึ้น และผลผลิตเน่าเสีย){" "}
                <strong className="text-rose-400 underline decoration-rose-500/50">
                  กำไรสุทธิแท้จริงกลับลดลงฮวบ {illusionHorizon.deltaNetProfitVsToday.toLocaleString("th-TH")} บาท!
                </strong>
              </p>
            </div>
          </div>
          <div className="shrink-0 md:text-right pl-13 md:pl-0">
            <div className="text-[11px] text-slate-400">คำแนะนำเชิงกลยุทธ์</div>
            <div className="text-sm font-bold text-amber-300">
              {bestHorizon.days === 0 ? "แนะนำเก็บเกี่ยวขายทันที" : `จุดทำกำไรสูงสุดคือ ${bestHorizon.label}`}
            </div>
          </div>
        </div>
      )}

      {/* Preset Scenario Selector Buttons */}
      <div className="space-y-2.5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>เลือกจำลองสถานการณ์ความเสี่ยงในแปลง (Scenario Presets):</span>
            <span className="text-[11px] text-slate-500 font-normal">
              คลิกเพื่อโหลดค่าสัมประสิทธิ์ความเสี่ยงสภาพอากาศและราคาปาดลดคุณภาพ
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="text-xs text-[#2DD4BF] hover:text-[#5eead4] flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>{showAdvancedControls ? "ซ่อนตัวแปรปรับแต่งละเอียด" : "เปิดสไลเดอร์ปรับตัวแปรเอง (Custom Sliders)"}</span>
            {showAdvancedControls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset("normal")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              activeScenario === "normal"
                ? "bg-[#14263B] border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                : "bg-[#0E1526] border-[#1E293B] hover:border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-200">1. สภาพปกติทั่วไป</span>
              {activeScenario === "normal" && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              ฝนทิ้งช่วง ดินแห้งปานกลาง แป้งลดลงช้า -1.5%/เดือน
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("wet_rain")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              activeScenario === "wet_rain"
                ? "bg-[#14263B] border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                : "bg-[#0E1526] border-[#1E293B] hover:border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-sky-300">2. ฝนหลงฤดู·ดินแฉะ</span>
              {activeScenario === "wet_rain" && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              แตกใบอ่อน แป้งรูด -3.2% รถติดหล่ม ค่าแรงขุดพุ่ง +฿220/ตัน
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("drought_hard")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              activeScenario === "drought_hard"
                ? "bg-[#14263B] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-[#0E1526] border-[#1E293B] hover:border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-300">3. แล้งจัด·ดินแข็ง</span>
              {activeScenario === "drought_hard" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              ดินแตกระแหง หัวมันหักขาดคาดิน 4.5% แรงงานขุดยาก
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("disease_outbreak")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              activeScenario === "disease_outbreak"
                ? "bg-[#14263B] border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                : "bg-[#0E1526] border-[#1E293B] hover:border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-300">4. ระบาดโรคใบด่าง/เน่า</span>
              {activeScenario === "disease_outbreak" && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              ปล่อยค้างแปลงนาน หัวเน่าดำ โรงงานปาดทิ้ง -7.0%
            </p>
          </button>
        </div>
      </div>

      {/* Advanced Sliders & Field Inputs Panel (Collapsible) */}
      {showAdvancedControls && (
        <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-400" />
              <span>ปรับแต่งตัวแปรแปลงและสัมประสิทธิ์ต้นทุนแฝงเฉพาะรายแปลง</span>
            </div>
            <button
              type="button"
              onClick={() => applyPreset("normal")}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตเป็นค่ามาตรฐาน</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Input 1: Harvest Volume */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                ปริมาณผลผลิตในแปลง (ตัน):
              </label>
              <input
                type="number"
                min={1}
                max={1500}
                value={volumeTons}
                onChange={(e) => handleVolumeInput(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm font-mono bg-[#141E33] border border-[#2A3756] rounded-lg text-white focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                คำนวณพื้นที่ประมาณ: {estimatedPlantedRai} ไร่
              </span>
            </div>

            {/* Input 2: Starch/Quality Drop Rate */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                อัตรา % แป้งลดลงต่อ 30 วัน ({selectedCommodity === "cassava_fresh" ? "% แป้ง" : "หน่วย"}):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.1}
                  value={qualityDropRatePer30d}
                  onChange={(e) => {
                    setQualityDropRatePer30d(Number(e.target.value));
                    setActiveScenario("custom");
                  }}
                  className="flex-1 accent-teal-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-teal-300 w-12 text-right">
                  -{qualityDropRatePer30d.toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                หักราคา {qualityPenaltyPerDropUnit} {unitLabel}/1% แป้ง
              </span>
            </div>

            {/* Input 3: Extra Labor Cost */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                ค่าแรง/รถเกี่ยวส่วนเพิ่ม (บาท/ตัน/เดือน):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={400}
                  step={10}
                  value={extraLaborCostPerTonPer30d}
                  onChange={(e) => {
                    setExtraLaborCostPerTonPer30d(Number(e.target.value));
                    setActiveScenario("custom");
                  }}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-amber-300 w-14 text-right">
                  +฿{extraLaborCostPerTonPer30d}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                จากค่าขุดปกติ ฿{baseHarvestCostPerTon}/ตัน
              </span>
            </div>

            {/* Input 4: Disease + Weather Loss */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                อัตราผลผลิตสูญเสียสภาพอากาศ + โรค (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={weatherLossPctPer30d + diseaseLossPctPer30d}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    setWeatherLossPctPer30d(Number((total * 0.55).toFixed(1)));
                    setDiseaseLossPctPer30d(Number((total * 0.45).toFixed(1)));
                    setActiveScenario("custom");
                  }}
                  className="flex-1 accent-rose-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-rose-300 w-12 text-right">
                  -{(weatherLossPctPer30d + diseaseLossPctPer30d).toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                ต่อการชะลอ 30 วัน (หัวหักคาดิน + หัวเน่า)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area based on Active Tab */}
      {activeTab === "net_profit" && (
        <div className="space-y-6 relative z-10">
          {/* Top 4 Horizon Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeHorizons.map((h, i) => {
              const isBest = h.days === bestHorizon.days;
              const isToday = h.days === 0;

              return (
                <div
                  key={h.label}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between ${
                    isBest
                      ? "bg-gradient-to-b from-[#102336] to-[#0A1322] border-teal-500/80 shadow-[0_0_25px_rgba(20,184,166,0.25)] ring-1 ring-teal-500/50"
                      : h.isGrossIllusion
                      ? "bg-gradient-to-b from-[#221316] to-[#0E121E] border-amber-500/40"
                      : "bg-[#0E1526] border-[#1E293B]"
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {h.label}
                    </span>
                    {isBest && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-[#2DD4BF] border border-teal-500/40">
                        กำไรสุทธิสูงสุด ★
                      </span>
                    )}
                    {h.isGrossIllusion && !isBest && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        กำไรลวงตา ⚠️
                      </span>
                    )}
                  </div>

                  {/* Core Metric: Real Net Profit */}
                  <div className="space-y-1 my-1">
                    <div className="text-xs text-slate-400">กำไรสุทธิแท้จริง (Net Profit)</div>
                    <div
                      className={`text-2xl font-bold font-mono tracking-tight ${
                        isBest
                          ? "text-[#2DD4BF]"
                          : h.realNetProfitBaht >= todayAnalysis.realNetProfitBaht
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      ฿{h.realNetProfitBaht.toLocaleString("th-TH")}
                    </div>

                    {/* Delta Badge vs Today */}
                    {!isToday ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${
                            h.deltaNetProfitVsToday >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {h.deltaNetProfitVsToday >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {h.deltaNetProfitVsToday >= 0 ? "+" : ""}
                          ฿{h.deltaNetProfitVsToday.toLocaleString("th-TH")}
                        </span>
                        <span className="text-[10px] text-slate-500">เทียบขายวันนี้</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 pt-1 font-mono">
                        (เกณฑ์อ้างอิงฐานการขาย)
                      </div>
                    )}
                  </div>

                  {/* Detailed Metric Strip */}
                  <div className="space-y-2 pt-3 mt-3 border-t border-[#1E293B] text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>รายได้รวม (Gross):</span>
                      <span className="font-mono text-slate-200">
                        ฿{h.grossRevenueBaht.toLocaleString("th-TH")}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>ราคาโรงงาน:</span>
                      <span className="font-mono text-slate-300">
                        {h.nominalPricePerUnit.toFixed(isPerTon ? 0 : 2)} {unitLabel}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>ราคาจริงหลังหักแป้ง:</span>
                      <span
                        className={`font-mono font-medium ${
                          h.effectivePricePerUnit < h.nominalPricePerUnit
                            ? "text-amber-400"
                            : "text-slate-200"
                        }`}
                      >
                        {h.effectivePricePerUnit.toFixed(isPerTon ? 0 : 2)} {unitLabel}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>ผลผลิตที่เหลือขายได้:</span>
                      <span className="font-mono text-slate-200">
                        {h.effectiveVolumeTons.toFixed(1)} ตัน{" "}
                        {h.totalVolumeLossPct > 0 && (
                          <span className="text-rose-400 font-normal">(-{h.totalVolumeLossPct}%)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>ต้นทุนรวม (ฐาน+แฝง):</span>
                      <span className="font-mono text-rose-300">
                        ฿{h.totalCostBaht.toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-side: Gross Revenue vs Real Net Profit Waterfall Comparison */}
          <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-400" />
                  <span>ตารางแจกแจงเปรียบเทียบ: รายได้รวม vs กำไรสุทธิแท้จริง (Full Breakdown Matrix)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  แสดงจุดหักเหที่ต้นทุนแฝง (ค่าแป้งตก, ค่าแรงส่วนเพิ่ม, และความเสียหาย) เปลี่ยนตัวเลขในสมุดบัญชีของเกษตรกร
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                ฐานการผลิต: {estimatedPlantedRai} ไร่ ({volumeTons} ตัน)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-mono">
                    <th className="py-2.5 px-3">มิติเวลา</th>
                    <th className="py-2.5 px-3">ราคาโรงงาน</th>
                    <th className="py-2.5 px-3">คุณภาพ/%แป้ง</th>
                    <th className="py-2.5 px-3">ผลผลิตเหลือจริง</th>
                    <th className="py-2.5 px-3">รายได้รวม (Gross)</th>
                    <th className="py-2.5 px-3">ต้นทุนฐาน (ไร่)</th>
                    <th className="py-2.5 px-3">ต้นทุนแฝงชะลอ</th>
                    <th className="py-2.5 px-3 font-bold text-[#2DD4BF]">กำไรสุทธิแท้จริง</th>
                    <th className="py-2.5 px-3 text-right">ส่วนต่างกำไรเทียบวันนี้</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                  {timeHorizons.map((h) => {
                    const extraCosts =
                      h.extraLaborMachineryCostBaht +
                      h.extraFieldMaintenanceCostBaht +
                      h.opportunityCostNextCropBaht;
                    const isBest = h.days === bestHorizon.days;

                    return (
                      <tr
                        key={h.label}
                        className={`transition-colors ${
                          isBest
                            ? "bg-teal-500/10 hover:bg-teal-500/15"
                            : "hover:bg-[#121A2B]"
                        }`}
                      >
                        <td className="py-3 px-3 font-medium text-white flex items-center gap-1.5">
                          <span>{h.label}</span>
                          {isBest && (
                            <span className="text-[10px] text-teal-400 font-normal">★ ดีที่สุด</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {h.nominalPricePerUnit.toFixed(isPerTon ? 0 : 2)} {unitLabel}
                        </td>
                        <td className="py-3 px-3">
                          <span className={h.qualityDropUnit > 0 ? "text-amber-400" : "text-slate-300"}>
                            {h.effectiveQualityValue}%{" "}
                            {h.qualityDropUnit > 0 && `(-${h.qualityDropUnit}%)`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {h.effectiveVolumeTons} ตัน
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          ฿{h.grossRevenueBaht.toLocaleString("th-TH")}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          ฿{h.baseProductionCostBaht.toLocaleString("th-TH")}
                        </td>
                        <td className="py-3 px-3 text-rose-300">
                          {extraCosts > 0 ? `+฿${extraCosts.toLocaleString("th-TH")}` : "-"}
                        </td>
                        <td
                          className={`py-3 px-3 font-bold text-sm ${
                            isBest ? "text-[#2DD4BF]" : "text-emerald-400"
                          }`}
                        >
                          ฿{h.realNetProfitBaht.toLocaleString("th-TH")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {h.days === 0 ? (
                            <span className="text-slate-500">เกณฑ์ฐาน</span>
                          ) : (
                            <span
                              className={`font-bold px-2 py-0.5 rounded ${
                                h.deltaNetProfitVsToday >= 0
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {h.deltaNetProfitVsToday >= 0 ? "+" : ""}
                              ฿{h.deltaNetProfitVsToday.toLocaleString("th-TH")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Costs In-Depth Breakdown Tab */}
      {activeTab === "hidden_costs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 animate-fade-in">
          {/* Card 1: Starch & Quality Degradation */}
          <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
              <Percent className="w-4 h-4" />
              <span>1. การลดลงของคุณภาพและ % เชื้อแป้ง (Starch Drop Penalty)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              เมื่อชะลอการเก็บเกี่ยวข้ามเดือน หากมีฝนตกปลายฤดู ต้นมันสำปะหลังจะเกิดการ <strong>แตกใบอ่อน (Flushing)</strong>{" "}
              โดยดึงแป้งที่สะสมในหัวกลับไปสร้างกิ่งก้าน ทำให้เปอร์เซ็นต์แป้งลดลงอย่างรวดเร็ว
            </p>
            <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs">
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">ชะลอ 30 วัน:</span>
                <span className="font-mono text-amber-300">
                  แป้งลด -{analysis30d.qualityDropUnit}% (สูญเสียมูลค่า ฿
                  {Math.round(
                    analysis30d.qualityPricePenaltyPerUnit *
                      commodityMeta.tonsMultiplier *
                      analysis30d.effectiveVolumeTons
                  ).toLocaleString("th-TH")}
                  )
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">ชะลอ 60 วัน:</span>
                <span className="font-mono text-amber-300">
                  แป้งลด -{analysis60d.qualityDropUnit}% (สูญเสียมูลค่า ฿
                  {Math.round(
                    analysis60d.qualityPricePenaltyPerUnit *
                      commodityMeta.tonsMultiplier *
                      analysis60d.effectiveVolumeTons
                  ).toLocaleString("th-TH")}
                  )
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ชะลอ 90 วัน:</span>
                <span className="font-mono text-rose-400 font-bold">
                  แป้งลด -{analysis90d.qualityDropUnit}% (สูญเสียมูลค่า ฿
                  {Math.round(
                    analysis90d.qualityPricePenaltyPerUnit *
                      commodityMeta.tonsMultiplier *
                      analysis90d.effectiveVolumeTons
                  ).toLocaleString("th-TH")}
                  )
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Labor & Machinery Scarcity */}
          <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-sm">
              <DollarSign className="w-4 h-4" />
              <span>2. ค่าแรงงานและรถเกี่ยวช่วงฤดูหนาแน่น (Labor Peak Inflation)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ช่วงเดือน พ.ย.–ม.ค. ในโคราชเป็นช่วง <strong>Harvest Peak</strong> ที่ผลผลิตออกสู่ตลาดกว่า 65% เกิดภาวะแย่งชิงแรงงาน
              ทำให้ค่าจ้างขุด แบก และรถตัดพุ่งสูงขึ้น พร้อมความเสี่ยงแปลงแฉะที่ต้องจ้างรถแทรกเตอร์ลากพ่วง
            </p>
            <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">ส่วนเพิ่ม 30 วัน:</span>
                <span className="text-sky-300">
                  +฿{analysis30d.extraLaborMachineryCostBaht.toLocaleString("th-TH")} (+฿{extraLaborCostPerTonPer30d}/ตัน)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">ส่วนเพิ่ม 60 วัน:</span>
                <span className="text-sky-300">
                  +฿{analysis60d.extraLaborMachineryCostBaht.toLocaleString("th-TH")} (+฿{extraLaborCostPerTonPer30d * 2}/ตัน)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">ส่วนเพิ่ม 90 วัน:</span>
                <span className="text-rose-400 font-bold">
                  +฿{analysis90d.extraLaborMachineryCostBaht.toLocaleString("th-TH")} (+฿{extraLaborCostPerTonPer30d * 3}/ตัน)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Weather Risk & Physical Losses */}
          <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
              <CloudRain className="w-4 h-4" />
              <span>3. ความเสี่ยงสภาพอากาศ (ดินแตกระแหง / ฝนหลงฤดู)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              หากดินแห้งแล้งจัด ดินโคราชจะจับตัวแข็ง ทำให้หัวมัน <strong>หักขาดคาดิน</strong> ตอนดึงขุด (สูญเสียน้ำหนัก 3–6%)
              หรือหากฝนตกชุก น้ำท่วมขังเพียง 3–5 วัน หัวมันจะเริ่มเน่าช้ำจนโรงงานคัดทิ้ง
            </p>
            <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">สูญเสีย 30 วัน:</span>
                <span className="text-cyan-300">
                  -{analysis30d.physicalWeatherLossPct}% (~
                  {((volumeTons * analysis30d.physicalWeatherLossPct) / 100).toFixed(1)} ตัน)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">สูญเสีย 60 วัน:</span>
                <span className="text-cyan-300">
                  -{analysis60d.physicalWeatherLossPct}% (~
                  {((volumeTons * analysis60d.physicalWeatherLossPct) / 100).toFixed(1)} ตัน)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">สูญเสีย 90 วัน:</span>
                <span className="text-rose-400 font-bold">
                  -{analysis90d.physicalWeatherLossPct}% (~
                  {((volumeTons * analysis90d.physicalWeatherLossPct) / 100).toFixed(1)} ตัน)
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Plant Disease & Pest Losses */}
          <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm">
              <Bug className="w-4 h-4" />
              <span>4. ความเสียหายสะสมจากโรคพืชและแมลง (Disease Accumulation)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              การทิ้งผลผลิตค้างแปลงนานขึ้น เปิดโอกาสให้ <strong>โรคใบด่างมันสำปะหลัง (SLCMV)</strong>, โรครากเน่าโคนเน่า,
              และเพลี้ยแป้งระบาดสะสม หัวมันบางส่วนเริ่มเน่าดำที่ปลายราก ถูกหักสิ่งเจือปนหน้าลานรับซื้อ
            </p>
            <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">สูญเสีย 30 วัน:</span>
                <span className="text-rose-300">
                  -{analysis30d.pestDiseaseLossPct}% (~
                  {((volumeTons * analysis30d.pestDiseaseLossPct) / 100).toFixed(1)} ตัน)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]/60">
                <span className="text-slate-400">สูญเสีย 60 วัน:</span>
                <span className="text-rose-300">
                  -{analysis60d.pestDiseaseLossPct}% (~
                  {((volumeTons * analysis60d.pestDiseaseLossPct) / 100).toFixed(1)} ตัน)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">สูญเสีย 90 วัน:</span>
                <span className="text-rose-400 font-bold">
                  -{analysis90d.pestDiseaseLossPct}% (~
                  {((volumeTons * analysis90d.pestDiseaseLossPct) / 100).toFixed(1)} ตัน)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Break-Even & Sensitivity Analysis Tab */}
      {activeTab === "sensitivity" && (
        <div className="bg-[#0E1526] border border-[#1E293B] rounded-2xl p-5 space-y-5 relative z-10 animate-fade-in">
          <div className="pb-3 border-b border-[#1E293B]">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ดัชนีจุดคุ้มทุนการชะลอเก็บเกี่ยว (Break-Even Decision Thresholds)</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              คำนวณราคาหน้าโรงงานขั้นต่ำและเกณฑ์ % เชื้อแป้งที่ “ต้องไม่ต่ำกว่านี้” หากเกษตรกรคิดจะชะลอการเก็บเกี่ยว
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#121A2B] border border-cyan-500/30 space-y-2">
              <div className="text-xs text-slate-400">ราคาโรงงานขั้นต่ำที่คุ้มชะลอ 30 วัน</div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {breakEven30dPrice.toFixed(isPerTon ? 0 : 2)}{" "}
                <span className="text-xs font-normal text-slate-400">{unitLabel}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                (ต้องสูงกว่าราคาปัจจุบัน {profile.currentPrice.toFixed(isPerTon ? 0 : 2)} {unitLabel} อย่างน้อย{" "}
                <span className="text-cyan-300 font-mono">
                  +{(breakEven30dPrice - profile.currentPrice).toFixed(isPerTon ? 0 : 2)}
                </span>{" "}
                เพื่อชดเชยต้นทุนแฝงทั้งหมด)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121A2B] border border-teal-500/30 space-y-2">
              <div className="text-xs text-slate-400">เกณฑ์ % แป้งขั้นต่ำเพื่อไม่ขาดทุน</div>
              <div className="text-2xl font-bold font-mono text-[#2DD4BF]">
                ≥ {(initialQualityValue - 1.8).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                หากตรวจวัดหัวมันตัวอย่างแล้วพบว่า % แป้งลดลงต่ำกว่าเกณฑ์นี้ ให้รีบขุดขายทันที ไม่ควรชะลอต่อ
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121A2B] border border-amber-500/30 space-y-2">
              <div className="text-xs text-slate-400">จุดชะลอที่แนะนำโดย AI</div>
              <div className="text-xl font-bold text-amber-300">
                {bestHorizon.days === 0
                  ? "เก็บเกี่ยวทันที (วันนี้)"
                  : bestHorizon.label}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                สร้างกำไรสุทธิแท้จริงสูงสุด ฿{bestHorizon.realNetProfitBaht.toLocaleString("th-TH")}
                {bestHorizon.days > 0 && ` (+฿${bestHorizon.deltaNetProfitVsToday.toLocaleString("th-TH")} เทียบวันนี้)`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141E33] border border-[#2A3756] text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>สรุปกฎทองการชะลอเก็บเกี่ยวสำหรับเกษตรกรโคราช (Golden Rules of Harvest Timing):</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc text-slate-300">
              <li>
                <strong>ตรวจวัดเปอร์เซ็นต์แป้งจริงก่อนเสมอ:</strong> สุ่มขุดหัวมัน 3–5 เหง้าในแปลงไปวัดที่ลานรับซื้อก่อนตัดสินใจชะลอ หากมีฝนตกชุก % แป้งอาจรูดลงเกิน 2.5% ภายในสัปดาห์เดียว
              </li>
              <li>
                <strong>ตรวจสอบคิวหน้าโรงงานในอำเภอข้างเคียง:</strong> ช่วงเดือน ธ.ค.–ม.ค. ลานมันใน อ.เสิงสาง, ครบุรี และด่านขุนทด คิวแน่น รถรอเทเกิน 8 ชม. จะเกิดค่าเสียเวลาและน้ำหนักหัวมันระเหยแห้ง
              </li>
              <li>
                <strong>อย่ามองข้ามรอบการปลูกพืชถัดไป:</strong> การดึงแปลงไว้นานเกินไปทำให้เสียฤดูกาลเตรียมดินปลูกพืชรอบใหม่ตรงฝนแรก ส่งผลกระทบต่อกำไรสะสมตลอดทั้งปี
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer Meta info */}
      <div className="pt-3 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono relative z-10">
        <div className="flex items-center gap-2">
          <span>โมเดลอ้างอิง: สถิติเศรษฐกิจการเกษตร (สศก.) เขต 5 นครราชสีมา</span>
          <span>·</span>
          <span>มาตรฐานตารางราคาโรงงานแป้งมัน/โรงน้ำตาลโคราช</span>
        </div>
        <div className="text-slate-400">
          คำนวณผลผลิตสุทธิ: {simulatedVolumeTons} ตัน ({selectedDistrict.nameTh})
        </div>
      </div>
    </div>
  );
};
