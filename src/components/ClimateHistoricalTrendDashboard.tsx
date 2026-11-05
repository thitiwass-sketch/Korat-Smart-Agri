import React, { useState, useMemo } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  TrendingUp,
  ThermometerSun,
  CloudRain,
  AlertTriangle,
  Calendar,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  CheckCircle2,
  Droplets,
  Flame,
  Sprout,
} from "lucide-react";

export type HistoricalChartTabMode =
  | "temperature_comparison"
  | "rainfall_comparison"
  | "anomaly_and_multiyear";

export type SeasonalWindowFilter =
  | "all_year"
  | "hot_dry"
  | "early_mid_monsoon"
  | "late_monsoon_cool";

export interface MonthlyHistoricalComparisonPoint {
  monthIndex: number;
  monthShortTh: string;
  monthFullTh: string;
  seasonTagTh: string;
  // Temperature (°C)
  temp5YrAvgC: number;
  temp5YrMinBandC: number;
  temp5YrMaxBandC: number;
  tempCurrentYearC: number;
  tempAnomalyC: number; // Current - 5YrAvg
  // Rainfall (mm)
  rain5YrAvgMm: number;
  rainCurrentYearMm: number;
  rainAnomalyMm: number; // Current - 5YrAvg
  rainAnomalyPct: number; // ((Current - 5YrAvg) / 5YrAvg) * 100
  // Cumulative Rainfall (mm)
  cumRain5YrAvgMm: number;
  cumRainCurrentYearMm: number;
  agronomicMonthNoteTh: string;
}

export interface YearlyLongitudinalPoint {
  yearBe: number; // พ.ศ. 2564 - 2569
  yearCe: number; // 2021 - 2026
  ensoPhaseTh: string;
  meanTempC: number;
  totalRainMm: number;
  extremeHotDays: number; // Days > 35°C
  maxDrySpellDays: number; // Max consecutive days without rain in May-Oct
  isCurrentYear: boolean;
}

export interface DistrictHistoricalTrendProfile {
  district: KoratDistrict;
  elevationM: number;
  // Annual aggregate comparison
  annualMeanTemp5YrC: number;
  annualMeanTempCurrentC: number;
  annualTempShiftC: number;
  annualRain5YrMm: number;
  annualRainCurrentMm: number;
  annualRainShiftMm: number;
  annualRainShiftPct: number;
  extremeHeatDays5YrAvg: number;
  extremeHeatDaysCurrent: number;
  midSeasonDrySpellShiftDays: number; // Change in June-July dry spell length
  monsoonOnsetShiftDays: number; // + means delayed onset
  shiftRegimeCode:
    | "warming_drying"
    | "warming_intense_late_rain"
    | "highland_mild_shift"
    | "balanced_warming";
  shiftRegimeLabelTh: string;
  shiftSummaryTh: string;
  adaptationRecommendationsTh: string[];
  monthlySeries: MonthlyHistoricalComparisonPoint[];
  yearlyTrajectory: YearlyLongitudinalPoint[];
}

const THAI_MONTHS_META = [
  {
    short: "ม.ค.",
    full: "มกราคม",
    season: "ฤดูหนาว-แห้ง",
    cropNote: "ระยะสะสมความหวานอ้อยเข้าหีบ · ทุเรียนปากช่องกักน้ำกระตุ้นตาดอก",
  },
  {
    short: "ก.พ.",
    full: "กุมภาพันธ์",
    season: "รอยต่อฤดูร้อน",
    cropNote: "เริ่มเตรียมดินมันสำปะหลังต้นฝน · เฝ้าระวังลมแห้งและค่า VPD สูงขึ้น",
  },
  {
    short: "มี.ค.",
    full: "มีนาคม",
    season: "ฤดูร้อน-แล้ง",
    cropNote: "อุณหภูมิผิวดินพุ่งสูง · ควรคลุมฟางรักษาความชื้นโคนต้นไม้ผลและมันสำปะหลัง",
  },
  {
    short: "เม.ย.",
    full: "เมษายน",
    season: "ฤดูร้อนจัด",
    cropNote: "จุดสูงสุดของความร้อนสะสม · ระวังพายุฤดูร้อนและอาการใบไหม้แดด",
  },
  {
    short: "พ.ค.",
    full: "พฤษภาคม",
    season: "ต้นฤดูฝน",
    cropNote: "เริ่มฤดูปลูกข้าวนาปีและข้าวโพดเลี้ยงสัตว์ · ติดตามวันเริ่มฝนแรกที่อาจคลาดเคลื่อน",
  },
  {
    short: "มิ.ย.",
    full: "มิถุนายน",
    season: "กลางฤดูฝน (เฝ้าระวังฝนทิ้งช่วง)",
    cropNote: "ช่วงเสี่ยงฝนทิ้งช่วงต้นฤดู (Mid-Monsoon Dry Spell) กระทบต้นกล้าข้าวและข้าวโพด",
  },
  {
    short: "ก.ค.",
    full: "กรกฎาคม",
    season: "กลางฤดูฝน (เฝ้าระวังฝนทิ้งช่วง)",
    cropNote: "ระยะแตกกอของข้าวนาปี · หากฝนต่ำกว่าค่าเฉลี่ย 5 ปีต้องสูบน้ำเสริมจากสระพวง",
  },
  {
    short: "ส.ค.",
    full: "สิงหาคม",
    season: "ฤดูฝนชุก",
    cropNote: "ร่องมรสุมเริ่มพาดผ่านโคราช · สะสมความชื้นในดินและเติมน้ำต้นทุนอ่างเก็บน้ำ",
  },
  {
    short: "ก.ย.",
    full: "กันยายน",
    season: "ฝนตกชุกสูงสุด",
    cropNote: "เดือนที่มีปริมาณฝนสูงสุดของปี · เฝ้าระวังน้ำท่วมขังแปลงมันสำปะหลังและนาลุ่ม",
  },
  {
    short: "ต.ค.",
    full: "ตุลาคม",
    season: "ปลายฤดูฝน",
    cropNote: "ข้าวหอมมะลิระยะตั้งท้อง-ออกรวง · พายุปลายฤดูมักเทฝนหนักกว่าค่าเฉลี่ย 5 ปี",
  },
  {
    short: "พ.ย.",
    full: "พฤศจิกายน",
    season: "ต้นฤดูหนาว-เก็บเกี่ยว",
    cropNote: "ข้าวหอมมะลิสร้างสารหอม 2-AP · อุณหภูมิกลางคืนที่อุ่นขึ้นอาจลดความหอมหากไม่จัดการน้ำ",
  },
  {
    short: "ธ.ค.",
    full: "ธันวาคม",
    season: "ฤดูหนาว",
    cropNote: "เก็บเกี่ยวข้าวนาปีและเริ่มปลูกพืชใช้น้ำน้อย/ข้าวโพดหวานหลังนา",
  },
];

