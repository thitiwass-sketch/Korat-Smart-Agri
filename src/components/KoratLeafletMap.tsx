import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  KORAT_DISTRICTS,
  KORAT_DAM_GEO_MARKERS,
  KoratDistrict,
  KoratGeoPlotPin,
  formatDistrictName,
} from "../data/koratAgriData";
import {
  KORAT_IRRIGATION_CANALS,
  KORAT_WATER_SOURCE_NODES,
} from "../data/koratIrrigationData";
import {
  KORAT_DISTRICT_SOIL_PROFILES,
  getDistrictSoilProfile,
  DistrictSoilNutrientProfile,
  SOIL_SERIES_METADATA,
  resolveSoilSeriesKeyForDistrict,
  getDistrictSoilSeriesMeta,
} from "../data/koratSoilDatabase";
import { KORAT_DISTRICT_POLYGONS } from "../data/koratDistrictBoundaries";
import { useTheme } from "../context/ThemeContext";
import {
  PlusCircle,
  Layers,
  Navigation,
  CheckCircle2,
  LocateFixed,
  Radio,
  Droplets,
  Thermometer,
  CloudRain,
  Search,
  Sliders,
  Download,
  Share2,
  Copy,
  Check,
  Image as ImageIcon,
  X,
  Truck,
  Fuel,
  FlaskConical,
  Wind,
  ZoomIn,
  ZoomOut,
  Compass,
  MapPin,
  Eye,
  Info,
} from "lucide-react";

export type MapOverlayMode =
  | "rainfall_intensity"
  | "humidity_heatmap"
  | "soil_moisture"
  | "soil_series"
  | "drought_spi"
  | "soil_ph_npk"
  | "rain_prob";

export type SoilOverlaySubMetric =
  | "ph"
  | "npk_deficiency"
  | "n_om"
  | "p_avail"
  | "k_exch";

export interface SouthernLogisticsHub {
  id: string;
  code: string;
  nameTh: string;
  type: "coop_transport" | "heavy_fuel";
  typeLabelTh: string;
  districtId: string;
  districtNameTh: string;
  lat: number;
  lon: number;
  highwayCorridor: string;
  heavyMachinerySpec: string;
  weighbridgeTons: number;
  fuelOrColdChainDetail: string;
  coopMemberBenefit: string;
  operatingHours: string;
}

const KORAT_SOUTHERN_LOGISTICS_HUBS: SouthernLogisticsHub[] = [
  {
    id: "log-pc-coop",
    code: "HUB-PC01",
    nameTh: "ศูนย์รวบรวมและขนส่งสหกรณ์การเกษตรปากช่อง (GI Cold-Chain)",
    type: "coop_transport",
    typeLabelTh: "ศูนย์ขนส่งสหกรณ์",
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    lat: 14.685,
    lon: 101.432,
    highwayCorridor: "ทล.2 (ถนนมิตรภาพ) เชื่อม ทล.2090 (ธนะรัชต์)",
    heavyMachinerySpec: "รองรับรถพ่วง 22 ล้อ, รถห้องเย็นควบคุมอุณหภูมิ และรถเทรลเลอร์ขนย้ายรถแทรกเตอร์",
    weighbridgeTons: 80,
    fuelOrColdChainDetail: "ห้องเย็นพรีคูลลิ่งผลไม้ GI 40 ตัน + แท่นโหลดไฮดรอลิก 6 ช่องจอด",
    coopMemberBenefit: "ส่วนลดค่าขนส่งห้องเย็น 15% และบริการจองคิวรถพ่วงล่วงหน้า",
    operatingHours: "05:00 – 22:00 น. (ฤดูผลไม้เปิด 24 ชม.)",
  },
  {
    id: "log-pc-fuel",
    code: "FUEL-PC02",
    nameTh: "สถานีบริการน้ำมันเครื่องจักรกลหนัก สหกรณ์ฯ ปากช่อง-หนองสาหร่าย",
    type: "heavy_fuel",
    typeLabelTh: "ปั๊มเครื่องจักรกลหนัก",
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    lat: 14.662,
    lon: 101.468,
    highwayCorridor: "ทล.2235 (หนองสาหร่าย–คลองม่วง)",
    heavyMachinerySpec: "ช่องจอดกว้างพิเศษ 6.5 ม. สำหรับรถไถพ่วงผาน, รถพ่นยาแรงดันสูง และรถบรรทุก 10 ล้อ",
    weighbridgeTons: 60,
    fuelOrColdChainDetail: "ดีเซลหมุนเร็ว B7 / B20 หัวจ่าย High-Flow (120 ลิตร/นาที) + บริการถัง 200 ลิตรหน้าสวน",
    coopMemberBenefit: "ราคาสหกรณ์ต่ำกว่าหน้าปั๊มทั่วไป 0.80 บ./ลิตร + ปันผลปลายปี",
    operatingHours: "05:00 – 21:00 น.",
  },
  {
    id: "log-wnk-coop",
    code: "HUB-WNK01",
    nameTh: "ศูนย์กระจายผลผลิตและขนส่งสหกรณ์การเกษตรวังน้ำเขียว (ไทยสามัคคี)",
    type: "coop_transport",
    typeLabelTh: "ศูนย์ขนส่งสหกรณ์",
    districtId: "wang-nam-khiao",
    districtNameTh: "อ.วังน้ำเขียว",
    lat: 14.432,
    lon: 101.868,
    highwayCorridor: "ทล.304 (กบินทร์บุรี–ปักธงชัย) กม.68",
    heavyMachinerySpec: "ลานกลับรถเทรลเลอร์และรถบรรทุกห้องเย็นขึ้น-ลงทางลาดชันโซนเขา",
    weighbridgeTons: 60,
    fuelOrColdChainDetail: "จุดคัดเกรด-แพ็กกิ้งทุเรียน/มังคุด/เงาะ พร้อมรถกระบะห้องเย็นวิ่งส่ง กทม. รายวัน",
    coopMemberBenefit: "ฟรีค่าชั่งน้ำหนักดิจิทัลสำหรับสมาชิกสหกรณ์และกลุ่มแปลงใหญ่",
    operatingHours: "06:00 – 20:00 น.",
  },
  {
    id: "log-wnk-fuel",
    code: "FUEL-WNK02",
    nameTh: "สถานีเชื้อเพลิงเพื่อการเกษตรและจุดพักรถบรรทุกหนัก วังน้ำเขียว (ทล.304)",
    type: "heavy_fuel",
    typeLabelTh: "ปั๊มเครื่องจักรกลหนัก",
    districtId: "wang-nam-khiao",
    districtNameTh: "อ.วังน้ำเขียว",
    lat: 14.468,
    lon: 101.842,
    highwayCorridor: "ทล.304 เชื่อมทางหลวงชนบท นม.3052 (วังหมี)",
    heavyMachinerySpec: "ลานตรวจเช็กระบบเบรกลม-ไฮดรอลิกรถบรรทุกการเกษตรก่อนลงเขา",
    weighbridgeTons: 50,
    fuelOrColdChainDetail: "ดีเซล B7 / B20 เกรดกำลังลากจูงสูง + น้ำมันไฮดรอลิกแท้สำหรับรถแทรกเตอร์",
    coopMemberBenefit: "ตรวจเช็กลมยางและระบบหล่อเย็นเครื่องจักรกลหนักฟรี",
    operatingHours: "24 ชั่วโมง",
  },
  {
    id: "log-kb-coop",
    code: "HUB-KB01",
    nameTh: "ศูนย์โลจิสติกส์และลานรวมพ่วงสหกรณ์การเกษตรครบุรี",
    type: "coop_transport",
    typeLabelTh: "ศูนย์ขนส่งสหกรณ์",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    lat: 14.518,
    lon: 102.248,
    highwayCorridor: "ทล.224 (โชคชัย–ครบุรี) เชื่อมโรงงานน้ำตาลและแป้งมัน",
    heavyMachinerySpec: "รองรับรถพ่วง 18–22 ล้อ, รถคีบอ้อย และรถเทรลเลอร์ขนรถเกี่ยว/รถขุดมัน",
    weighbridgeTons: 100,
    fuelOrColdChainDetail: "ตาชั่งดิจิทัล 100 ตัน 2 รางคู่ + คิวรถบรรทุกสหกรณ์วิ่งส่งโรงงานและตลาดไท",
    coopMemberBenefit: "ลดต้นทุนค่าขนส่งรวมกลุ่มแปลงใหญ่ 18–22% ต่อเที่ยว",
    operatingHours: "05:00 – 23:00 น.",
  },
  {
    id: "log-kb-fuel",
    code: "FUEL-KB02",
    nameTh: "คลังน้ำมันดีเซลเกษตรและศูนย์ซ่อมบำรุงรถตัดอ้อย-รถแทรกเตอร์ ครบุรีใต้",
    type: "heavy_fuel",
    typeLabelTh: "ปั๊มเครื่องจักรกลหนัก",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    lat: 14.482,
    lon: 102.226,
    highwayCorridor: "ทางหลวงชนบท นม.4008 (โคกกระชาย–เขื่อนลำแชะ)",
    heavyMachinerySpec: "หัวจ่าย High-Flow คู่สำหรับรถตัดอ้อย (Sugarcane Harvester) และรถแทรกเตอร์ 110+ แรงม้า",
    weighbridgeTons: 80,
    fuelOrColdChainDetail: "ดีเซลเกษตร B7/B20 + บริการรถบรรทุกน้ำมันเคลื่อนที่ส่งถึงแปลง (Mobile Fuel Tanker)",
    coopMemberBenefit: "เครดิตน้ำมันสหกรณ์สำหรับสมาชิกแปลงใหญ่หักชำระหลังขายผลผลิต",
    operatingHours: "05:00 – 22:00 น.",
  },
  {
    id: "log-ss-coop",
    code: "HUB-SS01",
    nameTh: "ศูนย์รวบรวมผลผลิตและขนส่งสหกรณ์การเกษตรเสิงสาง (โนนสมบูรณ์)",
    type: "coop_transport",
    typeLabelTh: "ศูนย์ขนส่งสหกรณ์",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    lat: 14.426,
    lon: 102.462,
    highwayCorridor: "ทล.224 เชื่อม ทล.2119 (เสิงสาง–ละหานทราย)",
    heavyMachinerySpec: "ลานขนถ่ายระดับพื้นเรียบสำหรับรถพ่วงเกษตรและรถกระบะคอกรั้ว",
    weighbridgeTons: 80,
    fuelOrColdChainDetail: "ศูนย์คัดแยกเงาะโรงเรียน-ทุเรียนเสิงสาง และจุดขึ้นมันสำปะหลังสะอาด",
    coopMemberBenefit: "บริการรถตักหน้าลานและสายพานลำเลียงลดค่าแรงงานขนขึ้นรถ",
    operatingHours: "05:30 – 21:00 น.",
  },
  {
    id: "log-ss-fuel",
    code: "FUEL-SS02",
    nameTh: "สถานีบริการน้ำมันสหกรณ์เสิงสาง-ลำปลายมาศ (รองรับเครื่องจักรกลหนัก)",
    type: "heavy_fuel",
    typeLabelTh: "ปั๊มเครื่องจักรกลหนัก",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    lat: 14.448,
    lon: 102.435,
    highwayCorridor: "ทล.224 (เสิงสาง–ครบุรี)",
    heavyMachinerySpec: "รัศมีวงเลี้ยว 28 เมตร รองรับรถพ่วงแม่-ลูกและรถเทรลเลอร์บรรทุกเครื่องจักร",
    weighbridgeTons: 80,
    fuelOrColdChainDetail: "ดีเซล B7 / B20 มาตรฐานกรมธุรกิจพลังงาน + อะไหล่ไส้กรอง-สายพานไฮดรอลิก",
    coopMemberBenefit: "สะสมยอดลิตรรับเงินเฉลี่ยคืนสหกรณ์ 0.65 บ./ลิตร",
    operatingHours: "05:00 – 21:30 น.",
  },
  {
    id: "log-nbm-coop",
    code: "HUB-NBM01",
    nameTh: "ศูนย์ขนส่งสหกรณ์การเกษตรหนองบุญมาก & จุดกระจายสินค้าทล.24",
    type: "coop_transport",
    typeLabelTh: "ศูนย์ขนส่งสหกรณ์",
    districtId: "nong-bun-mak",
    districtNameTh: "อ.หนองบุญมาก",
    lat: 14.738,
    lon: 102.375,
    highwayCorridor: "ทล.24 (โชคชัย–เดชอุดม) กม.32",
    heavyMachinerySpec: "จุดเชื่อมต่อเส้นทางขนส่งหลักอีสานใต้–ท่าเรือแหลมฉบัง รองรับรถเทรลเลอร์ตู้คอนเทนเนอร์",
    weighbridgeTons: 100,
    fuelOrColdChainDetail: "ลานกองเก็บและจุดเปลี่ยนถ่ายตู้คอนเทนเนอร์ห้องเย็นส่งออกผลไม้/มันอัดเม็ด",
    coopMemberBenefit: "อัตราค่าชั่งและค่าฝากพักสินค้าพิเศษสำหรับเกษตรกรในเครือข่าย",
    operatingHours: "24 ชั่วโมง",
  },
  {
    id: "log-nbm-fuel",
    code: "FUEL-NBM02",
    nameTh: "จุดบริการเชื้อเพลิงเครื่องจักรกลหนักและลานพักรถพ่วง หนองบุญมาก (ทล.24)",
    type: "heavy_fuel",
    typeLabelTh: "ปั๊มเครื่องจักรกลหนัก",
    districtId: "nong-bun-mak",
    districtNameTh: "อ.หนองบุญมาก",
    lat: 14.715,
    lon: 102.352,
    highwayCorridor: "ทล.24 (ฝั่งขาเข้าโชคชัย–นครราชสีมา)",
    heavyMachinerySpec: "หัวจ่าย High-Speed 8 ช่องจอด ไม่ต้องปลดพ่วงท้าย พร้อมจุดอัดจาระบี-ปะยางรถไถ",
    weighbridgeTons: 80,
    fuelOrColdChainDetail: "ดีเซล B7 / B20 และ AdBlue สำหรับเครื่องยนต์ดีเซลกำลังสูงรุ่นใหม่",
    coopMemberBenefit: "ส่วนลดค่าน้ำมันหล่อลื่นเครื่องจักรกลการเกษตร 12%",
    operatingHours: "24 ชั่วโมง",
  },
];

export interface LiveStationOverride {
  districtId: string;
  tempCurrentC?: number;
  tempMaxC?: number;
  tempMinC?: number;
  rainProbPct?: number;
  rain24hMm?: number;
  windSpeedKmh?: number;
  et0Mm?: number;
  spi30d?: number;
  relativeHumidityPct?: number;
  soilMoisturePct?: number;
}

export interface WeatherStationTelemetry {
  stationCode: string;
  district: KoratDistrict;
  tempCurrentC: number;
  relativeHumidityPct: number;
  soilMoisturePct: number;
  soilTempC: number;
  windSpeedKmh: number;
  windDirLabel: string;
  pressureHpa: number;
  rain24hMm: number;
  rainProbPct: number;
  spi30d: number;
  et0MmDay: number;
  moistureStatus: "ชื้นเหมาะสม" | "เฝ้าระวังดินแห้ง" | "วิกฤตดินแห้งแล้ง";
}

interface KoratLeafletMapProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  plots: KoratGeoPlotPin[];
  onAddPlotPin: (newPlot: KoratGeoPlotPin) => void;
  activeOverlayMode: MapOverlayMode;
  onChangeOverlayMode: (mode: MapOverlayMode) => void;
  liveStationOverride?: LiveStationOverride | null;
}

const FALLBACK_TILE_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#0F172A"/><path d="M 0 64 L 256 64 M 0 128 L 256 128 M 0 192 L 256 192 M 64 0 L 64 256 M 128 0 L 128 256 M 192 0 L 192 256" stroke="#1E293B" stroke-width="1"/></svg>`
  );

const TILE_LAYERS = {
  topo: {
    name: "แผนที่ภูมิประเทศและลุ่มน้ำ (Topo)",
    url: "/api/map-tiles/topo/{z}/{x}/{y}.png",
    attribution: "Korat GIS &middot; Esri World Topo &middot; OpenStreetMap",
  },
  osm: {
    name: "แผนที่ถนนและขอบเขตอำเภอ (OSM)",
    url: "/api/map-tiles/osm/{z}/{x}/{y}.png",
    attribution: "Korat GIS &middot; OpenStreetMap",
  },
  satellite: {
    name: "ภาพถ่ายดาวเทียมการเกษตร (Esri Imagery)",
    url: "/api/map-tiles/satellite/{z}/{x}/{y}.png",
    attribution: "Korat GIS &middot; Esri World Imagery",
  },
  dark_meteo: {
    name: "เรดาร์อุตุนิยมวิทยา (Voyager Radar)",
    url: "/api/map-tiles/dark_meteo/{z}/{x}/{y}.png",
    attribution: "Korat GIS &middot; CARTO Voyager &middot; OpenStreetMap",
  },
};

