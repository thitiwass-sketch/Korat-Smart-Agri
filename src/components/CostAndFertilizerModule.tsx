import React, { useState, useEffect, useMemo } from "react";
import {
  KORAT_DISTRICTS,
  KORAT_FERTILIZER_PRICES,
  KORAT_INPUT_BENCHMARKS,
  CROP_COST_PRESETS,
  CommodityKey,
  KoratDistrict,
  formatDistrictName,
} from "../data/koratAgriData";
import { useTheme } from "../context/ThemeContext";
import {
  Calculator,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Sprout,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Layers,
  PackageCheck,
  CalendarClock,
  ArrowRight,
  Copy,
  Check,
  Droplets,
  MapPin,
} from "lucide-react";
import {
  CropHealthDiagnosticTool,
  CropHealthDiagnosisResult,
} from "./CropHealthDiagnosticTool";

interface CostAndFertilizerModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
  onOpenEfficiencyAnalytics?: () => void;
}

type SmartFertilizerCropId =
  | "cassava_fresh"
  | "sugarcane_fresh"
  | "maize_feed"
  | "jasmine_rice"
  | "pakchong_durian"
  | "mungbean_legume";

interface SmartCropFertilizerProfile {
  id: SmartFertilizerCropId;
  linkedCommodityKey?: CommodityKey;
  nameTh: string;
  shortNameTh: string;
  targetYieldLabel: string;
  optimalPhRange: [number, number];
  baseN: { lowOm: number; medOm: number; highOm: number };
  baseP: { lowP: number; medP: number; highP: number };
  baseK: { lowK: number; medK: number; highK: number };
  commercialComparisonFormula: string;
  commercialComparisonPriceBag: number;
  splitSchedule: {
    stageTitle: string;
    timingLabel: string;
    sharePct: number;
    focusFormulaNote: string;
    methodDetail: string;
  }[];
  mixingCaution: string;
}

const SMART_CROP_FERTILIZER_PROFILES: SmartCropFertilizerProfile[] = [
  {
    id: "cassava_fresh",
    linkedCommodityKey: "cassava_fresh",
    nameTh: "มันสำปะหลัง (หัวมันสด เชื้อแป้ง 25–30%)",
    shortNameTh: "มันสำปะหลัง",
    targetYieldLabel: "เป้าหมาย 4.0–5.5 ตัน/ไร่",
    optimalPhRange: [5.5, 6.5],
    baseN: { lowOm: 16, medOm: 12, highOm: 8 },
    baseP: { lowP: 8, medP: 4, highP: 2 },
    baseK: { lowK: 18, medK: 12, highK: 6 },
    commercialComparisonFormula: "15-7-18",
    commercialComparisonPriceBag: 990,
    splitSchedule: [
      {
        stageTitle: "ครั้งที่ 1: ระยะตั้งตัวและสร้างระบบราก-ใบ",
        timingLabel: "อายุ 30–45 วัน หลังปักท่อนพันธุ์",
        sharePct: 50,
        focusFormulaNote: "เน้น N และ P เร่งรากและโครงสร้างทรงพุ่ม",
        methodDetail:
          "ขุดหลุมหรือเปิดร่องห่างโคนต้น 15–20 ซม. โรยปุ๋ยสั่งตัดครึ่งแรกแล้วกลบดินทันทีขณะที่ดินมีความชื้นไม่ต่ำกว่า 35%",
      },
      {
        stageTitle: "ครั้งที่ 2: ระยะสะสมแป้งและขยายขนาดหัวมัน",
        timingLabel: "อายุ 90–120 วัน (ต้นฤดูฝน/กลางฤดูฝน)",
        sharePct: 50,
        focusFormulaNote: "เน้น K สูง (0-0-60) เพื่อเคลื่อนย้ายแป้งลงหัว",
        methodDetail:
          "ใส่ตามร่องระหว่างแถวมันสำปะหลังพร้อมกำจัดวัชพืชและพูนโคน ช่วยเพิ่มเปอร์เซ็นต์เชื้อแป้งได้ 2.5–4.0%",
      },
    ],
    mixingCaution:
      "แม่ปุ๋ยยูเรีย (46-0-0) เมื่อผสมกับโพแทช (0-0-60) และ DAP (18-46-0) จะดูดความชื้นในอากาศเร็ว ควรผสมบนผ้าใบแห้งและนำไปใส่ในแปลงให้หมดภายใน 24 ชั่วโมง",
  },
  {
    id: "sugarcane_fresh",
    linkedCommodityKey: "sugarcane_fresh",
    nameTh: "อ้อยโรงงานสด (อ้อยปลูก/อ้อยตอ 12+ CCS)",
    shortNameTh: "อ้อยโรงงาน",
    targetYieldLabel: "เป้าหมาย 13–16 ตัน/ไร่",
    optimalPhRange: [5.8, 7.0],
    baseN: { lowOm: 18, medOm: 15, highOm: 10 },
    baseP: { lowP: 10, medP: 6, highP: 3 },
    baseK: { lowK: 18, medK: 12, highK: 8 },
    commercialComparisonFormula: "15-15-15 / 16-8-14",
    commercialComparisonPriceBag: 1060,
    splitSchedule: [
      {
        stageTitle: "ครั้งที่ 1: รองพื้นก้นร่องพร้อมปลูก / แต่งตออ้อย",
        timingLabel: "วันปลูก หรือหลังตัดอ้อยตอ 15–30 วัน",
        sharePct: 50,
        focusFormulaNote: "เน้นฟอสฟอรัส (18-46-0) ทั้งหมด + N และ K ครึ่งหนึ่ง",
        methodDetail:
          "โรยก้นร่องก่อนวางท่อนพันธุ์แล้วกลบดินหนา 5–8 ซม. เพื่อกระตุ้นการแตกกอและรากลึกทนแล้ง",
      },
      {
        stageTitle: "ครั้งที่ 2: ระยะอ้อยย่างปล้องและสะสมความหวาน",
        timingLabel: "อายุ 90–120 วัน (เมื่อมีฝนชุก)",
        sharePct: 50,
        focusFormulaNote: "เน้น N และ K (46-0-0 + 0-0-60) เร่งลำต้นและค่า CCS",
        methodDetail:
          "ฝังปุ๋ยข้างแถวอ้อยด้วยเครื่องใส่ปุ๋ยติดรถไถพร้อมพูนโคน งดใส่ปุ๋ยไนโตรเจนก่อนตัดหีบอย่างน้อย 60 วัน",
      },
    ],
    mixingCaution:
      "ในพื้นที่ดินทรายโซนพิมาย-ครบุรี-เสิงสาง ควรแบ่งใส่โพแทสเซียม (0-0-60) 2 ครั้งเพื่อลดการชะล้างลงชั้นดินล่าง",
  },
  {
    id: "maize_feed",
    linkedCommodityKey: "maize_feed",
    nameTh: "ข้าวโพดเลี้ยงสัตว์ (เมล็ดแห้งมาตรฐาน 14.5%)",
    shortNameTh: "ข้าวโพดเลี้ยงสัตว์",
    targetYieldLabel: "เป้าหมาย 1,000–1,350 กก./ไร่",
    optimalPhRange: [5.8, 6.8],
    baseN: { lowOm: 16, medOm: 13, highOm: 9 },
    baseP: { lowP: 8, medP: 5, highP: 3 },
    baseK: { lowK: 10, medK: 6, highK: 4 },
    commercialComparisonFormula: "16-20-0 + 46-0-0",
    commercialComparisonPriceBag: 1040,
    splitSchedule: [
      {
        stageTitle: "ครั้งที่ 1: รองพื้นพร้อมหยอดเมล็ดพันธุ์",
        timingLabel: "วันปลูก (อายุ 0 วัน)",
        sharePct: 45,
        focusFormulaNote: "ใส่ 18-46-0 และ 0-0-60 ทั้งหมด + ยูเรียบางส่วน",
        methodDetail:
          "หยอดปุ๋ยรองพื้นห่างจากแถวเมล็ดข้าวโพด 5 ซม. ลึก 5 ซม. ช่วยให้ต้นกล้าโตไวและรากแข็งแรงตั้งแต่สัปดาห์แรก",
      },
      {
        stageTitle: "ครั้งที่ 2: ระยะข้าวโพดสูงระดับเข่า (ก่อนออกดอกตัวผู้)",
        timingLabel: "อายุ 25–30 วัน หลังงอก",
        sharePct: 55,
        focusFormulaNote: "เน้นแม่ปุ๋ยยูเรีย (46-0-0) เร่งการสร้างฝักและเมล็ด",
        methodDetail:
          "โรยข้างแถวแล้วพูนโคนกลบปุ๋ยทันทีเพื่อลดการระเหิดของไนโตรเจน ช่วยให้ฝักใหญ่ เมล็ดเต็มถึงปลายฝัก",
      },
    ],
    mixingCaution:
      "ห้ามโรยปุ๋ยยูเรียโดนยอดกรวยใบข้าวโพดโดยตรงเพราะจะทำให้ใบไหม้ ควรโรยข้างแถวห่างโคนต้น 10–15 ซม. แล้วไถกลบ",
  },
  {
    id: "jasmine_rice",
    linkedCommodityKey: "jasmine_rice",
    nameTh: "ข้าวหอมมะลิ 105 ทุ่งสัมฤทธิ์ (GI นครราชสีมา)",
    shortNameTh: "ข้าวหอมมะลิ 105",
    targetYieldLabel: "เป้าหมาย 550–680 กก./ไร่",
    optimalPhRange: [5.5, 6.5],
    baseN: { lowOm: 12, medOm: 9, highOm: 6 },
    baseP: { lowP: 6, medP: 4, highP: 2 },
    baseK: { lowK: 8, medK: 5, highK: 2 },
    commercialComparisonFormula: "16-16-8 / 16-20-0",
    commercialComparisonPriceBag: 980,
    splitSchedule: [
      {
        stageTitle: "ครั้งที่ 1: ระยะข้าวแตกกอ",
        timingLabel: "อายุ 20–25 วัน หลังหว่าน/ปักดำ",
        sharePct: 55,
        focusFormulaNote: "ใส่ 18-46-0 และ 0-0-60 ทั้งหมด + 46-0-0 ครึ่งหนึ่ง",
        methodDetail:
          "รักษาระดับน้ำในกระทงนาไม่เกิน 3–5 ซม. หว่านปุ๋ยสั่งตัดให้ทั่วแปลงเพื่อกระตุ้นจำนวนรวงต่อกอ",
      },
      {
        stageTitle: "ครั้งที่ 2: ระยะกำเนิดช่อดอก (ข้าวแต่งตัว)",
        timingLabel: "ช่วงวันที่ 5–15 ตุลาคม (ประมาณ 30 วันก่อนออกดอก)",
        sharePct: 45,
        focusFormulaNote: "เน้น 46-0-0 และ 0-0-60 เพิ่มน้ำหนักเมล็ดและความหอม 2-AP",
        methodDetail:
          "หว่านแต่งหน้าเมื่อใบข้าวมีสีเขียวอ่อน ไม่ควรใส่ไนโตรเจนมากเกินเกณฑ์เพราะจะทำให้ข้าวเฝือใบและล้มง่าย",
      },
    ],
    mixingCaution:
      "ข้าวหอมมะลิ 105 เป็นข้าวไวแสงและต้นสูง การใส่ปุ๋ยสั่งตัดตามค่าวิเคราะห์ดินช่วยป้องกันปัญหาข้าวเฝือใบและรักษาความหอม GI ทุ่งสัมฤทธิ์",
  },
  {
    id: "pakchong_durian",
    nameTh: "ทุเรียนปากช่อง-เขาใหญ่ GI / ไม้ผลเศรษฐกิจ",
    shortNameTh: "ทุเรียน·ไม้ผล",
    targetYieldLabel: "เป้าหมาย 1,800–2,500 กก./ไร่",
    optimalPhRange: [5.6, 6.5],
    baseN: { lowOm: 18, medOm: 14, highOm: 11 },
    baseP: { lowP: 9, medP: 6, highP: 4 },
    baseK: { lowK: 20, medK: 15, highK: 10 },
    commercialComparisonFormula: "15-15-15 + 12-12-17",
    commercialComparisonPriceBag: 1220,
    splitSchedule: [
      {
        stageTitle: "ครั้งที่ 1: ฟื้นต้นและสะสมอาหารหลังเก็บเกี่ยว",
        timingLabel: "หลังตัดแต่งกิ่ง 10–14 วัน",
        sharePct: 45,
        focusFormulaNote: "เน้น N และ P สูงควบคู่ปุ๋ยอินทรีย์อัดเม็ด",
        methodDetail:
          "หว่านรอบทรงพุ่ม (แนวปลายกิ่งใบ) แล้วเปิดสปริงเกลอร์ให้น้ำตาม 30–45 นาที เพื่อเร่งใบอ่อนชุดที่ 1–2",
      },
      {
        stageTitle: "ครั้งที่ 2: ระยะขยายขนาดผลและสร้างเนื้อแห้งมัน",
        timingLabel: "หลังดอกบาน 50–85 วัน",
        sharePct: 55,
        focusFormulaNote: "เน้นโพแทสเซียมสูง (K) เพื่อคุณภาพเนื้อเนียนและรสชาติหวานมัน",
        methodDetail:
          "แบ่งใส่ 2 รอบย่อยห่างกัน 20 วัน ช่วยลดปัญหาอาการเนื้อเต่าและไส้ซึมในช่วงฝนตกชุก",
      },
    ],
    mixingCaution:
      "สำหรับทุเรียนและไม้ผล แนะนำใช้แม่ปุ๋ยโพแทสเซียมซัลเฟต (0-0-50) แทนคลอไรด์ในช่วงสร้างเนื้อผลเพื่อคุณภาพเนื้อทุเรียนเกรดพรีเมียม",
  },
  {
    id: "mungbean_legume",
    nameTh: "ถั่วเขียวผิวมัน / ถั่วหรั่งหลังนา (พืชตระกูลถั่วบำรุงดิน)",
    shortNameTh: "ถั่วเขียว·ถั่วหรั่ง",
    targetYieldLabel: "เป้าหมาย 220–320 กก./ไร่",
    optimalPhRange: [6.0, 7.0],
    baseN: { lowOm: 4, medOm: 3, highOm: 2 },
    baseP: { lowP: 8, medP: 6, highP: 4 },
    baseK: { lowK: 8, medK: 6, highK: 3 },
    commercialComparisonFormula: "12-24-12",
    commercialComparisonPriceBag: 1150,
    splitSchedule: [
      {
        stageTitle: "ใส่ครั้งเดียว: รองพื้นพร้อมปลูก + คลุกเชื้อไรโซเบียม",
        timingLabel: "วันปลูก (อายุ 0 วัน) อาศัยความชื้นดินหลังนา",
        sharePct: 100,
        focusFormulaNote: "เน้น P และ K สูง ใช้ N น้อยเพราะปมรากถั่วตรึงไนโตรเจนเองได้",
        methodDetail:
          "คลุกเมล็ดพันธุ์ด้วยเชื้อไรโซเบียมก่อนปลูก และหว่านปุ๋ยสั่งตัดรองพื้นพร้อมไถกลบตอซังข้าว",
      },
    ],
    mixingCaution:
      "ห้ามคลุกเมล็ดถั่วที่ผสมเชื้อไรโซเบียมสัมผัสกับปุ๋ยเคมีโดยตรง เพราะความเค็มของปุ๋ยจะทำให้แบคทีเรียไรโซเบียมตาย",
  },
];

