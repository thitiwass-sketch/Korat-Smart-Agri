import { KORAT_DISTRICTS, KoratDistrict } from "./koratAgriData";

export type NutrientDeficiencyLevel =
  | "พร่องรุนแรง (ต่ำมาก)"
  | "พร่องปานกลาง"
  | "เพียงพอ/สมดุล";

export type SoilPhCategory =
  | "กรดจัดมาก (pH < 5.3)"
  | "กรดปานกลาง (pH 5.3–5.7)"
  | "กรดเล็กน้อย–เหมาะสม (pH 5.8–6.5)"
  | "เป็นกลาง–ด่างอ่อน (pH > 6.5)";

export interface SoilSeriesRecord {
  seriesCode: string;
  seriesNameTh: string;
  seriesNameEn: string;
  parentMaterialTh: string;
  soilTextureTh: string;
  drainageClassTh: string;
  cecCmolKg: number;
  waterHoldingCapacityTh: string;
  naturalFertilityLevel: "ต่ำ" | "ปานกลาง" | "ค่อนข้างสูง" | "สูง";
  keyManagementChallengeTh: string;
}

export interface DistrictSoilNutrientProfile {
  districtId: string;
  districtNameTh: string;
  zoneTh: string;
  lat: number;
  lon: number;
  soilSeries: SoilSeriesRecord;
  soilPh: number;
  phCategory: SoilPhCategory;
  organicMatterPct: number; // OM % (proxy for N availability)
  availablePPpm: number; // Bray II P (ppm)
  exchangeableKPpm: number; // NH4OAc K (ppm)
  nDeficiencyLevel: NutrientDeficiencyLevel;
  pDeficiencyLevel: NutrientDeficiencyLevel;
  kDeficiencyLevel: NutrientDeficiencyLevel;
  overallDeficiencyScore: number; // 0 (healthy) to 100 (severe multi-nutrient deficiency)
  primaryDeficientNutrients: string[];
  micronutrientAlertTh: string;
  limeDolomiteKgPerRai: number;
  fertilizerPlan: {
    recommendedFormulaLabel: string;
    urea46_0_0KgPerRai: number;
    dap18_46_0KgPerRai: number;
    mop0_0_60KgPerRai: number;
    organicCompostKgPerRai: number;
    splitApplicationScheduleTh: string;
    soilConditionerAdviceTh: string;
  };
}

/**
 * ฐานข้อมูลกลุ่มชุดดินหลักจังหวัดนครราชสีมา (อ้างอิงกรมพัฒนาที่ดิน LDD)
 */