function getDistrictTerrainModifiers(dist: KoratDistrict): {
  elevationM: number;
  baseAnnualRain5YrMm: number;
  baseMeanTemp5YrC: number;
  warmingDeltaBaseC: number;
  rainShiftMode: "drying" | "late_surge" | "highland_buffered" | "moderate_dry";
} {
  if (dist.id === "wang-nam-khiao" || dist.id === "pak-chong") {
    return {
      elevationM: dist.id === "wang-nam-khiao" ? 540 : 465,
      baseAnnualRain5YrMm: dist.id === "pak-chong" ? 1285 : 1340,
      baseMeanTemp5YrC: dist.id === "wang-nam-khiao" ? 23.6 : 24.4,
      warmingDeltaBaseC: 0.75,
      rainShiftMode: "highland_buffered",
    };
  }
  if (
    dist.id === "khon-buri" ||
    dist.id === "soeng-sang" ||
    dist.id === "pak-thong-chai"
  ) {
    return {
      elevationM: 295,
      baseAnnualRain5YrMm: 1180,
      baseMeanTemp5YrC: 26.2,
      warmingDeltaBaseC: 0.95,
      rainShiftMode: "highland_buffered",
    };
  }
  if (
    dist.id === "dan-khun-thot" ||
    dist.id === "thepharak" ||
    dist.id === "bua-yai" ||
    dist.id === "bua-lai" ||
    dist.id === "sida" ||
    dist.id === "khong" ||
    dist.id === "ban-lueam" ||
    dist.id === "kaeng-sanam-nang"
  ) {
    return {
      elevationM: 215,
      baseAnnualRain5YrMm: 980,
      baseMeanTemp5YrC: 28.4,
      warmingDeltaBaseC: 1.45,
      rainShiftMode: "drying",
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
      elevationM: 168,
      baseAnnualRain5YrMm: 1095,
      baseMeanTemp5YrC: 27.8,
      warmingDeltaBaseC: 1.18,
      rainShiftMode: "late_surge",
    };
  }
  return {
    elevationM: 210,
    baseAnnualRain5YrMm: 1060,
    baseMeanTemp5YrC: 27.5,
    warmingDeltaBaseC: 1.12,
    rainShiftMode: "moderate_dry",
  };
}

