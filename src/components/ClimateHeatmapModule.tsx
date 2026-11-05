import React, { useState, useMemo, useEffect, useRef } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  KORAT_IRRIGATION_CANALS,
  KORAT_WATER_SOURCE_NODES,
} from "../data/koratIrrigationData";
import {
  ClimateHistoricalTrendDashboard,
  computeDistrictHistoricalClimateTrend,
} from "./ClimateHistoricalTrendDashboard";
import {
  ThermometerSun,
  Droplets,
  Compass,
  Sparkles,
  MapPin,
  Sprout,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Wind,
  Layers,
  TrendingUp,
  Search,
  Clock,
  Award,
  Calendar,
  Filter,
  RotateCcw,
  Sliders,
  Check,
  X,
  Eye,
  EyeOff,
  CloudRain,
  Waves,
  HardDrive,
  Save,
} from "lucide-react";

export type ClimateHeatmapLayerMode =
  | "ground_temp"
  | "humidity"
  | "rainfall"
  | "soil_moisture"
  | "irrigation"
  | "crop_suitability"
  | "vpd_index";

export interface ClimateGisMapLayersState {
  rainfall: boolean;      // เรดาร์ฝน & ปริมาณฝนสะสม (Rainfall Radar & Precip)
  soil_moisture: boolean; // แผนที่ความชื้นดิน GISTDA (Soil Moisture Heatmap)
  irrigation: boolean;    // เขตชลประทาน & คลองส่งน้ำ (Irrigation Command Zones & Canals)
  primaryLayer: ClimateHeatmapLayerMode;
  layerOpacity: number;
}

export const CLIMATE_GIS_LAYERS_STORAGE_KEY =
  "korat_climate_heatmap_gis_layers_v2";

export const DEFAULT_CLIMATE_GIS_LAYERS: ClimateGisMapLayersState = {
  rainfall: false,
  soil_moisture: false,
  irrigation: false,
  primaryLayer: "ground_temp",
  layerOpacity: 0.85,
};

export function loadClimateGisLayersFromStorage(): ClimateGisMapLayersState {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_CLIMATE_GIS_LAYERS;
  }
  try {
    const raw = window.localStorage.getItem(CLIMATE_GIS_LAYERS_STORAGE_KEY);
    if (!raw) return DEFAULT_CLIMATE_GIS_LAYERS;
    const parsed = JSON.parse(raw);
    const validModes: ClimateHeatmapLayerMode[] = [
      "ground_temp",
      "humidity",
      "rainfall",
      "soil_moisture",
      "irrigation",
      "crop_suitability",
      "vpd_index",
    ];
    return {
      rainfall: Boolean(parsed.rainfall),
      soil_moisture: Boolean(parsed.soil_moisture),
      irrigation: Boolean(parsed.irrigation),
      primaryLayer: validModes.includes(parsed.primaryLayer)
        ? parsed.primaryLayer
        : "ground_temp",
      layerOpacity:
        typeof parsed.layerOpacity === "number" &&
        parsed.layerOpacity >= 0.2 &&
        parsed.layerOpacity <= 1
          ? parsed.layerOpacity
          : 0.85,
    };
  } catch (err) {
    console.warn("Error reading climate GIS layers from localStorage", err);
    return DEFAULT_CLIMATE_GIS_LAYERS;
  }
}