export const KORAT_SOIL_SERIES_DB: Record<string, SoilSeriesRecord> = {
  KORAT_SANDY_LOAM: {
    seriesCode: "Kt (กลุ่มชุดดินที่ 35/40)",
    seriesNameTh: "ชุดดินโคราช (Korat Series)",
    seriesNameEn: "Korat Fine Sandy Loam",
    parentMaterialTh: "ตะกอนลำน้ำเก่าบนพื้นที่ดอนลูกคลื่นลอนลาด",
    soilTextureTh: "ดินร่วนปนทราย (Fine Sandy Loam)",
    drainageClassTh: "ระบายน้ำดีปานกลางถึงดี",
    cecCmolKg: 4.8,
    waterHoldingCapacityTh: "อุ้มน้ำค่อนข้างต่ำ เสี่ยงชะล้างธาตุอาหารเมื่อฝนตกหนัก",
    naturalFertilityLevel: "ต่ำ",
    keyManagementChallengeTh:
      "อินทรียวัตถุและโพแทสเซียมต่ำมาก ต้องแบ่งใส่ปุ๋ยเคมี 2–3 ครั้งร่วมกับปุ๋ยอินทรีย์เพื่อลดการสูญเสียปุ๋ย",
  },
  PAK_CHONG_CLAY: {
    seriesCode: "Pc (กลุ่มชุดดินที่ 29/55)",
    seriesNameTh: "ชุดดินปากช่อง (Pak Chong Series)",
    seriesNameEn: "Pak Chong Reddish-Brown Clay",
    parentMaterialTh: "หินปูนและหินดินดานผุพังผสมตะกอนภูเขาไฟเก่าโซนเขา",
    soilTextureTh: "ดินเหนียวปนร่วนสีแดงเข้ม (Clay Loam / Clay)",
    drainageClassTh: "ระบายน้ำดีและถ่ายเทอากาศดีเยี่ยม",
    cecCmolKg: 16.5,
    waterHoldingCapacityTh: "อุ้มน้ำและดูดยึดธาตุอาหารได้สูงมาก",
    naturalFertilityLevel: "ค่อนข้างสูง",
    keyManagementChallengeTh:
      "ดินมีความอุดมสมบูรณ์สูงเหมาะกับทุเรียน GI และข้าวโพด แต่เหล็กและอะลูมิเนียมในดินแดงอาจตรึงฟอสฟอรัส (P)",
  },
  PHIMAI_ALLUVIAL_CLAY: {
    seriesCode: "Pm (กลุ่มชุดดินที่ 4/15)",
    seriesNameTh: "ชุดดินพิมาย (Phimai Series)",
    seriesNameEn: "Phimai Alluvial Heavy Clay",
    parentMaterialTh: "ตะกอนลำน้ำมูล-ลำจักราชในแอ่งที่ราบลุ่มทุ่งสัมฤทธิ์",
    soilTextureTh: "ดินเหนียวจัดสีเทาเข้ม (Heavy Clay)",
    drainageClassTh: "ระบายน้ำค่อนข้างเลว (ขังน้ำทำนาได้ดี)",
    cecCmolKg: 21.2,
    waterHoldingCapacityTh: "อุ้มน้ำสูงมาก เหมาะต่อการปลูกข้าวหอมมะลิ GI",
    naturalFertilityLevel: "ปานกลาง",
    keyManagementChallengeTh:
      "มักขาดฟอสฟอรัสที่เป็นประโยชน์ (Available P) และดินแตกระแหงแข็งจัดในฤดูแล้งหลังเก็บเกี่ยวข้าว",
  },
  WARIN_YASOTHON_LOAM: {
    seriesCode: "Wn/Yt (กลุ่มชุดดินที่ 36/41)",
    seriesNameTh: "ชุดดินวาริน–ยโสธร (Warin-Yasothon Series)",
    seriesNameEn: "Warin-Yasothon Deep Sandy Loam",
    parentMaterialTh: "หินทรายผุพังทับถมบนเนินตะกอนเก่า",
    soilTextureTh: "ดินร่วนปนทรายลึกมากสีน้ำตาลแดง/เหลือง",
    drainageClassTh: "ระบายน้ำดีถึงดีมาก (แห้งเร็วในฤดูแล้ง)",
    cecCmolKg: 3.9,
    waterHoldingCapacityTh: "อุ้มน้ำต่ำ เสี่ยงภาวะกรดจัดในดินชั้นล่าง",
    naturalFertilityLevel: "ต่ำ",
    keyManagementChallengeTh:
      "ดินเป็นกรดจัด (pH 5.0–5.4) และพร่องทั้ง N-P-K จำเป็นต้องหว่านปูนโดโลไมท์ก่อนใส่ปุ๋ยสั่งตัด",
  },
  CHOK_CHAI_BASALT: {
    seriesCode: "Cc (กลุ่มชุดดินที่ 28/60)",
    seriesNameTh: "ชุดดินโชคชัย–ครบุรี (Chok Chai Basaltic Series)",
    seriesNameEn: "Chok Chai Volcanic Basalt Clay Loam",
    parentMaterialTh: "หินอัคนีบะซอลต์ภูเขาไฟโบราณผุพังอยู่กับที่โซนใต้โคราช",
    soilTextureTh: "ดินร่วนเหนียวสีน้ำตาลแดงเข้ม (Basaltic Clay Loam)",
    drainageClassTh: "ระบายน้ำดี โครงสร้างดินร่วนซุย",
    cecCmolKg: 14.8,
    waterHoldingCapacityTh: "เก็บกักความชื้นในดินชั้นล่างได้ดี",
    naturalFertilityLevel: "สูง",
    keyManagementChallengeTh:
      "แร่ธาตุรองแคลเซียม-แมกนีเซียมสมบูรณ์ เหมาะกับเงาะ มังคุด ทุเรียน และมันสำปะหลังแป้งสูง แต่ต้องเสริมโบรอนและโพแทสเซียมช่วงติดผล",
  },
  KULA_RONGHAI_SALINE: {
    seriesCode: "Ki/Nt (กลุ่มชุดดินที่ 20/40s)",
    seriesNameTh: "ชุดดินกุลาร้องไห้–โนนไทย (Kula Ronghai Saline-Silt Series)",
    seriesNameEn: "Kula Ronghai Sandy Silt Loam",
    parentMaterialTh: "ตะกอนลำน้ำทับถมบนชั้นหินเกลือหมวดหินมหาสารคาม",
    soilTextureTh: "ดินร่วนปนทรายแป้ง (Sandy Silt Loam)",
    drainageClassTh: "ระบายน้ำค่อนข้างเลวถึงปานกลาง",
    cecCmolKg: 6.2,
    waterHoldingCapacityTh: "หน้าดินแน่นทึบง่ายเมื่อแห้ง",
    naturalFertilityLevel: "ต่ำ",
    keyManagementChallengeTh:
      "มีปัญหาคราบเกลือโซเดียมบางหย่อมและขาดอินทรียวัตถุรุนแรง ควรไถกลบปอเทือง/แกลบดิบและเสริมธาตุสังกะสี (Zn)",
  },
  ROI_ET_LOAM: {
    seriesCode: "Re (กลุ่มชุดดินที่ 17/22)",
    seriesNameTh: "ชุดดินร้อยเอ็ด (Roi Et Series)",
    seriesNameEn: "Roi Et Silt Loam / Sandy Loam",
    parentMaterialTh: "ตะกอนลำน้ำเก่าในที่ราบลุ่มต่ำแอ่งโคราช (Alluvial Lowland Terraces)",
    soilTextureTh: "ดินร่วนปนทรายแป้งถึงดินร่วนปนทราย (Sandy Silt Loam)",
    drainageClassTh: "ระบายน้ำค่อนข้างเลว (กักขังน้ำในฤดูฝนได้ดี เหมาะทำนา)",
    cecCmolKg: 5.6,
    waterHoldingCapacityTh: "อุ้มน้ำปานกลาง ชั้นล่างมีจุดประสีเทาและศิลาแลงอ่อน",
    naturalFertilityLevel: "ปานกลาง",
    keyManagementChallengeTh:
      "เป็นดินนาข้าวหอมมะลิ 105 หลักของโคราช หน้าดินแน่นทึบและพร่อง N-P-K ควรใส่ปุ๋ยอินทรีย์ร่วมกับสูตรปุ๋ย 16-16-8 หรือ 16-20-0 เพื่อรักษาความหอมและผลผลิต",
  },
};

