import aerialImg from "../assets/images/korat_precision_farm_aerial_1791242838699.jpg";
import cmvImg from "../assets/images/korat_cassava_cmv_reference_1791242851880.jpg";
import droughtPlotImg from "../assets/images/korat_drought_plot_sample_1791242862151.jpg";

export const KORAT_ASSETS = {
  aerialHero: aerialImg,
  cassavaCmvGuide: cmvImg,
  droughtSamplePlot: droughtPlotImg,
};

export interface KoratDistrict {
  id: string;
  nameTh: string;
  nameEn: string;
  zone: string;
  lat: number;
  lon: number;
  mapX: number;
  mapY: number;
  rainProbToday: number;
  forecastRain14dMm: number;
  normalRain30dMm: number;
  spi14d: number;
  spi30d: number;
  droughtRiskLevel: "วิกฤตแล้งรุนแรง" | "เฝ้าระวังฝนทิ้งช่วง" | "สมดุลปกติ";
  gistdaSoilMoisturePct: number;
  maxTempC: number;
  minTempC: number;
  extremeAlertTitle: string;
  extremeAlertDetail: string;
  affectedCropStage: string;
  soilSeriesName: string;
  defaultSoilTest: {
    omPercent: number;
    availPPpm: number;
    exchKPpm: number;
    soilPh: number;
  };
  primaryCrops: string[];
  cmvOutbreakStatus: "เฝ้าระวังสูง" | "พบจุดระบาดประปราย" | "พื้นที่ปลอดภัย";
}

/**
 * Utility to format district names consistently and prevent duplicated "อ." prefixes (e.g. "อ.อ.").
 * Ensures all district names have exactly one "อ." prefix:
 * e.g., "อ.อ.ด่านขุนทด" -> "อ.ด่านขุนทด"
 *       "อ.ด่านขุนทด" -> "อ.ด่านขุนทด"
 *       "ด่านขุนทด" -> "อ.ด่านขุนทด"
 */
export function formatDistrictName(name?: string | null): string {
  if (!name) return "";
  const stripped = name.replace(/^(อ\.)+/g, "").trim();
  return `อ.${stripped}`;
}

/**
 * Sanitizes any duplicate "อ." prefixes in place.
 */
export function cleanDistrictName(name?: string | null): string {
  if (!name) return "";
  return name.replace(/^(อ\.)+/g, "อ.").trim();
}

/**
 * Strips any leading "อ." prefix from the district name.
 * e.g., "อ.ด่านขุนทด" -> "ด่านขุนทด"
 *       "อ.อ.ด่านขุนทด" -> "ด่านขุนทด"
 */
export function stripDistrictPrefix(name?: string | null): string {
  if (!name) return "";
  return name.replace(/^(อ\.)+/g, "").trim();
}

