import React, { useState, useMemo } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  Mountain,
  ThermometerSun,
  Droplets,
  Calendar,
  Sparkles,
  Award,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Clock,
  ShoppingBag,
  Layers,
  Sun,
  CloudRain,
  Sprout,
  SlidersHorizontal,
} from "lucide-react";

export type PremiumFruitType = "all" | "durian" | "rambutan" | "mangosteen";
export type HeatmapMetricMode =
  | "overall"
  | "humidity"
  | "night_chill"
  | "volcanic_soil";

interface PremiumFruitInsightsModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
}

interface MicroclimateZoneCell {
  id: string;
  districtId: string;
  districtNameTh: string;
  subzoneNameTh: string;
  gridRow: number; // 0..2 (North-to-South along southern rim)
  gridCol: number; // 0..3 (West-to-East from Pak Chong to Soeng Sang)
  elevationM: number;
  avgRelativeHumidityPct: number;
  drySeasonNightTempC: number;
  soilTypeTh: string;
  soilPh: number;
  organicMatterPct: number;
  drainageRating: "ดีเยี่ยม" | "ดีมาก" | "ดี";
  waterSourceTh: string;
  suitabilityScores: {
    durian: number;
    rambutan: number;
    mangosteen: number;
    overall: number;
  };
  giStatus: string;
  flavorSignature: string;
}

interface FruitMasterProfile {
  id: "durian" | "rambutan" | "mangosteen";
  nameTh: string;
  varietyTh: string;
  scientificName: string;
  giBadge: string;
  daysFromBloomToHarvestLowland: number;
  daysFromBloomToHarvestHighland: number;
  optimalHumidityRange: string;
  optimalNightChillC: string;
  optimalSoilPh: string;
  harvestMonths: number[]; // 1-12
  harvestPeriodText: string;
  flavorProfile: string;
  baseYieldKgPerRai: number;
  wholesalePriceBahtKg: number;
  giPreorderPriceBahtKg: number;
  agritourismBonusPerRai: number;
  dryMatterTargetPct?: number;
}

const PREMIUM_FRUITS: Record<"durian" | "rambutan" | "mangosteen", FruitMasterProfile> = {
  durian: {
    id: "durian",
    nameTh: "ทุเรียนโคราช (Durian)",
    varietyTh: "หมอนทองปากช่อง-เขาใหญ่ GI & โซนดงพญาเย็น",
    scientificName: "Durio zibethinus Murray",
    giBadge: "ขึ้นทะเบียน GI ทุเรียนปากช่อง-เขาใหญ่",
    daysFromBloomToHarvestLowland: 120,
    daysFromBloomToHarvestHighland: 127,
    optimalHumidityRange: "75% – 85%",
    optimalNightChillC: "15°C – 18°C (ธ.ค.–ม.ค.)",
    optimalSoilPh: "5.5 – 6.5 (ดินภูเขาไฟผุ/ร่วนปนทราย)",
    harvestMonths: [5, 6, 7],
    harvestPeriodText: "พฤษภาคม – กรกฎาคม",
    flavorProfile: "เนื้อละเอียด แห้งมัน เนื้อแน่นไม่เละ กลิ่นหอมละมุน ไม่หวานแหลม",
    baseYieldKgPerRai: 1650,
    wholesalePriceBahtKg: 135,
    giPreorderPriceBahtKg: 195,
    agritourismBonusPerRai: 18500,
    dryMatterTargetPct: 32,
  },
  rambutan: {
    id: "rambutan",
    nameTh: "เงาะโคราช (Rambutan)",
    varietyTh: "พันธุ์โรงเรียน (ครบุรี · เสิงสาง · วังน้ำเขียว)",
    scientificName: "Nephelium lappaceum L.",
    giBadge: "เนื้อแห้ง กรอบ ร่อน ไม่ติดเมล็ด",
    daysFromBloomToHarvestLowland: 105,
    daysFromBloomToHarvestHighland: 112,
    optimalHumidityRange: "78% – 86%",
    optimalNightChillC: "16°C – 19°C (ม.ค.–ก.พ.)",
    optimalSoilPh: "5.5 – 6.5 (ดินร่วนปนทรายแร่ธาตุสูง)",
    harvestMonths: [6, 7, 8],
    harvestPeriodText: "มิถุนายน – สิงหาคม",
    flavorProfile: "เปลือกแดงสด ขนยาวปลายเขียว เนื้อแห้ง กรอบ ร่อน ไม่ติดเมล็ด",
    baseYieldKgPerRai: 2100,
    wholesalePriceBahtKg: 28,
    giPreorderPriceBahtKg: 46,
    agritourismBonusPerRai: 9800,
  },
  mangosteen: {
    id: "mangosteen",
    nameTh: "มังคุดโคราช (Mangosteen)",
    varietyTh: "มังคุดเขาใหญ่-วังน้ำเขียว-ครบุรี",
    scientificName: "Garcinia mangostana L.",
    giBadge: "เปลือกบาง เนื้อขาวฟู พรีเมียมหายาก",
    daysFromBloomToHarvestLowland: 112,
    daysFromBloomToHarvestHighland: 118,
    optimalHumidityRange: "80% – 88%",
    optimalNightChillC: "16°C – 19°C (ม.ค.–ก.พ.)",
    optimalSoilPh: "5.5 – 6.2 (ดินร่วนอินทรียวัตถุสูง ชื้นสม่ำเสมอ)",
    harvestMonths: [6, 7, 8],
    harvestPeriodText: "มิถุนายน – สิงหาคม",
    flavorProfile: "เปลือกบาง เนื้อขาวฟูเป็นกลีบ หวานซ่อนเปรี้ยว สดชื่น ไม่มียางไหลในผล",
    baseYieldKgPerRai: 1350,
    wholesalePriceBahtKg: 55,
    giPreorderPriceBahtKg: 88,
    agritourismBonusPerRai: 12500,
  },
};