export function saveClimateGisLayersToStorage(
  state: ClimateGisMapLayersState
): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(
      CLIMATE_GIS_LAYERS_STORAGE_KEY,
      JSON.stringify({
        ...state,
        lastSavedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch (err) {
    console.warn("Error saving climate GIS layers to localStorage", err);
    return false;
  }
}

export type ClimateTimeSliceMode =
  | "afternoon_peak"
  | "morning_root"
  | "cool_season"
  | "hot_dry";

export interface CropVarietyMicroclimateSpec {
  id: string;
  nameTh: string;
  varietyCode: string;
  categoryTh: string;
  optimalGroundTempMinC: number;
  optimalGroundTempMaxC: number;
  optimalHumidityMinPct: number;
  optimalHumidityMaxPct: number;
  optimalVpdMinKpa: number;
  optimalVpdMaxKpa: number;
  preferredZones: string[];
  microclimateNotes: string;
  agronomicTip: string;
}

export const CROP_VARIETY_SPECS: CropVarietyMicroclimateSpec[] = [
  {
    id: "cassava_hb80",
    nameTh: "มันสำปะหลัง พันธุ์ห้วยบง 80 / เกษตรศาสตร์ 50",
    varietyCode: "HB80 / KU50 (แป้งสูง 28–30%)",
    categoryTh: "พืชไร่เศรษฐกิจทนแล้ง",
    optimalGroundTempMinC: 26.5,
    optimalGroundTempMaxC: 33.5,
    optimalHumidityMinPct: 52,
    optimalHumidityMaxPct: 72,
    optimalVpdMinKpa: 1.0,
    optimalVpdMaxKpa: 2.1,
    preferredZones: ["โซนตะวันตก-เหนือ", "โซนใต้-ดงพญาเย็น", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    microclimateNotes:
      "ต้องการอุณหภูมิผิวดินอบอุ่นสม่ำเสมอ (27–33°C) เพื่อเร่งการสะสมแป้งในหัว หากความชื้นสัมพัทธ์และดินแฉะเกิน 78% ต่อเนื่องเสี่ยงเกิดโรคหัวเน่า",
    agronomicTip:
      "ยกร่องสูง 35–40 ซม. ในโซนดอน และคลุมฟางลดอุณหภูมิผิวดินไม่ให้เกิน 36°C ช่วงเดือนมีนาคม–เมษายน",
  },
  {
    id: "jasmine_rice_105",
    nameTh: "ข้าวหอมมะลิ 105 ทุ่งสัมฤทธิ์ GI",
    varietyCode: "KDML 105 (หอมมะลิโคราช)",
    categoryTh: "ข้าวนาปีคุณภาพพรีเมียม",
    optimalGroundTempMinC: 24.5,
    optimalGroundTempMaxC: 31.0,
    optimalHumidityMinPct: 64,
    optimalHumidityMaxPct: 82,
    optimalVpdMinKpa: 0.7,
    optimalVpdMaxKpa: 1.5,
    preferredZones: ["โซนทุ่งสัมฤทธิ์-เหนือ", "โซนกลาง-ลุ่มน้ำลำตะคอง"],
    microclimateNotes:
      "ระยะตั้งท้อง–ออกรวงต้องการความชื้นสัมพัทธ์ 65–80% และช่วงปลายฤดู (พ.ย.) ต้องการอากาศเย็นลงเพื่อสร้างสารหอม 2-AP ในเมล็ดข้าว",
    agronomicTip:
      "รักษาระดับน้ำในนา 5–7 ซม. เพื่อคุมอุณหภูมิโคนกอข้าวไม่ให้แกว่งเกิน 31°C และระบายน้ำออกก่อนเก็บเกี่ยว 12 วัน",
  },
  {
    id: "durian_monthong_gi",
    nameTh: "ทุเรียนหมอนทองปากช่อง-เขาใหญ่ GI",
    varietyCode: "Monthong GI (เนื้อแห้งมัน)",
    categoryTh: "ไม้ผลอัตลักษณ์มูลค่าสูง",
    optimalGroundTempMinC: 20.5,
    optimalGroundTempMaxC: 28.0,
    optimalHumidityMinPct: 72,
    optimalHumidityMaxPct: 86,
    optimalVpdMinKpa: 0.6,
    optimalVpdMaxKpa: 1.25,
    preferredZones: ["โซนตะวันตก-ที่ราบสูง", "โซนใต้-ดงพญาเย็น"],
    microclimateNotes:
      "ต้องการจุลภูมิอากาศเชิงเขาความชื้นสัมพัทธ์สูง 72–86% อุณหภูมิผิวดินร่มเย็น 21–28°C และมีช่วงอากาศหนาวเย็นกระตุ้นตาดอกโดยใบไม่ไหม้",
    agronomicTip:
      "ติดตั้งหัวสปริงเกลอร์พ่นฝอยใต้ทรงพุ่มเพื่อรักษาความชื้นสัมพัทธ์ >70% ช่วงบ่ายที่มีลมแห้ง และคลุมโคนรักษาอุณหภูมิรากฝอย",
  },
  {
    id: "arabica_dong_phayayen",
    nameTh: "กาแฟอาราบิก้า & โรบัสต้าดงพญาเย็น",
    varietyCode: "Catimor / Coffea Dong Phayayen",
    categoryTh: "พืชเศรษฐกิจไม้ยืนต้นเชิงนิเวศ",
    optimalGroundTempMinC: 18.0,
    optimalGroundTempMaxC: 25.5,
    optimalHumidityMinPct: 74,
    optimalHumidityMaxPct: 88,
    optimalVpdMinKpa: 0.5,
    optimalVpdMaxKpa: 1.15,
    preferredZones: ["โซนใต้-ดงพญาเย็น", "โซนตะวันตก-ที่ราบสูง"],
    microclimateNotes:
      "เหมาะเฉพาะเขตจุลภูมิอากาศที่สูง (วังน้ำเขียว·ปากช่อง·ครบุรีตอนบน) ที่อุณหภูมิผิวดินเย็นตลอดปี (18–25°C) และมีหมอกน้ำค้างช่วยให้ผลเชอร์รี่สุกช้าสะสมรสชาติ",
    agronomicTip:
      "ปลูกแบบวนเกษตรร่วมในสวนไม้ผลหรือไม้ร่มเงา (Shade-Grown) เพื่อลดอุณหภูมิผิวดินลงอีก 2.5–3.5°C",
  },
  {
    id: "sugarcane_kk3",
    nameTh: "อ้อยโรงงาน พันธุ์ขอนแก่น 3 (CCS สูง)",
    varietyCode: "KK3 (ความหวาน 13.5–15 CCS)",
    categoryTh: "พืชไร่อุตสาหกรรมน้ำตาล",
    optimalGroundTempMinC: 25.5,
    optimalGroundTempMaxC: 33.0,
    optimalHumidityMinPct: 50,
    optimalHumidityMaxPct: 74,
    optimalVpdMinKpa: 0.9,
    optimalVpdMaxKpa: 2.0,
    preferredZones: ["โซนใต้-ดงพญาเย็น", "โซนทุ่งสัมฤทธิ์-เหนือ", "โซนตะวันตก-เหนือ"],
    microclimateNotes:
      "ระยะย่างปล้องต้องการดินอุ่นชื้น แต่ระยะสะสมน้ำตาล (พ.ย.–ม.ค.) ต้องการความชื้นสัมพัทธ์ลดลงและอุณหภูมิกลางวัน-กลางคืนต่างกัน >10°C",
    agronomicTip:
      "งดให้น้ำ 30 วันก่อนตัดอ้อยเข้าหีบ เพื่อให้จุลภูมิอากาศแห้งเย็นช่วยเร่งค่าความหวาน CCS",
  },
  {
    id: "sweet_corn_pakchong",
    nameTh: "ข้าวโพดหวานปากช่อง / ข้าวโพดสุวรรณ",
    varietyCode: "Hi-Brix Sweet Corn / Suwan",
    categoryTh: "พืชไร่อายุสั้นมูลค่าสูง",
    optimalGroundTempMinC: 22.5,
    optimalGroundTempMaxC: 29.5,
    optimalHumidityMinPct: 60,
    optimalHumidityMaxPct: 78,
    optimalVpdMinKpa: 0.75,
    optimalVpdMaxKpa: 1.45,
    preferredZones: ["โซนตะวันตก-ที่ราบสูง", "โซนกลาง-ลุ่มน้ำลำตะคอง", "โซนใต้-ดงพญาเย็น"],
    microclimateNotes:
      "ระยะออกไหมและผสมเกสรไวต่ออุณหภูมิมาก หากอุณหภูมิผิวดินและเรือนยอดเกิน 33°C และความชื้นต่ำกว่า 50% จะทำให้ติดเมล็ดไม่เต็มฝัก",
    agronomicTip:
      "เลือกปลูกรุ่นฤดูปลายฝน–ต้นหนาวในโซนปากช่อง/สีคิ้ว/สูงเนิน หรือให้น้ำระบบเทปน้ำหยดช่วงออกไหม",
  },
  {
    id: "highland_grape_berry",
    nameTh: "องุ่นไร้เมล็ด & เมล่อนเรือนโรงเกรดพรีเมียม",
    varietyCode: "Black Opal / Khao Yai Wine & Table Grape",
    categoryTh: "ไม้ผลกึ่งเมืองหนาว-ท่องเที่ยวเชิงเกษตร",
    optimalGroundTempMinC: 19.0,
    optimalGroundTempMaxC: 26.5,
    optimalHumidityMinPct: 60,
    optimalHumidityMaxPct: 75,
    optimalVpdMinKpa: 0.7,
    optimalVpdMaxKpa: 1.35,
    preferredZones: ["โซนตะวันตก-ที่ราบสูง", "โซนใต้-ดงพญาเย็น"],
    microclimateNotes:
      "ต้องการอากาศโปร่ง แดดจัดแต่ผิวดินไม่ร้อนจัด (19–26.5°C) และความชื้นสัมพัทธ์ปานกลาง (60–75%) เพื่อลดโรคราน้ำค้างและเร่งความหวาน Brix",
    agronomicTip:
      "ใช้พลาสติกคลุมหลังคาโรงเรือนในโซนปากช่อง–วังน้ำเขียวเพื่อกันฝนกระแทกใบและคุมความชื้นสัมพัทธ์",
  },
  {
    id: "chili_highland_veg",
    nameTh: "พริกจินดาโคราช & ผักสลัดปลอดสาร",
    varietyCode: "Super Hot Chili & Hydro/Organic Salad",
    categoryTh: "พืชผักเศรษฐกิจหมุนเวียนเร็ว",
    optimalGroundTempMinC: 22.0,
    optimalGroundTempMaxC: 29.0,
    optimalHumidityMinPct: 60,
    optimalHumidityMaxPct: 76,
    optimalVpdMinKpa: 0.75,
    optimalVpdMaxKpa: 1.4,
    preferredZones: ["โซนกลาง-ลุ่มน้ำลำตะคอง", "โซนตะวันตก-เหนือ", "โซนใต้-ดงพญาเย็น"],
    microclimateNotes:
      "อุณหภูมิผิวดิน 22–29°C ช่วยให้รากดูดแคลเซียมและโบรอนได้ดี ลดอาการก้นผลเน่าในพริกและอาการปลายใบไหม้ (Tipburn) ในผักสลัด",
    agronomicTip:
      "คลุมพลาสติกสองสี (ด้านบนสีเงินสะท้อนแสง ด้านล่างสีดำ) เพื่อลดอุณหภูมิผิวดินลง 3–4°C ในแปลงพริกโซนที่ราบ",
  },
];

export interface DistrictMicroclimateRecord {
  district: KoratDistrict;
  elevationM: number;
  microclimateTypeTh: string;
  groundTempC: number; // 5-10cm soil surface temp for selected time slice
  airTempC: number;
  relativeHumidityPct: number;
  vpdKpa: number;
  diurnalDeltaC: number;
  dewPointC: number;
  evapotranspirationMmDay: number;
  varietySuitabilityScore: number; // 0..100 for selected crop variety
  suitabilityStatusTh: "เหมาะสมดีเยี่ยม (Optimal Microclimate)" | "เหมาะสมปานกลาง (ปรับการจัดการแปลง)" | "นอกเกณฑ์แนะนำ (ต้องควบคุมสภาพแวดล้อม)";
  monthlyTrend: {
    monthTh: string;
    groundTempC: number;
    humidityPct: number;
    vpdKpa: number;
  }[];
}

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

// Elevation & topographic microclimate modifier by Korat district ID
function getDistrictElevationAndTerrain(dist: KoratDistrict): {
  elevationM: number;
  microclimateTypeTh: string;
  coolingOffsetC: number;
  humidityBoostPct: number;
} {
  if (dist.id === "wang-nam-khiao") {
    return {
      elevationM: 540,
      microclimateTypeTh: "จุลภูมิอากาศหุบเขาสูงเย็นชื้น (โอโซนดงพญาเย็น)",
      coolingOffsetC: -4.8,
      humidityBoostPct: 16,
    };
  }
  if (dist.id === "pak-chong") {
    return {
      elevationM: 465,
      microclimateTypeTh: "จุลภูมิอากาศที่ราบสูงเชิงเขาใหญ่ (ดินภูเขาไฟชื้น)",
      coolingOffsetC: -4.1,
      humidityBoostPct: 14,
    };
  }
  if (dist.id === "khon-buri" || dist.id === "soeng-sang") {
    return {
      elevationM: 320,
      microclimateTypeTh: "จุลภูมิอากาศเชิงเขาดงพญาเย็น-ต้นน้ำมูล",
      coolingOffsetC: -2.4,
      humidityBoostPct: 11,
    };
  }
  if (dist.id === "sikhio" || dist.id === "sung-noen" || dist.id === "pak-thong-chai") {
    return {
      elevationM: 275,
      microclimateTypeTh: "จุลภูมิอากาศลาดเนินเขาลำตะคอง-ลำพระเพลิง",
      coolingOffsetC: -1.6,
      humidityBoostPct: 6,
    };
  }
  if (dist.id === "dan-khun-thot" || dist.id === "thepharak" || dist.id === "noen-sung") {
    return {
      elevationM: 250,
      microclimateTypeTh: "จุลภูมิอากาศดอนลูกคลื่นตะวันตก (แดดจัด-ลมแรง)",
      coolingOffsetC: -0.6,
      humidityBoostPct: -2,
    };
  }
  if (
    dist.id === "phimai" ||
    dist.id === "chum-phuang" ||
    dist.id === "non-sung" ||
    dist.id === "prathai" ||
    dist.id === "muang-yang" ||
    dist.id === "lam-thamenchai"
  ) {
    return {
      elevationM: 165,
      microclimateTypeTh: "จุลภูมิอากาศแอ่งที่ราบลุ่มน้ำมูล (ทุ่งสัมฤทธิ์)",
      coolingOffsetC: 0.4,
      humidityBoostPct: 5,
    };
  }
  if (
    dist.id === "bua-yai" ||
    dist.id === "bua-lai" ||
    dist.id === "sida" ||
    dist.id === "khong" ||
    dist.id === "ban-lueam" ||
    dist.id === "kaeng-sanam-nang"
  ) {
    return {
      elevationM: 185,
      microclimateTypeTh: "จุลภูมิอากาศโคก-โนนตอนเหนือ (ร้อนแห้งกลางวัน)",
      coolingOffsetC: 1.2,
      humidityBoostPct: -6,
    };
  }
  return {
    elevationM: 205,
    microclimateTypeTh: "จุลภูมิอากาศที่ราบตอนกลางโคราช",
    coolingOffsetC: 0.2,
    humidityBoostPct: 1,
  };
}

export function computeDistrictMicroclimate(
  dist: KoratDistrict,
  timeSlice: ClimateTimeSliceMode,
  variety: CropVarietyMicroclimateSpec
): DistrictMicroclimateRecord {
  const terrain = getDistrictElevationAndTerrain(dist);

  // Base adjustments by time slice
  let sliceTempDelta = 0;
  let sliceHumidityDelta = 0;
  if (timeSlice === "afternoon_peak") {
    sliceTempDelta = 0.8;
    sliceHumidityDelta = -6;
  } else if (timeSlice === "morning_root") {
    sliceTempDelta = -5.6;
    sliceHumidityDelta = 12;
  } else if (timeSlice === "cool_season") {
    sliceTempDelta = -4.2;
    sliceHumidityDelta = -2;
  } else if (timeSlice === "hot_dry") {
    sliceTempDelta = 3.4;
    sliceHumidityDelta = -12;
  }

  // Soil moisture evaporative cooling effect: higher GISTDA soil moisture buffers ground temperature
  const moistureCooling = (dist.gistdaSoilMoisturePct - 35) * -0.08;

  const groundTempC = Number(
    Math.max(
      15.5,
      Math.min(
        41.5,
        dist.maxTempC -
          3.2 +
          terrain.coolingOffsetC +
          moistureCooling +
          sliceTempDelta
      )
    ).toFixed(1)
  );

  const airTempC = Number((groundTempC + 1.4).toFixed(1));

  const relativeHumidityPct = Math.round(
    Math.max(
      38,
      Math.min(
        92,
        46 +
          dist.gistdaSoilMoisturePct * 0.48 +
          dist.rainProbToday * 0.14 +
          terrain.humidityBoostPct +
          sliceHumidityDelta
      )
    )
  );

  // Calculate Vapor Pressure Deficit (VPD in kPa) using Tetens equation
  const es = 0.61078 * Math.exp((17.27 * airTempC) / (airTempC + 237.3));
  const ea = es * (relativeHumidityPct / 100);
  const vpdKpa = Number(Math.max(0.25, es - ea).toFixed(2));

  // Dew point approximation
  const dewPointC = Number(
    (airTempC - (100 - relativeHumidityPct) / 5).toFixed(1)
  );

  const diurnalDeltaC = Number(
    (dist.maxTempC - dist.minTempC + (terrain.elevationM > 350 ? 1.6 : 0)).toFixed(1)
  );

  const evapotranspirationMmDay = Number(
    Math.max(2.1, Math.min(7.2, 3.2 + vpdKpa * 1.45)).toFixed(1)
  );

  // Evaluate suitability score (0..100) for the selected Crop Variety
  let tempPenalty = 0;
  if (groundTempC < variety.optimalGroundTempMinC) {
    tempPenalty = (variety.optimalGroundTempMinC - groundTempC) * 7.5;
  } else if (groundTempC > variety.optimalGroundTempMaxC) {
    tempPenalty = (groundTempC - variety.optimalGroundTempMaxC) * 8.2;
  }

  let humPenalty = 0;
  if (relativeHumidityPct < variety.optimalHumidityMinPct) {
    humPenalty = (variety.optimalHumidityMinPct - relativeHumidityPct) * 1.45;
  } else if (relativeHumidityPct > variety.optimalHumidityMaxPct) {
    humPenalty = (relativeHumidityPct - variety.optimalHumidityMaxPct) * 1.55;
  }

  const zoneBonus = variety.preferredZones.some((z) => dist.zone.includes(z.slice(0, 6)))
    ? 6
    : 0;

  const rawScore = Math.round(100 - tempPenalty - humPenalty + zoneBonus);
  const varietySuitabilityScore = Math.max(24, Math.min(99, rawScore));

  const suitabilityStatusTh: DistrictMicroclimateRecord["suitabilityStatusTh"] =
    varietySuitabilityScore >= 80
      ? "เหมาะสมดีเยี่ยม (Optimal Microclimate)"
      : varietySuitabilityScore >= 62
      ? "เหมาะสมปานกลาง (ปรับการจัดการแปลง)"
      : "นอกเกณฑ์แนะนำ (ต้องควบคุมสภาพแวดล้อม)";

  // 12-Month Ground Temp & Humidity Trend for this district
  const monthlySeasonTempOffsets = [
    -3.8, -1.6, 2.2, 3.6, 2.1, 0.6, 0.1, -0.3, -0.8, -1.4, -2.7, -4.1,
  ];
  const monthlySeasonHumOffsets = [
    -8, -11, -14, -10, 4, 8, 10, 12, 15, 10, -1, -6,
  ];

  const baseAnnualGroundTemp =
    dist.maxTempC - 3.2 + terrain.coolingOffsetC + moistureCooling;
  const baseAnnualHum =
    46 +
    dist.gistdaSoilMoisturePct * 0.48 +
    dist.rainProbToday * 0.12 +
    terrain.humidityBoostPct;

  const monthlyTrend = THAI_MONTHS_SHORT.map((monthTh, idx) => {
    const mTemp = Number(
      Math.max(
        16,
        Math.min(40, baseAnnualGroundTemp + monthlySeasonTempOffsets[idx])
      ).toFixed(1)
    );
    const mHum = Math.round(
      Math.max(38, Math.min(90, baseAnnualHum + monthlySeasonHumOffsets[idx]))
    );
    const mEs = 0.61078 * Math.exp((17.27 * (mTemp + 1.2)) / (mTemp + 238.5));
    const mVpd = Number(Math.max(0.3, mEs * (1 - mHum / 100)).toFixed(2));
    return {
      monthTh,
      groundTempC: mTemp,
      humidityPct: mHum,
      vpdKpa: mVpd,
    };
  });

  return {
    district: dist,
    elevationM: terrain.elevationM,
    microclimateTypeTh: terrain.microclimateTypeTh,
    groundTempC,
    airTempC,
    relativeHumidityPct,
    vpdKpa,
    diurnalDeltaC,
    dewPointC,
    evapotranspirationMmDay,
    varietySuitabilityScore,
    suitabilityStatusTh,
    monthlyTrend,
  };
}

// Helper for RGBA color interpolation on the IDW Canvas Heatmap
function getHeatmapRgbForRecord(
  rec: DistrictMicroclimateRecord,
  layerMode: ClimateHeatmapLayerMode
): [number, number, number] {
  if (layerMode === "ground_temp") {
    // Cool 19°C (Indigo/Teal) -> Optimal 27°C (Emerald) -> Warm 32°C (Amber) -> Hot 37°C+ (Crimson)
    const t = rec.groundTempC;
    if (t <= 23.5) return [14, 165, 233]; // Sky/Cyan Cool Highland
    if (t <= 27.5) return [20, 184, 166]; // Emerald/Teal Mild
    if (t <= 31.0) return [234, 179, 8]; // Warm Gold
    if (t <= 34.0) return [249, 115, 22]; // Orange
    return [239, 68, 68]; // Crimson Heat
  }
  if (layerMode === "humidity") {
    // Low <52% (Amber) -> Moderate 55-70% (Teal) -> High >72% (Sky Blue)
    const h = rec.relativeHumidityPct;
    if (h < 54) return [245, 158, 11]; // Dry Amber
    if (h < 68) return [20, 184, 166]; // Balanced Teal
    if (h < 78) return [56, 189, 248]; // Humid Sky
    return [59, 130, 246]; // Deep Humid Blue
  }
  if (layerMode === "rainfall") {
    // Rain Probability & 14-day rainfall: Low (Sky) -> Moderate (Blue) -> High (Deep Indigo)
    const p = rec.district.rainProbToday;
    if (p < 25) return [56, 189, 248]; // Sky
    if (p < 45) return [14, 165, 233]; // Blue
    if (p < 70) return [59, 130, 246]; // Rain Blue
    return [99, 102, 241]; // Heavy Rain Indigo
  }
  if (layerMode === "soil_moisture") {
    // GISTDA Soil Moisture: <30% (Dry Red) -> 30-40% (Amber) -> 40-55% (Teal) -> >55% (Cyan)
    const sm = rec.district.gistdaSoilMoisturePct;
    if (sm < 30) return [239, 68, 68]; // Critical Dry Red
    if (sm < 40) return [245, 158, 11]; // Mild Amber
    if (sm < 55) return [20, 184, 166]; // Optimal Teal
    return [14, 165, 233]; // High Cyan
  }
  if (layerMode === "irrigation") {
    // Irrigation status: In major command zone (Emerald) vs Non-command upland (Amber/Teal)
    const isCommand =
      rec.district.zone.includes("ลำตะคอง") ||
      rec.district.zone.includes("ดงพญาเย็น") ||
      rec.district.zone.includes("ทุ่งสัมฤทธิ์");
    return isCommand ? [16, 185, 129] : [245, 158, 11];
  }
  if (layerMode === "vpd_index") {
    // Optimal VPD 0.65 - 1.45 kPa (Emerald), High > 1.75 kPa (Red/Orange), Very low < 0.55 (Blue)
    const v = rec.vpdKpa;
    if (v <= 0.6) return [56, 189, 248];
    if (v <= 1.45) return [16, 185, 129];
    if (v <= 1.85) return [245, 158, 11];
    return [239, 68, 68];
  }
  // crop_suitability
  const s = rec.varietySuitabilityScore;
  if (s >= 82) return [16, 185, 129]; // High Suitability Emerald
  if (s >= 68) return [45, 212, 191]; // Good Teal
  if (s >= 55) return [245, 158, 11]; // Moderate Amber
  return [239, 68, 68]; // Low Suitability Red
}

export type ThresholdFilterMetric = "temp" | "humidity" | "both" | "none";

interface DualRangeSliderControlProps {
  label: string;
  metricIcon: React.ReactNode;
  unit: string;
  min: number;
  max: number;
  step: number;
  values: [number, number];
  onChange: (val: [number, number]) => void;
  accent: "amber" | "sky" | "teal";
  districtValues: { districtName: string; val: number; id: string }[];
  cropOptimalRange?: [number, number];
  cropName?: string;
  matchedCount: number;
  totalCount: number;
}

const DualRangeSliderControl: React.FC<DualRangeSliderControlProps> = ({
  label,
  metricIcon,
  unit,
  min,
  max,
  step,
  values,
  onChange,
  accent,
  districtValues,
  cropOptimalRange,
  cropName,
  matchedCount,
  totalCount,
}) => {
  const [minVal, maxVal] = values;
  const pctMin = Math.min(100, Math.max(0, ((minVal - min) / (max - min)) * 100));
  const pctMax = Math.min(100, Math.max(0, ((maxVal - min) / (max - min)) * 100));
  const span = Number((maxVal - minVal).toFixed(step < 1 ? 1 : 0));

  const accentColor =
    accent === "amber"
      ? "text-amber-400"
      : accent === "sky"
      ? "text-sky-400"
      : "text-teal-400";

  const accentBg =
    accent === "amber"
      ? "bg-amber-400"
      : accent === "sky"
      ? "bg-sky-400"
      : "bg-teal-400";

  const handleMinChange = (newMin: number) => {
    const clamped = Math.max(min, Math.min(newMin, maxVal - step));
    onChange([Number(clamped.toFixed(step < 1 ? 1 : 0)), maxVal]);
  };

  const handleMaxChange = (newMax: number) => {
    const clamped = Math.min(max, Math.max(newMax, minVal + step));
    onChange([minVal, Number(clamped.toFixed(step < 1 ? 1 : 0))]);
  };

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${accentColor}`}>
            {metricIcon}
          </span>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{label}</span>
              <span className="text-[11px] font-mono text-slate-400">
                (พิสัยรวม {min}–{max}{unit})
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              พบ{" "}
              <strong className={accentColor}>
                {matchedCount} จาก {totalCount} อำเภอ
              </strong>{" "}
              ({Math.round((matchedCount / (totalCount || 1)) * 100)}%) ในช่วงที่กำหนด
            </div>
          </div>
        </div>

        {/* Readout Badge */}
        <div className="flex items-center gap-2 bg-[#050811] border border-[#1E293B] px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
          <span className="text-slate-400">ช่วงเกณฑ์:</span>
          <span className={accentColor}>
            {minVal.toFixed(step < 1 ? 1 : 0)}{unit}
          </span>
          <span className="text-slate-500">→</span>
          <span className={accentColor}>
            {maxVal.toFixed(step < 1 ? 1 : 0)}{unit}
          </span>
          <span className="text-[10px] text-slate-400 font-normal ml-1">
            (Δ {span}{unit})
          </span>
        </div>
      </div>

      {/* Interactive Visual Distribution Track with District Dots */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{min}{unit} (ต่ำสุด)</span>
          <span>{((min + max) / 2).toFixed(step < 1 ? 1 : 0)}{unit} (กึ่งกลาง)</span>
          <span>{max}{unit} (สูงสุด)</span>
        </div>

        <div className="relative w-full h-8 bg-[#050811] rounded-xl border border-slate-800 px-2 flex items-center select-none overflow-hidden">
          {/* Optimal Crop Window Highlight (if provided) */}
          {cropOptimalRange && (
            <div
              title={`ช่วงที่เหมาะสมของ ${cropName || "พันธุ์พืช"}: ${cropOptimalRange[0]}–${cropOptimalRange[1]}${unit}`}
              className="absolute h-full bg-emerald-500/10 border-x border-dashed border-emerald-400/40 pointer-events-none"
              style={{
                left: `${Math.min(100, Math.max(0, ((cropOptimalRange[0] - min) / (max - min)) * 100))}%`,
                width: `${Math.min(100, Math.max(0, ((cropOptimalRange[1] - cropOptimalRange[0]) / (max - min)) * 100))}%`,
              }}
            />
          )}

          {/* Active Slider Range Highlight */}
          <div
            className={`absolute h-full transition-all duration-75 pointer-events-none ${
              accent === "amber"
                ? "bg-amber-500/15 border-x-2 border-amber-400"
                : accent === "sky"
                ? "bg-sky-500/15 border-x-2 border-sky-400"
                : "bg-teal-500/15 border-x-2 border-teal-400"
            }`}
            style={{
              left: `${pctMin}%`,
              width: `${Math.max(1, pctMax - pctMin)}%`,
            }}
          />

          {/* District Dots plotted along the axis */}
          {districtValues.map((d) => {
            const pct = Math.min(100, Math.max(0, ((d.val - min) / (max - min)) * 100));
            const inRange = d.val >= minVal && d.val <= maxVal;
            return (
              <div
                key={d.id}
                title={`${d.districtName}: ${d.val}${unit} (${inRange ? "✓ อยู่ในเกณฑ์" : "✕ อยู่นอกเกณฑ์"})`}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-150 cursor-pointer ${
                  inRange
                    ? `${accentBg} w-2.5 h-2.5 ring-2 ring-white/30 z-10 scale-110 shadow-sm`
                    : "bg-slate-700 w-1.5 h-1.5 opacity-40 z-0 hover:opacity-100 hover:scale-125"
                }`}
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Dual Sliders: Min and Max Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Min Threshold Control */}
        <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>เกณฑ์ขั้นต่ำ (Min Threshold):</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMinChange(minVal - step)}
                disabled={minVal <= min}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                title="ลด 1 ขั้น"
              >
                -
              </button>
              <span className={`font-mono font-bold text-sm ${accentColor} min-w-14 text-center`}>
                {minVal.toFixed(step < 1 ? 1 : 0)}{unit}
              </span>
              <button
                type="button"
                onClick={() => handleMinChange(minVal + step)}
                disabled={minVal >= maxVal - step}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                title="เพิ่ม 1 ขั้น"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minVal}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
          />
        </div>

        {/* Max Threshold Control */}
        <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>เกณฑ์ขั้นสูง (Max Threshold):</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMaxChange(maxVal - step)}
                disabled={maxVal <= minVal + step}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                title="ลด 1 ขั้น"
              >
                -
              </button>
              <span className={`font-mono font-bold text-sm ${accentColor} min-w-14 text-center`}>
                {maxVal.toFixed(step < 1 ? 1 : 0)}{unit}
              </span>
              <button
                type="button"
                onClick={() => handleMaxChange(maxVal + step)}
                disabled={maxVal >= max}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                title="เพิ่ม 1 ขั้น"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxVal}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Snap to Crop Optimal Range Button */}
      {cropOptimalRange && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>
              เกณฑ์แนะนำสำหรับ “{cropName}”:{" "}
              <strong className="text-emerald-300 font-mono">
                {cropOptimalRange[0]}–{cropOptimalRange[1]}{unit}
              </strong>
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange([cropOptimalRange[0], cropOptimalRange[1]])}
            className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            🎯 ตั้งค่าตามช่วงของ {cropName}
          </button>
        </div>
      )}
    </div>
  );
};