export const KORAT_DISTRICTS: KoratDistrict[] = [
  {
    id: "mueang-nakhon-ratchasima",
    nameTh: "อ.เมืองนครราชสีมา",
    nameEn: "Mueang Nakhon Ratchasima",
    zone: "โซนกลาง-ลุ่มน้ำลำตะคอง",
    lat: 14.9799,
    lon: 102.0978,
    mapX: 380,
    mapY: 245,
    rainProbToday: 55,
    forecastRain14dMm: 56.2,
    normalRain30dMm: 148,
    spi14d: -0.64,
    spi30d: -0.71,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 45,
    maxTempC: 35.2,
    minTempC: 24.3,
    extremeAlertTitle: "ฝนฟ้าคะนองกระจาย 55% ช่วงบ่าย-ค่ำ · บริหารจัดการน้ำท้ายเขื่อนลำตะคอง",
    extremeAlertDetail:
      "พื้นที่เกษตรรอบเขตเมืองและท้ายเขื่อนลำตะคองมีค่า SPI -0.71 อยู่ในเกณฑ์สมดุลปกติ ความชื้นดิน 45% แนะนำเกษตรกรผู้ปลูกข้าวนาปีและพืชผักเศรษฐกิจสำรองน้ำในสระประจำไร่นา",
    affectedCropStage:
      "ข้าวนาปีระยะตั้งท้อง-ออกรวง และแปลงพืชผัก/ไม้ตัดดอกเศรษฐกิจรอบเขตเมือง",
    soilSeriesName: "ชุดดินโคราช/จัตุรัส (ดินร่วนปนทรายถึงดินร่วนเหนียว)",
    defaultSoilTest: {
      omPercent: 1.15,
      availPPpm: 9.4,
      exchKPpm: 58,
      soilPh: 5.9,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "พืชผักเศรษฐกิจ"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "dan-khun-thot",
    nameTh: "อ.ด่านขุนทด",
    nameEn: "Dan Khun Thot",
    zone: "โซนตะวันตก-เหนือ",
    lat: 15.2089,
    lon: 101.7694,
    mapX: 255,
    mapY: 165,
    rainProbToday: 75,
    forecastRain14dMm: 58.4,
    normalRain30dMm: 142,
    spi14d: -1.22,
    spi30d: -1.35,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 31,
    maxTempC: 36.8,
    minTempC: 24.5,
    extremeAlertTitle: "โอกาสฝนตก 75% วันนี้ · เตือนพายุลมกระโชกแรงและอุณหภูมิสะสมสูง",
    extremeAlertDetail:
      "แนวร่องมรสุมพาดผ่านพื้นที่ อ.ด่านขุนทด ส่งผลให้มีโอกาสฝนฟ้าคะนอง 75% ในช่วงบ่าย-ค่ำ แต่ภาพรวม 30 วันยังมีค่า SPI -1.35 (ฝนทิ้งช่วงสะสม) และอุณหภูมิกลางวันแตะ 36.8°C",
    affectedCropStage:
      "ข้าวโพดเลี้ยงสัตว์ระยะออกดอกตัวผู้/แทงไหม เสี่ยงเกสรฝ่อหากขาดน้ำ และมันสำปะหลังอายุ 3–6 เดือนควรระวังน้ำขังรากเน่าในที่ลุ่มหลังฝนตกหนัก",
    soilSeriesName: "ชุดดินโคราช (Korat Series - ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.72,
      availPPpm: 6.5,
      exchKPpm: 38,
      soilPh: 5.4,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวโพดเลี้ยงสัตว์", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "เฝ้าระวังสูง",
  },
  {
    id: "soeng-sang",
    nameTh: "อ.เสิงสาง",
    nameEn: "Soeng Sang",
    zone: "โซนตะวันออกเฉียงใต้",
    lat: 14.4264,
    lon: 102.4608,
    mapX: 555,
    mapY: 390,
    rainProbToday: 65,
    forecastRain14dMm: 82.0,
    normalRain30dMm: 168,
    spi14d: -0.38,
    spi30d: -0.45,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 54,
    maxTempC: 33.9,
    minTempC: 23.4,
    extremeAlertTitle: "ความชื้นสัมพัทธ์สูง · เฝ้าระวังการระบาดของแมลงหวี่ขาวในมันสำปะหลัง",
    extremeAlertDetail:
      "ปริมาณฝนสะสมอยู่ในเกณฑ์ใกล้ค่าปกติ (SPI -0.45) ความชื้นในดิน 54% เอื้อต่อการสะสมแป้งในหัวมันสำปะหลัง แต่ต้องเฝ้าระวังแมลงหวี่ขาวพาหะโรคใบด่าง",
    affectedCropStage:
      "มันสำปะหลังระยะสะสมแป้ง (8–11 เดือน) ควรตรวจวัดเปอร์เซ็นต์แป้งก่อนขุดขายหลังฝนตกหนัก 5–7 วัน",
    soilSeriesName: "ชุดดินโชคชัย (Chok Chai Series - ดินเหนียวสีแดง)",
    defaultSoilTest: {
      omPercent: 1.35,
      availPPpm: 9.2,
      exchKPpm: 62,
      soilPh: 5.8,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวโพดเลี้ยงสัตว์", "ไม้ผล"],
    cmvOutbreakStatus: "เฝ้าระวังสูง",
  },
  {
    id: "khon-buri",
    nameTh: "อ.ครบุรี",
    nameEn: "Khon Buri",
    zone: "โซนลุ่มน้ำมูลบน-ลำแชะ",
    lat: 14.5222,
    lon: 102.2486,
    mapX: 480,
    mapY: 365,
    rainProbToday: 60,
    forecastRain14dMm: 74.5,
    normalRain30dMm: 160,
    spi14d: -0.55,
    spi30d: -0.62,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 49,
    maxTempC: 34.4,
    minTempC: 23.8,
    extremeAlertTitle: "สภาพอากาศเอื้อต่อการสะสมความหวานอ้อย (CCS) · ลมกระโชกบางพื้นที่",
    extremeAlertDetail:
      "พื้นที่รับน้ำเขื่อนมูลบนและลำแชะมีความชื้นดิน 49% อุณหภูมิกลางวัน-กลางคืนต่างกัน 10.6°C ช่วยเร่งการสร้างน้ำตาลในอ้อยโรงงาน",
    affectedCropStage:
      "อ้อยโรงงานระยะย่างปล้องและสะสมน้ำตาล งดใส่ปุ๋ยไนโตรเจนช่วงก่อนตัด 60 วันเพื่อรักษาค่า CCS",
    soilSeriesName: "ชุดดินครบุรี/โชคชัย (ดินร่วนเหนียวสีแดง)",
    defaultSoilTest: {
      omPercent: 1.18,
      availPPpm: 8.4,
      exchKPpm: 54,
      soilPh: 5.7,
    },
    primaryCrops: ["มันสำปะหลัง", "อ้อยโรงงาน", "ข้าวนาปี"],
    cmvOutbreakStatus: "เฝ้าระวังสูง",
  },
  {
    id: "chum-phuang",
    nameTh: "อ.ชุมพวง",
    nameEn: "Chum Phuang",
    zone: "โซนทุ่งสัมฤทธิ์-ตะวันออก",
    lat: 15.3497,
    lon: 102.7422,
    mapX: 625,
    mapY: 145,
    rainProbToday: 40,
    forecastRain14dMm: 41.2,
    normalRain30dMm: 148,
    spi14d: -1.12,
    spi30d: -1.18,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 35,
    maxTempC: 35.9,
    minTempC: 24.1,
    extremeAlertTitle: "เตือนภาวะฝนทิ้งช่วง 14 วันข้างหน้า · กระทบข้าวหอมมะลิระยะตั้งท้อง",
    extremeAlertDetail:
      "ดรรชนี SPI อยู่ที่ -1.18 คาดการณ์ปริมาณฝนต่ำกว่าค่าเฉลี่ย 28% ในช่วง 2 สัปดาห์หน้า เกษตรกรนอกเขตชลประทานควรสูบน้ำกักเก็บในแปลงนา",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 ระยะตั้งท้อง-ออกรวง ต้องการน้ำสม่ำเสมอเพื่อป้องกันเมล็ดลีบและรักษาคุณภาพความหอม",
    soilSeriesName: "ชุดดินพิมาย/ร้อยเอ็ด (ดินร่วนเหนียวปนทราย)",
    defaultSoilTest: {
      omPercent: 0.94,
      availPPpm: 7.1,
      exchKPpm: 44,
      soilPh: 5.5,
    },
    primaryCrops: ["ข้าวหอมมะลิทุ่งสัมฤทธิ์", "อ้อยโรงงาน", "มันสำปะหลัง"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "phimai",
    nameTh: "อ.พิมาย",
    nameEn: "Phimai",
    zone: "โซนทุ่งสัมฤทธิ์ตอนกลาง",
    lat: 15.2231,
    lon: 102.4939,
    mapX: 525,
    mapY: 175,
    rainProbToday: 50,
    forecastRain14dMm: 52.0,
    normalRain30dMm: 152,
    spi14d: -0.78,
    spi30d: -0.82,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 46,
    maxTempC: 35.1,
    minTempC: 24.0,
    extremeAlertTitle: "บริหารจัดการน้ำทุ่งสัมฤทธิ์ · เฝ้าระวังโรคไหม้คอรวงในข้าวหอมมะลิ",
    extremeAlertDetail:
      "พื้นที่ในเขตชลประทานพิมายมีระดับน้ำต้นทุนอยู่ในเกณฑ์บริหารจัดการได้ แนะนำระบายน้ำออกจากแปลงนา 10–14 วันก่อนเก็บเกี่ยวข้าวหอมมะลิ GI",
    affectedCropStage:
      "ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI ระยะออกรวง-โน้มรวง และอ้อยโรงงานเตรียมเปิดหีบ",
    soilSeriesName: "ชุดดินพิมาย (Phimai Series - ดินเหนียวลึกมาก)",
    defaultSoilTest: {
      omPercent: 1.48,
      availPPpm: 11.5,
      exchKPpm: 78,
      soilPh: 6.1,
    },
    primaryCrops: ["ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI", "อ้อยโรงงาน", "ถั่วเขียวหลังนา"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "bua-yai",
    nameTh: "อ.บัวใหญ่",
    nameEn: "Bua Yai",
    zone: "โซนตอนเหนือ (แล้งซ้ำซาก)",
    lat: 15.5858,
    lon: 102.4267,
    mapX: 485,
    mapY: 78,
    rainProbToday: 25,
    forecastRain14dMm: 24.6,
    normalRain30dMm: 135,
    spi14d: -1.52,
    spi30d: -1.64,
    droughtRiskLevel: "วิกฤตแล้งรุนแรง",
    gistdaSoilMoisturePct: 22,
    maxTempC: 37.2,
    minTempC: 24.8,
    extremeAlertTitle: "แจ้งเตือนภัยแล้งรุนแรง (SPI -1.64) · อุณหภูมิสูงเกินเกณฑ์ 37°C",
    extremeAlertDetail:
      "ความชื้นในดินจากดาวเทียม GISTDA ลดลงเหลือ 22% เสี่ยงเกิดความเสียหายต่อนาข้าวและพืชไร่นอกเขตชลประทาน แนะนำตรวจสอบสิทธิ กษ.01 และปลูกพืชตระกูลถั่วอายุสั้นแทนการทำนาปรัง",
    affectedCropStage:
      "นาข้าวพื้นที่ดอนเสี่ยงขาดน้ำรุนแรง แนะนำปรับเปลี่ยนเป็นถั่วหรั่งหรือถั่วเขียวผิวมันใช้น้ำน้อย",
    soilSeriesName: "ชุดดินกุลาดำ/โคราช (ดินร่วนปนทรายความอุดมสมบูรณ์ต่ำ)",
    defaultSoilTest: {
      omPercent: 0.61,
      availPPpm: 5.2,
      exchKPpm: 32,
      soilPh: 5.3,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "อ้อยโรงงาน", "ถั่วหรั่ง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "pak-chong",
    nameTh: "อ.ปากช่อง",
    nameEn: "Pak Chong",
    zone: "โซนที่สูงตะวันตก",
    lat: 14.7081,
    lon: 101.4161,
    mapX: 140,
    mapY: 315,
    rainProbToday: 70,
    forecastRain14dMm: 89.5,
    normalRain30dMm: 175,
    spi14d: 0.18,
    spi30d: 0.25,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 61,
    maxTempC: 31.8,
    minTempC: 21.5,
    extremeAlertTitle: "ฝนกระจายตัวดี (โอกาสฝนตก 70%) · เฝ้าระวังหนอนกระทู้ข้าวโพดลายจุด",
    extremeAlertDetail:
      "สภาพอากาศชุ่มชื้น (SPI +0.25) เหมาะสมต่อการเจริญเติบโตของข้าวโพดเลี้ยงสัตว์และไม้ผล แต่ควรสำรวจแปลงป้องกันหนอนกระทู้ข้าวโพดลายจุด (Fall Armyworm)",
    affectedCropStage:
      "ข้าวโพดเลี้ยงสัตว์ระยะ 4–8 ใบ และระยะติดฝัก เจริญเติบโตดีมาก",
    soilSeriesName: "ชุดดินปากช่อง (Pak Chong Series - ดินเหนียวสีแดงเนื้อละเอียด)",
    defaultSoilTest: {
      omPercent: 2.15,
      availPPpm: 16.0,
      exchKPpm: 112,
      soilPh: 6.3,
    },
    primaryCrops: ["ข้าวโพดเลี้ยงสัตว์", "ไม้ผลเศรษฐกิจ", "มันสำปะหลัง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "non-sung",
    nameTh: "อ.โนนสูง",
    nameEn: "Non Sung",
    zone: "โซนทุ่งสัมฤทธิ์",
    lat: 15.1806,
    lon: 102.2753,
    mapX: 435,
    mapY: 195,
    rainProbToday: 45,
    forecastRain14dMm: 46.8,
    normalRain30dMm: 145,
    spi14d: -0.89,
    spi30d: -0.95,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 39,
    maxTempC: 35.5,
    minTempC: 24.2,
    extremeAlertTitle: "เฝ้าระวังฝนทิ้งช่วงปลายฤดู · วางแผนปลูกพืชตระกูลถั่วบำรุงดินหลังนา",
    extremeAlertDetail:
      "ดรรชนี SPI -0.95 มีแนวโน้มเข้าสู่ภาวะแห้งแล้งเร็วกว่าปกติ แนะนำเกษตรกรผู้ปลูกข้าวหอมมะลิทุ่งสัมฤทธิ์เตรียมเมล็ดพันธุ์ถั่วเขียวและปอเทืองหลังเกี่ยวข้าว",
    affectedCropStage:
      "ข้าวหอมมะลิทุ่งสัมฤทธิ์ระยะเมล็ดแป้ง-เก็บเกี่ยว",
    soilSeriesName: "ชุดดินพิมาย/จัตุรัส (ดินเหนียวปนทรายแป้ง)",
    defaultSoilTest: {
      omPercent: 1.22,
      availPPpm: 9.8,
      exchKPpm: 68,
      soilPh: 5.9,
    },
    primaryCrops: ["ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI", "พืชตระกูลถั่ว", "ข้าวโพดหลังนา"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "sikhio",
    nameTh: "อ.สีคิ้ว",
    nameEn: "Sikhio",
    zone: "โซนลุ่มน้ำลำตะคอง",
    lat: 14.8925,
    lon: 101.7136,
    mapX: 250,
    mapY: 265,
    rainProbToday: 55,
    forecastRain14dMm: 61.0,
    normalRain30dMm: 150,
    spi14d: -0.68,
    spi30d: -0.74,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 43,
    maxTempC: 34.6,
    minTempC: 23.5,
    extremeAlertTitle: "ฝนฟ้าคะนองกระจาย 55% · ติดตามการจัดสรรน้ำเขื่อนลำตะคอง",
    extremeAlertDetail:
      "เขื่อนลำตะคองเน้นสำรองน้ำเพื่อการอุปโภคบริโภคและรักษาระบบนิเวศ เกษตรกรผู้ปลูกมันสำปะหลังและข้าวโพดควรใช้น้ำฝนอย่างมีประสิทธิภาพ",
    affectedCropStage:
      "มันสำปะหลังอายุ 5–8 เดือน และข้าวโพดเลี้ยงสัตว์รุ่นสอง",
    soilSeriesName: "ชุดดินจัตุรัส/โคราช (ดินร่วนปนเหนียว)",
    defaultSoilTest: {
      omPercent: 1.05,
      availPPpm: 8.0,
      exchKPpm: 52,
      soilPh: 5.8,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวโพดเลี้ยงสัตว์", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "pak-thong-chai",
    nameTh: "อ.ปักธงชัย",
    nameEn: "Pak Thong Chai",
    zone: "โซนลุ่มน้ำลำพระเพลิง",
    lat: 14.7197,
    lon: 102.0225,
    mapX: 375,
    mapY: 325,
    rainProbToday: 60,
    forecastRain14dMm: 71.4,
    normalRain30dMm: 158,
    spi14d: -0.32,
    spi30d: -0.38,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 51,
    maxTempC: 34.1,
    minTempC: 23.6,
    extremeAlertTitle: "สมดุลน้ำดีจากเขื่อนลำพระเพลิง · โอกาสฝนตก 60% ในพื้นที่รับน้ำ",
    extremeAlertDetail:
      "เขื่อนลำพระเพลิงมีปริมาณน้ำใช้การได้ในเกณฑ์ดี สนับสนุนพื้นที่ปลูกข้าวและพืชไร่ในเขตชลประทาน อ.ปักธงชัย-โชคชัย",
    affectedCropStage:
      "ข้าวนาปีและมันสำปะหลังแปลงใหญ่ เจริญเติบโตตามเกณฑ์มาตรฐาน",
    soilSeriesName: "ชุดดินโคราช/ปักธงชัย (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 1.12,
      availPPpm: 8.9,
      exchKPpm: 56,
      soilPh: 5.7,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "ข้าวโพดเลี้ยงสัตว์"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "khong",
    nameTh: "อ.คง",
    nameEn: "Khong",
    zone: "โซนตอนเหนือ-ทุ่งสัมฤทธิ์",
    lat: 15.4428,
    lon: 102.3275,
    mapX: 455,
    mapY: 120,
    rainProbToday: 35,
    forecastRain14dMm: 33.5,
    normalRain30dMm: 138,
    spi14d: -1.32,
    spi30d: -1.41,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 28,
    maxTempC: 36.4,
    minTempC: 24.4,
    extremeAlertTitle: "เตือนฝนทิ้งช่วงสะสม (SPI -1.41) · กระทบนาข้าวหอมมะลินอกเขตชลประทาน",
    extremeAlertDetail:
      "ปริมาณฝนสะสมในพื้นที่ อ.คง ต่ำกว่าค่าปกติ ความชื้นดินลดลงเหลือ 28% เกษตรกรผู้ปลูกข้าวหอมมะลิควรตรวจระดับน้ำในแปลงนาและงดหว่านปุ๋ยเคมีในแปลงที่ดินแห้ง",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 ระยะแตกกอ-ตั้งท้อง และมันสำปะหลังพื้นที่ดอน",
    soilSeriesName: "ชุดดินโคราช/ร้อยเอ็ด (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.74,
      availPPpm: 6.1,
      exchKPpm: 36,
      soilPh: 5.4,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "ban-lueam",
    nameTh: "อ.บ้านเหลื่อม",
    nameEn: "Ban Lueam",
    zone: "โซนตอนเหนือ (แล้งซ้ำซาก)",
    lat: 15.6033,
    lon: 102.1389,
    mapX: 390,
    mapY: 72,
    rainProbToday: 30,
    forecastRain14dMm: 27.8,
    normalRain30dMm: 134,
    spi14d: -1.46,
    spi30d: -1.55,
    droughtRiskLevel: "วิกฤตแล้งรุนแรง",
    gistdaSoilMoisturePct: 24,
    maxTempC: 37.0,
    minTempC: 24.6,
    extremeAlertTitle: "พื้นที่เสี่ยงภัยแล้งรุนแรง (SPI -1.55) · แนะนำตรวจสอบสิทธิ กษ.01",
    extremeAlertDetail:
      "อ.บ้านเหลื่อม มีภาวะฝนทิ้งช่วงต่อเนื่อง ความชื้นดิน GISTDA อยู่ที่ 24% แนะนำเกษตรกรถ่ายภาพแปลงเกษตรพร้อมพิกัด GPS เพื่อใช้เป็นหลักฐานยื่นรับการช่วยเหลือตามเกณฑ์ กษ.01",
    affectedCropStage:
      "ข้าวนาปีพื้นที่ดอนและอ้อยโรงงานระยะย่างปล้อง",
    soilSeriesName: "ชุดดินโคราช (ดินร่วนปนทรายความอุดมสมบูรณ์ต่ำ)",
    defaultSoilTest: {
      omPercent: 0.65,
      availPPpm: 5.5,
      exchKPpm: 34,
      soilPh: 5.4,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "อ้อยโรงงาน", "มันสำปะหลัง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "chakkarat",
    nameTh: "อ.จักราช",
    nameEn: "Chakkarat",
    zone: "โซนตะวันออก-ลุ่มน้ำมูล",
    lat: 15.0139,
    lon: 102.4139,
    mapX: 500,
    mapY: 235,
    rainProbToday: 50,
    forecastRain14dMm: 53.6,
    normalRain30dMm: 150,
    spi14d: -0.75,
    spi30d: -0.84,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 42,
    maxTempC: 35.3,
    minTempC: 24.1,
    extremeAlertTitle: "ฝนกระจายตัวปานกลาง 50% · เฝ้าระวังโรคใบด่างมันสำปะหลังในแปลงปลูกใหม่",
    extremeAlertDetail:
      "สภาวะความชื้นดิน 42% อยู่ในเกณฑ์สมดุลปกติ แนะนำสำรวจแปลงมันสำปะหลังและคัดเลือกท่อนพันธุ์สะอาดปลอดโรคก่อนปลูกซ่อม",
    affectedCropStage:
      "มันสำปะหลังอายุ 4–7 เดือน และข้าวหอมมะลิระยะตั้งท้อง",
    soilSeriesName: "ชุดดินโคราช/พิมาย (ดินร่วนปนทรายถึงดินเหนียว)",
    defaultSoilTest: {
      omPercent: 0.96,
      availPPpm: 7.5,
      exchKPpm: 46,
      soilPh: 5.6,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวหอมมะลิ", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "เฝ้าระวังสูง",
  },
  {
    id: "chok-chai",
    nameTh: "อ.โชคชัย",
    nameEn: "Chok Chai",
    zone: "โซนลุ่มน้ำลำพระเพลิง-มูลบน",
    lat: 14.7317,
    lon: 102.1644,
    mapX: 430,
    mapY: 320,
    rainProbToday: 60,
    forecastRain14dMm: 69.2,
    normalRain30dMm: 156,
    spi14d: -0.41,
    spi30d: -0.48,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 50,
    maxTempC: 34.3,
    minTempC: 23.7,
    extremeAlertTitle: "ความชื้นดินสมบูรณ์ 50% · พื้นที่รับน้ำชลประทานลำพระเพลิงและมูลบน",
    extremeAlertDetail:
      "พื้นที่เกษตรใน อ.โชคชัย ได้รับน้ำต้นทุนจากเขื่อนลำพระเพลิงและเขื่อนมูลบน ร่วมกับโอกาสเกิดฝน 60% เหมาะสมต่อการเจริญเติบโตของมันสำปะหลังและข้าวนาปี",
    affectedCropStage:
      "มันสำปะหลังแปลงใหญ่สะสมแป้ง และข้าวนาปีในเขตชลประทาน",
    soilSeriesName: "ชุดดินโชคชัย (Chok Chai Series - ดินเหนียวสีแดงลึกมาก)",
    defaultSoilTest: {
      omPercent: 1.42,
      availPPpm: 10.2,
      exchKPpm: 66,
      soilPh: 5.9,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวหอมมะลิ", "ข้าวโพดเลี้ยงสัตว์"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "non-thai",
    nameTh: "อ.โนนไทย",
    nameEn: "Non Thai",
    zone: "โซนตอนกลาง-ตะวันตก",
    lat: 15.1972,
    lon: 102.0631,
    mapX: 365,
    mapY: 185,
    rainProbToday: 40,
    forecastRain14dMm: 39.4,
    normalRain30dMm: 140,
    spi14d: -1.16,
    spi30d: -1.25,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 33,
    maxTempC: 36.1,
    minTempC: 24.3,
    extremeAlertTitle: "เฝ้าระวังฝนทิ้งช่วง (SPI -1.25) และปัญหาดินเค็มบางพื้นที่",
    extremeAlertDetail:
      "ความชื้นในดินลดลงอยู่ที่ 33% ในพื้นที่ดินร่วนปนทรายและดินเค็มน้อย แนะนำใส่อินทรียวัตถุและปุ๋ยพืชสดเพื่อรักษาความชื้นในดิน",
    affectedCropStage:
      "ข้าวหอมมะลิระยะแตกกอ-ตั้งท้อง และมันสำปะหลัง",
    soilSeriesName: "ชุดดินกุลาร้องไห้/โคราช (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.78,
      availPPpm: 6.4,
      exchKPpm: 40,
      soilPh: 5.6,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "พริก-พืชผัก"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "kham-sakae-saeng",
    nameTh: "อ.ขามสะแกแสง",
    nameEn: "Kham Sakae Saeng",
    zone: "โซนตอนเหนือ-กลาง",
    lat: 15.3289,
    lon: 102.1722,
    mapX: 405,
    mapY: 150,
    rainProbToday: 35,
    forecastRain14dMm: 36.0,
    normalRain30dMm: 138,
    spi14d: -1.24,
    spi30d: -1.32,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 32,
    maxTempC: 36.3,
    minTempC: 24.4,
    extremeAlertTitle: "เตือนภาวะฝนทิ้งช่วง (SPI -1.32) · แนะนำวางแผนปลูกถั่วเขียวหลังนา",
    extremeAlertDetail:
      "ปริมาณฝนคาดการณ์ 14 วันอยู่ที่ 36.0 มม. ต่ำกว่าเกณฑ์เฉลี่ย แนะนำเกษตรกรกักเก็บน้ำในแปลงนาและเตรียมปรับเปลี่ยนพื้นที่ดอนเป็นพืชใช้น้ำน้อย",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 และอ้อยโรงงาน",
    soilSeriesName: "ชุดดินจัตุรัส/โคราช (ดินร่วนเหนียวปนทราย)",
    defaultSoilTest: {
      omPercent: 0.88,
      availPPpm: 7.0,
      exchKPpm: 45,
      soilPh: 5.7,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "prathai",
    nameTh: "อ.ประทาย",
    nameEn: "Prathai",
    zone: "โซนทุ่งสัมฤทธิ์-ตะวันออกเฉียงเหนือ",
    lat: 15.5317,
    lon: 102.7128,
    mapX: 605,
    mapY: 95,
    rainProbToday: 35,
    forecastRain14dMm: 34.8,
    normalRain30dMm: 142,
    spi14d: -1.28,
    spi30d: -1.36,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 30,
    maxTempC: 36.5,
    minTempC: 24.5,
    extremeAlertTitle: "เฝ้าระวังฝนทิ้งช่วงในแหล่งผลิตข้าวหอมมะลิแปลงใหญ่ อ.ประทาย",
    extremeAlertDetail:
      "ดรรชนี SPI-30 วันอยู่ที่ -1.36 ความชื้นดิน 30% เกษตรกรผู้ปลูกข้าวหอมมะลิทุ่งสัมฤทธิ์ควรรักษาระดับน้ำในแปลงนาช่วงข้าวตั้งท้อง-ออกรวง",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 ระยะตั้งท้อง-ออกรวง",
    soilSeriesName: "ชุดดินร้อยเอ็ด/พิมาย (ดินร่วนปนทรายถึงดินเหนียว)",
    defaultSoilTest: {
      omPercent: 0.85,
      availPPpm: 6.8,
      exchKPpm: 42,
      soilPh: 5.5,
    },
    primaryCrops: ["ข้าวหอมมะลิทุ่งสัมฤทธิ์", "อ้อยโรงงาน", "ถั่วลิสง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "huai-thalaeng",
    nameTh: "อ.ห้วยแถลง",
    nameEn: "Huai Thalaeng",
    zone: "โซนตะวันออก",
    lat: 15.0069,
    lon: 102.6514,
    mapX: 590,
    mapY: 238,
    rainProbToday: 45,
    forecastRain14dMm: 48.5,
    normalRain30dMm: 150,
    spi14d: -0.92,
    spi30d: -1.04,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 37,
    maxTempC: 35.6,
    minTempC: 24.0,
    extremeAlertTitle: "เฝ้าระวังฝนทิ้งช่วงระยะสั้น (SPI -1.04) · ดูแลแปลงมันสำปะหลังและอ้อย",
    extremeAlertDetail:
      "โอกาสเกิดฝน 45% ปริมาณฝนสะสมเริ่มลดลงในช่วงปลายฤดูฝน แนะนำกำจัดวัชพืชในแปลงมันสำปะหลังเพื่อลดการแย่งน้ำในดิน",
    affectedCropStage:
      "มันสำปะหลังระยะลงหัว และข้าวหอมมะลินาปี",
    soilSeriesName: "ชุดดินโคราช/สตึก (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.89,
      availPPpm: 7.2,
      exchKPpm: 44,
      soilPh: 5.6,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวหอมมะลิ", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "sung-noen",
    nameTh: "อ.สูงเนิน",
    nameEn: "Sung Noen",
    zone: "โซนลุ่มน้ำลำตะคอง",
    lat: 14.8992,
    lon: 101.8208,
    mapX: 295,
    mapY: 268,
    rainProbToday: 55,
    forecastRain14dMm: 59.0,
    normalRain30dMm: 149,
    spi14d: -0.58,
    spi30d: -0.66,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 44,
    maxTempC: 34.8,
    minTempC: 23.8,
    extremeAlertTitle: "สมดุลน้ำปกติ (SPI -0.66) · ติดตามรอบเวรส่งน้ำคลองชลประทานลำตะคอง",
    extremeAlertDetail:
      "พื้นที่เกษตรใน อ.สูงเนิน มีความชื้นดิน 44% และมีโอกาสฝนตก 55% เหมาะสมต่อการเจริญเติบโตของข้าวนาปีและส้มโอ/ไม้ผลเศรษฐกิจ",
    affectedCropStage:
      "ข้าวนาปีระยะออกรวง และมันสำปะหลัง",
    soilSeriesName: "ชุดดินจัตุรัส/พิมาย (ดินร่วนเหนียว)",
    defaultSoilTest: {
      omPercent: 1.24,
      availPPpm: 9.5,
      exchKPpm: 60,
      soilPh: 6.0,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "ไม้ผลเศรษฐกิจ"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "kham-thale-so",
    nameTh: "อ.ขามทะเลสอ",
    nameEn: "Kham Thale So",
    zone: "โซนลุ่มน้ำลำตะคองตอนกลาง",
    lat: 14.9656,
    lon: 101.9469,
    mapX: 335,
    mapY: 250,
    rainProbToday: 50,
    forecastRain14dMm: 51.4,
    normalRain30dMm: 144,
    spi14d: -0.85,
    spi30d: -0.92,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 40,
    maxTempC: 35.4,
    minTempC: 24.1,
    extremeAlertTitle: "โอกาสเกิดฝน 50% · แนะนำใช้น้ำอย่างประหยัดในแปลงพืชไร่และพืชผัก",
    extremeAlertDetail:
      "ค่าดรรชนี SPI อยู่ที่ -0.92 เริ่มเข้าใกล้เกณฑ์เฝ้าระวังฝนทิ้งช่วง เกษตรกรควรคลุมดินรักษาความชื้นในแปลงมันสำปะหลังและพืชผัก",
    affectedCropStage:
      "มันสำปะหลังอายุ 5–8 เดือน และพืชผักสวนครัว",
    soilSeriesName: "ชุดดินโคราช/จัตุรัส (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.92,
      availPPpm: 7.8,
      exchKPpm: 48,
      soilPh: 5.7,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวนาปี", "พืชผักเศรษฐกิจ"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "nong-bun-mak",
    nameTh: "อ.หนองบุญมาก",
    nameEn: "Nong Bun Mak",
    zone: "โซนลุ่มน้ำมูลบน-ตะวันออกเฉียงใต้",
    lat: 14.7428,
    lon: 102.3683,
    mapX: 505,
    mapY: 318,
    rainProbToday: 60,
    forecastRain14dMm: 72.0,
    normalRain30dMm: 158,
    spi14d: -0.44,
    spi30d: -0.52,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 51,
    maxTempC: 34.2,
    minTempC: 23.7,
    extremeAlertTitle: "ความชื้นดินดี 51% · เฝ้าระวังโรคใบด่างมันสำปะหลังในพื้นที่ปลูกหนาแน่น",
    extremeAlertDetail:
      "อ.หนองบุญมาก เป็นแหล่งปลูกมันสำปะหลังสำคัญของจังหวัด สภาพอากาศชุ่มชื้น (SPI -0.52) แนะนำตรวจแปลงทุกสัปดาห์เพื่อกำจัดต้นเป็นโรคใบด่าง",
    affectedCropStage:
      "มันสำปะหลังระยะสะสมแป้ง และอ้อยโรงงาน",
    soilSeriesName: "ชุดดินโชคชัย/สตึก (ดินร่วนเหนียวสีแดง)",
    defaultSoilTest: {
      omPercent: 1.28,
      availPPpm: 9.0,
      exchKPpm: 58,
      soilPh: 5.8,
    },
    primaryCrops: ["มันสำปะหลัง", "อ้อยโรงงาน", "ข้าวโพดเลี้ยงสัตว์"],
    cmvOutbreakStatus: "เฝ้าระวังสูง",
  },
  {
    id: "kaeng-sanam-nang",
    nameTh: "อ.แก้งสนามนาง",
    nameEn: "Kaeng Sanam Nang",
    zone: "โซนตอนเหนือสุด (แล้งซ้ำซาก)",
    lat: 15.6989,
    lon: 102.2533,
    mapX: 435,
    mapY: 48,
    rainProbToday: 25,
    forecastRain14dMm: 22.8,
    normalRain30dMm: 132,
    spi14d: -1.58,
    spi30d: -1.68,
    droughtRiskLevel: "วิกฤตแล้งรุนแรง",
    gistdaSoilMoisturePct: 21,
    maxTempC: 37.3,
    minTempC: 24.9,
    extremeAlertTitle: "แจ้งเตือนภัยแล้งรุนแรง (SPI -1.68) · เฝ้าระวังผลกระทบต่ออ้อยและนาข้าว",
    extremeAlertDetail:
      "พื้นที่ตอนเหนือสุดของจังหวัดมีความชื้นดินเพียง 21% และโอกาสเกิดฝนต่ำ 25% แนะนำตรวจสอบสถานะทะเบียนเกษตรกรและประเมินความเสียหายตามหลักเกณฑ์ กษ.01",
    affectedCropStage:
      "อ้อยโรงงานและนาข้าวพื้นที่ดอนนอกเขตชลประทาน",
    soilSeriesName: "ชุดดินโคราช/โพนพิสัย (ดินร่วนปนทรายตื้น)",
    defaultSoilTest: {
      omPercent: 0.58,
      availPPpm: 4.9,
      exchKPpm: 30,
      soilPh: 5.2,
    },
    primaryCrops: ["อ้อยโรงงาน", "ข้าวหอมมะลิ", "มันสำปะหลัง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "non-daeng",
    nameTh: "อ.โนนแดง",
    nameEn: "Non Daeng",
    zone: "โซนตอนเหนือ-ทุ่งสัมฤทธิ์",
    lat: 15.4244,
    lon: 102.5367,
    mapX: 540,
    mapY: 125,
    rainProbToday: 35,
    forecastRain14dMm: 35.2,
    normalRain30dMm: 140,
    spi14d: -1.26,
    spi30d: -1.34,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 31,
    maxTempC: 36.2,
    minTempC: 24.3,
    extremeAlertTitle: "เตือนฝนทิ้งช่วง (SPI -1.34) · บริหารน้ำในแปลงนาข้าวหอมมะลิ",
    extremeAlertDetail:
      "ความชื้นในดินลดลงอยู่ที่ 31% แนะนำเกษตรกรใน อ.โนนแดง กักเก็บน้ำในร่องนาและเตรียมปลูกพืชตระกูลถั่วอายุสั้นหลังเก็บเกี่ยวข้าวนาปี",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 ระยะตั้งท้อง-ออกรวง",
    soilSeriesName: "ชุดดินร้อยเอ็ด/โคราช (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.80,
      availPPpm: 6.3,
      exchKPpm: 39,
      soilPh: 5.5,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "ถั่วเขียวหลังนา"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "wang-nam-khiao",
    nameTh: "อ.วังน้ำเขียว",
    nameEn: "Wang Nam Khiao",
    zone: "โซนที่สูงเชิงเขาใหญ่-ทับลาน",
    lat: 14.4328,
    lon: 101.8606,
    mapX: 310,
    mapY: 392,
    rainProbToday: 70,
    forecastRain14dMm: 92.4,
    normalRain30dMm: 178,
    spi14d: 0.24,
    spi30d: 0.32,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 63,
    maxTempC: 30.9,
    minTempC: 20.8,
    extremeAlertTitle: "สภาพอากาศชุ่มชื้นเย็นสบาย (SPI +0.32) · เฝ้าระวังโรคราน้ำค้างในพืชผักเมืองหนาว",
    extremeAlertDetail:
      "โอกาสเกิดฝน 70% และความชื้นสัมพัทธ์สูงในพื้นที่ อ.วังน้ำเขียว ส่งผลดีต่อไม้ผลและพืชผักปลอดสารพิษ แต่ควรระวังเชื้อราในแปลงผักสลัดและองุ่น",
    affectedCropStage:
      "พืชผักปลอดสารพิษ พุทรานมสด ทุเรียน และมันสำปะหลัง",
    soilSeriesName: "ชุดดินปากช่อง/วังน้ำเขียว (ดินร่วนเหนียวสีแดงอุดมสมบูรณ์สูง)",
    defaultSoilTest: {
      omPercent: 2.25,
      availPPpm: 15.4,
      exchKPpm: 108,
      soilPh: 6.2,
    },
    primaryCrops: ["พืชผักเมืองหนาว", "ไม้ผลเศรษฐกิจ", "ข้าวโพดเลี้ยงสัตว์"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "thepharak",
    nameTh: "อ.เทพารักษ์",
    nameEn: "Thepharak",
    zone: "โซนที่ดอนตะวันตกเฉียงเหนือ",
    lat: 15.2917,
    lon: 101.5194,
    mapX: 185,
    mapY: 142,
    rainProbToday: 65,
    forecastRain14dMm: 54.0,
    normalRain30dMm: 140,
    spi14d: -1.14,
    spi30d: -1.26,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 33,
    maxTempC: 36.2,
    minTempC: 24.0,
    extremeAlertTitle: "โอกาสเกิดฝนฟ้าคะนอง 65% วันนี้ แต่ภาพรวมยังเสี่ยงฝนทิ้งช่วงสะสม (SPI -1.26)",
    extremeAlertDetail:
      "พื้นที่ลาดเชิงเขา อ.เทพารักษ์ มีการระบายน้ำเร็ว แม้มีฝนตกวันนี้แต่ความชื้นดินสะสมยังอยู่ที่ 33% แนะนำทำร่องขวางความลาดชันชะลอน้ำในแปลงมันสำปะหลังและข้าวโพด",
    affectedCropStage:
      "มันสำปะหลังและข้าวโพดเลี้ยงสัตว์ระยะติดฝัก",
    soilSeriesName: "ชุดดินจัตุรัส/ลำนารายณ์ (ดินร่วนปนเหนียว)",
    defaultSoilTest: {
      omPercent: 1.02,
      availPPpm: 8.1,
      exchKPpm: 55,
      soilPh: 5.8,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวโพดเลี้ยงสัตว์", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "เฝ้าระวังสูง",
  },
  {
    id: "mueang-yang",
    nameTh: "อ.เมืองยาง",
    nameEn: "Mueang Yang",
    zone: "โซนลุ่มน้ำมูลตอนล่าง-ตะวันออก",
    lat: 15.4239,
    lon: 102.8989,
    mapX: 665,
    mapY: 122,
    rainProbToday: 40,
    forecastRain14dMm: 42.5,
    normalRain30dMm: 146,
    spi14d: -1.06,
    spi30d: -1.14,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 36,
    maxTempC: 35.8,
    minTempC: 24.2,
    extremeAlertTitle: "เฝ้าระวังฝนทิ้งช่วง (SPI -1.14) · บริหารการสูบน้ำจากลำน้ำมูลเสริมนาข้าว",
    extremeAlertDetail:
      "พื้นที่เกษตรริมลำน้ำมูลใน อ.เมืองยาง มีค่า SPI -1.14 เกษตรกรนอกเขตสถานีสูบน้ำด้วยไฟฟ้าควรสำรองน้ำและดูแลข้าวหอมมะลิระยะออกรวง",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 และอ้อยโรงงาน",
    soilSeriesName: "ชุดดินพิมาย/ชุมพลบุรี (ดินเหนียวปนทรายแป้ง)",
    defaultSoilTest: {
      omPercent: 1.08,
      availPPpm: 8.2,
      exchKPpm: 52,
      soilPh: 5.7,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "อ้อยโรงงาน", "มันสำปะหลัง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "phra-thong-kham",
    nameTh: "อ.พระทองคำ",
    nameEn: "Phra Thong Kham",
    zone: "โซนตอนเหนือ-ตะวันตก",
    lat: 15.3689,
    lon: 101.9889,
    mapX: 340,
    mapY: 138,
    rainProbToday: 30,
    forecastRain14dMm: 29.5,
    normalRain30dMm: 136,
    spi14d: -1.44,
    spi30d: -1.52,
    droughtRiskLevel: "วิกฤตแล้งรุนแรง",
    gistdaSoilMoisturePct: 25,
    maxTempC: 36.9,
    minTempC: 24.5,
    extremeAlertTitle: "แจ้งเตือนวิกฤตฝนทิ้งช่วงรุนแรง (SPI -1.52) · ความชื้นดินลดต่ำเหลือ 25%",
    extremeAlertDetail:
      "อ.พระทองคำ อยู่ในโซนเงาฝนตอนบน มีค่า SPI -1.52 เสี่ยงเกิดความเสียหายต่อนาข้าวและแปลงมันสำปะหลัง แนะนำตรวจสอบสิทธิ กษ.01 และงดใส่ปุ๋ยเคมีขณะดินแห้ง",
    affectedCropStage:
      "มันสำปะหลังและข้าวนาปีพื้นที่ดอน",
    soilSeriesName: "ชุดดินโคราช (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.68,
      availPPpm: 5.8,
      exchKPpm: 35,
      soilPh: 5.4,
    },
    primaryCrops: ["มันสำปะหลัง", "ข้าวหอมมะลิ", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
  {
    id: "lam-thamenchai",
    nameTh: "อ.ลำทะเมนชัย",
    nameEn: "Lam Thamenchai",
    zone: "โซนตะวันออกสุด-ลุ่มน้ำลำปลายมาศ",
    lat: 15.3522,
    lon: 102.9156,
    mapX: 675,
    mapY: 145,
    rainProbToday: 45,
    forecastRain14dMm: 45.0,
    normalRain30dMm: 148,
    spi14d: -0.96,
    spi30d: -1.05,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 37,
    maxTempC: 35.7,
    minTempC: 24.1,
    extremeAlertTitle: "เฝ้าระวังฝนทิ้งช่วงปลายฤดู (SPI -1.05) ในพื้นที่ปลูกข้าวหอมมะลิและอ้อย",
    extremeAlertDetail:
      "ปริมาณฝนคาดการณ์อยู่ในเกณฑ์ปานกลางถึงค่อนข้างน้อย แนะนำเกษตรกรริมลำปลายมาศบริหารจัดการน้ำร่วมกันเพื่อหล่อเลี้ยงนาข้าวช่วงออกรวง",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 และอ้อยโรงงาน",
    soilSeriesName: "ชุดดินร้อยเอ็ด/สตึก (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.91,
      availPPpm: 7.4,
      exchKPpm: 46,
      soilPh: 5.6,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "อ้อยโรงงาน", "มันสำปะหลัง"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "bua-lai",
    nameTh: "อ.บัวลาย",
    nameEn: "Bua Lai",
    zone: "โซนตอนเหนือ (แล้งซ้ำซาก)",
    lat: 15.6672,
    lon: 102.5294,
    mapX: 525,
    mapY: 58,
    rainProbToday: 25,
    forecastRain14dMm: 25.4,
    normalRain30dMm: 135,
    spi14d: -1.49,
    spi30d: -1.58,
    droughtRiskLevel: "วิกฤตแล้งรุนแรง",
    gistdaSoilMoisturePct: 23,
    maxTempC: 37.1,
    minTempC: 24.7,
    extremeAlertTitle: "เตือนภัยแล้งรุนแรง (SPI -1.58) · เฝ้าระวังนาข้าวพื้นที่ดอนขาดน้ำ",
    extremeAlertDetail:
      "อ.บัวลาย มีความชื้นในดินเพียง 23% และค่า SPI -1.58 เข้าเกณฑ์วิกฤตแล้งรุนแรง แนะนำเกษตรกรบันทึกภาพแปลงพร้อมพิกัด GPS และวางแผนปลูกพืชใช้น้ำน้อยหลังนา",
    affectedCropStage:
      "ข้าวหอมมะลิพื้นที่ดอน และอ้อยโรงงาน",
    soilSeriesName: "ชุดดินโคราช/กุลาดำ (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.63,
      availPPpm: 5.3,
      exchKPpm: 33,
      soilPh: 5.3,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "อ้อยโรงงาน", "ถั่วเขียวหลังนา"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "sida",
    nameTh: "อ.สีดา",
    nameEn: "Sida",
    zone: "โซนตอนเหนือ-ตะวันออก",
    lat: 15.5419,
    lon: 102.5625,
    mapX: 545,
    mapY: 92,
    rainProbToday: 30,
    forecastRain14dMm: 30.2,
    normalRain30dMm: 138,
    spi14d: -1.38,
    spi30d: -1.46,
    droughtRiskLevel: "เฝ้าระวังฝนทิ้งช่วง",
    gistdaSoilMoisturePct: 27,
    maxTempC: 36.7,
    minTempC: 24.6,
    extremeAlertTitle: "เตือนภาวะฝนทิ้งช่วงรุนแรง (SPI -1.46) · ดูแลแปลงนาข้าวหอมมะลิ",
    extremeAlertDetail:
      "ดรรชนี SPI -1.46 ใกล้แตะระดับวิกฤตแล้งรุนแรง ความชื้นดินเหลือ 27% เกษตรกรควรตรวจสอบแหล่งน้ำสำรองและติดตามประกาศเขตการให้ความช่วยเหลือผู้ประสบภัยพิบัติ",
    affectedCropStage:
      "ข้าวหอมมะลิ 105 ระยะตั้งท้อง-ออกรวง",
    soilSeriesName: "ชุดดินร้อยเอ็ด/โคราช (ดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 0.71,
      availPPpm: 5.9,
      exchKPpm: 36,
      soilPh: 5.4,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "อ้อยโรงงาน", "ปอเทือง-พืชตระกูลถั่ว"],
    cmvOutbreakStatus: "พื้นที่ปลอดภัย",
  },
  {
    id: "chaloem-phra-kiat",
    nameTh: "อ.เฉลิมพระเกียรติ",
    nameEn: "Chaloem Phra Kiat",
    zone: "โซนกลาง-ลุ่มน้ำมูลและลำจักราช",
    lat: 14.9711,
    lon: 102.2797,
    mapX: 445,
    mapY: 248,
    rainProbToday: 50,
    forecastRain14dMm: 54.8,
    normalRain30dMm: 149,
    spi14d: -0.69,
    spi30d: -0.76,
    droughtRiskLevel: "สมดุลปกติ",
    gistdaSoilMoisturePct: 44,
    maxTempC: 35.1,
    minTempC: 24.0,
    extremeAlertTitle: "สมดุลน้ำปกติ (SPI -0.76) · พื้นที่รับน้ำท้ายเขื่อนลำตะคองและมูลบน",
    extremeAlertDetail:
      "อ.เฉลิมพระเกียรติ มีความชื้นในดิน 44% โอกาสเกิดฝน 50% สภาพแวดล้อมเหมาะสมต่อการสะสมน้ำหนักเมล็ดข้าวหอมมะลิและการเจริญเติบโตของมันสำปะหลัง",
    affectedCropStage:
      "ข้าวหอมมะลินาปีและมันสำปะหลัง",
    soilSeriesName: "ชุดดินพิมาย/โคราช (ดินเหนียวถึงดินร่วนปนทราย)",
    defaultSoilTest: {
      omPercent: 1.18,
      availPPpm: 9.1,
      exchKPpm: 56,
      soilPh: 5.8,
    },
    primaryCrops: ["ข้าวหอมมะลิ", "มันสำปะหลัง", "อ้อยโรงงาน"],
    cmvOutbreakStatus: "พบจุดระบาดประปราย",
  },
];

export type CommodityKey =
  | "cassava_fresh"
  | "cassava_chip"
  | "sugarcane_fresh"
  | "maize_feed"
  | "jasmine_rice";

export interface CommodityMeta {
  key: CommodityKey;
  nameTh: string;
  standardSpec: string;
  unit: string;
  tonsMultiplier: number; // To convert price per unit to price per metric ton
  provincialAvgPrice: number;
  weeklyChangePct: number;
  qualityLabel: string;
  baseQualityVal: number;
  qualityUnit: string;
  priceAdjustPerUnitQuality: number; // Baht per unit change per standard quality point
  referenceSource: string;
}

export const KORAT_COMMODITIES: CommodityMeta[] = [
  {
    key: "cassava_fresh",
    nameTh: "หัวมันสำปะหลังสด",
    standardSpec: "เชื้อแป้ง 25% ณ โรงแป้ง/ลานมันโคราช",
    unit: "บาท/กก.",
    tonsMultiplier: 1000,
    provincialAvgPrice: 3.15,
    weeklyChangePct: 3.28,
    qualityLabel: "เชื้อแป้งวัดจริง",
    baseQualityVal: 25,
    qualityUnit: "%",
    priceAdjustPerUnitQuality: 0.05, // +0.05 or -0.05 Baht/kg per 1% starch
    referenceSource: "สมาคมโรงงานผู้ผลิตแป้งมันสำปะหลังไทย · สศก. เขต 5 นครราชสีมา",
  },
  {
    key: "cassava_chip",
    nameTh: "มันเส้นสะอาด",
    standardSpec: "ความชื้นไม่เกิน 14% สิ่งเจือปน < 2%",
    unit: "บาท/กก.",
    tonsMultiplier: 1000,
    provincialAvgPrice: 7.45,
    weeklyChangePct: 2.05,
    qualityLabel: "ความชื้นวัดจริง",
    baseQualityVal: 14,
    qualityUnit: "%",
    priceAdjustPerUnitQuality: -0.12, // Deduction if moisture > 14%
    referenceSource: "กรมการค้าภายใน (DIT) · ลานมันอำเภอด่านขุนทด-เสิงสาง",
  },
  {
    key: "sugarcane_fresh",
    nameTh: "อ้อยโรงงานสด (ไม่เผาใบ)",
    standardSpec: "ความหวานฐาน 10 CCS + เงินส่งเสริมอ้อยสด",
    unit: "บาท/ตัน",
    tonsMultiplier: 1,
    provincialAvgPrice: 1420,
    weeklyChangePct: 1.43,
    qualityLabel: "ค่าความหวาน CCS",
    baseQualityVal: 10,
    qualityUnit: "CCS",
    priceAdjustPerUnitQuality: 85.2, // +85.2 Baht/ton per 1 CCS above 10
    referenceSource: "สำนักงานคณะกรรมการอ้อยและน้ำตาลทราย (สอน.) · โรงงานน้ำตาลโคราช",
  },
  {
    key: "maize_feed",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ (เมล็ดแห้ง)",
    standardSpec: "ความชื้นมาตรฐาน 14.5% หน้าโรงงานอาหารสัตว์",
    unit: "บาท/กก.",
    tonsMultiplier: 1000,
    provincialAvgPrice: 10.65,
    weeklyChangePct: -0.93,
    qualityLabel: "ความชื้นเมล็ด",
    baseQualityVal: 14.5,
    qualityUnit: "%",
    priceAdjustPerUnitQuality: -0.18, // Deduction per 1% moisture above 14.5%
    referenceSource: "สมาคมผู้ผลิตอาหารสัตว์ไทย · ตลาดกลางสินค้าเกษตรปากช่อง-ด่านขุนทด",
  },
  {
    key: "jasmine_rice",
    nameTh: "ข้าวเปลือกหอมมะลิ 105 (ทุ่งสัมฤทธิ์)",
    standardSpec: "ความชื้นไม่เกิน 15% ต้นข้าว > 40 กรัม",
    unit: "บาท/ตัน",
    tonsMultiplier: 1,
    provincialAvgPrice: 15850,
    weeklyChangePct: 4.14,
    qualityLabel: "ความชื้นข้าวเปลือก",
    baseQualityVal: 15,
    qualityUnit: "%",
    priceAdjustPerUnitQuality: -180, // -180 Baht/ton per 1% moisture above 15%
    referenceSource: "กรมการค้าภายใน · สหกรณ์การเกษตรพิมาย-ชุมพวง-โนนสูง",
  },
];

export { type BuyingYardQuote, KORAT_BUYING_YARDS } from "./buyingYardsData";

export interface KoratDamStatus {
  id: string;
  nameTh: string;
  districtTh: string;
  capacityMillionM3: number;
  currentStorageMillionM3: number;
  usableWaterMillionM3: number;
  usablePercent: number;
  dailyInflowM3: number;
  dailyOutflowM3: number;
  statusLabel: "เฝ้าระวังน้ำน้อย" | "ปริมาณน้ำปานกลาง" | "ปริมาณน้ำดี";
  irrigatedDistricts: string[];
  advisoryNote: string;
}

export const KORAT_DAMS: KoratDamStatus[] = [
  {
    id: "lam-takhong",
    nameTh: "เขื่อนลำตะคอง",
    districtTh: "อ.สีคิ้ว",
    capacityMillionM3: 314.49,
    currentStorageMillionM3: 148.2,
    usableWaterMillionM3: 125.48,
    usablePercent: 42.9,
    dailyInflowM3: 0.84,
    dailyOutflowM3: 0.65,
    statusLabel: "เฝ้าระวังน้ำน้อย",
    irrigatedDistricts: ["อ.สีคิ้ว", "อ.สูงเนิน", "อ.ขามทะเลสอ", "อ.เมืองนครราชสีมา", "อ.เฉลิมพระเกียรติ"],
    advisoryNote:
      "สงวนน้ำเพื่อการอุปโภคบริโภคและรักษาระบบนิเวศเป็นหลัก ขอความร่วมมือเกษตรกรท้ายเขื่อนงดทำนาปรังรอบที่ 2 และหันปลูกพืชใช้น้ำน้อย",
  },
  {
    id: "lam-phra-phloeng",
    nameTh: "เขื่อนลำพระเพลิง",
    districtTh: "อ.ปักธงชัย",
    capacityMillionM3: 155.0,
    currentStorageMillionM3: 109.6,
    usableWaterMillionM3: 108.88,
    usablePercent: 70.6,
    dailyInflowM3: 1.12,
    dailyOutflowM3: 0.78,
    statusLabel: "ปริมาณน้ำดี",
    irrigatedDistricts: ["อ.ปักธงชัย", "อ.โชคชัย", "อ.จักราช"],
    advisoryNote:
      "ปริมาณน้ำต้นทุนอยู่ในเกณฑ์ดี สามารถจัดสรรน้ำเพื่อการเกษตรในเขตชลประทานตามรอบเวรปกติ",
  },
  {
    id: "mun-bon",
    nameTh: "เขื่อนมูลบน",
    districtTh: "อ.ครบุรี",
    capacityMillionM3: 141.0,
    currentStorageMillionM3: 79.4,
    usableWaterMillionM3: 72.4,
    usablePercent: 54.0,
    dailyInflowM3: 0.62,
    dailyOutflowM3: 0.48,
    statusLabel: "ปริมาณน้ำปานกลาง",
    irrigatedDistricts: ["อ.ครบุรี", "อ.โชคชัย", "อ.เฉลิมพระเกียรติ"],
    advisoryNote:
      "จัดสรรน้ำเสริมให้กับพื้นที่ปลูกข้าวนาปีและอ้อยโรงงานในเขตชลประทานครบุรี-โชคชัย",
  },
  {
    id: "lam-chae",
    nameTh: "เขื่อนลำแชะ",
    districtTh: "อ.ครบุรี",
    capacityMillionM3: 275.0,
    currentStorageMillionM3: 158.5,
    usableWaterMillionM3: 151.5,
    usablePercent: 56.5,
    dailyInflowM3: 1.05,
    dailyOutflowM3: 0.82,
    statusLabel: "ปริมาณน้ำปานกลาง",
    irrigatedDistricts: ["อ.ครบุรี", "อ.โชคชัย", "อ.เมืองนครราชสีมา"],
    advisoryNote:
      "บริหารจัดการน้ำร่วมกับเขื่อนมูลบน รองรับพื้นที่มันสำปะหลังและอ้อยโรงงานโซนใต้",
  },
];

// กษ.01 Official Ministry of Agriculture Compensation Rates
export const KS01_COMPENSATION_RATES = {
  maxTotalRaiPerHousehold: 30,
  categories: [
    {
      id: "rice",
      nameTh: "ข้าว (ข้าวหอมมะลิ / ข้าวเหนียว / ข้าวนาปี)",
      rateBahtPerRai: 1340,
      examples: "ข้าวหอมมะลิ 105, ข้าว กข6, ข้าว กข15",
      conditionNote: "แปลงนาต้องขึ้นทะเบียนเกษตรกร (ทบก.) ก่อนเกิดภัยพิบัติ และเสียหายสิ้นเชิงตามมติประชาคม",
    },
    {
      id: "field_crop",
      nameTh: "พืชไร่และพืชผัก (มันสำปะหลัง / อ้อย / ข้าวโพดเลี้ยงสัตว์)",
      rateBahtPerRai: 1980,
      examples: "มันสำปะหลัง, อ้อยโรงงาน, ข้าวโพดเลี้ยงสัตว์, ถั่วหรั่ง, พริก",
      conditionNote: "อัตรา 1,980 บาท/ไร่ สำหรับพืชไร่และพืชผักที่เสียหายสิ้นเชิงและอยู่ในเขตประกาศภัยพิบัติ",
    },
    {
      id: "orchard",
      nameTh: "ไม้ผล ไม้ยืนต้น และอื่นๆ",
      rateBahtPerRai: 4048,
      examples: "ทุเรียนปากช่อง, น้อยหน่าเพชรปากช่อง, มะม่วง, ลำไย, ยางพารา",
      conditionNote: "อัตรา 4,048 บาท/ไร่ ช่วยเหลือตามพื้นที่เสียหายจริงรวมทุกประเภทไม่เกินรายละ 30 ไร่",
    },
  ],
  workflowSteps: [
    {
      step: "ปรับปรุงทะเบียนเกษตรกร (Digital DOAE)",
      detail: "แจ้งขึ้นทะเบียนหรือปรับปรุงข้อมูลการเพาะปลูกผ่านแอป Farmbook หรือสำนักงานเกษตรอำเภอ ภายใน 15–60 วันหลังเพาะปลูก",
    },
    {
      step: "ประกาศเขตการให้ความช่วยเหลือผู้ประสบภัยพิบัติกรณีฉุกเฉิน",
      detail: "เมื่อเกิดภัยแล้ง/ฝนทิ้งช่วง/น้ำท่วม และผู้ว่าราชการจังหวัดนครราชสีมาประกาศเขตการให้ความช่วยเหลือฯ ในพื้นที่อำเภอนั้น",
    },
    {
      step: "ยื่นแบบความจำนงขอรับการช่วยเหลือ (กษ.01)",
      detail: "เกษตรกรยื่นแบบ กษ.01 พร้อมภาพถ่ายแปลงที่ระบุพิกัด Geotag/Timestamp และสำเนาสมุดทะเบียนเกษตรกร ต่อผู้นำชุมชน/เกษตรตำบล",
    },
    {
      step: "ตรวจสอบแปลงและติดประกาศประชาคมหมู่บ้าน",
      detail: "คณะกรรมการระดับหมู่บ้านตรวจสอบความเสียหายจริงในพื้นที่และติดประกาศรายชื่อ ณ ศาลาประชาคมไม่น้อยกว่า 3 วัน",
    },
    {
      step: "อนุมัติ ก.ช.ภ.อ. / ก.ช.ภ.จ. และโอนเงินผ่าน ธ.ก.ส.",
      detail: "เมื่อคณะกรรมการให้ความช่วยเหลือผู้ประสบภัยพิบัติอำเภอ/จังหวัดอนุมัติ ธ.ก.ส. จะโอนเงินเข้าบัญชีเกษตรกรโดยตรง",
    },
  ],
};

export interface DoaeFarmerRecord {
  farmerId: string;
  householdCode: string;
  fullName: string;
  districtName: string;
  subdistrictName: string;
  registrationStatus: "ขึ้นทะเบียนสมบูรณ์ (ปรับปรุงข้อมูลปี 2569 แล้ว)" | "รอการยืนยันประชาคมระดับหมู่บ้าน";
  lastUpdatedDate: string;
  baacAccountMasked: string;
  registeredPlots: {
    plotId: string;
    cropName: string;
    category: "rice" | "field_crop" | "orchard";
    rai: number;
    damagedRaiApproved: number;
    coordinates: string;
  }[];
  claimStage:
    | "อนุมัติจ่ายเงินเยียวยาแล้ว (รอโอนเข้า ธ.ก.ส.)"
    | "ผ่านการประชาคมหมู่บ้าน · รอมติ ก.ช.ภ.อ."
    | "อยู่ในพื้นที่เฝ้าระวัง · พร้อมยื่นแบบ กษ.01";
}

export const DOAE_FARMER_RECORDS: DoaeFarmerRecord[] = [
  {
    farmerId: "3300800419281",
    householdCode: "3008-2569-01482",
    fullName: "นายสมพงษ์ วงศ์นคร",
    districtName: "อ.ด่านขุนทด",
    subdistrictName: "ต.กุดพิมาน หมู่ที่ 4",
    registrationStatus: "ขึ้นทะเบียนสมบูรณ์ (ปรับปรุงข้อมูลปี 2569 แล้ว)",
    lastUpdatedDate: "18 สิงหาคม 2569",
    baacAccountMasked: "ธ.ก.ส. สาขาด่านขุนทด (XXX-2-84910-X)",
    registeredPlots: [
      {
        plotId: "PLT-DKT-881",
        cropName: "มันสำปะหลัง (พันธุ์เกษตรศาสตร์ 50)",
        category: "field_crop",
        rai: 18,
        damagedRaiApproved: 14,
        coordinates: "15.2142° N, 101.7718° E",
      },
      {
        plotId: "PLT-DKT-882",
        cropName: "ข้าวโพดเลี้ยงสัตว์",
        category: "field_crop",
        rai: 10,
        damagedRaiApproved: 8,
        coordinates: "15.2165° N, 101.7740° E",
      },
    ],
    claimStage: "ผ่านการประชาคมหมู่บ้าน · รอมติ ก.ช.ภ.อ.",
  },
  {
    farmerId: "3301700892104",
    householdCode: "3017-2569-00915",
    fullName: "นางสาวบุญเรือน ศรีทุ่งสัมฤทธิ์",
    districtName: "อ.ชุมพวง",
    subdistrictName: "ต.ประสุข หมู่ที่ 7",
    registrationStatus: "ขึ้นทะเบียนสมบูรณ์ (ปรับปรุงข้อมูลปี 2569 แล้ว)",
    lastUpdatedDate: "05 กันยายน 2569",
    baacAccountMasked: "ธ.ก.ส. สาขาชุมพวง (XXX-8-11204-X)",
    registeredPlots: [
      {
        plotId: "PLT-CMP-304",
        cropName: "ข้าวหอมมะลิ 105 (ทุ่งสัมฤทธิ์)",
        category: "rice",
        rai: 22,
        damagedRaiApproved: 16,
        coordinates: "15.3512° N, 102.7398° E",
      },
      {
        plotId: "PLT-CMP-309",
        cropName: "อ้อยโรงงานสด",
        category: "field_crop",
        rai: 12,
        damagedRaiApproved: 6,
        coordinates: "15.3540° N, 102.7445° E",
      },
    ],
    claimStage: "อนุมัติจ่ายเงินเยียวยาแล้ว (รอโอนเข้า ธ.ก.ส.)",
  },
  {
    farmerId: "3301200553910",
    householdCode: "3012-2569-02319",
    fullName: "นายประเสริฐ โคราชพัฒนา",
    districtName: "อ.บัวใหญ่",
    subdistrictName: "ต.ด่านช้าง หมู่ที่ 2",
    registrationStatus: "ขึ้นทะเบียนสมบูรณ์ (ปรับปรุงข้อมูลปี 2569 แล้ว)",
    lastUpdatedDate: "29 กรกฎาคม 2569",
    baacAccountMasked: "ธ.ก.ส. สาขาบัวใหญ่ (XXX-4-50921-X)",
    registeredPlots: [
      {
        plotId: "PLT-BYI-119",
        cropName: "ข้าวหอมมะลิ 105",
        category: "rice",
        rai: 25,
        damagedRaiApproved: 20,
        coordinates: "15.5880° N, 102.4290° E",
      },
      {
        plotId: "PLT-BYI-120",
        cropName: "ถั่วหรั่ง (พืชทางเลือกทนแล้ง)",
        category: "field_crop",
        rai: 5,
        damagedRaiApproved: 0,
        coordinates: "15.5892° N, 102.4310° E",
      },
    ],
    claimStage: "อยู่ในพื้นที่เฝ้าระวัง · พร้อมยื่นแบบ กษ.01",
  },
];

export interface EconomicCropTrend {
  id: string;
  rankLabel: string;
  nameTh: string;
  nameEn: string;
  koratPlantedAreaRai: string;
  annualOutputTons: string;
  keyDistricts: string[];
  strategicFocusTitle: string;
  strategicSummary: string;
  riskAlertTitle: string;
  riskAlertDescription: string;
  recommendedVarieties: string[];
  waterRequirementM3PerRai: number;
  netMarginRangeBahtPerRai: string;
  actionChecklist: string[];
}

export const KORAT_ECONOMIC_CROPS: EconomicCropTrend[] = [
  {
    id: "cassava",
    rankLabel: "พืชเศรษฐกิจหลักของนครราชสีมา",
    nameTh: "มันสำปะหลัง (Cassava)",
    nameEn: "Manihot esculenta",
    koratPlantedAreaRai: "1,845,000 ไร่ (อันดับ 1 ของประเทศไทย)",
    annualOutputTons: "6.45 ล้านตันหัวมันสด/ปี",
    keyDistricts: ["อ.เสิงสาง", "อ.ครบุรี", "อ.ด่านขุนทด", "อ.สีคิ้ว", "อ.เทพารักษ์", "อ.หนองบุญมาก"],
    strategicFocusTitle: "การยกระดับเปอร์เซ็นต์เชื้อแป้ง > 25% และการป้องกันโรคใบด่างมันสำปะหลัง (SLCMV)",
    strategicSummary:
      "โคราชมีโรงงานแป้งมันสำปะหลังและลานมันหนาแน่นที่สุดในประเทศ ปัจจัยชี้ขาดกำไรของเกษตรกรคือการจัดการธาตุโพแทสเซียม (K) เพื่อเพิ่มเชื้อแป้งเกิน 25% และการใช้ท่อนพันธุ์สะอาดปลอดเชื้อไวรัสใบด่าง",
    riskAlertTitle: "แจ้งเตือนเฝ้าระวังโรคใบด่างมันสำปะหลัง (Sri Lankan Cassava Mosaic Virus)",
    riskAlertDescription:
      "พบการแพร่ระบาดผ่านท่อนพันธุ์ติดเชื้อและแมลงหวี่ขาวยาสูบ (Bemisia tabaci) ในพื้นที่รอยต่อ อ.เสิงสาง, อ.ครบุรี และ อ.ด่านขุนทด ลักษณะอาการใบด่างเหลืองสลับเขียว ใบหงิกงอ ต้นแคระแกร็น ทำให้น้ำหนักหัวมันและเชื้อแป้งลดลง 40–80%",
    recommendedVarieties: [
      "อิทธิ 1 / อิทธิ 2 / อิทธิ 3 (พันธุ์ต้านทานโรคใบด่าง)",
      "เกษตรศาสตร์ 50 (KU 50 - ทนทาน ปรับตัวดีในดินโคราช)",
      "ห้วยบง 60 / ห้วยบง 80 (เชื้อแป้งสูง 26–28%)",
      "ระยอง 72 (ทนแล้งดี เหมาะกับดินทรายด่านขุนทด)",
    ],
    waterRequirementM3PerRai: 950,
    netMarginRangeBahtPerRai: "4,800 – 8,200 บาท/ไร่",
    actionChecklist: [
      "ใช้ท่อนพันธุ์สะอาดจากแปลงพันธุ์ที่ได้รับการรับรอง ห้ามนำท่อนพันธุ์จากแปลงที่พบอาการใบด่างมาปลูกซ้ำเด็ดขาด",
      "สำรวจแปลงทุก 2 สัปดาห์ในช่วงอายุ 1–4 เดือนแรก หากพบต้นแสดงอาการใบด่างให้ถอนทำลายโดยการฝังกลบหรือใส่ถุงดำตากแดดทันที",
      "ติดตั้งกับดักกาวเหนียวสีเหลืองและพ่นสารไทอะมีทอกแซม/อิมิดาโคลพริดควบคุมแมลงหวี่ขาวในระยะระบาด",
    ],
  },
  {
    id: "sugarcane",
    rankLabel: "พืชอุตสาหกรรมพลังงานและน้ำตาล",
    nameTh: "อ้อยโรงงาน (Industrial Sugarcane)",
    nameEn: "Saccharum officinarum",
    koratPlantedAreaRai: "692,000 ไร่",
    annualOutputTons: "7.80 ล้านตันอ้อยเข้าหีบ/ปี",
    keyDistricts: ["อ.พิมาย", "อ.ครบุรี", "อ.ชุมพวง", "อ.คง", "อ.บัวใหญ่", "อ.ประทาย"],
    strategicFocusTitle: "มาตรการตัดอ้อยสด 100% ลดฝุ่น PM2.5 และสร้างรายได้เสริมจากใบอ้อยชีวมวล",
    strategicSummary:
      "โรงงานน้ำตาลในโคราช (พิมาย, ครบุรี, ชุมพวง) ให้สิทธิช่องทางด่วน Fast Track สำหรับรถอ้อยสด พร้อมเงินส่งเสริมตัดอ้อยสด 120 บาท/ตัน และการรับซื้อใบอ้อยอัดก้อนส่งโรงไฟฟ้าชีวมวลในราคา 800–1,000 บาท/ตันใบอ้อย",
    riskAlertTitle: "การบริหารต้นทุนค่าขนส่งและคิวรถบรรทุกหน้าหีบ",
    riskAlertDescription:
      "ต้นทุนค่าตัดและค่าขนส่งคิดเป็น 32–38% ของรายได้อ้อยทั้งหมด อ้อยไฟไหม้ถูกหักเงินตามระเบียบ สอน. และสูญเสียความหวาน CCS อย่างรวดเร็วหากค้างลานเกิน 48 ชั่วโมง",
    recommendedVarieties: [
      "ขอนแก่น 3 (KK3 - ความหวานสูง 12–14 CCS ทนแล้งดีเยี่ยม)",
      "เค 88-92 (K88-92 - น้ำหนักตันต่อไร่สูง)",
      "แอลเค 92-11 (LK92-11 - กาบใบหลุดร่วงง่าย สะดวกต่อการตัดอ้อยสด)",
    ],
    waterRequirementM3PerRai: 1450,
    netMarginRangeBahtPerRai: "5,200 – 9,500 บาท/ไร่",
    actionChecklist: [
      "วางแผนจองคิวรถตัดอ้อยสางใบผ่านระบบโควตาโรงงานล่วงหน้า 21 วันก่อนเปิดหีบ",
      "งดให้น้ำและปุ๋ยไนโตรเจนก่อนเก็บเกี่ยว 45–60 วัน เพื่อเร่งการสะสมน้ำตาล (เพิ่ม CCS ได้ 1.2–1.8 จุด)",
      "รวมกลุ่มแปลงใหญ่เพื่อใช้เครื่องอัดใบอ้อยก้อนหลังตัด จำหน่ายให้โรงไฟฟ้าชีวมวลเพิ่มรายได้ 1,200–1,500 บาท/ไร่",
    ],
  },
  {
    id: "maize",
    rankLabel: "พืชวัตถุดิบอาหารสัตว์ยุทธศาสตร์",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ (Feed Maize)",
    nameEn: "Zea mays",
    koratPlantedAreaRai: "540,000 ไร่",
    annualOutputTons: "485,000 ตันเมล็ดแห้ง/ปี",
    keyDistricts: ["อ.ปากช่อง", "อ.ด่านขุนทด", "อ.สีคิ้ว", "อ.เสิงสาง", "อ.ปักธงชัย"],
    strategicFocusTitle: "เชื่อมโยงคลัสเตอร์โรงงานอาหารสัตว์โคราช–สระบุรี และควบคุมความชื้น 14.5%",
    strategicSummary:
      "จังหวัดนครราชสีมาเป็นฐานผลิตปศุสัตว์และอาหารสัตว์ขนาดใหญ่ ทำให้มีความต้องการรับซื้อข้าวโพดเลี้ยงสัตว์ในพื้นที่สูงตลอดปี ราคาอิงกับราคาข้าวโพดตลาดโลก (CBOT) และราคากากถั่วเหลืองนำเข้า",
    riskAlertTitle: "ความเสี่ยงอุณหภูมิสูงช่วงผสมเกสร และเชื้อราอะฟลาทอกซินช่วงเก็บเกี่ยวฤดูฝน",
    riskAlertDescription:
      "หากอุณหภูมิสูงเกิน 36°C ร่วมกับขาดน้ำในช่วงข้าวโพดอายุ 45–55 วัน (ระยะออกดอกตัวผู้และแทงไหม) จะทำให้ฝักโหว่ เมล็ดไม่เต็มฝัก ผลผลิตลดลงกว่า 35%",
    recommendedVarieties: [
      "ลูกผสมพันธุ์ทนแล้ง (สำหรับพื้นที่ดอน อ.ด่านขุนทด-สีคิ้ว)",
      "ลูกผสมอายุสั้น 105–110 วัน (สำหรับปลูกเป็นข้าวโพดหลังนาใช้น้ำน้อย)",
    ],
    waterRequirementM3PerRai: 680,
    netMarginRangeBahtPerRai: "3,900 – 6,800 บาท/ไร่",
    actionChecklist: [
      "หลีกเลี่ยงการหว่านเมล็ดที่จะทำให้ระยะออกดอกตรงกับช่วงฝนทิ้งช่วงกลางเดือนมิถุนายน–กรกฎาคม",
      "เก็บเกี่ยวเมื่อข้าวโพดแก่จัด (Black Layer ที่ฐานเมล็ด) อายุ 115–120 วัน เพื่อลดการหักราคาความชื้นหน้าลาน",
      "เฝ้าระวังหนอนกระทู้ข้าวโพดลายจุด (Fall Armyworm) ตั้งแต่งอกถึงอายุ 30 วัน",
    ],
  },
  {
    id: "jasmine_rice",
    rankLabel: "ข้าวอัตลักษณ์สิ่งบ่งชี้ทางภูมิศาสตร์ (GI)",
    nameTh: "ข้าวหอมมะลิทุ่งสัมฤทธิ์ (Thung Samrit Jasmine Rice GI)",
    nameEn: "Oryza sativa (Khao Dawk Mali 105)",
    koratPlantedAreaRai: "3,650,000 ไร่ (ทั้งจังหวัด · เขตทุ่งสัมฤทธิ์ 1.4 ล้านไร่)",
    annualOutputTons: "1.62 ล้านตันข้าวเปลือก/ปี",
    keyDistricts: ["อ.พิมาย", "อ.ชุมพวง", "อ.โนนสูง", "อ.ประทาย", "อ.คง", "อ.บัวใหญ่", "อ.จักราช"],
    strategicFocusTitle: "การยกระดับสู่มาตรฐาน GI ทุ่งสัมฤทธิ์ และเกษตรอินทรีย์พรีเมียม",
    strategicSummary:
      "ดินเหนียวลุ่มน้ำมูลและแร่ธาตุธรรมชาติในแอ่งทุ่งสัมฤทธิ์ทำให้ข้าวหอมมะลิ 105 มีสารให้ความหอม 2-AP สูงและเมล็ดเรียวยาว การขึ้นทะเบียน GI และมาตรฐาน Organic ช่วยเพิ่มราคารับซื้อได้ถึง 1,800–3,200 บาท/ตัน",
    riskAlertTitle: "ความเสี่ยงฝนทิ้งช่วงระยะตั้งท้อง และความเค็มของดินในพื้นที่ลุ่มต่ำ",
    riskAlertDescription:
      "พื้นที่ทุ่งสัมฤทธิ์บางส่วนมีชั้นดินเค็มใต้ดิน หากเกิดฝนทิ้งช่วงนาน ความเค็มจะซึมขึ้นมาที่ผิวดิน ต้องใช้อินทรียวัตถุและปุ๋ยพืชสด (ปอเทือง/โสนอัฟริกัน) ช่วยปรับโครงสร้างดิน",
    recommendedVarieties: [
      "ขาวดอกมะลิ 105 (พันธุ์คัดบริสุทธิ์ กรมการข้าว)",
      "กข15 (อายุสั้นกว่าขาวดอกมะลิ 105 ประมาณ 10–15 วัน เหมาะกับพื้นที่โคก/ดอน)",
    ],
    waterRequirementM3PerRai: 1180,
    netMarginRangeBahtPerRai: "3,400 – 6,400 บาท/ไร่",
    actionChecklist: [
      "ใช้เมล็ดพันธุ์ข้าวหอมมะลิ 105 ชั้นพันธุ์ขยาย/พันธุ์จำหน่าย อัตราไม่เกิน 15 กก./ไร่ เพื่อลดต้นทุนและได้รวงใหญ่",
      "ใส่ปุ๋ยตามค่าวิเคราะห์ดิน 2 ครั้ง (ระยะแตกกอ และระยะกำเนิดช่อดอก/แต่งตัว)",
      "ระบายน้ำออกจากแปลงนา 10–14 วันก่อนเก็บเกี่ยว เพื่อให้ข้าวสุกแก่พร้อมกันและได้เปอร์เซ็นต์ต้นข้าวสูงสุด",
    ],
  },
  {
    id: "alternative_legumes",
    rankLabel: "พืชทางเลือกอายุสั้นและพืชตระกูลถั่วบำรุงดิน",
    nameTh: "ถั่วหรั่ง · ถั่วเขียวผิวมัน · เกษตรผสมผสานทนแล้ง",
    nameEn: "Vigna subterranea & Vigna radiata",
    koratPlantedAreaRai: "185,000 ไร่ (ขยายตัว +24% ต่อปี)",
    annualOutputTons: "58,000 ตัน/ปี",
    keyDistricts: ["อ.บัวใหญ่", "อ.โนนสูง", "อ.พิมาย", "อ.ด่านขุนทด", "อ.แก้งสนามนาง"],
    strategicFocusTitle: "พืชใช้น้ำน้อยอายุสั้น 65–110 วัน ตรึงไนโตรเจนในดินและสร้างกระแสเงินสดเร็ว",
    strategicSummary:
      "ถั่วหรั่งและถั่วเขียวผิวมันใช้น้ำเพียง 20–25% ของการทำนาปรัง ทนทานต่อดินทรายและภาวะฝนทิ้งช่วงในโซนเหนือของโคราช พร้อมปมรากไรโซเบียมที่ช่วยตรึงไนโตรเจน ลดค่าปุ๋ยเคมีในฤดูถัดไปได้ 15–25%",
    riskAlertTitle: "โอกาสตลาดแปรรูปโปรตีนพืชและเมล็ดพันธุ์ชุมชน",
    riskAlertDescription:
      "ถั่วหรั่งฝักสดต้มและเมล็ดแห้งมีราคาสูงถึง 35–55 บาท/กก. ส่วนถั่วเขียวผิวมันหลังนามีโรงงานวุ้นเส้นและอุตสาหกรรมเพาะถั่วงอกรับซื้อไม่อั้น",
    recommendedVarieties: [
      "ถั่วหรั่งพันธุ์พื้นเมืองโคราช / สงขลา 1 (ทนแล้งจัด ติดฝักใต้ดินดก)",
      "ถั่วเขียวผิวมันพันธุ์ชัยนาท 84-1 / มทส.1 (สุกแก่พร้อมกัน อายุ 65–70 วัน)",
      "ถั่วลิสงพันธุ์ไทนาน 9 / ขอนแก่น 6 (เหมาะกับดินร่วนปนทราย)",
    ],
    waterRequirementM3PerRai: 290,
    netMarginRangeBahtPerRai: "4,200 – 7,900 บาท/ไร่ (ในเวลาเพียง 70–100 วัน)",
    actionChecklist: [
      "คลุกเมล็ดพันธุ์ถั่วด้วยเชื้อไรโซเบียมของกรมวิชาการเกษตรก่อนปลูกทุกครั้ง เพื่อตรึงไนโตรเจน 6–10 กก./ไร่",
      "ปลูกหลังเก็บเกี่ยวข้าวหอมมะลิทันทีโดยอาศัยความชื้นตกค้างในดินเหนียวทุ่งสัมฤทธิ์ ไม่ต้องสูบน้ำเพิ่ม",
      "ไถกลบเศษซากต้นถั่วหลังเก็บเกี่ยวเพื่อเพิ่มอินทรียวัตถุ (OM%) ให้ดินโคราช",
    ],
  },
  {
    id: "tropical_fruits",
    rankLabel: "ไม้ผลเศรษฐกิจทางเลือกรายได้สูงโซนเขาและตอนใต้ (GI & Agritourism)",
    nameTh: "ผลไม้เมืองร้อนมูลค่าสูง: ทุเรียน · เงาะโรงเรียน · มังคุด",
    nameEn: "Durio zibethinus, Nephelium lappaceum & Garcinia mangostana",
    koratPlantedAreaRai: "42,500 ไร่ (เติบโตต่อเนื่อง +18% ต่อปี ในโซนเขาและตอนใต้)",
    annualOutputTons: "38,400 ตันผลผลิตเกรดพรีเมียม/ปี",
    keyDistricts: ["อ.ปากช่อง", "อ.ครบุรี", "อ.เสิงสาง", "อ.วังน้ำเขียว", "อ.หนองบุญมาก"],
    strategicFocusTitle: "อัตลักษณ์รสชาติ 'หวาน มัน เนื้อแน่น ไม่เละ กลิ่นไม่ฉุนจัด' สู่สินค้า GI ท่องเที่ยวเชิงเกษตร และระบบจองต้นออนไลน์",
    strategicSummary:
      "พื้นที่อำเภอตอนใต้และริมเขตอุทยานแห่งชาติ (ปากช่อง, ครบุรี, เสิงสาง, วังน้ำเขียว และหนองบุญมาก) มีดินภูเขาไฟเก่าและดินร่วนปนทรายแร่ธาตุสูง ระบายน้ำดี ผสานความชื้นสัมพัทธ์สูงจากผืนป่าดงพญาเย็น-เขาใหญ่ และอากาศเย็นช่วงกลางคืนในฤดูแล้งที่ช่วยกระตุ้นการติดดอกและสร้างอัตลักษณ์เนื้อผลไม้โคราชที่โดดเด่นไม่เหมือนใคร",
    riskAlertTitle: "การบริหารจัดการน้ำช่วงติดดอก-หางแย้ไหม้ (ก.พ.–เม.ย.) และโรครากเน่าโคนเน่าช่วงฝนชุก",
    riskAlertDescription:
      "ทุเรียน เงาะ และมังคุดต้องการการกักน้ำเพื่อกระตุ้นตาดอก และต้องการน้ำสม่ำเสมอช่วงพัฒนาผล (พ.ค.–ส.ค.) เกษตรกรควรสำรองน้ำในสระประจำสวนอย่างน้อย 1,100 ลบ.ม./ไร่ และใช้เชื้อราไตรโคเดอร์มาป้องกันโรครากเน่าไฟทอปธอรา",
    recommendedVarieties: [
      "ทุเรียนพันธุ์หมอนทอง (ทุเรียนปากช่อง-เขาใหญ่ GI · เนื้อละเอียด กลิ่นหอมละมุน ไม่หวานแหลม ออกตลาด พ.ค.–ก.ค.)",
      "เงาะพันธุ์โรงเรียน (ครบุรี-เสิงสาง-วังน้ำเขียว · เปลือกแดงสด ขนยาวปลายเขียว เนื้อแห้งกรอบร่อน ไม่ติดเมล็ด ออกตลาด มิ.ย.–ส.ค.)",
      "มังคุดคัดเกรดภูเขาไฟ (วังน้ำเขียว-ปากช่อง-ครบุรี · เปลือกบาง เนื้อขาวฟู หวานซ่อนเปรี้ยว ออกตลาด มิ.ย.–ส.ค.)",
    ],
    waterRequirementM3PerRai: 1150,
    netMarginRangeBahtPerRai: "45,000 – 135,000 บาท/ไร่/ปี",
    actionChecklist: [
      "ขึ้นทะเบียนสิ่งบ่งชี้ทางภูมิศาสตร์ (GI ทุเรียนปากช่อง-เขาใหญ่) และมาตรฐาน GAP เพื่อยกระดับราคาขายปลีกพรีเมียม",
      "พัฒนาสวนสู่การท่องเที่ยวเชิงเกษตร (Agritourism) เปิดรับนักท่องเที่ยวเข้าชมและชิมสดจากต้นในช่วงเดือนพฤษภาคม–สิงหาคม",
      "ใช้การตลาดออนไลน์และระบบจองต้น (Tree Pre-order / ผูกปิ่นโตผลไม้) ขายตรงถึงผู้บริโภคโดยไม่ผ่านคนกลาง เพิ่มส่วนต่างกำไร 30–45%",
    ],
  },
];

// Module 5: Fertilizer Prices & Smart Cost Calculator Data
export interface FertilizerPriceItem {
  code: string;
  formula: string;
  nameTh: string;
  category: "แม่ปุ๋ยเคมี (สำหรับผสมใช้เอง)" | "ปุ๋ยเคมีสูตรสำเร็จ" | "สารปรับปรุงดิน/ปุ๋ยอินทรีย์";
  nPct: number;
  pPct: number;
  kPct: number;
  pricePer50KgBag: number;
  priceLastMonth: number;
  recommendedUse: string;
}

export const KORAT_FERTILIZER_PRICES: FertilizerPriceItem[] = [
  {
    code: "urea-46-0-0",
    formula: "46-0-0",
    nameTh: "ปุ๋ยยูเรีย (แม่ปุ๋ยไนโตรเจน N)",
    category: "แม่ปุ๋ยเคมี (สำหรับผสมใช้เอง)",
    nPct: 46,
    pPct: 0,
    kPct: 0,
    pricePer50KgBag: 830,
    priceLastMonth: 850,
    recommendedUse: "เร่งการเจริญเติบโตทางใบและลำต้น · ใช้เป็นแม่ปุ๋ยหลักในการผสมปุ๋ยสั่งตัด",
  },
  {
    code: "dap-18-46-0",
    formula: "18-46-0",
    nameTh: "ไดแอมโมเนียมฟอสเฟต DAP (แม่ปุ๋ย P)",
    category: "แม่ปุ๋ยเคมี (สำหรับผสมใช้เอง)",
    nPct: 18,
    pPct: 46,
    kPct: 0,
    pricePer50KgBag: 1290,
    priceLastMonth: 1310,
    recommendedUse: "เร่งรากและการแตกกอ · ใช้เป็นแม่ปุ๋ยฟอสฟอรัสความเข้มข้นสูง",
  },
  {
    code: "mop-0-0-60",
    formula: "0-0-60",
    nameTh: "มิวเรียตออฟโพแทช MOP (แม่ปุ๋ย K)",
    category: "แม่ปุ๋ยเคมี (สำหรับผสมใช้เอง)",
    nPct: 0,
    pPct: 0,
    kPct: 60,
    pricePer50KgBag: 1020,
    priceLastMonth: 1050,
    recommendedUse: "เร่งการลงหัวและเพิ่มเชื้อแป้งในมันสำปะหลัง · เพิ่มความหวาน CCS ในอ้อย",
  },
  {
    code: "comp-15-15-15",
    formula: "15-15-15",
    nameTh: "ปุ๋ยสูตรเสมอ 15-15-15",
    category: "ปุ๋ยเคมีสูตรสำเร็จ",
    nPct: 15,
    pPct: 15,
    kPct: 15,
    pricePer50KgBag: 1080,
    priceLastMonth: 1090,
    recommendedUse: "บำรุงต้นระยะแรกในพืชไร่และไม้ผล (หากผสมเองจากแม่ปุ๋ยจะประหยัดกว่ามาก)",
  },
  {
    code: "comp-16-20-0",
    formula: "16-20-0",
    nameTh: "ปุ๋ยนาข้าว/พืชไร่ 16-20-0",
    category: "ปุ๋ยเคมีสูตรสำเร็จ",
    nPct: 16,
    pPct: 20,
    kPct: 0,
    pricePer50KgBag: 980,
    priceLastMonth: 995,
    recommendedUse: "รองพื้นและเร่งแตกกอในนาดินเหนียว (เช่น ชุดดินพิมาย)",
  },
  {
    code: "comp-15-7-18",
    formula: "15-7-18",
    nameTh: "ปุ๋ยมันสำปะหลัง/อ้อย 15-7-18",
    category: "ปุ๋ยเคมีสูตรสำเร็จ",
    nPct: 15,
    pPct: 7,
    kPct: 18,
    pricePer50KgBag: 990,
    priceLastMonth: 1010,
    recommendedUse: "บำรุงหัวมันสำปะหลังและอ้อยโรงงานในดินร่วนปนทรายโคราช",
  },
  {
    code: "dolomite",
    formula: "CaMg(CO3)2",
    nameTh: "ปูนโดโลไมท์ / สารตัวเติมปรับสภาพดินกรด",
    category: "สารปรับปรุงดิน/ปุ๋ยอินทรีย์",
    nPct: 0,
    pPct: 0,
    kPct: 0,
    pricePer50KgBag: 145,
    priceLastMonth: 145,
    recommendedUse: "แก้ดินเปรี้ยว (pH < 5.5) เสริมแคลเซียม-แมกนีเซียม และใช้เป็นสารตัวเติม (Filler)",
  },
];

export interface ProductionInputBenchmark {
  nameTh: string;
  unit: string;
  priceBaht: number;
  note: string;
}

export const KORAT_INPUT_BENCHMARKS: ProductionInputBenchmark[] = [
  {
    nameTh: "น้ำมันดีเซล (สถานีบริการ จ.นครราชสีมา)",
    unit: "บาท/ลิตร",
    priceBaht: 32.94,
    note: "กระทบต้นทุนค่าไถเตรียมดิน ค่าสูบน้ำ และค่ารถบรรทุกไปลาน",
  },
  {
    nameTh: "ค่าจ้างรถไถเตรียมดิน (ผาน 3 + ผาน 7 ยกร่อง)",
    unit: "บาท/ไร่",
    priceBaht: 650,
    note: "อัตราเฉลี่ยพื้นที่ อ.ด่านขุนทด, เสิงสาง และครบุรี",
  },
  {
    nameTh: "ค่าแรงงานเกษตรกรรายวัน (ปลูก/กำจัดวัชพืช/ขุดมัน)",
    unit: "บาท/คน/วัน",
    priceBaht: 380,
    note: "แรงงานภาคเกษตรในจังหวัดนครราชสีมา",
  },
  {
    nameTh: "ค่ารถเกี่ยวข้าวหอมมะลิ / รถตัดอ้อยสด",
    unit: "บาท/ไร่ หรือ บาท/ตัน",
    priceBaht: 680,
    note: "รถเกี่ยวข้าว ~680 บาท/ไร่ · รถตัดอ้อยสด ~220 บาท/ตัน",
  },
];

export interface CropCostPreset {
  cropKey: CommodityKey;
  cropNameTh: string;
  yieldUnit: "กก./ไร่" | "ตัน/ไร่";
  defaultYieldPerRai: number;
  sellingPricePerYieldUnit: number;
  defaultCostsPerRai: {
    landPrepBaht: number;
    seedOrStemBaht: number;
    fertilizerBaht: number;
    cropProtectionBaht: number;
    laborAndHarvestBaht: number;
    transportAndRentBaht: number;
  };
}

export const CROP_COST_PRESETS: CropCostPreset[] = [
  {
    cropKey: "cassava_fresh",
    cropNameTh: "มันสำปะหลัง (หัวมันสด เชื้อแป้ง 25%)",
    yieldUnit: "กก./ไร่",
    defaultYieldPerRai: 3800,
    sellingPricePerYieldUnit: 3.15,
    defaultCostsPerRai: {
      landPrepBaht: 750,
      seedOrStemBaht: 600,
      fertilizerBaht: 1250,
      cropProtectionBaht: 450,
      laborAndHarvestBaht: 1450,
      transportAndRentBaht: 950,
    },
  },
  {
    cropKey: "sugarcane_fresh",
    cropNameTh: "อ้อยโรงงานสด (ความหวาน 10–12 CCS)",
    yieldUnit: "ตัน/ไร่",
    defaultYieldPerRai: 12.5,
    sellingPricePerYieldUnit: 1420,
    defaultCostsPerRai: {
      landPrepBaht: 1100,
      seedOrStemBaht: 1400,
      fertilizerBaht: 1850,
      cropProtectionBaht: 600,
      laborAndHarvestBaht: 2750,
      transportAndRentBaht: 1800,
    },
  },
  {
    cropKey: "maize_feed",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์ (เมล็ดแห้ง 14.5%)",
    yieldUnit: "กก./ไร่",
    defaultYieldPerRai: 920,
    sellingPricePerYieldUnit: 10.65,
    defaultCostsPerRai: {
      landPrepBaht: 600,
      seedOrStemBaht: 950,
      fertilizerBaht: 1350,
      cropProtectionBaht: 480,
      laborAndHarvestBaht: 850,
      transportAndRentBaht: 650,
    },
  },
  {
    cropKey: "jasmine_rice",
    cropNameTh: "ข้าวหอมมะลิ 105 (ทุ่งสัมฤทธิ์)",
    yieldUnit: "กก./ไร่",
    defaultYieldPerRai: 480,
    sellingPricePerYieldUnit: 15.85,
    defaultCostsPerRai: {
      landPrepBaht: 650,
      seedOrStemBaht: 420,
      fertilizerBaht: 980,
      cropProtectionBaht: 320,
      laborAndHarvestBaht: 750,
      transportAndRentBaht: 550,
    },
  },
];

// Module 6: Time-Series / Prophet Forecast & Seasonal Harvest Peak Data
export interface MonthlyForecastPoint {
  monthLabel: string;
  periodType: "ข้อมูลจริงย้อนหลัง" | "ปัจจุบัน" | "คาดการณ์ ML (Prophet)";
  priceActualOrMean: number;
  priceLower90: number;
  priceUpper90: number;
  harvestSupplyPct: number; // % of annual Korat harvest hitting yards this month
  yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)" | "คิวปานกลาง" | "คิวคล่องตัว (โรงงานแย่งซื้อ)";
}

export interface CropForecastProfile {
  commodityKey: CommodityKey;
  cropNameTh: string;
  unit: string;
  currentPrice: number;
  forecast30dPrice: number;
  forecast60dPrice: number;
  forecast90dPrice: number;
  optimalSellingWindow: string;
  harvestPeakWarning: string;
  recommendationSignal: "ชะลอการเก็บเกี่ยว 30–45 วัน" | "ทยอยขายแบ่งล็อต 50:50" | "แนะนำขายช่วงต้นหีบ/ราคาพรีเมียม";
  macroFactors: {
    factorName: string;
    indicatorValue: string;
    impactDirection: "ปัจจัยบวกหนุนราคา" | "ปัจจัยกดดันต้องเฝ้าระวัง";
    detail: string;
  }[];
  series: MonthlyForecastPoint[];
}

export const CROP_FORECAST_PROFILES: Record<CommodityKey, CropForecastProfile> = {
  cassava_fresh: {
    commodityKey: "cassava_fresh",
    cropNameTh: "หัวมันสำปะหลังสด (เชื้อแป้ง 25%)",
    unit: "บาท/กก.",
    currentPrice: 3.15,
    forecast30dPrice: 3.24,
    forecast60dPrice: 3.38,
    forecast90dPrice: 3.45,
    optimalSellingWindow: "ปลายเดือนพฤศจิกายน – ธันวาคม หรือหลังเมษายน (หลีกเลี่ยงช่วงขุดชนกัน ม.ค.–ก.พ.)",
    harvestPeakWarning:
      "กว่า 52% ของมันสำปะหลังในโคราชถูกขุดพร้อมกันช่วง ม.ค.–มี.ค. ทำให้คิวรถหน้าโรงแป้งเสิงสาง-ครบุรี-ด่านขุนทดยาวถึง 8–14 ชั่วโมง และราคารับซื้ออ่อนตัวลงเฉลี่ย 0.25–0.35 บาท/กก.",
    recommendationSignal: "ชะลอการเก็บเกี่ยว 30–45 วัน",
    macroFactors: [
      {
        factorName: "สต็อกแป้งมันสำปะหลังและมันเส้นท่าเรือชิงเต่า (ประเทศจีน)",
        indicatorValue: "ลดลง -14.2% YoY (ความต้องการนำเข้าสูง)",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "โรงงานเอทานอลและอุตสาหกรรมกระดาษในจีนเร่งสั่งซื้อมันเส้นและแป้งมันจากไทยก่อนเทศกาลตรุษจีน",
      },
      {
        factorName: "เปอร์เซ็นต์เชื้อแป้งเฉลี่ยในพื้นที่ จ.นครราชสีมา",
        indicatorValue: "24.8% (เพิ่มขึ้นหลังหมดฝนชุก)",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "เมื่อดินเริ่มแห้งหลังพ้นช่วงฝนชุก หัวมันจะสะสมแป้งกลับขึ้นมาที่ 26–28% ทำให้ขายได้ราคาบวกเพิ่ม",
      },
      {
        factorName: "ปริมาณหัวมันออกสู่ตลาดพร้อมกันช่วงต้นปี",
        indicatorValue: "คาดการณ์คิวหน้าโรงแป้งหนาแน่น ม.ค.–ก.พ.",
        impactDirection: "ปัจจัยกดดันต้องเฝ้าระวัง",
        detail: "ไม่ควรเร่งขุดพร้อมกันในช่วงพีค หรือควรแปรรูปทำมันเส้นสะอาดตากแห้งเพื่อรอจังหวะราคาดี",
      },
    ],
    series: [
      {
        monthLabel: "พ.ค.",
        periodType: "ข้อมูลจริงย้อนหลัง",
        priceActualOrMean: 2.95,
        priceLower90: 2.95,
        priceUpper90: 2.95,
        harvestSupplyPct: 5,
        yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)",
      },
      {
        monthLabel: "มิ.ย.",
        periodType: "ข้อมูลจริงย้อนหลัง",
        priceActualOrMean: 2.88,
        priceLower90: 2.88,
        priceUpper90: 2.88,
        harvestSupplyPct: 4,
        yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)",
      },
      {
        monthLabel: "ก.ค.",
        periodType: "ข้อมูลจริงย้อนหลัง",
        priceActualOrMean: 2.92,
        priceLower90: 2.92,
        priceUpper90: 2.92,
        harvestSupplyPct: 5,
        yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)",
      },
      {
        monthLabel: "ส.ค.",
        periodType: "ข้อมูลจริงย้อนหลัง",
        priceActualOrMean: 3.00,
        priceLower90: 3.00,
        priceUpper90: 3.00,
        harvestSupplyPct: 6,
        yardCongestionStatus: "คิวปานกลาง",
      },
      {
        monthLabel: "ก.ย.",
        periodType: "ข้อมูลจริงย้อนหลัง",
        priceActualOrMean: 3.06,
        priceLower90: 3.06,
        priceUpper90: 3.06,
        harvestSupplyPct: 7,
        yardCongestionStatus: "คิวปานกลาง",
      },
      {
        monthLabel: "ต.ค. (ปัจจุบัน)",
        periodType: "ปัจจุบัน",
        priceActualOrMean: 3.15,
        priceLower90: 3.12,
        priceUpper90: 3.18,
        harvestSupplyPct: 8,
        yardCongestionStatus: "คิวปานกลาง",
      },
      {
        monthLabel: "พ.ย. (+30 วัน)",
        periodType: "คาดการณ์ ML (Prophet)",
        priceActualOrMean: 3.24,
        priceLower90: 3.15,
        priceUpper90: 3.34,
        harvestSupplyPct: 10,
        yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)",
      },
      {
        monthLabel: "ธ.ค. (+60 วัน)",
        periodType: "คาดการณ์ ML (Prophet)",
        priceActualOrMean: 3.38,
        priceLower90: 3.24,
        priceUpper90: 3.52,
        harvestSupplyPct: 14,
        yardCongestionStatus: "คิวปานกลาง",
      },
      {
        monthLabel: "ม.ค. (+90 วัน)",
        periodType: "คาดการณ์ ML (Prophet)",
        priceActualOrMean: 3.45,
        priceLower90: 3.26,
        priceUpper90: 3.60,
        harvestSupplyPct: 22,
        yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)",
      },
    ],
  },
  cassava_chip: {
    commodityKey: "cassava_chip",
    cropNameTh: "มันเส้นสะอาด (ส่งออก/โรงงานเอทานอล)",
    unit: "บาท/กก.",
    currentPrice: 7.45,
    forecast30dPrice: 7.68,
    forecast60dPrice: 7.92,
    forecast90dPrice: 8.10,
    optimalSellingWindow: "พฤศจิกายน – มกราคม (ช่วงแดดจัด ลานตากทำมันเส้นคุณภาพสูงและคำสั่งซื้อจีนเข้าสูงสุด)",
    harvestPeakWarning:
      "การแปรรูปเป็นมันเส้นสะอาดช่วยหลีกเลี่ยงปัญหาราคาหัวมันสดตกต่ำช่วงขุดชนกัน และสามารถเก็บเข้าโกดังรอขายช่วงราคาพุ่งเกิน 7.90 บาท/กก.",
    recommendationSignal: "ชะลอการเก็บเกี่ยว 30–45 วัน",
    macroFactors: [
      {
        factorName: "ราคามันเส้นส่งออก FOB กรุงเทพฯ - ชิงเต่า",
        indicatorValue: "268 USD/ตัน (+4.5% MoM)",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "ความต้องการใช้ผลิตแอลกอฮอล์และอาหารสัตว์ในจีนปรับตัวสูงขึ้นต่อเนื่อง",
      },
      {
        factorName: "สภาพอากาศช่วงปลายฝนต้นหนาวในโคราช",
        indicatorValue: "แสงแดดจัด 7–8 ชม./วัน ลดเวลาตากเหลือ 3 วัน",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "ได้มันเส้นสีขาวสะอาด ความชื้นต่ำกว่า 14% ไม่เสียค่าหักความชื้น",
      },
    ],
    series: [
      { monthLabel: "พ.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 7.05, priceLower90: 7.05, priceUpper90: 7.05, harvestSupplyPct: 4, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "มิ.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 7.10, priceLower90: 7.10, priceUpper90: 7.10, harvestSupplyPct: 3, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ก.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 7.15, priceLower90: 7.15, priceUpper90: 7.15, harvestSupplyPct: 4, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ส.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 7.22, priceLower90: 7.22, priceUpper90: 7.22, harvestSupplyPct: 5, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ก.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 7.30, priceLower90: 7.30, priceUpper90: 7.30, harvestSupplyPct: 6, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ต.ค. (ปัจจุบัน)", periodType: "ปัจจุบัน", priceActualOrMean: 7.45, priceLower90: 7.40, priceUpper90: 7.50, harvestSupplyPct: 9, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "พ.ย. (+30 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 7.68, priceLower90: 7.52, priceUpper90: 7.85, harvestSupplyPct: 14, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ธ.ค. (+60 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 7.92, priceLower90: 7.70, priceUpper90: 8.15, harvestSupplyPct: 18, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ม.ค. (+90 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 8.10, priceLower90: 7.82, priceUpper90: 8.38, harvestSupplyPct: 24, yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)" },
    ],
  },
  sugarcane_fresh: {
    commodityKey: "sugarcane_fresh",
    cropNameTh: "อ้อยโรงงานสด (ฐาน 10 CCS)",
    unit: "บาท/ตัน",
    currentPrice: 1420,
    forecast30dPrice: 1445,
    forecast60dPrice: 1480,
    forecast90dPrice: 1510,
    optimalSellingWindow: "ธันวาคม – กุมภาพันธ์ (ช่วงอากาศหนาวเย็น ค่าความหวาน CCS พุ่งสูงสุด 12.5–14.0 CCS)",
    harvestPeakWarning:
      "การตัดอ้อยเร็วเกินไปช่วงความชื้นดินยังสูงจะได้ค่า CCS เพียง 9.5–10.5 หากชะลอเข้าสู่ช่วงอากาศเย็นในเดือน ธ.ค.–ม.ค. ค่าความหวานที่เพิ่มขึ้น 2 CCS จะเพิ่มรายได้ทันที +170 บาท/ตัน",
    recommendationSignal: "แนะนำขายช่วงต้นหีบ/ราคาพรีเมียม",
    macroFactors: [
      {
        factorName: "ราคาน้ำตาลทรายดิบตลาดโลก (NY#11 Sugar Futures)",
        indicatorValue: "21.85 เซนต์/ปอนด์ (ทรงตัวระดับสูง)",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "ภัยแล้งในบราซิลและโควตาส่งออกจำกัดของอินเดียหนุนราคาอ้อยขั้นต้นและเงินตามขั้นสุดท้ายของไทย",
      },
      {
        factorName: "มาตรการรับซื้ออ้อยสดและใบอ้อยชีวมวลในโคราช",
        indicatorValue: "+120 บาท/ตันอ้อยสด + 900 บาท/ตันใบอ้อย",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "เกษตรกรที่ตัดอ้อยสดและขายใบอ้อยให้โรงไฟฟ้าครบุรี/พิมาย จะมีรายได้รวมสูงกว่าอ้อยไฟไหม้กว่า 280 บาท/ตัน",
      },
    ],
    series: [
      { monthLabel: "พ.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 1360, priceLower90: 1360, priceUpper90: 1360, harvestSupplyPct: 2, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "มิ.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 1360, priceLower90: 1360, priceUpper90: 1360, harvestSupplyPct: 0, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ก.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 1380, priceLower90: 1380, priceUpper90: 1380, harvestSupplyPct: 0, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ส.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 1390, priceLower90: 1390, priceUpper90: 1390, harvestSupplyPct: 0, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ก.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 1405, priceLower90: 1405, priceUpper90: 1405, harvestSupplyPct: 0, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ต.ค. (ปัจจุบัน)", periodType: "ปัจจุบัน", priceActualOrMean: 1420, priceLower90: 1405, priceUpper90: 1435, harvestSupplyPct: 3, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "พ.ย. (+30 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 1445, priceLower90: 1420, priceUpper90: 1475, harvestSupplyPct: 8, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ธ.ค. (+60 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 1480, priceLower90: 1445, priceUpper90: 1520, harvestSupplyPct: 25, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ม.ค. (+90 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 1510, priceLower90: 1470, priceUpper90: 1555, harvestSupplyPct: 32, yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)" },
    ],
  },
  maize_feed: {
    commodityKey: "maize_feed",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์ (ความชื้น 14.5%)",
    unit: "บาท/กก.",
    currentPrice: 10.65,
    forecast30dPrice: 10.90,
    forecast60dPrice: 11.25,
    forecast90dPrice: 11.40,
    optimalSellingWindow: "ปลายเดือนพฤศจิกายน – มกราคม (หลังผลผลิตรุ่นฝนชุดใหญ่ออกหมดและเมล็ดแห้งคาต้น)",
    harvestPeakWarning:
      "ช่วงเดือนตุลาคม–ต้นพฤศจิกายน ข้าวโพดฤดูฝนใน อ.ปากช่อง, ด่านขุนทด และสีคิ้วออกสู่ตลาดพร้อมกัน และมักมีความชื้นสูง 26–30% หากปล่อยให้แห้งคาต้นอีก 15–20 วันจะได้ราคาดีขึ้นกว่า 1.80 บาท/กก.",
    recommendationSignal: "ทยอยขายแบ่งล็อต 50:50",
    macroFactors: [
      {
        factorName: "ความต้องการโรงงานอาหารสัตว์ภาคอีสาน (โคราช-ขอนแก่น)",
        indicatorValue: "เดินเครื่อง 92% ของกำลังการผลิต",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "อุตสาหกรรมการเลี้ยงไก่เนื้อและสุกรในโคราชมีความต้องการวัตถุดิบข้าวโพดในพื้นที่อย่างต่อเนื่อง",
      },
      {
        factorName: "ผลผลิตข้าวโพดฤดูฝนออกสู่ตลาดช่วง ต.ค.",
        indicatorValue: "ปริมาณเข้าลานสูงสุด 35% ของทั้งปี",
        impactDirection: "ปัจจัยกดดันต้องเฝ้าระวัง",
        detail: "การหักความชื้นหน้าลานสูงในช่วงที่มีฝนตกชุก แนะนำใช้ลานอบสหกรณ์ก่อนส่งโรงงาน",
      },
    ],
    series: [
      { monthLabel: "พ.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 11.10, priceLower90: 11.10, priceUpper90: 11.10, harvestSupplyPct: 5, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "มิ.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 11.25, priceLower90: 11.25, priceUpper90: 11.25, harvestSupplyPct: 4, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ก.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 11.05, priceLower90: 11.05, priceUpper90: 11.05, harvestSupplyPct: 6, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ส.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 10.85, priceLower90: 10.85, priceUpper90: 10.85, harvestSupplyPct: 12, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ก.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 10.72, priceLower90: 10.72, priceUpper90: 10.72, harvestSupplyPct: 18, yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)" },
      { monthLabel: "ต.ค. (ปัจจุบัน)", periodType: "ปัจจุบัน", priceActualOrMean: 10.65, priceLower90: 10.55, priceUpper90: 10.75, harvestSupplyPct: 24, yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)" },
      { monthLabel: "พ.ย. (+30 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 10.90, priceLower90: 10.70, priceUpper90: 11.12, harvestSupplyPct: 14, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "ธ.ค. (+60 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 11.25, priceLower90: 10.95, priceUpper90: 11.55, harvestSupplyPct: 7, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ม.ค. (+90 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 11.40, priceLower90: 11.08, priceUpper90: 11.72, harvestSupplyPct: 5, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
    ],
  },
  jasmine_rice: {
    commodityKey: "jasmine_rice",
    cropNameTh: "ข้าวเปลือกหอมมะลิ 105 (ทุ่งสัมฤทธิ์)",
    unit: "บาท/ตัน",
    currentPrice: 15850,
    forecast30dPrice: 15400,
    forecast60dPrice: 16350,
    forecast90dPrice: 16900,
    optimalSellingWindow: "ขายผ่านสหกรณ์/เข้าร่วมโครงการชะลอการขาย (จำนำยุ้งฉาง) เพื่อจำหน่ายช่วง ธ.ค.–ก.พ.",
    harvestPeakWarning:
      "ข้าวหอมมะลินาปีในทุ่งสัมฤทธิ์จะเก็บเกี่ยวพร้อมกันกว่า 70% ในเดือนพฤศจิกายน การขายข้าวสดหน้าแปลงทันทีจะได้ราคาต่ำกว่าการตากลดความชื้นเหลือ 15% และชะลอขาย 45 วัน ถึง 2,200–2,800 บาท/ตัน",
    recommendationSignal: "ชะลอการเก็บเกี่ยว 30–45 วัน",
    macroFactors: [
      {
        factorName: "คำสั่งซื้อข้าวหอมมะลิไทยจากตลาดสหรัฐฯ และฮ่องกง",
        indicatorValue: "เพิ่มขึ้น +11.8% (ช่วงปลายปี)",
        impactDirection: "ปัจจัยบวกหนุนราคา",
        detail: "ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI ได้รับความนิยมสูงในกลุ่มตลาดพรีเมียมและผู้ส่งออก",
      },
      {
        factorName: "ผลผลิตข้าวใหม่ภาคอีสานออกพร้อมกันเดือนพฤศจิกายน",
        indicatorValue: "กว่า 70% ของผลผลิตทั้งปีออกในเดือนเดียว",
        impactDirection: "ปัจจัยกดดันต้องเฝ้าระวัง",
        detail: "แนะนำเข้าร่วมโครงการสินเชื่อชะลอการขายข้าวเปลือกนาปี (ธ.ก.ส.) รับค่าฝากเก็บ 1,500 บาท/ตัน เพื่อรอขายช่วงราคาปรับขึ้นเดือนมกราคม",
      },
    ],
    series: [
      { monthLabel: "พ.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 15200, priceLower90: 15200, priceUpper90: 15200, harvestSupplyPct: 2, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "มิ.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 15350, priceLower90: 15350, priceUpper90: 15350, harvestSupplyPct: 2, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ก.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 15500, priceLower90: 15500, priceUpper90: 15500, harvestSupplyPct: 2, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ส.ค.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 15600, priceLower90: 15600, priceUpper90: 15600, harvestSupplyPct: 2, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ก.ย.", periodType: "ข้อมูลจริงย้อนหลัง", priceActualOrMean: 15720, priceLower90: 15720, priceUpper90: 15720, harvestSupplyPct: 3, yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)" },
      { monthLabel: "ต.ค. (ปัจจุบัน)", periodType: "ปัจจุบัน", priceActualOrMean: 15850, priceLower90: 15700, priceUpper90: 16000, harvestSupplyPct: 8, yardCongestionStatus: "คิวปานกลาง" },
      { monthLabel: "พ.ย. (+30 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 15400, priceLower90: 15050, priceUpper90: 15750, harvestSupplyPct: 58, yardCongestionStatus: "คิวแน่นมาก (เสี่ยงถูกกดราคา)" },
      { monthLabel: "ธ.ค. (+60 วัน)", periodType: "คาดการณ์ ML (Prophet)", priceActualOrMean: 16350, priceLower90: 15950, priceUpper90: 16750, harvestSupplyPct: 16, yardCongestionStatus: "คิวปานกลาง" },
      {
        monthLabel: "ม.ค. (+90 วัน)",
        periodType: "คาดการณ์ ML (Prophet)",
        priceActualOrMean: 16900,
        priceLower90: 16450,
        priceUpper90: 17350,
        harvestSupplyPct: 4,
        yardCongestionStatus: "คิวคล่องตัว (โรงงานแย่งซื้อ)",
      },
    ],
  },
};

export interface KoratGeoPlotPin {
  id: string;
  plotCode: string;
  farmerName: string;
  districtId: string;
  districtNameTh: string;
  subdistrictTh: string;
  lat: number;
  lon: number;
  cropName: string;
  cropCategory: "rice" | "field_crop" | "orchard";
  areaRai: number;
  droughtStatus: "วิกฤตแล้งรุนแรง" | "เฝ้าระวังฝนทิ้งช่วง" | "สมดุลปกติ";
  spi30d: number;
  soilMoisturePct: number;
  ndviHealthScore: number; // 0.15 to 0.85
  ks01Status: string;
  estimatedKs01Baht: number;
  updatedAt: string;
}

export const INITIAL_KORAT_GEO_PLOTS: KoratGeoPlotPin[] = [
  {
    id: "pin-dkt-01",
    plotCode: "PLT-DKT-881",
    farmerName: "นายสมพงษ์ วงศ์นคร",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    subdistrictTh: "ต.กุดพิมาน หมู่ที่ 4",
    lat: 15.2142,
    lon: 101.7718,
    cropName: "มันสำปะหลัง (พันธุ์เกษตรศาสตร์ 50)",
    cropCategory: "field_crop",
    areaRai: 18,
    droughtStatus: "เฝ้าระวังฝนทิ้งช่วง",
    spi30d: -1.35,
    soilMoisturePct: 31,
    ndviHealthScore: 0.42,
    ks01Status: "ผ่านการประชาคมหมู่บ้าน · รอมติ ก.ช.ภ.อ. (เสียหาย 14 ไร่)",
    estimatedKs01Baht: 27720,
    updatedAt: "อัปเดตดาวเทียม 10 นาทีที่แล้ว",
  },
  {
    id: "pin-dkt-02",
    plotCode: "PLT-DKT-882",
    farmerName: "นายสมพงษ์ วงศ์นคร",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    subdistrictTh: "ต.บ้านแปรง หมู่ที่ 2",
    lat: 15.1895,
    lon: 101.7420,
    cropName: "ข้าวโพดเลี้ยงสัตว์ (ระยะออกดอก)",
    cropCategory: "field_crop",
    areaRai: 10,
    droughtStatus: "เฝ้าระวังฝนทิ้งช่วง",
    spi30d: -1.38,
    soilMoisturePct: 29,
    ndviHealthScore: 0.39,
    ks01Status: "ยื่นแบบ กษ.01 แล้ว · รอตรวจแปลง (เสียหาย 8 ไร่)",
    estimatedKs01Baht: 15840,
    updatedAt: "อัปเดตดาวเทียม 12 นาทีที่แล้ว",
  },
  {
    id: "pin-byi-01",
    plotCode: "PLT-BYI-119",
    farmerName: "นายประเสริฐ โคราชพัฒนา",
    districtId: "bua-yai",
    districtNameTh: "อ.บัวใหญ่",
    subdistrictTh: "ต.ด่านช้าง หมู่ที่ 2",
    lat: 15.5880,
    lon: 102.4290,
    cropName: "ข้าวหอมมะลิ 105 (พื้นที่ดอนนอกเขตชลประทาน)",
    cropCategory: "rice",
    areaRai: 25,
    droughtStatus: "วิกฤตแล้งรุนแรง",
    spi30d: -1.64,
    soilMoisturePct: 22,
    ndviHealthScore: 0.27,
    ks01Status: "อยู่ในเขตประกาศภัยพิบัติฉุกเฉิน · เข้าเกณฑ์ชดเชย 20 ไร่",
    estimatedKs01Baht: 26800,
    updatedAt: "อัปเดตดาวเทียม 5 นาทีที่แล้ว",
  },
  {
    id: "pin-cmp-01",
    plotCode: "PLT-CMP-304",
    farmerName: "น.ส.บุญเรือน ศรีทุ่งสัมฤทธิ์",
    districtId: "chum-phuang",
    districtNameTh: "อ.ชุมพวง",
    subdistrictTh: "ต.ประสุข หมู่ที่ 7",
    lat: 15.3512,
    lon: 102.7398,
    cropName: "ข้าวหอมมะลิ 105 (ทุ่งสัมฤทธิ์)",
    cropCategory: "rice",
    areaRai: 22,
    droughtStatus: "เฝ้าระวังฝนทิ้งช่วง",
    spi30d: -1.18,
    soilMoisturePct: 35,
    ndviHealthScore: 0.48,
    ks01Status: "อนุมัติจ่ายเงินเยียวยาแล้ว (รอโอน ธ.ก.ส. 16 ไร่)",
    estimatedKs01Baht: 21440,
    updatedAt: "อัปเดตดาวเทียม 8 นาทีที่แล้ว",
  },
  {
    id: "pin-pmi-01",
    plotCode: "PLT-PMI-512",
    farmerName: "กลุ่มวิสาหกิจข้าวหอมมะลิ GI พิมาย",
    districtId: "phimai",
    districtNameTh: "อ.พิมาย",
    subdistrictTh: "ต.สัมฤทธิ์ หมู่ที่ 3",
    lat: 15.2285,
    lon: 102.4890,
    cropName: "ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI (เกษตรอินทรีย์)",
    cropCategory: "rice",
    areaRai: 30,
    droughtStatus: "สมดุลปกติ",
    spi30d: -0.82,
    soilMoisturePct: 46,
    ndviHealthScore: 0.71,
    ks01Status: "แปลงปกติในเขตชลประทาน · คาดการณ์ผลผลิต 510 กก./ไร่",
    estimatedKs01Baht: 0,
    updatedAt: "อัปเดตดาวเทียม 14 นาทีที่แล้ว",
  },
  {
    id: "pin-ssg-01",
    plotCode: "PLT-SSG-204",
    farmerName: "นายวิชัย มั่งคั่ง",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    subdistrictTh: "ต.โนนสมบูรณ์ หมู่ที่ 5",
    lat: 14.4310,
    lon: 102.4580,
    cropName: "มันสำปะหลัง (พันธุ์ห้วยบง 60 เชื้อแป้งสูง)",
    cropCategory: "field_crop",
    areaRai: 24,
    droughtStatus: "สมดุลปกติ",
    spi30d: -0.45,
    soilMoisturePct: 54,
    ndviHealthScore: 0.76,
    ks01Status: "แปลงปกติ · เฝ้าระวังแมลงหวี่ขาวพาหะโรคใบด่าง",
    estimatedKs01Baht: 0,
    updatedAt: "อัปเดตดาวเทียม 6 นาทีที่แล้ว",
  },
  {
    id: "pin-kbi-01",
    plotCode: "PLT-KBI-409",
    farmerName: "นายทองสุข สุวรรณภูมิ",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    subdistrictTh: "ต.แชะ หมู่ที่ 6",
    lat: 14.5280,
    lon: 102.2540,
    cropName: "อ้อยโรงงานสด (พันธุ์ขอนแก่น 3 ลดการเผา)",
    cropCategory: "field_crop",
    areaRai: 28,
    droughtStatus: "สมดุลปกติ",
    spi30d: -0.62,
    soilMoisturePct: 49,
    ndviHealthScore: 0.74,
    ks01Status: "แปลงโควตาอ้อยสด 100% · ความหวานคาดการณ์ 12.6 CCS",
    estimatedKs01Baht: 0,
    updatedAt: "อัปเดตดาวเทียม 9 นาทีที่แล้ว",
  },
  {
    id: "pin-pkc-01",
    plotCode: "PLT-PKC-108",
    farmerName: "นางสาวสุดารัตน์ พงษ์ไพร",
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    subdistrictTh: "ต.หนองสาหร่าย หมู่ที่ 9",
    lat: 14.7140,
    lon: 101.4210,
    cropName: "ข้าวโพดเลี้ยงสัตว์ & ทุเรียนปากช่อง",
    cropCategory: "orchard",
    areaRai: 15,
    droughtStatus: "สมดุลปกติ",
    spi30d: 0.25,
    soilMoisturePct: 61,
    ndviHealthScore: 0.82,
    ks01Status: "ความชื้นดินดีเยี่ยม · เจริญเติบโตตามเกณฑ์มาตรฐาน",
    estimatedKs01Baht: 0,
    updatedAt: "อัปเดตดาวเทียม 7 นาทีที่แล้ว",
  },
  {
    id: "pin-nsg-01",
    plotCode: "PLT-NSG-615",
    farmerName: "นายคำรณ ทุ่งสัมฤทธิ์",
    districtId: "non-sung",
    districtNameTh: "อ.โนนสูง",
    subdistrictTh: "ต.ธารปราสาท หมู่ที่ 1",
    lat: 15.1845,
    lon: 102.2810,
    cropName: "ข้าวหอมมะลิ 105 + ถั่วเขียวผิวมันหลังนา",
    cropCategory: "rice",
    areaRai: 19,
    droughtStatus: "เฝ้าระวังฝนทิ้งช่วง",
    spi30d: -0.95,
    soilMoisturePct: 39,
    ndviHealthScore: 0.53,
    ks01Status: "เฝ้าระวังฝนทิ้งช่วงปลายฤดู · แนะนำเตรียมพันธุ์ถั่วหลังนา",
    estimatedKs01Baht: 0,
    updatedAt: "อัปเดตดาวเทียม 11 นาทีที่แล้ว",
  },
];

export const KORAT_DAM_GEO_MARKERS = [
  {
    id: "dam-lam-takhong",
    nameTh: "เขื่อนลำตะคอง",
    districtTh: "อ.สีคิ้ว",
    lat: 14.8658,
    lon: 101.5592,
    usablePercent: 42.9,
    usableWaterMillionM3: 125.48,
    capacityMillionM3: 314.49,
    statusLabel: "เฝ้าระวังน้ำน้อย",
  },
  {
    id: "dam-lam-phra-phloeng",
    nameTh: "เขื่อนลำพระเพลิง",
    districtTh: "อ.ปักธงชัย",
    lat: 14.5931,
    lon: 101.8389,
    usablePercent: 70.6,
    usableWaterMillionM3: 108.88,
    capacityMillionM3: 155.0,
    statusLabel: "ปริมาณน้ำดี",
  },
  {
    id: "dam-mun-bon",
    nameTh: "เขื่อนมูลบน",
    districtTh: "อ.ครบุรี",
    lat: 14.4756,
    lon: 102.1442,
    usablePercent: 54.0,
    usableWaterMillionM3: 72.4,
    capacityMillionM3: 141.0,
    statusLabel: "ปริมาณน้ำปานกลาง",
  },
  {
    id: "dam-lam-chae",
    nameTh: "เขื่อนลำแชะ",
    districtTh: "อ.ครบุรี",
    lat: 14.4289,
    lon: 102.2886,
    usablePercent: 56.5,
    usableWaterMillionM3: 151.5,
    capacityMillionM3: 275.0,
    statusLabel: "ปริมาณน้ำปานกลาง",
  },
];

export interface KoratZone {
  id: string;
  title: string;
  rangeLabel: string;
  repDistrictId: string;
}

export const KORAT_ZONES: KoratZone[] = [
  {
    id: "all",
    title: "ครอบคลุมทั้งจังหวัด (32 อำเภอ)",
    rangeLabel: "13.8 ล้านไร่",
    repDistrictId: "dan-khun-thot",
  },
  {
    id: "west",
    title: "โซนตะวันตก-ที่ราบสูง (ด่านขุนทด/ปากช่อง)",
    rangeLabel: "ฝน 65–75%",
    repDistrictId: "pak-chong",
  },
  {
    id: "north",
    title: "โซนทุ่งสัมฤทธิ์-เหนือ (พิมาย/ชุมพวง/บัวใหญ่)",
    rangeLabel: "ข้าวหอมมะลิ GI",
    repDistrictId: "phimai",
  },
  {
    id: "south",
    title: "โซนใต้-ดงพญาเย็น (ครบุรี/เสิงสาง/วังน้ำเขียว)",
    rangeLabel: "มันสำปะหลัง·อ้อย",
    repDistrictId: "soeng-sang",
  },
];