const MICROCLIMATE_HEATMAP_ZONES: MicroclimateZoneCell[] = [
  {
    id: "pc-khlong-muang",
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    subzoneNameTh: "ต.คลองม่วง · ต.หนองสาหร่าย (เนินเขาไฟเก่า)",
    gridRow: 0,
    gridCol: 0,
    elevationM: 430,
    avgRelativeHumidityPct: 81,
    drySeasonNightTempC: 15.8,
    soilTypeTh: "ชุดดินปากช่อง (ดินเหนียวปนตะกอนภูเขาไฟสีแดง)",
    soilPh: 6.1,
    organicMatterPct: 3.4,
    drainageRating: "ดีเยี่ยม",
    waterSourceTh: "ลำตะคองตอนบน & สระเก็บน้ำประจำสวน",
    suitabilityScores: {
      durian: 98,
      rambutan: 86,
      mangosteen: 91,
      overall: 95,
    },
    giStatus: "เขต GI ทุเรียนปากช่อง-เขาใหญ่ แท้ 100%",
    flavorSignature: "เนื้อแห้งเนียนละเอียด สีเหลืองทอง หอมละมุน",
  },
  {
    id: "pc-mo-si",
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    subzoneNameTh: "ต.หมูสี · ต.โป่งตาลอง (แนวขอบอุทยานฯ เขาใหญ่)",
    gridRow: 1,
    gridCol: 0,
    elevationM: 510,
    avgRelativeHumidityPct: 85,
    drySeasonNightTempC: 14.9,
    soilTypeTh: "ดินร่วนปนดินภูเขาไฟอินทรียวัตถุสูง",
    soilPh: 5.9,
    organicMatterPct: 3.8,
    drainageRating: "ดีเยี่ยม",
    waterSourceTh: "น้ำซับธรรมชาติเขาใหญ่ & ระบบน้ำหยดอัจฉริยะ",
    suitabilityScores: {
      durian: 96,
      rambutan: 89,
      mangosteen: 95,
      overall: 94,
    },
    giStatus: "เขต GI ทุเรียนปากช่อง-เขาใหญ่ & สวนท่องเที่ยวเชิงเกษตร",
    flavorSignature: "มังคุดเปลือกบางเนื้อขาวฟู · ทุเรียนสุกช้าเนื้อแน่นมัน",
  },
  {
    id: "wnk-thai-samakkhi",
    districtId: "wang-nam-khiao",
    districtNameTh: "อ.วังน้ำเขียว",
    subzoneNameTh: "ต.ไทยสามัคคี · ต.วังน้ำเขียว (หุบเขาโอโซน)",
    gridRow: 1,
    gridCol: 1,
    elevationM: 480,
    avgRelativeHumidityPct: 86,
    drySeasonNightTempC: 15.2,
    soilTypeTh: "ดินร่วนปนทรายเชิงเขาแร่ธาตุโพแทสเซียมสูง",
    soilPh: 5.8,
    organicMatterPct: 3.5,
    drainageRating: "ดีเยี่ยม",
    waterSourceTh: "อ่างเก็บน้ำบ้านสันกำแพง & ลำพระเพลิงตอนบน",
    suitabilityScores: {
      durian: 95,
      rambutan: 94,
      mangosteen: 96,
      overall: 95,
    },
    giStatus: "โซนศักยภาพสูงสุดครบทั้ง 3 ชนิด (ทุเรียน·เงาะ·มังคุด)",
    flavorSignature: "อากาศเย็นชื้นตลอดปี กระตุ้นการติดดอกมังคุดและเงาะดีเยี่ยม",
  },
  {
    id: "wnk-wang-mi",
    districtId: "wang-nam-khiao",
    districtNameTh: "อ.วังน้ำเขียว",
    subzoneNameTh: "ต.วังหมี · ต.ระเริง (รอยต่อปากช่อง-วังน้ำเขียว)",
    gridRow: 0,
    gridCol: 1,
    elevationM: 445,
    avgRelativeHumidityPct: 82,
    drySeasonNightTempC: 16.0,
    soilTypeTh: "ดินภูเขาไฟเก่าผสมดินร่วนปนทรายระบายน้ำดี",
    soilPh: 6.0,
    organicMatterPct: 3.2,
    drainageRating: "ดีเยี่ยม",
    waterSourceTh: "เขื่อนลำพระเพลิงตอนบน",
    suitabilityScores: {
      durian: 94,
      rambutan: 90,
      mangosteen: 91,
      overall: 92,
    },
    giStatus: "แหล่งผลิตทุเรียน-มังคุดนอกฤดูกาลและท่องเที่ยวเชิงเกษตร",
    flavorSignature: "เนื้อแน่น แห้งมัน ไม่เป็นเต่าเผาหรือไส้ซึม",
  },
  {
    id: "kb-khok-krachai",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    subzoneNameTh: "ต.โคกกระชาย · ต.ลำเพียก (ต้นน้ำมูล-ดงพญาเย็น)",
    gridRow: 2,
    gridCol: 1,
    elevationM: 340,
    avgRelativeHumidityPct: 83,
    drySeasonNightTempC: 16.8,
    soilTypeTh: "ดินภูเขาไฟบะซอลต์เก่า & ดินร่วนปนทรายลึก",
    soilPh: 5.9,
    organicMatterPct: 3.1,
    drainageRating: "ดีเยี่ยม",
    waterSourceTh: "เขื่อนมูลบน & เขื่อนลำแชะ (น้ำต้นทุนมั่นคงที่สุด)",
    suitabilityScores: {
      durian: 96,
      rambutan: 97,
      mangosteen: 93,
      overall: 96,
    },
    giStatus: "แหล่งปลูกเงาะโรงเรียนและทุเรียนแปลงใหญ่ อ.ครบุรี",
    flavorSignature: "เงาะโรงเรียนเนื้อแห้งกรอบร่อน · ทุเรียนหวานมันกลมกล่อม",
  },
  {
    id: "kb-chorakhe-hin",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    subzoneNameTh: "ต.จระเข้หิน · ต.บ้านใหม่ (ที่ลาดเชิงเขาครบุรี)",
    gridRow: 1,
    gridCol: 2,
    elevationM: 295,
    avgRelativeHumidityPct: 79,
    drySeasonNightTempC: 17.4,
    soilTypeTh: "ชุดดินครบุรี (ดินร่วนเหนียวปนกรวดภูเขาไฟ)",
    soilPh: 6.1,
    organicMatterPct: 2.9,
    drainageRating: "ดีมาก",
    waterSourceTh: "คลองส่งน้ำเขื่อนลำแชะ",
    suitabilityScores: {
      durian: 92,
      rambutan: 94,
      mangosteen: 88,
      overall: 91,
    },
    giStatus: "กลุ่มแปลงใหญ่ไม้ผลเศรษฐกิจ อ.ครบุรี",
    flavorSignature: "ออกสู่ตลาดเร็วกว่าโซนเขาใหญ่ 7-10 วัน ได้ราคาต้นฤดู",
  },
  {
    id: "ss-non-som-bun",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    subzoneNameTh: "ต.โนนสมบูรณ์ · ต.สระตะเคียน (ริมอุทยานฯ ทับลาน)",
    gridRow: 2,
    gridCol: 2,
    elevationM: 325,
    avgRelativeHumidityPct: 82,
    drySeasonNightTempC: 16.9,
    soilTypeTh: "ดินภูเขาไฟเก่าสีแดงคล้ำ ธาตุโพแทสเซียม-แมกนีเซียมสูง",
    soilPh: 6.0,
    organicMatterPct: 3.3,
    drainageRating: "ดีเยี่ยม",
    waterSourceTh: "เขื่อนลำปลายมาศ & อ่างเก็บน้ำห้วยเตย",
    suitabilityScores: {
      durian: 95,
      rambutan: 96,
      mangosteen: 89,
      overall: 94,
    },
    giStatus: "แหล่งผลิตทุเรียน-เงาะโรงเรียนคุณภาพพรีเมียม อ.เสิงสาง",
    flavorSignature: "เงาะเปลือกแดงสดขนเขียว · ทุเรียนเนื้อแน่นหวานมัน",
  },
  {
    id: "nbm-ban-mai",
    districtId: "nong-bun-mak",
    districtNameTh: "อ.หนองบุญมาก",
    subzoneNameTh: "ต.บ้านใหม่ · ต.หนองบุนนาก (ที่ดอนดินร่วนปนทราย)",
    gridRow: 0,
    gridCol: 2,
    elevationM: 245,
    avgRelativeHumidityPct: 74,
    drySeasonNightTempC: 18.1,
    soilTypeTh: "ดินร่วนปนทรายระบายน้ำดี (ต้องเสริมระบบน้ำหยดและอินทรียวัตถุ)",
    soilPh: 5.7,
    organicMatterPct: 2.4,
    drainageRating: "ดีมาก",
    waterSourceTh: "สระเก็บน้ำในไร่นา & คลองส่งน้ำลำแชะตอนล่าง",
    suitabilityScores: {
      durian: 86,
      rambutan: 88,
      mangosteen: 79,
      overall: 85,
    },
    giStatus: "พื้นที่ขยายใหม่ไม้ผลทางเลือกแทนพืชไร่ (High-Value Diversification)",
    flavorSignature: "เก็บเกี่ยวผลผลิตได้ไว (ต้นเดือนพฤษภาคม) ลดปัญหาโรครากเน่า",
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

const MONTHLY_MICROCLIMATE_MATRIX = [
  {
    monthIdx: 1,
    label: "ม.ค.",
    nightChillC: 15.8,
    rhPct: 68,
    rainMm: 12,
    stageDurian: "กักน้ำ·กระตุ้นตาดอก",
    stageRambutan: "กักน้ำ·สะสมตาดอก",
    stageMangosteen: "พักต้น·สะสมความเย็น",
    riskNote: "อากาศเย็นกลางคืน 15-17°C ช่วยเปิดตาดอกดีเยี่ยม",
  },
  {
    monthIdx: 2,
    label: "ก.พ.",
    nightChillC: 17.2,
    rhPct: 70,
    rainMm: 22,
    stageDurian: "ดอกบาน·หางแย้ไหม้",
    stageRambutan: "แทงช่อดอก·ดอกบาน",
    stageMangosteen: "แทงช่อดอก·ติดผลอ่อน",
    riskNote: "ควบคุมการให้น้ำสม่ำเสมอ ป้องกันดอกร่วงจากอากาศร้อนสลับเย็น",
  },
  {
    monthIdx: 3,
    label: "มี.ค.",
    nightChillC: 20.5,
    rhPct: 72,
    rainMm: 48,
    stageDurian: "ผลอ่อนขนาดไข่ไก่·คัดผล",
    stageRambutan: "ติดผลอ่อน·ขึ้นลูก",
    stageMangosteen: "ขยายขนาดผลอ่อน",
    riskNote: "เฝ้าระวังพายุฤดูร้อนและเพลี้ยไฟ-ไรแดงในช่วงแล้ง",
  },
  {
    monthIdx: 4,
    label: "เม.ย.",
    nightChillC: 22.4,
    rhPct: 75,
    rainMm: 95,
    stageDurian: "ขยายพู·สะสมแป้ง (0-0-50)",
    stageRambutan: "สร้างเนื้อ·เพิ่มความหวาน",
    stageMangosteen: "ขยายผล·ป้องกันยางไหล",
    riskNote: "ให้น้ำสม่ำเสมอป้องกันผลแตกและอาการเนื้อแก้วในมังคุด",
  },
  {
    monthIdx: 5,
    label: "พ.ค.",
    nightChillC: 23.0,
    rhPct: 81,
    rainMm: 165,
    stageDurian: "เก็บเกี่ยวมีดแรก (ต้นฤดู)",
    stageRambutan: "เริ่มเข้าสีเหลือง-แดง",
    stageMangosteen: "ผลแก่จัด·เริ่มเข้าสีสายเลือด",
    riskNote: "ตรวจเปอร์เซ็นต์แป้งทุเรียน ≥32% ก่อนตัด · เริ่มเปิดจอง Pre-order",
  },
  {
    monthIdx: 6,
    label: "มิ.ย.",
    nightChillC: 22.8,
    rhPct: 84,
    rainMm: 175,
    stageDurian: "เก็บเกี่ยวหลัก (Peak GI)",
    stageRambutan: "เก็บเกี่ยวหลัก (กรอบร่อน)",
    stageMangosteen: "เก็บเกี่ยวหลัก (เนื้อขาวฟู)",
    riskNote: "ช่วงพีคเทศกาลผลไม้โคราช & ท่องเที่ยวเชิงเกษตร ปากช่อง-วังน้ำเขียว-ครบุรี",
  },
  {
    monthIdx: 7,
    label: "ก.ค.",
    nightChillC: 22.5,
    rhPct: 85,
    rainMm: 185,
    stageDurian: "เก็บเกี่ยวปลายฤดู·ฟื้นต้น",
    stageRambutan: "เก็บเกี่ยวต่อเนื่อง",
    stageMangosteen: "เก็บเกี่ยวต่อเนื่อง",
    riskNote: "ทุเรียนโซนสูง (วังน้ำเขียว-เขาใหญ่) ออกตลาดช่วงราคาดี",
  },
  {
    monthIdx: 8,
    label: "ส.ค.",
    nightChillC: 22.2,
    rhPct: 86,
    rainMm: 210,
    stageDurian: "ตัดแต่งกิ่ง·ทำใบชุดที่ 1",
    stageRambutan: "เก็บเกี่ยวรุ่นสุดท้าย·ฟื้นต้น",
    stageMangosteen: "เก็บเกี่ยวรุ่นสุดท้าย·ฟื้นต้น",
    riskNote: "ระบายน้ำในแปลงป้องกันโรครากเน่าโคนเน่า (Phytophthora) ช่วงฝนชุก",
  },
  {
    monthIdx: 9,
    label: "ก.ย.",
    nightChillC: 21.8,
    rhPct: 88,
    rainMm: 265,
    stageDurian: "บำรุงใบชุดที่ 2·เติมเชื้อไตรโคเดอร์มา",
    stageRambutan: "ตัดแต่งกิ่ง·ใส่ปุ๋ยอินทรีย์",
    stageMangosteen: "บำรุงต้น·สะสมอาหารใบอ่อน",
    riskNote: "เดือนฝนชุกที่สุด ตรวจสอบร่องระบายน้ำและค่า pH ดิน",
  },
  {
    monthIdx: 10,
    label: "ต.ค.",
    nightChillC: 20.1,
    rhPct: 82,
    rainMm: 145,
    stageDurian: "สะสมอาหารใบชุดที่ 3 (8-24-24)",
    stageRambutan: "บำรุงใบแก่พร้อมรับลมหนาว",
    stageMangosteen: "สะสมอาหารในใบแก่",
    riskNote: "ปลายฝนต้นหนาว สะสมฟอสฟอรัส-โพแทสเซียมเตรียมเปิดตาดอก",
  },
  {
    monthIdx: 11,
    label: "พ.ย.",
    nightChillC: 17.8,
    rhPct: 74,
    rainMm: 35,
    stageDurian: "ใบแก่จัด·เริ่มลดน้ำ",
    stageRambutan: "ใบแก่สมบูรณ์·เริ่มงดน้ำ",
    stageMangosteen: "พักต้นรออากาศเย็น",
    riskNote: "ลมหนาวระลอกแรกเข้าโคราช ช่วยหยุดการแตกใบอ่อน",
  },
  {
    monthIdx: 12,
    label: "ธ.ค.",
    nightChillC: 15.5,
    rhPct: 69,
    rainMm: 8,
    stageDurian: "โศกน้ำ·กระตุ้นตาดอกรุ่นแรก",
    stageRambutan: "กักน้ำกระตุ้นตาดอก",
    stageMangosteen: "สะสมความเย็นกระตุ้นดอก",
    riskNote: "อุณหภูมิกลางคืนลดต่ำ 14-16°C ในโซนเขา กระตุ้นการออกดอกธรรมชาติ",
  },
];

export const PremiumFruitInsightsModule: React.FC<
  PremiumFruitInsightsModuleProps
> = ({ selectedDistrict, onSelectDistrict }) => {
  const [selectedFruit, setSelectedFruit] = useState<PremiumFruitType>("all");
  const [heatmapMetric, setHeatmapMetric] =
    useState<HeatmapMetricMode>("overall");
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    "pc-khlong-muang"
  );

  // Harvest Planner interactive states
  const [plannerFruit, setPlannerFruit] = useState<
    "durian" | "rambutan" | "mangosteen"
  >("durian");
  const [plannerZoneId, setPlannerZoneId] =
    useState<string>("pc-khlong-muang");
  const [bloomDateStr, setBloomDateStr] = useState<string>("2026-02-10");
  const [orchardAreaRai, setOrchardAreaRai] = useState<number>(10);
  const [treeAgeYears, setTreeAgeYears] = useState<number>(8);
  const [giPreorderSharePct, setGiPreorderSharePct] = useState<number>(60);
  const [includeAgritourism, setIncludeAgritourism] = useState<boolean>(true);

  const activeZone = useMemo(() => {
    return (
      MICROCLIMATE_HEATMAP_ZONES.find((z) => z.id === selectedZoneId) ||
      MICROCLIMATE_HEATMAP_ZONES[0]
    );
  }, [selectedZoneId]);

  const plannerZone = useMemo(() => {
    return (
      MICROCLIMATE_HEATMAP_ZONES.find((z) => z.id === plannerZoneId) ||
      MICROCLIMATE_HEATMAP_ZONES[0]
    );
  }, [plannerZoneId]);

  const activeFruitProfile = PREMIUM_FRUITS[plannerFruit];

  // Calculate heat score for any zone cell based on selectedFruit and heatmapMetric
  const getCellDisplayMetric = (cell: MicroclimateZoneCell) => {
    if (heatmapMetric === "humidity") {
      return {
        valueLabel: `${cell.avgRelativeHumidityPct}% RH`,
        subLabel: `ความชื้นสัมพัทธ์`,
        scoreNormalized: Math.min(
          100,
          Math.max(40, Math.round((cell.avgRelativeHumidityPct - 60) * 3.5))
        ),
      };
    }
    if (heatmapMetric === "night_chill") {
      // Lower night temp (14.5 - 18.5C) = stronger flowering induction score
      const chillScore = Math.min(
        99,
        Math.max(60, Math.round(100 - (cell.drySeasonNightTempC - 14.5) * 8))
      );
      return {
        valueLabel: `${cell.drySeasonNightTempC.toFixed(1)}°C`,
        subLabel: `อุณหภูมิคืนฤดูแล้ง`,
        scoreNormalized: chillScore,
      };
    }
    if (heatmapMetric === "volcanic_soil") {
      const soilScore = Math.min(
        99,
        Math.round(cell.organicMatterPct * 26 + (cell.elevationM > 350 ? 6 : 2))
      );
      return {
        valueLabel: `pH ${cell.soilPh.toFixed(1)} · OM ${cell.organicMatterPct}%`,
        subLabel: `แร่ธาตุดินภูเขาไฟ`,
        scoreNormalized: soilScore,
      };
    }

    // Default: suitability score
    const score =
      selectedFruit === "all"
        ? cell.suitabilityScores.overall
        : cell.suitabilityScores[selectedFruit];

    return {
      valueLabel: `${score}/100`,
      subLabel:
        selectedFruit === "all"
          ? "ดัชนีรวม 3 ผลไม้"
          : selectedFruit === "durian"
          ? "ความเหมาะสมทุเรียน"
          : selectedFruit === "rambutan"
          ? "ความเหมาะสมเงาะ"
          : "ความเหมาะสมมังคุด",
      scoreNormalized: score,
    };
  };

  const getHeatColorClasses = (score: number, isSelected: boolean) => {
    const ringClass = isSelected
      ? "ring-2 ring-white shadow-[0_0_24px_rgba(20,184,166,0.45)] scale-[1.01]"
      : "hover:border-[#2DD4BF]/70";

    if (score >= 94) {
      return `bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-[#0B1424] border-emerald-400/70 text-emerald-100 ${ringClass}`;
    }
    if (score >= 90) {
      return `bg-gradient-to-br from-[#14B8A6]/25 via-cyan-500/15 to-[#0B1424] border-[#2DD4BF]/60 text-teal-100 ${ringClass}`;
    }
    if (score >= 85) {
      return `bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-[#0B1424] border-amber-400/60 text-amber-100 ${ringClass}`;
    }
    return `bg-gradient-to-br from-orange-500/20 via-slate-800/40 to-[#0B1424] border-orange-400/50 text-orange-100 ${ringClass}`;
  };

  // Harvest Planner Calculations
  const harvestPlan = useMemo(() => {
    const parsedBloom = new Date(bloomDateStr);
    const baseBloomDate = isNaN(parsedBloom.getTime())
      ? new Date("2026-02-10")
      : parsedBloom;

    const isHighland = plannerZone.elevationM >= 400;
    const totalMaturityDays = isHighland
      ? activeFruitProfile.daysFromBloomToHarvestHighland
      : activeFruitProfile.daysFromBloomToHarvestLowland;

    const addDays = (d: Date, days: number) => {
      const copy = new Date(d.getTime());
      copy.setDate(copy.getDate() + days);
      return copy;
    };

    const formatThaiDate = (d: Date) =>
      d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    const dryMatterCheckDate = addDays(baseBloomDate, totalMaturityDays - 10);
    const firstCutDate = addDays(baseBloomDate, totalMaturityDays);
    const peakCutDate = addDays(baseBloomDate, totalMaturityDays + 7);
    const finalCutDate = addDays(baseBloomDate, totalMaturityDays + 16);

    // Tree age yield factor (young trees 4-5 yrs yield ~65%, prime trees 8-15 yrs yield 100-115%)
    const ageFactor =
      treeAgeYears < 5
        ? 0.55
        : treeAgeYears < 7
        ? 0.82
        : treeAgeYears <= 14
        ? 1.08
        : 1.0;

    const suitabilityFactor =
      plannerZone.suitabilityScores[plannerFruit] / 95;

    const yieldPerRaiKg = Math.round(
      activeFruitProfile.baseYieldKgPerRai * ageFactor * suitabilityFactor
    );
    const totalYieldKg = yieldPerRaiKg * orchardAreaRai;

    const giDirectVolumeKg = Math.round(
      (totalYieldKg * giPreorderSharePct) / 100
    );
    const wholesaleVolumeKg = totalYieldKg - giDirectVolumeKg;

    const giDirectRevenue =
      giDirectVolumeKg * activeFruitProfile.giPreorderPriceBahtKg;
    const wholesaleRevenue =
      wholesaleVolumeKg * activeFruitProfile.wholesalePriceBahtKg;
    const agritourismRevenue = includeAgritourism
      ? activeFruitProfile.agritourismBonusPerRai * orchardAreaRai
      : 0;

    const totalProjectedRevenue =
      giDirectRevenue + wholesaleRevenue + agritourismRevenue;
    const pureWholesaleBaseline =
      totalYieldKg * activeFruitProfile.wholesalePriceBahtKg;
    const valueAddedGain = totalProjectedRevenue - pureWholesaleBaseline;

    const milestones = [
      {
        step: "ระยะที่ 1",
        title: "ดอกบาน · หางแย้ไหม้ (ผสมเกสร)",
        dateLabel: formatThaiDate(baseBloomDate),
        dayOffset: "วันที่ 0",
        action:
          "ลดปริมาณน้ำเหลือ 30-40% ป้องกันดอกร่วง พ่นแคลเซียม-โบรอนเสริมความแข็งแรงขั้วผล",
        fertilizerFormula: "แคลเซียม-โบรอนทางใบ + งดปุ๋ยไนโตรเจนสูง",
      },
      {
        step: "ระยะที่ 2",
        title: "ติดผลอ่อน (ขนาดไข่นกกระทา–ไข่ไก่) · คัดแต่งผล",
        dateLabel: formatThaiDate(addDays(baseBloomDate, 28)),
        dayOffset: "วันที่ +28",
        action:
          "ตัดแต่งผลบิดเบี้ยวออก เหลือผลทรงสวยตามกำลังใบ และเพิ่มน้ำแบบสม่ำเสมอทุกเช้า",
        fertilizerFormula: "สูตร 12-12-17-2 หรือ 15-15-15 (บำรุงผลอ่อน)",
      },
      {
        step: "ระยะที่ 3",
        title: "ระยะขยายพู · สร้างเนื้อและสะสมแป้ง/น้ำตาล",
        dateLabel: formatThaiDate(addDays(baseBloomDate, 68)),
        dayOffset: "วันที่ +68",
        action:
          "เสริมโพแทสเซียมสูงเพื่อสร้างเนื้อแน่น หวานมัน ไม่เละ และป้องกันอาการเนื้อแก้ว/ยางไหล",
        fertilizerFormula: "สูตร 8-24-24 สลับ 0-0-50 (โพแทสเซียมซัลเฟต)",
      },
      {
        step: "ระยะที่ 4",
        title:
          plannerFruit === "durian"
            ? "ตรวจวัดเปอร์เซ็นต์น้ำหนักเนื้อแห้ง (Dry Matter ≥ 32%)"
            : "ระยะเข้าสีสมบูรณ์ · ตรวจวัดความหวาน (°Brix)",
        dateLabel: formatThaiDate(dryMatterCheckDate),
        dayOffset: `วันที่ +${totalMaturityDays - 10}`,
        action:
          plannerFruit === "durian"
            ? "สุ่มตรวจเปอร์เซ็นต์แป้งด้วยเครื่องอบไมโครเวฟตามมาตรฐานทุเรียน GI ปากช่อง-เขาใหญ่ (ห้ามตัดทุเรียนอ่อน)"
            : "ลดการให้น้ำลงเล็กน้อยเพื่อให้เนื้อแห้ง กรอบ ร่อน และรสชาติเข้มข้นก่อนเก็บเกี่ยว",
        fertilizerFormula: "งดใส่ปุ๋ยทางดิน · เปิดรับยอดจอง Pre-order ออนไลน์",
      },
      {
        step: "ระยะที่ 5",
        title: "เก็บเกี่ยวมีดแรก – มีดหลัก (Optimal Harvest Window)",
        dateLabel: `${formatThaiDate(firstCutDate)} – ${formatThaiDate(
          finalCutDate
        )}`,
        dayOffset: `วันที่ +${totalMaturityDays} ถึง +${
          totalMaturityDays + 16
        }`,
        action: `ตัดผลผลิตมีดแรก (${formatThaiDate(
          firstCutDate
        )}) · พีคสุด (${formatThaiDate(
          peakCutDate
        )}) พร้อมเปิดสวนรับนักท่องเที่ยวและจัดส่งกล่องพรีเมียม GI`,
        fertilizerFormula: "หลังเก็บเกี่ยวเสร็จ: ตัดแต่งกิ่ง + ปุ๋ยอินทรีย์ + 15-15-15 ฟื้นต้น",
      },
    ];

    return {
      isHighland,
      totalMaturityDays,
      firstCutDate: formatThaiDate(firstCutDate),
      peakCutDate: formatThaiDate(peakCutDate),
      finalCutDate: formatThaiDate(finalCutDate),
      yieldPerRaiKg,
      totalYieldKg,
      giDirectVolumeKg,
      wholesaleVolumeKg,
      giDirectRevenue,
      wholesaleRevenue,
      agritourismRevenue,
      totalProjectedRevenue,
      valueAddedGain,
      milestones,
    };
  }, [
    bloomDateStr,
    plannerZone,
    activeFruitProfile,
    plannerFruit,
    treeAgeYears,
    orchardAreaRai,
    giPreorderSharePct,
    includeAgritourism,
  ]);

  const handleSelectZoneCell = (cell: MicroclimateZoneCell) => {
    setSelectedZoneId(cell.id);
    setPlannerZoneId(cell.id);
    if (onSelectDistrict) {
      onSelectDistrict(cell.districtId);
    }
  };

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
      {/* Module Top Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B1324] to-[#080C16] px-6 py-5 border-b border-[#1E293B]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#2DD4BF]">
              <Award className="w-4 h-4 text-[#FBBF24]" />
              <span>PREMIUM FRUIT INSIGHTS · MICROCLIMATE HEATMAP &amp; HARVEST PLANNER</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FBBF24]">
                โซนเขาและตอนใต้ จ.นครราชสีมา (ปากช่อง · วังน้ำเขียว · ครบุรี · เสิงสาง · หนองบุญมาก)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ระบบวิเคราะห์ศักยภาพไม้ผลเศรษฐกิจมูลค่าสูง (ทุเรียน GI · เงาะ · มังคุด) แผนที่ความร้อนจุลภูมิอากาศ และตารางวางแผนเก็บเกี่ยว
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
              วิเคราะห์ความได้เปรียบของดินภูเขาไฟเก่าและความชื้นสัมพัทธ์สูงจากผืนป่ามรดกโลกดงพญาเย็น–เขาใหญ่ ที่สร้างอัตลักษณ์รสชาติ{" "}
              <strong className="text-[#FBBF24]">
                “หวาน มัน เนื้อแน่น ไม่เละ และกลิ่นไม่ฉุนจัด”
              </strong>{" "}
              พร้อมเครื่องมือคำนวณวันตัดผลผลิตและรายได้ระบบ Pre-order / ท่องเที่ยวเชิงเกษตร
            </p>
          </div>

          {/* Fruit Filter Segmented Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#080C16] p-1.5 rounded-xl border border-[#1E293B] self-start">
            {(
              [
                { id: "all", label: "ครบทั้ง 3 ชนิด" },
                { id: "durian", label: "ทุเรียนหมอนทอง GI" },
                { id: "rambutan", label: "เงาะโรงเรียน" },
                { id: "mangosteen", label: "มังคุดพรีเมียม" },
              ] as { id: PremiumFruitType; label: string }[]
            ).map((tab) => {
              const active = selectedFruit === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedFruit(tab.id);
                    if (tab.id !== "all") {
                      setPlannerFruit(tab.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-[#111A2E]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* SECTION 1: OPTIMAL MICROCLIMATE ZONES HEATMAP (SPATIAL GRID + INSPECTOR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Interactive Spatial Microclimate Heatmap of Southern Korat */}
          <div className="lg:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3.5">
              <div>
                <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>OPTIMAL MICROCLIMATE ZONES HEATMAP (8 โซนจุลภูมิอากาศหลัก)</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  แผนที่ความร้อน (Heatmap) ศักยภาพพื้นที่ปลูกผลไม้เมืองร้อนโซนเขาและตอนใต้โคราช
                </h3>
              </div>

              {/* Metric Layer Selector */}
              <div className="flex flex-wrap items-center gap-1 bg-[#0B101D] p-1 rounded-xl border border-[#1E293B]">
                {(
                  [
                    { id: "overall", label: "ความเหมาะสมรวม" },
                    { id: "humidity", label: "ความชื้นสัมพัทธ์" },
                    { id: "night_chill", label: "อากาศเย็นกระตุ้นดอก" },
                    { id: "volcanic_soil", label: "แร่ธาตุดินภูเขาไฟ" },
                  ] as { id: HeatmapMetricMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHeatmapMetric(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      heatmapMetric === m.id
                        ? "bg-[#F59E0B] text-slate-950 font-bold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compass & Corridor Orientation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 bg-[#0B101D] px-3.5 py-2 rounded-xl border border-[#1E293B]">
              <span>← ทิศตะวันตก: แนวอุทยานฯ เขาใหญ่ (อ.ปากช่อง 430-510m)</span>
              <span className="text-[#2DD4BF] font-bold">
                แนวผืนป่ามรดกโลก ดงพญาเย็น–เขาใหญ่–ทับลาน
              </span>
              <span>ทิศตะวันออก: เขื่อนมูลบน-ลำแชะ-ลำปลายมาศ (ครบุรี·เสิงสาง) →</span>
            </div>

            {/* Interactive 8-Zone Heatmap Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MICROCLIMATE_HEATMAP_ZONES.map((cell) => {
                const isSelected = cell.id === activeZone.id;
                const displayMetric = getCellDisplayMetric(cell);
                const heatClasses = getHeatColorClasses(
                  displayMetric.scoreNormalized,
                  isSelected
                );

                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => handleSelectZoneCell(cell)}
                    className={`text-left rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${heatClasses}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[#FBBF24]">
                          {cell.districtNameTh} · {cell.elevationM}m MSL
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-white border border-white/15">
                          {displayMetric.valueLabel}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white leading-snug">
                        {cell.subzoneNameTh}
                      </div>
                      <div className="text-[11px] text-slate-200/90 line-clamp-1">
                        {cell.soilTypeTh}
                      </div>
                    </div>

                    {/* Fruit-Specific Suitability Mini Bars */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                        <div
                          className={`rounded px-2 py-1 bg-black/35 ${
                            selectedFruit === "durian"
                              ? "border border-[#2DD4BF] text-[#2DD4BF] font-bold"
                              : "text-slate-200"
                          }`}
                        >
                          <div>ทุเรียน</div>
                          <div className="text-xs font-bold text-white">
                            {cell.suitabilityScores.durian}%
                          </div>
                        </div>
                        <div
                          className={`rounded px-2 py-1 bg-black/35 ${
                            selectedFruit === "rambutan"
                              ? "border border-[#2DD4BF] text-[#2DD4BF] font-bold"
                              : "text-slate-200"
                          }`}
                        >
                          <div>เงาะ</div>
                          <div className="text-xs font-bold text-white">
                            {cell.suitabilityScores.rambutan}%
                          </div>
                        </div>
                        <div
                          className={`rounded px-2 py-1 bg-black/35 ${
                            selectedFruit === "mangosteen"
                              ? "border border-[#2DD4BF] text-[#2DD4BF] font-bold"
                              : "text-slate-200"
                          }`}
                        >
                          <div>มังคุด</div>
                          <div className="text-xs font-bold text-white">
                            {cell.suitabilityScores.mangosteen}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-0.5">
                        <span>RH {cell.avgRelativeHumidityPct}% · คืนแล้ง {cell.drySeasonNightTempC}°C</span>
                        <span className="text-[#2DD4BF] font-semibold">
                          {isSelected ? "● กำลังวิเคราะห์" : "คลิกเจาะลึก →"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Heatmap Color Scale Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E293B] text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-400 inline-block" />
                  <span>94–100% เหมาะสมสูงสุด (Optimal GI Core)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#14B8A6] inline-block" />
                  <span>90–93% เหมาะสมมาก (Prime Commercial)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-400 inline-block" />
                  <span>85–89% เหมาะสมดี (ต้องเสริมระบบน้ำหยด)</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                อ้างอิงชั้นข้อมูลดิน พด. &amp; สมดุลความชื้นดงพญาเย็น-เขาใหญ่
              </span>
            </div>
          </div>

          {/* Right 5 Cols: Deep-Dive Microclimate Zone Inspector & 3-Fruit Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Microclimate Zone Telemetry Card */}
            <div className="bg-[#080C16] border-2 border-[#14B8A6]/60 rounded-2xl p-5 space-y-4 shadow-[0_0_28px_rgba(20,184,166,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono font-bold text-[#2DD4BF]">
                    MICROCLIMATE ZONE INSPECTOR · ข้อมูลจำเพาะรายโซน
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeZone.districtNameTh} — {activeZone.subzoneNameTh}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/50 text-[#2DD4BF] font-mono text-xs font-bold shrink-0">
                  Score {activeZone.suitabilityScores.overall}/100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">ความสูงจากน้ำทะเล</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {activeZone.elevationM} ม.
                  </div>
                  <div className="text-[10px] text-[#2DD4BF]">ระบายอากาศดี</div>
                </div>
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">ความชื้นสัมพัทธ์</div>
                  <div className="text-base font-bold text-[#2DD4BF] mt-0.5">
                    {activeZone.avgRelativeHumidityPct}% RH
                  </div>
                  <div className="text-[10px] text-slate-300">อิทธิพลป่าเขาใหญ่-ทับลาน</div>
                </div>
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400">อุณหภูมิคืนฤดูแล้ง</div>
                  <div className="text-base font-bold text-[#FBBF24] mt-0.5">
                    {activeZone.drySeasonNightTempC}°C
                  </div>
                  <div className="text-[10px] text-slate-300">กระตุ้นตาดอกธรรมชาติ</div>
                </div>
              </div>

              <div className="space-y-2 bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 shrink-0">ลักษณะชุดดิน:</span>
                  <span className="text-white font-semibold text-right">
                    {activeZone.soilTypeTh}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">ค่า pH &amp; อินทรียวัตถุ:</span>
                  <span className="font-mono text-[#2DD4BF] font-bold">
                    pH {activeZone.soilPh} · OM {activeZone.organicMatterPct}% · การระบายน้ำ{activeZone.drainageRating}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 shrink-0">แหล่งน้ำต้นทุน:</span>
                  <span className="text-slate-200 text-right">
                    {activeZone.waterSourceTh}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-[#1E293B]">
                  <span className="text-slate-400 shrink-0">อัตลักษณ์ผลผลิต:</span>
                  <span className="text-[#FBBF24] font-semibold text-right">
                    {activeZone.flavorSignature}
                  </span>
                </div>
              </div>

              {/* 3 Fruit Comparison Cards */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono font-bold text-slate-300">
                  เจาะลึกผลไม้เศรษฐกิจทั้ง 3 ชนิดในโซนนี้ (คลิกเพื่อส่งเข้าตารางวางแผนเก็บเกี่ยว):
                </div>
                {(["durian", "rambutan", "mangosteen"] as const).map((fKey) => {
                  const prof = PREMIUM_FRUITS[fKey];
                  const score = activeZone.suitabilityScores[fKey];
                  const isActivePlanner = plannerFruit === fKey;
                  return (
                    <button
                      key={fKey}
                      type="button"
                      onClick={() => {
                        setPlannerFruit(fKey);
                        setPlannerZoneId(activeZone.id);
                      }}
                      className={`w-full text-left rounded-xl p-3.5 border transition-all cursor-pointer ${
                        isActivePlanner
                          ? "bg-[#111C33] border-[#2DD4BF] shadow-sm"
                          : "bg-[#0B101D] border-[#1E293B] hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{prof.nameTh}</span>
                          <span className="text-[11px] font-mono text-[#FBBF24]">
                            ({prof.harvestPeriodText})
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#2DD4BF]">
                          ความเหมาะสม {score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {prof.flavorProfile}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] font-mono text-slate-400">
                        <span>
                          ราคาหน้าสวน {prof.wholesalePriceBahtKg} บ./กก. · GI Pre-order{" "}
                          <strong className="text-[#2DD4BF]">
                            {prof.giPreorderPriceBahtKg} บ./กก.
                          </strong>
                        </span>
                        <span className="text-[#FBBF24]">
                          {isActivePlanner ? "● เลือกในตารางเก็บเกี่ยวแล้ว" : "วางแผนเก็บเกี่ยว →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 12-MONTH MICROCLIMATE & PHENOLOGY HEATMAP MATRIX */}
        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono font-bold text-[#FBBF24]">
                12-MONTH MICROCLIMATE &amp; PHENOLOGY MATRIX · ปฏิทินจุลภูมิอากาศรายเดือน
              </div>
              <h3 className="text-base font-bold text-white">
                ความสัมพันธ์ระหว่างอุณหภูมิคืนฤดูแล้ง ความชื้นสัมพัทธ์ และระยะการเจริญเติบโตของทุเรียน·เงาะ·มังคุดโคราช
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              ช่วงผลผลิตออกสู่ตลาดหลัก: พฤษภาคม – สิงหาคม
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-[#1E293B] text-[11px] font-mono text-slate-400">
                  <th className="py-2.5 px-3">เดือน</th>
                  <th className="py-2.5 px-3">อุณหภูมิกลางคืน (°C)</th>
                  <th className="py-2.5 px-3">ความชื้นสัมพัทธ์ (%RH)</th>
                  <th className="py-2.5 px-3">ทุเรียน (พ.ค.–ก.ค.)</th>
                  <th className="py-2.5 px-3">เงาะโรงเรียน (มิ.ย.–ส.ค.)</th>
                  <th className="py-2.5 px-3">มังคุด (มิ.ย.–ส.ค.)</th>
                  <th className="py-2.5 px-3">คำแนะนำการจัดการสวนรายเดือน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-xs">
                {MONTHLY_MICROCLIMATE_MATRIX.map((row) => {
                  const isHarvestMonth = row.monthIdx >= 5 && row.monthIdx <= 8;
                  const isChillBloomMonth =
                    row.monthIdx === 12 || row.monthIdx === 1 || row.monthIdx === 2;

                  return (
                    <tr
                      key={row.monthIdx}
                      className={
                        isHarvestMonth
                          ? "bg-[#14B8A6]/8 hover:bg-[#14B8A6]/15"
                          : "hover:bg-[#0E1525]"
                      }
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                        {row.label}
                        {isHarvestMonth && (
                          <span className="ml-1.5 text-[10px] text-[#2DD4BF] font-normal">
                            [ฤดูเก็บเกี่ยว]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <span
                          className={
                            isChillBloomMonth
                              ? "text-cyan-300 font-bold"
                              : "text-slate-200"
                          }
                        >
                          {row.nightChillC.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <span
                          className={
                            row.rhPct >= 80
                              ? "text-[#2DD4BF] font-bold"
                              : "text-slate-300"
                          }
                        >
                          {row.rhPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {row.stageDurian}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {row.stageRambutan}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {row.stageMangosteen}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {row.riskNote}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: INTERACTIVE HARVEST PLANNER & GI PRE-ORDER / AGRITOURISM SIMULATOR */}
        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FBBF24]" />
                <span>SMART HARVEST PLANNER &amp; GI REVENUE CALCULATOR</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                เครื่องมือวางแผนวันเก็บเกี่ยว (Harvest Planner) ตารางบำรุงผลผลิต และคำนวณรายได้ระบบจองต้น (Pre-order GI)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                ระบุวันดอกบาน/หางแย้ไหม้ และเลือกโซนความสูงเพื่อคำนวณวันตัดมีดแรก วันตรวจเปอร์เซ็นต์แป้ง และประมาณการรายได้เปรียบเทียบการขายส่งหน้าสวนกับการขายตรงออนไลน์/ท่องเที่ยวเชิงเกษตร
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Harvest Planner Controls */}
            <div className="lg:col-span-5 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 space-y-4">
              <div className="text-xs font-mono font-bold text-[#FBBF24] flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>ตั้งค่าแปลงไม้ผลและวันดอกบาน (Orchard Parameters)</span>
              </div>

              {/* 1. Select Fruit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  1. เลือกชนิดผลไม้เศรษฐกิจที่ต้องการวางแผนเก็บเกี่ยว
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["durian", "rambutan", "mangosteen"] as const).map((key) => {
                    const active = plannerFruit === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPlannerFruit(key)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          active
                            ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6]"
                            : "bg-[#080C16] text-slate-200 border-[#1E293B] hover:border-[#2DD4BF]/50"
                        }`}
                      >
                        {key === "durian"
                          ? "ทุเรียน GI"
                          : key === "rambutan"
                          ? "เงาะโรงเรียน"
                          : "มังคุด"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Select Microclimate Subzone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="harvest-planner-zone"
                  className="block text-xs font-semibold text-slate-200"
                >
                  2. เลือกโซนพื้นที่ปลูก (มีผลต่ออายุเก็บเกี่ยวตามความสูง)
                </label>
                <select
                  id="harvest-planner-zone"
                  value={plannerZoneId}
                  onChange={(e) => setPlannerZoneId(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  {MICROCLIMATE_HEATMAP_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.districtNameTh} — {z.subzoneNameTh} ({z.elevationM}m MSL)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Bloom / Fruit-Set Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="bloom-date-input"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    3. วันดอกบาน / หางแย้ไหม้
                  </label>
                  <input
                    id="bloom-date-input"
                    type="date"
                    value={bloomDateStr}
                    onChange={(e) => setBloomDateStr(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="orchard-area-input"
                    className="block text-xs font-semibold text-slate-200"
                  >
                    4. พื้นที่สวน ({orchardAreaRai} ไร่)
                  </label>
                  <input
                    id="orchard-area-input"
                    type="number"
                    min={1}
                    max={200}
                    value={orchardAreaRai}
                    onChange={(e) =>
                      setOrchardAreaRai(
                        Math.max(1, Math.min(200, Number(e.target.value) || 1))
                      )
                    }
                    className="w-full bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              {/* 4. Tree Age & GI Pre-Order Share Sliders */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">อายุต้นไม้ผลเฉลี่ย:</span>
                    <span className="font-mono font-bold text-[#2DD4BF]">
                      {treeAgeYears} ปี
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={20}
                    step={1}
                    value={treeAgeYears}
                    onChange={(e) => setTreeAgeYears(Number(e.target.value))}
                    aria-label="อายุต้นไม้ผลเฉลี่ย"
                    className="w-full accent-[#14B8A6]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      สัดส่วนขายตรงออนไลน์ / จองต้น (Pre-order GI):
                    </span>
                    <span className="font-mono font-bold text-[#FBBF24]">
                      {giPreorderSharePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={giPreorderSharePct}
                    onChange={(e) => setGiPreorderSharePct(Number(e.target.value))}
                    aria-label="สัดส่วนขายตรงออนไลน์ Pre-order GI"
                    className="w-full accent-[#F59E0B]"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAgritourism}
                    onChange={(e) => setIncludeAgritourism(e.target.checked)}
                    className="rounded accent-[#14B8A6] w-4 h-4"
                  />
                  <span>
                    เปิดสวนรับนักท่องเที่ยวเชิงเกษตร (Agritourism / ชิมสดจากต้น)
                  </span>
                </label>
              </div>
            </div>

            {/* Right 7 Cols: Calculated Harvest Schedule & Revenue Projection */}
            <div className="lg:col-span-7 space-y-4">
              {/* Top KPI Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0B101D] border border-[#14B8A6]/50 rounded-xl p-4">
                  <div className="text-[11px] font-mono text-[#2DD4BF]">
                    กำหนดตัดมีดแรก (First Harvest)
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {harvestPlan.firstCutDate}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    อายุพัฒนาผล {harvestPlan.totalMaturityDays} วัน (
                    {harvestPlan.isHighland ? "โซนที่สูงอากาศเย็น" : "โซนเชิงเขา"})
                  </div>
                </div>

                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-4">
                  <div className="text-[11px] font-mono text-slate-400">
                    ผลผลิตคาดการณ์รวม ({orchardAreaRai} ไร่)
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {harvestPlan.totalYieldKg.toLocaleString()} กก.
                  </div>
                  <div className="text-[11px] text-[#2DD4BF] mt-0.5">
                    เฉลี่ย {harvestPlan.yieldPerRaiKg.toLocaleString()} กก./ไร่
                  </div>
                </div>

                <div className="bg-[#0B101D] border border-[#F59E0B]/50 rounded-xl p-4">
                  <div className="text-[11px] font-mono text-[#FBBF24]">
                    รายได้คาดการณ์รวมทั้งฤดู
                  </div>
                  <div className="text-lg font-bold text-[#FBBF24] font-mono mt-1">
                    ฿{harvestPlan.totalProjectedRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">
                    +฿{harvestPlan.valueAddedGain.toLocaleString()} จากการขายตรง GI &amp; ท่องเที่ยว
                  </div>
                </div>
              </div>

              {/* Step-by-Step Phenology & Harvest Action Timeline */}
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-white">
                    ตารางปฏิบัติการตั้งแต่ดอกบานจนถึงวันเก็บเกี่ยว ({activeFruitProfile.nameTh})
                  </div>
                  <span className="text-[11px] font-mono text-[#2DD4BF]">
                    ช่วงเก็บเกี่ยวหลัก: {activeFruitProfile.harvestPeriodText}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {harvestPlan.milestones.map((ms) => (
                    <div
                      key={ms.step}
                      className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-[#2DD4BF]">
                            {ms.step} ({ms.dayOffset})
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-xs font-bold text-white">
                            {ms.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{ms.action}</p>
                        <div className="text-[11px] font-mono text-[#FBBF24]">
                          คำแนะนำธาตุอาหาร: {ms.fertilizerFormula}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 font-mono">
                        <div className="text-xs font-bold text-white bg-[#111A2E] border border-[#1E293B] px-3 py-1.5 rounded-lg">
                          {ms.dateLabel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
