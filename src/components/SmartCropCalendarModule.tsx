import React, { useState, useMemo } from "react";
import {
  KORAT_DISTRICTS,
  KoratDistrict,
  formatDistrictName,
} from "../data/koratAgriData";
import { useTheme } from "../context/ThemeContext";
import {
  Calendar,
  Droplets,
  CloudRain,
  Sprout,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Layers,
  Sparkles,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
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

interface SmartCropCalendarModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
}

export interface KoratAgroZoneConfig {
  id: string;
  nameTh: string;
  shortNameTh: string;
  topographyAndSoil: string;
  districtIds: string[];
  seasonalRainMultipliers: number[]; // 12 months (Jan..Dec)
  seasonalMoistureOffsets: number[]; // 12 months (Jan..Dec)
  signatureAdvantage: string;
}

export const KORAT_AGRO_ZONES: KoratAgroZoneConfig[] = [
  {
    id: "zone-west-highland",
    nameTh: "โซนที่ 1: ที่ราบสูง-ตะวันตก (ด่านขุนทด · ปากช่อง · สีคิ้ว · เทพารักษ์)",
    shortNameTh: "โซนตะวันตก-ที่ราบสูง",
    topographyAndSoil: "พื้นที่ดอนลูกคลื่น ดินร่วนปนทรายถึงดินร่วนเหนียวสีแดง ระบายน้ำดี",
    districtIds: [
      "dan-khun-thot",
      "pak-chong",
      "sikhio",
      "thepharak",
      "kham-thale-so",
    ],
    seasonalRainMultipliers: [0.12, 0.18, 0.42, 0.78, 1.38, 1.05, 1.12, 1.32, 1.85, 1.28, 0.32, 0.08],
    seasonalMoistureOffsets: [-14, -12, -8, -3, +8, +4, +5, +8, +14, +9, -4, -11],
    signatureAdvantage:
      "เหมาะสำหรับข้าวโพดเลี้ยงสัตว์ 2 รุ่น (ต้นฝน-ปลายฝน), มันสำปะหลังต้นฝน และไม้ผลคุณภาพสูง (ทุเรียน/น้อยหน่าปากช่อง)",
  },
  {
    id: "zone-thung-samrit",
    nameTh: "โซนที่ 2: ทุ่งสัมฤทธิ์-ลุ่มน้ำมูลตอนบน (พิมาย · ชุมพวง · โนนสูง · จักราช)",
    shortNameTh: "โซนทุ่งสัมฤทธิ์-ลุ่มน้ำมูล",
    topographyAndSoil: "ที่ราบลุ่มน้ำมูลและลำจักราช ดินเหนียวปนทรายแป้ง อุ้มน้ำดีเยี่ยมในฤดูฝน",
    districtIds: [
      "phimai",
      "chum-phuang",
      "non-sung",
      "chaloem-phra-kiat",
      "chakkarat",
    ],
    seasonalRainMultipliers: [0.08, 0.14, 0.35, 0.68, 1.28, 1.02, 1.1, 1.36, 1.96, 1.34, 0.28, 0.06],
    seasonalMoistureOffsets: [-12, -11, -7, -2, +7, +5, +6, +10, +16, +12, +1, -8],
    signatureAdvantage:
      "แหล่งปลูกข้าวหอมมะลิทุ่งสัมฤทธิ์ GI อันดับหนึ่ง อ้อยโรงงานข้ามแล้ง และพืชตระกูลถั่วหลังนาโดยอาศัยความชื้นสะสมในดิน",
  },
  {
    id: "zone-north-rainfed",
    nameTh: "โซนที่ 3: ตอนเหนือ-นอกเขตชลประทาน (บัวใหญ่ · ประทาย · คง · บ้านเหลื่อม · โนนแดง)",
    shortNameTh: "โซนเหนือ-นอกชลประทาน",
    topographyAndSoil: "ที่ราบดอนสลับที่ลุ่ม ดินร่วนปนทราย เสี่ยงฝนทิ้งช่วงช่วง มิ.ย.–ก.ค.",
    districtIds: [
      "bua-yai",
      "prathai",
      "khong",
      "ban-lueam",
      "non-daeng",
      "mueang-yang",
      "lam-thamenchai",
      "bua-lai",
      "sida",
      "kaeng-sanam-nang",
    ],
    seasonalRainMultipliers: [0.06, 0.12, 0.3, 0.62, 1.22, 0.88, 0.94, 1.28, 1.88, 1.18, 0.22, 0.05],
    seasonalMoistureOffsets: [-15, -14, -10, -5, +6, -1, +1, +7, +14, +8, -3, -12],
    signatureAdvantage:
      "เน้นข้าวหอมมะลิทนแล้ง อ้อยโรงงานตัดสด และพืชอายุสั้นใช้น้ำน้อย (ถั่วหรั่ง/ถั่วเขียว/ปอเทืองบำรุงดิน) เพื่อลดความเสี่ยงภัยแล้ง",
  },
  {
    id: "zone-central-lamtakhong",
    nameTh: "โซนที่ 4: ตอนกลาง-ลุ่มน้ำลำตะคอง/ลำพระเพลิง (เมือง · ปักธงชัย · โชคชัย · สูงเนิน)",
    shortNameTh: "โซนกลาง-ลำตะคอง",
    topographyAndSoil: "พื้นที่กึ่งชลประทานท้ายเขื่อนลำตะคองและลำพระเพลิง ดินร่วนถึงดินร่วนเหนียว",
    districtIds: [
      "mueang-nakhon-ratchasima",
      "pak-thong-chai",
      "chok-chai",
      "sung-noen",
      "kham-sakae-saeng",
      "non-thai",
      "phra-thong-kham",
      "huai-thalaeng",
      "nong-bun-mak",
    ],
    seasonalRainMultipliers: [0.1, 0.16, 0.38, 0.74, 1.32, 1.04, 1.12, 1.34, 1.9, 1.32, 0.3, 0.07],
    seasonalMoistureOffsets: [-11, -10, -6, -1, +7, +4, +5, +8, +14, +10, 0, -7],
    signatureAdvantage:
      "ยืดหยุ่นสูง สามารถปลูกข้าวนาปี มันสำปะหลัง ข้าวโพดหวาน และพืชผักเศรษฐกิจหมุนเวียนได้เกือบตลอดปีในพื้นที่ใกล้คลองส่งน้ำ",
  },
  {
    id: "zone-south-dongphayayen",
    nameTh: "โซนที่ 5: โซนใต้-ดงพญาเย็น/มูลบน-ลำแชะ (เสิงสาง · ครบุรี · วังน้ำเขียว)",
    shortNameTh: "โซนใต้-มูลบน·ลำแชะ",
    topographyAndSoil: "ดินเหนียวสีแดงชุดดินโชคชัย/ครบุรี อุดมสมบูรณ์และเก็บกักความชื้นในดินได้นานที่สุด",
    districtIds: ["soeng-sang", "khon-buri", "wang-nam-khiao"],
    seasonalRainMultipliers: [0.14, 0.22, 0.48, 0.85, 1.45, 1.15, 1.22, 1.42, 2.02, 1.45, 0.38, 0.1],
    seasonalMoistureOffsets: [-10, -8, -4, +1, +9, +6, +7, +10, +16, +12, +3, -6],
    signatureAdvantage:
      "แหล่งมันสำปะหลังเปอร์เซ็นต์แป้งสูงและอ้อยโรงงานค่าความหวาน (CCS) สูง รวมถึงไม้ผลและพืชผักเมืองหนาววังน้ำเขียว",
  },
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export type CalendarPhaseType =
  | "plant_optimal" // เหมาะสมสูงสุดในการเริ่มปลูก
  | "care_growth" // ระยะบำรุงรักษา/สะสมผลผลิต
  | "harvest_peak" // ระยะเก็บเกี่ยวผลผลิต
  | "off_season"; // นอกฤดูเพาะปลูก/พักดิน

interface CropCalendarModel {
  id: string;
  nameTh: string;
  varietyNoteTh: string;
  categoryTh: string;
  minMoistureToPlantPct: number;
  maxMoistureToPlantPct: number;
  minMonthlyRainToPlantMm: number;
  maxMonthlyRainToPlantMm: number;
  waterRequirementMmPerCycle: string;
  expectedRevenuePerRaiBaht: number;
  // Base monthly schedule template (0..11 for Jan..Dec) refined dynamically by moisture & rain
  baseMonthPhases: CalendarPhaseType[];
  plantingMonthsIndices: number[];
  harvestMonthsIndices: number[];
  agronomicTipByPhase: Record<CalendarPhaseType, string>;
}

const KORAT_SMART_CALENDAR_CROPS: CropCalendarModel[] = [
  {
    id: "cassava_late_rain",
    nameTh: "มันสำปะหลังหัวสด (รุ่นปลายฝน / ข้ามแล้ง)",
    varietyNoteTh: "พันธุ์เกษตรศาสตร์ 50 · ห้วยบง 60 · ระยอง 72 (ทนโรคใบด่าง CMV)",
    categoryTh: "พืชไร่เศรษฐกิจหลัก",
    minMoistureToPlantPct: 30,
    maxMoistureToPlantPct: 62,
    minMonthlyRainToPlantMm: 45,
    maxMonthlyRainToPlantMm: 220,
    waterRequirementMmPerCycle: "650–900 มม./รอบปี",
    expectedRevenuePerRaiBaht: 12080,
    baseMonthPhases: [
      "care_growth", // ม.ค.
      "care_growth", // ก.พ.
      "care_growth", // มี.ค.
      "care_growth", // เม.ย.
      "care_growth", // พ.ค.
      "care_growth", // มิ.ย.
      "care_growth", // ก.ค.
      "harvest_peak", // ส.ค.
      "harvest_peak", // ก.ย.
      "plant_optimal", // ต.ค.
      "plant_optimal", // พ.ย.
      "care_growth", // ธ.ค.
    ],
    plantingMonthsIndices: [9, 10], // ต.ค. - พ.ย.
    harvestMonthsIndices: [7, 8, 9], // ส.ค. - ต.ค. ปีถัดไป
    agronomicTipByPhase: {
      plant_optimal:
        "ดินมีความชื้นสะสมหลังฝน 35–55% เหมาะที่สุดในการยกร่องปักท่อนพันธุ์สะอาดปลอดโรค CMV รากเดินดีโดยไม่เน่า",
      care_growth:
        "ระยะตั้งตัวและสะสมแป้ง ใส่ปุ๋ยสั่งตัดตามค่าวิเคราะห์ดินและสำรวจแมลงหวี่ขาวทุก 2 สัปดาห์",
      harvest_peak:
        "ระยะขุดหัวมันจำหน่ายหน้าลาน/โรงแป้ง แนะนำวัดเปอร์เซ็นต์แป้งให้ได้ ≥ 25% เพื่อรับราคาพรีเมียม",
      off_season: "เตรียมดินไถดะตากดินและตากท่อนพันธุ์คัดสะอาด",
    },
  },
  {
    id: "cassava_early_rain",
    nameTh: "มันสำปะหลังหัวสด (รุ่นต้นฝน)",
    varietyNoteTh: "พันธุ์เกษตรศาสตร์ 50 · ระยอง 9 (พื้นที่ดอนระบายน้ำดี)",
    categoryTh: "พืชไร่เศรษฐกิจหลัก",
    minMoistureToPlantPct: 28,
    maxMoistureToPlantPct: 58,
    minMonthlyRainToPlantMm: 65,
    maxMonthlyRainToPlantMm: 210,
    waterRequirementMmPerCycle: "700–950 มม./รอบปี",
    expectedRevenuePerRaiBaht: 11850,
    baseMonthPhases: [
      "harvest_peak", // ม.ค.
      "harvest_peak", // ก.พ.
      "harvest_peak", // มี.ค.
      "plant_optimal", // เม.ย.
      "plant_optimal", // พ.ค.
      "care_growth", // มิ.ย.
      "care_growth", // ก.ค.
      "care_growth", // ส.ค.
      "care_growth", // ก.ย.
      "care_growth", // ต.ค.
      "care_growth", // พ.ย.
      "care_growth", // ธ.ค.
    ],
    plantingMonthsIndices: [3, 4], // เม.ย. - พ.ค.
    harvestMonthsIndices: [0, 1, 2], // ม.ค. - มี.ค.
    agronomicTipByPhase: {
      plant_optimal:
        "เริ่มปักท่อนพันธุ์เมื่อฝนแรกตกสะสมเกิน 65 มม. และความชื้นดินแตะ 30% ขึ้นไป",
      care_growth:
        "กำจัดวัชพืชช่วงอายุ 1–3 เดือน และทำร่องระบายน้ำป้องกันรากเน่าช่วงฝนชุกเดือน ก.ย.",
      harvest_peak:
        "เก็บเกี่ยวช่วงหน้าแล้ง (ม.ค.–มี.ค.) ซึ่งเป็นช่วงที่หัวมันมีเปอร์เซ็นต์เชื้อแป้งสูงสุดของปี",
      off_season: "พักแปลงหรือไถกลบตอซังเพิ่มอินทรียวัตถุ",
    },
  },
  {
    id: "jasmine_rice_gi",
    nameTh: "ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI / ข้าวนาปี",
    varietyNoteTh: "ขาวดอกมะลิ 105 · กข15 (ไวต่อช่วงแสง หอมนุ่มมาตรฐานโคราช)",
    categoryTh: "กลุ่มข้าวเศรษฐกิจ",
    minMoistureToPlantPct: 40,
    maxMoistureToPlantPct: 85,
    minMonthlyRainToPlantMm: 105,
    maxMonthlyRainToPlantMm: 350,
    waterRequirementMmPerCycle: "900–1,200 มม./ฤดู",
    expectedRevenuePerRaiBaht: 7850,
    baseMonthPhases: [
      "off_season", // ม.ค.
      "off_season", // ก.พ.
      "off_season", // มี.ค.
      "off_season", // เม.ย.
      "plant_optimal", // พ.ค.
      "plant_optimal", // มิ.ย.
      "plant_optimal", // ก.ค.
      "care_growth", // ส.ค.
      "care_growth", // ก.ย.
      "care_growth", // ต.ค.
      "harvest_peak", // พ.ย.
      "harvest_peak", // ธ.ค.
    ],
    plantingMonthsIndices: [4, 5, 6], // พ.ค. - ก.ค.
    harvestMonthsIndices: [10, 11], // พ.ย. - ธ.ค.
    agronomicTipByPhase: {
      plant_optimal:
        "เตรียมเทือกและหว่าน/ปักดำเมื่อฝนสะสมรายเดือนเกิน 105 มม. และความชื้นดิน ≥ 40%",
      care_growth:
        "ระยะแตกกอ–ตั้งท้อง–ออกรวง (ส.ค.–ต.ค.) ต้องรักษาระดับน้ำในกระทงนาและใส่ปุ๋ยรับรวงตามค่า N-P-K",
      harvest_peak:
        "เก็บเกี่ยวระยะพลับพลึง (พ.ย.–ธ.ค.) และลดความชื้นข้าวเปลือกไม่ให้เกิน 15% เพื่อได้ราคาสูงสุด",
      off_season:
        "หลังเก็บเกี่ยวแนะนำปลูกพืชตระกูลถั่วหลังนาหรือปอเทืองเพื่อตัดวงจรโรคและเพิ่มไนโตรเจน",
    },
  },
  {
    id: "maize_feed_2crops",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ (ระบบ 2 รุ่น ต้นฝน·ปลายฝน)",
    varietyNoteTh: "ลูกผสมเดี่ยวทนแล้ง (ระยะวิกฤตขาดน้ำคือช่วงออกดอกตัวผู้–แทงไหม)",
    categoryTh: "พืชไร่อายุสั้น",
    minMoistureToPlantPct: 33,
    maxMoistureToPlantPct: 60,
    minMonthlyRainToPlantMm: 75,
    maxMonthlyRainToPlantMm: 220,
    waterRequirementMmPerCycle: "450–600 มม./รอบ (110–120 วัน)",
    expectedRevenuePerRaiBaht: 11900,
    baseMonthPhases: [
      "off_season", // ม.ค.
      "off_season", // ก.พ.
      "off_season", // มี.ค.
      "plant_optimal", // เม.ย. (รุ่น 1 ต้นฝน)
      "plant_optimal", // พ.ค.
      "care_growth", // มิ.ย.
      "harvest_peak", // ก.ค.
      "plant_optimal", // ส.ค. (รุ่น 2 ปลายฝน)
      "care_growth", // ก.ย.
      "care_growth", // ต.ค.
      "harvest_peak", // พ.ย.
      "harvest_peak", // ธ.ค.
    ],
    plantingMonthsIndices: [3, 4, 7], // เม.ย.-พ.ค. และ ส.ค.
    harvestMonthsIndices: [6, 10, 11], // ก.ค. และ พ.ย.-ธ.ค.
    agronomicTipByPhase: {
      plant_optimal:
        "หยอดเมล็ดเมื่อความชื้นดิน ≥ 33% รุ่นต้นฝน (เม.ย.–พ.ค.) และรุ่นปลายฝน (ส.ค.) ให้พ้นช่วงฝนชุกตอนเก็บเกี่ยว",
      care_growth:
        "เฝ้าระวังหนอนกระทู้ข้าวโพดลายจุด (Fall Armyworm) และห้ามขาดน้ำเด็ดขาดในช่วงอายุ 50–65 วัน (แทงไหม)",
      harvest_peak:
        "เก็บเกี่ยวฝักแห้งความชื้นเมล็ด ≤ 14.5% ส่งโรงงานอาหารสัตว์สีคิ้ว/ปากช่องได้ราคาเต็มเกณฑ์",
      off_season: "พักดินและไถกลบต้นข้าวโพดสดหลังเก็บเกี่ยว",
    },
  },
  {
    id: "sugarcane_overland",
    nameTh: "อ้อยโรงงานตัดสด (ระบบอ้อยข้ามแล้งโคราช)",
    varietyNoteTh: "พันธุ์ขอนแก่น 3 · เค 88-92 (ความหวาน 12–14 CCS)",
    categoryTh: "พืชไร่อุตสาหกรรม",
    minMoistureToPlantPct: 34,
    maxMoistureToPlantPct: 65,
    minMonthlyRainToPlantMm: 50,
    maxMonthlyRainToPlantMm: 230,
    waterRequirementMmPerCycle: "1,100–1,400 มม./รอบปี",
    expectedRevenuePerRaiBaht: 19875,
    baseMonthPhases: [
      "harvest_peak", // ม.ค.
      "harvest_peak", // ก.พ.
      "harvest_peak", // มี.ค.
      "care_growth", // เม.ย.
      "care_growth", // พ.ค.
      "care_growth", // มิ.ย.
      "care_growth", // ก.ค.
      "care_growth", // ส.ค.
      "care_growth", // ก.ย.
      "plant_optimal", // ต.ค.
      "plant_optimal", // พ.ย.
      "harvest_peak", // ธ.ค.
    ],
    plantingMonthsIndices: [9, 10], // ต.ค. - พ.ย. (อ้อยข้ามแล้ง)
    harvestMonthsIndices: [11, 0, 1, 2], // ธ.ค. - มี.ค. (ฤดูหีบอ้อย)
    agronomicTipByPhase: {
      plant_optimal:
        "ปลูกอ้อยข้ามแล้งช่วง ต.ค.–พ.ย. อาศัยความชื้นดินปลายฝน 35–50% ให้รากอ้อยหยั่งลึกก่อนเข้าหน้าแล้ง",
      care_growth:
        "ระยะแตกกอและย่างปล้อง (พ.ค.–ก.ย.) ใส่ปุ๋ยเคมีร่วมกับโดโลไมท์และคลุมใบอ้อยรักษาความชื้น",
      harvest_peak:
        "ตัดอ้อยสดส่งโรงงานน้ำตาลพิมาย/ครบุรี/แก้งสนามนางช่วง ธ.ค.–มี.ค. รับเงินค่าความหวาน CCS และโบนัสอ้อยสด",
      off_season: "บำรุงตออ้อยหลังตัดและริใบ",
    },
  },
  {
    id: "drought_legumes",
    nameTh: "พืชตระกูลถั่วทนแล้งหลังนา (ถั่วหรั่ง · ถั่วเขียว · ถั่วลิสง)",
    varietyNoteTh: "ถั่วเขียว มทส.1 / ชัยนาท 84-1 · ถั่วหรั่งโคราช (ใช้น้ำน้อยเพียง 250 ลบ.ม./ไร่)",
    categoryTh: "พืชหลังนา·ทนแล้งพิเศษ",
    minMoistureToPlantPct: 22,
    maxMoistureToPlantPct: 52,
    minMonthlyRainToPlantMm: 10,
    maxMonthlyRainToPlantMm: 140,
    waterRequirementMmPerCycle: "220–300 มม./รอบ (65–85 วัน)",
    expectedRevenuePerRaiBaht: 5400,
    baseMonthPhases: [
      "harvest_peak", // ม.ค.
      "harvest_peak", // ก.พ.
      "off_season", // มี.ค.
      "off_season", // เม.ย.
      "off_season", // พ.ค.
      "off_season", // มิ.ย.
      "off_season", // ก.ค.
      "off_season", // ส.ค.
      "off_season", // ก.ย.
      "off_season", // ต.ค.
      "plant_optimal", // พ.ย.
      "plant_optimal", // ธ.ค.
    ],
    plantingMonthsIndices: [10, 11], // พ.ย. - ธ.ค.
    harvestMonthsIndices: [0, 1], // ม.ค. - ก.พ.
    agronomicTipByPhase: {
      plant_optimal:
        "ปลูกทันทีหลังเกี่ยวข้าวนาปี (พ.ย.–ธ.ค.) โดยใช้ความชื้นสะสมในดิน 25–45% ไม่ต้องใช้น้ำชลประทานมาก",
      care_growth:
        "พ่นปุ๋ยทางใบและแคลเซียม-โบรอนช่วงออกดอก ติดฝักไวและช่วยตรึงไนโตรเจนกลับคืนสู่ดิน 8–12 กก./ไร่",
      harvest_peak:
        "เก็บเกี่ยวฝักแห้งช่วง ม.ค.–ก.พ. สร้างรายได้เสริมช่วงแล้งและลดต้นทุนปุ๋ยนาปีฤดูถัดไป",
      off_season: "ไถกลบต้นถั่วเป็นปุ๋ยพืชสดชั้นดีให้แปลงนา",
    },
  },
  {
    id: "sweet_corn_vegetables",
    nameTh: "ข้าวโพดหวาน & พืชผักเศรษฐกิจฤดูหนาว-แล้ง",
    varietyNoteTh: "ข้าวโพดหวานสองสี · พริกโคราช · ผักสลัดวังน้ำเขียว-ปากช่อง (ระบบน้ำหยด)",
    categoryTh: "พืชมูลค่าสูง·ใช้น้ำหยด",
    minMoistureToPlantPct: 28,
    maxMoistureToPlantPct: 58,
    minMonthlyRainToPlantMm: 12,
    maxMonthlyRainToPlantMm: 165,
    waterRequirementMmPerCycle: "350–450 มม./รอบ (65–75 วัน · น้ำหยด)",
    expectedRevenuePerRaiBaht: 18500,
    baseMonthPhases: [
      "harvest_peak", // ม.ค.
      "harvest_peak", // ก.พ.
      "off_season", // มี.ค.
      "off_season", // เม.ย.
      "off_season", // พ.ค.
      "off_season", // มิ.ย.
      "off_season", // ก.ค.
      "off_season", // ส.ค.
      "off_season", // ก.ย.
      "plant_optimal", // ต.ค.
      "plant_optimal", // พ.ย.
      "care_growth", // ธ.ค.
    ],
    plantingMonthsIndices: [9, 10, 11], // ต.ค. - ธ.ค.
    harvestMonthsIndices: [11, 0, 1], // ธ.ค. - ก.พ.
    agronomicTipByPhase: {
      plant_optimal:
        "ปลูกช่วงปลายฝนต้นหนาว (ต.ค.–พ.ย.) อุณหภูมิ 20–30°C และความชื้นดิน 30–50% โรคแมลงน้อยที่สุด",
      care_growth:
        "ให้น้ำระบบเทปน้ำหยดร่วมกับปุ๋ยละลายน้ำ (Fertigation) ประหยัดน้ำได้มากกว่า 45%",
      harvest_peak:
        "เก็บเกี่ยวส่งตลาดสุรนารีและจุดรวบรวมผลผลิตช่วงเทศกาลปีใหม่–ตรุษจีน ได้ราคาสูง",
      off_season: "งดปลูกกลางฤดูฝนชุกเพื่อหลีกเลี่ยงโรคเน่าเละและแมลงศัตรูพืช",
    },
  },
  {
    id: "sunn_hemp_green_manure",
    nameTh: "ปอเทือง / พืชปุ๋ยสดปรับปรุงโครงสร้างดินโคราช",
    varietyNoteTh: "หว่านต้นฝนก่อนปลูกข้าวนาปีหรือมันสำปะหลัง (เพิ่มอินทรียวัตถุ OM)",
    categoryTh: "พืชบำรุงดิน·ลดต้นทุนปุ๋ย",
    minMoistureToPlantPct: 24,
    maxMoistureToPlantPct: 55,
    minMonthlyRainToPlantMm: 35,
    maxMonthlyRainToPlantMm: 160,
    waterRequirementMmPerCycle: "200–280 มม./รอบ (ไถกลบเมื่ออายุ 50 วัน)",
    expectedRevenuePerRaiBaht: 3200,
    baseMonthPhases: [
      "off_season", // ม.ค.
      "off_season", // ก.พ.
      "plant_optimal", // มี.ค.
      "plant_optimal", // เม.ย.
      "harvest_peak", // พ.ค. (ไถกลบระยะออกดอก)
      "off_season", // มิ.ย.
      "off_season", // ก.ค.
      "off_season", // ส.ค.
      "off_season", // ก.ย.
      "off_season", // ต.ค.
      "off_season", // พ.ย.
      "off_season", // ธ.ค.
    ],
    plantingMonthsIndices: [2, 3], // มี.ค. - เม.ย.
    harvestMonthsIndices: [4], // พ.ค. (ไถกลบหรือเก็บเมล็ดพันธุ์)
    agronomicTipByPhase: {
      plant_optimal:
        "หว่านเมล็ดปอเทือง 5 กก./ไร่ เมื่อมีฝนชะช่อมะม่วงเดือน มี.ค.–เม.ย. (ความชื้นดิน ≥ 24%)",
      care_growth: "เจริญเติบโตรวดเร็วโดยไม่ต้องใส่ปุ๋ยเคมี ช่วยคลุมดินลดการระเหยน้ำ",
      harvest_peak:
        "ไถกลบระยะออกดอกบาน 50% ในเดือน พ.ค. ช่วยเพิ่มไนโตรเจนและลดค่าปุ๋ยเคมีได้ 900–1,400 บาท/ไร่",
      off_season: "แปลงปลูกพืชเศรษฐกิจหลักตามฤดูกาล",
    },
  },
];

// Baseline 30-year monthly rainfall in Nakhon Ratchasima (mm)
const BASE_KORAT_MONTHLY_RAIN_MM = [10, 18, 44, 82, 158, 116, 124, 152, 232, 154, 36, 8];

export const SmartCropCalendarModule: React.FC<SmartCropCalendarModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const { isDark } = useTheme();
  // Find which Agro-Zone contains the currently selected district
  const matchedZoneForDistrict = useMemo(() => {
    return (
      KORAT_AGRO_ZONES.find((z) => z.districtIds.includes(selectedDistrict.id)) ||
      KORAT_AGRO_ZONES[0]
    );
  }, [selectedDistrict.id]);

  const [selectedZoneId, setSelectedZoneId] = useState<string>(matchedZoneForDistrict.id);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(9); // Default ต.ค. (Index 9)
  const [scopeMode, setScopeMode] = useState<"zone_avg" | "district_exact">("zone_avg");
  const [moistureScenarioDelta, setMoistureScenarioDelta] = useState<number>(0);
  const [rainScenarioPctDelta, setRainScenarioPctDelta] = useState<number>(0);

  // Sync zone when user changes district in header or map
  React.useEffect(() => {
    setSelectedZoneId(matchedZoneForDistrict.id);
  }, [matchedZoneForDistrict.id]);

  const activeZone = useMemo(() => {
    return KORAT_AGRO_ZONES.find((z) => z.id === selectedZoneId) || KORAT_AGRO_ZONES[0];
  }, [selectedZoneId]);

  // Districts belonging to the active zone
  const zoneDistricts = useMemo(() => {
    return KORAT_DISTRICTS.filter((d) => activeZone.districtIds.includes(d.id));
  }, [activeZone]);

  // Aggregate real-time telemetry from KORAT_DISTRICTS for the active zone (or exact selectedDistrict)
  const telemetryBaseline = useMemo(() => {
    const sourceList =
      scopeMode === "district_exact" ? [selectedDistrict] : zoneDistricts;
    const count = Math.max(1, sourceList.length);

    const avgSoilMoisturePct = Math.round(
      sourceList.reduce((acc, d) => acc + d.gistdaSoilMoisturePct, 0) / count
    );
    const avgForecastRain14dMm = Number(
      (sourceList.reduce((acc, d) => acc + d.forecastRain14dMm, 0) / count).toFixed(1)
    );
    const avgNormalRain30dMm = Math.round(
      sourceList.reduce((acc, d) => acc + d.normalRain30dMm, 0) / count
    );
    const avgSpi30d = Number(
      (sourceList.reduce((acc, d) => acc + d.spi30d, 0) / count).toFixed(2)
    );

    return {
      avgSoilMoisturePct,
      avgForecastRain14dMm,
      avgNormalRain30dMm,
      avgSpi30d,
      districtCount: count,
    };
  }, [scopeMode, selectedDistrict, zoneDistricts]);

  // Build 12-Month Soil Moisture (%) and Accumulated Rainfall (mm) Series from system data
  const monthlyAgroClimateSeries = useMemo(() => {
    const rainScale =
      (telemetryBaseline.avgNormalRain30dMm / 152) *
      (1 + telemetryBaseline.avgSpi30d * 0.12) *
      (1 + rainScenarioPctDelta / 100);

    return THAI_MONTHS_SHORT.map((monthShort, mIdx) => {
      const baseRain = BASE_KORAT_MONTHLY_RAIN_MM[mIdx];
      const zoneMult = activeZone.seasonalRainMultipliers[mIdx];
      const rainMm = Math.max(
        2,
        Math.round(baseRain * zoneMult * rainScale)
      );

      const rawMoisture =
        telemetryBaseline.avgSoilMoisturePct +
        activeZone.seasonalMoistureOffsets[mIdx] +
        moistureScenarioDelta;
      const soilMoisturePct = Math.min(78, Math.max(14, Math.round(rawMoisture)));

      return {
        monthIdx: mIdx,
        monthShort,
        monthFull: THAI_MONTHS_FULL[mIdx],
        rainMm,
        soilMoisturePct,
        optimalMoistureFloor: 32,
      };
    });
  }, [activeZone, moistureScenarioDelta, rainScenarioPctDelta, telemetryBaseline]);

  const focusedMonthClimate =
    monthlyAgroClimateSeries[selectedMonthIdx] || monthlyAgroClimateSeries[9];

  // Evaluate all 8 Crops for the Selected Month & across all 12 Months using Soil Moisture + Rainfall
  const evaluatedCropsForMonth = useMemo(() => {
    const mRain = focusedMonthClimate.rainMm;
    const mMoist = focusedMonthClimate.soilMoisturePct;

    return KORAT_SMART_CALENDAR_CROPS.map((crop) => {
      const basePhase = crop.baseMonthPhases[selectedMonthIdx];

      // Check if soil moisture and monthly rainfall meet the crop's planting threshold
      const moistureReady =
        mMoist >= crop.minMoistureToPlantPct && mMoist <= crop.maxMoistureToPlantPct;
      const rainReady =
        mRain >= crop.minMonthlyRainToPlantMm && mRain <= crop.maxMonthlyRainToPlantMm;

      // Compute dynamic Suitability Score (0 - 100)
      let suitabilityScore = 50;
      let statusBadgeTh = "ระยะดูแลบำรุงรักษา";
      let statusColor: "teal" | "amber" | "sky" | "red" = "sky";
      let moistureDiagnosisTh = "";

      if (basePhase === "plant_optimal") {
        if (moistureReady && rainReady) {
          suitabilityScore = Math.min(
            98,
            84 + Math.round((mMoist - crop.minMoistureToPlantPct) * 0.5)
          );
          statusBadgeTh = "เหมาะสมสูงสุด · แนะนำเริ่มปลูกเดือนนี้";
          statusColor = "teal";
          moistureDiagnosisTh = `ความชื้นดิน ${mMoist}% และฝนสะสม ${mRain} มม. อยู่ในเกณฑ์เหมาะสม (${crop.minMoistureToPlantPct}–${crop.maxMoistureToPlantPct}%)`;
        } else if (mMoist < crop.minMoistureToPlantPct) {
          suitabilityScore = Math.max(35, 62 - (crop.minMoistureToPlantPct - mMoist) * 2);
          statusBadgeTh = "อยู่ในฤดูปลูก · แต่ความชื้นดินยังต่ำกว่าเกณฑ์";
          statusColor = "amber";
          moistureDiagnosisTh = `ความชื้นดินปัจจุบัน ${mMoist}% ต่ำกว่าเกณฑ์เริ่มปลูก (${crop.minMoistureToPlantPct}%) ควรรอฝนเพิ่มหรือให้น้ำเสริม`;
        } else {
          suitabilityScore = 68;
          statusBadgeTh = "อยู่ในฤดูปลูก · ระวังดินแฉะ/ฝนชุกเกิน";
          statusColor = "amber";
          moistureDiagnosisTh = `ฝนสะสม ${mRain} มม. ค่อนข้างสูง ควรยกร่องระบายน้ำก่อนปลูก`;
        }
      } else if (basePhase === "harvest_peak") {
        suitabilityScore = 90;
        statusBadgeTh = "ระยะเก็บเกี่ยวผลผลิต / ตัดจำหน่าย";
        statusColor = "amber";
        moistureDiagnosisTh = `สภาพอากาศเอื้อต่อการเก็บเกี่ยว (ความชื้นดิน ${mMoist}% · ฝน ${mRain} มม.)`;
      } else if (basePhase === "care_growth") {
        suitabilityScore = mMoist >= crop.minMoistureToPlantPct - 5 ? 78 : 54;
        statusBadgeTh =
          mMoist >= crop.minMoistureToPlantPct - 5
            ? "ระยะเจริญเติบโต · ความชื้นดินเพียงพอ"
            : "ระยะเจริญเติบโต · เฝ้าระวังขาดน้ำ";
        statusColor = mMoist >= crop.minMoistureToPlantPct - 5 ? "sky" : "amber";
        moistureDiagnosisTh = `ความชื้นดิน ${mMoist}% สำหรับการสะสมผลผลิตในแปลง`;
      } else {
        // off_season
        suitabilityScore = 24;
        statusBadgeTh = "นอกฤดูเริ่มปลูก · แนะนำพักดิน/เตรียมแปลง";
        statusColor = "red";
        moistureDiagnosisTh = `ความชื้นดิน ${mMoist}% และฝน ${mRain} มม. ไม่ตรงช่วงฤดูเริ่มเพาะปลูกหลักของพืชนี้`;
      }

      return {
        crop,
        basePhase,
        moistureReady,
        rainReady,
        suitabilityScore,
        statusBadgeTh,
        statusColor,
        moistureDiagnosisTh,
        adviceText: crop.agronomicTipByPhase[basePhase],
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }, [focusedMonthClimate, selectedMonthIdx]);

  const annualRainTotalMm = useMemo(
    () => monthlyAgroClimateSeries.reduce((sum, m) => sum + m.rainMm, 0),
    [monthlyAgroClimateSeries]
  );

  return (
    <section
      aria-label="ปฏิทินเพาะปลูกอัจฉริยะรายเดือนและรายโซน จังหวัดนครราชสีมา"
      className={`border rounded-2xl shadow-lg p-5 sm:p-7 space-y-6 transition-colors ${
        isDark
          ? "bg-[#0B101D] border-[#1E293B]"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Top Section Header */}
      <div className={`flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b pb-5 transition-colors ${
        isDark ? "border-[#1E293B]" : "border-slate-200"
      }`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-md border ${
                isDark
                  ? "text-[#2DD4BF] bg-[#14B8A6]/15 border-[#14B8A6]/40"
                  : "text-teal-800 bg-teal-50 border-teal-300"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Smart Agro-Ecological Crop Calendar · 5 โซนนิเวศเกษตรโคราช</span>
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              คำนวณอัตโนมัติจากค่าความชื้นดิน GISTDA และปริมาณฝนสะสมรายเดือน
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            ปฏิทินเพาะปลูกอัจฉริยะรายเดือน แนะนำพืชเหมาะสมตามความชื้นดินและฝนสะสมรายโซน
          </h2>
        </div>

        {/* Scope Mode Switcher: Zone Aggregate vs Active Selected District */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            className={`inline-flex items-center p-1 rounded-xl border transition-colors ${
              isDark
                ? "bg-[#080C16] border-[#1E293B]"
                : "bg-slate-100 border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setScopeMode("zone_avg")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                scopeMode === "zone_avg"
                  ? isDark
                    ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-xs"
                    : "bg-teal-700 text-white font-bold shadow-xs"
                  : isDark
                  ? "text-slate-300 hover:text-white font-medium"
                  : "text-slate-700 hover:text-slate-950 font-medium"
              }`}
            >
              วิเคราะห์ระดับโซน ({activeZone.districtIds.length} อำเภอ)
            </button>
            <button
              type="button"
              onClick={() => setScopeMode("district_exact")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                scopeMode === "district_exact"
                  ? isDark
                    ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-xs"
                    : "bg-teal-700 text-white font-bold shadow-xs"
                  : isDark
                  ? "text-slate-300 hover:text-white font-medium"
                  : "text-slate-700 hover:text-slate-950 font-medium"
              }`}
            >
              เจาะจง {formatDistrictName(selectedDistrict.nameTh)}
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: 5 Agro-Ecological Zone Selector Cards + District Quick Filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>1. เลือกโซนนิเวศเกษตรในจังหวัดนครราชสีมา (คลิกเพื่อสลับโซนวิเคราะห์)</span>
          </div>
          <div className="text-xs text-slate-400">
            อำเภอในโซนที่เลือก:{" "}
            <strong className="text-white">
              {zoneDistricts.map((d) => d.nameTh.replace(/^อ\./, "")).join(" · ")}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {KORAT_AGRO_ZONES.map((zone) => {
            const isSelected = zone.id === activeZone.id;
            const zDists = KORAT_DISTRICTS.filter((d) => zone.districtIds.includes(d.id));
            const zAvgMoist = Math.round(
              zDists.reduce((s, d) => s + d.gistdaSoilMoisturePct, 0) /
                Math.max(1, zDists.length)
            );
            const zAvgRain14d = (
              zDists.reduce((s, d) => s + d.forecastRain14dMm, 0) /
              Math.max(1, zDists.length)
            ).toFixed(0);

            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  setSelectedZoneId(zone.id);
                  if (!zone.districtIds.includes(selectedDistrict.id) && zone.districtIds[0]) {
                    onSelectDistrict(zone.districtIds[0]);
                  }
                }}
                className={`text-left rounded-xl p-3.5 border transition-all flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? "bg-[#141E36] border-[#2DD4BF] shadow-[0_0_16px_rgba(45,212,191,0.16)]"
                    : "bg-[#080C16] border-[#1E293B] hover:border-[#6366F1]/60 hover:bg-[#101728]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-[#2DD4BF]" : "text-[#FBBF24]"
                      }`}
                    >
                      {zone.districtIds.length} อำเภอ
                    </span>
                    <span className="text-slate-400">ความชื้น {zAvgMoist}%</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                    {zone.shortNameTh}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>🌧️ ฝน 14d: {zAvgRain14d} มม.</span>
                  <span className={isSelected ? "text-[#2DD4BF] font-bold" : "text-slate-400"}>
                    {isSelected ? "กำลังเลือก" : "ดูปฏิทิน"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* District Pills inside the Active Zone */}
        <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>อำเภอใน{activeZone.shortNameTh}:</span>
            </span>
            {zoneDistricts.map((d) => {
              const isDistActive = d.id === selectedDistrict.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSelectDistrict(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isDistActive
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                      : "bg-[#111827] text-slate-300 border border-[#1E293B] hover:border-[#2DD4BF]/50 hover:text-white"
                  }`}
                >
                  {d.nameTh.replace(/^อ\./, "")} ({d.gistdaSoilMoisturePct}%)
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#FBBF24] font-mono">
            ชุดดินเด่น: {selectedDistrict.soilSeriesName}
          </div>
        </div>
      </div>

      {/* Step 2: 12-Month Selector Ribbon & What-If Moisture/Rain Telemetry Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 8 Cols: 12-Month Interactive Selector Ribbon */}
        <div className="lg:col-span-8 bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
              2. เลือกเดือนที่ต้องการวางแผนเพาะปลูก (ม.ค. – ธ.ค.)
            </span>
            <span className="text-xs font-mono text-slate-300">
              เดือนที่เลือก: <strong className="text-[#FBBF24]">{focusedMonthClimate.monthFull}</strong> ·
              ความชื้นดินคาดการณ์{" "}
              <strong className="text-[#2DD4BF]">{focusedMonthClimate.soilMoisturePct}%</strong> ·
              ฝนสะสม <strong className="text-[#38BDF8]">{focusedMonthClimate.rainMm} มม.</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-12 gap-1.5">
            {monthlyAgroClimateSeries.map((m) => {
              const isSelected = m.monthIdx === selectedMonthIdx;
              const isWet = m.rainMm >= 100;
              const isDry = m.soilMoisturePct < 28;
              return (
                <button
                  key={m.monthShort}
                  type="button"
                  onClick={() => setSelectedMonthIdx(m.monthIdx)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? "bg-[#14B8A6] text-[#041E1C] border-[#2DD4BF] font-bold shadow-[0_0_14px_rgba(20,184,166,0.3)]"
                      : "bg-[#0E1525] text-slate-200 border-[#1E293B] hover:border-[#2DD4BF]/50"
                  }`}
                >
                  <span className="text-xs font-bold">{m.monthShort}</span>
                  <span
                    className={`text-[10px] font-mono tabular-nums mt-1 ${
                      isSelected
                        ? "text-[#041E1C] font-bold"
                        : isWet
                        ? "text-[#38BDF8]"
                        : isDry
                        ? "text-[#FBBF24]"
                        : "text-[#2DD4BF]"
                    }`}
                  >
                    💧{m.soilMoisturePct}%
                  </span>
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      isSelected ? "text-[#041E1C]" : "text-slate-400"
                    }`}
                  >
                    {m.rainMm}มม.
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Real-Time Soil Moisture & Rainfall Simulation Offset */}
        <div className="lg:col-span-4 bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>จำลองความชื้นดิน &amp; ฝนสะสมเปลี่ยนไป</span>
            </span>
            {(moistureScenarioDelta !== 0 || rainScenarioPctDelta !== 0) && (
              <button
                type="button"
                onClick={() => {
                  setMoistureScenarioDelta(0);
                  setRainScenarioPctDelta(0);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#2DD4BF] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>คืนค่าจริงระบบ</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-slate-300 font-sans">ปรับเพิ่ม/ลดความชื้นดิน:</span>
                <span className="text-[#2DD4BF] font-bold">
                  {moistureScenarioDelta > 0
                    ? `+${moistureScenarioDelta}%`
                    : `${moistureScenarioDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={moistureScenarioDelta}
                onChange={(e) => setMoistureScenarioDelta(Number(e.target.value))}
                aria-label="จำลองการเปลี่ยนแปลงความชื้นดิน"
                className="w-full accent-[#14B8A6]"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-slate-300 font-sans">ปรับความคลาดเคลื่อนฝนสะสม:</span>
                <span className="text-[#38BDF8] font-bold">
                  {rainScenarioPctDelta > 0
                    ? `+${rainScenarioPctDelta}%`
                    : `${rainScenarioPctDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min={-35}
                max={35}
                step={5}
                value={rainScenarioPctDelta}
                onChange={(e) => setRainScenarioPctDelta(Number(e.target.value))}
                aria-label="จำลองการเปลี่ยนแปลงปริมาณฝนสะสม"
                className="w-full accent-[#14B8A6]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Monthly Crop Suitability Cards (Sorted by Suitability Score for Selected Month & Zone) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#2DD4BF]" />
              <span>
                คำแนะนำพืชเศรษฐกิจประจำเดือน{focusedMonthClimate.monthFull} สำหรับ{activeZone.shortNameTh}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              จัดลำดับความเหมาะสมอัตโนมัติจากค่าความชื้นดิน ({focusedMonthClimate.soilMoisturePct}%) และปริมาณฝนสะสม ({focusedMonthClimate.rainMm} มม.) ของพื้นที่
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF]">
              แนะนำเริ่มปลูก:{" "}
              {evaluatedCropsForMonth.filter((c) => c.basePhase === "plant_optimal").length} ชนิด
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24]">
              ระยะเก็บเกี่ยว:{" "}
              {evaluatedCropsForMonth.filter((c) => c.basePhase === "harvest_peak").length} ชนิด
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {evaluatedCropsForMonth.map((item) => {
            const borderAndBg =
              item.statusColor === "teal"
                ? "bg-[#080C16] border-[#2DD4BF]/70 shadow-[0_0_20px_rgba(45,212,191,0.12)]"
                : item.statusColor === "amber"
                ? "bg-[#080C16] border-[#F59E0B]/60"
                : item.statusColor === "sky"
                ? "bg-[#080C16] border-[#38BDF8]/45"
                : "bg-[#080C16] border-[#1E293B] opacity-85";

            const badgeClass =
              item.statusColor === "teal"
                ? "bg-[#14B8A6]/20 text-[#2DD4BF] border-[#14B8A6]/50"
                : item.statusColor === "amber"
                ? "bg-[#F59E0B]/20 text-[#FBBF24] border-[#F59E0B]/50"
                : item.statusColor === "sky"
                ? "bg-sky-500/20 text-[#38BDF8] border-sky-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700";

            return (
              <div
                key={item.crop.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${borderAndBg}`}
              >
                <div className="space-y-2">
                  {/* Top Badge + Score */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeClass}`}
                    >
                      {item.statusColor === "teal" ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : item.statusColor === "amber" ? (
                        <Sun className="w-3 h-3 shrink-0" />
                      ) : (
                        <Droplets className="w-3 h-3 shrink-0" />
                      )}
                      <span>{item.statusBadgeTh}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2DD4BF]">
                      {item.suitabilityScore}/100
                    </span>
                  </div>

                  {/* Crop Title & Variety */}
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {item.crop.nameTh}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.crop.varietyNoteTh}
                    </div>
                  </div>

                  {/* Soil Moisture & Rainfall Requirement Match Bar */}
                  <div className="bg-[#0E1525] border border-[#1E293B] rounded-xl p-2.5 text-[11px] space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">ความชื้นดินที่ต้องการ:</span>
                      <span
                        className={
                          item.moistureReady ? "text-[#2DD4BF] font-bold" : "text-[#FBBF24]"
                        }
                      >
                        {item.crop.minMoistureToPlantPct}–{item.crop.maxMoistureToPlantPct}% (มี{" "}
                        {focusedMonthClimate.soilMoisturePct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">น้ำฝนเริ่มปลูก:</span>
                      <span
                        className={
                          item.rainReady ? "text-[#38BDF8] font-bold" : "text-slate-300"
                        }
                      >
                        ≥ {item.crop.minMonthlyRainToPlantMm} มม. (มี {focusedMonthClimate.rainMm}{" "}
                        มม.)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#1E293B]/80">
                      <span className="text-slate-400 font-sans">รายได้คาดการณ์:</span>
                      <span className="text-[#FBBF24] font-bold">
                        ~฿{item.crop.expectedRevenuePerRaiBaht.toLocaleString("th-TH")}/ไร่
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agronomic Recommendation Footer */}
                <div className="pt-2 border-t border-[#1E293B] space-y-1.5 text-xs">
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-[#2DD4BF]">วิเคราะห์สภาพดิน-น้ำ:</strong>{" "}
                    {item.moistureDiagnosisTh}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-[#FBBF24]">คำแนะนำ:</strong> {item.adviceText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 4: 12-Month Gantt Crop Calendar Matrix (8 Crops x 12 Months) + Agro-Climate Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Interactive 12-Month Gantt Calendar Matrix */}
        <div className="xl:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                ตารางปฏิทินเพาะปลูก 12 เดือน (ม.ค. – ธ.ค.) ประจำ{activeZone.shortNameTh}
              </h3>
              <p className="text-xs text-slate-400">
                คลิกที่หัวคอลัมน์เดือนเพื่อดูความเหมาะสมรายเดือนตามค่าความชื้นดินและฝนสะสม
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
              <span className="inline-flex items-center gap-1 text-[#2DD4BF]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#14B8A6]" />
                <span>เริ่มปลูก</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[#38BDF8]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]" />
                <span>บำรุงดูแล</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[#FBBF24]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />
                <span>เก็บเกี่ยว</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-300">
                  <th className="py-2 pr-3 font-semibold min-w-[165px]">
                    ชนิดพืชเศรษฐกิจโคราช
                  </th>
                  {THAI_MONTHS_SHORT.map((mName, mIdx) => {
                    const isFocused = mIdx === selectedMonthIdx;
                    return (
                      <th
                        key={mName}
                        onClick={() => setSelectedMonthIdx(mIdx)}
                        className={`py-2 px-1 text-center font-mono cursor-pointer rounded-t-lg transition-colors ${
                          isFocused
                            ? "bg-[#14B8A6]/20 text-[#2DD4BF] font-bold"
                            : "hover:text-white"
                        }`}
                      >
                        {mName}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/70">
                {KORAT_SMART_CALENDAR_CROPS.map((crop) => (
                  <tr key={crop.id} className="hover:bg-[#111827]/70">
                    <td className="py-2.5 pr-3 font-medium text-white">
                      <div className="truncate max-w-[185px]" title={crop.nameTh}>
                        {crop.nameTh}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        ชื้น ≥ {crop.minMoistureToPlantPct}% · ฝน ≥ {crop.minMonthlyRainToPlantMm}มม.
                      </div>
                    </td>
                    {crop.baseMonthPhases.map((phase, mIdx) => {
                      const isFocused = mIdx === selectedMonthIdx;
                      const mClimate = monthlyAgroClimateSeries[mIdx];
                      const isMoistureOk =
                        mClimate.soilMoisturePct >= crop.minMoistureToPlantPct;

                      const cellStyle =
                        phase === "plant_optimal"
                          ? isMoistureOk
                            ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                            : "bg-[#14B8A6]/40 text-white border border-[#FBBF24]"
                          : phase === "harvest_peak"
                          ? "bg-[#F59E0B] text-slate-950 font-bold"
                          : phase === "care_growth"
                          ? "bg-[#0284C7]/60 text-sky-100"
                          : "bg-[#0E1525] text-slate-600";

                      const cellSymbol =
                        phase === "plant_optimal"
                          ? "ปลูก"
                          : phase === "harvest_peak"
                          ? "เกี่ยว"
                          : phase === "care_growth"
                          ? "ดูแล"
                          : "·";

                      return (
                        <td
                          key={`${crop.id}-${mIdx}`}
                          onClick={() => setSelectedMonthIdx(mIdx)}
                          className={`p-1 text-center cursor-pointer ${
                            isFocused ? "bg-[#141E36]" : ""
                          }`}
                        >
                          <div
                            className={`py-1 px-0.5 rounded text-[10px] font-mono transition-transform ${cellStyle} ${
                              isFocused ? "ring-1 ring-white scale-105" : ""
                            }`}
                          >
                            {cellSymbol}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#0E1525] border border-[#1E293B] rounded-xl p-3 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="text-[#2DD4BF]">จุดเด่น{activeZone.shortNameTh}:</strong>{" "}
              {activeZone.signatureAdvantage}
            </div>
            <span className="font-mono text-[#FBBF24] whitespace-nowrap">
              ฝนสะสมทั้งปี ~{annualRainTotalMm.toLocaleString("th-TH")} มม.
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Recharts 12-Month Soil Moisture (%) & Accumulated Rainfall (mm) Curve */}
        <div className="xl:col-span-5 bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>กราฟสมดุลความชื้นดิน (%) และปริมาณฝนสะสมรายเดือน (12 เดือน)</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {scopeMode === "district_exact"
                  ? `ข้อมูลพื้นที่ ${selectedDistrict.nameTh}`
                  : activeZone.nameTh}
              </h4>
            </div>
          </div>

          <div className="h-[250px] w-full bg-[#060911] border border-[#1E293B] rounded-xl p-2.5">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyAgroClimateSeries}
                margin={{ top: 12, right: 10, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="monthShort"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="rain"
                  tick={{ fill: "#38BDF8", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  axisLine={false}
                  tickLine={false}
                  unit="มม."
                />
                <YAxis
                  yAxisId="moisture"
                  orientation="right"
                  domain={[0, 85]}
                  tick={{ fill: "#2DD4BF", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B101D",
                    borderColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <ReferenceLine
                  yAxisId="moisture"
                  y={32}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  label={{
                    value: "เกณฑ์ความชื้นดินเริ่มปลูก (32%)",
                    position: "insideTopLeft",
                    fill: "#FBBF24",
                    fontSize: 10,
                  }}
                />
                <Bar
                  yAxisId="rain"
                  dataKey="rainMm"
                  name="ปริมาณฝนสะสม (มม.)"
                  fill="#0284C7"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={26}
                />
                <Line
                  yAxisId="moisture"
                  type="monotone"
                  dataKey="soilMoisturePct"
                  name="ความชื้นดิน GISTDA (%)"
                  stroke="#2DD4BF"
                  strokeWidth={2.8}
                  dot={{ r: 3.5, fill: "#14B8A6" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Telemetry Readout Footer */}
          <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-sans">ความชื้นดินปัจจุบัน</div>
              <div className="text-base font-bold text-[#2DD4BF] mt-0.5">
                {telemetryBaseline.avgSoilMoisturePct}%
              </div>
            </div>
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-sans">ฝนคาดการณ์ 14 วัน</div>
              <div className="text-base font-bold text-[#38BDF8] mt-0.5">
                {telemetryBaseline.avgForecastRain14dMm} มม.
              </div>
            </div>
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-sans">ดรรชนี SPI เฉลี่ยโซน</div>
              <div className="text-base font-bold text-[#FBBF24] mt-0.5">
                {telemetryBaseline.avgSpi30d}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