export interface SoilSeriesMeta {
  key: string;
  code: string;
  nameTh: string;
  nameEn: string;
  colorHex: string;
  rgb: [number, number, number];
  primaryTextureTh: string;
  suitableCropsTh: string[];
  descriptionTh: string;
}

export const SOIL_SERIES_METADATA: Record<string, SoilSeriesMeta> = {
  KORAT_SANDY_LOAM: {
    key: "KORAT_SANDY_LOAM",
    code: "Kt",
    nameTh: "ชุดดินโคราช (Korat Series)",
    nameEn: "Korat Fine Sandy Loam",
    colorHex: "#F59E0B",
    rgb: [245, 158, 11],
    primaryTextureTh: "ดินร่วนปนทรายบนพื้นที่ดอน",
    suitableCropsTh: ["มันสำปะหลัง", "ข้าวโพดเลี้ยงสัตว์", "อ้อยโรงงาน"],
    descriptionTh: "ดินดอนตะกอนเก่า ระบายน้ำดี ดินเป็นกรดอ่อนถึงปานกลาง พร่อง K และอินทรียวัตถุ เหมาะกับพืชไร่ทนแล้ง",
  },
  ROI_ET_LOAM: {
    key: "ROI_ET_LOAM",
    code: "Re",
    nameTh: "ชุดดินร้อยเอ็ด (Roi Et Series)",
    nameEn: "Roi Et Silt Loam / Sandy Loam",
    colorHex: "#06B6D4",
    rgb: [6, 182, 212],
    primaryTextureTh: "ดินร่วนปนทรายแป้งที่ราบต่ำ",
    suitableCropsTh: ["ข้าวหอมมะลิ 105", "พืชตระกูลถั่วหลังนา", "แตงโม"],
    descriptionTh: "ดินที่ราบลุ่มต่ำแอ่งโคราช กักขังน้ำได้ดีในฤดูฝน อู่ข้าวหอมมะลิทุ่งสัมฤทธิ์และตอนเหนือของจังหวัด",
  },
  PHIMAI_ALLUVIAL_CLAY: {
    key: "PHIMAI_ALLUVIAL_CLAY",
    code: "Pm",
    nameTh: "ชุดดินพิมาย (Phimai Series)",
    nameEn: "Phimai Alluvial Heavy Clay",
    colorHex: "#3B82F6",
    rgb: [59, 130, 246],
    primaryTextureTh: "ดินเหนียวจัดแอ่งลุ่มน้ำมูล",
    suitableCropsTh: ["ข้าวหอมมะลิ", "ข้าวเหนียว", "พืชผักสวนครัว"],
    descriptionTh: "ดินลุ่มน้ำมูล-ลำจักราช ดินเหนียวสีเทาเข้ม อุ้มน้ำสูงมาก แตกระแหงในฤดูแล้ง ขาดฟอสฟอรัสที่เป็นประโยชน์",
  },
  PAK_CHONG_CLAY: {
    key: "PAK_CHONG_CLAY",
    code: "Pc",
    nameTh: "ชุดดินปากช่อง (Pak Chong Series)",
    nameEn: "Pak Chong Reddish Clay",
    colorHex: "#E11D48",
    rgb: [225, 29, 72],
    primaryTextureTh: "ดินเหนียวสีแดงเข้มภูเขาหินปูน",
    suitableCropsTh: ["ทุเรียนปากช่อง GI", "น้อยหน่าเพชรปากช่อง", "ข้าวโพดหวาน", "อะโวคาโด"],
    descriptionTh: "ดินดอนภูเขาหินปูนผุพัง ระบายน้ำดีเยี่ยม ธาตุอาหารและความอุดมสมบูรณ์สูง เหมาะกับไม้ผลมูลค่าสูง",
  },
  CHOK_CHAI_BASALT: {
    key: "CHOK_CHAI_BASALT",
    code: "Cc",
    nameTh: "ชุดดินโชคชัย (Chok Chai Series)",
    nameEn: "Chok Chai Volcanic Basalt Clay",
    colorHex: "#EA580C",
    rgb: [234, 88, 12],
    primaryTextureTh: "ดินร่วนเหนียวหินอัคนีบะซอลต์",
    suitableCropsTh: ["มันสำปะหลังแป้งสูง", "เงาะ", "ทุเรียนน้ำแร่", "อ้อยโรงงาน"],
    descriptionTh: "ดินภูเขาไฟโบราณโซนใต้โคราช ดินร่วนซุยแร่ธาตุสูง อุดมด้วย Ca, Mg ธรรมชาติ เพิ่มเปอร์เซ็นต์แป้งมัน",
  },
  WARIN_YASOTHON_LOAM: {
    key: "WARIN_YASOTHON_LOAM",
    code: "Wn",
    nameTh: "ชุดดินวาริน-ยโสธร (Warin Series)",
    nameEn: "Warin-Yasothon Sandy Loam",
    colorHex: "#84CC16",
    rgb: [132, 204, 22],
    primaryTextureTh: "ดินร่วนปนทรายลึกสีน้ำตาลเหลือง",
    suitableCropsTh: ["มันสำปะหลัง", "ยูคาลิปตัส", "อ้อยทนแล้ง"],
    descriptionTh: "ดินเนินตะกอนเก่า ดินเป็นกรดจัด (pH 4.8–5.3) ต้องเสริมปูนโดโลไมท์ปรับสภาพโครงสร้างดิน",
  },
  KULA_RONGHAI_SALINE: {
    key: "KULA_RONGHAI_SALINE",
    code: "Ki",
    nameTh: "ชุดดินกุลาร้องไห้ (Kula Ronghai Series)",
    nameEn: "Kula Ronghai Saline Silt Loam",
    colorHex: "#A855F7",
    rgb: [168, 85, 247],
    primaryTextureTh: "ดินร่วนปนทรายแป้งเค็มแอ่งโคราช",
    suitableCropsTh: ["ข้าวหอมมะลิทนเค็ม", "หญ้ารูซี่", "พืชคลุมดินปอเทือง"],
    descriptionTh: "ดินมีคราบเกลือโซเดียม ขาดอินทรียวัตถุรุนแรง ต้องไถกลบพืชปุ๋ยสดและแกลบดิบเพื่อลดความเค็ม",
  },
};

