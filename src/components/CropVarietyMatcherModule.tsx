import React, { useState, useMemo, useEffect, useCallback } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  ClimateTimeSliceMode,
  CROP_VARIETY_SPECS,
  computeDistrictMicroclimate,
} from "./ClimateHeatmapModule";
import {
  Sparkles,
  Sprout,
  ThermometerSun,
  Droplets,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Compass,
  SlidersHorizontal,
  RefreshCw,
  Layers,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
  Cpu,
} from "lucide-react";

export type CropFamilyId = "rice" | "cassava" | "maize" | "sugarcane_fruit";

export interface CropVarietyCandidateSpec {
  id: string;
  familyId: CropFamilyId;
  familyLabelTh: string;
  nameTh: string;
  varietyCode: string;
  breederSourceTh: string;
  maturityDaysLabel: string;
  optimalGroundTempMinC: number;
  optimalGroundTempMaxC: number;
  optimalHumidityMinPct: number;
  optimalHumidityMaxPct: number;
  optimalVpdMinKpa: number;
  optimalVpdMaxKpa: number;
  optimalSoilPhMin: number;
  optimalSoilPhMax: number;
  basePotentialYieldPerRai: number;
  maxPotentialYieldPerRai: number;
  yieldUnitTh: string;
  farmgatePricePerUnitThb: number;
  qualityAttributeTh: string;
  preferredZones: string[];
  keyStrengthTh: string;
  climateRiskNoteTh: string;
  microclimateManagementTipTh: string;
}