// Nakhon Ratchasima Provincial Perimeter Coordinates (Approximate GIS Polygon Hull)
const KORAT_PROVINCE_BOUNDARY: [number, number][] = [
  [15.78, 102.08],
  [15.76, 102.42],
  [15.65, 102.78],
  [15.46, 102.98],
  [15.18, 103.02],
  [14.88, 102.82],
  [14.48, 102.62],
  [14.16, 102.46],
  [14.14, 102.12],
  [14.28, 101.82],
  [14.42, 101.32],
  [14.72, 101.24],
  [15.18, 101.42],
  [15.48, 101.68],
  [15.78, 102.08],
];

// Major River Basins in Nakhon Ratchasima (Lam Takhong, Lam Chiang Krai, Mun River)
const KORAT_RIVER_LINES: { name: string; coords: [number, number][] }[] = [
  {
    name: "ลุ่มน้ำลำตะคอง–แม่น้ำมูล",
    coords: [
      [14.62, 101.41],
      [14.82, 101.66],
      [14.89, 101.84],
      [14.98, 102.1],
      [15.08, 102.29],
      [15.22, 102.49],
      [15.35, 102.74],
    ],
  },
  {
    name: "ลุ่มน้ำลำเชียงไกร",
    coords: [
      [15.21, 101.77],
      [15.18, 101.99],
      [15.19, 102.25],
      [15.22, 102.49],
    ],
  },
  {
    name: "ลุ่มน้ำลำพระเพลิง–มูลตอนบน",
    coords: [
      [14.45, 101.82],
      [14.59, 102.02],
      [14.73, 102.17],
      [14.96, 102.34],
      [15.22, 102.49],
    ],
  },
];

// Geographical bounds covering all 32 districts of Nakhon Ratchasima
const KORAT_BOUNDS: L.LatLngBoundsLiteral = [
  [14.12, 101.12],
  [15.88, 103.18],
];

/**
 * Generates a continuous Inverse-Distance-Weighted (IDW) spatial heatmap data URL
 * across Nakhon Ratchasima's 32 districts for Soil Moisture, Rain Probability, or SPI-30d.
 */