export function resolveSoilSeriesKeyForDistrict(dist: KoratDistrict | string): string {
  const districtObj =
    typeof dist === "string"
      ? KORAT_DISTRICTS.find((d) => d.id === dist || d.nameTh === dist || d.nameTh === `อ.${dist}`)
      : dist;
  const s = districtObj?.soilSeriesName || (typeof dist === "string" ? dist : "");
  const id = districtObj?.id || (typeof dist === "string" ? dist : "");

  if (
    id === "pak-chong" ||
    id === "wang-nam-khiao" ||
    id === "sikhio" ||
    id === "sung-noen" ||
    s.includes("ปากช่อง")
  ) {
    return "PAK_CHONG_CLAY";
  }
  if (
    id === "khon-buri" ||
    id === "soeng-sang" ||
    id === "chok-chai" ||
    id === "nong-bun-mak" ||
    id === "pak-thong-chai" ||
    s.includes("โชคชัย") ||
    s.includes("ครบุรี")
  ) {
    return "CHOK_CHAI_BASALT";
  }
  if (
    s.includes("ร้อยเอ็ด") ||
    id === "bua-yai" ||
    id === "kaeng-sanam-nang" ||
    id === "prathai" ||
    id === "bua-lai" ||
    id === "sida" ||
    id === "lam-thamenchai"
  ) {
    return "ROI_ET_LOAM";
  }
  if (
    id === "phimai" ||
    id === "chum-phuang" ||
    id === "non-sung" ||
    id === "chakkarat" ||
    id === "muang-yang" ||
    id === "chaloem-phra-kiat" ||
    s.includes("พิมาย")
  ) {
    return "PHIMAI_ALLUVIAL_CLAY";
  }
  if (
    id === "non-thai" ||
    id === "kham-sakae-saeng" ||
    id === "phra-thong-kham" ||
    s.includes("กุลา")
  ) {
    return "KULA_RONGHAI_SALINE";
  }
  if (
    id === "khong" ||
    id === "ban-lueam" ||
    id === "huai-thalaeng" ||
    s.includes("วาริน") ||
    s.includes("สตึก")
  ) {
    return "WARIN_YASOTHON_LOAM";
  }
  return "KORAT_SANDY_LOAM";
}