export const CostAndFertilizerModule: React.FC<CostAndFertilizerModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onOpenEfficiencyAnalytics,
}) => {
  const { isDark } = useTheme();
  // District state for the Smart Fertilizer Calculator (synced with selectedDistrict)
  const [calcDistrictId, setCalcDistrictId] = useState<string>(selectedDistrict.id);

  useEffect(() => {
    setCalcDistrictId(selectedDistrict.id);
  }, [selectedDistrict.id]);

  const calcDistrict = useMemo(() => {
    return (
      KORAT_DISTRICTS.find((d) => d.id === calcDistrictId) || selectedDistrict
    );
  }, [calcDistrictId, selectedDistrict]);

  // 1. Smart Cost Calculator State
  const [selectedCropKey, setSelectedCropKey] =
    useState<CommodityKey>("cassava_fresh");
  const [smartCropId, setSmartCropId] =
    useState<SmartFertilizerCropId>("cassava_fresh");
  const [plantedRai, setPlantedRai] = useState<number>(20);
  const [expectedYieldPerRai, setExpectedYieldPerRai] = useState<number>(3800);
  const [expectedSellingPrice, setExpectedSellingPrice] = useState<number>(3.15);

  const [landPrepCost, setLandPrepCost] = useState<number>(750);
  const [seedCost, setSeedCost] = useState<number>(600);
  const [fertilizerCost, setFertilizerCost] = useState<number>(1250);
  const [protectionCost, setProtectionCost] = useState<number>(450);
  const [laborHarvestCost, setLaborHarvestCost] = useState<number>(1450);
  const [transportRentCost, setTransportRentCost] = useState<number>(950);

  // 2. Smart Fertilizer Calculator (NPK + pH + Batch Mixing) State
  const [soilOmPct, setSoilOmPct] = useState<number>(
    calcDistrict.defaultSoilTest.omPercent
  );
  const [soilAvailNPpm, setSoilAvailNPpm] = useState<number>(
    Number((calcDistrict.defaultSoilTest.omPercent * 20).toFixed(1))
  );
  const [soilAvailPPpm, setSoilAvailPPpm] = useState<number>(
    calcDistrict.defaultSoilTest.availPPpm
  );
  const [soilExchKPpm, setSoilExchKPpm] = useState<number>(
    calcDistrict.defaultSoilTest.exchKPpm
  );
  const [soilPh, setSoilPh] = useState<number>(
    calcDistrict.defaultSoilTest.soilPh
  );
  const [yieldTargetMultiplier, setYieldTargetMultiplier] = useState<
    "standard" | "high_yield"
  >("standard");
  const [includeFillerTo100Kg, setIncludeFillerTo100Kg] =
    useState<boolean>(true);
  const [customBatchKg, setCustomBatchKg] = useState<number>(100);
  const [copiedRecipe, setCopiedRecipe] = useState<boolean>(false);
  const [activeDiagnosisAdjustment, setActiveDiagnosisAdjustment] =
    useState<CropHealthDiagnosisResult | null>(null);

  // Sync soil test values when calcDistrict changes
  useEffect(() => {
    setSoilOmPct(calcDistrict.defaultSoilTest.omPercent);
    setSoilAvailNPpm(
      Number((calcDistrict.defaultSoilTest.omPercent * 20).toFixed(1))
    );
    setSoilAvailPPpm(calcDistrict.defaultSoilTest.availPPpm);
    setSoilExchKPpm(calcDistrict.defaultSoilTest.exchKPpm);
    setSoilPh(calcDistrict.defaultSoilTest.soilPh);
  }, [calcDistrict]);

  const handleDistrictChange = (newDistrictId: string) => {
    setCalcDistrictId(newDistrictId);
    if (onSelectDistrict) {
      onSelectDistrict(newDistrictId);
    }
  };

  const handleOmChange = (newOm: number) => {
    const clampedOm = Math.max(0.1, Math.min(5.0, newOm));
    setSoilOmPct(clampedOm);
    setSoilAvailNPpm(Number((clampedOm * 20).toFixed(1)));
  };

  const handleAvailNChange = (newNPpm: number) => {
    const clampedN = Math.max(2, Math.min(100, newNPpm));
    setSoilAvailNPpm(clampedN);
    setSoilOmPct(Number((clampedN / 20).toFixed(2)));
  };

  const applySoilPresetProfile = (
    presetType: "district" | "sandy_low" | "alluvial_clay" | "volcanic_high"
  ) => {
    if (presetType === "district") {
      handleOmChange(calcDistrict.defaultSoilTest.omPercent);
      setSoilAvailPPpm(calcDistrict.defaultSoilTest.availPPpm);
      setSoilExchKPpm(calcDistrict.defaultSoilTest.exchKPpm);
      setSoilPh(calcDistrict.defaultSoilTest.soilPh);
    } else if (presetType === "sandy_low") {
      handleOmChange(0.58);
      setSoilAvailPPpm(4.5);
      setSoilExchKPpm(32);
      setSoilPh(5.2);
    } else if (presetType === "alluvial_clay") {
      handleOmChange(1.42);
      setSoilAvailPPpm(11.5);
      setSoilExchKPpm(88);
      setSoilPh(6.0);
    } else if (presetType === "volcanic_high") {
      handleOmChange(2.35);
      setSoilAvailPPpm(18.0);
      setSoilExchKPpm(125);
      setSoilPh(6.3);
    }
  };

  const activePreset =
    CROP_COST_PRESETS.find((p) => p.cropKey === selectedCropKey) ||
    CROP_COST_PRESETS[0];

  const activeSmartCrop = useMemo(() => {
    return (
      SMART_CROP_FERTILIZER_PROFILES.find((c) => c.id === smartCropId) ||
      SMART_CROP_FERTILIZER_PROFILES[0]
    );
  }, [smartCropId]);

  const handleSelectSmartCrop = (cropId: SmartFertilizerCropId) => {
    setSmartCropId(cropId);
    const profile = SMART_CROP_FERTILIZER_PROFILES.find((c) => c.id === cropId);
    if (profile?.linkedCommodityKey) {
      handleSelectCropPreset(profile.linkedCommodityKey);
    }
  };

  const handleSelectCropPreset = (key: CommodityKey) => {
    setSelectedCropKey(key);
    const preset = CROP_COST_PRESETS.find((p) => p.cropKey === key);
    if (preset) {
      setExpectedYieldPerRai(preset.defaultYieldPerRai);
      setExpectedSellingPrice(preset.sellingPricePerYieldUnit);
      setLandPrepCost(preset.defaultCostsPerRai.landPrepBaht);
      setSeedCost(preset.defaultCostsPerRai.seedOrStemBaht);
      setFertilizerCost(preset.defaultCostsPerRai.fertilizerBaht);
      setProtectionCost(preset.defaultCostsPerRai.cropProtectionBaht);
      setLaborHarvestCost(preset.defaultCostsPerRai.laborAndHarvestBaht);
      setTransportRentCost(preset.defaultCostsPerRai.transportAndRentBaht);
    }
  };

  // Soil Nutrient Status Classifications (LDD / DOA Standard)
  const nStatus = useMemo(() => {
    if (soilOmPct < 0.75)
      return {
        label: "ต่ำมาก (ขาดไนโตรเจนรุนแรง)",
        tone: "text-red-400 bg-red-500/15 border-red-500/40",
        barColor: "bg-red-500",
        pct: Math.min(100, Math.round((soilOmPct / 2.5) * 100)),
      };
    if (soilOmPct < 1.2)
      return {
        label: "ค่อนข้างต่ำ (ต้องเสริม N)",
        tone: "text-[#FBBF24] bg-[#F59E0B]/15 border-[#F59E0B]/40",
        barColor: "bg-[#F59E0B]",
        pct: Math.min(100, Math.round((soilOmPct / 2.5) * 100)),
      };
    if (soilOmPct < 2.0)
      return {
        label: "ปานกลาง (สมดุล)",
        tone: "text-[#2DD4BF] bg-[#14B8A6]/15 border-[#14B8A6]/40",
        barColor: "bg-[#14B8A6]",
        pct: Math.min(100, Math.round((soilOmPct / 2.5) * 100)),
      };
    return {
      label: "อุดมสมบูรณ์สูง",
      tone: "text-emerald-300 bg-emerald-500/15 border-emerald-500/40",
      barColor: "bg-emerald-400",
      pct: 100,
    };
  }, [soilOmPct]);

  const pStatus = useMemo(() => {
    if (soilAvailPPpm < 6)
      return {
        label: "ต่ำมาก (<6 ppm)",
        tone: "text-red-400 bg-red-500/15 border-red-500/40",
        barColor: "bg-red-500",
        pct: Math.min(100, Math.round((soilAvailPPpm / 25) * 100)),
      };
    if (soilAvailPPpm < 10)
      return {
        label: "ค่อนข้างต่ำ (6–10 ppm)",
        tone: "text-[#FBBF24] bg-[#F59E0B]/15 border-[#F59E0B]/40",
        barColor: "bg-[#F59E0B]",
        pct: Math.min(100, Math.round((soilAvailPPpm / 25) * 100)),
      };
    if (soilAvailPPpm < 18)
      return {
        label: "ปานกลาง (10–18 ppm)",
        tone: "text-[#2DD4BF] bg-[#14B8A6]/15 border-[#14B8A6]/40",
        barColor: "bg-[#14B8A6]",
        pct: Math.min(100, Math.round((soilAvailPPpm / 25) * 100)),
      };
    return {
      label: "สูง (>18 ppm)",
      tone: "text-emerald-300 bg-emerald-500/15 border-emerald-500/40",
      barColor: "bg-emerald-400",
      pct: 100,
    };
  }, [soilAvailPPpm]);

  const kStatus = useMemo(() => {
    if (soilExchKPpm < 40)
      return {
        label: "ต่ำมาก (<40 ppm)",
        tone: "text-red-400 bg-red-500/15 border-red-500/40",
        barColor: "bg-red-500",
        pct: Math.min(100, Math.round((soilExchKPpm / 130) * 100)),
      };
    if (soilExchKPpm < 65)
      return {
        label: "ค่อนข้างต่ำ (40–65 ppm)",
        tone: "text-[#FBBF24] bg-[#F59E0B]/15 border-[#F59E0B]/40",
        barColor: "bg-[#F59E0B]",
        pct: Math.min(100, Math.round((soilExchKPpm / 130) * 100)),
      };
    if (soilExchKPpm < 100)
      return {
        label: "ปานกลาง (65–100 ppm)",
        tone: "text-[#2DD4BF] bg-[#14B8A6]/15 border-[#14B8A6]/40",
        barColor: "bg-[#14B8A6]",
        pct: Math.min(100, Math.round((soilExchKPpm / 130) * 100)),
      };
    return {
      label: "สูง (>100 ppm)",
      tone: "text-emerald-300 bg-emerald-500/15 border-emerald-500/40",
      barColor: "bg-emerald-400",
      pct: 100,
    };
  }, [soilExchKPpm]);

  // Continuous Interpolated Soil-Test Nutrient Requirement Engine (kg of N, P2O5, K2O per Rai)
  const { reqNKgPerRai, reqPKgPerRai, reqKKgPerRai } = useMemo(() => {
    const { baseN, baseP, baseK } = activeSmartCrop;
    const yieldBoost = yieldTargetMultiplier === "high_yield" ? 1.2 : 1.0;

    // Continuous N calculation based on OM%
    let rawN: number;
    if (soilOmPct <= 0.8) {
      rawN = baseN.lowOm + (0.8 - soilOmPct) * 3.5;
    } else if (soilOmPct <= 1.5) {
      const t = (soilOmPct - 0.8) / 0.7;
      rawN = baseN.lowOm - t * (baseN.lowOm - baseN.medOm);
    } else {
      const t = Math.min(1, (soilOmPct - 1.5) / 1.2);
      rawN = baseN.medOm - t * (baseN.medOm - baseN.highOm);
    }

    // Continuous P2O5 calculation based on Available P (ppm)
    let rawP: number;
    if (soilAvailPPpm <= 6) {
      rawP = baseP.lowP + (6 - soilAvailPPpm) * 0.45;
    } else if (soilAvailPPpm <= 15) {
      const t = (soilAvailPPpm - 6) / 9;
      rawP = baseP.lowP - t * (baseP.lowP - baseP.medP);
    } else {
      const t = Math.min(1, (soilAvailPPpm - 15) / 15);
      rawP = baseP.medP - t * (baseP.medP - baseP.highP);
    }

    // Continuous K2O calculation based on Exchangeable K (ppm)
    let rawK: number;
    if (soilExchKPpm <= 45) {
      rawK = baseK.lowK + (45 - soilExchKPpm) * 0.12;
    } else if (soilExchKPpm <= 90) {
      const t = (soilExchKPpm - 45) / 45;
      rawK = baseK.lowK - t * (baseK.lowK - baseK.medK);
    } else {
      const t = Math.min(1, (soilExchKPpm - 90) / 70);
      rawK = baseK.medK - t * (baseK.medK - baseK.highK);
    }

    const deltaN = activeDiagnosisAdjustment?.fertilizerAdjustment.deltaNKgPerRai ?? 0;
    const deltaP = activeDiagnosisAdjustment?.fertilizerAdjustment.deltaPKgPerRai ?? 0;
    const deltaK = activeDiagnosisAdjustment?.fertilizerAdjustment.deltaKKgPerRai ?? 0;

    return {
      reqNKgPerRai: Number(Math.max(2, rawN * yieldBoost + deltaN).toFixed(1)),
      reqPKgPerRai: Number(Math.max(2, rawP * yieldBoost + deltaP).toFixed(1)),
      reqKKgPerRai: Number(Math.max(2, rawK * yieldBoost + deltaK).toFixed(1)),
    };
  }, [
    activeSmartCrop,
    soilOmPct,
    soilAvailPPpm,
    soilExchKPpm,
    yieldTargetMultiplier,
    activeDiagnosisAdjustment,
  ]);

  // Fertilizer Blending Exact Stoichiometry (per Rai using 46-0-0, 18-46-0, 0-0-60)
  const dapKgPerRai = reqPKgPerRai / 0.46;
  const nFromDapKg = dapKgPerRai * 0.18;
  const remainingNKg = Math.max(0, reqNKgPerRai - nFromDapKg);
  const ureaKgPerRai = remainingNKg / 0.46;
  const mopKgPerRai = reqKKgPerRai / 0.6;
  const totalBlendedKgPerRai = dapKgPerRai + ureaKgPerRai + mopKgPerRai;

  // Equivalent Grade Formula (N - P - K percentage in the pure mix)
  const eqGradeN =
    totalBlendedKgPerRai > 0
      ? Math.round((reqNKgPerRai / totalBlendedKgPerRai) * 100)
      : 0;
  const eqGradeP =
    totalBlendedKgPerRai > 0
      ? Math.round((reqPKgPerRai / totalBlendedKgPerRai) * 100)
      : 0;
  const eqGradeK =
    totalBlendedKgPerRai > 0
      ? Math.round((reqKKgPerRai / totalBlendedKgPerRai) * 100)
      : 0;

  // Recommended Dolomite / Lime for acidic soil (kg/rai)
  const recommendedDolomiteKgPerRai =
    soilPh < 5.2 ? 150 : soilPh < 5.6 ? 100 : soilPh < 5.8 ? 50 : 0;

  // Calculate cost of self-blending vs commercial compound fertilizer
  const ureaPricePerKg = 830 / 50; // 16.6 Baht/kg
  const dapPricePerKg = 1290 / 50; // 25.8 Baht/kg
  const mopPricePerKg = 1020 / 50; // 20.4 Baht/kg

  const blendedCostPerRai = Math.round(
    ureaKgPerRai * ureaPricePerKg +
      dapKgPerRai * dapPricePerKg +
      mopKgPerRai * mopPricePerKg
  );

  const commercialEquivalentKgPerRai = Math.max(
    reqNKgPerRai / 0.15,
    reqKKgPerRai / 0.16,
    reqPKgPerRai / 0.15
  );
  const commercialCostPerRai = Math.round(
    commercialEquivalentKgPerRai *
      (activeSmartCrop.commercialComparisonPriceBag / 50)
  );
  const savingsPerRai = Math.max(0, commercialCostPerRai - blendedCostPerRai);
  const savingsTotalAllRai = savingsPerRai * plantedRai;

  // 100 kg / Custom Batch Mixing Ratios
  // Mode A: Pure Chemical Mix (no filler) -> 100% active fertilizers
  // Mode B: LDD Standard Filler to 100 kg (if totalBlendedKgPerRai < 50, scale up and show filler)
  const ureaSharePct =
    totalBlendedKgPerRai > 0 ? (ureaKgPerRai / totalBlendedKgPerRai) * 100 : 34;
  const dapSharePct =
    totalBlendedKgPerRai > 0 ? (dapKgPerRai / totalBlendedKgPerRai) * 100 : 33;
  const mopSharePct = Math.max(0, 100 - ureaSharePct - dapSharePct);

  const fillerRatioInBatch = includeFillerTo100Kg ? 0.12 : 0; // 12% pelletized organic/dolomite conditioner to prevent caking
  const activeRatioInBatch = 1 - fillerRatioInBatch;

  const batchUreaKg = Number(
    ((ureaSharePct / 100) * customBatchKg * activeRatioInBatch).toFixed(1)
  );
  const batchDapKg = Number(
    ((dapSharePct / 100) * customBatchKg * activeRatioInBatch).toFixed(1)
  );
  const batchMopKg = Number(
    ((mopSharePct / 100) * customBatchKg * activeRatioInBatch).toFixed(1)
  );
  const batchFillerKg = includeFillerTo100Kg
    ? Number(
        Math.max(0, customBatchKg - batchUreaKg - batchDapKg - batchMopKg).toFixed(
          1
        )
      )
    : 0;

  // Total Plantation Requirements (across `plantedRai` Rai)
  const totalUreaAllRaiKg = Number((ureaKgPerRai * plantedRai).toFixed(1));
  const totalDapAllRaiKg = Number((dapKgPerRai * plantedRai).toFixed(1));
  const totalMopAllRaiKg = Number((mopKgPerRai * plantedRai).toFixed(1));
  const totalFertilizerAllRaiKg = Number(
    (totalBlendedKgPerRai * plantedRai).toFixed(1)
  );

  // Cost & Break-even Math
  const totalCostPerRai =
    landPrepCost +
    seedCost +
    fertilizerCost +
    protectionCost +
    laborHarvestCost +
    transportRentCost;
  const totalCostAllRai = totalCostPerRai * plantedRai;
  const grossRevenuePerRai = Math.round(
    expectedYieldPerRai * expectedSellingPrice
  );
  const grossRevenueAllRai = grossRevenuePerRai * plantedRai;
  const netProfitPerRai = grossRevenuePerRai - totalCostPerRai;
  const netProfitAllRai = grossRevenueAllRai - totalCostAllRai;

  const breakEvenPricePerUnit =
    expectedYieldPerRai > 0 ? totalCostPerRai / expectedYieldPerRai : 0;
  const breakEvenYieldPerRai =
    expectedSellingPrice > 0 ? totalCostPerRai / expectedSellingPrice : 0;

  const applyBlendedCostToCalculator = () => {
    setFertilizerCost(blendedCostPerRai);
  };

  useEffect(() => {
    if (activeDiagnosisAdjustment) {
      setFertilizerCost(blendedCostPerRai);
    }
  }, [activeDiagnosisAdjustment, blendedCostPerRai]);

  const handleApplyDiagnosisToCalculator = (
    diagnosis: CropHealthDiagnosisResult
  ) => {
    setActiveDiagnosisAdjustment(diagnosis);
    const presetProtection =
      activePreset.defaultCostsPerRai.cropProtectionBaht || 450;
    setProtectionCost(
      presetProtection +
        (diagnosis.fertilizerAdjustment.extraProtectionCostBahtPerRai || 280)
    );
  };

  const handleClearDiagnosisAdjustment = () => {
    setActiveDiagnosisAdjustment(null);
    setProtectionCost(activePreset.defaultCostsPerRai.cropProtectionBaht);
  };

  const handleCopyRecipeText = () => {
    const recipeText = [
      `=== ใบสั่งผสมปุ๋ยสั่งตัดอัจฉริยะ (koratSmartAgri) ===`,
      `พื้นที่: ${calcDistrict.nameTh} (${calcDistrict.soilSeriesName})`,
      `พืชที่ปลูก: ${activeSmartCrop.nameTh} · พื้นที่ ${plantedRai} ไร่`,
      `ผลตรวจดิน: OM ${soilOmPct}% (N ~${soilAvailNPpm} ppm) | P ${soilAvailPPpm} ppm | K ${soilExchKPpm} ppm | pH ${soilPh}`,
      `ความต้องการธาตุอาหารจริง: ${reqNKgPerRai} - ${reqPKgPerRai} - ${reqKKgPerRai} กก. N-P2O5-K2O/ไร่ (เทียบเท่าสูตร ~${eqGradeN}-${eqGradeP}-${eqGradeK})`,
      `อัตราแม่ปุ๋ยต่อไร่ (รวม ${totalBlendedKgPerRai.toFixed(1)} กก./ไร่):`,
      `  1) ยูเรีย (46-0-0): ${ureaKgPerRai.toFixed(1)} กก./ไร่ (รวม ${plantedRai} ไร่ = ${totalUreaAllRaiKg} กก.)`,
      `  2) DAP (18-46-0): ${dapKgPerRai.toFixed(1)} กก./ไร่ (รวม ${plantedRai} ไร่ = ${totalDapAllRaiKg} กก.)`,
      `  3) โพแทช (0-0-60): ${mopKgPerRai.toFixed(1)} กก./ไร่ (รวม ${plantedRai} ไร่ = ${totalMopAllRaiKg} กก.)`,
      `ต้นทุนปุ๋ยสั่งตัด: ฿${blendedCostPerRai.toLocaleString("th-TH")}/ไร่ (ประหยัดได้ ฿${savingsTotalAllRai.toLocaleString("th-TH")} สำหรับ ${plantedRai} ไร่)`,
    ].join("\n");

    navigator.clipboard?.writeText(recipeText);
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b pb-5 transition-colors ${
        isDark ? "border-[#1E293B]" : "border-slate-200"
      }`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-md border font-medium ${
                isDark
                  ? "bg-[#14B8A6]/15 text-[#2DD4BF] border-[#14B8A6]/40"
                  : "bg-teal-50 text-teal-800 border-teal-300"
              }`}
            >
              กรมพัฒนาที่ดิน (ชุดดินนครราชสีมา 32 อำเภอ)
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              กรมวิชาการเกษตร
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span className={`font-semibold ${isDark ? "text-[#2DD4BF]" : "text-teal-700"}`}>
              Smart NPK Soil-Test Fertilizer Blender
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            ต้นทุนการผลิต ราคาปุ๋ยเคมี และเครื่องคำนวณปุ๋ยสั่งตัดอัจฉริยะ (Smart Fertilizer Calculator)
          </h2>
        </div>

        <div className="btn-group-mobile w-full lg:w-auto shrink-0">
          <div
            className={`text-xs font-mono rounded-xl px-4 py-2.5 border transition-colors w-full sm:w-auto min-h-[44px] flex items-center justify-center text-center ${
              isDark
                ? "text-slate-300 bg-[#0B101D] border-[#1E293B]"
                : "text-slate-800 bg-white border-slate-300 shadow-2xs"
            }`}
          >
            <span>ชุดดินอ้างอิง: </span>
            <strong className={`ml-1 ${isDark ? "text-[#FBBF24]" : "text-amber-700 font-bold"}`}>
              {calcDistrict.soilSeriesName}
            </strong>
          </div>
          {onOpenEfficiencyAnalytics && (
            <button
              type="button"
              onClick={onOpenEfficiencyAnalytics}
              className={`btn-mobile-full rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#0D9488] hover:bg-[#14B8A6] text-slate-950"
                  : "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
              }`}
            >
              <span>เปิดแดชบอร์ดวิเคราะห์ความคุ้มค่าปุ๋ย (ROI)</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1.5" />
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          NEW SUB-MODULE: SMART FERTILIZER CALCULATOR (SOIL NPK -> CUSTOM MIX)
          ===================================================================== */}
      <div className="bg-[#0B101D] border-2 border-[#14B8A6]/45 shadow-[0_0_32px_rgba(20,184,166,0.1)] rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Top Sub-Module Banner & District / Soil Preset Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF] text-xs font-mono font-bold">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>SMART FERTILIZER CALCULATOR · ระบบคำนวณสูตรปุ๋ยสั่งตัดตามค่าวิเคราะห์ดินรายอำเภอ</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              วิเคราะห์ผลตรวจดิน N-P-K และคำนวณสูตรผสมแม่ปุ๋ยเฉพาะแปลง ({calcDistrict.nameTh})
            </h3>
            <p className="text-xs text-slate-300">
              เลือกอำเภอและพืชที่ปลูก กรอกผลตรวจวิเคราะห์ดิน (OM/N, P, K, pH) เพื่อรับสูตรผสมแม่ปุ๋ย 46-0-0 · 18-46-0 · 0-0-60 พร้อมตารางแบ่งใส่ตามระยะพืช
            </p>
          </div>

          {/* District Selector & Reset to District Default Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-2 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
              <span className="text-xs text-slate-400 whitespace-nowrap">
                พื้นที่ชุดดิน:
              </span>
              <select
                value={calcDistrict.id}
                onChange={(e) => handleDistrictChange(e.target.value)}
                aria-label="เลือกอำเภอสำหรับคำนวณปุ๋ยสั่งตัด"
                className="text-xs font-bold bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {KORAT_DISTRICTS.map((dist, idx) => (
                  <option key={dist.id} value={dist.id} className="bg-[#0B101D] text-white">
                    {String(idx + 1).padStart(2, "0")} · {dist.nameTh} (OM {dist.defaultSoilTest.omPercent}% · P {dist.defaultSoilTest.availPPpm} · K {dist.defaultSoilTest.exchKPpm})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => applySoilPresetProfile("district")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[#2DD4BF] bg-[#14B8A6]/15 hover:bg-[#14B8A6]/25 border border-[#14B8A6]/40 rounded-xl transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ดึงค่าดินมาตรฐาน {calcDistrict.nameTh}</span>
            </button>
          </div>
        </div>

        {/* Step 1: Select Target Crop & Yield Goal */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-mono font-bold text-[#FBBF24] flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#2DD4BF]" />
              <span>STEP 1 · เลือกชนิดพืชเศรษฐกิจที่ต้องการคำนวณสูตรปุ๋ยสั่งตัด</span>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-[#080C16] border border-[#1E293B] rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setYieldTargetMultiplier("standard")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  yieldTargetMultiplier === "standard"
                    ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                เป้าหมายผลผลิตมาตรฐาน
              </button>
              <button
                type="button"
                onClick={() => setYieldTargetMultiplier("high_yield")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  yieldTargetMultiplier === "high_yield"
                    ? "bg-[#F59E0B] text-slate-950 font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                เร่งผลผลิตสูงพิเศษ (+20% ธาตุอาหาร)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SMART_CROP_FERTILIZER_PROFILES.map((crop) => {
              const isSelected = smartCropId === crop.id;
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => handleSelectSmartCrop(crop.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-[#132238] border-[#2DD4BF] shadow-[0_0_16px_rgba(45,212,191,0.18)]"
                      : "bg-[#080C16] border-[#1E293B] hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? "text-[#2DD4BF]" : "text-white"
                      }`}
                    >
                      {crop.shortNameTh}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {crop.targetYieldLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 & Step 3 Main Grid: Left (Soil Analysis NPK Input Console) | Right (Custom Tailored Mix Recipe & Split Schedule) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLS: Soil Analysis NPK + pH Input Lab Panel */}
          <div className="lg:col-span-5 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
              <div>
                <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>STEP 2 · ผลตรวจวิเคราะห์ดิน (Soil NPK &amp; pH Inputs)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ชุดดิน: {calcDistrict.soilSeriesName} · ความชื้นดินปัจจุบัน{" "}
                  <strong className="text-white">{calcDistrict.gistdaSoilMoisturePct}%</strong>
                </p>
              </div>
            </div>

            {/* Quick Soil Archetype Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400">
                เลือกโปรไฟล์ตัวอย่างดินโคราชด่วน (หรือปรับตัวเลขเองด้านล่าง):
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applySoilPresetProfile("district")}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101728] hover:bg-[#162238] border border-[#1E293B] text-slate-200 text-left truncate"
                >
                  ● ค่าเฉลี่ย {calcDistrict.nameTh}
                </button>
                <button
                  type="button"
                  onClick={() => applySoilPresetProfile("sandy_low")}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101728] hover:bg-[#162238] border border-[#1E293B] text-slate-200 text-left truncate"
                >
                  ● ดินทรายจัด (อินทรียวัตถุต่ำ)
                </button>
                <button
                  type="button"
                  onClick={() => applySoilPresetProfile("alluvial_clay")}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101728] hover:bg-[#162238] border border-[#1E293B] text-slate-200 text-left truncate"
                >
                  ● ดินเหนียวลุ่มน้ำมูล (พิมาย)
                </button>
                <button
                  type="button"
                  onClick={() => applySoilPresetProfile("volcanic_high")}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101728] hover:bg-[#162238] border border-[#1E293B] text-slate-200 text-left truncate"
                >
                  ● ดินแดงภูเขาไฟ (ปากช่อง)
                </button>
              </div>
            </div>

            {/* 1. NITROGEN (N) & ORGANIC MATTER (OM%) INPUT */}
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white">
                    1. ไนโตรเจน (N) / อินทรียวัตถุ (OM %)
                  </span>
                  <div className="text-[11px] text-slate-400">
                    ต้องการธาตุ N สุทธิ:{" "}
                    <strong className="text-[#2DD4BF] font-mono">
                      {reqNKgPerRai} กก./ไร่
                    </strong>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${nStatus.tone}`}
                >
                  {nStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    อินทรียวัตถุ OM (%)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={0.1}
                    max={5.0}
                    value={soilOmPct}
                    onChange={(e) =>
                      handleOmChange(Number(e.target.value) || 0.5)
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] focus:border-[#2DD4BF] rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    ไนโตรเจนประเมิน N (ppm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min={2}
                    max={100}
                    value={soilAvailNPpm}
                    onChange={(e) =>
                      handleAvailNChange(Number(e.target.value) || 10)
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] focus:border-[#2DD4BF] rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="range"
                min={0.2}
                max={3.5}
                step={0.05}
                value={soilOmPct}
                onChange={(e) => handleOmChange(Number(e.target.value))}
                aria-label="แถบเลื่อนปรับค่าอินทรียวัตถุในดิน OM"
                className="w-full accent-[#14B8A6]"
              />
            </div>

            {/* 2. PHOSPHORUS (Available P ppm) INPUT */}
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white">
                    2. ฟอสฟอรัสที่เป็นประโยชน์ (Avail. P · ppm)
                  </span>
                  <div className="text-[11px] text-slate-400">
                    ต้องการธาตุ P₂O₅ สุทธิ:{" "}
                    <strong className="text-[#2DD4BF] font-mono">
                      {reqPKgPerRai} กก./ไร่
                    </strong>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${pStatus.tone}`}
                >
                  {pStatus.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={60}
                  value={soilAvailPPpm}
                  onChange={(e) =>
                    setSoilAvailPPpm(
                      Math.max(1, Math.min(60, Number(e.target.value) || 5))
                    )
                  }
                  className="w-28 px-2.5 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] focus:border-[#2DD4BF] rounded-lg focus:outline-none shrink-0"
                />
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={0.5}
                  value={soilAvailPPpm}
                  onChange={(e) => setSoilAvailPPpm(Number(e.target.value))}
                  aria-label="แถบเลื่อนปรับค่าฟอสฟอรัสในดิน P (ppm)"
                  className="w-full accent-[#14B8A6]"
                />
              </div>
            </div>

            {/* 3. POTASSIUM (Exchangeable K ppm) INPUT */}
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white">
                    3. โพแทสเซียมที่แลกเปลี่ยนได้ (Exch. K · ppm)
                  </span>
                  <div className="text-[11px] text-slate-400">
                    ต้องการธาตุ K₂O สุทธิ:{" "}
                    <strong className="text-[#2DD4BF] font-mono">
                      {reqKKgPerRai} กก./ไร่
                    </strong>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${kStatus.tone}`}
                >
                  {kStatus.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="2"
                  min={5}
                  max={250}
                  value={soilExchKPpm}
                  onChange={(e) =>
                    setSoilExchKPpm(
                      Math.max(5, Math.min(250, Number(e.target.value) || 30))
                    )
                  }
                  className="w-28 px-2.5 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] focus:border-[#2DD4BF] rounded-lg focus:outline-none shrink-0"
                />
                <input
                  type="range"
                  min={10}
                  max={180}
                  step={2}
                  value={soilExchKPpm}
                  onChange={(e) => setSoilExchKPpm(Number(e.target.value))}
                  aria-label="แถบเลื่อนปรับค่าโพแทสเซียมในดิน K (ppm)"
                  className="w-full accent-[#14B8A6]"
                />
              </div>
            </div>

            {/* 4. SOIL pH & PLANTED AREA / BATCH CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    4. ค่า pH ดิน (กรด-ด่าง)
                  </label>
                  <span className="text-[11px] font-mono text-[#FBBF24]">
                    เหมาะ {activeSmartCrop.optimalPhRange[0]}–{activeSmartCrop.optimalPhRange[1]}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min={3.5}
                  max={8.5}
                  value={soilPh}
                  onChange={(e) =>
                    setSoilPh(
                      Math.max(3.5, Math.min(8.5, Number(e.target.value) || 5.5))
                    )
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
                />
                <div className="text-[11px] text-slate-400">
                  {recommendedDolomiteKgPerRai > 0 ? (
                    <span className="text-[#FBBF24]">
                      ดินกรด: แนะนำโดโลไมท์ {recommendedDolomiteKgPerRai} กก./ไร่
                    </span>
                  ) : (
                    <span className="text-[#2DD4BF]">
                      pH สมดุล รากดูดปุ๋ยได้เต็มที่
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    5. ขนาดพื้นที่แปลง (ไร่)
                  </label>
                  <span className="text-[11px] font-mono text-[#2DD4BF]">
                    คำนวณรวมทั้งแปลง
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={plantedRai}
                  onChange={(e) =>
                    setPlantedRai(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
                />
                <div className="text-[11px] text-slate-400 font-mono">
                  ใช้แม่ปุ๋ยรวมทั้งหมด {totalFertilizerAllRaiKg} กก.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: Custom-Tailored Fertilizer Mix Recipe & Split-Application Schedule */}
          <div className="lg:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-5">
            {/* Recipe Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
              <div>
                <div className="text-xs font-mono font-bold text-[#FBBF24] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>STEP 3 · ใบสั่งผสมปุ๋ยสั่งตัดเฉพาะแปลง (CUSTOM-TAILORED MIX RECIPE)</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                    {reqNKgPerRai} - {reqPKgPerRai} - {reqKKgPerRai}
                  </span>
                  <span className="text-xs text-slate-300">
                    กก.ธาตุอาหาร (N - P₂O₅ - K₂O) ต่อไร่
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF]">
                    เทียบเท่าสูตรผสม ~{eqGradeN}-{eqGradeP}-{eqGradeK}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyRecipeText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101728] hover:bg-[#18233C] border border-[#1E293B] text-xs font-mono text-slate-200 transition-colors self-start sm:self-auto shrink-0"
              >
                {copiedRecipe ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span className="text-[#2DD4BF]">คัดลอกสูตรแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>คัดลอกใบสั่งผสม</span>
                  </>
                )}
              </button>
            </div>

            {/* Active Leaf Disease Diagnosis Prescription Banner */}
            {activeDiagnosisAdjustment && (
              <div className="bg-[#131F38] border border-[#2DD4BF]/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <div className="font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      ปรับสูตรปุ๋ยตามผลสแกนใบพืชแล้ว: {activeDiagnosisAdjustment.diseaseNameTh}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {activeDiagnosisAdjustment.fertilizerAdjustment.headline} (อัปเดตน้ำหนักแม่ปุ๋ย 46-0-0, 18-46-0 และ 0-0-60 ด้านล่างอัตโนมัติ)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearDiagnosisAdjustment}
                  className="px-2.5 py-1 rounded-lg bg-[#080C16] hover:bg-[#1E293B] border border-[#1E293B] text-[11px] font-mono text-slate-300 shrink-0 self-start sm:self-auto"
                >
                  คืนค่าปกติ
                </button>
              </div>
            )}

            {/* Batch Size & Filler Mode Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B101D] border border-[#1E293B] rounded-xl p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium">
                  ขนาดถังผสมต่อรอบ:
                </span>
                {[50, 100, 200].map((kgVal) => (
                  <button
                    key={kgVal}
                    type="button"
                    onClick={() => setCustomBatchKg(kgVal)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors ${
                      customBatchKg === kgVal
                        ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                        : "bg-[#080C16] text-slate-300 border border-[#1E293B] hover:text-white"
                    }`}
                  >
                    {kgVal} กก.
                  </button>
                ))}
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFillerTo100Kg}
                  onChange={(e) => setIncludeFillerTo100Kg(e.target.checked)}
                  className="rounded border-slate-600 accent-[#14B8A6]"
                />
                <span>ผสมสารตัวเติม/ปุ๋ยอินทรีย์อัดเม็ด 12% (ลดการชื้นจับก้อน)</span>
              </label>
            </div>

            {/* 3 Primary Raw Fertilizers + Optional Filler Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Urea 46-0-0 */}
              <div className="bg-[#0B101D] border border-[#2DD4BF]/35 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2DD4BF]">
                    แม่ปุ๋ยยูเรีย (46-0-0)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ureaSharePct.toFixed(0)}%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white">
                  {ureaKgPerRai.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    กก./ไร่
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1E293B] space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>ผสมชุดละ {customBatchKg} กก.:</span>
                    <strong className="text-[#FBBF24]">{batchUreaKg} กก.</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>รวม {plantedRai} ไร่:</span>
                    <span className="text-white">
                      {totalUreaAllRaiKg} กก. ({(totalUreaAllRaiKg / 50).toFixed(1)} กระสอบ)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: DAP 18-46-0 */}
              <div className="bg-[#0B101D] border border-[#6366F1]/45 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#818CF8]">
                    แม่ปุ๋ย DAP (18-46-0)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {dapSharePct.toFixed(0)}%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white">
                  {dapKgPerRai.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    กก./ไร่
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1E293B] space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>ผสมชุดละ {customBatchKg} กก.:</span>
                    <strong className="text-[#FBBF24]">{batchDapKg} กก.</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>รวม {plantedRai} ไร่:</span>
                    <span className="text-white">
                      {totalDapAllRaiKg} กก. ({(totalDapAllRaiKg / 50).toFixed(1)} กระสอบ)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: MOP 0-0-60 */}
              <div className="bg-[#0B101D] border border-[#F59E0B]/45 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FBBF24]">
                    แม่ปุ๋ยโพแทช (0-0-60)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {mopSharePct.toFixed(0)}%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white">
                  {mopKgPerRai.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    กก./ไร่
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1E293B] space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>ผสมชุดละ {customBatchKg} กก.:</span>
                    <strong className="text-[#FBBF24]">{batchMopKg} กก.</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>รวม {plantedRai} ไร่:</span>
                    <span className="text-white">
                      {totalMopAllRaiKg} กก. ({(totalMopAllRaiKg / 50).toFixed(1)} กระสอบ)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Proportion Bar of the Blended Recipe */}
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>
                    สัดส่วนการผสมจริงต่อ 1 ชุด ({customBatchKg} กก.) · ใช้หว่านได้ประมาณ{" "}
                    <strong className="text-[#2DD4BF] font-mono">
                      {(
                        (customBatchKg * activeRatioInBatch) /
                        Math.max(1, totalBlendedKgPerRai)
                      ).toFixed(1)}{" "}
                      ไร่
                    </strong>
                  </span>
                </span>
                {includeFillerTo100Kg && (
                  <span className="text-[11px] font-mono text-emerald-300">
                    + สารตัวเติม/ปุ๋ยอินทรีย์อัดเม็ด {batchFillerKg} กก.
                  </span>
                )}
              </div>

              <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-[#080C16] border border-[#1E293B]">
                <div
                  style={{ width: `${(batchUreaKg / customBatchKg) * 100}%` }}
                  className="bg-[#14B8A6] h-full transition-all"
                  title={`ยูเรีย 46-0-0: ${batchUreaKg} กก.`}
                />
                <div
                  style={{ width: `${(batchDapKg / customBatchKg) * 100}%` }}
                  className="bg-[#6366F1] h-full transition-all"
                  title={`DAP 18-46-0: ${batchDapKg} กก.`}
                />
                <div
                  style={{ width: `${(batchMopKg / customBatchKg) * 100}%` }}
                  className="bg-[#F59E0B] h-full transition-all"
                  title={`โพแทช 0-0-60: ${batchMopKg} กก.`}
                />
                {includeFillerTo100Kg && batchFillerKg > 0 && (
                  <div
                    style={{ width: `${(batchFillerKg / customBatchKg) * 100}%` }}
                    className="bg-emerald-600/70 h-full transition-all"
                    title={`สารตัวเติม/โดโลไมท์: ${batchFillerKg} กก.`}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-300 pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#14B8A6]" />
                  <span>46-0-0 ({batchUreaKg} กก.)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#6366F1]" />
                  <span>18-46-0 ({batchDapKg} กก.)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />
                  <span>0-0-60 ({batchMopKg} กก.)</span>
                </span>
                {includeFillerTo100Kg && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    <span>ปุ๋ยอินทรีย์/โดโลไมท์ ({batchFillerKg} กก.)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Crop Growth-Stage Split Application Schedule */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>
                    ตารางแบ่งใส่ปุ๋ยตามระยะการเจริญเติบโตของ {activeSmartCrop.shortNameTh}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#2DD4BF]" />
                  <span>ความชื้นดิน {calcDistrict.nameTh}: {calcDistrict.gistdaSoilMoisturePct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSmartCrop.splitSchedule.map((stage, idx) => {
                  const stageKgPerRai = Number(
                    ((totalBlendedKgPerRai * stage.sharePct) / 100).toFixed(1)
                  );
                  const stageTotalRaiKg = Number(
                    (stageKgPerRai * plantedRai).toFixed(0)
                  );
                  return (
                    <div
                      key={idx}
                      className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {stage.stageTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#2DD4BF] font-mono text-[11px] font-bold shrink-0">
                          {stageKgPerRai} กก./ไร่ ({stage.sharePct}%)
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#FBBF24]">
                        ช่วงเวลา: {stage.timingLabel} · รวม {plantedRai} ไร่ ใช้{" "}
                        {stageTotalRaiKg} กก.
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {stage.methodDetail}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mixing & Soil Moisture Advisory Note */}
              <div className="bg-[#101728] border border-[#1E293B] rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white">
                    ข้อควรระวังในการคลุกผสมแม่ปุ๋ยและสภาพความชื้นดิน ({calcDistrict.nameTh}):
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {activeSmartCrop.mixingCaution}{" "}
                    {calcDistrict.gistdaSoilMoisturePct < 30
                      ? `ปัจจุบันความชื้นดินใน ${calcDistrict.nameTh} อยู่ที่ ${calcDistrict.gistdaSoilMoisturePct}% (ค่อนข้างแห้ง) แนะนำรอหลังฝนตกหรือให้น้ำก่อนใส่ปุ๋ยเพื่อป้องกันปุ๋ยระเหิด`
                      : `ความชื้นดินใน ${calcDistrict.nameTh} (${calcDistrict.gistdaSoilMoisturePct}%) อยู่ในเกณฑ์เหมาะสมต่อการละลายธาตุอาหาร`}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Cost Comparison & Apply to Cost Calculator CTA */}
            <div className="pt-3 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="text-slate-300">
                  ต้นทุนผสมแม่ปุ๋ยใช้เอง:{" "}
                  <strong className="font-mono tabular-nums text-[#2DD4BF] text-base">
                    ฿{blendedCostPerRai.toLocaleString("th-TH")}/ไร่
                  </strong>{" "}
                  (เทียบกับปุ๋ยสูตรสำเร็จ {activeSmartCrop.commercialComparisonFormula}{" "}
                  <span className="font-mono tabular-nums line-through text-slate-500">
                    ฿{commercialCostPerRai.toLocaleString("th-TH")}/ไร่
                  </span>
                  )
                </div>
                <div className="text-[#FBBF24] font-bold font-mono tabular-nums">
                  ประหยัดต้นทุนปุ๋ยได้ ฿{savingsPerRai.toLocaleString("th-TH")}/ไร่ · รวมทั้งแปลง ({plantedRai} ไร่) ประหยัดได้ ฿
                  {savingsTotalAllRai.toLocaleString("th-TH")}
                </div>
              </div>

              <button
                type="button"
                onClick={applyBlendedCostToCalculator}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#041E1C] bg-[#14B8A6] hover:bg-[#2DD4BF] rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                <PackageCheck className="w-4 h-4" />
                <span>นำค่าปุ๋ยสั่งตัด (฿{blendedCostPerRai}/ไร่) ไปคำนวณกำไรสุทธิ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          NEW SUB-MODULE: CROP HEALTH DIAGNOSTIC (CAMERA LEAF AI -> NPK RECIPE)
          ===================================================================== */}
      <CropHealthDiagnosticTool
        district={calcDistrict}
        cropId={activeSmartCrop.id}
        cropNameTh={activeSmartCrop.nameTh}
        soilOmPct={soilOmPct}
        soilAvailPPpm={soilAvailPPpm}
        soilExchKPpm={soilExchKPpm}
        soilPh={soilPh}
        activeDiagnosisAdjustment={activeDiagnosisAdjustment}
        onApplyDiagnosisToCalculator={handleApplyDiagnosisToCalculator}
        onClearDiagnosisAdjustment={handleClearDiagnosisAdjustment}
      />

      {/* Part 2: Fertilizer & Production Input Price Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white">
                ตารางติดตามราคาปุ๋ยเคมีสูตรหลักในจังหวัดนครราชสีมา (กระสอบละ 50 กก.)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เปรียบเทียบราคาแม่ปุ๋ยเคมีสำหรับผสมเองและปุ๋ยเคมีสูตรสำเร็จ ณ ร้านค้าปัจจัยการผลิตและสหกรณ์การเกษตรโคราช
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400">
                  <th className="py-2.5 pr-3 font-medium">สูตรปุ๋ย · ชื่อทางการค้า</th>
                  <th className="py-2.5 px-3 font-medium">ประเภท</th>
                  <th className="py-2.5 px-3 font-medium text-right">ราคาวันนี้ (บาท/50 กก.)</th>
                  <th className="py-2.5 px-3 font-medium text-right">เปลี่ยนแปลง</th>
                  <th className="py-2.5 pl-3 font-medium">คำแนะนำการใช้งานในโคราช</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {KORAT_FERTILIZER_PRICES.map((fert) => {
                  const diff = fert.pricePer50KgBag - fert.priceLastMonth;
                  return (
                    <tr key={fert.code} className="hover:bg-[#101728]">
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <span className="font-mono tabular-nums font-bold text-[#2DD4BF] text-sm">
                          {fert.formula}
                        </span>
                        <div className="text-slate-300">{fert.nameTh}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {fert.category}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-white text-sm whitespace-nowrap">
                        ฿{fert.pricePer50KgBag.toLocaleString("th-TH")}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap ${
                          diff < 0
                            ? "text-[#2DD4BF] font-medium"
                            : diff > 0
                            ? "text-red-400 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {diff === 0 ? "ทรงตัว" : `${diff > 0 ? `+${diff}` : diff} บ.`}
                      </td>
                      <td className="py-3 pl-3 text-slate-300 max-w-xs">
                        {fert.recommendedUse}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 cols: Diesel, Tractor & Labor Benchmark */}
        <div className="lg:col-span-4 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white pb-3 border-b border-[#1E293B]">
              ดัชนีต้นทุนพลังงานและแรงงานเกษตรโคราช
            </h3>
            <div className="divide-y divide-[#1E293B] mt-2">
              {KORAT_INPUT_BENCHMARKS.map((item) => (
                <div key={item.nameTh} className="py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {item.nameTh}
                    </span>
                    <span className="text-base font-bold font-mono tabular-nums text-[#2DD4BF] whitespace-nowrap">
                      {item.priceBaht.toLocaleString("th-TH")}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        {item.unit}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] text-xs text-slate-300">
            <strong className="text-[#FBBF24]">แนวทางลดต้นทุน:</strong> การผสมแม่ปุ๋ยใช้เองตามค่าวิเคราะห์ดินช่วยลดต้นทุนค่าปุ๋ยเคมีลงได้ 25–38% เมื่อเทียบกับการซื้อปุ๋ยสูตรสำเร็จ
          </div>
        </div>
      </div>

      {/* Part 3: Smart Production Cost & Break-Even Calculator */}
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#2DD4BF]" />
            <h3 className="text-base font-bold text-white">
              Smart Cost Calculator: คำนวณต้นทุนการผลิตต่อไร่ จุดคุ้มทุน และกำไรสุทธิ ({activePreset.cropNameTh})
            </h3>
          </div>
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            พื้นที่คำนวณ: {plantedRai} ไร่
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
          {/* Left 7 cols: Cost Breakdown Inputs */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                พื้นที่เพาะปลูก (ไร่)
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={plantedRai}
                onChange={(e) =>
                  setPlantedRai(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ผลผลิตคาดการณ์ ({activePreset.yieldUnit})
              </label>
              <input
                type="number"
                min={1}
                step={activePreset.yieldUnit === "ตัน/ไร่" ? 0.5 : 50}
                value={expectedYieldPerRai}
                onChange={(e) =>
                  setExpectedYieldPerRai(
                    Math.max(1, Number(e.target.value) || 1)
                  )
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ราคาขายคาดการณ์ (บาท/{activePreset.yieldUnit.split("/")[0]})
              </label>
              <input
                type="number"
                min={0.5}
                step={activePreset.yieldUnit === "ตัน/ไร่" ? 20 : 0.05}
                value={expectedSellingPrice}
                onChange={(e) =>
                  setExpectedSellingPrice(
                    Math.max(0.1, Number(e.target.value) || 1)
                  )
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                ค่าไถเตรียมดิน/ยกร่อง (บาท/ไร่)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={landPrepCost}
                onChange={(e) =>
                  setLandPrepCost(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                ค่าท่อนพันธุ์/เมล็ดพันธุ์ (บาท/ไร่)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={seedCost}
                onChange={(e) =>
                  setSeedCost(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-[#2DD4BF] font-bold mb-1">
                ค่าปุ๋ยเคมี/ปุ๋ยสั่งตัด (บาท/ไร่)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={fertilizerCost}
                onChange={(e) =>
                  setFertilizerCost(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-[#2DD4BF] font-bold bg-[#14B8A6]/10 border border-[#14B8A6]/50 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                ค่ายาปราบวัชพืช/แมลง (บาท/ไร่)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={protectionCost}
                onChange={(e) =>
                  setProtectionCost(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                ค่าแรงงานปลูกและเก็บเกี่ยว (บาท/ไร่)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={laborHarvestCost}
                onChange={(e) =>
                  setLaborHarvestCost(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                ค่าขนส่งและค่าเช่าที่ดิน (บาท/ไร่)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={transportRentCost}
                onChange={(e) =>
                  setTransportRentCost(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 text-sm font-mono tabular-nums text-white bg-[#080C16] border border-[#1E293B] rounded-lg"
              />
            </div>
          </div>

          {/* Right 5 cols: Financial Outcome & Break-Even Analysis */}
          <div className="lg:col-span-5 bg-[#080C16] border border-[#1E293B] text-white rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#1E293B]">
              <div>
                <div className="text-xs text-slate-400">ต้นทุนรวมต่อไร่</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  ฿{totalCostPerRai.toLocaleString("th-TH")}
                </div>
                <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                  รวม {plantedRai} ไร่: ฿{totalCostAllRai.toLocaleString("th-TH")}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">รายได้คาดการณ์ต่อไร่</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#2DD4BF] mt-1">
                  ฿{grossRevenuePerRai.toLocaleString("th-TH")}
                </div>
                <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                  รวม {plantedRai} ไร่: ฿{grossRevenueAllRai.toLocaleString("th-TH")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#1E293B] text-xs">
              <div>
                <div className="text-slate-400">
                  ราคาคุ้มทุนขั้นต่ำ (Break-even Price)
                </div>
                <div className="text-base font-bold font-mono tabular-nums text-[#FBBF24] mt-1">
                  {breakEvenPricePerUnit.toFixed(2)} บาท/
                  {activePreset.yieldUnit.split("/")[0]}
                </div>
              </div>
              <div>
                <div className="text-slate-400">
                  ผลผลิตคุ้มทุนขั้นต่ำ (Break-even Yield)
                </div>
                <div className="text-base font-bold font-mono tabular-nums text-[#FBBF24] mt-1">
                  {breakEvenYieldPerRai.toFixed(1)} {activePreset.yieldUnit}
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-xs text-slate-300">
                  กำไรสุทธิคาดการณ์รวมทั้งแปลง ({plantedRai} ไร่)
                </div>
                <div className="text-xs text-[#2DD4BF] font-mono tabular-nums mt-0.5">
                  เฉลี่ยไร่ละ ฿{netProfitPerRai.toLocaleString("th-TH")}
                </div>
              </div>
              <div
                className={`text-3xl font-bold font-mono tabular-nums ${
                  netProfitAllRai >= 0 ? "text-[#2DD4BF]" : "text-red-400"
                }`}
              >
                {netProfitAllRai >= 0 ? "+" : ""}฿
                {netProfitAllRai.toLocaleString("th-TH")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