export const KORAT_CROP_VARIETY_CATALOG: CropVarietyCandidateSpec[] = [
  // ===========================================================================
  // 1. ข้าวหอมมะลิและข้าวคุณภาพ (Jasmine & Specialty Rice Varieties)
  // ===========================================================================
  {
    id: "rice_kdml105_gi",
    familyId: "rice",
    familyLabelTh: "ข้าวหอมมะลิและข้าวคุณภาพ",
    nameTh: "ข้าวหอมมะลิ 105 (ทุ่งสัมฤทธิ์ GI · KDML 105)",
    varietyCode: "KDML 105 GI",
    breederSourceTh: "กรมการข้าว · สิ่งบ่งชี้ทางภูมิศาสตร์โคราช",
    maturityDaysLabel: "ไวต่อช่วงแสง (เก็บเกี่ยว 15–25 พ.ย.)",
    optimalGroundTempMinC: 24.5,
    optimalGroundTempMaxC: 30.8,
    optimalHumidityMinPct: 64,
    optimalHumidityMaxPct: 82,
    optimalVpdMinKpa: 0.7,
    optimalVpdMaxKpa: 1.45,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 7.0,
    basePotentialYieldPerRai: 560,
    maxPotentialYieldPerRai: 760,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 16.4,
    qualityAttributeTh: "สารหอม 2-AP สูงสุด เมล็ดเรียวยาว นุ่มหอมพิเศษ",
    preferredZones: ["โซนทุ่งสัมฤทธิ์-เหนือ", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    keyStrengthTh:
      "สร้างสารหอม 2-AP สูงสุดเมื่อกระทบอากาศเย็นต้น พ.ย. (24–28°C) ทนดินเค็มน้อย-ปานกลางในแอ่งทุ่งสัมฤทธิ์ได้ดีเยี่ยม",
    climateRiskNoteTh:
      "หากฝนทิ้งช่วงเร็วในพื้นที่ดอนก่อนกลางเดือน พ.ย. เมล็ดจะลีบง่าย และหากความชื้นเกิน 85% เสี่ยงโรคไหม้คอรวง",
    microclimateManagementTipTh:
      "รักษาระดับน้ำในนา 5–7 ซม. ช่วงตั้งท้อง-ออกรวงเพื่อพยุงอุณหภูมิผิวดินไม่ให้เกิน 31°C และระบายน้ำออก 12 วันก่อนเกี่ยว",
  },
  {
    id: "rice_rd15_early",
    familyId: "rice",
    familyLabelTh: "ข้าวหอมมะลิและข้าวคุณภาพ",
    nameTh: "ข้าวหอมมะลิ กข15 (RD15 · อายุสั้นหนีแล้งปลายฤดู)",
    varietyCode: "RD15 (กข15)",
    breederSourceTh: "ศูนย์วิจัยข้าวพิมาย / กรมการข้าว",
    maturityDaysLabel: "ไวต่อช่วงแสง (เก็บเกี่ยวเร็ว 1–10 พ.ย.)",
    optimalGroundTempMinC: 25.0,
    optimalGroundTempMaxC: 32.5,
    optimalHumidityMinPct: 56,
    optimalHumidityMaxPct: 78,
    optimalVpdMinKpa: 0.8,
    optimalVpdMaxKpa: 1.65,
    optimalSoilPhMin: 5.2,
    optimalSoilPhMax: 7.2,
    basePotentialYieldPerRai: 590,
    maxPotentialYieldPerRai: 790,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 15.9,
    qualityAttributeTh: "คุณภาพหุงต้มใกล้เคียง KDML 105 เก็บเกี่ยวเร็วขึ้น 12–15 วัน",
    preferredZones: ["โซนโคก-โนนตอนเหนือ", "โซนตะวันตก-เหนือ", "โซนทุ่งสัมฤทธิ์-เหนือ"],
    keyStrengthTh:
      "ออกรวงและเก็บเกี่ยวเร็วกว่าขาวดอกมะลิ 105 ประมาณ 12–15 วัน จึงหนีภาวะความชื้นดินลดฮวบในนาดอนโซนบัวใหญ่–คง–บ้านเหลื่อมได้ทัน",
    climateRiskNoteTh:
      "ไม่ทนน้ำท่วมขังลึก และต้องการแสงแดดจัดช่วงตากเมล็ดต้นเดือนพฤศจิกายน",
    microclimateManagementTipTh:
      "เหมาะสำหรับแปลงนาดอนที่ความชื้นดิน GISTDA ลดต่ำกว่า 55% เร็วหลังเดือนตุลาคม เสริมปุ๋ยโพแทสเซียมระยะรับรวง",
  },
  {
    id: "rice_rd43_lowgi",
    familyId: "rice",
    familyLabelTh: "ข้าวหอมมะลิและข้าวคุณภาพ",
    nameTh: "ข้าว กข43 (RD43 · ดัชนีน้ำตาลต่ำ อายุสั้น 95 วัน)",
    varietyCode: "RD43 (Low-GI)",
    breederSourceTh: "กรมการข้าว · ตลาดข้าวสุขภาพมูลค่าสูง",
    maturityDaysLabel: "ไม่ไวต่อช่วงแสง (อายุ 95 วัน)",
    optimalGroundTempMinC: 23.5,
    optimalGroundTempMaxC: 31.2,
    optimalHumidityMinPct: 62,
    optimalHumidityMaxPct: 80,
    optimalVpdMinKpa: 0.7,
    optimalVpdMaxKpa: 1.4,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 6.8,
    basePotentialYieldPerRai: 680,
    maxPotentialYieldPerRai: 890,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 14.8,
    qualityAttributeTh: "ข้าวนุ่มดัชนีน้ำตาลต่ำ (Low Glycemic Index) ตลาดโรงพยาบาล/คนรักสุขภาพ",
    preferredZones: ["โซนกลาง-ลุ่มน้ำลำตะคอง", "โซนใต้-ดงพญาเย็น"],
    keyStrengthTh:
      "อายุสั้นเพียง 95 วัน ต้นเตี้ยไม่ล้มง่าย ให้ผลผลิตต่อไร่สูงในเขตคลองส่งน้ำชลประทานลำตะคองและลำพระเพลิง",
    climateRiskNoteTh:
      "ต้องมีแหล่งน้ำชลประทานหรือสระน้ำประจำไร่นาช่วยหล่อเลี้ยง ไม่เหมาะกับนาดอนอาศัยน้ำฝนอย่างเดียว",
    microclimateManagementTipTh:
      "ทำนาแบบเปียกสลับแห้ง (AWD) เพื่อลดอุณหภูมิน้ำในแปลงและกระตุ้นรากข้าวให้แข็งแรง",
  },
  {
    id: "rice_rd85_highyield",
    familyId: "rice",
    familyLabelTh: "ข้าวหอมมะลิและข้าวคุณภาพ",
    nameTh: "ข้าว กข85 (RD85 · ข้าวพื้นนุ่มผลผลิตสูงพิเศษ ทนอากาศแปรปรวน)",
    varietyCode: "RD85 (High-Yield)",
    breederSourceTh: "กรมการข้าว",
    maturityDaysLabel: "ไม่ไวต่อช่วงแสง (อายุ 115–120 วัน)",
    optimalGroundTempMinC: 22.0,
    optimalGroundTempMaxC: 31.5,
    optimalHumidityMinPct: 60,
    optimalHumidityMaxPct: 82,
    optimalVpdMinKpa: 0.65,
    optimalVpdMaxKpa: 1.5,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 7.0,
    basePotentialYieldPerRai: 780,
    maxPotentialYieldPerRai: 1040,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 12.2,
    qualityAttributeTh: "ผลผลิตต่อไร่สูงสุด (850–1,040 กก./ไร่) ทนอากาศเย็นและต้านทานโรคขอบใบแห้ง",
    preferredZones: ["โซนกลาง-ลุ่มน้ำลำตะคอง", "โซนทุ่งสัมฤทธิ์-เหนือ", "โซนใต้-ดงพญาเย็น"],
    keyStrengthTh:
      "ทนต่อสภาพอากาศเย็นในฤดูนาปรังและอุณหภูมิแกว่งตัวได้ดี ให้ผลผลิตน้ำหนักต่อไร่สูงสุดในพื้นที่ชลประทาน",
    climateRiskNoteTh:
      "ระวังเพลี้ยกระโดดสีน้ำตาลในแปลงที่ใส่ปุ๋ยไนโตรเจนสูงเกินไปและอากาศอับชื้น",
    microclimateManagementTipTh:
      "เว้นระยะห่างกอ 25x25 ซม. ให้ลมพัดผ่านเรือนยอดเพื่อลดความชื้นสัมพัทธ์ใต้ทรงพุ่ม",
  },

  // ===========================================================================
  // 2. มันสำปะหลังสายพันธุ์เศรษฐกิจและทนโรคใบด่าง (Cassava Varieties)
  // ===========================================================================
  {
    id: "cassava_hb80",
    familyId: "cassava",
    familyLabelTh: "มันสำปะหลังเศรษฐกิจ",
    nameTh: "มันสำปะหลัง พันธุ์ห้วยบง 80 (HB80 · เปอร์เซ็นต์แป้งสูงพิเศษ 28–31%)",
    varietyCode: "HB80 (High-Starch)",
    breederSourceTh: "มูลนิธิสถาบันพัฒนามันสำปะหลังแห่งประเทศไทย (ห้วยบง ด่านขุนทด)",
    maturityDaysLabel: "อายุเก็บเกี่ยว 8–12 เดือน",
    optimalGroundTempMinC: 26.5,
    optimalGroundTempMaxC: 33.5,
    optimalHumidityMinPct: 50,
    optimalHumidityMaxPct: 70,
    optimalVpdMinKpa: 1.0,
    optimalVpdMaxKpa: 2.05,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 6.8,
    basePotentialYieldPerRai: 4.6,
    maxPotentialYieldPerRai: 6.3,
    yieldUnitTh: "ตัน/ไร่",
    farmgatePricePerUnitThb: 3150,
    qualityAttributeTh: "เชื้อแป้งสูง 28–31% ได้ราคาบวกเพิ่มหน้าลานมันและโรงแป้งโคราช",
    preferredZones: ["โซนตะวันตก-เหนือ", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    keyStrengthTh:
      "พัฒนาสายพันธุ์ที่ ต.ห้วยบง อ.ด่านขุนทด จึงเข้ากับจุลภูมิอากาศดอนลูกคลื่น (อุณหภูมิผิวดิน 27–33°C, ความชื้น 52–68%) ได้ดีที่สุด",
    climateRiskNoteTh:
      "ไม่ชอบดินแฉะขังน้ำ หากความชื้นดินเกิน 78% ต่อเนื่องเกิน 7 วันจะเสี่ยงหัวเน่า",
    microclimateManagementTipTh:
      "ยกร่องสูง 35–40 ซม. ขวางความลาดเท และเสริมแม่ปุ๋ยโพแทสเซียม (0-0-60) ช่วงอายุ 3–4 เดือนเพื่อเร่งแป้ง",
  },
  {
    id: "cassava_ku50",
    familyId: "cassava",
    familyLabelTh: "มันสำปะหลังเศรษฐกิจ",
    nameTh: "มันสำปะหลัง พันธุ์เกษตรศาสตร์ 50 (KU50 · ปรับตัวกว้าง ทนแล้งเสถียร)",
    varietyCode: "KU50 (All-Terrain)",
    breederSourceTh: "มหาวิทยาลัยเกษตรศาสตร์ & กรมวิชาการเกษตร",
    maturityDaysLabel: "อายุเก็บเกี่ยว 8–12 เดือน",
    optimalGroundTempMinC: 25.5,
    optimalGroundTempMaxC: 34.2,
    optimalHumidityMinPct: 48,
    optimalHumidityMaxPct: 74,
    optimalVpdMinKpa: 0.9,
    optimalVpdMaxKpa: 2.15,
    optimalSoilPhMin: 5.0,
    optimalSoilPhMax: 7.0,
    basePotentialYieldPerRai: 4.5,
    maxPotentialYieldPerRai: 5.9,
    yieldUnitTh: "ตัน/ไร่",
    farmgatePricePerUnitThb: 3020,
    qualityAttributeTh: "เชื้อแป้ง 26–29% ทนแล้งและปรับตัวได้ทุกชุดดินใน 32 อำเภอ",
    preferredZones: ["โซนตะวันตก-เหนือ", "โซนใต้-ดงพญาเย็น", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    keyStrengthTh:
      "สายพันธุ์ที่ปรับตัวต่อความแปรปรวนของอุณหภูมิผิวดินและความชื้นสัมพัทธ์ได้กว้างที่สุด ฟื้นตัวหลังใบด่างได้ดีกว่าพันธุ์อ่อนแอ",
    climateRiskNoteTh:
      "ต้องคัดท่อนพันธุ์สะอาดปลอดไวรัส SLCMV ก่อนปลูกทุกครั้ง",
    microclimateManagementTipTh:
      "ชุบท่อนพันธุ์ด้วยสารไทอะมีทอกแซมก่อนปักชำ และคลุมฟางลดการระเหยน้ำผิวดินช่วงฤดูแล้ง",
  },
  {
    id: "cassava_ry72",
    familyId: "cassava",
    familyLabelTh: "มันสำปะหลังเศรษฐกิจ",
    nameTh: "มันสำปะหลัง พันธุ์ระยอง 72 (RY72 · ทนแล้งจัดสำหรับดินทรายโคก-โนน)",
    varietyCode: "RY72 (Drought-Master)",
    breederSourceTh: "ศูนย์วิจัยพืชไร่ระยอง / นครราชสีมา (สีคิ้ว)",
    maturityDaysLabel: "อายุเก็บเกี่ยว 8–10 เดือน (ลงหัวเร็ว)",
    optimalGroundTempMinC: 27.0,
    optimalGroundTempMaxC: 35.2,
    optimalHumidityMinPct: 44,
    optimalHumidityMaxPct: 68,
    optimalVpdMinKpa: 1.15,
    optimalVpdMaxKpa: 2.35,
    optimalSoilPhMin: 5.0,
    optimalSoilPhMax: 6.5,
    basePotentialYieldPerRai: 4.8,
    maxPotentialYieldPerRai: 6.5,
    yieldUnitTh: "ตัน/ไร่",
    farmgatePricePerUnitThb: 2880,
    qualityAttributeTh: "น้ำหนักหัวสดต่อไร่สูงมาก ลงหัวเร็ว ทนอุณหภูมิผิวดินร้อนจัด 34–35°C",
    preferredZones: ["โซนโคก-โนนตอนเหนือ", "โซนตะวันตก-เหนือ"],
    keyStrengthTh:
      "ทนแล้งจัดและดินทรายจัด (ชุดดินโคราช/จัตุรัส) ที่อุณหภูมิผิวดินช่วงบ่ายพุ่งสูง 32–35°C และความชื้นสัมพัทธ์ต่ำกว่า 55%",
    climateRiskNoteTh:
      "หากเก็บเกี่ยวช้าในฤดูฝนรอบใหม่ เปอร์เซ็นต์แป้งจะลดลงเร็วกว่าห้วยบง 80",
    microclimateManagementTipTh:
      "เหมาะสำหรับขุดขายช่วงอายุ 8–10 เดือนในฤดูแล้ง (ม.ค.–มี.ค.) จะได้ทั้งน้ำหนักหัวสดและเชื้อแป้งคุ้มค่าที่สุด",
  },
  {
    id: "cassava_tme3_cmd",
    familyId: "cassava",
    familyLabelTh: "มันสำปะหลังเศรษฐกิจ",
    nameTh: "มันสำปะหลัง พันธุ์ต้านทานโรคใบด่าง (TME3 / อิคเควทอเรียล 72 คัดพิเศษ)",
    varietyCode: "TME3 / CMD-Shield",
    breederSourceTh: "กรมวิชาการเกษตร & สถาบันพัฒนามันสำปะหลังฯ",
    maturityDaysLabel: "อายุเก็บเกี่ยว 9–12 เดือน",
    optimalGroundTempMinC: 24.5,
    optimalGroundTempMaxC: 32.5,
    optimalHumidityMinPct: 58,
    optimalHumidityMaxPct: 78,
    optimalVpdMinKpa: 0.85,
    optimalVpdMaxKpa: 1.85,
    optimalSoilPhMin: 5.3,
    optimalSoilPhMax: 6.8,
    basePotentialYieldPerRai: 4.9,
    maxPotentialYieldPerRai: 6.6,
    yieldUnitTh: "ตัน/ไร่",
    farmgatePricePerUnitThb: 3100,
    qualityAttributeTh: "ต้านทานไวรัสใบด่าง SLCMV รักษาระดับแป้ง 27–30% ในโซนชื้น",
    preferredZones: ["โซนใต้-ดงพญาเย็น", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    keyStrengthTh:
      "เหมาะอย่างยิ่งกับโซนเสิงสาง–ครบุรี–โชคชัย–ห้วยแถลง ที่มีความชื้นสัมพัทธ์ 62–76% ซึ่งเอื้อต่อแมลงหวี่ขาวพาหะโรคใบด่าง",
    climateRiskNoteTh:
      "ต้องควบคุมวัชพืชร่มเงาช่วง 60 วันแรกเพื่อให้เรือนยอดรับแสงเต็มที่",
    microclimateManagementTipTh:
      "ปลูกระยะ 1.0 x 0.8 เมตร พร้อมฉีดพ่นธาตุสังกะสีและแมกนีเซียมทางใบเพิ่มความหนาของแผ่นใบ",
  },

  // ===========================================================================
  // 3. ข้าวโพดเลี้ยงสัตว์และข้าวโพดหวาน (Maize & Sweet Corn Varieties)
  // ===========================================================================
  {
    id: "maize_suwan5_hybrid",
    familyId: "maize",
    familyLabelTh: "ข้าวโพดเลี้ยงสัตว์·ข้าวโพดหวาน",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ พันธุ์สุวรรณ 5 / ลูกผสมทนแล้งเชิงเขา (Suwan 5)",
    varietyCode: "SW5 / Pak Chong Hybrid",
    breederSourceTh: "ศูนย์วิจัยข้าวโพดและข้าวฟ่างแห่งชาติ (ไร่สุวรรณ ปากช่อง)",
    maturityDaysLabel: "อายุเก็บเกี่ยว 110–115 วัน",
    optimalGroundTempMinC: 23.0,
    optimalGroundTempMaxC: 31.5,
    optimalHumidityMinPct: 56,
    optimalHumidityMaxPct: 78,
    optimalVpdMinKpa: 0.8,
    optimalVpdMaxKpa: 1.65,
    optimalSoilPhMin: 5.6,
    optimalSoilPhMax: 7.2,
    basePotentialYieldPerRai: 1080,
    maxPotentialYieldPerRai: 1450,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 10.6,
    qualityAttributeTh: "เมล็ดสีส้มเหลืองหัวแข็ง น้ำหนักดี ต้านทานโรคราน้ำค้าง",
    preferredZones: ["โซนตะวันตก-ที่ราบสูง", "โซนตะวันตก-เหนือ", "โซนใต้-ดงพญาเย็น"],
    keyStrengthTh:
      "ปรับปรุงพันธุ์ที่ไร่สุวรรณ อ.ปากช่อง รากค้ำจุนแข็งแรง ทนลมและทนช่วงฝนทิ้งช่วงในโซนสีคิ้ว–ด่านขุนทด–ปากช่องได้ดีเยี่ยม",
    climateRiskNoteTh:
      "หากอุณหภูมิช่วงออกไหมเกิน 34.5°C และ VPD > 2.0 kPa จะทำให้เกสรตัวผู้ฝ่อ ติดเมล็ดไม่เต็มฝัก",
    microclimateManagementTipTh:
      "วางแผนวันปลูกให้ระยะออกไหม (อายุ 50–55 วัน) หลีกเลี่ยงสัปดาห์ที่ร้อนแล้งจัด หรือให้น้ำเสริมช่วงผสมเกสร",
  },
  {
    id: "maize_ns3_postrice",
    familyId: "maize",
    familyLabelTh: "ข้าวโพดเลี้ยงสัตว์·ข้าวโพดหวาน",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ พันธุ์นครสวรรค์ 3 (NS3 · อายุสั้นปลูกหลังนา)",
    varietyCode: "NS3 (Post-Rice)",
    breederSourceTh: "ศูนย์วิจัยพืชไร่นครสวรรค์ / กรมวิชาการเกษตร",
    maturityDaysLabel: "อายุเก็บเกี่ยว 100–105 วัน (ใช้น้ำน้อย)",
    optimalGroundTempMinC: 22.5,
    optimalGroundTempMaxC: 30.8,
    optimalHumidityMinPct: 54,
    optimalHumidityMaxPct: 76,
    optimalVpdMinKpa: 0.75,
    optimalVpdMaxKpa: 1.6,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 7.0,
    basePotentialYieldPerRai: 1020,
    maxPotentialYieldPerRai: 1340,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 10.6,
    qualityAttributeTh: "ใช้น้ำน้อย อาศัยความชื้นตกค้างในดินนาหลังเก็บเกี่ยวข้าวหอมมะลิ",
    preferredZones: ["โซนทุ่งสัมฤทธิ์-เหนือ", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    keyStrengthTh:
      "เหมาะสำหรับปลูกหลังนา (พ.ย.–ก.พ.) ในโซนพิมาย–โนนสูง–ชุมพวง โดยใช้ความชื้นดิน GISTDA สะสมและอุณหภูมิผิวดิน 23–29°C",
    climateRiskNoteTh:
      "ต้องไถเตรียมดินและหยอดเมล็ดทันทีหลังเกี่ยวข้าวเพื่อไม่ให้ความชื้นผิวดินระเหยหาย",
    microclimateManagementTipTh:
      "คลุมตอซังข้าวระหว่างแถวเพื่อรักษาความชื้นดินระดับราก 5–15 ซม. ตลอดฤดูหนาว",
  },
  {
    id: "sweetcorn_hibrix_insee2",
    familyId: "maize",
    familyLabelTh: "ข้าวโพดเลี้ยงสัตว์·ข้าวโพดหวาน",
    nameTh: "ข้าวโพดหวาน พันธุ์ไฮบริกซ์ 3 / อินทรี 2 ปากช่อง (Hi-Brix Sweet Corn)",
    varietyCode: "Hi-Brix 3 / Insee 2",
    breederSourceTh: "ไร่สุวรรณ ปากช่อง & คลัสเตอร์ข้าวโพดหวานโคราช",
    maturityDaysLabel: "อายุเก็บเกี่ยวฝักสด 68–72 วัน",
    optimalGroundTempMinC: 20.5,
    optimalGroundTempMaxC: 28.5,
    optimalHumidityMinPct: 62,
    optimalHumidityMaxPct: 80,
    optimalVpdMinKpa: 0.65,
    optimalVpdMaxKpa: 1.35,
    optimalSoilPhMin: 5.8,
    optimalSoilPhMax: 7.0,
    basePotentialYieldPerRai: 2200,
    maxPotentialYieldPerRai: 2950,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 9.5,
    qualityAttributeTh: "ความหวาน 14–16 Brix เมล็ดนุ่มเปลือกบาง ส่งตลาดพรีเมียมและส่งออก",
    preferredZones: ["โซนตะวันตก-ที่ราบสูง", "โซนใต้-ดงพญาเย็น"],
    keyStrengthTh:
      "จุลภูมิอากาศเย็นชื้นของปากช่อง–วังน้ำเขียว–สีคิ้วตอนบน (ผิวดิน 21–28°C) ช่วยชะลอการเปลี่ยนน้ำตาลเป็นแป้งหลังหักฝัก",
    climateRiskNoteTh:
      "ไวต่อการขาดน้ำระยะออกไหม ต้องมีระบบน้ำหยดหรือมินิสปริงเกลอร์ควบคุมความชื้นดิน >60%",
    microclimateManagementTipTh:
      "เก็บเกี่ยวฝักสดในช่วงเช้ามืด (05:00–07:30 น.) ขณะอุณหภูมิฝักต่ำเพื่อรักษาค่าความหวาน Brix สูงสุด",
  },

  // ===========================================================================
  // 4. อ้อยโรงงานและไม้ผลอัตลักษณ์ GI (Sugarcane & Premium GI Orchard Varieties)
  // ===========================================================================
  {
    id: "sugarcane_kk3",
    familyId: "sugarcane_fruit",
    familyLabelTh: "อ้อยโรงงาน & ไม้ผล GI",
    nameTh: "อ้อยโรงงาน พันธุ์ขอนแก่น 3 (KK3 · ความหวาน 14.5 CCS ทนแล้ง)",
    varietyCode: "KK3 (High-CCS)",
    breederSourceTh: "ศูนย์วิจัยพืชไร่ขอนแก่น · มาตรฐานโรงงานน้ำตาลโคราช",
    maturityDaysLabel: "อายุเก็บเกี่ยว 10–12 เดือน",
    optimalGroundTempMinC: 25.5,
    optimalGroundTempMaxC: 33.2,
    optimalHumidityMinPct: 50,
    optimalHumidityMaxPct: 74,
    optimalVpdMinKpa: 0.9,
    optimalVpdMaxKpa: 2.0,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 7.2,
    basePotentialYieldPerRai: 12.8,
    maxPotentialYieldPerRai: 16.8,
    yieldUnitTh: "ตัน/ไร่",
    farmgatePricePerUnitThb: 1420,
    qualityAttributeTh: "ค่าความหวาน 13.5–15.0 CCS ไว้ตอได้ดีในดินร่วนปนทรายโคราช",
    preferredZones: ["โซนทุ่งสัมฤทธิ์-เหนือ", "โซนโคก-โนนตอนเหนือ", "โซนใต้-ดงพญาเย็น"],
    keyStrengthTh:
      "เมื่อเข้าสู่ช่วง พ.ย.–ม.ค. ที่ผลต่างอุณหภูมิกลางวัน-กลางคืน (Diurnal Delta) > 10°C พันธุ์ KK3 จะสะสมน้ำตาลซูโครสในลำได้รวดเร็วที่สุด",
    climateRiskNoteTh:
      "ต้องเฝ้าระวังโรคใบขาวอ้อยจากเพลี้ยจักจั่นในแปลงที่มีสภาพแล้งสลับฝน",
    microclimateManagementTipTh:
      "งดให้น้ำก่อนตัดอ้อยเข้าหีบ 30 วัน และคลุมใบอ้อยหลังตัดเพื่อรักษาความชื้นตออ้อยรุ่นต่อไป",
  },
  {
    id: "sugarcane_k88_92",
    familyId: "sugarcane_fruit",
    familyLabelTh: "อ้อยโรงงาน & ไม้ผล GI",
    nameTh: "อ้อยโรงงาน พันธุ์เค 88-92 (K88-92 · น้ำหนักลำสูงสำหรับดินร่วนชื้น)",
    varietyCode: "K88-92 (Heavy-Tonnage)",
    breederSourceTh: "สำนักงานคณะกรรมการอ้อยและน้ำตาลทราย (สอน.)",
    maturityDaysLabel: "อายุเก็บเกี่ยว 11–12 เดือน",
    optimalGroundTempMinC: 25.0,
    optimalGroundTempMaxC: 32.0,
    optimalHumidityMinPct: 56,
    optimalHumidityMaxPct: 78,
    optimalVpdMinKpa: 0.85,
    optimalVpdMaxKpa: 1.75,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 7.0,
    basePotentialYieldPerRai: 13.5,
    maxPotentialYieldPerRai: 17.6,
    yieldUnitTh: "ตัน/ไร่",
    farmgatePricePerUnitThb: 1360,
    qualityAttributeTh: "ลำใหญ่ปล้องยาว น้ำหนักตันต่อไร่สูงพิเศษในดินร่วนเหนียวชื้น",
    preferredZones: ["โซนใต้-ดงพญาเย็น", "โซนทุ่งสัมฤทธิ์-เหนือ"],
    keyStrengthTh:
      "ให้ผลผลิตน้ำหนักลำต่อไร่สูงสุดในพื้นที่ใกล้แหล่งน้ำครบุรี–พิมาย–ชุมพวง–ประทาย ที่ความชื้นดิน GISTDA > 58%",
    climateRiskNoteTh:
      "ไม่ทนแล้งจัดเท่าพันธุ์ขอนแก่น 3 จึงไม่แนะนำในพื้นที่โคกทรายจัดที่ไม่มีบ่อน้ำเสริม",
    microclimateManagementTipTh:
      "ให้น้ำระบบหยดใต้ผิวดินช่วงแตกกอและย่างปล้อง (เม.ย.–ก.ค.) เพื่อเพิ่มจำนวนลำต่อกอ",
  },
  {
    id: "durian_monthong_gi_korat",
    familyId: "sugarcane_fruit",
    familyLabelTh: "อ้อยโรงงาน & ไม้ผล GI",
    nameTh: "ทุเรียนหมอนทองปากช่อง-เขาใหญ่ GI & ดงพญาเย็น (Monthong GI)",
    varietyCode: "Monthong GI Korat",
    breederSourceTh: "วิสาหกิจชุมชนแปลงใหญ่ทุเรียนปากช่อง-วังน้ำเขียว-ครบุรี",
    maturityDaysLabel: "เก็บเกี่ยว มิ.ย.–ส.ค. (120–130 วันหลังดอกบาน)",
    optimalGroundTempMinC: 20.5,
    optimalGroundTempMaxC: 28.0,
    optimalHumidityMinPct: 70,
    optimalHumidityMaxPct: 86,
    optimalVpdMinKpa: 0.6,
    optimalVpdMaxKpa: 1.25,
    optimalSoilPhMin: 5.5,
    optimalSoilPhMax: 6.5,
    basePotentialYieldPerRai: 1450,
    maxPotentialYieldPerRai: 2250,
    yieldUnitTh: "กก./ไร่",
    farmgatePricePerUnitThb: 165,
    qualityAttributeTh: "เนื้อแห้งเนียนละเอียด รสหวานมัน กลิ่นอ่อนเป็นเอกลักษณ์ GI โคราช",
    preferredZones: ["โซนตะวันตก-ที่ราบสูง", "โซนใต้-ดงพญาเย็น"],
    keyStrengthTh:
      "สร้างรายได้ต่อไร่สูงสุด (2.4–3.7 แสนบาท/ไร่) ในเขตจุลภูมิอากาศที่สูงปากช่อง–วังน้ำเขียว–ครบุรี–เสิงสาง ที่มีอากาศเย็นชื้นและดินระบายน้ำดี",
    climateRiskNoteTh:
      "หากความชื้นสัมพัทธ์ต่ำกว่า 55% และ VPD > 1.7 kPa ช่วงบ่าย จะเกิดอาการใบไหม้ขอบใบและดอก/ผลอ่อนร่วง",
    microclimateManagementTipTh:
      "เปิดสปริงเกลอร์พ่นฝอยใต้ทรงพุ่มช่วงบ่ายร้อนเพื่อรักษาระดับความชื้นสัมพัทธ์ >70% และคลุมโคนรักษาอุณหภูมิรากฝอย",
  },
];

export interface EvaluatedVarietyResult {
  spec: CropVarietyCandidateSpec;
  tempScore: number;
  humidityVpdScore: number;
  soilPhScore: number;
  overallMatchScore: number;
  predictedYieldPerRai: number;
  predictedYieldLabel: string;
  estimatedRevenuePerRaiThb: number;
  yieldAdvantageVsAvgPct: number;
  matchBadgeTh:
    | "สายพันธุ์ชนะเลิศ (AI Best Match)"
    | "เหมาะสมมาก (High Yield Fit)"
    | "พอใช้ (ต้องปรับการจัดการแปลง)"
    | "ไม่แนะนำในจุลภูมิอากาศนี้";
}

export interface AiVarietyMatcherResponse {
  source: string;
  recommendedTopVarietyTh: string;
  varietyCode: string;
  matchConfidencePct: number;
  expectedYieldPerRaiLabel: string;
  expectedRevenuePerRaiThb: number;
  yieldAdvantagePct: number;
  runnerUpVarietyTh: string;
  climateComparisonAnalysisTh: string;
  headToHeadComparison: {
    rank: number;
    varietyNameTh: string;
    varietyCode: string;
    suitabilityScore: number;
    predictedYieldLabel: string;
    microclimateFitSummaryTh: string;
    physiologicalRiskTh: string;
  }[];
  zoneSpecificRecommendations: {
    zoneNameTh: string;
    bestVarietyTh: string;
    expectedYieldLabel: string;
    microclimateReasonTh: string;
  }[];
  plantingAndMicroclimateManagementTips: string[];
}

export interface KoratZoneSummary {
  zoneId: string;
  zoneTitleTh: string;
  subDescriptionTh: string;
  districtIds: string[];
  avgGroundTempC: number;
  avgHumidityPct: number;
  avgVpdKpa: number;
  avgSoilMoisturePct: number;
  avgSoilPh: number;
  topVariety: EvaluatedVarietyResult;
  runnerUpVariety: EvaluatedVarietyResult;
  allCropChampion: EvaluatedVarietyResult;
}

const KORAT_AGRO_ZONES_DEF: {
  zoneId: string;
  zoneTitleTh: string;
  subDescriptionTh: string;
  districtIds: string[];
}[] = [
  {
    zoneId: "thung-samrit",
    zoneTitleTh: "โซนที่ 1: แอ่งทุ่งสัมฤทธิ์-ลุ่มน้ำมูลตอนบน",
    subDescriptionTh: "ดินร่วนเหนียวลุ่มน้ำมูล ความชื้นสะสมสูง เหมาะกับข้าวหอมมะลิ GI และอ้อยน้ำหนักสูง",
    districtIds: [
      "phimai",
      "chum-phuang",
      "non-sung",
      "prathai",
      "muang-yang",
      "lam-thamenchai",
    ],
  },
  {
    zoneId: "west-upland",
    zoneTitleTh: "โซนที่ 2: ดอนลูกคลื่นตะวันตก-ลุ่มน้ำลำตะคองตอนบน",
    subDescriptionTh: "พื้นที่ดอนระบายน้ำดี แดดจัด อุณหภูมิผิวดินอบอุ่น แหล่งมันสำปะหลังแป้งสูงและข้าวโพด",
    districtIds: [
      "dan-khun-thot",
      "sikhio",
      "sung-noen",
      "thepharak",
      "non-thai",
      "kham-thale-so",
    ],
  },
  {
    zoneId: "khao-yai-highland",
    zoneTitleTh: "โซนที่ 3: ที่ราบสูงเขาใหญ่-วังน้ำเขียว (Microclimate เย็นชื้น)",
    subDescriptionTh: "ความสูง 450–540 ม. อุณหภูมิผิวดินเย็น 20–26°C ความชื้นสูง แหล่งทุเรียน GI และข้าวโพดหวาน",
    districtIds: ["pak-chong", "wang-nam-khiao"],
  },
  {
    zoneId: "south-dong-phayayen",
    zoneTitleTh: "โซนที่ 4: เชิงเขาดงพญาเย็น-ต้นน้ำมูลใต้",
    subDescriptionTh: "อิทธิพลความชื้นเขื่อนลำแชะ-มูลบน-ลำพระเพลิง เหมาะกับมันสำปะหลังทน CMD อ้อย และไม้ผล",
    districtIds: [
      "khon-buri",
      "soeng-sang",
      "pak-thong-chai",
      "chok-chai",
      "chaloem-phra-kiat",
      "nong-bun-mak",
    ],
  },
  {
    zoneId: "central-korat",
    zoneTitleTh: "โซนที่ 5: แอ่งกลางเมือง-ลำจักราช",
    subDescriptionTh: "กึ่งชลประทาน-กึ่งดอน เหมาะกับข้าวอายุสั้น กข43/กข85 มันสำปะหลัง KU50 และพืชผัก",
    districtIds: [
      "mueang-nakhon-ratchasima",
      "chakkarat",
      "huai-thalaeng",
      "kham-sakae-saeng",
      "phra-thong-kham",
    ],
  },
  {
    zoneId: "north-khok-non",
    zoneTitleTh: "โซนที่ 6: โคก-โนนตอนเหนือ (บัวใหญ่-คง-บ้านเหลื่อม)",
    subDescriptionTh: "อุณหภูมิผิวดินบ่ายสูง ความชื้นลดเร็วปลายฤดู เหมาะกับข้าว กข15 มันระยอง 72 และอ้อย KK3",
    districtIds: [
      "bua-yai",
      "khong",
      "ban-lueam",
      "kaeng-sanam-nang",
      "bua-lai",
      "sida",
      "non-daeng",
    ],
  },
];

export function evaluateCropVarietyForTelemetry(
  spec: CropVarietyCandidateSpec,
  groundTempC: number,
  relativeHumidityPct: number,
  vpdKpa: number,
  soilPh: number,
  zoneNameTh: string
): EvaluatedVarietyResult {
  // 1. Temperature Fit Score (0..100)
  let tempPenalty = 0;
  if (groundTempC < spec.optimalGroundTempMinC) {
    tempPenalty = (spec.optimalGroundTempMinC - groundTempC) * 8.2;
  } else if (groundTempC > spec.optimalGroundTempMaxC) {
    tempPenalty = (groundTempC - spec.optimalGroundTempMaxC) * 9.0;
  } else {
    // Bonus for being right near the midpoint of optimal range
    const midTemp = (spec.optimalGroundTempMinC + spec.optimalGroundTempMaxC) / 2;
    tempPenalty = Math.abs(groundTempC - midTemp) * 1.4;
  }
  const tempScore = Math.round(Math.max(25, Math.min(99, 100 - tempPenalty)));

  // 2. Humidity & VPD Fit Score (0..100)
  let humPenalty = 0;
  if (relativeHumidityPct < spec.optimalHumidityMinPct) {
    humPenalty = (spec.optimalHumidityMinPct - relativeHumidityPct) * 1.65;
  } else if (relativeHumidityPct > spec.optimalHumidityMaxPct) {
    humPenalty = (relativeHumidityPct - spec.optimalHumidityMaxPct) * 1.75;
  } else {
    const midHum = (spec.optimalHumidityMinPct + spec.optimalHumidityMaxPct) / 2;
    humPenalty = Math.abs(relativeHumidityPct - midHum) * 0.35;
  }

  let vpdPenalty = 0;
  if (vpdKpa < spec.optimalVpdMinKpa) {
    vpdPenalty = (spec.optimalVpdMinKpa - vpdKpa) * 16;
  } else if (vpdKpa > spec.optimalVpdMaxKpa) {
    vpdPenalty = (vpdKpa - spec.optimalVpdMaxKpa) * 18;
  }
  const humidityVpdScore = Math.round(
    Math.max(25, Math.min(99, 100 - humPenalty * 0.7 - vpdPenalty * 0.3))
  );

  // 3. Soil pH & Zone Fit Score (0..100)
  let phPenalty = 0;
  if (soilPh < spec.optimalSoilPhMin) {
    phPenalty = (spec.optimalSoilPhMin - soilPh) * 18;
  } else if (soilPh > spec.optimalSoilPhMax) {
    phPenalty = (soilPh - spec.optimalSoilPhMax) * 18;
  }
  const zoneMatchBonus = spec.preferredZones.some((z) =>
    zoneNameTh.includes(z.slice(0, 6))
  )
    ? 6
    : 0;
  const soilPhScore = Math.round(
    Math.max(35, Math.min(99, 96 - phPenalty + zoneMatchBonus))
  );

  // Weighted Overall Match Score
  const overallMatchScore = Math.round(
    Math.max(
      28,
      Math.min(
        99,
        tempScore * 0.44 +
          humidityVpdScore * 0.36 +
          soilPhScore * 0.2 +
          (zoneMatchBonus > 0 ? 2 : 0)
      )
    )
  );

  // Predicted Yield interpolation based on match score
  const yieldRatio = Math.max(0.15, Math.min(1, (overallMatchScore - 35) / 62));
  const rawYield =
    spec.basePotentialYieldPerRai +
    (spec.maxPotentialYieldPerRai - spec.basePotentialYieldPerRai) * yieldRatio;

  const isTonUnit = spec.yieldUnitTh.includes("ตัน");
  const predictedYieldPerRai = isTonUnit
    ? Number(rawYield.toFixed(2))
    : Math.round(rawYield / 5) * 5;

  const predictedYieldLabel = isTonUnit
    ? `${predictedYieldPerRai.toFixed(2)} ${spec.yieldUnitTh}`
    : `${predictedYieldPerRai.toLocaleString("th-TH")} ${spec.yieldUnitTh}`;

  const estimatedRevenuePerRaiThb = Math.round(
    predictedYieldPerRai * spec.farmgatePricePerUnitThb
  );

  const yieldAdvantageVsAvgPct = Math.round(
    ((rawYield - spec.basePotentialYieldPerRai) / spec.basePotentialYieldPerRai) *
      100
  );

  const matchBadgeTh: EvaluatedVarietyResult["matchBadgeTh"] =
    overallMatchScore >= 86
      ? "สายพันธุ์ชนะเลิศ (AI Best Match)"
      : overallMatchScore >= 74
      ? "เหมาะสมมาก (High Yield Fit)"
      : overallMatchScore >= 58
      ? "พอใช้ (ต้องปรับการจัดการแปลง)"
      : "ไม่แนะนำในจุลภูมิอากาศนี้";

  return {
    spec,
    tempScore,
    humidityVpdScore,
    soilPhScore,
    overallMatchScore,
    predictedYieldPerRai,
    predictedYieldLabel,
    estimatedRevenuePerRaiThb,
    yieldAdvantageVsAvgPct,
    matchBadgeTh,
  };
}

interface CropVarietyMatcherModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onOpenClimateHeatmap?: () => void;
}

export const CropVarietyMatcherModule: React.FC<CropVarietyMatcherModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onOpenClimateHeatmap,
}) => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<CropFamilyId>("rice");
  const [timeSlice, setTimeSlice] =
    useState<ClimateTimeSliceMode>("afternoon_peak");
  const [tempSimOffsetC, setTempSimOffsetC] = useState<number>(0);
  const [humiditySimOffsetPct, setHumiditySimOffsetPct] = useState<number>(0);

  const [aiReport, setAiReport] = useState<AiVarietyMatcherResponse | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);

  const timeSliceMeta: Record<
    ClimateTimeSliceMode,
    { labelTh: string; badgeTh: string }
  > = {
    afternoon_peak: {
      labelTh: "บ่ายร้อนสุด (14:00 น.)",
      badgeTh: "Peak Thermal Stress",
    },
    morning_root: {
      labelTh: "เช้าระดับราก (07:00 น.)",
      badgeTh: "Root Dew Window",
    },
    cool_season: {
      labelTh: "ฤดูหนาวเร่งดอก/สะสมแป้ง (พ.ย.–ม.ค.)",
      badgeTh: "2-AP & Starch Accumulation",
    },
    hot_dry: {
      labelTh: "ฤดูแล้งวิกฤต (มี.ค.–เม.ย.)",
      badgeTh: "Drought Tolerance Test",
    },
  };

  const cropFamilyTabs: {
    id: CropFamilyId;
    labelTh: string;
    subLabelTh: string;
    examplesTh: string;
  }[] = [
    {
      id: "rice",
      labelTh: "ข้าวหอมมะลิ & ข้าวคุณภาพ",
      subLabelTh: "เปรียบเทียบ 4 สายพันธุ์หลัก",
      examplesTh: "KDML 105 GI · กข15 · กข43 · กข85",
    },
    {
      id: "cassava",
      labelTh: "มันสำปะหลังเศรษฐกิจ",
      subLabelTh: "เปรียบเทียบ 4 สายพันธุ์แป้งสูง/ทนโรค",
      examplesTh: "ห้วยบง 80 · เกษตรศาสตร์ 50 · ระยอง 72 · พันธุ์ทน CMD",
    },
    {
      id: "maize",
      labelTh: "ข้าวโพดเลี้ยงสัตว์·ข้าวโพดหวาน",
      subLabelTh: "เปรียบเทียบ 3 สายพันธุ์ยอดนิยม",
      examplesTh: "สุวรรณ 5 · นครสวรรค์ 3 หลังนา · ไฮบริกซ์ 3 ปากช่อง",
    },
    {
      id: "sugarcane_fruit",
      labelTh: "อ้อยโรงงาน & ไม้ผลพรีเมียม GI",
      subLabelTh: "เปรียบเทียบ 3 สายพันธุ์มูลค่าสูง",
      examplesTh: "อ้อยขอนแก่น 3 · เค 88-92 · ทุเรียนหมอนทอง GI",
    },
  ];

  // Pull live Climate Heatmap telemetry for the selected district
  const baseDistrictClimate = useMemo(() => {
    return computeDistrictMicroclimate(
      selectedDistrict,
      timeSlice,
      CROP_VARIETY_SPECS[0]
    );
  }, [selectedDistrict, timeSlice]);

  // Apply user's interactive simulation offsets (±°C / ±%RH)
  const effectiveClimate = useMemo(() => {
    const gTemp = Number(
      Math.max(
        15,
        Math.min(42, baseDistrictClimate.groundTempC + tempSimOffsetC)
      ).toFixed(1)
    );
    const airTemp = Number((gTemp + 1.4).toFixed(1));
    const rHum = Math.round(
      Math.max(
        35,
        Math.min(94, baseDistrictClimate.relativeHumidityPct + humiditySimOffsetPct)
      )
    );
    const es = 0.61078 * Math.exp((17.27 * airTemp) / (airTemp + 237.3));
    const ea = es * (rHum / 100);
    const vpd = Number(Math.max(0.25, es - ea).toFixed(2));

    return {
      ...baseDistrictClimate,
      groundTempC: gTemp,
      airTempC: airTemp,
      relativeHumidityPct: rHum,
      vpdKpa: vpd,
    };
  }, [baseDistrictClimate, tempSimOffsetC, humiditySimOffsetPct]);

  // Evaluate candidate varieties in the selected Crop Family for the current district
  const evaluatedFamilyVarieties = useMemo(() => {
    const familySpecs = KORAT_CROP_VARIETY_CATALOG.filter(
      (v) => v.familyId === selectedFamilyId
    );
    const results = familySpecs.map((spec) =>
      evaluateCropVarietyForTelemetry(
        spec,
        effectiveClimate.groundTempC,
        effectiveClimate.relativeHumidityPct,
        effectiveClimate.vpdKpa,
        selectedDistrict.defaultSoilTest.soilPh,
        selectedDistrict.zone
      )
    );
    return results.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  }, [selectedFamilyId, effectiveClimate, selectedDistrict]);

  const championVariety = evaluatedFamilyVarieties[0];
  const runnerUpVariety = evaluatedFamilyVarieties[1] || evaluatedFamilyVarieties[0];

  // Evaluate all 6 Agro-Ecological Zones across Korat's 32 Districts
  const koratZoneSummaries: KoratZoneSummary[] = useMemo(() => {
    const familySpecs = KORAT_CROP_VARIETY_CATALOG.filter(
      (v) => v.familyId === selectedFamilyId
    );

    return KORAT_AGRO_ZONES_DEF.map((zoneDef) => {
      const zoneDistricts = KORAT_DISTRICTS.filter((d) =>
        zoneDef.districtIds.includes(d.id)
      );
      const records = zoneDistricts.map((d) =>
        computeDistrictMicroclimate(d, timeSlice, CROP_VARIETY_SPECS[0])
      );

      const count = Math.max(1, records.length);
      const avgGroundTempC = Number(
        (
          records.reduce((acc, r) => acc + r.groundTempC, 0) / count +
          tempSimOffsetC
        ).toFixed(1)
      );
      const avgHumidityPct = Math.round(
        records.reduce((acc, r) => acc + r.relativeHumidityPct, 0) / count +
          humiditySimOffsetPct
      );
      const avgVpdKpa = Number(
        (records.reduce((acc, r) => acc + r.vpdKpa, 0) / count).toFixed(2)
      );
      const avgSoilMoisturePct = Math.round(
        zoneDistricts.reduce((acc, d) => acc + d.gistdaSoilMoisturePct, 0) /
          count
      );
      const avgSoilPh = Number(
        (
          zoneDistricts.reduce((acc, d) => acc + d.defaultSoilTest.soilPh, 0) /
          count
        ).toFixed(1)
      );

      const zoneFamilyEvaluated = familySpecs
        .map((spec) =>
          evaluateCropVarietyForTelemetry(
            spec,
            avgGroundTempC,
            avgHumidityPct,
            avgVpdKpa,
            avgSoilPh,
            zoneDef.zoneTitleTh
          )
        )
        .sort((a, b) => b.overallMatchScore - a.overallMatchScore);

      const allCropEvaluated = KORAT_CROP_VARIETY_CATALOG.map((spec) =>
        evaluateCropVarietyForTelemetry(
          spec,
          avgGroundTempC,
          avgHumidityPct,
          avgVpdKpa,
          avgSoilPh,
          zoneDef.zoneTitleTh
        )
      ).sort((a, b) => b.overallMatchScore - a.overallMatchScore);

      return {
        zoneId: zoneDef.zoneId,
        zoneTitleTh: zoneDef.zoneTitleTh,
        subDescriptionTh: zoneDef.subDescriptionTh,
        districtIds: zoneDef.districtIds,
        avgGroundTempC,
        avgHumidityPct,
        avgVpdKpa,
        avgSoilMoisturePct,
        avgSoilPh,
        topVariety: zoneFamilyEvaluated[0],
        runnerUpVariety: zoneFamilyEvaluated[1] || zoneFamilyEvaluated[0],
        allCropChampion: allCropEvaluated[0],
      };
    });
  }, [selectedFamilyId, timeSlice, tempSimOffsetC, humiditySimOffsetPct]);

  // Function to invoke Gemini AI Crop Variety Matcher endpoint
  const runAiVarietyMatcher = useCallback(async () => {
    setIsAnalyzingAi(true);
    try {
      const currentFamilyTab = cropFamilyTabs.find(
        (t) => t.id === selectedFamilyId
      );
      const payload = {
        districtNameTh: selectedDistrict.nameTh,
        zoneNameTh: selectedDistrict.zone,
        cropFamilyId: selectedFamilyId,
        cropFamilyLabelTh: currentFamilyTab?.labelTh || "ข้าวหอมมะลิและข้าวคุณภาพ",
        timeSliceLabelTh: timeSliceMeta[timeSlice].labelTh,
        groundTempC: effectiveClimate.groundTempC,
        airTempC: effectiveClimate.airTempC,
        relativeHumidityPct: effectiveClimate.relativeHumidityPct,
        vpdKpa: effectiveClimate.vpdKpa,
        diurnalDeltaC: effectiveClimate.diurnalDeltaC,
        soilMoisturePct: selectedDistrict.gistdaSoilMoisturePct,
        soilSeriesName: selectedDistrict.soilSeriesName,
        soilPh: selectedDistrict.defaultSoilTest.soilPh,
        spi30d: selectedDistrict.spi30d,
        elevationM: effectiveClimate.elevationM,
        candidateVarieties: evaluatedFamilyVarieties.map((ev) => ({
          id: ev.spec.id,
          nameTh: ev.spec.nameTh,
          code: ev.spec.varietyCode,
          matchScore: ev.overallMatchScore,
          predictedYieldLabel: ev.predictedYieldLabel,
          estimatedRevenuePerRai: ev.estimatedRevenuePerRaiThb,
          optimalTempRange: `${ev.spec.optimalGroundTempMinC}–${ev.spec.optimalGroundTempMaxC}°C`,
          optimalHumRange: `${ev.spec.optimalHumidityMinPct}–${ev.spec.optimalHumidityMaxPct}% RH`,
          keyStrengthTh: ev.spec.keyStrengthTh,
          climateRiskNoteTh: ev.spec.climateRiskNoteTh,
        })),
      };

      const res = await fetch("/api/ai/crop-variety-matcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data: AiVarietyMatcherResponse = await res.json();
        setAiReport(data);
      }
    } catch {
      // Keep deterministic analysis displayed seamlessly
    } finally {
      setIsAnalyzingAi(false);
    }
  }, [
    selectedDistrict,
    selectedFamilyId,
    timeSlice,
    effectiveClimate,
    evaluatedFamilyVarieties,
  ]);

  // Auto-run AI analysis whenever district or crop family changes
  useEffect(() => {
    runAiVarietyMatcher();
  }, [selectedDistrict.id, selectedFamilyId, timeSlice]);

  return (
    <section
      id="module-variety-matcher"
      className="bg-[#0B1218] border border-emerald-500/25 rounded-xl p-4 sm:p-6 shadow-2xl space-y-5"
    >
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              AI CROP VARIETY MATCHER · CLIMATE HEATMAP ENGINE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5" />
              Gemini 3.8 Agronomic Variety Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">
            ระบบ AI จับคู่สายพันธุ์พืชผลผลิตสูงสุดตามจุลภูมิอากาศ (Crop Variety Matcher)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
            วิเคราะห์และเปรียบเทียบข้อมูลอุณหภูมิผิวดิน (Ground Temp) ความชื้นสัมพัทธ์ (%RH) ค่า VPD และชุดดินจาก{" "}
            <span className="text-emerald-300 font-medium">Climate Heatmap</span>{" "}
            เข้ากับหน้าต่างสรีรวิทยาของแต่ละสายพันธุ์ย่อย (เช่น ข้าวหอมมะลิ 105 vs กข15 vs กข43 หรือ มันสำปะหลังห้วยบง 80 vs เกษตรศาสตร์ 50 vs ระยอง 72) เพื่อแนะนำสายพันธุ์ที่ให้ผลผลิตสูงสุดในแต่ละโซนของโคราช
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenClimateHeatmap && (
            <button
              type="button"
              onClick={onOpenClimateHeatmap}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 transition-colors cursor-pointer"
            >
              <ThermometerSun className="w-4 h-4 text-amber-400" />
              เปิดแผนที่ Climate Heatmap
            </button>
          )}
          <button
            type="button"
            onClick={runAiVarietyMatcher}
            disabled={isAnalyzingAi}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${isAnalyzingAi ? "animate-spin" : ""}`}
            />
            {isAnalyzingAi
              ? "AI กำลังประมวลผลสายพันธุ์..."
              : "วิเคราะห์เปรียบเทียบสายพันธุ์ด้วย AI"}
          </button>
        </div>
      </div>

      {/* Step 1: Crop Family Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            1. เลือกกลุ่มพืชเศรษฐกิจเพื่อเปรียบเทียบสายพันธุ์ย่อย (Select Crop Family)
          </span>
          <span className="text-xs text-slate-400">
            กำลังวิเคราะห์พื้นที่:{" "}
            <strong className="text-emerald-300">{selectedDistrict.nameTh}</strong> (
            {selectedDistrict.zone})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {cropFamilyTabs.map((tab) => {
            const isSelected = selectedFamilyId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFamilyId(tab.id)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-md shadow-emerald-950/50"
                    : "bg-[#111B24] border-white/10 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? "text-emerald-300" : "text-slate-100"
                    }`}
                  >
                    {tab.labelTh}
                  </span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {tab.subLabelTh}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {tab.examplesTh}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Live Climate Heatmap Telemetry Bridge + Stress Simulator */}
      <div className="bg-[#111B24] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <ThermometerSun className="w-4 h-4" />
              2. ข้อมูลภูมิอากาศจาก Climate Heatmap ({selectedDistrict.nameTh})
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
              {effectiveClimate.microclimateTypeTh} · ความสูง {effectiveClimate.elevationM} ม.
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {selectedDistrict.soilSeriesName} (pH{" "}
              {selectedDistrict.defaultSoilTest.soilPh.toFixed(1)})
            </span>
          </div>

          {/* Time Slice Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                "afternoon_peak",
                "morning_root",
                "cool_season",
                "hot_dry",
              ] as ClimateTimeSliceMode[]
            ).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTimeSlice(mode)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  timeSlice === mode
                    ? "bg-amber-500 text-slate-950 font-semibold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {timeSliceMeta[mode].labelTh}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Readout Cards + Simulation Sliders */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-[#0B1218] border border-white/10 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">อุณหภูมิผิวดิน (5–10 ซม.)</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
              {effectiveClimate.groundTempC.toFixed(1)}°C
            </div>
            <div className="text-[11px] text-slate-400">
              อากาศ {effectiveClimate.airTempC.toFixed(1)}°C
            </div>
          </div>

          <div className="bg-[#0B1218] border border-white/10 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">ความชื้นสัมพัทธ์ (%RH)</div>
            <div className="text-lg font-bold font-mono text-sky-300 mt-0.5">
              {effectiveClimate.relativeHumidityPct}%
            </div>
            <div className="text-[11px] text-slate-400">
              ความชื้นดิน GISTDA {selectedDistrict.gistdaSoilMoisturePct}%
            </div>
          </div>

          <div className="bg-[#0B1218] border border-white/10 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">แรงดันไอน้ำบกพร่อง (VPD)</div>
            <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
              {effectiveClimate.vpdKpa.toFixed(2)} kPa
            </div>
            <div className="text-[11px] text-slate-400">
              การคายน้ำ {effectiveClimate.evapotranspirationMmDay} มม./วัน
            </div>
          </div>

          <div className="bg-[#0B1218] border border-white/10 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">ผลต่างอุณหภูมิกลางวัน-คืน</div>
            <div className="text-lg font-bold font-mono text-purple-300 mt-0.5">
              {effectiveClimate.diurnalDeltaC.toFixed(1)}°C
            </div>
            <div className="text-[11px] text-slate-400">
              เร่งการสะสมแป้ง/น้ำตาล
            </div>
          </div>

          {/* Interactive Ground Temp Offset Slider */}
          <div className="bg-[#0B1218] border border-amber-500/25 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-200 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                จำลองอุณหภูมิผิวดิน
              </span>
              <span className="font-mono font-bold text-amber-300">
                {tempSimOffsetC > 0 ? `+${tempSimOffsetC}` : tempSimOffsetC}°C
              </span>
            </div>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.5}
              value={tempSimOffsetC}
              onChange={(e) => setTempSimOffsetC(Number(e.target.value))}
              className="w-full accent-amber-400 mt-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>เย็นลง -4°C</span>
              <button
                type="button"
                onClick={() => setTempSimOffsetC(0)}
                className="text-amber-300 underline cursor-pointer"
              >
                ค่าจริง
              </button>
              <span>ร้อนขึ้น +4°C</span>
            </div>
          </div>

          {/* Interactive Humidity Offset Slider */}
          <div className="bg-[#0B1218] border border-sky-500/25 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-sky-200 flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                จำลองความชื้นสัมพัทธ์
              </span>
              <span className="font-mono font-bold text-sky-300">
                {humiditySimOffsetPct > 0
                  ? `+${humiditySimOffsetPct}`
                  : humiditySimOffsetPct}
                %
              </span>
            </div>
            <input
              type="range"
              min={-15}
              max={15}
              step={3}
              value={humiditySimOffsetPct}
              onChange={(e) => setHumiditySimOffsetPct(Number(e.target.value))}
              className="w-full accent-sky-400 mt-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>แล้ง -15%</span>
              <button
                type="button"
                onClick={() => setHumiditySimOffsetPct(0)}
                className="text-sky-300 underline cursor-pointer"
              >
                ค่าจริง
              </button>
              <span>ชื้น +15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: AI Champion Recommendation Banner + Deep Physiological Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 cols: #1 Champion Variety Spotlight Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950/60 via-[#101E26] to-[#0B1218] border border-emerald-400/40 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 text-xs font-bold">
                <Award className="w-4 h-4" />
                สายพันธุ์อันดับ 1 ที่ให้ผลผลิตสูงสุด ({selectedDistrict.nameTh})
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                AI Match {championVariety.overallMatchScore}%
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {aiReport?.recommendedTopVarietyTh || championVariety.spec.nameTh}
              </h3>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">
                รหัสสายพันธุ์: {championVariety.spec.varietyCode} ·{" "}
                {championVariety.spec.breederSourceTh}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-black/35 border border-white/10 rounded-lg p-2.5">
                <div className="text-[11px] text-slate-400">ผลผลิตคาดการณ์สูงสุด</div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-300 mt-0.5">
                  {championVariety.predictedYieldLabel}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />+
                  {aiReport?.yieldAdvantagePct ??
                    Math.max(9, championVariety.yieldAdvantageVsAvgPct)}
                  % เหนือพันธุ์ทั่วไป
                </div>
              </div>

              <div className="bg-black/35 border border-white/10 rounded-lg p-2.5">
                <div className="text-[11px] text-slate-400">รายได้คาดการณ์ต่อไร่</div>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-300 mt-0.5">
                  ฿
                  {championVariety.estimatedRevenuePerRaiThb.toLocaleString(
                    "th-TH"
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  ราคา ฿{championVariety.spec.farmgatePricePerUnitThb}/หน่วย
                </div>
              </div>

              <div className="bg-black/35 border border-white/10 rounded-lg p-2.5">
                <div className="text-[11px] text-slate-400">หน้าต่างอุณหภูมิเหมาะสม</div>
                <div className="text-sm sm:text-base font-bold font-mono text-sky-300 mt-0.5">
                  {championVariety.spec.optimalGroundTempMinC}–
                  {championVariety.spec.optimalGroundTempMaxC}°C
                </div>
                <div className="text-[11px] text-slate-400">
                  ความชื้น {championVariety.spec.optimalHumidityMinPct}–
                  {championVariety.spec.optimalHumidityMaxPct}%
                </div>
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                บทวิเคราะห์ AI เปรียบเทียบจุลภูมิอากาศ (AI Physiological Match)
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {aiReport?.climateComparisonAnalysisTh ||
                  `อุณหภูมิผิวดินปัจจุบันของ ${selectedDistrict.nameTh} ที่ ${effectiveClimate.groundTempC.toFixed(
                    1
                  )}°C และความชื้นสัมพัทธ์ ${
                    effectiveClimate.relativeHumidityPct
                  }% ตรงกับกรอบสรีรวิทยาของ ${
                    championVariety.spec.nameTh
                  } ทำให้ได้คะแนนความเหมาะสมสูงสุด ${
                    championVariety.overallMatchScore
                  }%`}
              </p>
            </div>
          </div>

          {/* Actionable Tips from AI */}
          <div className="border-t border-white/10 pt-3 space-y-1.5">
            <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              แนวทางจัดการแปลงใน {selectedDistrict.nameTh} เพื่อดึงผลผลิตสูงสุด:
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {(
                aiReport?.plantingAndMicroclimateManagementTips || [
                  championVariety.spec.microclimateManagementTipTh,
                  `รักษาระดับความชื้นผิวดินและค่า VPD (${effectiveClimate.vpdKpa.toFixed(
                    2
                  )} kPa) ให้สอดคล้องกับระยะเจริญเติบโต (${
                    championVariety.spec.maturityDaysLabel
                  })`,
                ]
              )
                .slice(0, 3)
                .map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Right 7 cols: Side-by-Side Candidate Variety Comparison Matrix */}
        <div className="lg:col-span-7 bg-[#111B24] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                ตารางเปรียบเทียบความเหมาะสมรายสายพันธุ์ย่อย ({selectedDistrict.nameTh})
              </h3>
              <p className="text-xs text-slate-400">
                เปรียบเทียบค่าความเข้ากันได้ของอุณหภูมิผิวดิน ความชื้นสัมพัทธ์/VPD และชุดดิน พร้อมคาดการณ์ผลผลิตต่อไร่
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              สายพันธุ์เปรียบเทียบ: {evaluatedFamilyVarieties.length} สายพันธุ์
            </span>
          </div>

          <div className="space-y-3">
            {evaluatedFamilyVarieties.map((item, idx) => {
              const isWinner = idx === 0;
              const isTempOptimal =
                effectiveClimate.groundTempC >=
                  item.spec.optimalGroundTempMinC &&
                effectiveClimate.groundTempC <= item.spec.optimalGroundTempMaxC;
              const isHumOptimal =
                effectiveClimate.relativeHumidityPct >=
                  item.spec.optimalHumidityMinPct &&
                effectiveClimate.relativeHumidityPct <=
                  item.spec.optimalHumidityMaxPct;

              return (
                <div
                  key={item.spec.id}
                  className={`rounded-lg border p-3.5 transition-all ${
                    isWinner
                      ? "bg-emerald-950/30 border-emerald-400/50"
                      : "bg-[#0B1218] border-white/10"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            isWinner
                              ? "bg-emerald-400 text-slate-950"
                              : "bg-white/10 text-slate-200"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-100">
                          {item.spec.nameTh}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {item.spec.varietyCode}
                        </span>
                        {isWinner && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            แนะนำอันดับ 1 สูงสุดในพื้นที่
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.spec.qualityAttributeTh} · {item.spec.maturityDaysLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">ผลผลิตคาดการณ์</div>
                        <div className="text-sm font-bold font-mono text-emerald-300">
                          {item.predictedYieldLabel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">รายได้/ไร่</div>
                        <div className="text-sm font-bold font-mono text-amber-300">
                          ฿{item.estimatedRevenuePerRaiThb.toLocaleString("th-TH")}
                        </div>
                      </div>
                      <div
                        className={`px-2.5 py-1.5 rounded-lg text-center min-w-[64px] border ${
                          item.overallMatchScore >= 82
                            ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                            : item.overallMatchScore >= 68
                            ? "bg-sky-500/20 border-sky-400/40 text-sky-300"
                            : "bg-amber-500/20 border-amber-400/40 text-amber-300"
                        }`}
                      >
                        <div className="text-[10px] uppercase">Match</div>
                        <div className="text-sm font-bold font-mono">
                          {item.overallMatchScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Sub-score progress bars: Ground Temp Fit, Humidity/VPD Fit, Soil pH Fit */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-2.5 border-t border-white/10">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          อุณหภูมิผิวดิน ({item.spec.optimalGroundTempMinC}–
                          {item.spec.optimalGroundTempMaxC}°C)
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            isTempOptimal ? "text-emerald-300" : "text-amber-300"
                          }`}
                        >
                          {item.tempScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.tempScore >= 80
                              ? "bg-emerald-400"
                              : item.tempScore >= 65
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${item.tempScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          ความชื้น & VPD ({item.spec.optimalHumidityMinPct}–
                          {item.spec.optimalHumidityMaxPct}% RH)
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            isHumOptimal ? "text-sky-300" : "text-amber-300"
                          }`}
                        >
                          {item.humidityVpdScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.humidityVpdScore >= 80
                              ? "bg-sky-400"
                              : item.humidityVpdScore >= 65
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${item.humidityVpdScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">
                          ชุดดิน & pH ({item.spec.optimalSoilPhMin}–
                          {item.spec.optimalSoilPhMax})
                        </span>
                        <span className="font-mono font-semibold text-purple-300">
                          {item.soilPhScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-400"
                          style={{ width: `${item.soilPhScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Strength & Risk Footnote */}
                  <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs">
                    <span className="text-slate-300">
                      <strong className="text-emerald-300">จุดเด่น:</strong>{" "}
                      {item.spec.keyStrengthTh}
                    </span>
                    <span className="text-amber-300/90 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {item.spec.climateRiskNoteTh}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 4: Highest-Yielding Variety Recommendation by Korat's 6 Agro-Ecological Zones */}
      <div className="bg-[#111B24] border border-white/10 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              แผนผังแนะนำสายพันธุ์พืชที่ให้ผลผลิตสูงสุดแยกตาม 6 โซนเกษตรนิเวศของโคราช (32 อำเภอ)
            </h3>
            <p className="text-xs text-slate-400">
              สรุปการจับคู่จุลภูมิอากาศเฉลี่ยของแต่ละโซนกับสายพันธุ์ที่ชนะเลิศในกลุ่ม{" "}
              <strong className="text-emerald-300">
                {cropFamilyTabs.find((t) => t.id === selectedFamilyId)?.labelTh}
              </strong>{" "}
              คลิกที่ชื่ออำเภอเพื่อสลับดูผลวิเคราะห์รายพื้นที่ได้ทันที
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 font-medium">
            อัปเดตตาม Climate Heatmap แบบเรียลไทม์
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {koratZoneSummaries.map((zone) => {
            const isCurrentDistrictInZone = zone.districtIds.includes(
              selectedDistrict.id
            );

            return (
              <div
                key={zone.zoneId}
                className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isCurrentDistrictInZone
                    ? "bg-emerald-950/25 border-emerald-400/50 shadow-lg"
                    : "bg-[#0B1218] border-white/10"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {zone.zoneTitleTh}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {zone.subDescriptionTh}
                      </p>
                    </div>
                    {isCurrentDistrictInZone && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold shrink-0">
                        โซนที่เลือกอยู่
                      </span>
                    )}
                  </div>

                  {/* Zone Climate Heatmap Averages */}
                  <div className="grid grid-cols-4 gap-1.5 bg-white/5 rounded-lg p-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">ผิวดินเฉลี่ย</div>
                      <div className="text-xs font-bold font-mono text-amber-300">
                        {zone.avgGroundTempC}°C
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ความชื้น</div>
                      <div className="text-xs font-bold font-mono text-sky-300">
                        {zone.avgHumidityPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">VPD</div>
                      <div className="text-xs font-bold font-mono text-emerald-300">
                        {zone.avgVpdKpa} kPa
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ดิน pH</div>
                      <div className="text-xs font-bold font-mono text-purple-300">
                        {zone.avgSoilPh}
                      </div>
                    </div>
                  </div>

                  {/* #1 Recommended Variety in Selected Crop Family */}
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        อันดับ 1 แนะนำสูงสุดในโซนนี้:
                      </span>
                      <span className="font-mono font-bold text-emerald-300">
                        Match {zone.topVariety.overallMatchScore}%
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {zone.topVariety.spec.nameTh}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-slate-300">
                        ผลผลิตคาดการณ์:{" "}
                        <strong className="text-emerald-300 font-mono">
                          {zone.topVariety.predictedYieldLabel}
                        </strong>
                      </span>
                      <span className="text-amber-300 font-mono font-semibold">
                        ฿
                        {zone.topVariety.estimatedRevenuePerRaiThb.toLocaleString(
                          "th-TH"
                        )}
                        /ไร่
                      </span>
                    </div>
                  </div>

                  {/* #2 Runner-Up Variety */}
                  <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-white/5 text-slate-300">
                    <span className="truncate">
                      <strong className="text-slate-400">อันดับ 2 รองลงมา:</strong>{" "}
                      {zone.runnerUpVariety.spec.varietyCode} (
                      {zone.runnerUpVariety.predictedYieldLabel})
                    </span>
                    <span className="font-mono text-sky-300 shrink-0 ml-2">
                      {zone.runnerUpVariety.overallMatchScore}%
                    </span>
                  </div>
                </div>

                {/* Clickable District Chips in this Zone */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] text-slate-400 mb-1.5">
                    คลิกเลือกอำเภอในโซนนี้เพื่อดูผลวิเคราะห์เจาะลึก:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {zone.districtIds.map((distId) => {
                      const dObj = KORAT_DISTRICTS.find((d) => d.id === distId);
                      if (!dObj) return null;
                      const isDistSelected = dObj.id === selectedDistrict.id;
                      return (
                        <button
                          key={dObj.id}
                          type="button"
                          onClick={() => onSelectDistrict(dObj.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                            isDistSelected
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-white/5 hover:bg-white/15 text-slate-300"
                          }`}
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          {dObj.nameTh.replace("อ.", "")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