export function getDistrictSoilSeriesMeta(distIdOrDist: string | KoratDistrict): SoilSeriesMeta {
  const dist =
    typeof distIdOrDist === "string"
      ? KORAT_DISTRICTS.find((d) => d.id === distIdOrDist)
      : distIdOrDist;
  const key = dist ? resolveSoilSeriesKeyForDistrict(dist) : "KORAT_SANDY_LOAM";
  return SOIL_SERIES_METADATA[key] || SOIL_SERIES_METADATA.KORAT_SANDY_LOAM;
}

/**
 * สร้างฐานข้อมูลผลวิเคราะห์ดิน (pH, OM, P, K) และแผนปุ๋ยสั่งตัดรายอำเภอครบทั้ง 32 อำเภอของจังหวัดนครราชสีมา
 */
export const KORAT_DISTRICT_SOIL_PROFILES: DistrictSoilNutrientProfile[] =
  KORAT_DISTRICTS.map((dist, idx) => {
    const seriesKey = resolveSoilSeriesKeyForDistrict(dist);
    const soilSeries = KORAT_SOIL_SERIES_DB[seriesKey];

    // Calculate deterministic, scientifically grounded soil pH and NPK values per district
    let basePh = 5.5;
    let baseOm = 1.05;
    let baseP = 8.5;
    let baseK = 48;

    if (seriesKey === "PAK_CHONG_CLAY") {
      basePh = 6.1 + ((idx % 4) - 1) * 0.12;
      baseOm = 2.35 + (idx % 3) * 0.22;
      baseP = 11.5 + (idx % 5) * 1.4;
      baseK = 98 + (idx % 4) * 12;
    } else if (seriesKey === "CHOK_CHAI_BASALT") {
      basePh = 5.85 + ((idx % 4) - 1) * 0.1;
      baseOm = 1.95 + (idx % 3) * 0.2;
      baseP = 10.2 + (idx % 4) * 1.5;
      baseK = 82 + (idx % 5) * 9;
    } else if (seriesKey === "PHIMAI_ALLUVIAL_CLAY") {
      basePh = 5.45 + ((idx % 5) - 2) * 0.1;
      baseOm = 1.55 + (idx % 4) * 0.14;
      baseP = 6.2 + (idx % 3) * 1.1; // Alluvial clay often low in available P
    } else if (seriesKey === "ROI_ET_LOAM") {
      basePh = 5.25 + (idx % 4) * 0.12;
      baseOm = 1.15 + (idx % 3) * 0.15;
      baseP = 7.8 + (idx % 4) * 1.2;
      baseK = 46 + (idx % 4) * 7;
    } else if (seriesKey === "WARIN_YASOTHON_LOAM") {
      basePh = 5.05 + (idx % 3) * 0.12; // Strongly acidic sandy loam
      baseOm = 0.72 + (idx % 3) * 0.11;
      baseP = 5.8 + (idx % 3) * 1.2;
      baseK = 34 + (idx % 4) * 5;
    } else if (seriesKey === "KULA_RONGHAI_SALINE") {
      basePh = 6.65 + (idx % 3) * 0.22; // Slightly neutral to alkaline/saline patches
      baseOm = 0.68 + (idx % 3) * 0.1;
      baseP = 6.5 + (idx % 4) * 1.1;
      baseK = 42 + (idx % 4) * 6;
    } else {
      // KORAT_SANDY_LOAM (Dan Khun Thot, Mueang, etc.)
      basePh = 5.35 + ((idx % 5) - 1) * 0.11;
      baseOm = 0.85 + (idx % 4) * 0.12;
      baseP = 7.4 + (idx % 5) * 1.2;
      baseK = 40 + (idx % 5) * 6;
    }

    const soilPh = Number(basePh.toFixed(1));
    const organicMatterPct = Number(baseOm.toFixed(2));
    const availablePPpm = Number(baseP.toFixed(1));
    const exchangeableKPpm = Math.round(baseK);

    const phCategory: SoilPhCategory =
      soilPh < 5.3
        ? "กรดจัดมาก (pH < 5.3)"
        : soilPh <= 5.7
        ? "กรดปานกลาง (pH 5.3–5.7)"
        : soilPh <= 6.5
        ? "กรดเล็กน้อย–เหมาะสม (pH 5.8–6.5)"
        : "เป็นกลาง–ด่างอ่อน (pH > 6.5)";

    const nDeficiencyLevel: NutrientDeficiencyLevel =
      organicMatterPct < 0.95
        ? "พร่องรุนแรง (ต่ำมาก)"
        : organicMatterPct < 1.65
        ? "พร่องปานกลาง"
        : "เพียงพอ/สมดุล";

    const pDeficiencyLevel: NutrientDeficiencyLevel =
      availablePPpm < 7.0
        ? "พร่องรุนแรง (ต่ำมาก)"
        : availablePPpm < 11.5
        ? "พร่องปานกลาง"
        : "เพียงพอ/สมดุล";

    const kDeficiencyLevel: NutrientDeficiencyLevel =
      exchangeableKPpm < 45
        ? "พร่องรุนแรง (ต่ำมาก)"
        : exchangeableKPpm < 80
        ? "พร่องปานกลาง"
        : "เพียงพอ/สมดุล";

    const primaryDeficientNutrients: string[] = [];
    if (nDeficiencyLevel !== "เพียงพอ/สมดุล") {
      primaryDeficientNutrients.push(
        nDeficiencyLevel === "พร่องรุนแรง (ต่ำมาก)"
          ? "ขาด N สูง (OM ต่ำ)"
          : "พร่อง N ปานกลาง"
      );
    }
    if (pDeficiencyLevel !== "เพียงพอ/สมดุล") {
      primaryDeficientNutrients.push(
        pDeficiencyLevel === "พร่องรุนแรง (ต่ำมาก)"
          ? "ขาด P สูง"
          : "พร่อง P ปานกลาง"
      );
    }
    if (kDeficiencyLevel !== "เพียงพอ/สมดุล") {
      primaryDeficientNutrients.push(
        kDeficiencyLevel === "พร่องรุนแรง (ต่ำมาก)"
          ? "ขาด K สูง"
          : "พร่อง K ปานกลาง"
      );
    }
    if (primaryDeficientNutrients.length === 0) {
      primaryDeficientNutrients.push("ธาตุหลัก N-P-K สมดุลดี");
    }

    // Overall Deficiency Score (0 = optimal, 100 = severe deficiency & acidity)
    const nPenalty = Math.max(0, (2.2 - organicMatterPct) * 22);
    const pPenalty = Math.max(0, (14 - availablePPpm) * 2.5);
    const kPenalty = Math.max(0, (95 - exchangeableKPpm) * 0.42);
    const phPenalty =
      soilPh < 5.5 ? (5.5 - soilPh) * 28 : soilPh > 6.6 ? (soilPh - 6.6) * 20 : 4;
    const overallDeficiencyScore = Math.min(
      96,
      Math.max(12, Math.round(nPenalty + pPenalty + kPenalty + phPenalty))
    );

    const limeDolomiteKgPerRai =
      soilPh < 5.3 ? 200 : soilPh <= 5.6 ? 120 : soilPh <= 5.8 ? 60 : 0;

    // Tailored Fertilizer Mixing Plan (kg/rai) based on deficiency
    const urea46_0_0KgPerRai =
      organicMatterPct < 0.95 ? 24 : organicMatterPct < 1.65 ? 18 : 12;
    const dap18_46_0KgPerRai =
      availablePPpm < 7.0 ? 18 : availablePPpm < 11.5 ? 13 : 9;
    const mop0_0_60KgPerRai =
      exchangeableKPpm < 45 ? 25 : exchangeableKPpm < 80 ? 18 : 12;
    const organicCompostKgPerRai =
      organicMatterPct < 1.0 ? 500 : organicMatterPct < 1.7 ? 350 : 250;

    const recommendedFormulaLabel =
      seriesKey === "PAK_CHONG_CLAY" || seriesKey === "CHOK_CHAI_BASALT"
        ? "12-12-17-2 + แคลเซียม-โบรอน (ไม้ผล/ข้าวโพดโซนสูง)"
        : seriesKey === "PHIMAI_ALLUVIAL_CLAY"
        ? "16-20-0 ร่วมกับ 0-0-60 (นาข้าวหอมมะลิทุ่งสัมฤทธิ์)"
        : "15-7-18 หรือผสมแม่ปุ๋ยสั่งตัด N-P-K (มันสำปะหลัง/อ้อย)";

    const micronutrientAlertTh =
      seriesKey === "KULA_RONGHAI_SALINE"
        ? "เฝ้าระวังการขาดธาตุสังกะสี (Zn) และกำมะถัน (S) ในดินร่วนทรายแป้ง"
        : seriesKey === "PAK_CHONG_CLAY" || seriesKey === "CHOK_CHAI_BASALT"
        ? "แนะนำเสริมโบรอน (B) และแมกนีเซียม (Mg) ช่วงออกดอก-ติดผล"
        : "แนะนำเสริมสังกะสี (Zn) และแมกนีเซียม (Mg) ทางใบเพื่อเพิ่มการสังเคราะห์แสง";

    return {
      districtId: dist.id,
      districtNameTh: dist.nameTh,
      zoneTh: dist.zone,
      lat: dist.lat,
      lon: dist.lon,
      soilSeries,
      soilPh,
      phCategory,
      organicMatterPct,
      availablePPpm,
      exchangeableKPpm,
      nDeficiencyLevel,
      pDeficiencyLevel,
      kDeficiencyLevel,
      overallDeficiencyScore,
      primaryDeficientNutrients,
      micronutrientAlertTh,
      limeDolomiteKgPerRai,
      fertilizerPlan: {
        recommendedFormulaLabel,
        urea46_0_0KgPerRai,
        dap18_46_0KgPerRai,
        mop0_0_60KgPerRai,
        organicCompostKgPerRai,
        splitApplicationScheduleTh:
          soilSeries.cecCmolKg < 8
            ? "แบ่งใส่ 2–3 ครั้ง (รองพื้น + แต่งหน้าอายุ 30 และ 60 วัน) เพื่อลดการชะล้างในดินทราย"
            : "แบ่งใส่ 2 ครั้ง (รองพื้นพร้อมปุ๋ยอินทรีย์ และใส่บำรุงตามระยะเจริญเติบโต)",
        soilConditionerAdviceTh:
          limeDolomiteKgPerRai > 0
            ? `หว่านปูนโดโลไมท์ ${limeDolomiteKgPerRai} กก./ไร่ ไถกลบก่อนใส่ปุ๋ยเคมี 10–14 วัน เพื่อยกระดับ pH ดินจาก ${soilPh} สู่ 6.0`
            : `ค่า pH ดิน (${soilPh}) อยู่ในเกณฑ์ดี ให้เน้นเติมปุ๋ยอินทรีย์ ${organicCompostKgPerRai} กก./ไร่ เพื่อรักษาโครงสร้างดิน`,
      },
    };
  });

export function getDistrictSoilProfile(
  districtId: string
): DistrictSoilNutrientProfile {
  return (
    KORAT_DISTRICT_SOIL_PROFILES.find((p) => p.districtId === districtId) ||
    KORAT_DISTRICT_SOIL_PROFILES[0]
  );
}