function generateKoratHeatmapDataUrl(
  stations: WeatherStationTelemetry[],
  mode: MapOverlayMode
): string {
  const width = 260;
  const height = 220;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const minLat = KORAT_BOUNDS[0][0];
  const maxLat = KORAT_BOUNDS[1][0];
  const minLon = KORAT_BOUNDS[0][1];
  const maxLon = KORAT_BOUNDS[1][1];

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Color ramp lookup helper
  const getRgbForValue = (val: number): [number, number, number] => {
    if (mode === "soil_moisture") {
      // val is Soil Moisture % (18 to 65)
      if (val < 26) {
        // Deep parched red to orange-red
        const t = Math.max(0, (val - 18) / 8);
        return [
          Math.round(220 + t * 19),
          Math.round(38 + t * 45),
          Math.round(38 - t * 10),
        ];
      }
      if (val < 38) {
        // Amber-orange warning zone
        const t = (val - 26) / 12;
        return [
          Math.round(239 - t * 20),
          Math.round(83 + t * 85),
          Math.round(28 + t * 15),
        ];
      }
      if (val < 50) {
        // Optimal agronomic emerald green
        const t = (val - 38) / 12;
        return [
          Math.round(219 - t * 203),
          Math.round(168 + t * 17),
          Math.round(43 + t * 86),
        ];
      }
      // High moisture / saturated cyan-blue (50% - 65%+)
      const t = Math.min(1, (val - 50) / 15);
      return [
        Math.round(16 - t * 14),
        Math.round(185 - t * 40),
        Math.round(129 + t * 105),
      ];
    }

    if (mode === "rainfall_intensity" || mode === "rain_prob") {
      // val is Composite Rain Intensity & Prob (0 to 80+)
      if (val < 20) {
        // Trace to light rain (warm amber-yellow transitioning to green)
        const t = Math.max(0, val / 20);
        return [
          Math.round(245 - t * 140),
          Math.round(158 + t * 40),
          Math.round(11 + t * 90),
        ];
      }
      if (val < 42) {
        // Moderate rain (emerald-teal transitioning to vivid cyan-blue)
        const t = (val - 20) / 22;
        return [
          Math.round(105 - t * 75),
          Math.round(198 - t * 15),
          Math.round(101 + t * 145),
        ];
      }
      if (val < 62) {
        // Heavy rain (vivid sky blue to deep royal indigo)
        const t = (val - 42) / 20;
        return [
          Math.round(30 + t * 69),
          Math.round(183 - t * 81),
          Math.round(246 - t * 5),
        ];
      }
      // Extreme / convective storm downpour (violet-magenta)
      const t = Math.min(1, (val - 62) / 20);
      return [
        Math.round(99 + t * 118),
        Math.round(102 - t * 65),
        Math.round(241 - t * 45),
      ];
    }

    if (mode === "humidity_heatmap") {
      // val is Relative Humidity % (45% to 92%)
      if (val < 54) {
        // Dry / low humidity (amber-orange to lime-gold)
        const t = Math.max(0, (val - 45) / 9);
        return [
          Math.round(245 - t * 50),
          Math.round(158 + t * 40),
          Math.round(11 + t * 80),
        ];
      }
      if (val < 70) {
        // Comfortable / moderate humidity (emerald to vibrant teal-cyan)
        const t = (val - 54) / 16;
        return [
          Math.round(195 - t * 180),
          Math.round(198 - t * 10),
          Math.round(91 + t * 130),
        ];
      }
      if (val < 82) {
        // High humidity (cyan to rich marine blue)
        const t = (val - 70) / 12;
        return [
          Math.round(15 + t * 25),
          Math.round(188 - t * 60),
          Math.round(221 + t * 25),
        ];
      }
      // Saturated / fog / storm air (>82% RH - deep indigo-violet)
      const t = Math.min(1, (val - 82) / 14);
      return [
        Math.round(40 + t * 90),
        Math.round(128 - t * 55),
        Math.round(246 - t * 15),
      ];
    }

    if (mode === "soil_ph_npk") {
      // val is Soil pH (4.9 to 7.0)
      if (val < 5.3) {
        // Strongly acidic red-rose
        return [225, 29, 72];
      }
      if (val < 5.75) {
        // Moderately acidic amber-orange
        const t = (val - 5.3) / 0.45;
        return [
          Math.round(234 - t * 25),
          Math.round(88 + t * 90),
          Math.round(12 + t * 25),
        ];
      }
      if (val <= 6.5) {
        // Optimal weakly acidic to neutral emerald-teal
        const t = (val - 5.75) / 0.75;
        return [
          Math.round(20 - t * 4),
          Math.round(184 + t * 10),
          Math.round(120 + t * 46),
        ];
      }
      // Slightly alkaline / saline-silt purple-blue
      return [99, 102, 241];
    }

    // mode === "drought_spi" (-1.8 to +0.5)
    if (val <= -1.4) {
      return [220, 38, 38]; // Severe drought red
    }
    if (val <= -0.95) {
      const t = (val - -1.4) / 0.45;
      return [
        Math.round(220 + t * 25),
        Math.round(38 + t * 120),
        Math.round(38 - t * 27),
      ];
    }
    const t = Math.min(1, (val - -0.95) / 1.3);
    return [
      Math.round(245 - t * 229),
      Math.round(158 + t * 27),
      Math.round(11 + t * 118),
    ];
  };

  for (let py = 0; py < height; py++) {
    const lat = maxLat - (py / (height - 1)) * (maxLat - minLat);
    for (let px = 0; px < width; px++) {
      const lon = minLon + (px / (width - 1)) * (maxLon - minLon);

      let weightedSum = 0;
      let weightTotal = 0;
      let minDistDeg = Infinity;
      const seriesVotes: Record<string, number> = {};

      for (let i = 0; i < stations.length; i++) {
        const st = stations[i];
        const dLat = lat - st.district.lat;
        const dLon = (lon - st.district.lon) * 0.96; // Cosine latitude correction
        const distSq = dLat * dLat + dLon * dLon;
        const dist = Math.sqrt(distSq);
        if (dist < minDistDeg) {
          minDistDeg = dist;
        }

        const w = 1 / Math.pow(distSq + 0.0032, 1.35);

        if (mode === "soil_series") {
          const sKey = resolveSoilSeriesKeyForDistrict(st.district.nameTh);
          seriesVotes[sKey] = (seriesVotes[sKey] || 0) + w;
        } else {
          const soilProfile = getDistrictSoilProfile(st.district.id);
          const metricVal =
            mode === "soil_moisture"
              ? st.soilMoisturePct
              : mode === "rainfall_intensity" || mode === "rain_prob"
              ? (st.rain24hMm * 1.5 + st.rainProbPct * 0.45)
              : mode === "humidity_heatmap"
              ? st.relativeHumidityPct
              : mode === "soil_ph_npk"
              ? soilProfile.soilPh
              : st.spi30d;

          weightedSum += metricVal * w;
          weightTotal += w;
        }
      }

      const idx = (py * width + px) * 4;

      // Softly fade out pixels far outside the 32-district hull (> ~32km from nearest Korat station)
      if (minDistDeg > 0.34) {
        data[idx + 3] = 0;
        continue;
      }

      const edgeFade =
        minDistDeg > 0.22 ? Math.max(0, 1 - (minDistDeg - 0.22) / 0.12) : 1;

      if (mode === "soil_series") {
        let maxV = -1;
        let dominantKey = "KORAT_SANDY_LOAM";
        for (const k in seriesVotes) {
          if (seriesVotes[k] > maxV) {
            maxV = seriesVotes[k];
            dominantKey = k;
          }
        }
        const sMeta =
          SOIL_SERIES_METADATA[dominantKey] ||
          SOIL_SERIES_METADATA.KORAT_SANDY_LOAM;
        const [r, g, b] = sMeta.rgb;

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.round(205 * edgeFade);
      } else {
        const interpolatedVal = weightedSum / (weightTotal || 1);
        const [r, g, b] = getRgbForValue(interpolatedVal);

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.round(195 * edgeFade);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

export const KoratLeafletMap: React.FC<KoratLeafletMapProps> = ({
  selectedDistrict,
  onSelectDistrict,
  plots,
  onAddPlotPin,
  activeOverlayMode,
  onChangeOverlayMode,
  liveStationOverride,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatmapOverlayRef = useRef<L.ImageOverlay | null>(null);
  const overlayLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const draftMarkerRef = useRef<L.Marker | null>(null);

  const [baseMapType, setBaseMapType] = useState<
    "dark_meteo" | "osm" | "satellite" | "topo"
  >("topo");
  const [showMoistureHeatmap, setShowMoistureHeatmap] = useState<boolean>(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.42);
  const [showWeatherStations, setShowWeatherStations] = useState<boolean>(true);
  const [showPlotPins, setShowPlotPins] = useState<boolean>(true);
  const [showDamMarkers, setShowDamMarkers] = useState<boolean>(true);
  const [showIrrigationCanals, setShowIrrigationCanals] =
    useState<boolean>(true);
  const [showSoilPhNutrientLayer, setShowSoilPhNutrientLayer] =
    useState<boolean>(true);
  const [soilSubMetric, setSoilSubMetric] =
    useState<SoilOverlaySubMetric>("ph");
  const [soilDbFilter, setSoilDbFilter] = useState<
    "all" | "acidic" | "low_n" | "low_p" | "low_k"
  >("all");
  const [showLogisticsFinder, setShowLogisticsFinder] = useState<boolean>(true);
  const [logisticsTypeFilter, setLogisticsTypeFilter] = useState<
    "all" | "coop_transport" | "heavy_fuel"
  >("all");
  const [focusedLogisticsHub, setFocusedLogisticsHub] =
    useState<SouthernLogisticsHub>(KORAT_SOUTHERN_LOGISTICS_HUBS[0]);

  const { isDark } = useTheme();
  const [showDistrictBoundaries, setShowDistrictBoundaries] = useState<boolean>(true);
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(9);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Right-hand inspector tab: "stations" (32 Weather Stations), "soil_db" (Soil pH & NPK Database), "plots" (Farm Plots), or "logistics" (Southern Logistics & Fuel)
  const [inspectorTab, setInspectorTab] = useState<
    "stations" | "soil_db" | "plots" | "logistics"
  >("stations");
  const [stationSearch, setStationSearch] = useState<string>("");

  // Interactive Click-to-Pin state
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const [draftCoords, setDraftCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [newFarmerName, setNewFarmerName] = useState<string>("นายวีระพงษ์ โคราชเกษตร");
  const [newCropName, setNewCropName] = useState<string>("มันสำปะหลัง (พันธุ์อิทธิ 1)");
  const [newCropCategory, setNewCropCategory] = useState<"rice" | "field_crop" | "orchard">(
    "field_crop"
  );
  const [newAreaRai, setNewAreaRai] = useState<number>(15);
  const [focusedPlot, setFocusedPlot] = useState<KoratGeoPlotPin | null>(plots[0] || null);

  // Map Snapshot Export & Messaging Share State
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [isExportingMap, setIsExportingMap] = useState<boolean>(false);
  const [copyStatusText, setCopyStatusText] = useState<string>("");

  // Build real-time telemetry for all 32 Weather Stations across Nakhon Ratchasima
  const weatherStations: WeatherStationTelemetry[] = useMemo(() => {
    const windDirections = [
      "ตะวันออกเฉียงเหนือ",
      "ตะวันออก",
      "ตะวันออกเฉียงใต้",
      "ตะวันตกเฉียงใต้",
    ];

    return KORAT_DISTRICTS.map((dist, idx) => {
      const isOverridden = liveStationOverride?.districtId === dist.id;
      const rainProbPct = isOverridden
        ? liveStationOverride?.rainProbPct ?? dist.rainProbToday
        : dist.rainProbToday;
      const spi30d = isOverridden
        ? liveStationOverride?.spi30d ?? dist.spi30d
        : dist.spi30d;
      const tempMax = isOverridden
        ? liveStationOverride?.tempMaxC ?? dist.maxTempC
        : dist.maxTempC;
      const tempMin = isOverridden
        ? liveStationOverride?.tempMinC ?? dist.minTempC
        : dist.minTempC;
      const tempCurrentC = isOverridden
        ? liveStationOverride?.tempCurrentC ??
          Number(((tempMax * 0.58 + tempMin * 0.42)).toFixed(1))
        : Number(((dist.maxTempC * 0.58 + dist.minTempC * 0.42)).toFixed(1));

      const soilMoisturePct =
        isOverridden && liveStationOverride?.soilMoisturePct !== undefined
          ? liveStationOverride.soilMoisturePct
          : dist.gistdaSoilMoisturePct;
      const relativeHumidityPct =
        isOverridden && liveStationOverride?.relativeHumidityPct !== undefined
          ? liveStationOverride.relativeHumidityPct
          : Math.min(
              94,
              Math.max(46, Math.round(soilMoisturePct * 0.85 + rainProbPct * 0.38))
            );
      const soilTempC = Number((tempCurrentC - 2.4).toFixed(1));
      const windSpeedKmh = isOverridden
        ? liveStationOverride?.windSpeedKmh ?? 14 + (idx % 9)
        : 12 + ((idx * 3) % 14);
      const rain24hMm = isOverridden
        ? liveStationOverride?.rain24hMm ??
          Number((dist.forecastRain14dMm / 11.5).toFixed(1))
        : Number(((dist.forecastRain14dMm / 12) * (rainProbPct / 55)).toFixed(1));
      const et0MmDay = isOverridden
        ? liveStationOverride?.et0Mm ?? Number((3.8 + (tempMax - 30) * 0.22).toFixed(1))
        : Number((3.8 + (dist.maxTempC - 30) * 0.22).toFixed(1));

      const moistureStatus: WeatherStationTelemetry["moistureStatus"] =
        soilMoisturePct < 28
          ? "วิกฤตดินแห้งแล้ง"
          : soilMoisturePct < 40
          ? "เฝ้าระวังดินแห้ง"
          : "ชื้นเหมาะสม";

      return {
        stationCode: `AWS-NMA-${String(idx + 1).padStart(2, "0")}`,
        district: dist,
        tempCurrentC,
        relativeHumidityPct,
        soilMoisturePct,
        soilTempC,
        windSpeedKmh,
        windDirLabel: windDirections[idx % windDirections.length],
        pressureHpa: Number((1008.2 + ((idx % 7) - 3) * 0.4).toFixed(1)),
        rain24hMm,
        rainProbPct,
        spi30d,
        et0MmDay,
        moistureStatus,
      };
    });
  }, [liveStationOverride]);

  const activeStation = useMemo(
    () =>
      weatherStations.find((s) => s.district.id === selectedDistrict.id) ||
      weatherStations[0],
    [weatherStations, selectedDistrict.id]
  );

  const filteredStations = useMemo(() => {
    const q = stationSearch.trim().toLowerCase();
    return weatherStations.filter((st) => {
      if (!q) return true;
      return (
        st.district.nameTh.toLowerCase().includes(q) ||
        st.district.nameEn.toLowerCase().includes(q) ||
        st.stationCode.toLowerCase().includes(q) ||
        st.district.zone.toLowerCase().includes(q)
      );
    });
  }, [weatherStations, stationSearch]);

  // Helper to find closest Korat district by lat/lon
  const findNearestDistrict = (lat: number, lon: number): KoratDistrict => {
    let best = KORAT_DISTRICTS[0];
    let minDist = Infinity;
    for (const d of KORAT_DISTRICTS) {
      const distSq = Math.pow(d.lat - lat, 2) + Math.pow(d.lon - lon, 2);
      if (distSq < minDist) {
        minDist = distSq;
        best = d;
      }
    }
    return best;
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [15.02, 102.18], // Geographic center of Nakhon Ratchasima's 32 districts
      zoom: 9,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    map.on("zoomend", () => {
      setMapZoomLevel(map.getZoom());
    });

    const initialTile = TILE_LAYERS.topo;
    const tl = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      maxZoom: 18,
      crossOrigin: "anonymous",
      errorTileUrl: FALLBACK_TILE_DATA_URL,
    }).addTo(map);

    const lg = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tl;
    overlayLayerGroupRef.current = lg;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Base Map Tile switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const cfg = TILE_LAYERS[baseMapType];
    const newTl = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 18,
      crossOrigin: "anonymous",
      errorTileUrl: FALLBACK_TILE_DATA_URL,
    }).addTo(map);
    newTl.bringToBack();
    tileLayerRef.current = newTl;
  }, [baseMapType]);

  // Render continuous IDW Spatial Heatmap Layer across Korat's 32 districts
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (heatmapOverlayRef.current) {
      map.removeLayer(heatmapOverlayRef.current);
      heatmapOverlayRef.current = null;
    }

    if (showMoistureHeatmap) {
      const dataUrl = generateKoratHeatmapDataUrl(weatherStations, activeOverlayMode);
      if (dataUrl) {
        const imgOverlay = L.imageOverlay(dataUrl, KORAT_BOUNDS, {
          opacity: heatmapOpacity,
          interactive: false,
        }).addTo(map);
        heatmapOverlayRef.current = imgOverlay;
      }
    }
  }, [weatherStations, activeOverlayMode, showMoistureHeatmap, heatmapOpacity]);

  // Attach map click handler for Click-to-Pin mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isPinningMode) return;
      const lat = Number(e.latlng.lat.toFixed(5));
      const lon = Number(e.latlng.lng.toFixed(5));
      setDraftCoords({ lat, lon });
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [isPinningMode]);

  // Render draft marker when user clicks in Pinning Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (draftMarkerRef.current) {
      map.removeLayer(draftMarkerRef.current);
      draftMarkerRef.current = null;
    }

    if (draftCoords && isPinningMode) {
      const draftIcon = L.divIcon({
        className: "korat-draft-pin",
        html: `<div style="background:#0F172A;color:#34D399;border:2px solid #10B981;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;font-family:'IBM Plex Mono',monospace;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.35);">+ หมุดแปลงใหม่ (${draftCoords.lat.toFixed(3)}, ${draftCoords.lon.toFixed(3)})</div>`,
        iconSize: [180, 28],
        iconAnchor: [90, 14],
      });

      const marker = L.marker([draftCoords.lat, draftCoords.lon], {
        icon: draftIcon,
      }).addTo(map);
      draftMarkerRef.current = marker;
    }
  }, [draftCoords, isPinningMode]);

  // Fly to selected district when changed externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([selectedDistrict.lat, selectedDistrict.lon], 10, {
      duration: 0.85,
    });
  }, [selectedDistrict.id, selectedDistrict.lat, selectedDistrict.lon]);

  // Render 32 Real-Time Weather Stations, Radial Moisture Halos, Farm Plot Pins, and Dam Markers
  useEffect(() => {
    const lg = overlayLayerGroupRef.current;
    if (!lg) return;

    lg.clearLayers();

    // 0. Draw Nakhon Ratchasima Provincial Perimeter & Major River Basins (GIS Vector Layer)
    L.polygon(KORAT_PROVINCE_BOUNDARY, {
      color: "#0EA5E9",
      weight: 2,
      dashArray: "6 4",
      fillColor: "#0EA5E9",
      fillOpacity: 0.03,
      interactive: false,
    }).addTo(lg);

    KORAT_RIVER_LINES.forEach((river) => {
      L.polyline(river.coords, {
        color: "#0284C7",
        weight: 2.5,
        opacity: 0.65,
        interactive: false,
      }).addTo(lg);
    });

    // 0.5. Interactive SVG & Canvas District Boundary Polygons for Korat's 32 Districts
    if (showDistrictBoundaries) {
      KORAT_DISTRICT_POLYGONS.forEach((dp) => {
        const st = weatherStations.find((s) => s.district.id === dp.districtId);
        const isSel = dp.districtId === selectedDistrict.id;
        const isHov = dp.districtId === hoveredDistrictId;

        let polyColor = "#10B981";
        if (activeOverlayMode === "soil_moisture") {
          const val = st ? st.soilMoisturePct : 35;
          polyColor =
            val < 28
              ? "#DC2626"
              : val < 38
              ? "#F59E0B"
              : val < 50
              ? "#10B981"
              : "#0EA5E9";
        } else if (activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob") {
          const rain = st ? st.rain24hMm : 0;
          const prob = st ? st.rainProbPct : 30;
          polyColor =
            rain >= 25 || prob >= 70
              ? "#8B5CF6"
              : prob >= 50 || rain >= 10
              ? "#38BDF8"
              : prob >= 30
              ? "#10B981"
              : "#F59E0B";
        } else if (activeOverlayMode === "humidity_heatmap") {
          const rh = st ? st.relativeHumidityPct : 65;
          polyColor =
            rh >= 80
              ? "#6366F1"
              : rh >= 65
              ? "#06B6D4"
              : rh >= 50
              ? "#10B981"
              : "#F59E0B";
        } else if (activeOverlayMode === "soil_series") {
          const sMeta = getDistrictSoilSeriesMeta(dp.districtId);
          polyColor = sMeta.colorHex;
        } else if (activeOverlayMode === "soil_ph_npk") {
          const sp = getDistrictSoilProfile(dp.districtId);
          polyColor =
            sp.soilPh < 5.2
              ? "#DC2626"
              : sp.soilPh < 6.0
              ? "#F59E0B"
              : sp.soilPh <= 7.2
              ? "#10B981"
              : "#6366F1";
        } else {
          const spi = st ? st.spi30d : 0;
          polyColor =
            spi <= -1.5
              ? "#DC2626"
              : spi <= -1.0
              ? "#F59E0B"
              : "#10B981";
        }

        const poly = L.polygon(dp.polygonCoords, {
          color: isSel ? "#38BDF8" : isHov ? "#F59E0B" : polyColor,
          weight: isSel ? 3 : isHov ? 2.5 : 1.2,
          fillColor: polyColor,
          fillOpacity: isSel ? 0.35 : isHov ? 0.28 : 0.12,
          dashArray: isSel ? undefined : "3 3",
        });

        poly.on("mouseover", () => {
          setHoveredDistrictId(dp.districtId);
          poly.setStyle({
            weight: 2.8,
            color: "#F59E0B",
            fillOpacity: 0.3,
          });
        });

        poly.on("mouseout", () => {
          setHoveredDistrictId(null);
          poly.setStyle({
            weight: isSel ? 3 : 1.2,
            color: isSel ? "#38BDF8" : polyColor,
            fillOpacity: isSel ? 0.35 : 0.12,
          });
        });

        poly.on("click", () => {
          onSelectDistrict(dp.districtId);
          mapInstanceRef.current?.flyTo([dp.centroid[0], dp.centroid[1]], 10, { duration: 0.75 });
        });

        poly.bindTooltip(
          `<div style="font-family:'Anuphan',sans-serif;font-weight:700;font-size:12px;color:#0F172A;padding:2px 4px;">
            📍 ${formatDistrictName(dp.nameTh)} (${dp.nameEn})
            <div style="font-size:10px;font-weight:500;color:#64748B;">คลิกเพื่อเจาะลึกอำเภอนี้ · พิกัด [${dp.centroid[0].toFixed(2)}, ${dp.centroid[1].toFixed(2)}]</div>
          </div>`,
          { sticky: true, opacity: 0.95 }
        );

        poly.addTo(lg);

        // Key district anchor labels (เมืองนครราชสีมา, ปากช่อง, พิมาย, ฯลฯ)
        if (dp.isKeyDistrict) {
          const labelIcon = L.divIcon({
            className: "korat-district-label",
            html: `
              <div style="
                font-family:'Anuphan',sans-serif;
                font-size:10px;
                font-weight:700;
                color:${isSel ? "#38BDF8" : "#F8FAFC"};
                background:rgba(15, 23, 42, 0.85);
                border:1px solid ${isSel ? "#38BDF8" : "rgba(148, 163, 184, 0.45)"};
                border-radius:6px;
                padding:2px 6px;
                white-space:nowrap;
                pointer-events:none;
                box-shadow:0 2px 6px rgba(0,0,0,0.45);
              ">
                ${dp.nameTh.replace(/^อำเภอ/, "")}
              </div>
            `,
            iconSize: [88, 20],
            iconAnchor: [44, 10],
          });
          L.marker(dp.centroid, { icon: labelIcon, interactive: false }).addTo(lg);
        }
      });
    }

    // 1. Subtle Radial Heatmap Contours around each of the 32 stations
    if (showMoistureHeatmap) {
      weatherStations.forEach((st) => {
        const dist = st.district;
        const isSelected = dist.id === selectedDistrict.id;

        let zoneColor = "#10B981";
        if (activeOverlayMode === "soil_moisture") {
          zoneColor =
            st.soilMoisturePct < 28
              ? "#DC2626"
              : st.soilMoisturePct < 38
              ? "#F59E0B"
              : st.soilMoisturePct < 50
              ? "#10B981"
              : "#0EA5E9";
        } else if (activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob") {
          zoneColor =
            st.rain24hMm >= 25 || st.rainProbPct >= 70
              ? "#8B5CF6"
              : st.rainProbPct >= 50 || st.rain24hMm >= 10
              ? "#38BDF8"
              : st.rainProbPct >= 30
              ? "#10B981"
              : "#F59E0B";
        } else if (activeOverlayMode === "humidity_heatmap") {
          zoneColor =
            st.relativeHumidityPct >= 80
              ? "#6366F1"
              : st.relativeHumidityPct >= 65
              ? "#06B6D4"
              : st.relativeHumidityPct >= 50
              ? "#10B981"
              : "#F59E0B";
        } else if (activeOverlayMode === "soil_series") {
          const sMeta = getDistrictSoilSeriesMeta(dist.id);
          zoneColor = sMeta.colorHex;
        } else if (activeOverlayMode === "soil_ph_npk") {
          zoneColor = "#8B5CF6";
        } else {
          zoneColor =
            st.spi30d <= -1.5
              ? "#DC2626"
              : st.spi30d <= -1.0
              ? "#F59E0B"
              : "#10B981";
        }

        const circle = L.circle([dist.lat, dist.lon], {
          radius: isSelected ? 12500 : 10500,
          color: zoneColor,
          weight: isSelected ? 2.5 : 1,
          fillColor: zoneColor,
          fillOpacity: isSelected ? 0.22 : 0.1,
          dashArray: isSelected ? undefined : "3 4",
        });

        circle.on("click", () => {
          onSelectDistrict(dist.id);
        });

        circle.addTo(lg);
      });
    }

    // 2. Real-Time Automatic Weather Stations (32 Stations across Korat)
    if (showWeatherStations) {
      weatherStations.forEach((st) => {
        const dist = st.district;
        const isSelected = dist.id === selectedDistrict.id;

        let statusColor = "#10B981";
        let metricBadge = `💧 ${st.soilMoisturePct}% · ${st.tempCurrentC}°`;

        if (activeOverlayMode === "soil_moisture") {
          metricBadge = `💧 ${st.soilMoisturePct}% · ${st.tempCurrentC}°`;
          statusColor =
            st.soilMoisturePct < 28
              ? "#EF4444"
              : st.soilMoisturePct < 38
              ? "#F59E0B"
              : st.soilMoisturePct >= 50
              ? "#38BDF8"
              : "#10B981";
        } else if (activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob") {
          metricBadge = `🌧️ ${st.rainProbPct}% · ${st.rain24hMm}มม.`;
          statusColor =
            st.rain24hMm >= 25 || st.rainProbPct >= 70
              ? "#8B5CF6"
              : st.rainProbPct >= 50
              ? "#38BDF8"
              : st.rainProbPct >= 30
              ? "#10B981"
              : "#F59E0B";
        } else if (activeOverlayMode === "humidity_heatmap") {
          metricBadge = `💨 RH ${st.relativeHumidityPct}% · ${st.tempCurrentC}°`;
          statusColor =
            st.relativeHumidityPct >= 80
              ? "#6366F1"
              : st.relativeHumidityPct >= 65
              ? "#06B6D4"
              : st.relativeHumidityPct >= 50
              ? "#10B981"
              : "#F59E0B";
        } else if (activeOverlayMode === "soil_series") {
          const sMeta = getDistrictSoilSeriesMeta(dist.id);
          const rawName = sMeta.nameTh.replace(/ชุดดิน/, "").split(" ")[0].trim();
          metricBadge = `🌱 ${sMeta.code} · ${rawName}`;
          statusColor = sMeta.colorHex;
        } else if (activeOverlayMode === "soil_ph_npk") {
          const sp = getDistrictSoilProfile(dist.id);
          metricBadge = `🧪 pH ${sp.soilPh}`;
          statusColor = "#8B5CF6";
        } else {
          metricBadge = `SPI ${st.spi30d > 0 ? `+${st.spi30d}` : st.spi30d}`;
          statusColor =
            st.spi30d <= -1.5
              ? "#EF4444"
              : st.spi30d <= -1.0
              ? "#F59E0B"
              : "#10B981";
        }

        const shortName = dist.nameTh.replace(/^อ\./, "");

        const stationIcon = L.divIcon({
          className: "korat-aws-station-marker",
          html: `
            <div style="
              display:inline-flex;
              align-items:center;
              gap:5px;
              background:${isSelected ? "#0F172A" : "rgba(15, 23, 42, 0.88)"};
              color:#FFFFFF;
              border:${isSelected ? "2px solid #38BDF8" : `1.5px solid ${statusColor}`};
              border-radius:8px;
              padding:${isSelected ? "3px 8px" : "2px 6px"};
              font-size:${isSelected ? "11px" : "10px"};
              font-weight:600;
              white-space:nowrap;
              box-shadow:${
                isSelected
                  ? "0 0 0 3px rgba(56, 189, 248, 0.35), 0 4px 12px rgba(0,0,0,0.45)"
                  : "0 2px 6px rgba(0,0,0,0.35)"
              };
              transform:${isSelected ? "scale(1.06)" : "scale(1)"};
            ">
              <span style="width:7px;height:7px;border-radius:9999px;background:${statusColor};display:inline-block;box-shadow:0 0 6px ${statusColor};"></span>
              <span style="font-family:'Anuphan',sans-serif;color:${
                isSelected ? "#38BDF8" : "#F8FAFC"
              };">${shortName}</span>
              <span style="font-family:'IBM Plex Mono',monospace;color:#E2E8F0;font-weight:700;">${metricBadge}</span>
            </div>
          `,
          iconSize: [136, 24],
          iconAnchor: [68, 12],
        });

        const stationMarker = L.marker([dist.lat, dist.lon], {
          icon: stationIcon,
          zIndexOffset: isSelected ? 1000 : 200,
        });

        stationMarker.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:255px;line-height:1.45;color:#0F172A;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-family:'IBM Plex Mono',monospace;color:#0369A1;font-weight:700;">
              <span>📡 ${st.stationCode}</span>
              <span>${dist.lat.toFixed(3)}°N, ${dist.lon.toFixed(3)}°E</span>
            </div>
            <div style="font-weight:700;font-size:15px;color:#0F172A;margin-top:2px;">
              สถานีอุตุนิยมวิทยา ${dist.nameTh}
            </div>
            <div style="font-size:11px;color:#64748B;">${dist.zone} · สถานะความชื้น: <strong style="color:${statusColor};">${st.moistureStatus}</strong></div>
            <hr style="margin:7px 0;border-color:#E2E8F0;" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;font-family:'IBM Plex Mono',monospace;background:#F8FAFC;padding:7px;border-radius:6px;border:1px solid #E2E8F0;">
              <div>💧 ความชื้นดิน: <strong>${st.soilMoisturePct}%</strong></div>
              <div>🌡️ อุณหภูมิ: <strong>${st.tempCurrentC}°C</strong></div>
              <div>🌧️ โอกาสฝน: <strong>${st.rainProbPct}%</strong></div>
              <div>💦 ฝน 24 ชม.: <strong>${st.rain24hMm} มม.</strong></div>
              <div>💨 ความชื้นอากาศ: <strong>${st.relativeHumidityPct}%</strong></div>
              <div>🌬️ ลม: <strong>${st.windSpeedKmh} กม./ชม.</strong></div>
              <div>📉 SPI-30 วัน: <strong>${st.spi30d}</strong></div>
              <div>☀️ การคายน้ำ ET₀: <strong>${st.et0MmDay} มม.</strong></div>
            </div>
            <div style="font-size:11px;color:#334155;margin-top:6px;">
              <strong>ชุดดิน:</strong> ${dist.soilSeriesName}<br/>
              <strong>พืชหลัก:</strong> ${dist.primaryCrops.join(", ")}
            </div>
          </div>
        `);

        stationMarker.on("click", () => {
          onSelectDistrict(dist.id);
          setInspectorTab("stations");
        });

        stationMarker.addTo(lg);
      });
    }

    // 3. Agricultural Plot Pins & Plot Boundary Polygons
    if (showPlotPins) {
      plots.forEach((plot) => {
        const pinColor =
          plot.droughtStatus === "วิกฤตแล้งรุนแรง"
            ? "#DC2626"
            : plot.droughtStatus === "เฝ้าระวังฝนทิ้งช่วง"
            ? "#D97706"
            : "#059669";

        const dLat = 0.0042;
        const dLon = 0.0048;
        const polygon = L.polygon(
          [
            [plot.lat - dLat, plot.lon - dLon],
            [plot.lat + dLat, plot.lon - dLon],
            [plot.lat + dLat, plot.lon + dLon],
            [plot.lat - dLat, plot.lon + dLon],
          ],
          {
            color: pinColor,
            weight: 2,
            fillColor: pinColor,
            fillOpacity: 0.35,
          }
        );
        polygon.addTo(lg);

        const plotPinIcon = L.divIcon({
          className: "korat-plot-pin",
          html: `
            <div style="display:flex;align-items:center;gap:4px;background:#FFFFFF;color:#0F172A;border:2px solid ${pinColor};border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 3px 8px rgba(15,23,42,0.35);">
              <span style="width:7px;height:7px;border-radius:2px;background:${pinColor};display:inline-block;"></span>
              <span style="font-family:'IBM Plex Mono',monospace;">${plot.plotCode}</span>
              <span style="color:#475569;font-weight:500;">(${plot.areaRai} ไร่)</span>
            </div>
          `,
          iconSize: [130, 24],
          iconAnchor: [65, -8],
        });

        const marker = L.marker([plot.lat, plot.lon], {
          icon: plotPinIcon,
          zIndexOffset: 500,
        });

        marker.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:240px;line-height:1.5;">
            <div style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:#64748B;">${plot.plotCode} · ${plot.updatedAt}</div>
            <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:2px;">${plot.cropName}</div>
            <div style="font-size:12px;color:#334155;">เกษตรกร: <strong>${plot.farmerName}</strong> (${plot.subdistrictTh} ${plot.districtNameTh})</div>
            <hr style="margin:6px 0;border-color:#E2E8F0;" />
            <div style="font-size:12px;font-family:'IBM Plex Mono',monospace;">
              • พื้นที่แปลง: <strong>${plot.areaRai} ไร่</strong><br/>
              • ความชื้นดิน: <strong>${plot.soilMoisturePct}%</strong> · SPI: <strong>${plot.spi30d}</strong><br/>
              • ดัชนีความสมบูรณ์พืช NDVI: <strong>${plot.ndviHealthScore.toFixed(2)}</strong><br/>
              • พิกัด: ${plot.lat.toFixed(4)}°N, ${plot.lon.toFixed(4)}°E
            </div>
            <div style="margin-top:6px;padding:5px 8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;font-size:11px;color:#0F172A;">
              <strong>สถานะ กษ.01:</strong> ${plot.ks01Status}
              ${
                plot.estimatedKs01Baht > 0
                  ? `<br/><strong style="color:#047857;font-family:'IBM Plex Mono',monospace;">วงเงินชดเชยประเมิน: ฿${plot.estimatedKs01Baht.toLocaleString("th-TH")}</strong>`
                  : ""
              }
            </div>
          </div>
        `);

        marker.on("click", () => {
          setFocusedPlot(plot);
          setInspectorTab("plots");
        });

        marker.addTo(lg);
      });
    }

    // 4. Major Korat Dams Geo Markers
    if (showDamMarkers) {
      KORAT_DAM_GEO_MARKERS.forEach((dam) => {
        const damIcon = L.divIcon({
          className: "korat-dam-pin",
          html: `
            <div style="background:#0284C7;color:#FFFFFF;border:2px solid #FFFFFF;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35);">
              💧 ${dam.nameTh} (${dam.usablePercent}%)
            </div>
          `,
          iconSize: [135, 22],
          iconAnchor: [67, 11],
        });

        const damMarker = L.marker([dam.lat, dam.lon], {
          icon: damIcon,
          zIndexOffset: 600,
        });
        damMarker.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:200px;line-height:1.45;">
            <div style="font-weight:700;font-size:13px;color:#0369A1;">${dam.nameTh} (${dam.districtTh})</div>
            <div style="font-size:12px;margin-top:4px;font-family:'IBM Plex Mono',monospace;">
              • น้ำใช้การได้จริง: <strong>${dam.usableWaterMillionM3} ล้าน ลบ.ม. (${dam.usablePercent}%)</strong><br/>
              • ความจุเก็บกักรวม: ${dam.capacityMillionM3} ล้าน ลบ.ม.
            </div>
            <div style="font-size:11px;color:#475569;margin-top:4px;">สถานะ: <strong>${dam.statusLabel}</strong></div>
          </div>
        `);
        damMarker.addTo(lg);
      });
    }

    // 5. Southern Korat Logistics & Transport Finder Layer (Coop Transport Hubs & Heavy Machinery Fuel Stations)
    if (showLogisticsFinder) {
      KORAT_SOUTHERN_LOGISTICS_HUBS.filter(
        (hub) => logisticsTypeFilter === "all" || hub.type === logisticsTypeFilter
      ).forEach((hub) => {
        const isCoop = hub.type === "coop_transport";
        const isFocused = focusedLogisticsHub?.id === hub.id;
        const badgeBg = isCoop ? "#F59E0B" : "#38BDF8";
        const badgeText = "#041E1C";
        const iconEmoji = isCoop ? "🚛" : "⛽";

        const hubIcon = L.divIcon({
          className: "korat-logistics-pin",
          html: `
            <div style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              background:${badgeBg};
              color:${badgeText};
              border:${isFocused ? "2.5px solid #FFFFFF" : "1.5px solid #0F172A"};
              border-radius:8px;
              padding:2px 7px;
              font-size:10px;
              font-weight:800;
              font-family:'IBM Plex Mono',monospace;
              white-space:nowrap;
              box-shadow:0 3px 10px rgba(0,0,0,0.45);
            ">
              <span>${iconEmoji}</span>
              <span>${hub.code}</span>
              <span style="font-family:'Anuphan',sans-serif;font-weight:700;">${
                isCoop ? "ขนส่งสหกรณ์" : "ปั๊มเครื่องจักร"
              }</span>
            </div>
          `,
          iconSize: [148, 24],
          iconAnchor: [74, 12],
        });

        const hubMarker = L.marker([hub.lat, hub.lon], {
          icon: hubIcon,
          zIndexOffset: isFocused ? 1100 : 750,
        });

        hubMarker.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:255px;line-height:1.45;color:#0F172A;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-family:'IBM Plex Mono',monospace;color:#B45309;font-weight:700;">
              <span>${iconEmoji} ${hub.code} · ${hub.typeLabelTh}</span>
              <span>${hub.districtNameTh}</span>
            </div>
            <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:2px;">
              ${hub.nameTh}
            </div>
            <div style="font-size:11px;color:#475569;margin-top:2px;">
              เส้นทาง: <strong>${hub.highwayCorridor}</strong>
            </div>
            <hr style="margin:6px 0;border-color:#E2E8F0;" />
            <div style="font-size:11.5px;color:#1E293B;line-height:1.5;">
              • <strong>รองรับเครื่องจักรกลหนัก:</strong> ${hub.heavyMachinerySpec}<br/>
              • <strong>บริการหลัก:</strong> ${hub.fuelOrColdChainDetail}<br/>
              • <strong>พิกัดตาชั่ง:</strong> ${hub.weighbridgeTons} ตัน · <strong>เวลาเปิด:</strong> ${hub.operatingHours}<br/>
              • <strong style="color:#047857;">สิทธิสมาชิกสหกรณ์:</strong> ${hub.coopMemberBenefit}
            </div>
          </div>
        `);

        hubMarker.on("click", () => {
          setFocusedLogisticsHub(hub);
          setInspectorTab("logistics");
          onSelectDistrict(hub.districtId);
        });

        hubMarker.addTo(lg);
      });
    }

    // 6. Irrigation Zone Management Overlay: Canals & Water Source / Pumping Gate Nodes
    if (showIrrigationCanals) {
      KORAT_IRRIGATION_CANALS.forEach((canal) => {
        // Outer glow line for canal corridor
        L.polyline(canal.coords, {
          color: canal.colorHex,
          weight: 7,
          opacity: 0.25,
          interactive: false,
        }).addTo(lg);

        // Main canal polyline
        const canalLine = L.polyline(canal.coords, {
          color: canal.colorHex,
          weight: 3.5,
          opacity: 0.92,
          dashArray:
            canal.status === "เฝ้าระวังระดับน้ำต่ำ-สูบเสริม" ? "8 5" : undefined,
        });

        canalLine.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:250px;line-height:1.45;color:#0F172A;">
            <div style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:#0284C7;font-weight:700;">
              🌊 ${canal.code} · ${canal.basinNameTh}
            </div>
            <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:2px;">
              ${canal.nameTh}
            </div>
            <div style="font-size:11px;color:#475569;margin-top:2px;">
              แหล่งน้ำต้นทุน: <strong>${canal.sourceDamOrRiverTh}</strong> (${canal.lengthKm} กม.)
            </div>
            <hr style="margin:6px 0;border-color:#E2E8F0;" />
            <div style="font-size:11.5px;color:#1E293B;line-height:1.5;">
              • <strong>อัตราการไหลปัจจุบัน:</strong> ${canal.currentFlowM3s} / ${canal.maxFlowM3s} ลบ.ม./วินาที (ระดับน้ำ ${canal.waterLevelPct}%)<br/>
              • <strong>พื้นที่รับน้ำ:</strong> ${canal.districtsCoveredTh}<br/>
              • <strong>รอบเวรส่งน้ำ:</strong> ${canal.rotationScheduleTh}<br/>
              • <strong>สถานะ:</strong> <span style="color:#0369A1;font-weight:700;">${canal.status}</span>
            </div>
          </div>
        `);

        canalLine.addTo(lg);
      });

      KORAT_WATER_SOURCE_NODES.forEach((node) => {
        const nodeBg =
          node.coordinationStatus === "พร้อมจ่ายน้ำ"
            ? "#0EA5E9"
            : node.coordinationStatus === "สลับรอบเวรต้นน้ำ-ปลายน้ำ"
            ? "#14B8A6"
            : "#F59E0B";

        const nodeIcon = L.divIcon({
          className: "korat-irrigation-node-pin",
          html: `
            <div style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              background:#080C16;
              color:#F8FAFC;
              border:2px solid ${nodeBg};
              border-radius:8px;
              padding:2px 7px;
              font-size:10px;
              font-weight:700;
              font-family:'IBM Plex Mono',monospace;
              white-space:nowrap;
              box-shadow:0 3px 10px rgba(0,0,0,0.45);
            ">
              <span style="color:${nodeBg};">🚰</span>
              <span>${node.code}</span>
              <span style="color:#38BDF8;">${node.usablePct}%</span>
            </div>
          `,
          iconSize: [120, 22],
          iconAnchor: [60, 11],
        });

        const nodeMarker = L.marker([node.lat, node.lon], {
          icon: nodeIcon,
          zIndexOffset: 720,
        });

        nodeMarker.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:250px;line-height:1.45;color:#0F172A;">
            <div style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:#0284C7;font-weight:700;">
              🚰 ${node.code} · ${node.sourceTypeLabelTh}
            </div>
            <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:2px;">
              ${node.nameTh} (${node.districtNameTh})
            </div>
            <hr style="margin:6px 0;border-color:#E2E8F0;" />
            <div style="font-size:11.5px;color:#1E293B;line-height:1.5;">
              • <strong>ความจุ/กำลังส่ง:</strong> ${node.storageOrCapacityText}<br/>
              • <strong>โควตาจัดสรรน้ำ:</strong> ${node.dailyQuotaM3PerRai} ลบ.ม./ไร่/วัน<br/>
              • <strong>ตารางรอบเวรสูบน้ำ:</strong> ${node.rotationSlotText}<br/>
              • <strong>กลุ่มผู้ใช้น้ำ:</strong> ${node.userGroupNameTh} (${node.activeFarmersCount} ราย)
            </div>
          </div>
        `);

        nodeMarker.on("click", () => {
          onSelectDistrict(node.districtId);
        });

        nodeMarker.addTo(lg);
      });
    }

    // 7. Interactive Soil pH & Nutrient Deficiency Overlay by District (Pulling from Korat Soil-Type Database)
    if (showSoilPhNutrientLayer || activeOverlayMode === "soil_ph_npk") {
      KORAT_DISTRICT_SOIL_PROFILES.forEach((profile) => {
        const isSelected = profile.districtId === selectedDistrict.id;

        // Determine color and badge text based on selected soilSubMetric
        let badgeColor = "#14B8A6";
        let metricShortText = `pH ${profile.soilPh.toFixed(1)}`;
        let subStatusText = profile.primaryDeficientNutrients[0] || "สมดุล";

        if (soilSubMetric === "ph") {
          badgeColor =
            profile.soilPh < 5.3
              ? "#F43F5E"
              : profile.soilPh <= 5.7
              ? "#F59E0B"
              : profile.soilPh <= 6.5
              ? "#10B981"
              : "#818CF8";
          metricShortText = `pH ${profile.soilPh.toFixed(1)}`;
        } else if (soilSubMetric === "npk_deficiency") {
          badgeColor =
            profile.overallDeficiencyScore >= 65
              ? "#F43F5E"
              : profile.overallDeficiencyScore >= 40
              ? "#F59E0B"
              : "#10B981";
          metricShortText = `พร่อง ${profile.overallDeficiencyScore}%`;
        } else if (soilSubMetric === "n_om") {
          badgeColor =
            profile.organicMatterPct < 0.95
              ? "#F43F5E"
              : profile.organicMatterPct < 1.65
              ? "#F59E0B"
              : "#10B981";
          metricShortText = `OM ${profile.organicMatterPct.toFixed(2)}%`;
          subStatusText = profile.nDeficiencyLevel;
        } else if (soilSubMetric === "p_avail") {
          badgeColor =
            profile.availablePPpm < 7.0
              ? "#F43F5E"
              : profile.availablePPpm < 11.5
              ? "#F59E0B"
              : "#10B981";
          metricShortText = `P ${profile.availablePPpm}ppm`;
          subStatusText = profile.pDeficiencyLevel;
        } else {
          badgeColor =
            profile.exchangeableKPpm < 45
              ? "#F43F5E"
              : profile.exchangeableKPpm < 80
              ? "#F59E0B"
              : "#10B981";
          metricShortText = `K ${profile.exchangeableKPpm}ppm`;
          subStatusText = profile.kDeficiencyLevel;
        }

        // Draw Soil Series Polygon / Zone Ring around district center
        const soilZoneCircle = L.circle([profile.lat, profile.lon], {
          radius: isSelected ? 9200 : 7400,
          color: badgeColor,
          weight: isSelected ? 2.5 : 1.5,
          fillColor: badgeColor,
          fillOpacity: isSelected ? 0.24 : 0.12,
          dashArray: "4 4",
        });

        soilZoneCircle.on("click", () => {
          onSelectDistrict(profile.districtId);
          setInspectorTab("soil_db");
        });
        soilZoneCircle.addTo(lg);

        // Offset slightly south of AWS marker so both can be read cleanly
        const badgeLat = profile.lat - 0.036;
        const badgeLon = profile.lon;

        const soilBadgeIcon = L.divIcon({
          className: "korat-soil-ph-npk-pin",
          html: `
            <div style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              background:${isSelected ? "#0F172A" : "rgba(8, 12, 22, 0.92)"};
              color:#F8FAFC;
              border:${isSelected ? "2px solid #FBBF24" : `1.5px solid ${badgeColor}`};
              border-radius:7px;
              padding:1.5px 6px;
              font-size:9.5px;
              font-weight:700;
              font-family:'IBM Plex Mono',monospace;
              white-space:nowrap;
              box-shadow:0 2px 8px rgba(0,0,0,0.45);
            ">
              <span style="color:${badgeColor};">🧪</span>
              <span style="color:${badgeColor};font-weight:800;">${metricShortText}</span>
              <span style="color:#CBD5E1;font-family:'Anuphan',sans-serif;font-weight:600;">· ${subStatusText}</span>
            </div>
          `,
          iconSize: [142, 20],
          iconAnchor: [71, 10],
        });

        const soilMarker = L.marker([badgeLat, badgeLon], {
          icon: soilBadgeIcon,
          zIndexOffset: isSelected ? 950 : 420,
        });

        soilMarker.bindPopup(`
          <div style="font-family:'Anuphan',sans-serif;min-width:275px;line-height:1.45;color:#0F172A;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-family:'IBM Plex Mono',monospace;color:#0F766E;font-weight:700;">
              <span>🧪 ฐานข้อมูลดินและปุ๋ยสั่งตัดรายอำเภอ</span>
              <span>pH ${profile.soilPh.toFixed(1)}</span>
            </div>
            <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:2px;">
              ${profile.districtNameTh} · ${profile.soilSeries.seriesNameTh}
            </div>
            <div style="font-size:11px;color:#475569;">
              เนื้อดิน: <strong>${profile.soilSeries.soilTextureTh}</strong> · CEC ${profile.soilSeries.cecCmolKg} cmol/kg
            </div>
            <hr style="margin:6px 0;border-color:#E2E8F0;" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:11.5px;font-family:'IBM Plex Mono',monospace;background:#F8FAFC;padding:6px;border-radius:6px;border:1px solid #E2E8F0;">
              <div>🧪 pH ดิน: <strong style="color:${badgeColor};">${profile.soilPh.toFixed(1)}</strong></div>
              <div>🌿 OM (N): <strong>${profile.organicMatterPct}%</strong></div>
              <div>⚡ ฟอสฟอรัส P: <strong>${profile.availablePPpm} ppm</strong></div>
              <div>💎 โพแทสเซียม K: <strong>${profile.exchangeableKPpm} ppm</strong></div>
            </div>
            <div style="font-size:11.5px;color:#1E293B;margin-top:6px;line-height:1.5;">
              • <strong>สถานะความพร่องธาตุ:</strong> <span style="color:#B91C1C;font-weight:700;">${profile.primaryDeficientNutrients.join(", ")}</span><br/>
              • <strong>ปูนโดโลไมท์ปรับ pH:</strong> ${
                profile.limeDolomiteKgPerRai > 0
                  ? `${profile.limeDolomiteKgPerRai} กก./ไร่`
                  : "ไม่ต้องใส่ปูน (pH เหมาะสม)"
              }<br/>
              • <strong style="color:#047857;">แม่ปุ๋ยสั่งตัดแนะนำ (กก./ไร่):</strong> ยูเรีย (46-0-0) <strong>${profile.fertilizerPlan.urea46_0_0KgPerRai}</strong> · DAP (18-46-0) <strong>${profile.fertilizerPlan.dap18_46_0KgPerRai}</strong> · โพแทช (0-0-60) <strong>${profile.fertilizerPlan.mop0_0_60KgPerRai}</strong>
            </div>
          </div>
        `);

        soilMarker.on("click", () => {
          onSelectDistrict(profile.districtId);
          setInspectorTab("soil_db");
        });

        soilMarker.addTo(lg);
      });
    }
  }, [
    activeOverlayMode,
    focusedLogisticsHub?.id,
    logisticsTypeFilter,
    onSelectDistrict,
    plots,
    selectedDistrict.id,
    showDistrictBoundaries,
    hoveredDistrictId,
    showDamMarkers,
    showIrrigationCanals,
    showLogisticsFinder,
    showMoistureHeatmap,
    showPlotPins,
    showSoilPhNutrientLayer,
    showWeatherStations,
    soilSubMetric,
    weatherStations,
  ]);

  const handleLocateMyFarmGps = () => {
    setIsPinningMode(true);
    if (!navigator.geolocation) {
      const fallbackCoords = {
        lat: Number((selectedDistrict.lat + 0.0085).toFixed(5)),
        lon: Number((selectedDistrict.lon + 0.0065).toFixed(5)),
      };
      setDraftCoords(fallbackCoords);
      mapInstanceRef.current?.flyTo([fallbackCoords.lat, fallbackCoords.lon], 13, {
        duration: 0.8,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lon: Number(pos.coords.longitude.toFixed(5)),
        };
        setDraftCoords(coords);
        mapInstanceRef.current?.flyTo([coords.lat, coords.lon], 13, {
          duration: 0.8,
        });
      },
      () => {
        const fallbackCoords = {
          lat: Number((selectedDistrict.lat + 0.0085).toFixed(5)),
          lon: Number((selectedDistrict.lon + 0.0065).toFixed(5)),
        };
        setDraftCoords(fallbackCoords);
        mapInstanceRef.current?.flyTo([fallbackCoords.lat, fallbackCoords.lon], 13, {
          duration: 0.8,
        });
      },
      { timeout: 3500 }
    );
  };

  const handleConfirmAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    const coords = draftCoords || {
      lat: Number((selectedDistrict.lat + 0.0075).toFixed(5)),
      lon: Number((selectedDistrict.lon - 0.0055).toFixed(5)),
    };

    const nearestDist = findNearestDistrict(coords.lat, coords.lon);
    const ratePerRai =
      newCropCategory === "orchard" ? 4048 : newCropCategory === "field_crop" ? 1980 : 1340;
    const isRiskArea = nearestDist.droughtRiskLevel !== "สมดุลปกติ";
    const estimatedComp = isRiskArea ? Math.min(30, newAreaRai) * ratePerRai : 0;

    const createdPlot: KoratGeoPlotPin = {
      id: `pin-custom-${Date.now()}`,
      plotCode: `PLT-KOR-${Math.floor(100 + Math.random() * 899)}`,
      farmerName: newFarmerName.trim() || "เกษตรกรขึ้นทะเบียนใหม่",
      districtId: nearestDist.id,
      districtNameTh: nearestDist.nameTh,
      subdistrictTh: "แปลงปักหมุดพิกัดจริง",
      lat: coords.lat,
      lon: coords.lon,
      cropName: newCropName.trim() || "มันสำปะหลัง",
      cropCategory: newCropCategory,
      areaRai: newAreaRai,
      droughtStatus: nearestDist.droughtRiskLevel,
      spi30d: nearestDist.spi30d,
      soilMoisturePct: nearestDist.gistdaSoilMoisturePct,
      ndviHealthScore: nearestDist.droughtRiskLevel === "วิกฤตแล้งรุนแรง" ? 0.31 : 0.64,
      ks01Status: isRiskArea
        ? `อยู่ในโซน${nearestDist.droughtRiskLevel} · ประเมินสิทธิ กษ.01 เบื้องต้น`
        : "แปลงอยู่ในโซนสมดุลปกติ",
      estimatedKs01Baht: estimatedComp,
      updatedAt: "ปักหมุดเรียลไทม์เมื่อสักครู่",
    };

    onAddPlotPin(createdPlot);
    setFocusedPlot(createdPlot);
    setInspectorTab("plots");
    setIsPinningMode(false);
    setDraftCoords(null);
    mapInstanceRef.current?.flyTo([createdPlot.lat, createdPlot.lon], 12, {
      duration: 0.8,
    });
  };

  /**
   * Renders the current Leaflet map state (including base tiles, IDW moisture/rain/SPI heatmap,
   * 32 weather stations, dam reservoirs, and all pinned farm plots) into a high-resolution
   * shareable PNG image card for messaging apps (LINE, Messenger, WhatsApp).
   */
  const handleExportMapImage = async (autoDownload = false) => {
    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;
    if (!map || !container) return;

    setIsExportingMap(true);
    setCopyStatusText("");

    try {
      const mapRect = container.getBoundingClientRect();
      const mapW = Math.max(640, Math.round(mapRect.width));
      const mapH = Math.max(420, Math.round(mapRect.height));

      const headerH = 88;
      const footerH = 92;
      const canvasW = mapW;
      const canvasH = headerH + mapH + footerH;

      const canvas = document.createElement("canvas");
      // 2x Retina scale for crisp text on messaging apps
      const scale = 2;
      canvas.width = canvasW * scale;
      canvas.height = canvasH * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);

      // 1. Draw Map Viewport Background (matching active baseMapType)
      ctx.fillStyle =
        baseMapType === "dark_meteo"
          ? "#0B1324"
          : baseMapType === "satellite"
          ? "#0F241D"
          : "#E2E8F0";
      ctx.fillRect(0, headerH, canvasW, mapH);

      // Attempt to composite loaded CORS-safe Leaflet tile images onto the canvas
      const tileImgs = container.querySelectorAll<HTMLImageElement>(".leaflet-tile-loaded");
      tileImgs.forEach((imgEl) => {
        try {
          const imgRect = imgEl.getBoundingClientRect();
          const dx = imgRect.left - mapRect.left;
          const dy = imgRect.top - mapRect.top + headerH;
          if (
            dx + imgRect.width >= 0 &&
            dx <= canvasW &&
            dy + imgRect.height >= headerH &&
            dy <= headerH + mapH
          ) {
            ctx.drawImage(imgEl, dx, dy, imgRect.width, imgRect.height);
          }
        } catch {
          // Ignore individual tainted tile if any
        }
      });

      // Draw subtle geographic coordinate graticule lines over map area
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, headerH, canvasW, mapH);
      ctx.clip();

      ctx.strokeStyle =
        baseMapType === "osm" || baseMapType === "topo"
          ? "rgba(15, 23, 42, 0.08)"
          : "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let lat = 14.2; lat <= 15.8; lat += 0.4) {
        const pt = map.latLngToContainerPoint([lat, 102.18]);
        ctx.beginPath();
        ctx.moveTo(0, headerH + pt.y);
        ctx.lineTo(canvasW, headerH + pt.y);
        ctx.stroke();
      }
      for (let lon = 101.2; lon <= 103.2; lon += 0.4) {
        const pt = map.latLngToContainerPoint([15.02, lon]);
        ctx.beginPath();
        ctx.moveTo(pt.x, headerH);
        ctx.lineTo(pt.x, headerH + mapH);
        ctx.stroke();
      }

      // 2. Draw Active IDW Spatial Heatmap Overlay if enabled
      if (showMoistureHeatmap) {
        const heatmapDataUrl = generateKoratHeatmapDataUrl(
          weatherStations,
          activeOverlayMode
        );
        if (heatmapDataUrl) {
          await new Promise<void>((resolve) => {
            const hmImg = new Image();
            hmImg.onload = () => {
              const nw = map.latLngToContainerPoint([
                KORAT_BOUNDS[1][0],
                KORAT_BOUNDS[0][1],
              ]);
              const se = map.latLngToContainerPoint([
                KORAT_BOUNDS[0][0],
                KORAT_BOUNDS[1][1],
              ]);
              ctx.save();
              ctx.globalAlpha = heatmapOpacity;
              ctx.drawImage(
                hmImg,
                nw.x,
                headerH + nw.y,
                se.x - nw.x,
                se.y - nw.y
              );
              ctx.restore();
              resolve();
            };
            hmImg.onerror = () => resolve();
            hmImg.src = heatmapDataUrl;
          });
        }

        // Draw subtle radial district contours
        weatherStations.forEach((st) => {
          const pt = map.latLngToContainerPoint([st.district.lat, st.district.lon]);
          const isSelected = st.district.id === selectedDistrict.id;
          let zoneColor = "#10B981";
          if (activeOverlayMode === "soil_moisture") {
            zoneColor =
              st.soilMoisturePct < 28
                ? "#DC2626"
                : st.soilMoisturePct < 38
                ? "#F59E0B"
                : st.soilMoisturePct < 50
                ? "#10B981"
                : "#0EA5E9";
          } else if (activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob") {
            zoneColor =
              st.rain24hMm >= 25 || st.rainProbPct >= 70
                ? "#8B5CF6"
                : st.rainProbPct >= 50 || st.rain24hMm >= 10
                ? "#38BDF8"
                : st.rainProbPct >= 30
                ? "#10B981"
                : "#F59E0B";
          } else if (activeOverlayMode === "humidity_heatmap") {
            zoneColor =
              st.relativeHumidityPct >= 80
                ? "#6366F1"
                : st.relativeHumidityPct >= 65
                ? "#06B6D4"
                : st.relativeHumidityPct >= 50
                ? "#10B981"
                : "#F59E0B";
          } else {
            zoneColor =
              st.spi30d <= -1.5
                ? "#DC2626"
                : st.spi30d <= -1.0
                ? "#F59E0B"
                : "#10B981";
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, headerH + pt.y, isSelected ? 28 : 20, 0, Math.PI * 2);
          ctx.fillStyle = zoneColor;
          ctx.globalAlpha = isSelected ? 0.24 : 0.12;
          ctx.fill();
          ctx.globalAlpha = 0.85;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.strokeStyle = zoneColor;
          ctx.stroke();
          ctx.restore();
        });
      }

      // 3. Draw Major Dam Reservoirs if enabled
      if (showDamMarkers) {
        KORAT_DAM_GEO_MARKERS.forEach((dam) => {
          const pt = map.latLngToContainerPoint([dam.lat, dam.lon]);
          const x = pt.x;
          const y = headerH + pt.y;
          if (x < -50 || x > canvasW + 50 || y < headerH - 30 || y > headerH + mapH + 30)
            return;

          const label = `💧 ${dam.nameTh} (${dam.usablePercent}%)`;
          ctx.font = "bold 10px sans-serif";
          const tw = ctx.measureText(label).width + 14;
          ctx.fillStyle = "#0284C7";
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(x - tw / 2, y - 11, tw, 20, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, x, y - 1);
        });
      }

      // 4. Draw All 32 Weather Stations if enabled
      if (showWeatherStations) {
        weatherStations.forEach((st) => {
          const pt = map.latLngToContainerPoint([st.district.lat, st.district.lon]);
          const x = pt.x;
          const y = headerH + pt.y;
          if (x < -60 || x > canvasW + 60 || y < headerH - 25 || y > headerH + mapH + 25)
            return;

          const isSelected = st.district.id === selectedDistrict.id;
          const shortName = st.district.nameTh.replace(/^อ\./, "");
          const metricText =
            activeOverlayMode === "soil_moisture"
              ? `${st.soilMoisturePct}% · ${st.tempCurrentC}°`
              : activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
              ? `ฝน ${st.rainProbPct}% · ${st.rain24hMm}มม.`
              : activeOverlayMode === "humidity_heatmap"
              ? `RH ${st.relativeHumidityPct}%`
              : `SPI ${st.spi30d}`;

          const fullText = `${shortName} ${metricText}`;
          ctx.font = isSelected ? "bold 11px sans-serif" : "600 10px sans-serif";
          const boxW = ctx.measureText(fullText).width + 22;
          const boxH = isSelected ? 22 : 19;

          let dotColor = "#10B981";
          if (activeOverlayMode === "soil_moisture") {
            dotColor =
              st.soilMoisturePct < 28
                ? "#EF4444"
                : st.soilMoisturePct < 38
                ? "#F59E0B"
                : st.soilMoisturePct >= 50
                ? "#38BDF8"
                : "#10B981";
          } else if (activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob") {
            dotColor =
              st.rain24hMm >= 25 || st.rainProbPct >= 70
                ? "#8B5CF6"
                : st.rainProbPct >= 50
                ? "#38BDF8"
                : st.rainProbPct >= 30
                ? "#10B981"
                : "#F59E0B";
          } else if (activeOverlayMode === "humidity_heatmap") {
            dotColor =
              st.relativeHumidityPct >= 80
                ? "#6366F1"
                : st.relativeHumidityPct >= 65
                ? "#06B6D4"
                : st.relativeHumidityPct >= 50
                ? "#10B981"
                : "#F59E0B";
          } else {
            dotColor =
              st.spi30d <= -1.5
                ? "#EF4444"
                : st.spi30d <= -1.0
                ? "#F59E0B"
                : "#10B981";
          }

          ctx.fillStyle = isSelected ? "#0F172A" : "rgba(15, 23, 42, 0.88)";
          ctx.strokeStyle = isSelected ? "#38BDF8" : dotColor;
          ctx.lineWidth = isSelected ? 2 : 1.2;
          ctx.beginPath();
          ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 6);
          ctx.fill();
          ctx.stroke();

          // Status dot
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(x - boxW / 2 + 8, y, 3.2, 0, Math.PI * 2);
          ctx.fill();

          // Text
          ctx.fillStyle = isSelected ? "#38BDF8" : "#F8FAFC";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(fullText, x - boxW / 2 + 15, y);
        });
      }

      // 5. Draw Pinned Farm Plots & Plot Boundary Polygons if enabled
      if (showPlotPins) {
        plots.forEach((plot) => {
          const pinColor =
            plot.droughtStatus === "วิกฤตแล้งรุนแรง"
              ? "#DC2626"
              : plot.droughtStatus === "เฝ้าระวังฝนทิ้งช่วง"
              ? "#D97706"
              : "#059669";

          // Draw farm plot polygon boundary on canvas
          const dLat = 0.0042;
          const dLon = 0.0048;
          const nwPoly = map.latLngToContainerPoint([plot.lat + dLat, plot.lon - dLon]);
          const sePoly = map.latLngToContainerPoint([plot.lat - dLat, plot.lon + dLon]);
          const polyW = Math.max(10, sePoly.x - nwPoly.x);
          const polyH = Math.max(10, sePoly.y - nwPoly.y);

          ctx.save();
          ctx.fillStyle = pinColor;
          ctx.globalAlpha = 0.35;
          ctx.fillRect(nwPoly.x, headerH + nwPoly.y, polyW, polyH);
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = pinColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(nwPoly.x, headerH + nwPoly.y, polyW, polyH);
          ctx.restore();

          const pt = map.latLngToContainerPoint([plot.lat, plot.lon]);
          const x = pt.x;
          const y = headerH + pt.y - 16;
          if (x < -60 || x > canvasW + 60 || y < headerH - 25 || y > headerH + mapH + 25)
            return;

          // Stem connecting plot center to floating label
          ctx.strokeStyle = pinColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, headerH + pt.y);
          ctx.lineTo(x, y + 8);
          ctx.stroke();

          const label = `📍 ${plot.plotCode} (${plot.areaRai} ไร่)`;
          ctx.font = "bold 10px sans-serif";
          const boxW = ctx.measureText(label).width + 14;
          const boxH = 20;

          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = pinColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#0F172A";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, x, y);
        });

        // Draw Pinned Farm Plots Summary Legend Box in top-right of map area
        const boxW = 248;
        const maxPlotsShown = Math.min(4, plots.length);
        const boxH = 34 + maxPlotsShown * 20;
        const boxX = canvasW - boxW - 14;
        const boxY = headerH + 14;

        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#34D399";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(
          `📍 หมุดแปลงเกษตรบนแผนที่ (${plots.length} แปลง)`,
          boxX + 10,
          boxY + 18
        );

        plots.slice(0, maxPlotsShown).forEach((p, idx) => {
          const rowY = boxY + 36 + idx * 19;
          ctx.fillStyle = "#F8FAFC";
          ctx.font = "10px sans-serif";
          const lineText = `${p.plotCode} · ${p.districtNameTh.replace(/^อ\./, "")} (${p.areaRai} ไร่)`;
          ctx.fillText(lineText, boxX + 10, rowY);

          ctx.fillStyle =
            p.droughtStatus === "วิกฤตแล้งรุนแรง"
              ? "#F87171"
              : p.droughtStatus === "เฝ้าระวังฝนทิ้งช่วง"
              ? "#FBBF24"
              : "#34D399";
          ctx.textAlign = "right";
          ctx.fillText(`SPI ${p.spi30d}`, boxX + boxW - 10, rowY);
          ctx.textAlign = "left";
        });
      }

      ctx.restore();

      // 6. Draw Executive Top Header Banner on Canvas
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, canvasW, headerH);
      ctx.fillStyle = "#10B981";
      ctx.fillRect(0, headerH - 3, canvasW, 3);

      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(
        "KORAT SMART AGRI PLATFORM · แผนที่สารสนเทศภูมิศาสตร์และการเฝ้าระวังภัยแล้ง 32 อำเภอ จ.นครราชสีมา",
        20,
        24
      );

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px sans-serif";
      const modeTitle =
        activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
          ? "แผนที่เรดาร์ความเข้มข้นของฝน & ปริมาณฝน 24 ชม. (Rainfall Intensity) 32 อำเภอ"
          : activeOverlayMode === "humidity_heatmap"
          ? "แผนที่ความร้อนความชื้นสัมพัทธ์ในอากาศ (Relative Humidity Heatmap RH%) 32 อำเภอ"
          : activeOverlayMode === "soil_moisture"
          ? "แผนที่ความร้อนความชื้นในดิน (GISTDA Soil Moisture) & สถานีวัดอากาศเรียลไทม์"
          : activeOverlayMode === "soil_series"
          ? "แผนที่จำแนกกลุ่มชุดดิน (Soil Series Classifications: Korat / Roi Et Series) 32 อำเภอ"
          : activeOverlayMode === "soil_ph_npk"
          ? "แผนที่สภาพกรด-ด่างและธาตุอาหารดิน (Soil pH & NPK Map) จังหวัดนครราชสีมา"
          : "แผนที่ดรรชนีความแห้งแล้ง (SPI-30d) & หมุดแปลงเกษตร กษ.01";
      ctx.fillText(modeTitle, 20, 50);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = "12px sans-serif";
      const nowStr = new Date().toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      ctx.fillText(
        `พื้นที่โฟกัส: ${selectedDistrict.nameTh} (${activeStation.stationCode}) · ความชื้นดิน ${activeStation.soilMoisturePct}% · ความชื้นอากาศ ${activeStation.relativeHumidityPct}% · โอกาสฝน ${activeStation.rainProbPct}% · ฝน 24ชม. ${activeStation.rain24hMm}มม. · SPI ${activeStation.spi30d} · ข้อมูล ณ ${nowStr}`,
        20,
        72
      );

      // 7. Draw Bottom Legend & Academic Attribution Footer Banner on Canvas
      const footerY = headerH + mapH;
      ctx.fillStyle = "#0B1324";
      ctx.fillRect(0, footerY, canvasW, footerH);
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, footerY, canvasW, 1);

      // Gradient Legend Bar inside Footer
      const grad = ctx.createLinearGradient(20, 0, 260, 0);
      if (activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob") {
        grad.addColorStop(0, "#F59E0B");
        grad.addColorStop(0.3, "#10B981");
        grad.addColorStop(0.65, "#38BDF8");
        grad.addColorStop(1, "#8B5CF6");
      } else if (activeOverlayMode === "humidity_heatmap") {
        grad.addColorStop(0, "#F59E0B");
        grad.addColorStop(0.4, "#14B8A6");
        grad.addColorStop(0.75, "#0EA5E9");
        grad.addColorStop(1, "#6366F1");
      } else if (activeOverlayMode === "soil_moisture") {
        grad.addColorStop(0, "#DC2626");
        grad.addColorStop(0.35, "#F59E0B");
        grad.addColorStop(0.7, "#10B981");
        grad.addColorStop(1, "#0EA5E9");
      } else if (activeOverlayMode === "soil_series") {
        grad.addColorStop(0, "#F59E0B"); // Korat
        grad.addColorStop(0.2, "#06B6D4"); // Roi Et
        grad.addColorStop(0.4, "#3B82F6"); // Phimai
        grad.addColorStop(0.6, "#E11D48"); // Pak Chong
        grad.addColorStop(0.8, "#EA580C"); // Chok Chai
        grad.addColorStop(1, "#84CC16"); // Warin
      } else if (activeOverlayMode === "soil_ph_npk") {
        grad.addColorStop(0, "#E11D48");
        grad.addColorStop(0.35, "#F59E0B");
        grad.addColorStop(0.7, "#10B981");
        grad.addColorStop(1, "#6366F1");
      } else {
        grad.addColorStop(0, "#DC2626");
        grad.addColorStop(0.5, "#F59E0B");
        grad.addColorStop(1, "#10B981");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(20, footerY + 18, 240, 10, 5);
      ctx.fill();

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(
        `หมุดแปลงเกษตรในระบบ ${plots.length} แปลง · สถานีตรวจวัดอากาศอัตโนมัติ 32 อำเภอ · เขื่อนหลัก 4 แห่ง`,
        20,
        footerY + 46
      );
      ctx.fillStyle = "#34D399";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(
        "ออกแบบสร้างสรรค์พัฒนา: ฐิติวัสส์ กาญจนพิมาย · คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยราชภัฏนครราชสีมา",
        20,
        footerY + 68
      );

      const dataUrl = canvas.toDataURL("image/png");
      setExportImageUrl(dataUrl);

      canvas.toBlob((blob) => {
        if (blob) {
          setExportBlob(blob);
        }
      }, "image/png");

      if (autoDownload) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Korat_Smart_Agri_Map_${selectedDistrict.id}_${activeOverlayMode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsExportingMap(false);
    }
  };

  // Copy generated PNG image directly to Clipboard for pasting into LINE / Messenger
  const handleCopyImageToClipboard = async () => {
    if (!exportBlob) return;
    try {
      if (navigator.clipboard && "write" in navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": exportBlob }),
        ]);
        setCopyStatusText("คัดลอกรูปภาพแผนที่แล้ว! กดวาง (Paste) ในแชท LINE หรือ Messenger ได้ทันที");
      } else {
        setCopyStatusText("เบราว์เซอร์นี้ไม่รองรับการคัดลอกภาพโดยตรง กรุณากดดาวน์โหลดไฟล์ PNG");
      }
    } catch {
      setCopyStatusText("กรุณากดปุ่ม 'ดาวน์โหลดภาพ PNG' เพื่อส่งต่อในแอปแชท");
    }
  };

  // Copy formatted summary text + coordinates for messaging apps
  const handleCopyShareCaption = async () => {
    const caption = [
      `📍 รายงานแผนที่เกษตรอัจฉริยะ จ.นครราชสีมา (${selectedDistrict.nameTh})`,
      `• สถานีตรวจวัด: ${activeStation.stationCode} (${selectedDistrict.lat.toFixed(4)}°N, ${selectedDistrict.lon.toFixed(4)}°E)`,
      `• ความชื้นดิน GISTDA: ${activeStation.soilMoisturePct}% (${activeStation.moistureStatus})`,
      `• โอกาสเกิดฝนวันนี้: ${activeStation.rainProbPct}% · ฝนสะสม 24 ชม.: ${activeStation.rain24hMm} มม.`,
      `• ดรรชนีความแห้งแล้ง SPI-30d: ${activeStation.spi30d} (${selectedDistrict.droughtRiskLevel})`,
      `• จำนวนหมุดแปลงเกษตรที่ติดตามบนแผนที่: ${plots.length} แปลง`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(caption);
      setCopyStatusText("คัดลอกข้อความสรุปข้อมูลแผนที่สำหรับส่งใน LINE เรียบร้อยแล้ว!");
    } catch {
      setCopyStatusText("ไม่สามารถคัดลอกข้อความได้");
    }
  };

  // Native Web Share API with Image File for Mobile / Supported Browsers
  const handleNativeWebShare = async () => {
    if (!exportBlob) return;
    const file = new File(
      [exportBlob],
      `Korat_Smart_Agri_Map_${selectedDistrict.id}.png`,
      { type: "image/png" }
    );
    const shareData: ShareData = {
      title: `แผนที่ความชื้นดินและพยากรณ์อากาศ ${selectedDistrict.nameTh} - Korat Smart Agri`,
      text: `รายงานสภาพอากาศและความชื้นดิน ${selectedDistrict.nameTh} (ความชื้นดิน ${activeStation.soilMoisturePct}%, โอกาสฝน ${activeStation.rainProbPct}%, SPI ${activeStation.spi30d})`,
      files: [file],
    };

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
        });
      } else {
        await handleCopyImageToClipboard();
      }
    } catch {
      // User cancelled share sheet
    }
  };

  return (
    <div className={`border rounded-2xl shadow-lg p-4 sm:p-6 space-y-5 transition-colors ${isDark ? "bg-[#0B101D] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"}`}>
      {/* Top Map Control Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${isDark ? "bg-[#080C16] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold mb-1">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
              <span>
                GIS Spatial Map Explorer · ระบบวิเคราะห์เชิงพื้นที่ 32 อำเภอนครราชสีมา (AWS &amp; Soil Heatmap)
              </span>
            </div>
            <h3 className={`text-lg sm:text-xl font-bold tracking-tight leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
              แผนที่สถานีโทรมาตรและ Heatmap ดิน-ภูมิอากาศ 32 อำเภอ
            </h3>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              แสดงผลแผนที่ความร้อน (IDW Spatial Heatmap) จากดาวเทียม GISTDA ร่วมกับสถานี AWS 32 อำเภอ และกลุ่มชุดดินโคราช
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={`px-2.5 py-1 rounded-lg border font-semibold ${isDark ? "bg-slate-900 border-slate-800 text-teal-400" : "bg-white border-slate-300 text-teal-700"}`}>
              อำเภอที่เลือก: {selectedDistrict.nameTh}
            </span>
          </div>
        </div>

        {/* 6-Mode Dynamic Heatmap & Metric Toggle Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => onChangeOverlayMode("rainfall_intensity")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
                ? "bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <CloudRain className={`w-4 h-4 shrink-0 ${activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob" ? "text-slate-950" : "text-sky-400"}`} />
            <span className="truncate">🌧️ เรดาร์ฝน</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeOverlayMode("humidity_heatmap")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeOverlayMode === "humidity_heatmap"
                ? "bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <Wind className={`w-4 h-4 shrink-0 ${activeOverlayMode === "humidity_heatmap" ? "text-slate-950" : "text-teal-400"}`} />
            <span className="truncate">💧 ความชื้นอากาศ</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeOverlayMode("soil_moisture")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeOverlayMode === "soil_moisture"
                ? "bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <Droplets className={`w-4 h-4 shrink-0 ${activeOverlayMode === "soil_moisture" ? "text-slate-950" : "text-emerald-400"}`} />
            <span className="truncate">🌱 ความชื้นดิน</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeOverlayMode("soil_series")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeOverlayMode === "soil_series"
                ? "bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <Layers className={`w-4 h-4 shrink-0 ${activeOverlayMode === "soil_series" ? "text-slate-950" : "text-amber-400"}`} />
            <span className="truncate">🗺️ กลุ่มชุดดิน</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeOverlayMode("drought_spi")}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeOverlayMode === "drought_spi"
                ? "bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <Thermometer className={`w-4 h-4 shrink-0 ${activeOverlayMode === "drought_spi" ? "text-slate-950" : "text-amber-500"}`} />
            <span className="truncate">⚠️ ดัชนีแล้ง SPI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeOverlayMode("soil_ph_npk");
              setShowSoilPhNutrientLayer(true);
              setInspectorTab("soil_db");
            }}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeOverlayMode === "soil_ph_npk"
                ? "bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50"
                : isDark
                ? "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <FlaskConical className={`w-4 h-4 shrink-0 ${activeOverlayMode === "soil_ph_npk" ? "text-slate-950" : "text-purple-400"}`} />
            <span className="truncate">🧪 pH &amp; N-P-K</span>
          </button>
        </div>
      </div>

      {/* Layer Checkboxes, Heatmap Opacity Slider & Quick GPS Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200 bg-[#080C16] border border-[#1E293B] rounded-xl px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#2DD4BF]">
            <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>ชั้นข้อมูล GIS:</span>
          </span>

          <label className="inline-flex items-center gap-1.5 cursor-pointer bg-teal-500/15 border border-teal-500/40 rounded-lg px-2 py-1 text-teal-300">
            <input
              type="checkbox"
              checked={showDistrictBoundaries}
              onChange={(e) => setShowDistrictBoundaries(e.target.checked)}
              className="rounded border-[#1E293B] accent-teal-400 focus:ring-0"
            />
            <span className="font-bold">
              ขอบเขต 32 อำเภอ (SVG Polygons)
            </span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showWeatherStations}
              onChange={(e) => setShowWeatherStations(e.target.checked)}
              className="rounded border-[#1E293B] accent-[#14B8A6] focus:ring-0"
            />
            <span className="font-medium">
              สถานีตรวจวัดอากาศเรียลไทม์ ({weatherStations.length} อำเภอ)
            </span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showMoistureHeatmap}
              onChange={(e) => setShowMoistureHeatmap(e.target.checked)}
              className="rounded border-[#1E293B] accent-[#14B8A6] focus:ring-0"
            />
            <span className="font-medium">
              แผนที่ความร้อนความชื้นดิน/ฝน (Moisture Heatmap)
            </span>
          </label>

          {showMoistureHeatmap && (
            <div className="inline-flex items-center gap-2 bg-[#0E1525] border border-[#1E293B] rounded-lg px-2.5 py-1">
              <Sliders className="w-3 h-3 text-[#2DD4BF]" />
              <span className="text-[11px] text-slate-300">ความเข้ม Heatmap:</span>
              <input
                type="range"
                min={0.25}
                max={0.85}
                step={0.05}
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-20 accent-[#14B8A6]"
                aria-label="ปรับความโปร่งแสงของ Heatmap"
              />
              <span className="font-mono tabular-nums text-[11px] font-bold text-[#2DD4BF]">
                {Math.round(heatmapOpacity * 100)}%
              </span>
            </div>
          )}

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPlotPins}
              onChange={(e) => setShowPlotPins(e.target.checked)}
              className="rounded border-[#1E293B] accent-[#14B8A6] focus:ring-0"
            />
            <span>หมุดแปลงเกษตร ({plots.length} แปลง)</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDamMarkers}
              onChange={(e) => setShowDamMarkers(e.target.checked)}
              className="rounded border-[#1E293B] accent-[#14B8A6] focus:ring-0"
            />
            <span>อ่างเก็บน้ำหลัก 4 แห่ง</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer bg-sky-500/15 border border-sky-400/50 rounded-lg px-2.5 py-1 text-sky-300">
            <input
              type="checkbox"
              checked={showIrrigationCanals}
              onChange={(e) => setShowIrrigationCanals(e.target.checked)}
              className="rounded border-[#1E293B] accent-sky-400 focus:ring-0"
            />
            <Droplets className="w-3.5 h-3.5 text-sky-300" />
            <span className="font-bold">
              คลองส่งน้ำ &amp; โซนชลประทาน ({KORAT_IRRIGATION_CANALS.length} สาย)
            </span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer bg-[#F59E0B]/15 border border-[#F59E0B]/50 rounded-lg px-2.5 py-1 text-[#FBBF24]">
            <input
              type="checkbox"
              checked={showLogisticsFinder}
              onChange={(e) => {
                setShowLogisticsFinder(e.target.checked);
                if (e.target.checked) {
                  setInspectorTab("logistics");
                }
              }}
              className="rounded border-[#1E293B] accent-[#F59E0B] focus:ring-0"
            />
            <Truck className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span className="font-bold">
              Logistics &amp; Fuel Finder โซนใต้ ({KORAT_SOUTHERN_LOGISTICS_HUBS.length} จุด)
            </span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer bg-emerald-500/15 border border-emerald-400/50 rounded-lg px-2.5 py-1 text-emerald-300">
            <input
              type="checkbox"
              checked={showSoilPhNutrientLayer}
              onChange={(e) => {
                setShowSoilPhNutrientLayer(e.target.checked);
                if (e.target.checked) {
                  setInspectorTab("soil_db");
                }
              }}
              className="rounded border-[#1E293B] accent-emerald-400 focus:ring-0"
            />
            <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-bold">
              ชั้นข้อมูล pH ดิน &amp; ความพร่อง N-P-K (32 อำเภอ)
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLocateMyFarmGps}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-[#0E1525] border border-[#1E293B] hover:border-[#2DD4BF]/50 rounded-lg transition-colors whitespace-nowrap"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>ดึงพิกัด GPS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              mapInstanceRef.current?.flyTo([15.02, 102.18], 9, { duration: 0.8 });
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-[#0E1525] border border-[#1E293B] hover:border-[#2DD4BF]/50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>ดูทั้ง 32 อำเภอ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPinningMode((prev) => !prev);
              if (!draftCoords) {
                setDraftCoords({
                  lat: Number((selectedDistrict.lat + 0.008).toFixed(5)),
                  lon: Number((selectedDistrict.lon + 0.008).toFixed(5)),
                });
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              isPinningMode
                ? "bg-[#141E36] text-[#2DD4BF] border border-[#2DD4BF]"
                : "bg-[#14B8A6] text-[#041E1C] hover:bg-[#2DD4BF]"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isPinningMode ? "กำลังปักหมุด (คลิกแผนที่)" : "ปักหมุดแปลงใหม่"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportMapImage(false)}
            disabled={isExportingMap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FBBF24] bg-[#F59E0B]/15 border border-[#F59E0B]/50 hover:bg-[#F59E0B]/25 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>
              {isExportingMap ? "กำลังสร้างภาพแผนที่..." : "ส่งออกภาพแผนที่ / แชร์"}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Map Snapshot Export & Messaging App Share Drawer */}
      {exportImageUrl && (
        <div className="bg-[#080C16] text-white rounded-2xl p-4 sm:p-5 space-y-4 border border-[#1E293B] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  พร้อมแชร์ภาพแผนที่ความละเอียดสูง ({selectedDistrict.nameTh} · หมุดแปลง {plots.length} แปลง)
                </h4>
                <p className="text-xs text-slate-400">
                  บันทึกเป็นไฟล์รูปภาพ PNG หรือคัดลอกไปวางในแชท LINE, Messenger และกลุ่มวิสาหกิจชุมชนได้ทันที
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={exportImageUrl}
                download={`Korat_Smart_Agri_Map_${selectedDistrict.id}_${activeOverlayMode}.png`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#041E1C] bg-[#14B8A6] hover:bg-[#2DD4BF] rounded-xl transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดภาพ PNG</span>
              </a>

              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#6366F1] rounded-xl transition-colors whitespace-nowrap"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอกรูปภาพวางใน LINE</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareCaption}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#0E1525] hover:bg-[#141D30] border border-[#1E293B] rounded-xl transition-colors whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>คัดลอกข้อความสรุปพิกัด</span>
              </button>

              <button
                type="button"
                onClick={handleNativeWebShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#0E1525] hover:bg-[#141D30] border border-[#1E293B] rounded-xl transition-colors whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>แชร์ผ่านแอปมือถือ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportImageUrl(null);
                  setCopyStatusText("");
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                aria-label="ปิดหน้าต่างส่งออกภาพแผนที่"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {copyStatusText && (
            <div className="bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF] text-xs px-3.5 py-2 rounded-xl flex items-center justify-between">
              <span>{copyStatusText}</span>
              <button
                type="button"
                onClick={() => setCopyStatusText("")}
                className="text-[#2DD4BF] font-semibold hover:underline"
              >
                รับทราบ
              </button>
            </div>
          )}

          {/* Snapshot Image Preview */}
          <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#060911] max-h-[420px] flex items-center justify-center">
            <img
              src={exportImageUrl}
              alt={`ภาพส่งออกแผนที่เกษตรอัจฉริยะ ${selectedDistrict.nameTh}`}
              className="w-full h-auto max-h-[410px] object-contain"
            />
          </div>
        </div>
      )}

      {/* Interactive Pinning Drawer (Visible when isPinningMode is active) */}
      {isPinningMode && (
        <form
          onSubmit={handleConfirmAddPin}
          className="bg-[#080C16] text-white rounded-xl p-4 space-y-3 border border-[#1E293B]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
            <div className="text-xs font-semibold text-[#2DD4BF]">
              โหมดปักหมุดแปลงเกษตรแบบเรียลไทม์: คลิกเลือกตำแหน่งบนแผนที่ด้านล่าง หรือกรอกพิกัดเพื่อบันทึกแปลงเข้าสู่ระบบ
            </div>
            <div className="text-xs font-mono tabular-nums text-[#FBBF24]">
              พิกัดที่เลือก:{" "}
              {draftCoords
                ? `${draftCoords.lat.toFixed(5)}°N, ${draftCoords.lon.toFixed(5)}°E`
                : `${selectedDistrict.lat.toFixed(5)}°N, ${selectedDistrict.lon.toFixed(5)}°E`}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                ชื่อเกษตรกร / เจ้าของแปลง
              </label>
              <input
                type="text"
                value={newFarmerName}
                onChange={(e) => setNewFarmerName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-[#0E1525] border border-[#1E293B] rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                ชนิดพืชที่เพาะปลูกในแปลง
              </label>
              <input
                type="text"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-[#0E1525] border border-[#1E293B] rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                ประเภทพืช (สำหรับเกณฑ์ กษ.01)
              </label>
              <select
                value={newCropCategory}
                onChange={(e) =>
                  setNewCropCategory(e.target.value as "rice" | "field_crop" | "orchard")
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#0E1525] border border-[#1E293B] rounded-lg text-white"
              >
                <option value="field_crop">พืชไร่ (1,980 บ./ไร่)</option>
                <option value="rice">ข้าว (1,340 บ./ไร่)</option>
                <option value="orchard">ไม้ผล/ไม้ยืนต้น (4,048 บ./ไร่)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                ขนาดพื้นที่แปลง (ไร่)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={newAreaRai}
                onChange={(e) => setNewAreaRai(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-[#0E1525] border border-[#1E293B] rounded-lg text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="w-full px-3 py-1.5 text-xs font-bold text-[#041E1C] bg-[#14B8A6] hover:bg-[#2DD4BF] rounded-lg transition-colors whitespace-nowrap"
              >
                บันทึกหมุดแปลงลงแผนที่
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPinningMode(false);
                  setDraftCoords(null);
                }}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Interactive Soil pH & Nutrient Deficiency Sub-Metric Switcher Bar */}
      {(showSoilPhNutrientLayer || activeOverlayMode === "soil_ph_npk") && (
        <div className="bg-[#080C16] border border-emerald-500/35 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#2DD4BF] shrink-0" />
            <span className="font-bold text-white">
              ตัวชี้วัดฐานข้อมูลดินและธาตุอาหารบนแผนที่ (Soil-Type &amp; Nutrient Overlay):
            </span>
            <span className="text-slate-400 hidden md:inline">
              เลือกตัวแปรที่ต้องการแสดงบนหมุดอำเภอทั้ง 32 แห่งเพื่อวางแผนใส่ปุ๋ยสั่งตัด
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "ph", label: "🧪 ค่ากรด-ด่าง (Soil pH)" },
                { id: "npk_deficiency", label: "⚠️ ดัชนีความพร่อง N-P-K รวม" },
                { id: "n_om", label: "🌿 ไนโตรเจน / อินทรียวัตถุ (OM%)" },
                { id: "p_avail", label: "⚡ ฟอสฟอรัสที่เป็นประโยชน์ (P ppm)" },
                { id: "k_exch", label: "💎 โพแทสเซียมแลกเปลี่ยนได้ (K ppm)" },
              ] as { id: SoilOverlaySubMetric; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSoilSubMetric(m.id);
                  setInspectorTab("soil_db");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  soilSubMetric === m.id
                    ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6]"
                    : "bg-[#0B101D] text-slate-300 border-[#1E293B] hover:border-[#2DD4BF]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Map Viewport (8 Cols) + Right-Hand Weather Station & Farm Plot Inspector (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Leaflet Map Container (8 cols) */}
        <div className={`lg:col-span-8 relative rounded-xl overflow-hidden border flex flex-col justify-between transition-colors ${isDark ? "border-[#1E293B] bg-[#080C16]" : "border-slate-300 bg-slate-900"}`}>
          {/* Floating GIS Navigation Toolbar (Top-Left) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-xl">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="ซูมเข้า (Zoom In)"
              aria-label="ซูมเข้า"
            >
              <ZoomIn className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="ซูมออก (Zoom Out)"
              aria-label="ซูมออก"
            >
              <ZoomOut className="w-4 h-4 text-emerald-400" />
            </button>
            <div className="h-px bg-slate-700/60 my-0.5" />
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.flyTo([15.02, 102.18], 9, { duration: 0.8 })}
              className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="รีเซ็ตมุมมองภาพรวม 32 อำเภอ (Recenter Whole Korat)"
              aria-label="ดูภาพรวมทั้ง 32 อำเภอ"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.flyTo([selectedDistrict.lat, selectedDistrict.lon], 11, { duration: 0.75 })}
              className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={`โฟกัส ${formatDistrictName(selectedDistrict.nameTh)}`}
              aria-label="โฟกัสอำเภอที่เลือก"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
            </button>
            <button
              type="button"
              onClick={handleLocateMyFarmGps}
              className="p-1.5 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="ค้นหาพิกัด GPS แปลงเกษตร"
              aria-label="ดึงพิกัด GPS"
            >
              <LocateFixed className="w-4 h-4 text-teal-400" />
            </button>
            <button
              type="button"
              onClick={() => setShowDistrictBoundaries((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showDistrictBoundaries
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title={showDistrictBoundaries ? "ซ่อนแนวขอบเขต 32 อำเภอ" : "แสดงแนวขอบเขต 32 อำเภอ"}
              aria-label="เปิด/ปิดขอบเขตอำเภอ"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Base Map Selector & Snapshot Export Action (Top-Right) */}
          <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 bg-[#0F172A]/90 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-xl">
              {(
                [
                  { id: "dark_meteo", label: "เรดาร์มืด" },
                  { id: "osm", label: "ถนน" },
                  { id: "satellite", label: "ดาวเทียม" },
                  { id: "topo", label: "ภูมิประเทศ" },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBaseMapType(b.id)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    baseMapType === b.id
                      ? "bg-teal-500 text-slate-950 shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleExportMapImage(false)}
              disabled={isExportingMap}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl backdrop-blur-md transition-colors cursor-pointer"
              title="แชร์ภาพแผนที่ความละเอียดสูง"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">แชร์</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportMapImage(true)}
              disabled={isExportingMap}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl shadow-xl transition-colors cursor-pointer"
              title="ดาวน์โหลดภาพแผนที่ปัจจุบันเป็นไฟล์ PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
          </div>

          <div
            ref={mapContainerRef}
            style={{ height: "520px", width: "100%" }}
            className="z-10"
            aria-label="แผนที่ Leaflet แสดงสถานีตรวจวัดอากาศเรียลไทม์และแผนที่ความร้อนความชื้นดิน 32 อำเภอ จังหวัดนครราชสีมา"
          />

          {/* Floating Scale Indicator & Compass (Bottom-Left) */}
          <div className="absolute bottom-16 left-3 z-20 flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-slate-200 text-[10px] font-mono shadow-lg pointer-events-none">
            {/* Compass Rose */}
            <div className="flex items-center gap-1 border-r border-slate-700/60 pr-2">
              <Compass className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="font-bold text-sky-400">N</span>
            </div>
            {/* Scale bar (approx 50km at zoom 9) */}
            <div className="flex flex-col items-center">
              <div className="flex justify-between w-16 text-[9px] text-slate-400 leading-none mb-0.5">
                <span>0</span>
                <span>25</span>
                <span>50km</span>
              </div>
              <div className="w-16 h-1 bg-slate-600 rounded-full flex">
                <div className="w-1/2 h-full bg-teal-400 rounded-l-full" />
                <div className="w-1/2 h-full bg-slate-400 rounded-r-full" />
              </div>
            </div>
            <div className="border-l border-slate-700/60 pl-2 text-slate-300">
              <span>Zoom: {mapZoomLevel}</span>
            </div>
          </div>

          {/* Continuous Heatmap Scale Bar & Legend Footer */}
          <div className={`px-4 py-3 text-xs space-y-2 border-t transition-colors ${isDark ? "bg-[#080C16] text-white border-[#1E293B]" : "bg-slate-50 text-slate-800 border-slate-200"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${isDark ? "text-teal-400" : "text-teal-700"}`}>
                  {activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
                    ? "เกณฑ์สีแผนที่เรดาร์ความเข้มข้นของฝน (Rainfall Intensity Radar Heatmap):"
                    : activeOverlayMode === "humidity_heatmap"
                    ? "เกณฑ์สีแผนที่ความชื้นสัมพัทธ์ในอากาศ (Relative Humidity Heatmap RH%):"
                    : activeOverlayMode === "soil_moisture"
                    ? "เกณฑ์สีแผนที่ความร้อนความชื้นในดิน (GISTDA Soil Moisture Heatmap):"
                    : activeOverlayMode === "soil_series"
                    ? "เกณฑ์สีจำแนกกลุ่มชุดดินโคราช & ร้อยเอ็ด (Soil Series Classifications Heatmap):"
                    : activeOverlayMode === "soil_ph_npk"
                    ? "เกณฑ์สีแผนที่ค่าความเป็นกรด-ด่างดิน (Soil pH & NPK Heatmap):"
                    : "เกณฑ์สีแผนที่ความร้อนดรรชนีความแห้งแล้ง (SPI-30d Drought Heatmap):"}
                </span>
              </div>

              {activeOverlayMode === "soil_series" ? (
                <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                  {Object.values(SOIL_SERIES_METADATA).map((meta) => (
                    <div
                      key={meta.key}
                      className="flex items-center gap-1.5 bg-[#0E1525] px-2 py-0.5 rounded-md border border-[#1E293B] text-[10px]"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                        style={{ backgroundColor: meta.colorHex }}
                      />
                      <span className="font-bold text-slate-200">
                        {meta.code}: {meta.nameTh.replace(/ชุดดิน/, "").split(" ")[0].trim()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Continuous Color Gradient Scale Bar */
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <span className="text-[11px] font-mono tabular-nums text-amber-400 whitespace-nowrap">
                    {activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
                      ? "ฝนเบาบาง (<2 มม.)"
                      : activeOverlayMode === "humidity_heatmap"
                      ? "แห้งโปร่ง (<50% RH)"
                      : activeOverlayMode === "soil_moisture"
                      ? "แห้งจัด (<25%)"
                      : activeOverlayMode === "soil_ph_npk"
                      ? "กรดจัด (pH <5.0)"
                      : "แล้งจัด (-1.8)"}
                  </span>
                  <div
                    className="h-2.5 flex-1 rounded-full border border-[#1E293B]"
                    style={{
                      background:
                        activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
                          ? "linear-gradient(90deg, #F59E0B 0%, #10B981 25%, #38BDF8 55%, #6366F1 80%, #EC4899 100%)"
                          : activeOverlayMode === "humidity_heatmap"
                          ? "linear-gradient(90deg, #F59E0B 0%, #14B8A6 45%, #0EA5E9 75%, #6366F1 100%)"
                          : activeOverlayMode === "soil_moisture"
                          ? "linear-gradient(90deg, #DC2626 0%, #F59E0B 35%, #14B8A6 70%, #38BDF8 100%)"
                          : activeOverlayMode === "soil_ph_npk"
                          ? "linear-gradient(90deg, #E11D48 0%, #F59E0B 40%, #10B981 70%, #6366F1 100%)"
                          : "linear-gradient(90deg, #DC2626 0%, #F59E0B 45%, #14B8A6 100%)",
                    }}
                  />
                  <span className="text-[11px] font-mono tabular-nums text-[#2DD4BF] whitespace-nowrap">
                    {activeOverlayMode === "rainfall_intensity" || activeOverlayMode === "rain_prob"
                      ? "ฝนตกหนักมาก (>40 มม./พายุ)"
                      : activeOverlayMode === "humidity_heatmap"
                      ? "ชื้นจัด (>85% RH ฝนชุก)"
                      : activeOverlayMode === "soil_moisture"
                      ? "ชื้นอิ่มตัว (>55%)"
                      : activeOverlayMode === "soil_ph_npk"
                      ? "ด่างอ่อน (pH >7.0)"
                      : "ชุ่มชื้น (+0.5)"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1E293B] text-[11px] text-slate-300">
              <div className="flex flex-wrap items-center gap-4">
                <span>📡 สถานีตรวจวัดอากาศอัตโนมัติ (AWS) ครบ 32 อำเภอ</span>
                <span>·</span>
                <span>💧 อ่างเก็บน้ำหลัก 4 แห่ง</span>
                <span>·</span>
                <span>📍 หมุดแปลงเกษตร {plots.length} แปลง</span>
              </div>
              <span className="font-mono text-[#2DD4BF]">
                คลิกที่สถานีบนแผนที่เพื่อดูค่าเซนเซอร์เรียลไทม์
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Quad-Mode Inspector (32 Weather Stations vs Soil-Type & NPK DB vs Farm Plots vs Southern Logistics) */}
        <div className="lg:col-span-4 flex flex-col justify-between border border-[#1E293B] rounded-xl p-4 bg-[#080C16] space-y-4">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#0E1525] border border-[#1E293B] rounded-xl">
            <button
              type="button"
              onClick={() => setInspectorTab("stations")}
              className={`py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                inspectorTab === "stations"
                  ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              สถานีอากาศ (32)
            </button>
            <button
              type="button"
              onClick={() => {
                setInspectorTab("soil_db");
                setShowSoilPhNutrientLayer(true);
              }}
              className={`py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                inspectorTab === "soil_db"
                  ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                  : "text-emerald-300 hover:text-white"
              }`}
            >
              ดิน·ปุ๋ย (32)
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab("plots")}
              className={`py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                inspectorTab === "plots"
                  ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              แปลง ({plots.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setInspectorTab("logistics");
                setShowLogisticsFinder(true);
              }}
              className={`py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                inspectorTab === "logistics"
                  ? "bg-[#F59E0B] text-slate-950 shadow-xs"
                  : "text-[#FBBF24] hover:text-white"
              }`}
            >
              ขนส่ง·ปั๊ม ({KORAT_SOUTHERN_LOGISTICS_HUBS.length})
            </button>
          </div>

          {inspectorTab === "stations" ? (
            <>
              {/* Active Weather Station Live Telemetry Card */}
              <div className="bg-[#0B101D] text-white rounded-xl p-4 space-y-3 border border-[#1E293B]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums font-bold text-[#2DD4BF] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#2DD4BF] animate-pulse" />
                    <span>{activeStation.stationCode}</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      activeStation.moistureStatus === "วิกฤตดินแห้งแล้ง"
                        ? "text-red-400"
                        : activeStation.moistureStatus === "เฝ้าระวังดินแห้ง"
                        ? "text-[#FBBF24]"
                        : "text-[#2DD4BF]"
                    }`}
                  >
                    {activeStation.moistureStatus}
                  </span>
                </div>

                <div>
                  <div className="text-base font-bold text-white">
                    สถานีอุตุนิยมวิทยา {activeStation.district.nameTh}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {activeStation.district.zone} · พิกัด {activeStation.district.lat.toFixed(4)}°N,{" "}
                    {activeStation.district.lon.toFixed(4)}°E
                  </div>
                </div>

                {/* 6-Sensor Telemetry Readout Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1E293B] text-xs font-mono tabular-nums">
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 font-sans">ความชื้นดิน</div>
                    <div className="text-sm font-bold text-[#2DD4BF]">
                      {activeStation.soilMoisturePct}%
                    </div>
                  </div>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 font-sans">อุณหภูมิอากาศ</div>
                    <div className="text-sm font-bold text-[#FBBF24]">
                      {activeStation.tempCurrentC}°C
                    </div>
                  </div>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 font-sans">ความชื้นสัมพัทธ์</div>
                    <div className="text-sm font-bold text-[#2DD4BF]">
                      {activeStation.relativeHumidityPct}%
                    </div>
                  </div>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 font-sans">โอกาสเกิดฝน</div>
                    <div className="text-sm font-bold text-white">
                      {activeStation.rainProbPct}%
                    </div>
                  </div>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 font-sans">น้ำฝน 24 ชม.</div>
                    <div className="text-sm font-bold text-[#38BDF8]">
                      {activeStation.rain24hMm} มม.
                    </div>
                  </div>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                    <div className="text-[10px] text-slate-400 font-sans">ความเร็วลม</div>
                    <div className="text-sm font-bold text-slate-200">
                      {activeStation.windSpeedKmh} กม./ชม.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-[#1E293B] font-mono tabular-nums">
                  <span>อุณหภูมิดิน: {activeStation.soilTempC}°C</span>
                  <span>ความกดอากาศ: {activeStation.pressureHpa} hPa</span>
                </div>
              </div>

              {/* Search & Scrollable List of all 32 Weather Stations */}
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    placeholder="ค้นหาสถานีจากทั้ง 32 อำเภอ..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B101D] border border-[#1E293B] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>

                <div className="space-y-1.5 max-h-[245px] overflow-y-auto pr-1">
                  {filteredStations.map((st) => {
                    const isSelected = st.district.id === selectedDistrict.id;
                    return (
                      <button
                        key={st.stationCode}
                        type="button"
                        onClick={() => {
                          onSelectDistrict(st.district.id);
                          mapInstanceRef.current?.flyTo(
                            [st.district.lat, st.district.lon],
                            11,
                            { duration: 0.7 }
                          );
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                          isSelected
                            ? "bg-[#141E36] text-white border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.12)]"
                            : "bg-[#111827] text-slate-200 border-[#1E293B] hover:border-[#6366F1]/60 hover:bg-[#141D30]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            {st.district.nameTh}{" "}
                            <span
                              className={`font-mono text-[10px] font-normal ${
                                isSelected ? "text-[#2DD4BF]" : "text-slate-400"
                              }`}
                            >
                              ({st.stationCode})
                            </span>
                          </span>
                          <span
                            className={`font-mono tabular-nums font-semibold ${
                              isSelected
                                ? "text-[#2DD4BF]"
                                : st.soilMoisturePct < 28
                                ? "text-red-400"
                                : st.soilMoisturePct < 38
                                ? "text-[#FBBF24]"
                                : "text-[#2DD4BF]"
                            }`}
                          >
                            ความชื้นดิน {st.soilMoisturePct}%
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-between text-[11px] font-mono tabular-nums mt-1 ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          <span>🌡️ {st.tempCurrentC}°C · 🌧️ ฝน {st.rainProbPct}%</span>
                          <span>SPI {st.spi30d}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : inspectorTab === "soil_db" ? (
            <>
              {/* Soil-Type Database, Soil pH & Nutrient Deficiency Fertilizer Planner Inspector */}
              {(() => {
                const activeSoil: DistrictSoilNutrientProfile =
                  getDistrictSoilProfile(selectedDistrict.id);
                const filteredSoilProfiles = KORAT_DISTRICT_SOIL_PROFILES.filter(
                  (sp) => {
                    if (soilDbFilter === "acidic") return sp.soilPh < 5.5;
                    if (soilDbFilter === "low_n") return sp.organicMatterPct < 1.0;
                    if (soilDbFilter === "low_p") return sp.availablePPpm < 7.5;
                    if (soilDbFilter === "low_k") return sp.exchangeableKPpm < 50;
                    return true;
                  }
                );

                return (
                  <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    {/* Active District Soil & Fertilizer Card */}
                    <div className="bg-[#0B101D] border border-emerald-500/45 rounded-xl p-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2 font-mono">
                        <span className="font-bold text-[#2DD4BF]">
                          🧪 {activeSoil.soilSeries.seriesCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            activeSoil.soilPh < 5.4
                              ? "bg-rose-500/20 text-rose-300"
                              : activeSoil.soilPh <= 5.7
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          pH {activeSoil.soilPh.toFixed(1)} · {activeSoil.phCategory}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white">
                          {activeSoil.districtNameTh} — {activeSoil.soilSeries.seriesNameTh}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          เนื้อดิน: {activeSoil.soilSeries.soilTextureTh} · CEC{" "}
                          {activeSoil.soilSeries.cecCmolKg} cmol/kg
                        </div>
                      </div>

                      {/* NPK Lab Readout Grid */}
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                        <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 font-sans">
                            อินทรียวัตถุ (N)
                          </div>
                          <div className="text-xs font-bold text-[#2DD4BF]">
                            {activeSoil.organicMatterPct}%
                          </div>
                          <div className="text-[9px] text-amber-300 font-sans truncate">
                            {activeSoil.nDeficiencyLevel}
                          </div>
                        </div>
                        <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 font-sans">
                            ฟอสฟอรัส (P)
                          </div>
                          <div className="text-xs font-bold text-[#FBBF24]">
                            {activeSoil.availablePPpm} ppm
                          </div>
                          <div className="text-[9px] text-amber-300 font-sans truncate">
                            {activeSoil.pDeficiencyLevel}
                          </div>
                        </div>
                        <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 font-sans">
                            โพแทสเซียม (K)
                          </div>
                          <div className="text-xs font-bold text-sky-300">
                            {activeSoil.exchangeableKPpm} ppm
                          </div>
                          <div className="text-[9px] text-amber-300 font-sans truncate">
                            {activeSoil.kDeficiencyLevel}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Fertilizer Plan from Soil DB */}
                      <div className="bg-[#080C16] border border-[#1E293B] rounded-lg p-2.5 space-y-1 text-[11px]">
                        <div className="font-bold text-[#FBBF24]">
                          แผนปุ๋ยสั่งตัดประจำชุดดิน ({activeSoil.fertilizerPlan.recommendedFormulaLabel}):
                        </div>
                        <div className="font-mono text-slate-200">
                          • ยูเรีย (46-0-0): <strong>{activeSoil.fertilizerPlan.urea46_0_0KgPerRai} กก./ไร่</strong> | DAP (18-46-0): <strong>{activeSoil.fertilizerPlan.dap18_46_0KgPerRai} กก./ไร่</strong> | โพแทช (0-0-60): <strong>{activeSoil.fertilizerPlan.mop0_0_60KgPerRai} กก./ไร่</strong>
                        </div>
                        <div className="text-emerald-300">
                          • {activeSoil.fertilizerPlan.soilConditionerAdviceTh}
                        </div>
                      </div>
                    </div>

                    {/* Soil Deficiency Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {(
                        [
                          { id: "all", label: "ครบ 32 อำเภอ" },
                          { id: "acidic", label: "ดินกรดจัด (pH<5.5)" },
                          { id: "low_n", label: "ขาด N สูง" },
                          { id: "low_p", label: "ขาด P สูง" },
                          { id: "low_k", label: "ขาด K สูง" },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSoilDbFilter(f.id)}
                          className={`px-2 py-1 rounded border font-semibold cursor-pointer ${
                            soilDbFilter === f.id
                              ? "bg-[#14B8A6] text-[#041E1C] border-[#14B8A6] font-bold"
                              : "bg-[#0B101D] text-slate-300 border-[#1E293B]"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable 32-District Soil Database List */}
                    <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                      {filteredSoilProfiles.map((sp) => {
                        const isSelected = sp.districtId === selectedDistrict.id;
                        return (
                          <button
                            key={sp.districtId}
                            type="button"
                            onClick={() => {
                              onSelectDistrict(sp.districtId);
                              mapInstanceRef.current?.flyTo([sp.lat, sp.lon], 11, {
                                duration: 0.7,
                              });
                            }}
                            className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                              isSelected
                                ? "bg-[#141E36] text-white border-[#2DD4BF]"
                                : "bg-[#111827] text-slate-200 border-[#1E293B] hover:border-emerald-400/60"
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-bold text-white font-sans">
                                {sp.districtNameTh}
                              </span>
                              <span className="text-[#FBBF24] font-bold">
                                pH {sp.soilPh.toFixed(1)} · OM {sp.organicMatterPct}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                              <span className="truncate">{sp.soilSeries.seriesNameTh}</span>
                              <span className="text-rose-300 shrink-0 ml-2">
                                {sp.primaryDeficientNutrients[0]}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : inspectorTab === "plots" ? (
            <>
              {/* Pinned Farm Plot Inspector */}
              {focusedPlot && (
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono tabular-nums font-bold text-[#FBBF24]">
                      {focusedPlot.plotCode} · {focusedPlot.districtNameTh}
                    </span>
                    <span
                      className={`font-semibold ${
                        focusedPlot.droughtStatus === "วิกฤตแล้งรุนแรง"
                          ? "text-red-400"
                          : focusedPlot.droughtStatus === "เฝ้าระวังฝนทิ้งช่วง"
                          ? "text-[#FBBF24]"
                          : "text-[#2DD4BF]"
                      }`}
                    >
                      {focusedPlot.droughtStatus}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white">
                    {focusedPlot.cropName}
                  </div>
                  <div className="text-xs text-slate-300">
                    เกษตรกร: <strong className="text-white">{focusedPlot.farmerName}</strong> · พื้นที่{" "}
                    <strong className="font-mono tabular-nums text-[#2DD4BF]">{focusedPlot.areaRai} ไร่</strong>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1E293B] text-xs font-mono tabular-nums">
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">SPI-30 วัน</div>
                      <div className="font-bold text-white">{focusedPlot.spi30d}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">ความชื้นดิน</div>
                      <div className="font-bold text-white">
                        {focusedPlot.soilMoisturePct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">ดัชนีพืช NDVI</div>
                      <div className="font-bold text-[#2DD4BF]">
                        {focusedPlot.ndviHealthScore.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1E293B] text-xs text-slate-300">
                    <div className="flex items-center gap-1 text-[#2DD4BF] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{focusedPlot.ks01Status}</span>
                    </div>
                    {focusedPlot.estimatedKs01Baht > 0 && (
                      <div className="font-mono tabular-nums font-bold text-[#FBBF24] mt-1">
                        วงเงินช่วยเหลือ กษ.01 ประเมิน: ฿
                        {focusedPlot.estimatedKs01Baht.toLocaleString("th-TH")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scrollable List of Pinned Farm Plots */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
                  <span>รายการหมุดแปลงเกษตรในระบบ ({plots.length} แปลง)</span>
                  <span className="text-[11px] font-normal text-slate-400">คลิกเพื่อซูมดูแปลง</span>
                </div>

                <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                  {plots.map((p) => {
                    const isSelected = focusedPlot?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFocusedPlot(p);
                          onSelectDistrict(p.districtId);
                          mapInstanceRef.current?.flyTo([p.lat, p.lon], 12, {
                            duration: 0.7,
                          });
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                          isSelected
                            ? "bg-[#141E36] text-white border-[#2DD4BF] shadow-[0_0_12px_rgba(45,212,191,0.12)]"
                            : "bg-[#111827] text-slate-200 border-[#1E293B] hover:border-[#6366F1]/60 hover:bg-[#141D30]"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono tabular-nums">
                          <span className="font-semibold text-[#FBBF24]">{p.plotCode}</span>
                          <span
                            className={
                              isSelected
                                ? "text-[#2DD4BF] font-semibold"
                                : p.droughtStatus === "วิกฤตแล้งรุนแรง"
                                ? "text-red-400 font-medium"
                                : p.droughtStatus === "เฝ้าระวังฝนทิ้งช่วง"
                                ? "text-[#FBBF24] font-medium"
                                : "text-[#2DD4BF] font-medium"
                            }
                          >
                            {p.districtNameTh} · {p.areaRai} ไร่
                          </span>
                        </div>
                        <div
                          className={`truncate mt-0.5 ${
                            isSelected ? "text-slate-200" : "text-slate-400"
                          }`}
                        >
                          {p.farmerName} — {p.cropName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Southern Korat Logistics & Heavy Machinery Fuel Finder Inspector */}
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between gap-1 bg-[#0B101D] p-1 rounded-lg border border-[#1E293B] text-[11px]">
                  {(
                    [
                      { id: "all", label: "ทั้งหมด (10)" },
                      { id: "coop_transport", label: "🚛 ขนส่งสหกรณ์ (5)" },
                      { id: "heavy_fuel", label: "⛽ ปั๊มเครื่องจักร (5)" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLogisticsTypeFilter(f.id)}
                      className={`flex-1 py-1 px-2 rounded font-semibold transition-colors cursor-pointer ${
                        logisticsTypeFilter === f.id
                          ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {focusedLogisticsHub && (
                  <div className="bg-[#0B101D] border border-[#F59E0B]/50 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 font-mono">
                      <span className="font-bold text-[#FBBF24]">
                        {focusedLogisticsHub.code} · {focusedLogisticsHub.typeLabelTh}
                      </span>
                      <span className="text-[#2DD4BF] font-bold">
                        ตาชั่ง {focusedLogisticsHub.weighbridgeTons} ตัน
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white leading-snug">
                      {focusedLogisticsHub.nameTh}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <strong className="text-white">{focusedLogisticsHub.districtNameTh}</strong> ·{" "}
                      {focusedLogisticsHub.highwayCorridor}
                    </div>
                    <div className="text-[11px] text-slate-300 pt-1.5 border-t border-[#1E293B] space-y-1">
                      <div>
                        <span className="text-slate-400">รองรับเครื่องจักร:</span>{" "}
                        {focusedLogisticsHub.heavyMachinerySpec}
                      </div>
                      <div>
                        <span className="text-slate-400">บริการหลัก:</span>{" "}
                        <span className="text-[#2DD4BF]">
                          {focusedLogisticsHub.fuelOrColdChainDetail}
                        </span>
                      </div>
                      <div className="text-[#FBBF24] font-medium">
                        ★ {focusedLogisticsHub.coopMemberBenefit}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                  {KORAT_SOUTHERN_LOGISTICS_HUBS.filter(
                    (h) => logisticsTypeFilter === "all" || h.type === logisticsTypeFilter
                  ).map((hub) => {
                    const isSelected = focusedLogisticsHub?.id === hub.id;
                    return (
                      <button
                        key={hub.id}
                        type="button"
                        onClick={() => {
                          setFocusedLogisticsHub(hub);
                          onSelectDistrict(hub.districtId);
                          mapInstanceRef.current?.flyTo([hub.lat, hub.lon], 12, {
                            duration: 0.75,
                          });
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                          isSelected
                            ? "bg-[#141E36] text-white border-[#FBBF24] shadow-xs"
                            : "bg-[#111827] text-slate-200 border-[#1E293B] hover:border-[#F59E0B]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-[#FBBF24]">
                            {hub.type === "coop_transport" ? "🚛" : "⛽"} {hub.code} · {hub.districtNameTh}
                          </span>
                          <span className="text-[10px] text-[#2DD4BF]">
                            {hub.typeLabelTh}
                          </span>
                        </div>
                        <div className="font-semibold text-white truncate mt-0.5">
                          {hub.nameTh}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {hub.highwayCorridor}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