interface ClimateHeatmapModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onOpenVarietyMatcher?: () => void;
}

export const ClimateHeatmapModule: React.FC<ClimateHeatmapModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onOpenVarietyMatcher,
}) => {
  // Persistent GIS Map Layers & Primary Heatmap Mode across browser sessions via localStorage
  const [gisLayers, setGisLayers] = useState<ClimateGisMapLayersState>(() =>
    loadClimateGisLayersFromStorage()
  );
  const [persistedToast, setPersistedToast] = useState<{
    message: string;
    visible: boolean;
  }>({ message: "", visible: false });

  // Current primary heatmap mode driven by persisted state
  const layerMode = gisLayers.primaryLayer;

  // Cross-tab synchronization via window storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CLIMATE_GIS_LAYERS_STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setGisLayers((prev) => ({ ...prev, ...updated }));
        } catch {
          // ignore corrupted event data
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const showPersistenceNotification = (msg: string) => {
    setPersistedToast({ message: msg, visible: true });
    setTimeout(() => {
      setPersistedToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  const handleSetLayerMode = (newMode: ClimateHeatmapLayerMode) => {
    setGisLayers((prev) => {
      const next = { ...prev, primaryLayer: newMode };
      saveClimateGisLayersToStorage(next);
      return next;
    });
    showPersistenceNotification(
      `บันทึกลงเบราว์เซอร์: เลเยอร์ ${
        newMode === "ground_temp"
          ? "อุณหภูมิผิวดิน"
          : newMode === "humidity"
          ? "ความชื้นสัมพัทธ์"
          : newMode === "rainfall"
          ? "เรดาร์ฝน & ปริมาณฝน"
          : newMode === "soil_moisture"
          ? "ความชื้นดิน GISTDA"
          : newMode === "irrigation"
          ? "เขตชลประทาน & คลองส่งน้ำ"
          : newMode === "crop_suitability"
          ? "ความเหมาะสมพันธุ์พืช"
          : "ดัชนีคายน้ำ VPD"
      }`
    );
  };

  const handleToggleGisLayer = (
    layerKey: "rainfall" | "soil_moisture" | "irrigation"
  ) => {
    const willBeActive = !gisLayers[layerKey];
    setGisLayers((prev) => {
      const next = { ...prev, [layerKey]: willBeActive };
      saveClimateGisLayersToStorage(next);
      return next;
    });
    const label =
      layerKey === "rainfall"
        ? "เลเยอร์เรดาร์ฝน (Rainfall)"
        : layerKey === "soil_moisture"
        ? "เลเยอร์ความชื้นดิน (Soil Moisture)"
        : "เลเยอร์เขตชลประทาน (Irrigation)";
    showPersistenceNotification(
      `บันทึกสถานะ ${label}: ${willBeActive ? "เปิดใช้งาน (Active)" : "ปิดการใช้งาน (Off)"}`
    );
  };

  const handleResetGisLayers = () => {
    setGisLayers(DEFAULT_CLIMATE_GIS_LAYERS);
    saveClimateGisLayersToStorage(DEFAULT_CLIMATE_GIS_LAYERS);
    showPersistenceNotification("คืนค่าเริ่มต้นเลเยอร์ GIS ทั้งหมดแล้ว (Reset to Defaults)");
  };
  const [timeSlice, setTimeSlice] =
    useState<ClimateTimeSliceMode>("afternoon_peak");
  const [selectedVarietyId, setSelectedVarietyId] =
    useState<string>("durian_monthong_gi");
  const [searchDistrictQuery, setSearchDistrictQuery] = useState<string>("");
  const [onlyOptimalFilter, setOnlyOptimalFilter] = useState<boolean>(false);
  const [subViewMode, setSubViewMode] = useState<
    "all" | "spatial_heatmap" | "historical_trend"
  >("all");
  const historicalSectionRef = useRef<HTMLDivElement | null>(null);

  // Range Slider Threshold Filter State
  const [thresholdFilterMetric, setThresholdFilterMetric] =
    useState<ThresholdFilterMetric>("temp");
  const [isThresholdFilterActive, setIsThresholdFilterActive] =
    useState<boolean>(false);
  const [tempThresholdRange, setTempThresholdRange] = useState<[number, number]>([
    23.0, 31.5,
  ]);
  const [humidityThresholdRange, setHumidityThresholdRange] = useState<
    [number, number]
  >([55, 78]);
  const [onlyShowMatchedInTable, setOnlyShowMatchedInTable] =
    useState<boolean>(false);
  const [dimUnmatchedOnMap, setDimUnmatchedOnMap] = useState<boolean>(true);

  const focusedHistoricalTrend = useMemo(
    () => computeDistrictHistoricalClimateTrend(selectedDistrict),
    [selectedDistrict]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedVariety = useMemo(
    () =>
      CROP_VARIETY_SPECS.find((v) => v.id === selectedVarietyId) ||
      CROP_VARIETY_SPECS[0],
    [selectedVarietyId]
  );

  // Compute all 32 districts microclimate records dynamically
  const allDistrictRecords = useMemo(() => {
    return KORAT_DISTRICTS.map((dist) =>
      computeDistrictMicroclimate(dist, timeSlice, selectedVariety)
    );
  }, [timeSlice, selectedVariety]);

  const focusedRecord = useMemo(
    () =>
      allDistrictRecords.find((r) => r.district.id === selectedDistrict.id) ||
      allDistrictRecords[0],
    [allDistrictRecords, selectedDistrict.id]
  );

  // Top 6 Best-Matching Microclimate Districts for the selected Crop Variety
  const topMatchingDistricts = useMemo(() => {
    return [...allDistrictRecords]
      .sort((a, b) => b.varietySuitabilityScore - a.varietySuitabilityScore)
      .slice(0, 6);
  }, [allDistrictRecords]);

  // Province-wide summary stats
  const provinceStats = useMemo(() => {
    const temps = allDistrictRecords.map((r) => r.groundTempC);
    const hums = allDistrictRecords.map((r) => r.relativeHumidityPct);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const avgHum = Math.round(hums.reduce((a, b) => a + b, 0) / hums.length);
    const optimalCount = allDistrictRecords.filter(
      (r) => r.varietySuitabilityScore >= 80
    ).length;
    return { minTemp, maxTemp, avgHum, optimalCount };
  }, [allDistrictRecords]);

  // Coordinate projection for the 32-District Spatial Canvas & SVG Overlay
  // Korat Lat: 14.12 to 15.80, Lon: 101.18 to 102.98
  const mapWidth = 760;
  const mapHeight = 470;
  const minLat = 14.1;
  const maxLat = 15.82;
  const minLon = 101.18;
  const maxLon = 102.96;

  const projectLatLonToXY = (lat: number, lon: number) => {
    const padX = 48;
    const padY = 40;
    const usableW = mapWidth - padX * 2;
    const usableH = mapHeight - padY * 2;
    const x = padX + ((lon - minLon) / (maxLon - minLon)) * usableW;
    const y = padY + ((maxLat - lat) / (maxLat - minLat)) * usableH;
    return { x, y };
  };

  // Render Dynamic Inverse-Distance-Weighting (IDW) Continuous Thermal/Humidity Heatmap on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 190; // Low-res grid scaled up smoothly via CSS for fast real-time IDW rendering
    const h = 118;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const sensorPoints = allDistrictRecords.map((rec) => {
      const pt = projectLatLonToXY(rec.district.lat, rec.district.lon);
      return {
        gx: (pt.x / mapWidth) * w,
        gy: (pt.y / mapHeight) * h,
        rgb: getHeatmapRgbForRecord(rec, layerMode),
      };
    });

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        let weightSum = 0;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let minDistSq = Infinity;

        for (let i = 0; i < sensorPoints.length; i++) {
          const sp = sensorPoints[i];
          const dx = px - sp.gx;
          const dy = py - sp.gy;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistSq) minDistSq = dSq;
          const weight = 1 / Math.pow(dSq + 18, 1.65);
          weightSum += weight;
          rSum += sp.rgb[0] * weight;
          gSum += sp.rgb[1] * weight;
          bSum += sp.rgb[2] * weight;
        }

        // Fade out gently outside the Korat 32-district hull
        const maxHullDistSq = 34 * 34;
        const alphaFactor =
          minDistSq > maxHullDistSq
            ? Math.max(0, 1 - (minDistSq - maxHullDistSq) / 650)
            : 1;

        const idx = (py * w + px) * 4;
        data[idx] = Math.round(rSum / weightSum);
        data[idx + 1] = Math.round(gSum / weightSum);
        data[idx + 2] = Math.round(bSum / weightSum);
        data[idx + 3] = Math.round(168 * alphaFactor);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [allDistrictRecords, layerMode]);

  // Threshold Filter Evaluation Logic
  const isDistrictMatchedByThreshold = (rec: DistrictMicroclimateRecord) => {
    if (!isThresholdFilterActive || thresholdFilterMetric === "none") return true;
    if (thresholdFilterMetric === "temp" || thresholdFilterMetric === "both") {
      if (
        rec.groundTempC < tempThresholdRange[0] ||
        rec.groundTempC > tempThresholdRange[1]
      ) {
        return false;
      }
    }
    if (
      thresholdFilterMetric === "humidity" ||
      thresholdFilterMetric === "both"
    ) {
      if (
        rec.relativeHumidityPct < humidityThresholdRange[0] ||
        rec.relativeHumidityPct > humidityThresholdRange[1]
      ) {
        return false;
      }
    }
    return true;
  };

  const matchingDistrictRecords = useMemo(() => {
    return allDistrictRecords.filter(isDistrictMatchedByThreshold);
  }, [
    allDistrictRecords,
    isThresholdFilterActive,
    thresholdFilterMetric,
    tempThresholdRange,
    humidityThresholdRange,
  ]);

  const matchingDistrictCount = matchingDistrictRecords.length;
  const matchingDistrictPercentage = Math.round(
    (matchingDistrictCount / (allDistrictRecords.length || 1)) * 100
  );

  const applyThresholdPreset = (
    preset:
      | "crop_optimal"
      | "highland_cool"
      | "plains_warm"
      | "upland_hot_dry"
      | "reset_all"
  ) => {
    if (preset === "crop_optimal") {
      setTempThresholdRange([
        selectedVariety.optimalGroundTempMinC,
        selectedVariety.optimalGroundTempMaxC,
      ]);
      setHumidityThresholdRange([
        selectedVariety.optimalHumidityMinPct,
        selectedVariety.optimalHumidityMaxPct,
      ]);
      setThresholdFilterMetric("both");
      setIsThresholdFilterActive(true);
    } else if (preset === "highland_cool") {
      setTempThresholdRange([18.0, 25.0]);
      setHumidityThresholdRange([70, 95]);
      setThresholdFilterMetric("both");
      setIsThresholdFilterActive(true);
    } else if (preset === "plains_warm") {
      setTempThresholdRange([25.5, 31.0]);
      setHumidityThresholdRange([55, 75]);
      setThresholdFilterMetric("both");
      setIsThresholdFilterActive(true);
    } else if (preset === "upland_hot_dry") {
      setTempThresholdRange([31.5, 40.0]);
      setHumidityThresholdRange([35, 58]);
      setThresholdFilterMetric("both");
      setIsThresholdFilterActive(true);
    } else if (preset === "reset_all") {
      setTempThresholdRange([18.0, 40.0]);
      setHumidityThresholdRange([35, 95]);
      setThresholdFilterMetric("none");
      setIsThresholdFilterActive(false);
      setOnlyShowMatchedInTable(false);
    }
  };

  const filteredDirectoryRecords = useMemo(() => {
    const q = searchDistrictQuery.trim().toLowerCase();
    return allDistrictRecords
      .filter((r) => {
        if (onlyOptimalFilter && r.varietySuitabilityScore < 78) return false;
        if (
          onlyShowMatchedInTable &&
          isThresholdFilterActive &&
          !isDistrictMatchedByThreshold(r)
        ) {
          return false;
        }
        if (!q) return true;
        return (
          r.district.nameTh.toLowerCase().includes(q) ||
          r.district.nameEn.toLowerCase().includes(q) ||
          r.microclimateTypeTh.toLowerCase().includes(q) ||
          r.district.zone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (isThresholdFilterActive && !onlyShowMatchedInTable) {
          const aMatch = isDistrictMatchedByThreshold(a);
          const bMatch = isDistrictMatchedByThreshold(b);
          if (aMatch !== bMatch) return aMatch ? -1 : 1;
        }
        return b.varietySuitabilityScore - a.varietySuitabilityScore;
      });
  }, [
    allDistrictRecords,
    searchDistrictQuery,
    onlyOptimalFilter,
    onlyShowMatchedInTable,
    isThresholdFilterActive,
    thresholdFilterMetric,
    tempThresholdRange,
    humidityThresholdRange,
  ]);

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-3xl p-5 sm:p-7 space-y-7 text-white shadow-xl">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF] font-mono font-bold">
              <ThermometerSun className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>32-District Micro-Climate Heatmap Engine</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">
              วิเคราะห์อุณหภูมิผิวดิน (5–10 ซม.) · ความชื้นสัมพัทธ์ (%RH) · ค่า VPD รายสายพันธุ์พืช
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            แผนที่ความร้อนจุลภูมิอากาศ 32 อำเภอ (Climate Heatmap: อุณหภูมิผิวดิน &amp; ความชื้นสัมพัทธ์)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
            สำรวจการกระจายตัวของอุณหภูมิผิวดินและความชื้นสัมพัทธ์รายชั่วโมง-รายฤดูกาลครอบคลุมทั้ง 32 อำเภอของจังหวัดนครราชสีมา เพื่อค้นหา{" "}
            <strong className="text-[#2DD4BF]">เขตจุลภูมิอากาศเฉพาะถิ่น (Micro-Climates)</strong>{" "}
            ที่เหมาะสมที่สุดสำหรับสายพันธุ์พืชเศรษฐกิจและไม้ผลมูลค่าสูงแต่ละชนิด
          </p>
        </div>

        {/* Crop Variety Selector Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          {onOpenVarietyMatcher && (
            <button
              type="button"
              onClick={onOpenVarietyMatcher}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI จับคู่สายพันธุ์ผลผลิตสูงสุด (Crop Variety Matcher)</span>
            </button>
          )}
          <div className="bg-[#111827] border border-[#14B8A6]/50 rounded-2xl px-3.5 py-2">
            <label
              htmlFor="climate-variety-select"
              className="block text-[10px] font-mono uppercase tracking-wider text-[#2DD4BF]"
            >
              เลือกสายพันธุ์พืชเพื่อจับคู่จุลภูมิอากาศ
            </label>
            <select
              id="climate-variety-select"
              value={selectedVarietyId}
              onChange={(e) => setSelectedVarietyId(e.target.value)}
              className="text-xs sm:text-sm font-bold bg-transparent text-white focus:outline-none cursor-pointer mt-0.5"
            >
              {CROP_VARIETY_SPECS.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#0B101D] text-white">
                  {v.nameTh}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top KPI Summary Cards across 32 Districts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>พิสัยอุณหภูมิผิวดิน (32 อำเภอ)</span>
            <ThermometerSun className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {provinceStats.minTemp.toFixed(1)}°C – {provinceStats.maxTemp.toFixed(1)}°C
          </div>
          <div className="text-[11px] text-[#2DD4BF]">
            เกณฑ์สายพันธุ์ที่เลือก: {selectedVariety.optimalGroundTempMinC}–
            {selectedVariety.optimalGroundTempMaxC}°C
          </div>
        </div>

        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ความชื้นสัมพัทธ์เฉลี่ยทั้งจังหวัด</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {provinceStats.avgHum}% RH
          </div>
          <div className="text-[11px] text-sky-300">
            เกณฑ์สายพันธุ์ที่เลือก: {selectedVariety.optimalHumidityMinPct}–
            {selectedVariety.optimalHumidityMaxPct}% RH
          </div>
        </div>

        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>อำเภอที่มีจุลภูมิอากาศเหมาะสมดีเยี่ยม</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {provinceStats.optimalCount} / 32 อำเภอ
          </div>
          <div className="text-[11px] text-slate-300 truncate">
            เด่นสุด: {topMatchingDistricts.slice(0, 3).map((d) => d.district.nameTh).join(", ")}
          </div>
        </div>

        <div className="bg-[#080C16] border border-[#14B8A6]/40 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#2DD4BF]">
            <span>พื้นที่โฟกัส: {focusedRecord.district.nameTh}</span>
            <Compass className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FBBF24]">
            {focusedRecord.varietySuitabilityScore}% Match
          </div>
          <div className="text-[11px] text-slate-300 truncate">
            ดิน {focusedRecord.groundTempC}°C · ความชื้น {focusedRecord.relativeHumidityPct}% · VPD{" "}
            {focusedRecord.vpdKpa} kPa
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar: Switch between Spatial Heatmap, Climate Historical Trend (5-Yr Avg vs Current Year), or Both */}
      <div className="bg-[#080C16] border border-[#14B8A6]/40 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#2DD4BF] flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>โหมดวิเคราะห์ภูมิอากาศ:</span>
          </span>
          {(
            [
              {
                id: "all",
                label: "📊 แสดงทั้งหมด (Heatmap + แนวโน้มย้อนหลัง 5 ปี)",
              },
              {
                id: "historical_trend",
                label:
                  "📈 แดชบอร์ดแนวโน้มภูมิอากาศย้อนหลัง 5 ปี (Climate Historical Trend)",
              },
              {
                id: "spatial_heatmap",
                label: "🗺️ เฉพาะแผนที่ความร้อนจุลภูมิอากาศ 32 อำเภอ",
              },
            ] as {
              id: "all" | "spatial_heatmap" | "historical_trend";
              label: string;
            }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubViewMode(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subViewMode === tab.id
                  ? "bg-[#14B8A6] text-[#041E1C] shadow-[0_0_14px_rgba(20,184,166,0.35)]"
                  : "bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span>
            {selectedDistrict.nameTh} (ปีนี้ vs เฉลี่ย 5 ปี):{" "}
            <strong className="text-rose-400">
              +{focusedHistoricalTrend.annualTempShiftC}°C
            </strong>{" "}
            · ฝน{" "}
            <strong
              className={
                focusedHistoricalTrend.annualRainShiftPct >= 0
                  ? "text-sky-400"
                  : "text-amber-400"
              }
            >
              {focusedHistoricalTrend.annualRainShiftPct >= 0 ? "+" : ""}
              {focusedHistoricalTrend.annualRainShiftPct}%
            </strong>
          </span>
        </div>
      </div>

      {/* Render Climate Historical Trend Dashboard at top when "historical_trend" is explicitly selected */}
      {subViewMode === "historical_trend" && (
        <div ref={historicalSectionRef}>
          <ClimateHistoricalTrendDashboard
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
          />
        </div>
      )}

      {subViewMode !== "historical_trend" && (
        <>

      {/* Control Toolbar: Heatmap Layer Mode + Time Slice Scrubber */}
      <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Layer Switcher */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>1. เลือกตัวชี้วัดแผนที่ความร้อน (Heatmap Layer Metric)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  id: "ground_temp",
                  label: "🌡️ อุณหภูมิผิวดิน (Ground Temp °C)",
                },
                {
                  id: "humidity",
                  label: "💧 ความชื้นสัมพัทธ์ (Humidity %RH)",
                },
                {
                  id: "rainfall",
                  label: "🌧️ เรดาร์ปริมาณฝน (Rainfall Radar)",
                },
                {
                  id: "soil_moisture",
                  label: "🌾 ความชื้นดิน GISTDA (Soil Moisture)",
                },
                {
                  id: "irrigation",
                  label: "🌊 เขตชลประทาน & คลอง (Irrigation)",
                },
                {
                  id: "crop_suitability",
                  label: "🌱 ความเหมาะสมสายพันธุ์พืช (% Match)",
                },
                {
                  id: "vpd_index",
                  label: "🍃 ดัชนีการคายน้ำ (VPD kPa)",
                },
              ] as { id: ClimateHeatmapLayerMode; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSetLayerMode(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  layerMode === item.id
                    ? "bg-[#14B8A6] text-[#041E1C] shadow-[0_0_16px_rgba(20,184,166,0.35)]"
                    : "bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diurnal / Seasonal Time Slice Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>2. จำลองช่วงเวลาและฤดูกาล (Diurnal &amp; Seasonal Slice)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  id: "afternoon_peak",
                  label: "☀️ บ่ายจัด 14:00 น. (ผิวดินร้อนสุด)",
                },
                {
                  id: "morning_root",
                  label: "🌅 เช้าตรู่ 06:30 น. (น้ำค้าง/รากพืช)",
                },
                {
                  id: "cool_season",
                  label: "❄️ ฤดูหนาว พ.ย.–ม.ค. (สะสมความเย็น)",
                },
                {
                  id: "hot_dry",
                  label: "🔥 ฤดูแล้ง มี.ค.–เม.ย. (เฝ้าระวังไอร้อน)",
                },
              ] as { id: ClimateTimeSliceMode; label: string }[]
            ).map((sl) => (
              <button
                key={sl.id}
                type="button"
                onClick={() => setTimeSlice(sl.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  timeSlice === sl.id
                    ? "bg-[#F59E0B] text-slate-950 font-bold"
                    : "bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B]"
                }`}
              >
                {sl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent GIS Map Layers Toggle Bar (State Persisted to localStorage across sessions) */}
      <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>เลเยอร์ซ้อนทับ GIS Map Overlays (จดจำในเบราว์เซอร์อัตโนมัติ):</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>localStorage Synced</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            สลับเปิด/ปิดเลเยอร์ซ้อนทับ เรดาร์ฝน, ความชื้นดิน, และเขตชลประทาน
            ระบบจะบันทึกการตั้งค่าลงในเครื่องอัตโนมัติคงอยู่ทุกครั้งที่เปิดใช้งานใหม่
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Rainfall Layer Toggle */}
          <button
            type="button"
            onClick={() => handleToggleGisLayer("rainfall")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              gisLayers.rainfall
                ? "bg-sky-500/20 text-sky-300 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                : "bg-[#111827] text-slate-400 hover:text-white border-[#1E293B]"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span>เรดาร์ฝน (Rainfall)</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                gisLayers.rainfall
                  ? "bg-sky-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {gisLayers.rainfall ? "ON" : "OFF"}
            </span>
          </button>

          {/* Soil Moisture Layer Toggle */}
          <button
            type="button"
            onClick={() => handleToggleGisLayer("soil_moisture")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              gisLayers.soil_moisture
                ? "bg-teal-500/20 text-[#2DD4BF] border-teal-400/60 shadow-[0_0_10px_rgba(45,212,191,0.25)]"
                : "bg-[#111827] text-slate-400 hover:text-white border-[#1E293B]"
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
            <span>ความชื้นดิน (Soil Moisture)</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                gisLayers.soil_moisture
                  ? "bg-teal-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {gisLayers.soil_moisture ? "ON" : "OFF"}
            </span>
          </button>

          {/* Irrigation Layer Toggle */}
          <button
            type="button"
            onClick={() => handleToggleGisLayer("irrigation")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              gisLayers.irrigation
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                : "bg-[#111827] text-slate-400 hover:text-white border-[#1E293B]"
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-emerald-400" />
            <span>เขตชลประทาน & คลอง (Irrigation)</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                gisLayers.irrigation
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {gisLayers.irrigation ? "ON" : "OFF"}
            </span>
          </button>

          {/* Reset Layers Button */}
          <button
            type="button"
            onClick={handleResetGisLayers}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-[#111827] hover:bg-slate-800 border border-[#1E293B] transition-colors cursor-pointer"
            title="คืนค่าเลเยอร์เริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>
        </div>
      </div>

      {/* 3. Range Slider Threshold Filter Section */}
      <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        {/* Panel Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/40 text-[#2DD4BF] text-xs font-mono font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>3. สไลเดอร์กรองอำเภอตามช่วงเกณฑ์ (Threshold Range Slider)</span>
              </span>
              {isThresholdFilterActive && thresholdFilterMetric !== "none" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    พบ {matchingDistrictCount} / 32 อำเภอ ({matchingDistrictPercentage}%)
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
                  <span>แสดงครบ 32 อำเภอ (ยังไม่จำกัดช่วง)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              เลื่อนปรับสไลเดอร์ช่วงอุณหภูมิผิวดิน (°C) หรือความชื้นสัมพัทธ์ (%RH) เพื่อคัดกรองอำเภอที่ตรงตามจุลภูมิอากาศเฉพาะทางสำหรับแปลงเพาะปลูก
            </p>
          </div>

          {/* Quick Filter Control Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isThresholdFilterActive) {
                  setIsThresholdFilterActive(true);
                  if (thresholdFilterMetric === "none") setThresholdFilterMetric("temp");
                } else {
                  setIsThresholdFilterActive(false);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isThresholdFilterActive && thresholdFilterMetric !== "none"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                  : "bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B]"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {isThresholdFilterActive && thresholdFilterMetric !== "none"
                  ? "ตัวกรองทำงานอยู่"
                  : "เปิดใช้งานตัวกรอง"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyThresholdPreset("reset_all")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-[#111827] hover:bg-slate-800 border border-[#1E293B] transition-colors cursor-pointer"
              title="ล้างตัวกรองและแสดงครบ 32 อำเภอ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างเกณฑ์</span>
            </button>

            <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-[#111827] border border-[#1E293B] px-2.5 py-1.5 rounded-xl">
              <input
                type="checkbox"
                checked={dimUnmatchedOnMap}
                onChange={(e) => setDimUnmatchedOnMap(e.target.checked)}
                className="rounded border-slate-600 text-[#14B8A6]"
              />
              <span>หรี่อำเภอนอกเกณฑ์บนแผนที่</span>
            </label>
          </div>
        </div>

        {/* Filter Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>เลือกตัวชี้วัดที่ต้องการกรอง:</span>
          </span>
          {(
            [
              {
                id: "temp",
                label: "🌡️ อุณหภูมิผิวดิน (Ground Temp °C)",
                desc: "กรองเฉพาะอุณหภูมิผิวดิน",
              },
              {
                id: "humidity",
                label: "💧 ความชื้นสัมพัทธ์ (Relative Humidity %)",
                desc: "กรองเฉพาะความชื้นทรงพุ่ม",
              },
              {
                id: "both",
                label: "⚡ กรองร่วม 2 เกณฑ์ (อุณหภูมิดิน + ความชื้น)",
                desc: "ตรงตามทั้งอุณหภูมิและความชื้น",
              },
              {
                id: "none",
                label: "🌐 แสดงทั้งหมด (ไม่กรองเกณฑ์)",
                desc: "ปลดการกรองทั้งหมด",
              },
            ] as { id: ThresholdFilterMetric; label: string; desc: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setThresholdFilterMetric(m.id);
                setIsThresholdFilterActive(m.id !== "none");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                thresholdFilterMetric === m.id && (m.id === "none" || isThresholdFilterActive)
                  ? "bg-[#14B8A6] text-[#041E1C] shadow-[0_0_14px_rgba(20,184,166,0.35)]"
                  : "bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Sliders Container */}
        {thresholdFilterMetric !== "none" && isThresholdFilterActive && (
          <div className="space-y-4">
            {/* Ground Temperature Range Slider */}
            {(thresholdFilterMetric === "temp" || thresholdFilterMetric === "both") && (
              <DualRangeSliderControl
                label="เกณฑ์อุณหภูมิผิวดิน (Ground Temperature Range)"
                metricIcon={<ThermometerSun className="w-4 h-4 text-amber-400" />}
                unit="°C"
                min={18.0}
                max={40.0}
                step={0.5}
                values={tempThresholdRange}
                onChange={(val) => {
                  setTempThresholdRange(val);
                  setIsThresholdFilterActive(true);
                }}
                accent="amber"
                districtValues={allDistrictRecords.map((r) => ({
                  districtName: r.district.nameTh,
                  val: r.groundTempC,
                  id: r.district.id,
                }))}
                cropOptimalRange={[
                  selectedVariety.optimalGroundTempMinC,
                  selectedVariety.optimalGroundTempMaxC,
                ]}
                cropName={selectedVariety.nameTh}
                matchedCount={
                  allDistrictRecords.filter(
                    (r) =>
                      r.groundTempC >= tempThresholdRange[0] &&
                      r.groundTempC <= tempThresholdRange[1]
                  ).length
                }
                totalCount={allDistrictRecords.length}
              />
            )}

            {/* Relative Humidity Range Slider */}
            {(thresholdFilterMetric === "humidity" || thresholdFilterMetric === "both") && (
              <DualRangeSliderControl
                label="เกณฑ์ความชื้นสัมพัทธ์ระดับทรงพุ่ม (Relative Humidity Range)"
                metricIcon={<Droplets className="w-4 h-4 text-sky-400" />}
                unit="%"
                min={35}
                max={95}
                step={1}
                values={humidityThresholdRange}
                onChange={(val) => {
                  setHumidityThresholdRange(val);
                  setIsThresholdFilterActive(true);
                }}
                accent="sky"
                districtValues={allDistrictRecords.map((r) => ({
                  districtName: r.district.nameTh,
                  val: r.relativeHumidityPct,
                  id: r.district.id,
                }))}
                cropOptimalRange={[
                  selectedVariety.optimalHumidityMinPct,
                  selectedVariety.optimalHumidityMaxPct,
                ]}
                cropName={selectedVariety.nameTh}
                matchedCount={
                  allDistrictRecords.filter(
                    (r) =>
                      r.relativeHumidityPct >= humidityThresholdRange[0] &&
                      r.relativeHumidityPct <= humidityThresholdRange[1]
                  ).length
                }
                totalCount={allDistrictRecords.length}
              />
            )}
          </div>
        )}

        {/* Quick Threshold Presets Bar */}
        <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px] mr-1">
              🎯 พรีเซ็ตแนะนำด่วน:
            </span>
            <button
              type="button"
              onClick={() => applyThresholdPreset("crop_optimal")}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
            >
              🎯 ตามเกณฑ์ {selectedVariety.nameTh.split(" ")[0]} ({selectedVariety.optimalGroundTempMinC}–{selectedVariety.optimalGroundTempMaxC}°C / {selectedVariety.optimalHumidityMinPct}–{selectedVariety.optimalHumidityMaxPct}%)
            </button>
            <button
              type="button"
              onClick={() => applyThresholdPreset("highland_cool")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#111827] hover:bg-slate-800 text-sky-300 border border-sky-500/30 transition-colors cursor-pointer"
            >
              ❄️ หุบเขาสูงร่มเย็น (18–25°C, ≥70%)
            </button>
            <button
              type="button"
              onClick={() => applyThresholdPreset("plains_warm")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#111827] hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            >
              🌾 ที่ราบเพาะปลูกอบอุ่น (25.5–31°C, 55–75%)
            </button>
            <button
              type="button"
              onClick={() => applyThresholdPreset("upland_hot_dry")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#111827] hover:bg-slate-800 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
            >
              🔥 โคก-ดอนแล้งร้อน (31.5–40°C, 35–58%)
            </button>
          </div>

          <button
            type="button"
            onClick={() => applyThresholdPreset("reset_all")}
            className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
          >
            รีเซ็ตช่วงทั้งหมด (18–40°C / 35–95%)
          </button>
        </div>

        {/* Matching Districts Horizontal Quick-Chips Strip */}
        {isThresholdFilterActive && thresholdFilterMetric !== "none" && (
          <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  รายชื่ออำเภอที่ตรงตามช่วงเกณฑ์ที่กำหนด ({matchingDistrictCount} อำเภอ):
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                คลิกเพื่อโฟกัสอำเภอบนแผนที่
              </span>
            </div>

            {matchingDistrictCount > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {matchingDistrictRecords.map((r) => {
                  const isSel = r.district.id === selectedDistrict.id;
                  return (
                    <button
                      key={r.district.id}
                      type="button"
                      onClick={() => onSelectDistrict(r.district.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        isSel
                          ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-md"
                          : "bg-[#111827] hover:bg-slate-800 text-slate-200 border border-slate-800"
                      }`}
                    >
                      <span>{r.district.nameTh}</span>
                      <span className="text-[10px] opacity-80">
                        {r.groundTempC}°C · {r.relativeHumidityPct}%
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  ไม่พบอำเภอที่อยู่ในช่วงเกณฑ์นี้ แนะนำให้ขยายช่วงอุณหภูมิผิวดินหรือความชื้นสัมพัทธ์
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Split Workspace: Left 7 Cols = Interactive 32-District Thermal/Humidity Heatmap | Right 5 Cols = Selected District Microclimate & Crop Variety Diagnostic */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: Dynamic Canvas + SVG 32-District Climate Heatmap */}
        <div className="xl:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>
                  แผนที่ความร้อนจุลภูมิอากาศ 32 อำเภอ:{" "}
                  {layerMode === "ground_temp"
                    ? "อุณหภูมิผิวดิน (Ground Temp °C)"
                    : layerMode === "humidity"
                    ? "ความชื้นสัมพัทธ์ระดับทรงพุ่ม (%RH)"
                    : layerMode === "crop_suitability"
                    ? `ความเหมาะสมต่อ ${selectedVariety.nameTh}`
                    : "ความดันไออิ่มตัวส่วนขาด (VPD kPa)"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                คลิกที่จุดสถานีอำเภอบนแผนที่เพื่อตรวจสอบกราฟแนวโน้มอุณหภูมิดินและความชื้นรายเดือน · วงแหวนสีทองคือ 6 อำเภอที่เหมาะกับสายพันธุ์พืชมากที่สุด
              </p>
            </div>
          </div>

          {/* Interactive Spatial Canvas + SVG Map Viewport */}
          <div className="relative w-full aspect-[16/10] bg-[#050811] border border-[#1E293B] rounded-2xl overflow-hidden select-none">
            {/* Floating Active Filter HUD Badge on Map */}
            {isThresholdFilterActive && thresholdFilterMetric !== "none" && (
              <div className="absolute top-3 left-3 z-20 bg-[#080C16]/90 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs shadow-lg">
                <span className="text-white font-medium">
                  กรองเกณฑ์:{" "}
                  <strong className="text-emerald-300 font-mono">
                    {matchingDistrictCount}/32 อำเภอ
                  </strong>
                  {thresholdFilterMetric === "temp" && (
                    <span className="text-slate-300 ml-1">
                      (ผิวดิน {tempThresholdRange[0]}–{tempThresholdRange[1]}°C)
                    </span>
                  )}
                  {thresholdFilterMetric === "humidity" && (
                    <span className="text-slate-300 ml-1">
                      (ความชื้น {humidityThresholdRange[0]}–{humidityThresholdRange[1]}%)
                    </span>
                  )}
                  {thresholdFilterMetric === "both" && (
                    <span className="text-slate-300 ml-1">
                      (ดิน {tempThresholdRange[0]}–{tempThresholdRange[1]}°C · ชื้น{" "}
                      {humidityThresholdRange[0]}–{humidityThresholdRange[1]}%)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => applyThresholdPreset("reset_all")}
                  className="text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors ml-1"
                >
                  ✕ ปิด
                </button>
              </div>
            )}

            {/* Floating On-Map GIS Layer Toggle Controls (Top Right) */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#080C16]/90 backdrop-blur-md border border-[#1E293B] rounded-xl p-1.5 shadow-xl">
              <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
                GIS:
              </span>
              <button
                type="button"
                onClick={() => handleToggleGisLayer("rainfall")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  gisLayers.rainfall
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-[#111827] text-slate-300 hover:text-white"
                }`}
                title="เปิด/ปิดเรดาร์ฝน (Rainfall Layer - บันทึกใน localStorage)"
              >
                <CloudRain className="w-3 h-3" />
                <span>เรดาร์ฝน</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleGisLayer("soil_moisture")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  gisLayers.soil_moisture
                    ? "bg-teal-500 text-slate-950 shadow-sm"
                    : "bg-[#111827] text-slate-300 hover:text-white"
                }`}
                title="เปิด/ปิดความชื้นดิน GISTDA (Soil Moisture - บันทึกใน localStorage)"
              >
                <Droplets className="w-3 h-3" />
                <span>ความชื้นดิน</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleGisLayer("irrigation")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  gisLayers.irrigation
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "bg-[#111827] text-slate-300 hover:text-white"
                }`}
                title="เปิด/ปิดเขตชลประทานและคลองส่งน้ำ (Irrigation - บันทึกใน localStorage)"
              >
                <Waves className="w-3 h-3" />
                <span>ชลประทาน</span>
              </button>
            </div>

            {/* Floating Persistence Toast Alert */}
            {persistedToast.visible && (
              <div className="absolute bottom-16 right-4 z-30 bg-[#080C16]/95 backdrop-blur-md border border-emerald-500/50 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xl text-xs text-white">
                <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{persistedToast.message}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  localStorage ✓
                </span>
              </div>
            )}

            {/* Underlying IDW Continuous Heatmap Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-fill opacity-90 pointer-events-none"
              style={{ filter: "blur(6px)" }}
            />

            {/* Subtle Topographic Latitude/Longitude Graticule & District Sensor Nodes SVG */}
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="relative z-10 w-full h-full"
            >
              {/* Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((frac, idx) => (
                <React.Fragment key={idx}>
                  <line
                    x1={mapWidth * frac}
                    y1={0}
                    x2={mapWidth * frac}
                    y2={mapHeight}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                    strokeWidth={0.8}
                  />
                  <line
                    x1={0}
                    y1={mapHeight * frac}
                    x2={mapWidth}
                    y2={mapHeight * frac}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                    strokeWidth={0.8}
                  />
                </React.Fragment>
              ))}

              {/* GIS Overlay Layer 1: Weather Radar Rings when Rainfall layer is active */}
              {(gisLayers.rainfall || layerMode === "rainfall") &&
                (() => {
                  const radarCenter = projectLatLonToXY(15.22, 102.49);
                  return (
                    <g className="pointer-events-none">
                      {[50, 95, 140].map((radius, rIdx) => (
                        <circle
                          key={rIdx}
                          cx={radarCenter.x}
                          cy={radarCenter.y}
                          r={radius}
                          fill="none"
                          stroke="rgba(56, 189, 248, 0.45)"
                          strokeWidth={1.2}
                          strokeDasharray="4 4"
                        />
                      ))}
                      <circle
                        cx={radarCenter.x}
                        cy={radarCenter.y}
                        r={4}
                        fill="#38BDF8"
                      />
                      <text
                        x={radarCenter.x}
                        y={radarCenter.y - 145}
                        fill="#7DD3FC"
                        fontSize={8}
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        📡 เรดาร์ตรวจอากาศพิมาย (TMD Doppler 140km)
                      </text>
                    </g>
                  );
                })()}

              {/* GIS Overlay Layer 2: Irrigation Canals & Water Nodes when Irrigation layer is active */}
              {(gisLayers.irrigation || layerMode === "irrigation") && (
                <g className="pointer-events-none">
                  {KORAT_IRRIGATION_CANALS.map((canal) => {
                    const pts = canal.coords.map((c) =>
                      projectLatLonToXY(c[0], c[1])
                    );
                    const ptsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
                    return (
                      <g key={canal.id}>
                        <polyline
                          points={ptsStr}
                          fill="none"
                          stroke={canal.colorHex}
                          strokeWidth={4.5}
                          strokeOpacity={0.25}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points={ptsStr}
                          fill="none"
                          stroke={canal.colorHex}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {pts.length > 2 && (
                          <text
                            x={pts[1].x}
                            y={pts[1].y - 5}
                            fill="#E0F2FE"
                            fontSize={7.5}
                            fontFamily="sans-serif"
                            fontWeight="bold"
                          >
                            🌊 {canal.nameTh.split(" ")[0]} ({canal.waterLevelPct}%)
                          </text>
                        )}
                      </g>
                    );
                  })}
                  {KORAT_WATER_SOURCE_NODES.map((ws) => {
                    const pt = projectLatLonToXY(ws.lat, ws.lon);
                    return (
                      <g key={ws.id}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={4.5}
                          fill="#0284C7"
                          stroke="#E0F2FE"
                          strokeWidth={1.5}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* GIS Overlay Layer 3: GISTDA Soil Moisture Satellites Contours when Soil Moisture layer is active */}
              {(gisLayers.soil_moisture || layerMode === "soil_moisture") && (
                <g className="pointer-events-none">
                  {allDistrictRecords.map((rec) => {
                    const pt = projectLatLonToXY(rec.district.lat, rec.district.lon);
                    const sm = rec.district.gistdaSoilMoisturePct;
                    const smColor =
                      sm < 30
                        ? "rgba(239, 68, 68, 0.28)"
                        : sm < 40
                        ? "rgba(245, 158, 11, 0.25)"
                        : sm < 55
                        ? "rgba(20, 184, 166, 0.28)"
                        : "rgba(14, 165, 233, 0.32)";
                    const smRadius = Math.max(12, Math.min(26, sm * 0.45));
                    return (
                      <g key={`sm-${rec.district.id}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={smRadius}
                          fill={smColor}
                          stroke="none"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Regional Zone Labels on Map */}
              <text
                x={85}
                y={395}
                fill="#94A3B8"
                fontSize={10}
                fontFamily="monospace"
                opacity={0.8}
              >
                โซนที่ราบสูงเขาใหญ่-ปากช่อง (ความชื้นสูง/ดินเย็น)
              </text>
              <text
                x={435}
                y={435}
                fill="#94A3B8"
                fontSize={10}
                fontFamily="monospace"
                opacity={0.8}
              >
                โซนดงพญาเย็น: วังน้ำเขียว · ครบุรี · เสิงสาง
              </text>
              <text
                x={445}
                y={70}
                fill="#94A3B8"
                fontSize={10}
                fontFamily="monospace"
                opacity={0.8}
              >
                โซนทุ่งสัมฤทธิ์-บัวใหญ่-พิมาย-ชุมพวง
              </text>

              {/* Render All 32 District Sensor Nodes */}
              {allDistrictRecords.map((rec) => {
                const { x, y } = projectLatLonToXY(
                  rec.district.lat,
                  rec.district.lon
                );
                const isSelected = rec.district.id === selectedDistrict.id;
                const isTopMatch = topMatchingDistricts.some(
                  (t) => t.district.id === rec.district.id
                );
                const [r, g, b] = getHeatmapRgbForRecord(rec, layerMode);

                const isThresholdMatch = isDistrictMatchedByThreshold(rec);
                const isFilteredOut =
                  isThresholdFilterActive &&
                  thresholdFilterMetric !== "none" &&
                  !isThresholdMatch;

                const badgeValue =
                  layerMode === "ground_temp"
                    ? `${rec.groundTempC}°C`
                    : layerMode === "humidity"
                    ? `${rec.relativeHumidityPct}%`
                    : layerMode === "rainfall" || gisLayers.rainfall
                    ? `ฝน ${rec.district.rainProbToday}%`
                    : layerMode === "soil_moisture" || gisLayers.soil_moisture
                    ? `ดิน ${rec.district.gistdaSoilMoisturePct}%`
                    : layerMode === "irrigation" || gisLayers.irrigation
                    ? `${
                        rec.district.zone.includes("ลำตะคอง") ||
                        rec.district.zone.includes("ทุ่งสัมฤทธิ์")
                          ? "ชลประทาน"
                          : "นอกเขต"
                      }`
                    : layerMode === "vpd_index"
                    ? `${rec.vpdKpa}`
                    : `${rec.varietySuitabilityScore}%`;

                return (
                  <g
                    key={rec.district.id}
                    onClick={() => onSelectDistrict(rec.district.id)}
                    className="cursor-pointer group transition-opacity duration-200"
                    style={{
                      opacity: isFilteredOut && dimUnmatchedOnMap ? 0.22 : 1,
                      filter:
                        isFilteredOut && dimUnmatchedOnMap
                          ? "grayscale(75%)"
                          : "none",
                    }}
                  >
                    {/* Ring for Threshold Filter Match */}
                    {isThresholdFilterActive &&
                      thresholdFilterMetric !== "none" &&
                      isThresholdMatch && (
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 26 : 20}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth={isSelected ? 2.5 : 1.8}
                          strokeDasharray="4 2"
                        />
                      )}

                    {/* Outer halo for Top 6 Crop Variety Microclimate Match */}
                    {isTopMatch && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 22 : 16}
                        fill="none"
                        stroke="#FBBF24"
                        strokeWidth={isSelected ? 2.4 : 1.5}
                        strokeDasharray="3 2"
                      />
                    )}

                    {/* Active selection ring */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={18}
                        fill="rgba(20, 184, 166, 0.22)"
                        stroke="#2DD4BF"
                        strokeWidth={2.5}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 8.5 : 6.5}
                      fill={`rgb(${r}, ${g}, ${b})`}
                      stroke={
                        isThresholdFilterActive &&
                        thresholdFilterMetric !== "none" &&
                        isThresholdMatch
                          ? "#10B981"
                          : "#050811"
                      }
                      strokeWidth={
                        isThresholdFilterActive &&
                        thresholdFilterMetric !== "none" &&
                        isThresholdMatch
                          ? 2.5
                          : 2
                      }
                    />

                    {/* District Pill Readout */}
                    <g transform={`translate(${x}, ${y - (isSelected ? 15 : 11)})`}>
                      <rect
                        x={-36}
                        y={-14}
                        width={72}
                        height={15}
                        rx={4}
                        fill={
                          isSelected
                            ? "#041E1C"
                            : isThresholdFilterActive &&
                              thresholdFilterMetric !== "none" &&
                              isThresholdMatch
                            ? "rgba(6, 40, 28, 0.92)"
                            : "rgba(8, 12, 22, 0.88)"
                        }
                        stroke={
                          isSelected
                            ? "#2DD4BF"
                            : isThresholdFilterActive &&
                              thresholdFilterMetric !== "none" &&
                              isThresholdMatch
                            ? "#10B981"
                            : "#334155"
                        }
                        strokeWidth={
                          isSelected ||
                          (isThresholdFilterActive &&
                            thresholdFilterMetric !== "none" &&
                            isThresholdMatch)
                            ? 1.4
                            : 0.8
                        }
                      />
                      <text
                        x={0}
                        y={-3.5}
                        textAnchor="middle"
                        fill={
                          isSelected
                            ? "#2DD4BF"
                            : isThresholdFilterActive &&
                              thresholdFilterMetric !== "none" &&
                              isThresholdMatch
                            ? "#34D399"
                            : "#F8FAFC"
                        }
                        fontSize={8.5}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {rec.district.nameTh.replace("อ.", "")} {badgeValue}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Legend Bar inside Map */}
            <div className="absolute bottom-3 left-3 right-3 z-20 bg-[#080C16]/90 backdrop-blur-md border border-[#1E293B] rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              {layerMode === "ground_temp" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-300">สเกลอุณหภูมิผิวดิน:</span>
                  <span className="inline-flex items-center gap-1 text-sky-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    ≤23.5°C (ที่สูงเย็น)
                  </span>
                  <span className="inline-flex items-center gap-1 text-teal-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    24–27.5°C (ร่มชื้น)
                  </span>
                  <span className="inline-flex items-center gap-1 text-yellow-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    28–31°C (อุ่นเหมาะสม)
                  </span>
                  <span className="inline-flex items-center gap-1 text-orange-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    31.5–34°C (ดอนร้อน)
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    &gt;34°C (ไอร้อนสูง)
                  </span>
                </div>
              )}

              {layerMode === "humidity" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-300">สเกลความชื้นสัมพัทธ์:</span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    &lt;54% (อากาศแห้ง)
                  </span>
                  <span className="inline-flex items-center gap-1 text-teal-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    54–68% (สมดุลพืชไร่)
                  </span>
                  <span className="inline-flex items-center gap-1 text-sky-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    69–78% (ชุ่มชื้นไม้ผล)
                  </span>
                  <span className="inline-flex items-center gap-1 text-blue-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    &gt;78% (ชื้นจัด/ป่าเขา)
                  </span>
                </div>
              )}

              {layerMode === "crop_suitability" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-300">
                    ดัชนีความเหมาะสม ({selectedVariety.nameTh}):
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    82–99% (เหมาะสมดีเยี่ยม)
                  </span>
                  <span className="inline-flex items-center gap-1 text-teal-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    68–81% (เหมาะสมดี)
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    55–67% (ปานกลาง)
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    &lt;55% (ต้องปรับสภาพแวดล้อม)
                  </span>
                </div>
              )}

              {layerMode === "vpd_index" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-300">ค่า VPD (kPa):</span>
                  <span className="inline-flex items-center gap-1 text-sky-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    ≤0.6 kPa (ชื้นสูง/คายน้ำต่ำ)
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    0.65–1.45 kPa (ปากใบเปิดดีเยี่ยม)
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    1.5–1.85 kPa (คายน้ำสูง)
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    &gt;1.85 kPa (ปากใบปิด/เครียดน้ำ)
                  </span>
                </div>
              )}

              <span className="font-mono text-[#FBBF24]">
                ◌ วงแหวนทอง = Top 6 อำเภอเหมาะสมที่สุด
              </span>
            </div>
          </div>

          {/* Top 6 Micro-Climate Districts Quick Selector Bar for Selected Crop Variety */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#FBBF24] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  6 เขตจุลภูมิอากาศที่เหมาะสมที่สุดสำหรับ “{selectedVariety.nameTh}”
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                คลิกเพื่อดูรายละเอียดรายอำเภอ
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {topMatchingDistricts.map((rec, idx) => {
                const isSelected = rec.district.id === selectedDistrict.id;
                return (
                  <button
                    key={rec.district.id}
                    type="button"
                    onClick={() => onSelectDistrict(rec.district.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#14B8A6]/20 border-[#2DD4BF] text-white"
                        : "bg-[#080C16] border-[#1E293B] hover:border-[#2DD4BF]/50 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#FBBF24] font-bold">#{idx + 1}</span>
                      <span className="text-emerald-400 font-bold">
                        {rec.varietySuitabilityScore}%
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">
                      {rec.district.nameTh}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      ดิน {rec.groundTempC}°C · ชื้น {rec.relativeHumidityPct}%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Selected District Microclimate Inspector & 12-Month Trend Chart */}
        <div className="xl:col-span-5 space-y-4">
          {/* Card 1: Selected District Microclimate & Crop Variety Compatibility Card */}
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#1E293B] pb-3.5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#2DD4BF]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {focusedRecord.district.zone} · ความสูง ~{focusedRecord.elevationM} ม.รทก.
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {focusedRecord.district.nameTh}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {focusedRecord.microclimateTypeTh}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {focusedRecord.varietySuitabilityScore}%
                </div>
                <div className="text-[11px] font-semibold text-slate-300">
                  ความเข้ากันได้ของพันธุ์พืช
                </div>
              </div>
            </div>

            {/* 4 Microclimate Readout Tiles */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                <div className="text-slate-400">อุณหภูมิผิวดิน (5–10 ซม.)</div>
                <div className="text-lg font-bold font-mono text-[#FBBF24] mt-0.5">
                  {focusedRecord.groundTempC}°C
                </div>
                <div className="text-[11px] text-slate-400">
                  เกณฑ์พันธุ์พืช: {selectedVariety.optimalGroundTempMinC}–
                  {selectedVariety.optimalGroundTempMaxC}°C
                </div>
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                <div className="text-slate-400">ความชื้นสัมพัทธ์ (%RH)</div>
                <div className="text-lg font-bold font-mono text-sky-400 mt-0.5">
                  {focusedRecord.relativeHumidityPct}%
                </div>
                <div className="text-[11px] text-slate-400">
                  เกณฑ์พันธุ์พืช: {selectedVariety.optimalHumidityMinPct}–
                  {selectedVariety.optimalHumidityMaxPct}%
                </div>
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                <div className="text-slate-400">ค่า VPD &amp; จุดน้ำค้าง</div>
                <div className="text-lg font-bold font-mono text-[#2DD4BF] mt-0.5">
                  {focusedRecord.vpdKpa} kPa
                </div>
                <div className="text-[11px] text-slate-400">
                  จุดน้ำค้าง {focusedRecord.dewPointC}°C · คายน้ำ {focusedRecord.evapotranspirationMmDay} มม./วัน
                </div>
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
                <div className="text-slate-400">ผลต่างอุณหภูมิกลางวัน-คืน</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">
                  Δ {focusedRecord.diurnalDeltaC}°C
                </div>
                <div className="text-[11px] text-slate-400">
                  ความชื้นดิน GISTDA {focusedRecord.district.gistdaSoilMoisturePct}%
                </div>
              </div>
            </div>

            {/* Crop Variety Specific Agronomic Recommendation Box */}
            <div className="bg-[#111827] border border-[#14B8A6]/40 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Sprout className="w-4 h-4" />
                  <span>{selectedVariety.nameTh}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    focusedRecord.varietySuitabilityScore >= 80
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : focusedRecord.varietySuitabilityScore >= 62
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {focusedRecord.suitabilityStatusTh}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedVariety.microclimateNotes}
              </p>
              <div className="pt-1.5 border-t border-slate-800 text-emerald-300">
                <strong>แนวทางจัดการจุลภูมิอากาศในแปลง: </strong>
                {selectedVariety.agronomicTip}
              </div>
            </div>
          </div>

          {/* Card 2: 12-Month Ground Temperature & Relative Humidity Trend Chart */}
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#2DD4BF]" />
                  <span>
                    กราฟแนวโน้มอุณหภูมิผิวดิน &amp; ความชื้นสัมพัทธ์ 12 เดือน ({focusedRecord.district.nameTh})
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  เปรียบเทียบแนวโน้มรายเดือนกับกรอบอุณหภูมิผิวดินที่เหมาะสมของ {selectedVariety.nameTh}
                </p>
              </div>
            </div>

            {/* Dual-Series SVG Chart */}
            <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3">
              <svg viewBox="0 0 460 165" className="w-full h-40 overflow-visible">
                {/* Shaded Optimal Ground Temp Window for Selected Crop Variety */}
                {(() => {
                  const yTop =
                    130 - ((selectedVariety.optimalGroundTempMaxC - 15) / 26) * 105;
                  const yBot =
                    130 - ((selectedVariety.optimalGroundTempMinC - 15) / 26) * 105;
                  return (
                    <rect
                      x={28}
                      y={Math.max(15, yTop)}
                      width={412}
                      height={Math.max(8, yBot - yTop)}
                      fill="rgba(20, 184, 166, 0.14)"
                      stroke="rgba(45, 212, 191, 0.35)"
                      strokeDasharray="3 3"
                    />
                  );
                })()}

                {/* Humidity Bars + Ground Temp Polyline */}
                {focusedRecord.monthlyTrend.map((m, i) => {
                  const x = 42 + i * 35;
                  const humBarH = (m.humidityPct / 100) * 100;
                  const yTemp = 130 - ((m.groundTempC - 15) / 26) * 105;

                  return (
                    <g key={m.monthTh}>
                      {/* Relative Humidity Bar */}
                      <rect
                        x={x - 7}
                        y={130 - humBarH}
                        width={14}
                        height={humBarH}
                        rx={3}
                        fill="rgba(56, 189, 248, 0.25)"
                      />
                      <text
                        x={x}
                        y={126 - humBarH}
                        textAnchor="middle"
                        fill="#7DD3FC"
                        fontSize={7.5}
                        fontFamily="monospace"
                      >
                        {m.humidityPct}%
                      </text>

                      {/* Ground Temp Node & Label */}
                      <circle
                        cx={x}
                        cy={yTemp}
                        r={3.5}
                        fill="#FBBF24"
                        stroke="#050811"
                        strokeWidth={1.5}
                      />
                      <text
                        x={x}
                        y={yTemp - 6}
                        textAnchor="middle"
                        fill="#FDE68A"
                        fontSize={8}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {m.groundTempC}°
                      </text>

                      {/* Month Label */}
                      <text
                        x={x}
                        y={148}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize={8.5}
                      >
                        {m.monthTh}
                      </text>
                    </g>
                  );
                })}

                {/* Connect Ground Temp Curve */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  points={focusedRecord.monthlyTrend
                    .map((m, i) => {
                      const x = 42 + i * 35;
                      const yTemp = 130 - ((m.groundTempC - 15) / 26) * 105;
                      return `${x},${yTemp}`;
                    })
                    .join(" ")}
                />
              </svg>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-[#1E293B]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                  <span>เส้นสีเหลือง: อุณหภูมิผิวดิน (°C)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-400/50" />
                  <span>แท่งสีฟ้า: ความชื้นสัมพัทธ์ (%RH)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#2DD4BF]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#14B8A6]/30 border border-[#2DD4BF]" />
                  <span>แถบเขียว: กรอบอุณหภูมิดินที่เหมาะสม</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 32-District Micro-Climate Comparison Table & Filter */}
      <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">
              ตารางจัดอันดับจุลภูมิอากาศรายอำเภอครบ 32 อำเภอ สำหรับ “{selectedVariety.nameTh}”
            </h3>
            <p className="text-xs text-slate-400">
              เปรียบเทียบความสูงเหนือระดับน้ำทะเล อุณหภูมิผิวดิน ความชื้นสัมพัทธ์ ค่า VPD และคะแนนความเหมาะสมรายอำเภอ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDistrictQuery}
                onChange={(e) => setSearchDistrictQuery(e.target.value)}
                placeholder="ค้นหาชื่ออำเภอ หรือโซน..."
                className="pl-8 pr-3 py-1.5 bg-[#0B101D] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            {isThresholdFilterActive && thresholdFilterMetric !== "none" && (
              <label className="inline-flex items-center gap-1.5 text-xs text-emerald-300 cursor-pointer bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold">
                <input
                  type="checkbox"
                  checked={onlyShowMatchedInTable}
                  onChange={(e) => setOnlyShowMatchedInTable(e.target.checked)}
                  className="rounded border-slate-600 text-[#14B8A6]"
                />
                <span>
                  เฉพาะอำเภอที่ตรงเกณฑ์ ({matchingDistrictCount})
                </span>
              </label>
            )}

            <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-[#0B101D] border border-[#1E293B] px-3 py-1.5 rounded-xl">
              <input
                type="checkbox"
                checked={onlyOptimalFilter}
                onChange={(e) => setOnlyOptimalFilter(e.target.checked)}
                className="rounded border-slate-600 text-[#14B8A6]"
              />
              <span>เฉพาะอำเภอที่เหมาะสมสูง (≥78%)</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-[#1E293B] shadow-inner">
          <table className="w-full min-w-[840px] text-left border-collapse text-xs">
            <thead className="bg-[#0B101D] text-slate-400 font-mono sticky top-0 z-10 border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap text-center w-14">อันดับ</th>
                <th className="py-2.5 px-3 whitespace-nowrap font-bold min-w-[110px]">อำเภอ</th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[250px]">ลักษณะจุลภูมิอากาศ / ความสูง</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">อุณหภูมิผิวดิน</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">ความชื้นสัมพัทธ์</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">ค่า VPD</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">เกณฑ์สไลเดอร์</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center min-w-[140px]">ความเหมาะสมพันธุ์พืช</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredDirectoryRecords.map((rec, idx) => {
                const isSelected = rec.district.id === selectedDistrict.id;
                const isThresholdMatch = isDistrictMatchedByThreshold(rec);
                return (
                  <tr
                    key={rec.district.id}
                    onClick={() => onSelectDistrict(rec.district.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#14B8A6]/15 text-white"
                        : isThresholdFilterActive &&
                          thresholdFilterMetric !== "none" &&
                          !isThresholdMatch
                        ? "opacity-45 hover:opacity-100 hover:bg-[#111827] text-slate-400"
                        : "hover:bg-[#111827] text-slate-200"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-[#FBBF24] font-bold text-center whitespace-nowrap">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                      {rec.district.nameTh}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 min-w-[250px] whitespace-nowrap">
                      <span>{rec.microclimateTypeTh}</span>{" "}
                      <span className="font-mono text-slate-400">
                        ({rec.elevationM} ม.)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#FBBF24] text-right whitespace-nowrap">
                      {rec.groundTempC}°C
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-300 text-right whitespace-nowrap">
                      {rec.relativeHumidityPct}% RH
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#2DD4BF] text-right whitespace-nowrap">
                      {rec.vpdKpa} kPa
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isThresholdFilterActive &&
                      thresholdFilterMetric !== "none" ? (
                        isThresholdMatch ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>ตรงเกณฑ์</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
                            <X className="w-3 h-3 text-slate-600" />
                            <span>นอกเกณฑ์</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          {rec.groundTempC}° / {rec.relativeHumidityPct}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                          rec.varietySuitabilityScore >= 80
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : rec.varietySuitabilityScore >= 62
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        <span>{rec.varietySuitabilityScore}%</span>
                        <span className="font-sans font-normal">
                          ({rec.suitabilityStatusTh.split(" ")[0]})
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Render Climate Historical Trend Dashboard in default "all" combined view */}
      {subViewMode === "all" && (
        <div ref={historicalSectionRef}>
          <ClimateHistoricalTrendDashboard
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
          />
        </div>
      )}
    </div>
  );
};
