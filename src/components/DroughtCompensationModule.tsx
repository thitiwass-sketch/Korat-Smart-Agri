import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  KORAT_DAMS,
  KS01_COMPENSATION_RATES,
  DOAE_FARMER_RECORDS,
  KORAT_ASSETS,
  KoratDistrict,
  DoaeFarmerRecord,
  KoratGeoPlotPin,
} from "../data/koratAgriData";
import {
  Search,
  Camera,
  Download,
  MapPin,
  CheckCircle2,
  Calculator,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Scale,
  ArrowRightLeft,
  Droplets,
  Gauge,
  RotateCcw,
  Sprout,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

type InsuredCropKey = "cassava_fresh" | "jasmine_rice" | "maize_feed" | "sugarcane_fresh";
type DamageScenarioKey = "partial_45" | "severe_85" | "total_100";
type InsuranceTierKey = "tier1_subsidized" | "tier2_enhanced";
type CropRiskColor = "green" | "yellow" | "red";

interface CropPhysiologyRiskModel {
  id: string;
  cropNameTh: string;
  cropGroupTh: string;
  ks01RatePerRai: number;
  linkedInsCropKey?: InsuredCropKey;
  rootDepthCm: string;
  criticalGrowthStage: string;
  // Thresholds for Green -> Yellow -> Red transition
  safeSpiMin: number;
  criticalSpiMax: number;
  safeMoistureMinPct: number;
  criticalMoistureMaxPct: number;
  adviceGreen: string;
  adviceYellow: string;
  adviceRed: string;
}

export interface EvaluatedCropRiskResult {
  model: CropPhysiologyRiskModel;
  spiValue: number;
  soilMoisturePct: number;
  spiStressScore: number;
  moistureStressScore: number;
  compositeRiskScore: number;
  estimatedYieldLossPct: number;
  color: CropRiskColor;
  levelLabelTh: string;
  colorBadgeText: string;
  statusDescription: string;
  recommendedAction: string;
}

const KORAT_CROP_RISK_MODELS: CropPhysiologyRiskModel[] = [
  {
    id: "rice_jasmine",
    cropNameTh: "ข้าวนาปี / ข้าวหอมมะลิทุ่งสัมฤทธิ์",
    cropGroupTh: "กลุ่มข้าว (กษ.01 = 1,340 บ./ไร่)",
    ks01RatePerRai: 1340,
    linkedInsCropKey: "jasmine_rice",
    rootDepthCm: "15–25 ซม. (รากตื้น ไวต่อการขาดน้ำสูง)",
    criticalGrowthStage: "ระยะแตกกอ–ตั้งท้อง–ออกรวง",
    safeSpiMin: -0.75,
    criticalSpiMax: -1.25,
    safeMoistureMinPct: 42,
    criticalMoistureMaxPct: 31,
    adviceGreen: "ระดับน้ำและความชื้นดินเพียงพอต่อการแตกกอ ใส่ปุ๋ยแต่งหน้าได้ตามปกติ",
    adviceYellow: "ความชื้นดินเริ่มลดลง ควรรักษาระดับน้ำในกระทงนาและชะลอการหว่านปุ๋ยยูเรีย",
    adviceRed: "วิกฤตขาดน้ำรุนแรง เสี่ยงข้าวยืนต้นตาย/เมล็ดลีบ เตรียมถ่ายภาพพิกัดแปลงเพื่อยื่น กษ.01",
  },
  {
    id: "maize_feed",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์",
    cropGroupTh: "กลุ่มพืชไร่ (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    linkedInsCropKey: "maize_feed",
    rootDepthCm: "30–45 ซม. (อ่อนไหวสูงช่วงออกไหม)",
    criticalGrowthStage: "ระยะออกดอกตัวผู้–ติดฝักอ่อน",
    safeSpiMin: -0.9,
    criticalSpiMax: -1.35,
    safeMoistureMinPct: 38,
    criticalMoistureMaxPct: 28,
    adviceGreen: "ความชื้นดินเหมาะสมต่อการผสมเกสรและสร้างเมล็ด",
    adviceYellow: "เฝ้าระวังฝนทิ้งช่วงในระยะออกไหม แนะนำให้น้ำเสริมระบบหยดและพ่นสารลดการคายน้ำ",
    adviceRed: "ดินแห้งเกินจุดวิกฤต เสี่ยงฝักไม่ติดเมล็ดเกิน 80% ตรวจสอบเงื่อนไขเคลมประกันภัยข้าวโพดและ กษ.01",
  },
  {
    id: "orchard_fruit",
    cropNameTh: "ไม้ผลเศรษฐกิจ (ทุเรียน·มะม่วง·น้อยหน่า)",
    cropGroupTh: "กลุ่มไม้ผล/ไม้ยืนต้น (กษ.01 = 4,048 บ./ไร่)",
    ks01RatePerRai: 4048,
    rootDepthCm: "60–120 ซม. (ต้องการความชื้นสม่ำเสมอ)",
    criticalGrowthStage: "ระยะแทงช่อดอก–หางแย้ไหม้–ขยายผล",
    safeSpiMin: -0.85,
    criticalSpiMax: -1.3,
    safeMoistureMinPct: 40,
    criticalMoistureMaxPct: 30,
    adviceGreen: "ความชื้นในทรงพุ่มสมดุล เหมาะแก่การสะสมอาหารและบำรุงผล",
    adviceYellow: "อากาศร้อนและดินเริ่มแห้ง ควรคลุมโคนต้นด้วยฟางหนา 15 ซม. และเพิ่มรอบน้ำมินิสปริงเกลอร์",
    adviceRed: "วิกฤตสลัดผลอ่อนและใบไหม้จากภัยแล้ง สำรวจต้นยืนต้นตายเพื่อบันทึกหลักฐาน กษ.01 (4,048 บ./ไร่)",
  },
  {
    id: "sugarcane_fresh",
    cropNameTh: "อ้อยโรงงานตัดสด",
    cropGroupTh: "กลุ่มพืชไร่ (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    linkedInsCropKey: "sugarcane_fresh",
    rootDepthCm: "60–100 ซม. (ทนแล้งปานกลาง)",
    criticalGrowthStage: "ระยะแตกกอ–ย่างปล้องสะสมน้ำตาล",
    safeSpiMin: -1.05,
    criticalSpiMax: -1.5,
    safeMoistureMinPct: 34,
    criticalMoistureMaxPct: 25,
    adviceGreen: "ความชื้นดินเอื้อต่อการย่างปล้องและเพิ่มน้ำหนักลำต้น",
    adviceYellow: "ปล้องเริ่มสั้นจากภาวะฝนทิ้งช่วง แนะนำคลุมใบอ้อยรักษาความชื้นในร่อง",
    adviceRed: "ความชื้นดินต่ำวิกฤต อ้อยชะงักการเจริญเติบโตและเสี่ยงตอตาย ประเมินความเสียหายรายแปลง",
  },
  {
    id: "cassava_fresh",
    cropNameTh: "มันสำปะหลังหัวสด",
    cropGroupTh: "กลุ่มพืชไร่ (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    linkedInsCropKey: "cassava_fresh",
    rootDepthCm: "50–90 ซม. (ทนแล้งดี ยกเว้นระยะตั้งตัว 1–3 เดือน)",
    criticalGrowthStage: "ระยะปักท่อนพันธุ์ตั้งตัว–เริ่มสะสมแป้ง",
    safeSpiMin: -1.15,
    criticalSpiMax: -1.6,
    safeMoistureMinPct: 30,
    criticalMoistureMaxPct: 22,
    adviceGreen: "สภาพดินร่วนซุยและความชื้นเหมาะสมต่อการขยายหัวและสะสมเชื้อแป้ง",
    adviceYellow: "ดินเริ่มแห้งในชั้นไถพรวน งดใส่ปุ๋ยเคมีเม็ดจนกว่าจะมีฝนและเฝ้าระวังไรแดงระบาด",
    adviceRed: "แล้งจัดต่อเนื่อง ท่อนพันธุ์ปลูกใหม่เสี่ยงตายเกิน 70% เตรียมบันทึกภาพพิกัดแปลงยื่น กษ.01",
  },
  {
    id: "bambara_legume",
    cropNameTh: "พืชตระกูลถั่วทนแล้ง (ถั่วหรั่ง·ถั่วเขียว)",
    cropGroupTh: "กลุ่มพืชไร่อายุสั้น (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    rootDepthCm: "40–65 ซม. (ใช้น้ำน้อยเพียง 250–280 ลบ.ม./ไร่)",
    criticalGrowthStage: "ระยะออกดอก–แทงเข็มลงดิน",
    safeSpiMin: -1.35,
    criticalSpiMax: -1.75,
    safeMoistureMinPct: 25,
    criticalMoistureMaxPct: 18,
    adviceGreen: "เหมาะสมอย่างยิ่ง สามารถปลูกเป็นพืชหลังนาหรือพืชทดแทนในพื้นที่เสี่ยงขาดน้ำได้",
    adviceYellow: "ยังสามารถเจริญเติบโตได้ภายใต้ความชื้นจำกัด แนะนำพ่นปุ๋ยทางใบเสริมช่วงติดฝัก",
    adviceRed: "ความชื้นดินต่ำกว่าจุดเหี่ยวถาวร ควรให้น้ำช่วยพยุงในระยะออกดอกหากมีแหล่งน้ำสำรอง",
  },
];

/**
 * Pure agronomic function that calculates crop-specific drought risk from SPI and Soil Moisture (%)
 * and classifies each crop into Green (Low Risk), Yellow (Moderate Watch), or Red (Critical Risk).
 */
function analyzeCropDroughtRisk(
  model: CropPhysiologyRiskModel,
  spiValue: number,
  soilMoisturePct: number
): EvaluatedCropRiskResult {
  // 1. Normalize SPI stress score (0 = safe, 50 = threshold watch, 100 = severe drought)
  let spiStressScore = 0;
  if (spiValue >= model.safeSpiMin) {
    spiStressScore = Math.max(0, Math.round(((model.safeSpiMin + 0.8 - spiValue) / 1.5) * 32));
  } else if (spiValue > model.criticalSpiMax) {
    const span = Math.max(0.1, model.safeSpiMin - model.criticalSpiMax);
    const ratio = (model.safeSpiMin - spiValue) / span;
    spiStressScore = Math.round(38 + ratio * 34); // 38..72 (Yellow zone)
  } else {
    const excess = model.criticalSpiMax - spiValue;
    spiStressScore = Math.min(100, Math.round(74 + (excess / 0.8) * 26)); // 74..100 (Red zone)
  }

  // 2. Normalize Soil Moisture stress score (0 = safe, 50 = threshold watch, 100 = severe dry soil)
  let moistureStressScore = 0;
  if (soilMoisturePct >= model.safeMoistureMinPct) {
    moistureStressScore = Math.max(
      0,
      Math.round(((model.safeMoistureMinPct + 20 - soilMoisturePct) / 30) * 30)
    );
  } else if (soilMoisturePct > model.criticalMoistureMaxPct) {
    const span = Math.max(1, model.safeMoistureMinPct - model.criticalMoistureMaxPct);
    const ratio = (model.safeMoistureMinPct - soilMoisturePct) / span;
    moistureStressScore = Math.round(38 + ratio * 34); // 38..72 (Yellow zone)
  } else {
    const deficit = model.criticalMoistureMaxPct - soilMoisturePct;
    moistureStressScore = Math.min(100, Math.round(74 + (deficit / 12) * 26)); // 74..100 (Red zone)
  }

  // 3. Weighted composite score + critical trigger rule
  const rawComposite = spiStressScore * 0.48 + moistureStressScore * 0.52;
  const isEitherCritical =
    spiValue <= model.criticalSpiMax || soilMoisturePct <= model.criticalMoistureMaxPct;
  const isEitherWatch =
    spiValue < model.safeSpiMin || soilMoisturePct < model.safeMoistureMinPct;

  let compositeRiskScore = Math.round(rawComposite);
  if (isEitherCritical) {
    compositeRiskScore = Math.max(72, compositeRiskScore);
  } else if (isEitherWatch) {
    compositeRiskScore = Math.max(40, Math.min(70, compositeRiskScore));
  } else {
    compositeRiskScore = Math.min(36, compositeRiskScore);
  }

  // 4. Determine Color Status (Green / Yellow / Red)
  let color: CropRiskColor = "green";
  let levelLabelTh = "ความเสี่ยงต่ำ (สมดุลเหมาะสม)";
  let colorBadgeText = "สถานะสีเขียว · ปลอดภัย";
  let statusDescription = "ความชื้นดินและดัชนีน้ำฝนเพียงพอต่อความต้องการของพืช";
  let recommendedAction = model.adviceGreen;

  if (compositeRiskScore >= 72) {
    color = "red";
    levelLabelTh = "ความเสี่ยงสูงวิกฤต (เสี่ยงเสียหายรุนแรง)";
    colorBadgeText = "สถานะสีแดง · วิกฤตแล้ง";
    statusDescription = `ค่า SPI (${spiValue.toFixed(2)}) หรือความชื้นดิน (${soilMoisturePct}%) ต่ำกว่าขีดจำกัดวิกฤตของพืช`;
    recommendedAction = model.adviceRed;
  } else if (compositeRiskScore >= 38) {
    color = "yellow";
    levelLabelTh = "ความเสี่ยงปานกลาง (เฝ้าระวังเครียดน้ำ)";
    colorBadgeText = "สถานะสีเหลือง · เฝ้าระวัง";
    statusDescription = `พืชเริ่มเผชิญภาวะเครียดน้ำในระยะ ${model.criticalGrowthStage}`;
    recommendedAction = model.adviceYellow;
  }

  // Estimated yield loss percentage if drought persists
  const estimatedYieldLossPct =
    color === "green"
      ? Math.max(0, Math.round(compositeRiskScore * 0.25))
      : color === "yellow"
      ? Math.round(18 + ((compositeRiskScore - 38) / 34) * 32)
      : Math.min(95, Math.round(55 + ((compositeRiskScore - 72) / 28) * 40));

  return {
    model,
    spiValue,
    soilMoisturePct,
    spiStressScore,
    moistureStressScore,
    compositeRiskScore,
    estimatedYieldLossPct,
    color,
    levelLabelTh,
    colorBadgeText,
    statusDescription,
    recommendedAction,
  };
}

interface CropInsuranceProfile {
  key: InsuredCropKey;
  cropNameTh: string;
  shortNameTh: string;
  ks01CategoryLabel: string;
  ks01RatePerRai: number;
  yieldUnit: string;
  priceUnit: string;
  defaultYieldPerRai: number;
  defaultMarketPrice: number;
  avgProductionCostPerRai: number;
  tier1FarmerPremiumPerRai: number;
  tier1GovSubsidyPerRai: number;
  tier1CoverageDroughtPerRai: number;
  tier2AdditionalPremiumPerRai: number;
  tier2AdditionalCoveragePerRai: number;
  spiTriggerThreshold: number;
  policyHighlight: string;
}

const CROP_INSURANCE_PROFILES: Record<InsuredCropKey, CropInsuranceProfile> = {
  cassava_fresh: {
    key: "cassava_fresh",
    cropNameTh: "มันสำปะหลังหัวสด (เชื้อแป้ง 25%)",
    shortNameTh: "มันสำปะหลัง",
    ks01CategoryLabel: "พืชไร่ (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    yieldUnit: "ตัน/ไร่",
    priceUnit: "บาท/ตัน",
    defaultYieldPerRai: 3.8,
    defaultMarketPrice: 3180,
    avgProductionCostPerRai: 5750,
    tier1FarmerPremiumPerRai: 115,
    tier1GovSubsidyPerRai: 85,
    tier1CoverageDroughtPerRai: 1850,
    tier2AdditionalPremiumPerRai: 135,
    tier2AdditionalCoveragePerRai: 1050,
    spiTriggerThreshold: -1.2,
    policyHighlight:
      "ประกันภัยดัชนีน้ำฝนและความชื้นดินดาวเทียม (Weather Index) จ่ายชดเชยอัตโนมัติเมื่อ SPI ต่ำกว่าเกณฑ์ แม้แปลงยังไม่ตายสิ้นเชิง",
  },
  jasmine_rice: {
    key: "jasmine_rice",
    cropNameTh: "ข้าวนาปี / ข้าวหอมมะลิทุ่งสัมฤทธิ์",
    shortNameTh: "ข้าวนาปี·หอมมะลิ",
    ks01CategoryLabel: "ข้าว (กษ.01 = 1,340 บ./ไร่)",
    ks01RatePerRai: 1340,
    yieldUnit: "ตัน/ไร่",
    priceUnit: "บาท/ตัน",
    defaultYieldPerRai: 0.48,
    defaultMarketPrice: 15850,
    avgProductionCostPerRai: 4450,
    tier1FarmerPremiumPerRai: 70,
    tier1GovSubsidyPerRai: 142,
    tier1CoverageDroughtPerRai: 1190,
    tier2AdditionalPremiumPerRai: 95,
    tier2AdditionalCoveragePerRai: 1200,
    spiTriggerThreshold: -1.1,
    policyHighlight:
      "โครงการประกันภัยข้าวนาปี ธ.ก.ส. รัฐอุดหนุนเบี้ยประกันส่วนใหญ่สำหรับผู้ขึ้นทะเบียน ทบก. คุ้มครองภัยแล้ง ฝนทิ้งช่วง และโรคแมลง",
  },
  maize_feed: {
    key: "maize_feed",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์ (ความชื้น 14.5%)",
    shortNameTh: "ข้าวโพดเลี้ยงสัตว์",
    ks01CategoryLabel: "พืชไร่ (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    yieldUnit: "ตัน/ไร่",
    priceUnit: "บาท/ตัน",
    defaultYieldPerRai: 1.15,
    defaultMarketPrice: 10350,
    avgProductionCostPerRai: 5650,
    tier1FarmerPremiumPerRai: 96,
    tier1GovSubsidyPerRai: 124,
    tier1CoverageDroughtPerRai: 1500,
    tier2AdditionalPremiumPerRai: 140,
    tier2AdditionalCoveragePerRai: 1200,
    spiTriggerThreshold: -1.15,
    policyHighlight:
      "โครงการประกันภัยข้าวโพดเลี้ยงสัตว์ ธ.ก.ส. คุ้มครองภัยแล้ง ฝนทิ้งช่วง พายุ และหนอนกระทู้ข้าวโพดลายจุด (Fall Armyworm)",
  },
  sugarcane_fresh: {
    key: "sugarcane_fresh",
    cropNameTh: "อ้อยโรงงานตัดสด (12 CCS)",
    shortNameTh: "อ้อยโรงงาน",
    ks01CategoryLabel: "พืชไร่ (กษ.01 = 1,980 บ./ไร่)",
    ks01RatePerRai: 1980,
    yieldUnit: "ตัน/ไร่",
    priceUnit: "บาท/ตัน",
    defaultYieldPerRai: 12.5,
    defaultMarketPrice: 1590,
    avgProductionCostPerRai: 8900,
    tier1FarmerPremiumPerRai: 135,
    tier1GovSubsidyPerRai: 95,
    tier1CoverageDroughtPerRai: 2100,
    tier2AdditionalPremiumPerRai: 155,
    tier2AdditionalCoveragePerRai: 1350,
    spiTriggerThreshold: -1.25,
    policyHighlight:
      "ประกันภัยกลุ่มชาวไร่อ้อยและดัชนีภัยแล้งลุ่มน้ำมูล–ลำตะคอง ช่วยพยุงสภาพคล่องค่าท่อนพันธุ์และค่าปุ๋ยที่สูงกว่า กษ.01",
  },
};

interface DroughtCompensationModuleProps {
  selectedDistrict: KoratDistrict;
  onAddPlotPin?: (newPlot: KoratGeoPlotPin) => void;
}

interface SavedEvidenceLog {
  id: string;
  farmerName: string;
  districtName: string;
  cropAndDamage: string;
  damagedRai: number;
  coordinates: string;
  timestampStr: string;
  dataUrl: string;
}

export const DroughtCompensationModule: React.FC<DroughtCompensationModuleProps> = ({
  selectedDistrict,
  onAddPlotPin,
}) => {
  // 1. กษ.01 Compensation Calculator State
  const [damagedRiceRai, setDamagedRiceRai] = useState<number>(10);
  const [damagedFieldCropRai, setDamagedFieldCropRai] = useState<number>(18);
  const [damagedOrchardRai, setDamagedOrchardRai] = useState<number>(0);

  // 1.2 Crop Drought Risk Analyzer State (SPI + Soil Moisture %)
  const [riskSpiInput, setRiskSpiInput] = useState<number>(selectedDistrict.spi30d);
  const [riskMoistureInput, setRiskMoistureInput] = useState<number>(
    selectedDistrict.gistdaSoilMoisturePct
  );

  // Sync SPI & Soil Moisture inputs when user switches district
  useEffect(() => {
    setRiskSpiInput(selectedDistrict.spi30d);
    setRiskMoistureInput(selectedDistrict.gistdaSoilMoisturePct);
  }, [selectedDistrict.id, selectedDistrict.spi30d, selectedDistrict.gistdaSoilMoisturePct]);

  // Evaluate all 6 Korat crop types dynamically from SPI + Soil Moisture
  const evaluatedCropRisks: EvaluatedCropRiskResult[] = useMemo(() => {
    return KORAT_CROP_RISK_MODELS.map((model) =>
      analyzeCropDroughtRisk(model, riskSpiInput, riskMoistureInput)
    );
  }, [riskSpiInput, riskMoistureInput]);

  const cropRiskCounts = useMemo(() => {
    return {
      green: evaluatedCropRisks.filter((r) => r.color === "green").length,
      yellow: evaluatedCropRisks.filter((r) => r.color === "yellow").length,
      red: evaluatedCropRisks.filter((r) => r.color === "red").length,
    };
  }, [evaluatedCropRisks]);

  // Helper to get evaluated risk for the 3 กษ.01 Calculator rows (Rice, Field Crop, Orchard)
  const riceRiskStatus =
    evaluatedCropRisks.find((r) => r.model.id === "rice_jasmine") || evaluatedCropRisks[0];
  const fieldCropRiskStatus =
    evaluatedCropRisks.find((r) => r.model.id === "cassava_fresh") || evaluatedCropRisks[4];
  const orchardRiskStatus =
    evaluatedCropRisks.find((r) => r.model.id === "orchard_fruit") || evaluatedCropRisks[2];

  // 1.5 Crop Insurance vs. Expected Market Revenue Decision State
  const [insCropKey, setInsCropKey] = useState<InsuredCropKey>("cassava_fresh");
  const [insPlantedRai, setInsPlantedRai] = useState<number>(28);
  const [insExpectedYield, setInsExpectedYield] = useState<number>(
    CROP_INSURANCE_PROFILES.cassava_fresh.defaultYieldPerRai
  );
  const [insExpectedPrice, setInsExpectedPrice] = useState<number>(
    CROP_INSURANCE_PROFILES.cassava_fresh.defaultMarketPrice
  );
  const [insDamageScenario, setInsDamageScenario] =
    useState<DamageScenarioKey>("severe_85");
  const [insTierMode, setInsTierMode] =
    useState<InsuranceTierKey>("tier2_enhanced");

  const handleSelectInsCrop = (key: InsuredCropKey) => {
    setInsCropKey(key);
    const prof = CROP_INSURANCE_PROFILES[key];
    setInsExpectedYield(prof.defaultYieldPerRai);
    setInsExpectedPrice(prof.defaultMarketPrice);
  };

  // 2. Digital DOAE Farmer Verification State
  const [lookupInput, setLookupInput] = useState<string>("3300800419281");
  const [selectedFarmer, setSelectedFarmer] = useState<DoaeFarmerRecord>(
    DOAE_FARMER_RECORDS[0]
  );

  // 3. Geotag Photo Evidence Stamper State
  const [evidenceImgSrc, setEvidenceImgSrc] = useState<string>(
    KORAT_ASSETS.droughtSamplePlot
  );
  const [evidenceFarmerName, setEvidenceFarmerName] = useState<string>(
    "นายสมพงษ์ วงศ์นคร"
  );
  const [evidencePlotCode, setEvidencePlotCode] = useState<string>("PLT-DKT-881");
  const [evidenceCropDamage, setEvidenceCropDamage] = useState<string>(
    "มันสำปะหลังและข้าวโพดเลี้ยงสัตว์ยืนต้นตายจากภาวะฝนทิ้งช่วง (เสียหายสิ้นเชิง)"
  );
  const [evidenceRai, setEvidenceRai] = useState<number>(14);
  const [evidenceLat, setEvidenceLat] = useState<number>(selectedDistrict.lat);
  const [evidenceLon, setEvidenceLon] = useState<number>(selectedDistrict.lon);
  const [stampedDataUrl, setStampedDataUrl] = useState<string>("");
  const [savedLogs, setSavedLogs] = useState<SavedEvidenceLog[]>([]);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEvidenceLat(selectedDistrict.lat);
    setEvidenceLon(selectedDistrict.lon);
  }, [selectedDistrict.lat, selectedDistrict.lon]);

  // Calculate กษ.01 Entitlement with 30-rai household cap (prioritizing highest rate crops for farmer benefit)
  const totalDamagedRai = damagedRiceRai + damagedFieldCropRai + damagedOrchardRai;
  const maxCap = KS01_COMPENSATION_RATES.maxTotalRaiPerHousehold; // 30 rai
  let remainingCap = maxCap;

  const eligibleOrchardRai = Math.min(damagedOrchardRai, remainingCap);
  remainingCap -= eligibleOrchardRai;

  const eligibleFieldCropRai = Math.min(damagedFieldCropRai, remainingCap);
  remainingCap -= eligibleFieldCropRai;

  const eligibleRiceRai = Math.min(damagedRiceRai, remainingCap);
  remainingCap -= eligibleRiceRai;

  const orchardPayout = eligibleOrchardRai * 4048;
  const fieldCropPayout = eligibleFieldCropRai * 1980;
  const ricePayout = eligibleRiceRai * 1340;
  const totalKs01Payout = orchardPayout + fieldCropPayout + ricePayout;

  // Compute Crop Insurance vs. Expected Crop Market Revenue & กษ.01 Comparison
  const insProfile = CROP_INSURANCE_PROFILES[insCropKey];
  const insuranceAnalysis = useMemo(() => {
    const expectedRevenuePerRai = Math.round(insExpectedYield * insExpectedPrice);
    const expectedTotalRevenue = expectedRevenuePerRai * insPlantedRai;
    const totalProductionCost = insProfile.avgProductionCostPerRai * insPlantedRai;
    const expectedNormalProfit = expectedTotalRevenue - totalProductionCost;

    // Premium & Coverage per Rai based on selected Tier
    const premiumPerRai =
      insTierMode === "tier2_enhanced"
        ? insProfile.tier1FarmerPremiumPerRai + insProfile.tier2AdditionalPremiumPerRai
        : insProfile.tier1FarmerPremiumPerRai;
    const totalPremiumPaid = premiumPerRai * insPlantedRai;
    const totalGovSubsidy = insProfile.tier1GovSubsidyPerRai * insPlantedRai;

    const maxInsuranceCoveragePerRai =
      insTierMode === "tier2_enhanced"
        ? insProfile.tier1CoverageDroughtPerRai + insProfile.tier2AdditionalCoveragePerRai
        : insProfile.tier1CoverageDroughtPerRai;

    // Damage & Salvage harvest factor
    const lossRatio =
      insDamageScenario === "partial_45"
        ? 0.45
        : insDamageScenario === "severe_85"
        ? 0.85
        : 1.0;
    const salvageHarvestRatio = 1 - lossRatio;
    const salvageMarketRevenue = Math.round(expectedTotalRevenue * salvageHarvestRatio);

    // กษ.01 Eligibility Rule:
    // กษ.01 requires total/catastrophic crop failure in a declared disaster zone AND caps at 30 rai/household!
    const isKs01Triggered = insDamageScenario !== "partial_45";
    const ks01EligibleRai = isKs01Triggered ? Math.min(30, insPlantedRai) : 0;
    const uncoveredRaiOverCap = Math.max(0, insPlantedRai - 30);
    const ks01GovernmentPayout = ks01EligibleRai * insProfile.ks01RatePerRai;

    // Weather Index / Crop Insurance Payout:
    // Pays 55% of coverage on partial SPI drought (45% loss) and 100% on severe/total drought across ALL insured rai
    const insurancePayoutFactor = insDamageScenario === "partial_45" ? 0.55 : 1.0;
    const grossInsuranceClaimPayout = Math.round(
      maxInsuranceCoveragePerRai * insurancePayoutFactor * insPlantedRai
    );
    const netInsuranceBenefit = grossInsuranceClaimPayout - totalPremiumPaid;

    // Total Cash Inflow Comparison under Drought Scenario
    const totalInflowKs01Only = salvageMarketRevenue + ks01GovernmentPayout;
    const totalInflowWithInsurance =
      salvageMarketRevenue + ks01GovernmentPayout + grossInsuranceClaimPayout - totalPremiumPaid;

    // Cost Recovery % (how much of sunk production cost is recovered during drought)
    const costRecoveryKs01OnlyPct = Math.min(
      100,
      Math.round((totalInflowKs01Only / Math.max(1, totalProductionCost)) * 100)
    );
    const costRecoveryWithInsurancePct = Math.min(
      100,
      Math.round((totalInflowWithInsurance / Math.max(1, totalProductionCost)) * 100)
    );

    // Revenue Protection % (how much of expected normal market revenue is preserved)
    const revenuePreservedKs01OnlyPct = Math.round(
      (totalInflowKs01Only / Math.max(1, expectedTotalRevenue)) * 100
    );
    const revenuePreservedWithInsurancePct = Math.round(
      (totalInflowWithInsurance / Math.max(1, expectedTotalRevenue)) * 100
    );

    // Premium as % of Expected Market Revenue
    const premiumToExpectedRevenuePct = Number(
      ((premiumPerRai / Math.max(1, expectedRevenuePerRai)) * 100).toFixed(2)
    );

    // Leverage ratio: Baht of coverage per 1 Baht of farmer premium
    const coverageLeverageRatio = Number(
      (maxInsuranceCoveragePerRai / Math.max(1, premiumPerRai)).toFixed(1)
    );

    const chartData = [
      {
        name: "รายได้คาดการณ์ปกติ (ไม่มีภัยแล้ง)",
        shortLabel: "รายได้ผลผลิตปกติ",
        amountBaht: expectedTotalRevenue,
        perRaiBaht: expectedRevenuePerRai,
        fill: "#38BDF8",
      },
      {
        name: "ต้นทุนการผลิตที่ลงทุนจริง",
        shortLabel: "ต้นทุนการผลิต",
        amountBaht: totalProductionCost,
        perRaiBaht: insProfile.avgProductionCostPerRai,
        fill: "#6366F1",
      },
      {
        name: "เกิดภัยแล้ง: พึ่งเฉพาะ กษ.01 อย่างเดียว",
        shortLabel: "เฉพาะ กษ.01",
        amountBaht: totalInflowKs01Only,
        perRaiBaht: Math.round(totalInflowKs01Only / Math.max(1, insPlantedRai)),
        fill: "#F59E0B",
      },
      {
        name: "เกิดภัยแล้ง: กษ.01 + ทำประกันภัยพืชผล (สุทธิ)",
        shortLabel: "กษ.01 + ประกันภัย",
        amountBaht: totalInflowWithInsurance,
        perRaiBaht: Math.round(totalInflowWithInsurance / Math.max(1, insPlantedRai)),
        fill: "#14B8A6",
      },
    ];

    return {
      expectedRevenuePerRai,
      expectedTotalRevenue,
      totalProductionCost,
      expectedNormalProfit,
      premiumPerRai,
      totalPremiumPaid,
      totalGovSubsidy,
      maxInsuranceCoveragePerRai,
      salvageMarketRevenue,
      isKs01Triggered,
      ks01EligibleRai,
      uncoveredRaiOverCap,
      ks01GovernmentPayout,
      grossInsuranceClaimPayout,
      netInsuranceBenefit,
      totalInflowKs01Only,
      totalInflowWithInsurance,
      costRecoveryKs01OnlyPct,
      costRecoveryWithInsurancePct,
      revenuePreservedKs01OnlyPct,
      revenuePreservedWithInsurancePct,
      premiumToExpectedRevenuePct,
      coverageLeverageRatio,
      chartData,
    };
  }, [
    insCropKey,
    insDamageScenario,
    insExpectedPrice,
    insExpectedYield,
    insPlantedRai,
    insProfile,
    insTierMode,
  ]);

  // Handle DOAE Lookup
  const handleFarmerLookup = (query: string) => {
    setLookupInput(query);
    const cleaned = query.trim();
    const matched = DOAE_FARMER_RECORDS.find(
      (r) =>
        r.farmerId.includes(cleaned) ||
        r.householdCode.toLowerCase().includes(cleaned.toLowerCase()) ||
        r.fullName.includes(cleaned)
    );
    if (matched) {
      setSelectedFarmer(matched);
    }
  };

  // Render Geotag + Timestamp onto HTML5 Canvas
  const renderGeotagCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const targetWidth = 800;
      const targetHeight = 560;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw photo scaled to cover
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Draw top-right compass/GPS verification stamp
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      ctx.fillRect(targetWidth - 255, 18, 237, 56);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(targetWidth - 255, 18, 237, 56);

      ctx.fillStyle = "#34D399";
      ctx.font = "600 12px 'IBM Plex Mono', monospace";
      ctx.fillText("KORAT DOAE · GEOTAG VERIFIED", targetWidth - 243, 38);
      ctx.fillStyle = "#F8FAFC";
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      ctx.fillText(
        `LAT ${evidenceLat.toFixed(5)}°N  LON ${evidenceLon.toFixed(5)}°E`,
        targetWidth - 243,
        58
      );

      // Draw bottom measured scrim and official กษ.01 Evidence Stamp Box
      const boxHeight = 148;
      const boxY = targetHeight - boxHeight;
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(0, boxY, targetWidth, boxHeight);

      // Top accent line on stamp box
      ctx.fillStyle = "#10B981";
      ctx.fillRect(0, boxY, targetWidth, 3);

      const nowStr = new Date().toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      ctx.fillStyle = "#34D399";
      ctx.font = "600 13px 'Anuphan', sans-serif";
      ctx.fillText(
        `หลักฐานภาพถ่ายแปลงประสบภัยพิบัติแนบแบบ กษ.01 · จังหวัดนครราชสีมา (${selectedDistrict.nameTh})`,
        22,
        boxY + 28
      );

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "600 16px 'Anuphan', sans-serif";
      ctx.fillText(
        `เกษตรกร: ${evidenceFarmerName}   |   รหัสแปลง: ${evidencePlotCode}   |   พื้นที่เสียหาย: ${evidenceRai} ไร่`,
        22,
        boxY + 56
      );

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "400 13px 'Anuphan', sans-serif";
      ctx.fillText(`รายละเอียดความเสียหาย: ${evidenceCropDamage}`, 22, boxY + 84);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      ctx.fillText(
        `พิกัดดาวเทียม: ${evidenceLat.toFixed(5)}°N, ${evidenceLon.toFixed(5)}°E  ·  SPI-30d: ${selectedDistrict.spi30d}  ·  ประทับเวลา: ${nowStr}`,
        22,
        boxY + 116
      );

      try {
        setStampedDataUrl(canvas.toDataURL("image/png"));
      } catch {
        // Ignore taint if external
      }
    };
    img.src = evidenceImgSrc;
  }, [
    evidenceCropDamage,
    evidenceFarmerName,
    evidenceImgSrc,
    evidenceLat,
    evidenceLon,
    evidencePlotCode,
    evidenceRai,
    selectedDistrict.nameTh,
    selectedDistrict.spi30d,
  ]);

  useEffect(() => {
    renderGeotagCanvas();
  }, [renderGeotagCanvas]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEvidenceImgSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseDeviceGps = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg("ใช้อ้างอิงพิกัดศูนย์กลางอำเภอเรียบร้อยแล้ว");
      return;
    }
    setGpsStatusMsg("กำลังดึงพิกัด GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEvidenceLat(Number(pos.coords.latitude.toFixed(5)));
        setEvidenceLon(Number(pos.coords.longitude.toFixed(5)));
        setGpsStatusMsg("ดึงพิกัด GPS ปัจจุบันสำเร็จ");
      },
      () => {
        // Fallback to slight jitter around selected district
        setEvidenceLat(Number((selectedDistrict.lat + 0.0024).toFixed(5)));
        setEvidenceLon(Number((selectedDistrict.lon - 0.0018).toFixed(5)));
        setGpsStatusMsg(`ใช้พิกัดดาวเทียมแปลงใน ${selectedDistrict.nameTh}`);
      },
      { timeout: 4000 }
    );
  };

  const handleSaveEvidenceLog = () => {
    const nowStr = new Date().toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const newItem: SavedEvidenceLog = {
      id: `EV-${Date.now()}`,
      farmerName: evidenceFarmerName,
      districtName: selectedDistrict.nameTh,
      cropAndDamage: evidenceCropDamage,
      damagedRai: evidenceRai,
      coordinates: `${evidenceLat.toFixed(5)}°N, ${evidenceLon.toFixed(5)}°E`,
      timestampStr: nowStr,
      dataUrl: stampedDataUrl,
    };
    setSavedLogs((prev) => [newItem, ...prev]);

    if (onAddPlotPin) {
      onAddPlotPin({
        id: `pin-ev-${Date.now()}`,
        plotCode: evidencePlotCode || `PLT-EV-${Math.floor(100 + Math.random() * 899)}`,
        farmerName: evidenceFarmerName,
        districtId: selectedDistrict.id,
        districtNameTh: selectedDistrict.nameTh,
        subdistrictTh: "แปลงบันทึกภาพหลักฐาน กษ.01",
        lat: evidenceLat,
        lon: evidenceLon,
        cropName: evidenceCropDamage,
        cropCategory: "field_crop",
        areaRai: evidenceRai,
        droughtStatus: selectedDistrict.droughtRiskLevel,
        spi30d: selectedDistrict.spi30d,
        soilMoisturePct: selectedDistrict.gistdaSoilMoisturePct,
        ndviHealthScore: 0.34,
        ks01Status: `แนบภาพถ่ายพิกัด Geotag แล้ว (${evidenceRai} ไร่)`,
        estimatedKs01Baht: Math.min(30, evidenceRai) * 1980,
        updatedAt: `บันทึกหลักฐาน ${nowStr}`,
      });
    }
    setGpsStatusMsg("บันทึกแฟ้มหลักฐาน กษ.01 และปักหมุดลงบนแผนที่ Leaflet เรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>ข้อมูลดาวเทียม GISTDA</span>
            <span aria-hidden="true">·</span>
            <span>ชลประทานที่ 8 นครราชสีมา</span>
            <span aria-hidden="true">·</span>
            <span>ระเบียบกระทรวงเกษตรและสหกรณ์ (แบบ กษ.01)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            ระบบประเมินพื้นที่เสี่ยงภัยแล้งและการชดเชยผู้ประสบภัยพิบัติ (กษ.01)
          </h2>
        </div>

        <div className="text-xs text-slate-600">
          สถานะความเสี่ยง {selectedDistrict.nameTh}:{" "}
          <strong
            className={
              selectedDistrict.droughtRiskLevel === "วิกฤตแล้งรุนแรง"
                ? "text-red-700"
                : selectedDistrict.droughtRiskLevel === "เฝ้าระวังฝนทิ้งช่วง"
                ? "text-amber-700"
                : "text-emerald-700"
            }
          >
            {selectedDistrict.droughtRiskLevel}
          </strong>{" "}
          (ความชื้นดิน GISTDA <span className="font-mono tabular-nums">{selectedDistrict.gistdaSoilMoisturePct}%</span>)
        </div>
      </div>

      {/* Part 1: 4 Major Korat Reservoirs Water Storage Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              ระดับน้ำในอ่างเก็บน้ำขนาดใหญ่ 4 แห่งของจังหวัดนครราชสีมา (ร่วมกับดัชนี GISTDA)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ติดตามปริมาตรน้ำใช้การได้จริง (Usable Storage) เพื่อวางแผนเพาะปลูกและประเมินความเสี่ยงภัยแล้งรายลุ่มน้ำ
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            ความจุรวม 4 เขื่อนหลัก: 885.49 ล้าน ลบ.ม.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          {KORAT_DAMS.map((dam) => {
            const isLow = dam.usablePercent < 45;
            const isGood = dam.usablePercent >= 65;

            return (
              <div
                key={dam.id}
                className="border border-slate-200/90 rounded-lg p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{dam.districtTh}</span>
                    <span
                      className={`font-semibold ${
                        isLow
                          ? "text-amber-700"
                          : isGood
                          ? "text-emerald-700"
                          : "text-sky-700"
                      }`}
                    >
                      {dam.statusLabel}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {dam.nameTh}
                  </h4>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        {dam.usablePercent.toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">น้ำใช้การได้</span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-600">
                      {dam.usableWaterMillionM3} / {dam.capacityMillionM3} ล้าน ลบ.ม.
                    </div>
                  </div>

                  {/* Storage Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-xs overflow-hidden mt-2">
                    <div
                      className={`h-full ${
                        isLow
                          ? "bg-amber-500"
                          : isGood
                          ? "bg-emerald-600"
                          : "bg-sky-600"
                      }`}
                      style={{ width: `${Math.min(100, dam.usablePercent)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs font-mono tabular-nums">
                    <div>
                      <span className="text-slate-500 font-sans">น้ำไหลเข้า: </span>
                      <strong className="text-emerald-700">+{dam.dailyInflowM3}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans">ระบายออก: </span>
                      <strong className="text-slate-800">-{dam.dailyOutflowM3}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed">
                  <div className="text-[11px] text-slate-500 mb-1">
                    พื้นที่รับน้ำ: {dam.irrigatedDistricts.join(", ")}
                  </div>
                  {dam.advisoryNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 1.5: Dynamic Crop Drought Risk Analysis Engine (SPI & Soil Moisture -> Green / Yellow / Red per Crop) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
              <Gauge className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Agronomic Crop Risk Matrix · ระบบวิเคราะห์ความเสี่ยงพืชผลรายชนิดจากค่า SPI และความชื้นดิน GISTDA
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              วิเคราะห์ความเสี่ยงพืชผลรายชนิดและสถานะสีเตือนภัย (เขียว / เหลือง / แดง) ประจำ {selectedDistrict.nameTh}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คำนวณความเสี่ยงเฉพาะตัวของพืชแต่ละชนิดจากความลึกของระบบราก ขีดจำกัดความทนแล้ง (SPI Threshold) และความชื้นในดิน เพื่อประเมินโอกาสเสียหายก่อนยื่น กษ.01
            </p>
          </div>

          {/* Traffic-Light Summary Counter Pills (Green / Yellow / Red) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              <span>สีเขียว (ปลอดภัย): {cropRiskCounts.green} ชนิด</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs font-semibold text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span>สีเหลือง (เฝ้าระวัง): {cropRiskCounts.yellow} ชนิด</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/45 text-xs font-semibold text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]" />
              <span>สีแดง (วิกฤตแล้ง): {cropRiskCounts.red} ชนิด</span>
            </div>
          </div>
        </div>

        {/* Interactive SPI & Soil Moisture Parameter Controls + Quick Scenario Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50 border border-slate-200 rounded-xl p-4 items-center">
          {/* Slider 1: SPI-30d */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>ดรรชนีความแห้งแล้ง (SPI-30 วัน)</span>
              </label>
              <span
                className={`font-mono tabular-nums text-sm font-bold px-2 py-0.5 rounded-md ${
                  riskSpiInput <= -1.4
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : riskSpiInput <= -0.9
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {riskSpiInput > 0 ? `+${riskSpiInput.toFixed(2)}` : riskSpiInput.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={-2.4}
              max={1.5}
              step={0.05}
              value={riskSpiInput}
              onChange={(e) => setRiskSpiInput(Number(e.target.value))}
              aria-label="ปรับค่าดรรชนีความแห้งแล้ง SPI"
              className="w-full"
            />
            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500">
              <span>-2.40 (แล้งจัด)</span>
              <span>-1.20 (ฝนทิ้งช่วง)</span>
              <span>0.00 (ปกติ)</span>
              <span>+1.50 (ชุ่มชื้น)</span>
            </div>
          </div>

          {/* Slider 2: Soil Moisture % */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>ความชื้นในดินดาวเทียม (Soil Moisture)</span>
              </label>
              <span
                className={`font-mono tabular-nums text-sm font-bold px-2 py-0.5 rounded-md ${
                  riskMoistureInput < 28
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : riskMoistureInput < 38
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                {riskMoistureInput}%
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={70}
              step={1}
              value={riskMoistureInput}
              onChange={(e) => setRiskMoistureInput(Number(e.target.value))}
              aria-label="ปรับค่าความชื้นในดิน"
              className="w-full"
            />
            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500">
              <span>12% (ดินแห้งวิกฤต)</span>
              <span>32% (เฝ้าระวัง)</span>
              <span>45% (เหมาะสม)</span>
              <span>70% (อิ่มตัว)</span>
            </div>
          </div>

          {/* Preset Scenario Buttons */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              จำลองสถานการณ์ความเสี่ยงพืชผลด่วน:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRiskSpiInput(selectedDistrict.spi30d);
                  setRiskMoistureInput(selectedDistrict.gistdaSoilMoisturePct);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-emerald-500" />
                <span>ค่าจริง {selectedDistrict.nameTh}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRiskSpiInput(-0.45);
                  setRiskMoistureInput(48);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-lg hover:bg-emerald-500/25 transition-colors"
              >
                จำลองปกติ (สีเขียว)
              </button>

              <button
                type="button"
                onClick={() => {
                  setRiskSpiInput(-1.15);
                  setRiskMoistureInput(33);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-lg hover:bg-amber-500/25 transition-colors"
              >
                ฝนทิ้งช่วง (สีเหลือง)
              </button>

              <button
                type="button"
                onClick={() => {
                  setRiskSpiInput(-1.75);
                  setRiskMoistureInput(20);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-red-500/15 border border-red-500/45 text-red-300 rounded-lg hover:bg-red-500/25 transition-colors"
              >
                แล้งรุนแรง (สีแดง)
              </button>
            </div>
          </div>
        </div>

        {/* 6 Crop Cards with Dynamic Color Status (Green / Yellow / Red) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {evaluatedCropRisks.map((item) => {
            const isRed = item.color === "red";
            const isYellow = item.color === "yellow";

            const cardBorderAndBg = isRed
              ? "border-red-500/60 bg-red-950/25 shadow-[0_0_24px_rgba(239,68,68,0.12)]"
              : isYellow
              ? "border-amber-500/60 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.10)]"
              : "border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]";

            const badgeClasses = isRed
              ? "bg-red-500/20 text-red-300 border-red-500/50"
              : isYellow
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";

            const dotClasses = isRed
              ? "bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]"
              : isYellow
              ? "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
              : "bg-emerald-400 shadow-[0_0_8px_#10B981]";

            const barFillClasses = isRed
              ? "bg-gradient-to-r from-amber-500 to-red-500"
              : isYellow
              ? "bg-gradient-to-r from-emerald-400 to-amber-400"
              : "bg-gradient-to-r from-teal-400 to-emerald-400";

            const scoreTextClasses = isRed
              ? "text-red-400"
              : isYellow
              ? "text-amber-300"
              : "text-emerald-400";

            return (
              <div
                key={item.model.id}
                className={`rounded-xl border-2 p-4 flex flex-col justify-between space-y-3.5 transition-all duration-300 ${cardBorderAndBg}`}
              >
                <div className="space-y-2.5">
                  {/* Top Status Badge + Group Label */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${badgeClasses}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dotClasses}`} />
                      <span>{item.colorBadgeText}</span>
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400">
                      {item.model.cropGroupTh}
                    </span>
                  </div>

                  {/* Crop Title & Root/Growth Stage */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <Sprout className={`w-4 h-4 shrink-0 ${scoreTextClasses}`} />
                      <span>{item.model.cropNameTh}</span>
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.levelLabelTh} · ระยะวิกฤต: {item.model.criticalGrowthStage}
                    </div>
                  </div>

                  {/* Risk Score Meter Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-slate-400 font-sans">
                        ดัชนีความเสี่ยงพืชผลรวม (Risk Score):
                      </span>
                      <span className={`font-bold ${scoreTextClasses}`}>
                        {item.compositeRiskScore}/100 · คาดผลผลิตลด ~{item.estimatedYieldLossPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900/80 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barFillClasses}`}
                        style={{ width: `${Math.max(6, item.compositeRiskScore)}%` }}
                      />
                    </div>
                  </div>

                  {/* Crop-Specific Threshold Comparison Box */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono tabular-nums">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                      <div className="text-slate-400 font-sans">เกณฑ์ SPI พืชนี้</div>
                      <div className="text-slate-200 font-semibold mt-0.5">
                        ปกติ &gt; {item.model.safeSpiMin} | วิกฤต ≤ {item.model.criticalSpiMax}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2">
                      <div className="text-slate-400 font-sans">เกณฑ์ความชื้นดิน</div>
                      <div className="text-slate-200 font-semibold mt-0.5">
                        ปกติ ≥ {item.model.safeMoistureMinPct}% | วิกฤต ≤{" "}
                        {item.model.criticalMoistureMaxPct}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agronomic Action & Link to Calculator */}
                <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className={scoreTextClasses}>คำแนะนำ:</strong>{" "}
                    {item.recommendedAction}
                  </p>

                  {item.model.linkedInsCropKey && (
                    <button
                      type="button"
                      onClick={() => {
                        if (item.model.linkedInsCropKey) {
                          handleSelectInsCrop(item.model.linkedInsCropKey);
                          setInsDamageScenario(
                            item.color === "red"
                              ? "severe_85"
                              : item.color === "yellow"
                              ? "partial_45"
                              : "partial_45"
                          );
                        }
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ส่งค่าความเสี่ยงพืชนี้ไปคำนวณประกันภัย &amp; กษ.01</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: กษ.01 Compensation Calculator & Official Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Interactive กษ.01 Calculator */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  เครื่องคำนวณสิทธิเงินช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉิน ด้านพืช (แบบ กษ.01)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                เพดานสูงสุดไม่เกิน 30 ไร่/ครัวเรือน
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              ตามระเบียบกระทรวงเกษตรและสหกรณ์ เกษตรกรที่ขึ้นทะเบียนเกษตรกร (ทบก.) ก่อนเกิดภัยพิบัติและพื้นที่อยู่ในประกาศเขตการให้ความช่วยเหลือฯ จะได้รับเงินเยียวยาตามพื้นที่เสียหายสิ้นเชิงจริง ไม่เกินรายละ 30 ไร่:
            </p>

            <div className="space-y-4 mt-4">
              {/* Row 1: Rice */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pb-3.5 border-b border-slate-100">
                <div className="sm:col-span-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      ข้าว (ข้าวหอมมะลิ / ข้าวเหนียว / ข้าวนาปี)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        riceRiskStatus.color === "red"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : riceRiskStatus.color === "yellow"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          riceRiskStatus.color === "red"
                            ? "bg-red-400"
                            : riceRiskStatus.color === "yellow"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span>{riceRiskStatus.colorBadgeText}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    อัตราชดเชย <strong className="font-mono tabular-nums text-slate-800">1,340 บาท/ไร่</strong>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] text-slate-500 mb-1">
                    พื้นที่เสียหาย (ไร่)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={damagedRiceRai}
                    onChange={(e) => setDamagedRiceRai(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3 text-right font-mono tabular-nums">
                  <div className="text-xs text-slate-500">เข้าเกณฑ์ {eligibleRiceRai} ไร่</div>
                  <div className="text-sm font-bold text-slate-900">
                    ฿{ricePayout.toLocaleString("th-TH")}
                  </div>
                </div>
              </div>

              {/* Row 2: Field Crops */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pb-3.5 border-b border-slate-100">
                <div className="sm:col-span-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      พืชไร่และพืชผัก (มันสำปะหลัง · อ้อย · ข้าวโพดเลี้ยงสัตว์)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        fieldCropRiskStatus.color === "red"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : fieldCropRiskStatus.color === "yellow"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          fieldCropRiskStatus.color === "red"
                            ? "bg-red-400"
                            : fieldCropRiskStatus.color === "yellow"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span>{fieldCropRiskStatus.colorBadgeText}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    อัตราชดเชย <strong className="font-mono tabular-nums text-slate-800">1,980 บาท/ไร่</strong>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] text-slate-500 mb-1">
                    พื้นที่เสียหาย (ไร่)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={damagedFieldCropRai}
                    onChange={(e) =>
                      setDamagedFieldCropRai(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3 text-right font-mono tabular-nums">
                  <div className="text-xs text-slate-500">เข้าเกณฑ์ {eligibleFieldCropRai} ไร่</div>
                  <div className="text-sm font-bold text-slate-900">
                    ฿{fieldCropPayout.toLocaleString("th-TH")}
                  </div>
                </div>
              </div>

              {/* Row 3: Orchard / Perennial */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pb-3.5 border-b border-slate-100">
                <div className="sm:col-span-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      ไม้ผล ไม้ยืนต้น และอื่นๆ (ทุเรียน · มะม่วง · น้อยหน่า)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        orchardRiskStatus.color === "red"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : orchardRiskStatus.color === "yellow"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          orchardRiskStatus.color === "red"
                            ? "bg-red-400"
                            : orchardRiskStatus.color === "yellow"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span>{orchardRiskStatus.colorBadgeText}</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    อัตราชดเชย <strong className="font-mono tabular-nums text-slate-800">4,048 บาท/ไร่</strong>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] text-slate-500 mb-1">
                    พื้นที่เสียหาย (ไร่)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={damagedOrchardRai}
                    onChange={(e) =>
                      setDamagedOrchardRai(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3 text-right font-mono tabular-nums">
                  <div className="text-xs text-slate-500">เข้าเกณฑ์ {eligibleOrchardRai} ไร่</div>
                  <div className="text-sm font-bold text-slate-900">
                    ฿{orchardPayout.toLocaleString("th-TH")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-900 text-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-300">
                วงเงินชดเชยตามหลักเกณฑ์ กษ.01 ที่คาดว่าจะได้รับ (โอนผ่านบัญชี ธ.ก.ส.)
              </div>
              <div className="text-xs text-emerald-300 mt-1 font-mono tabular-nums">
                พื้นที่เสียหายแจ้งรวม {totalDamagedRai} ไร่ · คำนวณตามสิทธิสูงสุด{" "}
                {Math.min(30, totalDamagedRai)} ไร่
              </div>
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-emerald-400">
              ฿{totalKs01Payout.toLocaleString("th-TH")}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Step-by-Step กษ.01 Filing Procedure */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-200">
              ขั้นตอนการยื่นขอรับเงินชดเชยภัยพิบัติกรณีฉุกเฉิน (กษ.01)
            </h3>
            <div className="divide-y divide-slate-100 mt-2">
              {KS01_COMPENSATION_RATES.workflowSteps.map((w) => (
                <div key={w.step} className="py-3">
                  <div className="text-xs font-semibold text-slate-900">{w.step}</div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{w.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
            หมายเหตุ: เกษตรกรต้องปรับปรุงสถานะทะเบียนเกษตรกร (Digital DOAE) ให้เป็นปัจจุบันทุกฤดูเพาะปลูกก่อนเกิดภัย
          </div>
        </div>
      </div>

      {/* Part 2.5: Crop Insurance vs. Expected Crop Market Revenue & กษ.01 Decision Analyzer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Crop Insurance &amp; Market Revenue Risk Analyzer · โครงการประกันภัยพืชผล ธ.ก.ส. / คปภ. ควบคู่สิทธิ กษ.01
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              วิเคราะห์เปรียบเทียบความคุ้มค่าการทำประกันภัยพืชผล เทียบกับรายได้คาดการณ์จากราคาผลผลิต และเงินเยียวยา กษ.01
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ช่วยเกษตรกรใน {selectedDistrict.nameTh} (ดรรชนี SPI-30d: {selectedDistrict.spi30d} · {selectedDistrict.droughtRiskLevel}) ตัดสินใจบริหารความเสี่ยงระหว่างรายได้ที่คาดว่าจะขายได้จริง ต้นทุนการผลิต เพดาน กษ.01 (30 ไร่) และประกันภัยพืชผล
            </p>
          </div>

          {/* Crop Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(Object.keys(CROP_INSURANCE_PROFILES) as InsuredCropKey[]).map((key) => {
              const item = CROP_INSURANCE_PROFILES[key];
              const isSelected = key === insCropKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectInsCrop(key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.shortNameTh}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Parameters Bar: Planted Area, Expected Yield, Market Price, Drought Loss Scenario & Insurance Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {/* Left 7 cols: Numeric Inputs */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  พื้นที่ปลูกทั้งหมด (ไร่)
                </label>
                <button
                  type="button"
                  onClick={() => setInsPlantedRai(Math.max(1, totalDamagedRai))}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                  title="ดึงจำนวนไร่จากเครื่องคำนวณ กษ.01 ด้านบน"
                >
                  ดึงค่า ({totalDamagedRai} ไร่)
                </button>
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={insPlantedRai}
                onChange={(e) => setInsPlantedRai(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                {insPlantedRai > 30 ? (
                  <span className="text-amber-700 font-medium">
                    เกินเพดาน กษ.01 อยู่ {insPlantedRai - 30} ไร่ (ประกันภัยคุ้มครองครบ)
                  </span>
                ) : (
                  <span>อยู่ในเกณฑ์เพดาน กษ.01 (≤ 30 ไร่)</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ผลผลิตคาดการณ์ ({insProfile.yieldUnit})
              </label>
              <input
                type="number"
                min={0.1}
                max={40}
                step={insCropKey === "jasmine_rice" ? 0.05 : 0.2}
                value={insExpectedYield}
                onChange={(e) =>
                  setInsExpectedYield(Math.max(0.1, Number(e.target.value) || 0.1))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                ผลผลิตรวม {(insExpectedYield * insPlantedRai).toFixed(1)} ตัน
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ราคาผลผลิตคาดการณ์ ({insProfile.priceUnit})
              </label>
              <input
                type="number"
                min={100}
                max={50000}
                step={50}
                value={insExpectedPrice}
                onChange={(e) =>
                  setInsExpectedPrice(Math.max(100, Number(e.target.value) || 100))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg"
              />
              <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                รายได้คาดการณ์ ฿{insuranceAnalysis.expectedRevenuePerRai.toLocaleString("th-TH")}/ไร่
              </div>
            </div>
          </div>

          {/* Right 5 cols: Scenario & Insurance Tier Selectors */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ระดับความเสียหายจากภัยแล้งจำลอง
              </label>
              <select
                value={insDamageScenario}
                onChange={(e) => setInsDamageScenario(e.target.value as DamageScenarioKey)}
                aria-label="เลือกระดับความเสียหายจากภัยแล้ง"
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="partial_45">
                  ฝนทิ้งช่วง ผลผลิตลด 45% (ไม่เข้าเกณฑ์ กษ.01)
                </option>
                <option value="severe_85">
                  แล้งรุนแรง เสียหาย 85% (เข้าเกณฑ์ กษ.01 + ประกัน)
                </option>
                <option value="total_100">
                  เสียหายสิ้นเชิง 100% (เข้าเกณฑ์ กษ.01 + ประกันเต็ม)
                </option>
              </select>
              <div className="text-[11px] text-slate-500 mt-1">
                {insDamageScenario === "partial_45"
                  ? "กษ.01 จ่ายเฉพาะเสียหายสิ้นเชิง แต่ประกันดัชนีน้ำฝนจ่ายชดเชย"
                  : "เข้าเงื่อนไขรับเงิน กษ.01 ควบคู่สินไหมประกันภัยพืชผล"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                แผนความคุ้มครองประกันภัยพืชผล
              </label>
              <select
                value={insTierMode}
                onChange={(e) => setInsTierMode(e.target.value as InsuranceTierKey)}
                aria-label="เลือกแผนความคุ้มครองประกันภัยพืชผล"
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="tier1_subsidized">
                  Tier 1 พื้นฐาน (เบี้ย {insProfile.tier1FarmerPremiumPerRai} บ./ไร่ · รัฐอุดหนุนร่วม)
                </option>
                <option value="tier2_enhanced">
                  Tier 1 + Tier 2 สมัครใจ (เบี้ย{" "}
                  {insProfile.tier1FarmerPremiumPerRai +
                    insProfile.tier2AdditionalPremiumPerRai}{" "}
                  บ./ไร่ · คุ้มครองสูงสุด)
                </option>
              </select>
              <div className="text-[11px] text-emerald-800 font-medium mt-1 font-mono tabular-nums">
                คุ้มครองสูงสุด ฿{insuranceAnalysis.maxInsuranceCoveragePerRai.toLocaleString("th-TH")}/ไร่
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Financial & Cost-Effectiveness KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Expected Crop Revenue from Market Price */}
          <div className="bg-[#0B101D] border border-[#1E293B] hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between smooth-card-transition shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>รายได้คาดการณ์จากราคาผลผลิต</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1.5">
                ฿{insuranceAnalysis.expectedTotalRevenue.toLocaleString("th-TH")}
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-300 mt-1">
                เฉลี่ย ฿{insuranceAnalysis.expectedRevenuePerRai.toLocaleString("th-TH")}/ไร่ · ต้นทุนรวม ฿
                {insuranceAnalysis.totalProductionCost.toLocaleString("th-TH")}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-mono tabular-nums">
              กำไรสุทธิคาดการณ์ปีปกติ: <span className="text-emerald-400 font-bold">+฿{insuranceAnalysis.expectedNormalProfit.toLocaleString("th-TH")}</span>
            </div>
          </div>

          {/* Card 2: Insurance Premium vs Coverage Leverage */}
          <div className="bg-[#0B101D] border border-[#1E293B] hover:border-teal-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between smooth-card-transition shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>ค่าเบี้ยประกันจ่ายจริง vs วงเงินคุ้มครอง</span>
                <Scale className="w-4 h-4 text-[#2DD4BF]" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#2DD4BF] mt-1.5">
                ฿{insuranceAnalysis.totalPremiumPaid.toLocaleString("th-TH")}{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({insuranceAnalysis.premiumPerRai} บ./ไร่)
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-mono tabular-nums">
                คิดเป็นเพียง <strong className="text-white font-bold">{insuranceAnalysis.premiumToExpectedRevenuePct}%</strong> ของรายได้ผลผลิตคาดการณ์
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-[#2DD4BF] font-semibold font-mono tabular-nums">
              ความคุ้มค่า: จ่ายเบี้ย ฿1 คุ้มครอง ฿{insuranceAnalysis.coverageLeverageRatio} (รัฐสมทบอีก ฿
              {insuranceAnalysis.totalGovSubsidy.toLocaleString("th-TH")})
            </div>
          </div>

          {/* Card 3: Drought Outcome — Relying on กษ.01 Only */}
          <div className="bg-gradient-to-b from-[#1A140B] to-[#0E0C07] border border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-between smooth-card-transition shadow-[0_4px_20px_rgba(245,158,11,0.06)]">
            <div>
              <div className="flex items-center justify-between text-xs text-[#FBBF24] font-bold">
                <span>กรณีเกิดภัยแล้ง: พึ่งเฉพาะ กษ.01</span>
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
              <div className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-white mt-1.5 tracking-tight">
                ฿{insuranceAnalysis.totalInflowKs01Only.toLocaleString("th-TH")}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-mono tabular-nums leading-relaxed">
                เงิน กษ.01: <span className="text-white font-semibold">฿{insuranceAnalysis.ks01GovernmentPayout.toLocaleString("th-TH")}</span> (
                {insuranceAnalysis.ks01EligibleRai} ไร่) + ผลผลิตที่เหลือ <span className="text-white font-semibold">฿
                {insuranceAnalysis.salvageMarketRevenue.toLocaleString("th-TH")}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-500/30 text-[11.5px] text-[#FBBF24] font-mono tabular-nums">
              กู้คืนต้นทุนได้เพียง <strong className="text-white font-bold">{insuranceAnalysis.costRecoveryKs01OnlyPct}%</strong> (ขาดทุนสุทธิ ฿
              {Math.max(
                0,
                insuranceAnalysis.totalProductionCost - insuranceAnalysis.totalInflowKs01Only
              ).toLocaleString("th-TH")}
              )
            </div>
          </div>

          {/* Card 4: Drought Outcome — กษ.01 + Crop Insurance */}
          <div className="bg-gradient-to-b from-[#091D1C] to-[#061214] border border-[#14B8A6]/60 hover:border-[#2DD4BF] rounded-2xl p-4 sm:p-5 flex flex-col justify-between smooth-card-transition shadow-[0_4px_24px_rgba(20,184,166,0.12)]">
            <div>
              <div className="flex items-center justify-between text-xs text-[#2DD4BF] font-bold">
                <span>กรณีเกิดภัยแล้ง: กษ.01 + ประกันภัยพืชผล</span>
                <ShieldCheck className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              </div>
              <div className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-emerald-400 mt-1.5 tracking-tight">
                ฿{insuranceAnalysis.totalInflowWithInsurance.toLocaleString("th-TH")}
              </div>
              <div className="text-xs text-slate-300 mt-1 font-mono tabular-nums leading-relaxed">
                รับสินไหมประกันเพิ่มสุทธิ{" "}
                <strong className="text-[#2DD4BF] font-bold">
                  +฿{insuranceAnalysis.netInsuranceBenefit.toLocaleString("th-TH")}
                </strong>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#14B8A6]/35 text-[11.5px] text-emerald-300 font-semibold font-mono tabular-nums">
              กู้คืนต้นทุนการผลิตได้ถึง <strong className="text-white font-bold">{insuranceAnalysis.costRecoveryWithInsurancePct}%</strong> · รักษารายได้{" "}
              <strong className="text-emerald-400 font-bold">{insuranceAnalysis.revenuePreservedWithInsurancePct}%</strong>
            </div>
          </div>
        </div>

        {/* Main Visual Comparison: Recharts Bar Chart (7 Cols) + Strategic Decision Matrix (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 7 cols: Recharts Financial Comparison Chart */}
          <div className="lg:col-span-7 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">
                  กราฟเปรียบเทียบรายได้คาดการณ์จากผลผลิต ต้นทุนการผลิต และเงินชดเชยรวม ({insPlantedRai} ไร่)
                </h4>
                <p className="text-xs text-slate-400">
                  เปรียบเทียบความคุ้มค่าระหว่างการรอรับเงิน กษ.01 อย่างเดียว กับการทำประกันภัยพืชผลควบคู่ กษ.01
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#2DD4BF] font-semibold">
                {insProfile.cropNameTh}
              </span>
            </div>

            <div className="h-[265px] w-full bg-[#080C16] border border-[#1E293B] rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insuranceAnalysis.chartData}
                  margin={{ top: 16, right: 18, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={{ stroke: "#1E293B" }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `฿${(v / 1000).toFixed(0)}k` : `฿${v}`
                    }
                    tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `฿${Number(value ?? 0).toLocaleString("th-TH")} บาท`,
                      "มูลค่ารวมทั้งแปลง",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0B101D",
                      borderColor: "#1E293B",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                  />
                  <ReferenceLine
                    y={insuranceAnalysis.totalProductionCost}
                    stroke="#F43F5E"
                    strokeDasharray="4 4"
                    label={{
                      value: `เส้นคุ้มทุนต้นทุนผลิต (฿${insuranceAnalysis.totalProductionCost.toLocaleString("th-TH")})`,
                      position: "insideTopRight",
                      fill: "#FDA4AF",
                      fontSize: 10,
                    }}
                  />
                  <Bar dataKey="amountBaht" radius={[8, 8, 0, 0]} maxBarSize={58}>
                    {insuranceAnalysis.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Breakdown Table per Rai vs Whole Plot */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2 font-medium">รายการเปรียบเทียบทางการเงิน</th>
                    <th className="py-2 px-2 font-medium text-right">เฉลี่ยต่อไร่</th>
                    <th className="py-2 px-2 font-medium text-right">รวมทั้งแปลง ({insPlantedRai} ไร่)</th>
                    <th className="py-2 pl-2 font-medium text-right">% เทียบต้นทุนผลิต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 font-mono tabular-nums">
                  <tr>
                    <td className="py-2 pr-2 font-sans font-medium text-slate-800">
                      รายได้คาดการณ์จากราคาผลผลิต (ปีปกติ)
                    </td>
                    <td className="py-2 px-2 text-right text-sky-700 font-semibold">
                      ฿{insuranceAnalysis.expectedRevenuePerRai.toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-900 font-bold">
                      ฿{insuranceAnalysis.expectedTotalRevenue.toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pl-2 text-right text-sky-700">
                      {Math.round(
                        (insuranceAnalysis.expectedTotalRevenue /
                          Math.max(1, insuranceAnalysis.totalProductionCost)) *
                          100
                      )}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-sans font-medium text-slate-800">
                      กรณีภัยแล้ง: พึ่งเฉพาะเงินชดเชย กษ.01 อย่างเดียว
                    </td>
                    <td className="py-2 px-2 text-right text-amber-700 font-semibold">
                      ฿
                      {Math.round(
                        insuranceAnalysis.totalInflowKs01Only / Math.max(1, insPlantedRai)
                      ).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 px-2 text-right text-amber-700 font-bold">
                      ฿{insuranceAnalysis.totalInflowKs01Only.toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pl-2 text-right text-amber-700 font-semibold">
                      {insuranceAnalysis.costRecoveryKs01OnlyPct}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-sans font-semibold text-emerald-900">
                      กรณีภัยแล้ง: เงิน กษ.01 + สินไหมประกันภัยพืชผล (หักค่าเบี้ยแล้ว)
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-800 font-bold">
                      ฿
                      {Math.round(
                        insuranceAnalysis.totalInflowWithInsurance / Math.max(1, insPlantedRai)
                      ).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-800 font-bold">
                      ฿{insuranceAnalysis.totalInflowWithInsurance.toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pl-2 text-right text-emerald-800 font-bold">
                      {insuranceAnalysis.costRecoveryWithInsurancePct}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 5 cols: Decision Guide for Farmers (กษ.01 vs Crop Insurance Synergy) */}
          <div className="lg:col-span-5 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>ข้อเปรียบเทียบเพื่อการตัดสินใจของเกษตรกร</span>
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  {insProfile.ks01CategoryLabel}
                </span>
              </div>

              <div className="bg-[#101728] border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-bold text-white">
                  ทำไมการพึ่งพาเฉพาะเงินช่วยเหลือ กษ.01 จึงไม่เพียงพอต่อการรักษาทุนเพาะปลูก?
                </div>
                <ul className="space-y-1.5 text-slate-300 leading-relaxed">
                  <li>
                    • <strong>ช่องว่างต้นทุนต่อรายได้:</strong> {insProfile.shortNameTh}มีรายได้คาดการณ์{" "}
                    <strong className="font-mono text-white">
                      ฿{insuranceAnalysis.expectedRevenuePerRai.toLocaleString("th-TH")}/ไร่
                    </strong>{" "}
                    และต้นทุนผลิตจริง{" "}
                    <strong className="font-mono text-white">
                      ฿{insProfile.avgProductionCostPerRai.toLocaleString("th-TH")}/ไร่
                    </strong>{" "}
                    แต่เงินช่วยเหลือ กษ.01 จ่ายเพียง{" "}
                    <strong className="font-mono text-amber-400">
                      ฿{insProfile.ks01RatePerRai.toLocaleString("th-TH")}/ไร่
                    </strong>{" "}
                    (ครอบคลุมต้นทุนเพียง{" "}
                    {Math.round(
                      (insProfile.ks01RatePerRai / insProfile.avgProductionCostPerRai) * 100
                    )}
                    %)
                  </li>
                  <li>
                    • <strong>เงื่อนไขความเสียหายสิ้นเชิง &amp; เพดาน 30 ไร่:</strong> กษ.01 จะจ่ายเมื่อแปลงอยู่ในประกาศเขตภัยพิบัติและพืชเสียหายสิ้นเชิงเท่านั้น (จำกัดไม่เกิน 30 ไร่/ครัวเรือน)
                    {insuranceAnalysis.uncoveredRaiOverCap > 0
                      ? ` ซึ่งแปลงของคุณมีพื้นที่ส่วนเกินเพดาน ${insuranceAnalysis.uncoveredRaiOverCap} ไร่ ที่จะไม่ได้รับเงิน กษ.01`
                      : ""}
                  </li>
                  <li>
                    • <strong>ความคุ้มค่าของประกันภัยพืชผล:</strong> จ่ายเบี้ยประกันเพียง{" "}
                    <strong className="font-mono text-emerald-400">
                      {insuranceAnalysis.premiumPerRai} บ./ไร่ ({insuranceAnalysis.premiumToExpectedRevenuePct}% ของรายได้ผลผลิต)
                    </strong>{" "}
                    แต่ได้รับเงินชดเชยส่วนเพิ่มสุทธิถึง{" "}
                    <strong className="font-mono text-emerald-400">
                      +฿{insuranceAnalysis.netInsuranceBenefit.toLocaleString("th-TH")}
                    </strong>{" "}
                    โดยไม่ตัดสิทธิการรับเงิน กษ.01
                  </li>
                </ul>
              </div>

              <div className="bg-[#101728] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="font-bold text-white">
                  เงื่อนไขความคุ้มครองเฉพาะสำหรับ {insProfile.shortNameTh}
                </div>
                <p className="text-slate-300 leading-relaxed">{insProfile.policyHighlight}</p>
                <div className="pt-1 text-[11px] font-mono tabular-nums text-slate-400">
                  เกณฑ์ดัชนีความแห้งแล้งเริ่มจ่ายสินไหม: SPI-30d ≤ {insProfile.spiTriggerThreshold} (ค่าปัจจุบันของ{" "}
                  {selectedDistrict.nameTh}: {selectedDistrict.spi30d})
                </div>
              </div>
            </div>

            {/* District-Specific Action Recommendation Banner */}
            <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center justify-between">
                <span>คำแนะนำเชิงกลยุทธ์สำหรับพื้นที่ {selectedDistrict.nameTh}</span>
                <span className="font-mono tabular-nums text-[#2DD4BF]">
                  SPI {selectedDistrict.spi30d}
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {selectedDistrict.spi30d <= insProfile.spiTriggerThreshold
                  ? `พื้นที่ ${selectedDistrict.nameTh} มีค่า SPI (${selectedDistrict.spi30d}) ต่ำกว่าเกณฑ์เริ่มจ่ายสินไหม (${insProfile.spiTriggerThreshold}) แนะนำให้ขึ้นทะเบียนเกษตรกร (ทบก.) เพื่อรักษาสิทธิ กษ.01 ควบคู่กับการทำประกันภัยพืชผล (${insTierMode === "tier2_enhanced" ? "Tier 1+2" : "Tier 1"}) เพื่อดึงอัตราการกู้คืนต้นทุนจาก ${insuranceAnalysis.costRecoveryKs01OnlyPct}% ขึ้นเป็น ${insuranceAnalysis.costRecoveryWithInsurancePct}%`
                  : `แม้ปัจจุบัน ${selectedDistrict.nameTh} มีค่า SPI (${selectedDistrict.spi30d}) อยู่ในเกณฑ์เฝ้าระวังปกติ การแบ่งรายได้คาดการณ์เพียง ${insuranceAnalysis.premiumToExpectedRevenuePct}% (${insuranceAnalysis.premiumPerRai} บ./ไร่) ทำประกันภัยพืชผลควบคู่กับการปรับปรุงทะเบียน ทบก. จะช่วยล็อกหลักประกันต้นทุนการผลิตได้ถึง ฿${insuranceAnalysis.totalInflowWithInsurance.toLocaleString("th-TH")}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Part 3: Digital DOAE Registry & Claim Status Checker */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-semibold text-slate-900">
                ระบบเช็กสิทธิทะเบียนเกษตรกร (Digital DOAE) และติดตามสถานะโอนเงินเยียวยา ธ.ก.ส.
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ค้นหาด้วยเลขประจำตัวประชาชน 13 หลัก หรือรหัสทะเบียนเกษตรกร (คลิกเลือกข้อมูลตัวอย่างด้านล่างเพื่อทดสอบระบบทันที)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupInput}
                onChange={(e) => handleFarmerLookup(e.target.value)}
                placeholder="เลข 13 หลัก หรือชื่อเกษตรกร..."
                className="pl-8 pr-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>

            {DOAE_FARMER_RECORDS.map((rec) => (
              <button
                key={rec.farmerId}
                type="button"
                onClick={() => {
                  setLookupInput(rec.farmerId);
                  setSelectedFarmer(rec);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  selectedFarmer.farmerId === rec.farmerId
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {rec.fullName} ({rec.districtName})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Farmer Record Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          <div className="lg:col-span-5 space-y-2.5 text-xs border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-6">
            <div className="text-sm font-bold text-slate-900">
              {selectedFarmer.fullName}
            </div>
            <div className="text-slate-600 font-mono tabular-nums">
              เลขทะเบียนเกษตรกร: {selectedFarmer.farmerId} · รหัสครัวเรือน: {selectedFarmer.householdCode}
            </div>
            <div className="text-slate-600">
              ที่ตั้งแปลงหลัก: {selectedFarmer.subdistrictName} {selectedFarmer.districtName} จ.นครราชสีมา
            </div>
            <div className="pt-1 flex items-center gap-1.5 text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{selectedFarmer.registrationStatus}</span>
            </div>
            <div className="text-slate-500">
              ปรับปรุงข้อมูลล่าสุด: {selectedFarmer.lastUpdatedDate} · บัญชีรับโอน: {selectedFarmer.baacAccountMasked}
            </div>
            <div className="pt-2">
              <span className="text-slate-500">สถานะการขอรับเงินชดเชย กษ.01: </span>
              <strong className="text-slate-900">{selectedFarmer.claimStage}</strong>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="text-xs font-semibold text-slate-800 mb-2">
              รายการแปลงเพาะปลูกที่ขึ้นทะเบียนในระบบ Digital DOAE และสิทธิเงินชดเชยตามแปลง
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3 font-medium">รหัสแปลง · พิกัด</th>
                    <th className="py-2 px-3 font-medium">ชนิดพืชที่แจ้งปลูก</th>
                    <th className="py-2 px-3 font-medium text-right">พื้นที่ปลูก</th>
                    <th className="py-2 px-3 font-medium text-right">เสียหายอนุมัติ</th>
                    <th className="py-2 pl-3 font-medium text-right">วงเงินชดเชย กษ.01</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedFarmer.registeredPlots.map((plot) => {
                    const rate =
                      plot.category === "orchard"
                        ? 4048
                        : plot.category === "field_crop"
                        ? 1980
                        : 1340;
                    const payout = plot.damagedRaiApproved * rate;
                    return (
                      <tr key={plot.plotId}>
                        <td className="py-2.5 pr-3 font-mono tabular-nums">
                          <div className="font-semibold text-slate-900">{plot.plotId}</div>
                          <div className="text-slate-500">{plot.coordinates}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {plot.cropName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {plot.rai} ไร่
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-amber-800">
                          {plot.damagedRaiApproved} ไร่
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                          ฿{payout.toLocaleString("th-TH")}
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

      {/* Part 4: Geotag / Timestamp Photo Evidence Recorder */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-semibold text-slate-900">
                ระบบถ่ายภาพแปลงบันทึกความเสียหายพร้อมพิกัดดาวเทียม (Geotag / Timestamp Evidence Stamper)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              สร้างไฟล์ภาพหลักฐานประทับพิกัดละติจูด/ลองจิจูด วันเวลา และรหัสแปลง เพื่อใช้แนบแบบความจำนง กษ.01 ต่อคณะกรรมการหมู่บ้าน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ถ่ายภาพแปลง / อัปโหลดรูปภาพจริง</span>
            </button>

            <button
              type="button"
              onClick={() => setEvidenceImgSrc(KORAT_ASSETS.droughtSamplePlot)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              ใช้ภาพตัวอย่างแปลงภัยแล้งโคราช
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          {/* Left 5 cols: Metadata Form */}
          <div className="lg:col-span-5 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อ-นามสกุล เกษตรกรผู้ยื่นแบบ กษ.01
              </label>
              <input
                type="text"
                value={evidenceFarmerName}
                onChange={(e) => setEvidenceFarmerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รหัสแปลงเพาะปลูก
                </label>
                <input
                  type="text"
                  value={evidencePlotCode}
                  onChange={(e) => setEvidencePlotCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  พื้นที่เสียหายจริง (ไร่)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={evidenceRai}
                  onChange={(e) => setEvidenceRai(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ลักษณะความเสียหายของพืชและการประเมินเบื้องต้น
              </label>
              <input
                type="text"
                value={evidenceCropDamage}
                onChange={(e) => setEvidenceCropDamage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ละติจูด (Latitude N)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={evidenceLat}
                  onChange={(e) => setEvidenceLat(Number(e.target.value) || 15.2089)}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ลองจิจูด (Longitude E)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={evidenceLon}
                  onChange={(e) => setEvidenceLon(Number(e.target.value) || 101.7694)}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleUseDeviceGps}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>ดึงพิกัด GPS ปัจจุบัน</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEvidenceLog}
                className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                บันทึกลงแฟ้มหลักฐาน กษ.01
              </button>

              {stampedDataUrl && (
                <a
                  href={stampedDataUrl}
                  download={`KS01_Geotag_${evidencePlotCode}.png`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดภาพ (PNG)</span>
                </a>
              )}
            </div>

            {gpsStatusMsg && (
              <div className="text-xs text-emerald-700 font-medium">{gpsStatusMsg}</div>
            )}
          </div>

          {/* Right 7 cols: Live Geotagged Canvas Preview */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-300">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
                aria-label="ภาพถ่ายแปลงเกษตรพร้อมตราประทับพิกัด Geotag และ Timestamp"
              />
            </div>

            {savedLogs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  รายการภาพหลักฐานที่บันทึกไว้ในเซสชันนี้ ({savedLogs.length} รายการ)
                </div>
                <div className="space-y-2">
                  {savedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{log.farmerName}</span> ·{" "}
                        <span>{log.districtName}</span> ·{" "}
                        <span className="font-mono tabular-nums">{log.damagedRai} ไร่</span>
                        <div className="text-slate-500 font-mono tabular-nums mt-0.5">
                          พิกัด {log.coordinates} · บันทึกเมื่อ {log.timestampStr}
                        </div>
                      </div>
                      {log.dataUrl && (
                        <a
                          href={log.dataUrl}
                          download={`KS01_${log.id}.png`}
                          className="text-emerald-700 font-medium hover:underline whitespace-nowrap ml-3"
                        >
                          ดาวน์โหลด
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