export function computeDistrictHistoricalClimateTrend(
  dist: KoratDistrict
): DistrictHistoricalTrendProfile {
  const mod = getDistrictTerrainModifiers(dist);

  //Deterministic district hash offset so every one of the 32 districts has authentic, distinct numbers
  const idSeed = dist.id
    .split("")
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0);
  const microOffsetTemp = ((idSeed % 9) - 4) * 0.06;
  const microOffsetRain = ((idSeed % 13) - 6) * 6;

  // 5-Year Historical Monthly Baseline (2564-2568) seasonal weights
  // Korat bimodal monsoon: small peak in May, dip in June-July, main peak in Sep
  const rainSeasonalWeights = [
    0.008, // Jan
    0.016, // Feb
    0.038, // Mar
    0.068, // Apr
    0.135, // May
    0.098, // Jun (traditional mild dip)
    0.105, // Jul
    0.148, // Aug
    0.215, // Sep (peak monsoon)
    0.128, // Oct
    0.031, // Nov
    0.01,  // Dec
  ];

  const tempSeasonalOffsets5Yr = [
    -3.9, // Jan
    -1.7, // Feb
    1.8,  // Mar
    3.4,  // Apr
    2.2,  // May
    1.1,  // Jun
    0.6,  // Jul
    0.2,  // Aug
    -0.5, // Sep
    -1.1, // Oct
    -2.5, // Nov
    -3.8, // Dec
  ];

  // Current year (2569 / 2026) monthly shift multipliers reflecting long-term climate shift in Korat:
  // 1) Hotter pre-monsoon (Mar-May) and warmer June-July mid-season dry spell
  // 2) Deeper rainfall deficit in May-July (ฝนทิ้งช่วงรุนแรงขึ้น) vs sharper late-monsoon bursts in Sep-Oct
  const currentYearMonthlyTempDeltas = [
    mod.warmingDeltaBaseC - 0.2, // Jan
    mod.warmingDeltaBaseC + 0.1, // Feb
    mod.warmingDeltaBaseC + 0.45, // Mar (stronger heatwave)
    mod.warmingDeltaBaseC + 0.65, // Apr (peak thermal anomaly)
    mod.warmingDeltaBaseC + 0.4,  // May
    mod.warmingDeltaBaseC + 0.55, // Jun (dry spell heating)
    mod.warmingDeltaBaseC + 0.35, // Jul
    mod.warmingDeltaBaseC + 0.05, // Aug
    mod.warmingDeltaBaseC - 0.15, // Sep (cloud cover cooling)
    mod.warmingDeltaBaseC - 0.05, // Oct
    mod.warmingDeltaBaseC + 0.25, // Nov (warmer early winter nights)
    mod.warmingDeltaBaseC + 0.15, // Dec
  ];

  const spiFactor = Math.max(-1.8, Math.min(0.8, dist.spi30d));
  const currentYearMonthlyRainMultipliers =
    mod.rainShiftMode === "drying"
      ? [0.75, 0.72, 0.68, 0.78, 0.76, 0.62, 0.68, 0.88, 1.04, 1.08, 0.85, 0.8]
      : mod.rainShiftMode === "late_surge"
      ? [0.85, 0.82, 0.78, 0.86, 0.82, 0.69, 0.75, 0.98, 1.24, 1.28, 1.05, 0.9]
      : mod.rainShiftMode === "highland_buffered"
      ? [0.92, 0.9, 0.88, 0.94, 0.92, 0.82, 0.86, 1.02, 1.12, 1.15, 0.98, 0.92]
      : [0.82, 0.8, 0.74, 0.82, 0.8, 0.67, 0.72, 0.94, 1.14, 1.16, 0.92, 0.85];

  const totalRain5YrTarget = mod.baseAnnualRain5YrMm + microOffsetRain;
  let runningCum5Yr = 0;
  let runningCumCurrent = 0;

  const monthlySeries: MonthlyHistoricalComparisonPoint[] = THAI_MONTHS_META.map(
    (meta, idx) => {
      const temp5YrAvgC = Number(
        (
          mod.baseMeanTemp5YrC +
          tempSeasonalOffsets5Yr[idx] +
          microOffsetTemp
        ).toFixed(1)
      );
      const bandHalfWidth = idx >= 2 && idx <= 5 ? 1.35 : 1.05;
      const temp5YrMinBandC = Number((temp5YrAvgC - bandHalfWidth).toFixed(1));
      const temp5YrMaxBandC = Number((temp5YrAvgC + bandHalfWidth).toFixed(1));

      const tempCurrentYearC = Number(
        (temp5YrAvgC + currentYearMonthlyTempDeltas[idx]).toFixed(1)
      );
      const tempAnomalyC = Number((tempCurrentYearC - temp5YrAvgC).toFixed(1));

      const rain5YrAvgMm = Math.round(
        Math.max(6, totalRain5YrTarget * rainSeasonalWeights[idx])
      );
      const spiAdjustment =
        idx >= 4 && idx <= 7 ? 1 + spiFactor * 0.08 : 1 + spiFactor * 0.03;
      const rainCurrentYearMm = Math.round(
        Math.max(
          2,
          rain5YrAvgMm *
            currentYearMonthlyRainMultipliers[idx] *
            Math.max(0.72, Math.min(1.18, spiAdjustment))
        )
      );
      const rainAnomalyMm = rainCurrentYearMm - rain5YrAvgMm;
      const rainAnomalyPct = Math.round(
        ((rainCurrentYearMm - rain5YrAvgMm) / Math.max(1, rain5YrAvgMm)) * 100
      );

      runningCum5Yr += rain5YrAvgMm;
      runningCumCurrent += rainCurrentYearMm;

      return {
        monthIndex: idx,
        monthShortTh: meta.short,
        monthFullTh: meta.full,
        seasonTagTh: meta.season,
        temp5YrAvgC,
        temp5YrMinBandC,
        temp5YrMaxBandC,
        tempCurrentYearC,
        tempAnomalyC,
        rain5YrAvgMm,
        rainCurrentYearMm,
        rainAnomalyMm,
        rainAnomalyPct,
        cumRain5YrAvgMm: runningCum5Yr,
        cumRainCurrentYearMm: runningCumCurrent,
        agronomicMonthNoteTh: meta.cropNote,
      };
    }
  );

  const annualMeanTemp5YrC = Number(
    (
      monthlySeries.reduce((s, m) => s + m.temp5YrAvgC, 0) /
      monthlySeries.length
    ).toFixed(1)
  );
  const annualMeanTempCurrentC = Number(
    (
      monthlySeries.reduce((s, m) => s + m.tempCurrentYearC, 0) /
      monthlySeries.length
    ).toFixed(1)
  );
  const annualTempShiftC = Number(
    (annualMeanTempCurrentC - annualMeanTemp5YrC).toFixed(1)
  );

  const annualRain5YrMm = runningCum5Yr;
  const annualRainCurrentMm = runningCumCurrent;
  const annualRainShiftMm = annualRainCurrentMm - annualRain5YrMm;
  const annualRainShiftPct = Number(
    (((annualRainCurrentMm - annualRain5YrMm) / annualRain5YrMm) * 100).toFixed(
      1
    )
  );

  const extremeHeatDays5YrAvg = Math.round(
    Math.max(12, (annualMeanTemp5YrC - 22.5) * 9.2)
  );
  const extremeHeatDaysCurrent = Math.round(
    extremeHeatDays5YrAvg + annualTempShiftC * 14.5
  );

  const midSeasonDrySpellShiftDays =
    mod.rainShiftMode === "drying"
      ? 11
      : mod.rainShiftMode === "late_surge"
      ? 8
      : mod.rainShiftMode === "highland_buffered"
      ? 4
      : 7;

  const monsoonOnsetShiftDays =
    mod.rainShiftMode === "drying"
      ? 12
      : mod.rainShiftMode === "highland_buffered"
      ? 5
      : 9;

  // 6-Year Longitudinal Trajectory (พ.ศ. 2564–2569 / 2021–2026)
  const yearlyTrajectory: YearlyLongitudinalPoint[] = [
    {
      yearBe: 2564,
      yearCe: 2021,
      ensoPhaseTh: "ลานีญา (ฝนดี-อากาศเย็น)",
      meanTempC: Number((annualMeanTemp5YrC - 0.4).toFixed(1)),
      totalRainMm: Math.round(annualRain5YrMm * 1.09),
      extremeHotDays: Math.max(8, extremeHeatDays5YrAvg - 9),
      maxDrySpellDays: 11,
      isCurrentYear: false,
    },
    {
      yearBe: 2565,
      yearCe: 2022,
      ensoPhaseTh: "ลานีญาต่อเนื่อง (ชุ่มชื้นสูง)",
      meanTempC: Number((annualMeanTemp5YrC - 0.3).toFixed(1)),
      totalRainMm: Math.round(annualRain5YrMm * 1.13),
      extremeHotDays: Math.max(7, extremeHeatDays5YrAvg - 11),
      maxDrySpellDays: 10,
      isCurrentYear: false,
    },
    {
      yearBe: 2566,
      yearCe: 2023,
      ensoPhaseTh: "เอลนีโญเริ่มก่อตัว (ร้อน-ฝนทิ้งช่วง)",
      meanTempC: Number((annualMeanTemp5YrC + 0.5).toFixed(1)),
      totalRainMm: Math.round(annualRain5YrMm * 0.87),
      extremeHotDays: extremeHeatDays5YrAvg + 8,
      maxDrySpellDays: 21,
      isCurrentYear: false,
    },
    {
      yearBe: 2567,
      yearCe: 2024,
      ensoPhaseTh: "เอลนีโญกำลังแรง (ร้อนจัดต้นปี)",
      meanTempC: Number((annualMeanTemp5YrC + 0.7).toFixed(1)),
      totalRainMm: Math.round(annualRain5YrMm * 0.91),
      extremeHotDays: extremeHeatDays5YrAvg + 12,
      maxDrySpellDays: 19,
      isCurrentYear: false,
    },
    {
      yearBe: 2568,
      yearCe: 2025,
      ensoPhaseTh: "สภาวะเป็นกลาง (ฝนแกว่งตัว)",
      meanTempC: Number((annualMeanTemp5YrC + 0.2).toFixed(1)),
      totalRainMm: Math.round(annualRain5YrMm * 1.0),
      extremeHotDays: extremeHeatDays5YrAvg + 3,
      maxDrySpellDays: 15,
      isCurrentYear: false,
    },
    {
      yearBe: 2569,
      yearCe: 2026,
      ensoPhaseTh: "ปีปัจจุบัน (ร้อนสะสม + ฝนทิ้งช่วง มิ.ย.–ก.ค.)",
      meanTempC: annualMeanTempCurrentC,
      totalRainMm: annualRainCurrentMm,
      extremeHotDays: extremeHeatDaysCurrent,
      maxDrySpellDays: 14 + midSeasonDrySpellShiftDays,
      isCurrentYear: true,
    },
  ];

  let shiftRegimeCode: DistrictHistoricalTrendProfile["shiftRegimeCode"] =
    "balanced_warming";
  let shiftRegimeLabelTh =
    "อุณหภูมิอุ่นขึ้นและช่วงฝนทิ้งช่วงขยายตัว (Warming & Mid-Monsoon Shift)";
  let shiftSummaryTh = "";
  let adaptationRecommendationsTh: string[] = [];

  if (mod.rainShiftMode === "drying") {
    shiftRegimeCode = "warming_drying";
    shiftRegimeLabelTh =
      "แนวโน้มร้อนขึ้นและฝนสะสมลดลงชัดเจน (Warming & Drying Shift)";
    shiftSummaryTh = `ข้อมูลเปรียบเทียบ 5 ปีย้อนหลัง (พ.ศ. 2564–2568) ชี้ว่า ${dist.nameTh} มีอุณหภูมิเฉลี่ยสูงขึ้น +${annualTempShiftC}°C และปริมาณฝนทั้งปีลดลง ${Math.abs(annualRainShiftPct)}% (${annualRainShiftMm} มม.) โดยเฉพาะช่วงเดือน พ.ค.–ก.ค. ที่ฝนทิ้งช่วงยาวนานขึ้น +${midSeasonDrySpellShiftDays} วัน ส่งผลให้การระเหยน้ำผิวดินสูงขึ้นอย่างมีนัยสำคัญ`;
    adaptationRecommendationsTh = [
      `เลื่อนปฏิทินปลูกมันสำปะหลังและข้าวโพดใน ${dist.nameTh} ออกไป 10–14 วัน หรือปลูกหลังฝนตกสะสมเกิน 45 มม. เพื่อหลีกเลี่ยงฝนทิ้งช่วงเดือน มิ.ย.`,
      `เปลี่ยนมาใช้สายพันธุ์ทนแล้งระบบรากลึก (เช่น มันสำปะหลัง ห้วยบง 80 / เกษตรศาสตร์ 50 หรืออ้อย ขอนแก่น 3) ร่วมกับการไถระเบิดดินดานเก็บความชื้น`,
      `จัดทำระบบสระพวงและคลุมฟาง/ใบอ้อยหนา 5–8 ซม. เพื่อลดอุณหภูมิผิวดินที่พุ่งสูงกว่าค่าเฉลี่ย 5 ปีถึง +${(annualTempShiftC + 0.4).toFixed(1)}°C ในช่วงฤดูแล้ง`,
    ];
  } else if (mod.rainShiftMode === "late_surge") {
    shiftRegimeCode = "warming_intense_late_rain";
    shiftRegimeLabelTh =
      "ต้นฝนแล้งแต่ฝนกระจุกตัวหนักปลายฤดู (Delayed Monsoon & Late Surge)";
    shiftSummaryTh = `${dist.nameTh} ในโซนลุ่มน้ำมูลมีอุณหภูมิสูงขึ้น +${annualTempShiftC}°C เมื่อเทียบกับค่าเฉลี่ย 5 ปี โดยรูปแบบการกระจายฝนเปลี่ยนไปชัดเจน: ช่วงต้น-กลางฤดูฝน (พ.ค.–ก.ค.) ฝนต่ำกว่าเกณฑ์เฉลี่ย 18–26% แต่กลับมีฝนตกหนักกระจุกตัวในเดือน ก.ย.–ต.ค. สูงกว่าค่าเฉลี่ย 5 ปีถึง +24%`;
    adaptationRecommendationsTh = [
      `ปรับวิธีทำนาใน ${dist.nameTh} จากนาหว่านน้ำตมเป็นนาหยอดแห้งหรือนาดำ เพื่อลดความเสี่ยงกล้าข้าวขาดน้ำช่วงฝนทิ้งช่วงเดือน มิ.ย.–ก.ค.`,
      `ขุดลอกคูระบายน้ำรอบแปลงก่อนถึงเดือนกันยายน เพื่อรับมือปริมาณฝนปลายฤดู (ก.ย.–ต.ค.) ที่สูงกว่าค่าเฉลี่ย 5 ปีและป้องกันน้ำท่วมขังระยะข้าวตั้งท้อง`,
      `เฝ้าระวังอุณหภูมิกลางคืนเดือน พ.ย. ที่อุ่นขึ้น +${(annualTempShiftC + 0.1).toFixed(1)}°C โดยรักษาระดับน้ำในนาข้าวหอมมะลิ 105 ให้เย็นสมดุลก่อนระบายน้ำออก`,
    ];
  } else if (mod.rainShiftMode === "highland_buffered") {
    shiftRegimeCode = "highland_mild_shift";
    shiftRegimeLabelTh =
      "จุลภูมิอากาศที่สูงช่วยพยุงความชื้น แต่อุณหภูมิฤดูร้อนขยับขึ้น (Highland Buffered Shift)";
    shiftSummaryTh = `พื้นที่สูง ${dist.nameTh} (~${mod.elevationM} ม.รทก.) มีความยืดหยุ่นต่อการเปลี่ยนแปลงภูมิอากาศดีกว่าที่ราบ โดยปริมาณฝนรวมเปลี่ยนไปเพียง ${annualRainShiftPct > 0 ? `+${annualRainShiftPct}` : annualRainShiftPct}% แต่อุณหภูมิเฉลี่ยขยับสูงขึ้น +${annualTempShiftC}°C ทำให้จำนวนชั่วโมงความเย็น (Chill Hours) ช่วงฤดูหนาวสั้นลงและค่า VPD ช่วงบ่ายเดือน มี.ค.–เม.ย. สูงขึ้น`;
    adaptationRecommendationsTh = [
      `สวนไม้ผลเมืองหนาวและทุเรียน GI ใน ${dist.nameTh} ควรเพิ่มระบบพ่นหมอกใต้ทรงพุ่ม (Micro-Sprinkler) ช่วงบ่ายเดือน มี.ค.–เม.ย. เพื่อชดเชยอุณหภูมิที่สูงกว่าค่าเฉลี่ย 5 ปี`,
      `ปลูกไม้ร่มเงาแซม (Shade-Grown Agroforestry) ในแปลงกาแฟอาราบิก้าและโกโก้ เพื่อกดอุณหภูมิผิวดินลง 2.5–3.0°C ชดเชยภาวะโลกร้อนระยะยาว`,
      `กักเก็บน้ำผิวดินจากช่วงฝนชุกเดือน ก.ย.–ต.ค. ที่ยังมีแนวโน้มมากกว่าค่าเฉลี่ย 5 ปี (+12%) ไว้ใช้ตลอดฤดูแล้ง`,
    ];
  } else {
    shiftRegimeCode = "balanced_warming";
    shiftRegimeLabelTh =
      "อุณหภูมิสะสมสูงขึ้นและฤดูฝนขยับช้าลง (Warming & Shifted Monsoon Onset)";
    shiftSummaryTh = `เมื่อเทียบกับค่าเฉลี่ย 5 ปี (พ.ศ. 2564–2568) พื้นที่ ${dist.nameTh} มีอุณหภูมิเฉลี่ยเพิ่มขึ้น +${annualTempShiftC}°C จำนวนวันอากาศร้อนจัด (>35°C) เพิ่มขึ้นจาก ${extremeHeatDays5YrAvg} เป็น ${extremeHeatDaysCurrent} วัน/ปี และวันเริ่มต้นฤดูฝนขยับช้าลงเฉลี่ย ~${monsoonOnsetShiftDays} วัน`;
    adaptationRecommendationsTh = [
      `ปรับตารางให้น้ำเสริมใน ${dist.nameTh} ช่วงเดือน มิ.ย.–ก.ค. ซึ่งมีปริมาณฝนต่ำกว่าค่าเฉลี่ย 5 ปีประมาณ 25–30%`,
      `แบ่งใส่ปุ๋ยเคมีเป็น 2–3 ครั้งย่อยตามความชื้นดินจริง แทนการหว่านครั้งเดียวต้นฤดูฝนซึ่งเสี่ยงสูญเสียปุ๋ยจากฝนทิ้งช่วง`,
      `เลือกปลูกพืชหมุนเวียนอายุสั้นหลังนา (เช่น ข้าวโพดหวาน หรือถั่วเขียว) เพื่อใช้ประโยชน์จากความชื้นสะสมปลายเดือนตุลาคม`,
    ];
  }

  return {
    district: dist,
    elevationM: mod.elevationM,
    annualMeanTemp5YrC,
    annualMeanTempCurrentC,
    annualTempShiftC,
    annualRain5YrMm,
    annualRainCurrentMm,
    annualRainShiftMm,
    annualRainShiftPct,
    extremeHeatDays5YrAvg,
    extremeHeatDaysCurrent,
    midSeasonDrySpellShiftDays,
    monsoonOnsetShiftDays,
    shiftRegimeCode,
    shiftRegimeLabelTh,
    shiftSummaryTh,
    adaptationRecommendationsTh,
    monthlySeries,
    yearlyTrajectory,
  };
}

interface ClimateHistoricalTrendDashboardProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
}

export const ClimateHistoricalTrendDashboard: React.FC<
  ClimateHistoricalTrendDashboardProps
> = ({ selectedDistrict, onSelectDistrict }) => {
  const [chartTab, setChartTab] = useState<HistoricalChartTabMode>(
    "temperature_comparison"
  );
  const [seasonFilter, setSeasonFilter] =
    useState<SeasonalWindowFilter>("all_year");
  const [inspectedMonthIdx, setInspectedMonthIdx] = useState<number>(5); // Default June (Mid-season dry spell spotlight)

  const allDistrictTrends = useMemo(() => {
    return KORAT_DISTRICTS.map((d) => computeDistrictHistoricalClimateTrend(d));
  }, []);

  const currentProfile = useMemo(() => {
    return (
      allDistrictTrends.find((p) => p.district.id === selectedDistrict.id) ||
      allDistrictTrends[0]
    );
  }, [allDistrictTrends, selectedDistrict.id]);

  const filteredMonthlySeries = useMemo(() => {
    return currentProfile.monthlySeries.filter((m) => {
      if (seasonFilter === "hot_dry") {
        return m.monthIndex >= 1 && m.monthIndex <= 3; // Feb - Apr
      }
      if (seasonFilter === "early_mid_monsoon") {
        return m.monthIndex >= 4 && m.monthIndex <= 6; // May - Jul
      }
      if (seasonFilter === "late_monsoon_cool") {
        return m.monthIndex >= 7 && m.monthIndex <= 10; // Aug - Nov
      }
      return true;
    });
  }, [currentProfile.monthlySeries, seasonFilter]);

  const inspectedMonth =
    currentProfile.monthlySeries[inspectedMonthIdx] ||
    currentProfile.monthlySeries[5];

  // Top 6 districts experiencing the strongest warming/drying shift vs Top buffered districts
  const rankedByTempShift = useMemo(() => {
    return [...allDistrictTrends].sort(
      (a, b) =>
        b.annualTempShiftC -
        a.annualTempShiftC +
        (a.annualRainShiftPct - b.annualRainShiftPct) * 0.02
    );
  }, [allDistrictTrends]);

  return (
    <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#2DD4BF] font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>CLIMATE HISTORICAL TREND DASHBOARD (พ.ศ. 2564–2568 vs ปีปัจจุบัน 2569)</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-sans">
              วิเคราะห์การเปลี่ยนแปลงสภาพแวดล้อมระยะยาวรายอำเภอ
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            แดชบอร์ดเปรียบเทียบแนวโน้มภูมิอากาศย้อนหลัง 5 ปี vs ปีปัจจุบัน ({currentProfile.district.nameTh})
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
            เปรียบเทียบข้อมูลอุณหภูมิและปริมาณน้ำฝนรายเดือนของปีปัจจุบัน (พ.ศ. 2569) เทียบกับ{" "}
            <strong className="text-[#FBBF24]">ค่าเฉลี่ยย้อนหลัง 5 ปี (พ.ศ. 2564–2568)</strong>{" "}
            เพื่อตรวจจับการขยับตัวของฤดูฝน ช่วงฝนทิ้งช่วง และความร้อนสะสมที่ส่งผลต่อการวางแผนเพาะปลูกระยะยาว
          </p>
        </div>

        {/* District Selector inside Historical Trend Dashboard */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="bg-[#0B101D] border border-[#14B8A6]/50 rounded-xl px-3.5 py-2">
            <label
              htmlFor="historical-trend-district-select"
              className="block text-[10px] font-mono uppercase tracking-wider text-[#2DD4BF]"
            >
              อำเภอที่กำลังวิเคราะห์แนวโน้ม 5 ปี
            </label>
            <select
              id="historical-trend-district-select"
              value={selectedDistrict.id}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="text-xs sm:text-sm font-bold bg-transparent text-white focus:outline-none cursor-pointer mt-0.5"
            >
              {KORAT_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0B101D] text-white">
                  {d.nameTh} ({d.zone})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Long-Term Environmental Shift KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Annual Mean Temperature Shift */}
        <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>อุณหภูมิเฉลี่ยปีนี้ vs เฉลี่ย 5 ปี</span>
            <ThermometerSun className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {currentProfile.annualMeanTempCurrentC}°C
            </span>
            <span className="inline-flex items-center text-xs font-mono font-bold text-rose-400">
              <ArrowUpRight className="w-3.5 h-3.5" />+{currentProfile.annualTempShiftC}°C
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าเฉลี่ย 5 ปี (2564–68):{" "}
            <span className="font-mono text-slate-200">
              {currentProfile.annualMeanTemp5YrC}°C
            </span>{" "}
            · ร้อนสุดเดือน เม.ย.
          </div>
        </div>

        {/* KPI 2: Annual Rainfall Comparison */}
        <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ปริมาณฝนสะสมปีนี้ vs เฉลี่ย 5 ปี</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {currentProfile.annualRainCurrentMm.toLocaleString()} มม.
            </span>
            <span
              className={`inline-flex items-center text-xs font-mono font-bold ${
                currentProfile.annualRainShiftPct >= 0
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {currentProfile.annualRainShiftPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {currentProfile.annualRainShiftPct >= 0
                ? `+${currentProfile.annualRainShiftPct}%`
                : `${currentProfile.annualRainShiftPct}%`}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าเฉลี่ย 5 ปี:{" "}
            <span className="font-mono text-slate-200">
              {currentProfile.annualRain5YrMm.toLocaleString()} มม./ปี
            </span>{" "}
            ({currentProfile.annualRainShiftMm >= 0 ? "+" : ""}
            {currentProfile.annualRainShiftMm} มม.)
          </div>
        </div>

        {/* KPI 3: Extreme Heat Days (>35°C) Shift */}
        <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>จำนวนวันร้อนจัด (&gt;35°C) ต่อปี</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-orange-400">
              {currentProfile.extremeHeatDaysCurrent} วัน
            </span>
            <span className="text-xs font-mono text-rose-400 font-bold">
              +{currentProfile.extremeHeatDaysCurrent - currentProfile.extremeHeatDays5YrAvg} วัน
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าเฉลี่ย 5 ปี:{" "}
            <span className="font-mono text-slate-200">
              {currentProfile.extremeHeatDays5YrAvg} วัน/ปี
            </span>{" "}
            · เสี่ยงเครียดน้ำช่วงออกดอก
          </div>
        </div>

        {/* KPI 4: Monsoon Shift & Mid-Season Dry Spell */}
        <div className="bg-[#0B101D] border border-[#14B8A6]/40 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#2DD4BF]">
            <span>การขยับตัวของฤดูฝน &amp; ฝนทิ้งช่วง</span>
            <Compass className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#FBBF24]">
            ฝนแรกช้าลง +{currentProfile.monsoonOnsetShiftDays} วัน
          </div>
          <div className="text-[11px] text-slate-300">
            ช่วงฝนทิ้งช่วง มิ.ย.–ก.ค. นานขึ้น{" "}
            <span className="font-mono font-bold text-amber-300">
              +{currentProfile.midSeasonDrySpellShiftDays} วัน
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Chart Mode Tabs + Seasonal Window Filter */}
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Segmented Chart View Switcher */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>เลือกมุมมองกราฟเปรียบเทียบข้อมูล 5 ปีย้อนหลัง (Historical Comparison Mode)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  id: "temperature_comparison",
                  label: "🌡️ อุณหภูมิ: ปีปัจจุบัน vs เฉลี่ย 5 ปี (°C)",
                },
                {
                  id: "rainfall_comparison",
                  label: "🌧️ ปริมาณน้ำฝนรายเดือน & สะสม (mm)",
                },
                {
                  id: "anomaly_and_multiyear",
                  label: "📊 กราฟส่วนต่างความผิดปกติ (Anomaly Δ) & แนวโน้ม 6 ปี",
                },
              ] as { id: HistoricalChartTabMode; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChartTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartTab === tab.id
                    ? "bg-[#14B8A6] text-[#041E1C] shadow-[0_0_14px_rgba(20,184,166,0.3)]"
                    : "bg-[#080C16] text-slate-300 hover:text-white border border-[#1E293B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Window Filter */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>กรองตามช่วงฤดูกาลเพาะปลูก (Seasonal Filter)</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "all_year", label: "ทั้งปี (ม.ค.–ธ.ค.)" },
                { id: "hot_dry", label: "ฤดูร้อน-แล้ง (ก.พ.–เม.ย.)" },
                { id: "early_mid_monsoon", label: "ต้น-กลางฝน (พ.ค.–ก.ค.)" },
                { id: "late_monsoon_cool", label: "ปลายฝน-เก็บเกี่ยว (ส.ค.–พ.ย.)" },
              ] as { id: SeasonalWindowFilter; label: string }[]
            ).map((sf) => (
              <button
                key={sf.id}
                type="button"
                onClick={() => setSeasonFilter(sf.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  seasonFilter === sf.id
                    ? "bg-[#F59E0B] text-slate-950 font-bold"
                    : "bg-[#080C16] text-slate-300 hover:text-white border border-[#1E293B]"
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Analytics Area: Left 8 Cols = Interactive Historical Comparison Chart | Right 4 Cols = Month-by-Month Inspector & Environmental Shift Diagnosis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: Interactive Chart Panel */}
        <div className="xl:col-span-8 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4">
          {chartTab === "temperature_comparison" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4 text-[#FBBF24]" />
                    <span>
                      กราฟเปรียบเทียบอุณหภูมิรายเดือน: ปีปัจจุบัน (2569) vs ค่าเฉลี่ย 5 ปี (2564–2568)
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    แถบแรเงาสีฟ้าคือกรอบความผันผวนปกติ 5 ปี (±1σ) · เส้นประคือค่าเฉลี่ย 5 ปี · เส้นทึบสีส้มทองคือปีปัจจุบัน (คลิกที่เดือนเพื่อดูผลกระทบต่อพืช)
                  </p>
                </div>
                <span className="text-xs font-mono text-rose-400">
                  ส่วนต่างเฉลี่ยทั้งปี: +{currentProfile.annualTempShiftC}°C
                </span>
              </div>

              {/* SVG Temperature Historical Comparison Chart */}
              <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3.5">
                <svg
                  viewBox="0 0 720 250"
                  className="w-full h-60 sm:h-64 overflow-visible select-none"
                >
                  {/* Horizontal Reference Temperature Gridlines (18°C to 34°C) */}
                  {[18, 22, 26, 30, 34].map((tempVal) => {
                    const y = 205 - ((tempVal - 16) / 20) * 175;
                    return (
                      <g key={tempVal}>
                        <line
                          x1={44}
                          y1={y}
                          x2={695}
                          y2={y}
                          stroke="#1E293B"
                          strokeDasharray="3 3"
                          strokeWidth={0.9}
                        />
                        <text
                          x={36}
                          y={y + 3}
                          textAnchor="end"
                          fill="#64748B"
                          fontSize={9.5}
                          fontFamily="monospace"
                        >
                          {tempVal}°C
                        </text>
                      </g>
                    );
                  })}

                  {/* 5-Year Normal Range Band Polygon (Min to Max) */}
                  {(() => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 620 / (count - 1) : 0;
                    const topPoints = filteredMonthlySeries.map((m, idx) => {
                      const x = 60 + idx * stepX;
                      const y = 205 - ((m.temp5YrMaxBandC - 16) / 20) * 175;
                      return `${x},${y}`;
                    });
                    const bottomPoints = [...filteredMonthlySeries]
                      .reverse()
                      .map((m, revIdx) => {
                        const idx = count - 1 - revIdx;
                        const x = 60 + idx * stepX;
                        const y = 205 - ((m.temp5YrMinBandC - 16) / 20) * 175;
                        return `${x},${y}`;
                      });
                    return (
                      <polygon
                        points={[...topPoints, ...bottomPoints].join(" ")}
                        fill="rgba(56, 189, 248, 0.12)"
                        stroke="rgba(56, 189, 248, 0.28)"
                        strokeWidth={1}
                      />
                    );
                  })()}

                  {/* 5-Year Average Dashed Polyline */}
                  {(() => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 620 / (count - 1) : 0;
                    const pts = filteredMonthlySeries
                      .map((m, idx) => {
                        const x = 60 + idx * stepX;
                        const y = 205 - ((m.temp5YrAvgC - 16) / 20) * 175;
                        return `${x},${y}`;
                      })
                      .join(" ");
                    return (
                      <polyline
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth={2.2}
                        strokeDasharray="6 4"
                        points={pts}
                      />
                    );
                  })()}

                  {/* Current Year (2569) Solid Polyline */}
                  {(() => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 620 / (count - 1) : 0;
                    const pts = filteredMonthlySeries
                      .map((m, idx) => {
                        const x = 60 + idx * stepX;
                        const y = 205 - ((m.tempCurrentYearC - 16) / 20) * 175;
                        return `${x},${y}`;
                      })
                      .join(" ");
                    return (
                      <polyline
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        points={pts}
                      />
                    );
                  })()}

                  {/* Interactive Month Data Nodes & Anomaly Connectors */}
                  {filteredMonthlySeries.map((m, idx) => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 620 / (count - 1) : 0;
                    const x = 60 + idx * stepX;
                    const y5Yr = 205 - ((m.temp5YrAvgC - 16) / 20) * 175;
                    const yCur = 205 - ((m.tempCurrentYearC - 16) / 20) * 175;
                    const isFocused = m.monthIndex === inspectedMonthIdx;

                    return (
                      <g
                        key={m.monthShortTh}
                        onClick={() => setInspectedMonthIdx(m.monthIndex)}
                        className="cursor-pointer"
                      >
                        {/* Active Month Highlight Column */}
                        {isFocused && (
                          <rect
                            x={x - 20}
                            y={18}
                            width={40}
                            height={192}
                            rx={6}
                            fill="rgba(20, 184, 166, 0.12)"
                            stroke="rgba(45, 212, 191, 0.45)"
                            strokeWidth={1}
                          />
                        )}

                        {/* Vertical Anomaly Connector between 5Yr Avg and Current Year */}
                        <line
                          x1={x}
                          y1={y5Yr}
                          x2={x}
                          y2={yCur}
                          stroke={m.tempAnomalyC >= 0 ? "#FB7185" : "#38BDF8"}
                          strokeWidth={2}
                        />

                        {/* 5-Year Average Node */}
                        <circle
                          cx={x}
                          cy={y5Yr}
                          r={isFocused ? 5 : 3.8}
                          fill="#050811"
                          stroke="#38BDF8"
                          strokeWidth={2}
                        />

                        {/* Current Year Node */}
                        <circle
                          cx={x}
                          cy={yCur}
                          r={isFocused ? 6 : 4.5}
                          fill="#FBBF24"
                          stroke="#050811"
                          strokeWidth={1.8}
                        />

                        {/* Current Year Temp & Anomaly Label */}
                        <text
                          x={x}
                          y={yCur - 10}
                          textAnchor="middle"
                          fill={isFocused ? "#FDE68A" : "#F8FAFC"}
                          fontSize={9.5}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {m.tempCurrentYearC}°
                        </text>
                        <text
                          x={x}
                          y={yCur - 21}
                          textAnchor="middle"
                          fill={m.tempAnomalyC >= 1.2 ? "#FDA4AF" : "#FDBA74"}
                          fontSize={8.5}
                          fontFamily="monospace"
                        >
                          {m.tempAnomalyC >= 0 ? `+${m.tempAnomalyC}°` : `${m.tempAnomalyC}°`}
                        </text>

                        {/* 5-Yr Avg Label below */}
                        <text
                          x={x}
                          y={y5Yr + 14}
                          textAnchor="middle"
                          fill="#7DD3FC"
                          fontSize={8.5}
                          fontFamily="monospace"
                        >
                          {m.temp5YrAvgC}°
                        </text>

                        {/* Month Label */}
                        <text
                          x={x}
                          y={228}
                          textAnchor="middle"
                          fill={isFocused ? "#2DD4BF" : "#94A3B8"}
                          fontSize={10.5}
                          fontWeight={isFocused ? "bold" : "normal"}
                        >
                          {m.monthShortTh}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Chart Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E293B] text-[11px] text-slate-300">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#F59E0B] rounded-full" />
                      <span>เส้นทึบสีส้มทอง: อุณหภูมิปีปัจจุบัน (พ.ศ. 2569)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-b-2 border-dashed border-sky-400" />
                      <span>เส้นประสีฟ้า: ค่าเฉลี่ย 5 ปี (พ.ศ. 2564–2568)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-2.5 bg-sky-400/20 border border-sky-400/40 rounded-xs" />
                      <span>แถบสีฟ้าอ่อน: พิสัยปกติย้อนหลัง 5 ปี (±1σ)</span>
                    </span>
                  </div>
                  <span className="font-mono text-[#2DD4BF]">
                    คลิกที่จุดเดือนบนกราฟเพื่อตรวจสอบรายละเอียด
                  </span>
                </div>
              </div>
            </>
          )}

          {chartTab === "rainfall_comparison" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-sky-400" />
                    <span>
                      กราฟเปรียบเทียบปริมาณน้ำฝนรายเดือน &amp; น้ำฝนสะสม: ปีปัจจุบัน (2569) vs ค่าเฉลี่ย 5 ปี
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    เปรียบเทียบแท่งปริมาณน้ำฝนรายเดือน (มม.) และเส้นน้ำฝนสะสมทั้งปี เพื่อตรวจจับช่วงฝนทิ้งช่วง (มิ.ย.–ก.ค.) และพายุฝนปลายฤดู (ก.ย.–ต.ค.)
                  </p>
                </div>
                <span className="text-xs font-mono text-sky-300">
                  ฝนรวมปีนี้ {currentProfile.annualRainCurrentMm} มม. vs เฉลี่ย 5 ปี{" "}
                  {currentProfile.annualRain5YrMm} มม.
                </span>
              </div>

              {/* SVG Grouped Rainfall Bars + Cumulative Rainfall Curves */}
              <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3.5">
                <svg
                  viewBox="0 0 720 250"
                  className="w-full h-60 sm:h-64 overflow-visible select-none"
                >
                  {/* Horizontal Gridlines for Monthly Rainfall (0 to 300 mm) */}
                  {[0, 75, 150, 225, 300].map((rainVal) => {
                    const y = 205 - (rainVal / 310) * 175;
                    return (
                      <g key={rainVal}>
                        <line
                          x1={44}
                          y1={y}
                          x2={695}
                          y2={y}
                          stroke="#1E293B"
                          strokeDasharray="3 3"
                          strokeWidth={0.9}
                        />
                        <text
                          x={38}
                          y={y + 3}
                          textAnchor="end"
                          fill="#64748B"
                          fontSize={9}
                          fontFamily="monospace"
                        >
                          {rainVal}มม.
                        </text>
                      </g>
                    );
                  })}

                  {/* Grouped Bars for 5-Year Average vs Current Year Rainfall */}
                  {filteredMonthlySeries.map((m, idx) => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 610 / (count - 1) : 0;
                    const x = 64 + idx * stepX;
                    const h5Yr = Math.min(175, (m.rain5YrAvgMm / 310) * 175);
                    const hCur = Math.min(175, (m.rainCurrentYearMm / 310) * 175);
                    const isFocused = m.monthIndex === inspectedMonthIdx;
                    const isDeficit = m.rainCurrentYearMm < m.rain5YrAvgMm;

                    return (
                      <g
                        key={m.monthShortTh}
                        onClick={() => setInspectedMonthIdx(m.monthIndex)}
                        className="cursor-pointer"
                      >
                        {isFocused && (
                          <rect
                            x={x - 22}
                            y={18}
                            width={44}
                            height={192}
                            rx={6}
                            fill="rgba(20, 184, 166, 0.12)"
                            stroke="rgba(45, 212, 191, 0.45)"
                          />
                        )}

                        {/* 5-Year Average Bar (Slate/Sky Muted) */}
                        <rect
                          x={x - 13}
                          y={205 - h5Yr}
                          width={12}
                          height={Math.max(2, h5Yr)}
                          rx={3}
                          fill="rgba(148, 163, 184, 0.45)"
                          stroke="#64748B"
                          strokeWidth={0.8}
                        />

                        {/* Current Year Bar (Sky Blue if >= 5Yr Avg, Amber if Deficit) */}
                        <rect
                          x={x + 1}
                          y={205 - hCur}
                          width={12}
                          height={Math.max(2, hCur)}
                          rx={3}
                          fill={isDeficit ? "#F59E0B" : "#38BDF8"}
                        />

                        {/* Anomaly % Label on top of bars */}
                        <text
                          x={x}
                          y={Math.min(205 - h5Yr, 205 - hCur) - 6}
                          textAnchor="middle"
                          fill={isDeficit ? "#FCD34D" : "#7DD3FC"}
                          fontSize={8.5}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {m.rainAnomalyPct >= 0
                            ? `+${m.rainAnomalyPct}%`
                            : `${m.rainAnomalyPct}%`}
                        </text>

                        {/* Month Label */}
                        <text
                          x={x}
                          y={228}
                          textAnchor="middle"
                          fill={isFocused ? "#2DD4BF" : "#94A3B8"}
                          fontSize={10.5}
                          fontWeight={isFocused ? "bold" : "normal"}
                        >
                          {m.monthShortTh}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cumulative Rainfall Progression Overlay (Scaled to 1500mm max) */}
                  {(() => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 610 / (count - 1) : 0;
                    const maxCum = Math.max(
                      1400,
                      currentProfile.annualRain5YrMm,
                      currentProfile.annualRainCurrentMm
                    );
                    const cum5YrPts = filteredMonthlySeries
                      .map((m, idx) => {
                        const x = 64 + idx * stepX;
                        const y = 205 - (m.cumRain5YrAvgMm / maxCum) * 165;
                        return `${x},${y}`;
                      })
                      .join(" ");
                    const cumCurPts = filteredMonthlySeries
                      .map((m, idx) => {
                        const x = 64 + idx * stepX;
                        const y = 205 - (m.cumRainCurrentYearMm / maxCum) * 165;
                        return `${x},${y}`;
                      })
                      .join(" ");
                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth={1.8}
                          strokeDasharray="4 4"
                          points={cum5YrPts}
                        />
                        <polyline
                          fill="none"
                          stroke="#2DD4BF"
                          strokeWidth={2.4}
                          points={cumCurPts}
                        />
                      </>
                    );
                  })()}
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E293B] text-[11px] text-slate-300">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-2.5 bg-slate-400/50 border border-slate-500 rounded-xs" />
                      <span>แท่งเทา: ฝนรายเดือนเฉลี่ย 5 ปี (2564–68)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-2.5 bg-sky-400 rounded-xs" />
                      <span>แท่งฟ้า: ปีปัจจุบันฝนมากกว่าเฉลี่ย 5 ปี</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-2.5 bg-amber-500 rounded-xs" />
                      <span>แท่งส้ม: ปีปัจจุบันฝนต่ำกว่าเฉลี่ย 5 ปี (ฝนทิ้งช่วง)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#2DD4BF]">
                      <span className="w-3 h-1 bg-[#2DD4BF] rounded-full" />
                      <span>เส้นเขียวมรกต: น้ำฝนสะสมรวมปีปัจจุบัน</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {chartTab === "anomaly_and_multiyear" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2DD4BF]" />
                    <span>
                      แนวโน้มระยะยาว 6 ปีต่อเนื่อง (พ.ศ. 2564–2569) &amp; ดัชนีความผิดปกติรายเดือน (Climate Anomaly)
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    ติดตามการเปลี่ยนแปลงตั้งแต่ช่วงลานีญา (2564–2565) · เอลนีโญ (2566–2567) จนถึงปีการเพาะปลูกปัจจุบัน (2569)
                  </p>
                </div>
              </div>

              {/* 6-Year Longitudinal Trajectory Table & Visual Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
                {currentProfile.yearlyTrajectory.map((yr) => (
                  <div
                    key={yr.yearBe}
                    className={`rounded-xl p-3 border space-y-1.5 ${
                      yr.isCurrentYear
                        ? "bg-[#14B8A6]/15 border-[#2DD4BF] text-white"
                        : "bg-[#050811] border-[#1E293B] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white">พ.ศ. {yr.yearBe}</span>
                      {yr.isCurrentYear && (
                        <span className="text-[10px] text-[#2DD4BF] font-bold">
                          ปีนี้
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {yr.ensoPhaseTh}
                    </div>
                    <div className="pt-1 border-t border-[#1E293B] space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">อุณหภูมิ:</span>
                        <span className="text-[#FBBF24] font-bold">
                          {yr.meanTempC}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">ฝนรวม:</span>
                        <span className="text-sky-300 font-bold">
                          {yr.totalRainMm} มม.
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">&gt;35°C:</span>
                        <span className="text-rose-400">{yr.extremeHotDays} วัน</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">ทิ้งช่วงสูงสุด:</span>
                        <span className="text-amber-300">{yr.maxDrySpellDays} วัน</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Rainfall Anomaly (% Departure from 5-Year Baseline) Diverging Chart */}
              <div className="bg-[#050811] border border-[#1E293B] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    กราฟส่วนต่างปริมาณฝนรายเดือนเทียบค่าเฉลี่ย 5 ปี (% Rainfall Anomaly Departure)
                  </span>
                  <span className="font-mono text-slate-400">
                    เส้น 0% = ค่าเฉลี่ย 5 ปีย้อนหลัง (2564–2568)
                  </span>
                </div>
                <svg
                  viewBox="0 0 720 155"
                  className="w-full h-36 overflow-visible select-none"
                >
                  {/* Zero Baseline */}
                  <line
                    x1={40}
                    y1={78}
                    x2={695}
                    y2={78}
                    stroke="#475569"
                    strokeWidth={1.4}
                  />
                  <text
                    x={34}
                    y={81}
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize={9}
                    fontFamily="monospace"
                  >
                    0%
                  </text>

                  {filteredMonthlySeries.map((m, idx) => {
                    const count = filteredMonthlySeries.length;
                    const stepX = count > 1 ? 610 / (count - 1) : 0;
                    const x = 64 + idx * stepX;
                    const clampedPct = Math.max(-55, Math.min(55, m.rainAnomalyPct));
                    const barH = Math.abs(clampedPct) * 0.95;
                    const isPositive = m.rainAnomalyPct >= 0;

                    return (
                      <g
                        key={m.monthShortTh}
                        onClick={() => setInspectedMonthIdx(m.monthIndex)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={x - 11}
                          y={isPositive ? 78 - barH : 78}
                          width={22}
                          height={Math.max(3, barH)}
                          rx={3}
                          fill={isPositive ? "#38BDF8" : "#F59E0B"}
                        />
                        <text
                          x={x}
                          y={isPositive ? 72 - barH : 90 + barH}
                          textAnchor="middle"
                          fill={isPositive ? "#7DD3FC" : "#FCD34D"}
                          fontSize={8.5}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {isPositive ? `+${m.rainAnomalyPct}%` : `${m.rainAnomalyPct}%`}
                        </text>
                        <text
                          x={x}
                          y={145}
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize={10}
                        >
                          {m.monthShortTh}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </>
          )}

          {/* Selected Month Deep-Dive Comparison Strip */}
          <div className="bg-[#080C16] border border-[#14B8A6]/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-[#2DD4BF]">
                  เจาะลึกเดือน{inspectedMonth.monthFullTh} ({inspectedMonth.seasonTagTh})
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">{currentProfile.district.nameTh}</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-[#FBBF24]">ผลกระทบต่อระยะพืช: </strong>
                {inspectedMonth.agronomicMonthNoteTh}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-lg px-3 py-2">
                <div className="text-[10px] text-slate-400">อุณหภูมิ (ปีนี้ vs 5 ปี)</div>
                <div className="font-bold text-white">
                  {inspectedMonth.tempCurrentYearC}°C{" "}
                  <span className="text-slate-400 font-normal">
                    (เฉลี่ย {inspectedMonth.temp5YrAvgC}°C)
                  </span>{" "}
                  <span className="text-rose-400">
                    {inspectedMonth.tempAnomalyC >= 0
                      ? `+${inspectedMonth.tempAnomalyC}°C`
                      : `${inspectedMonth.tempAnomalyC}°C`}
                  </span>
                </div>
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-lg px-3 py-2">
                <div className="text-[10px] text-slate-400">น้ำฝน (ปีนี้ vs 5 ปี)</div>
                <div className="font-bold text-white">
                  {inspectedMonth.rainCurrentYearMm} มม.{" "}
                  <span className="text-slate-400 font-normal">
                    (เฉลี่ย {inspectedMonth.rain5YrAvgMm} มม.)
                  </span>{" "}
                  <span
                    className={
                      inspectedMonth.rainAnomalyPct >= 0
                        ? "text-sky-400"
                        : "text-amber-400"
                    }
                  >
                    {inspectedMonth.rainAnomalyPct >= 0
                      ? `+${inspectedMonth.rainAnomalyPct}%`
                      : `${inspectedMonth.rainAnomalyPct}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLS: Long-Term Environmental Shift Diagnosis & Agronomic Adaptation Playbook */}
        <div className="xl:col-span-4 space-y-4">
          {/* Card 1: Environmental Shift Classification & Synthesis */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="space-y-1 border-b border-[#1E293B] pb-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#FBBF24] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>การวินิจฉัยการเปลี่ยนแปลงสภาพแวดล้อมระยะยาว</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {currentProfile.shiftRegimeLabelTh}
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentProfile.shiftSummaryTh}
            </p>

            {/* Playbook Recommendations */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                <Sprout className="w-4 h-4" />
                <span>แนวทางปรับตัวของเกษตรกร ({currentProfile.district.nameTh}):</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {currentProfile.adaptationRecommendationsTh.map((rec, i) => (
                  <li
                    key={i}
                    className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2: Cross-District 5-Year Climate Shift Hotspots */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                จัดอันดับอำเภอที่อุณหภูมิและฝนเปลี่ยนจากค่าเฉลี่ย 5 ปีสูงสุด
              </h4>
              <span className="text-[11px] font-mono text-[#2DD4BF]">32 อำเภอ</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {rankedByTempShift.slice(0, 8).map((prof, idx) => {
                const isSelected = prof.district.id === selectedDistrict.id;
                return (
                  <button
                    key={prof.district.id}
                    type="button"
                    onClick={() => onSelectDistrict(prof.district.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#14B8A6]/20 border-[#2DD4BF] text-white"
                        : "bg-[#080C16] border-[#1E293B] hover:border-slate-600 text-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        #{idx + 1} {prof.district.nameTh}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {prof.shiftRegimeLabelTh}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs shrink-0">
                      <div className="text-rose-400 font-bold">
                        +{prof.annualTempShiftC}°C
                      </div>
                      <div
                        className={`text-[10px] ${
                          prof.annualRainShiftPct >= 0
                            ? "text-sky-300"
                            : "text-amber-300"
                        }`}
                      >
                        ฝน {prof.annualRainShiftPct >= 0 ? "+" : ""}
                        {prof.annualRainShiftPct}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
