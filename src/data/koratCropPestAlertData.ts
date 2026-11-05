/**
 * Korat SmartAgri - Crop Disease & Pest Alert System Data
 * Researched & modeled for Nakhon Ratchasima's 4 Key Agricultural Staples:
 * 1. มันสำปะหลัง (Cassava)
 * 2. อ้อยโรงงาน (Sugarcane)
 * 3. ข้าวโพดเลี้ยงสัตว์ (Feed Corn / Maize)
 * 4. ข้าวหอมมะลิ 105 (Jasmine Rice KDML105)
 *
 * Grounded in technical guidelines from:
 * - กรมวิชาการเกษตร (DOA)
 * - กรมส่งเสริมการเกษตร (DOAE)
 * - กรมการข้าว (Rice Department)
 * - สำนักงานเกษตรจังหวัดนครราชสีมา
 */

export type TargetCropKey = "cassava" | "sugarcane" | "corn" | "rice";

export type PestIssueCategory = "disease_virus" | "disease_fungus" | "disease_bacteria" | "pest_insect" | "pest_mite";

export type OutbreakSeverity = "critical" | "high" | "moderate" | "safe";

export interface ChemicalPrescription {
  tradeExample: string;
  activeIngredient: string;
  iracFracGroup: string;
  dosagePer20L: string;
  phiDays: number; // Pre-harvest interval (วันหยุดพ่นก่อนเก็บเกี่ยว)
  targetPestStage: string;
  safetyCaution: string;
}

export interface BiologicalTreatment {
  title: string;
  agentName: string;
  dosageOrRate: string;
  bestApplicationTime: string;
  advantage: string;
}

export interface CropPestProfile {
  id: string;
  cropKey: TargetCropKey;
  cropNameTh: string;
  nameTh: string;
  nameEn: string;
  scientificName: string;
  category: PestIssueCategory;
  categoryLabelTh: string;
  vectorOrCause: string;
  severityLevel: OutbreakSeverity;
  estimatedLossRiskPct: number;
  highlightedIcon: "bug" | "virus" | "sprout" | "biohazard" | "alert";
  favorableWeatherCondition: string;
  vulnerableStageTh: string;
  keySymptoms: string[];
  diagnosticChecklist: string[];
  preventativeMeasures: {
    varietySelection: string[];
    culturalPractices: string[];
    quarantineAndSeedPrep: string[];
  };
  treatmentOptions: {
    emergencySanitation: string[];
    biologicalControl: BiologicalTreatment[];
    chemicalControl: ChemicalPrescription[];
  };
  lookAlikeDifferentiator: {
    similarIssueName: string;
    keyDifference: string;
    fieldTestTip: string;
  };
  koratHotspotDistricts: string[];
  localAdvisoryTh: string;
}

export interface DistrictPestOutbreakStatus {
  districtId: string;
  districtNameTh: string;
  zone: string;
  cropThreats: {
    cropKey: TargetCropKey;
    primaryThreatId: string;
    status: OutbreakSeverity;
    trend: "increasing" | "stable" | "decreasing";
    affectedAreaEstimatedRai: number;
    advisoryNote: string;
  }[];
  lastSurveyDate: string;
  extensionOfficePhone: string;
}

export const TARGET_CROP_CONFIGS: Record<
  TargetCropKey,
  {
    id: TargetCropKey;
    nameTh: string;
    nameEn: string;
    scientificName: string;
    economicSignificanceTh: string;
    annualAreaRai: string;
    majorDistricts: string[];
    accentColor: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  }
> = {
  cassava: {
    id: "cassava",
    nameTh: "มันสำปะหลัง",
    nameEn: "Cassava",
    scientificName: "Manihot esculenta Crantz",
    economicSignificanceTh:
      "พืชเศรษฐกิจอันดับ 1 ของโคราช มีพื้นที่ปลูกกว่า 2.2 ล้านไร่ ส่งเข้าโรงงานแป้งและลานมันแปรรูปเพื่อส่งออก",
    annualAreaRai: "2,240,000 ไร่",
    majorDistricts: [
      "อ.เสิงสาง",
      "อ.ครบุรี",
      "อ.ด่านขุนทด",
      "อ.หนองบุญมาก",
      "อ.สีคิ้ว",
      "อ.ห้วยแถลง",
      "อ.ขามทะเลสอ",
      "อ.โนนไทย",
    ],
    accentColor: "#F59E0B",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
  },
  sugarcane: {
    id: "sugarcane",
    nameTh: "อ้อยโรงงาน",
    nameEn: "Sugarcane",
    scientificName: "Saccharum officinarum L.",
    economicSignificanceTh:
      "พืชพลังงานและอุตสาหกรรมน้ำตาลทราย มีโรงงานน้ำตาลขนาดใหญ่ใน อ.ด่านขุนทด อ.พิมาย และ อ.ครบุรี ป้อนอุตสาหกรรมชีวภาพ",
    annualAreaRai: "890,000 ไร่",
    majorDistricts: [
      "อ.ด่านขุนทด",
      "อ.พิมาย",
      "อ.ครบุรี",
      "อ.ชุมพวง",
      "อ.จักราช",
      "อ.แก้งสนามนาง",
      "อ.โนนแดง",
    ],
    accentColor: "#10B981",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-400/40",
    badgeText: "text-emerald-300",
  },
  corn: {
    id: "corn",
    nameTh: "ข้าวโพดเลี้ยงสัตว์",
    nameEn: "Feed Corn / Maize",
    scientificName: "Zea mays L.",
    economicSignificanceTh:
      "วัตถุดิบหลักอุตสาหกรรมอาหารสัตว์ ปลูกทั้งฤดูฝนและข้าวโพดหลังนาในเขตชลประทานลุ่มน้ำลำตะคองและที่ราบสูง",
    annualAreaRai: "560,000 ไร่",
    majorDistricts: [
      "อ.ปากช่อง",
      "อ.สีคิ้ว",
      "อ.ปักธงชัย",
      "อ.ด่านขุนทด",
      "อ.วังน้ำเขียว",
      "อ.เสิงสาง",
      "อ.เทพารักษ์",
    ],
    accentColor: "#EAB308",
    badgeBg: "bg-yellow-500/15",
    badgeBorder: "border-yellow-400/40",
    badgeText: "text-yellow-300",
  },
  rice: {
    id: "rice",
    nameTh: "ข้าวหอมมะลิ 105",
    nameEn: "Jasmine Rice (KDML105)",
    scientificName: "Oryza sativa L. (KDML105 / RD15)",
    economicSignificanceTh:
      "ข้าวหอมมะลิทุ่งสัมฤทธิ์และเขตลุ่มน้ำมูล แหล่งปลูกข้าวหอมมะลิชั้นเลิศที่มีกลิ่นหอมใบเตยธรรมชาติอันเป็นเอกลักษณ์ของโคราช",
    annualAreaRai: "1,850,000 ไร่",
    majorDistricts: [
      "อ.พิมาย",
      "อ.โนนสูง",
      "อ.บัวใหญ่",
      "อ.ชุมพวง",
      "อ.ประทาย",
      "อ.เมืองนครราชสีมา",
      "อ.ขามสะแกแสง",
      "อ.คง",
    ],
    accentColor: "#2DD4BF",
    badgeBg: "bg-teal-500/15",
    badgeBorder: "border-teal-400/40",
    badgeText: "text-teal-300",
  },
};

export const KORAT_CROP_PEST_PROFILES: CropPestProfile[] = [
  // ================= CASSAVA (มันสำปะหลัง) =================
  {
    id: "cmd_slcmv",
    cropKey: "cassava",
    cropNameTh: "มันสำปะหลัง",
    nameTh: "โรคใบด่างมันสำปะหลัง (Cassava Mosaic Disease)",
    nameEn: "Cassava Mosaic Virus (SLCMV)",
    scientificName: "Sri Lankan Cassava Mosaic Virus (SLCMV)",
    category: "disease_virus",
    categoryLabelTh: "โรคเกิดจากเชื้อไวรัส (มีแมลงพาหะ)",
    vectorOrCause: "แมลงหวี่ขาวยาสูบ (Bemisia tabaci) และท่อนพันธุ์ติดเชื้อ",
    severityLevel: "critical",
    estimatedLossRiskPct: 85,
    highlightedIcon: "virus",
    favorableWeatherCondition: "อากาศร้อนแห้งสลับฝน ลมพัดพาแมลงหวี่ขาวระบาด อุณหภูมิ 28-36°C",
    vulnerableStageTh: "ระยะตั้งตัวถึงสะสมอาหารในหัว (อายุ 1–6 เดือน)",
    keySymptoms: [
      "ใบยอดหงิกงอ เสียรูปทรง ม้วนงอขึ้นด้านบน",
      "เนื้อใบมีรอยด่างสีเขียวเข้มสลับเขียวอมเหลืองชัดเจน",
      "ข้อปล้องบริเวณยอดสั้น แคระแกร็น ชะงักการเจริญเติบโต",
      "การลงหัวลดลงอย่างรุนแรง หัวมันลีบเล็ก เปอร์เซ็นต์แป้งต่ำสูญเสียผลผลิต 80-100%",
    ],
    diagnosticChecklist: [
      "ตรวจสอบใบอ่อน 3-5 ใบบนสุดว่ามีรอยด่างเหลืองลวดลายโมเสกหรือไม่",
      "พลิกดูใต้ใบเพื่อสำรวจตัวอ่อนและตัวเต็มวัยของแมลงหวี่ขาวยาสูบ (ตัวเล็กสีขาวปีกมน)",
      "สังเกตว่าอาการเกิดทั่วทั้งต้นหรือเกิดเป็นหย่อมเฉพาะกิ่ง (ถ้าเกิดทั้งต้นมักติดมาจากท่อนพันธุ์)",
    ],
    preventativeMeasures: {
      varietySelection: [
        "ใช้พันธุ์ทนทานหรือต้านทานที่ผ่านการรับรอง เช่น กวก. 50 (KU50), ระยอง 72, อิทธิ 1, อิทธิ 2, และพันธุ์ต้านทานรุ่นใหม่ กวก. 1",
        "ห้ามปลูกพันธุ์ที่อ่อนแอสูงต่อโรคใบด่างเด็ดขาด ได้แก่ พันธุ์ระยอง 11, ระยอง 72 ทั่วไป, ห้วยบง 60, ลาดพร้าว 80, และพันธุ์พิษณุโลก 2",
      ],
      culturalPractices: [
        "กำจัดวัชพืชที่เป็นพืชอาศัยของแมลงหวี่ขาวรอบแปลง เช่น ผักโขม ผักเบี้ยหิน หญ้าขจรจบ",
        "เว้นระยะห่างการปลูก 1x1 เมตร เพื่อให้อากาศถ่ายเทสะดวก ลดการสะสมของแมลงหวี่ขาว",
        "สำรวจแปลงอย่างน้อยสัปดาห์ละ 1 ครั้ง หากพบต้นเป็นโรคในระยะเริ่มแรกต้องรีบถอนทำลายทันที",
      ],
      quarantineAndSeedPrep: [
        "เลือกใช้ท่อนพันธุ์สะอาดจากแหล่งที่ได้รับการรับรองจากกรมวิชาการเกษตร / กรมส่งเสริมการเกษตรเท่านั้น",
        "แช่ท่อนพันธุ์ก่อนปลูก 10 นาที ด้วยสาร อิมิดาโคลพริด (imidacloprid 70% WG) อัตรา 4 กรัม/น้ำ 20 ลิตร หรือ ไทอะมีทอกแซม (thiamethoxam 25% WG) อัตรา 4 กรัม/น้ำ 20 ลิตร",
        "ปฏิบัติตาม พ.ร.บ.กักพืช ห้ามเคลื่อนย้ายท่อนพันธุ์จากเขตประกาศเขตโรคระบาดโดยไม่ได้รับอนุญาต",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "เมื่อพบต้นต้องสงสัย ให้ขุดหรือถอนทำลายทั้งต้นทันทีรวมหัวมัน",
        "นำใส่ถุงดำมัดปากถุงตากแดดอย่างน้อย 3-5 วัน หรือขุดหลุมฝังกลบลึกไม่น้อยกว่า 50 ซม. แล้วโรยปูนขาวปิดทับ",
        "ห้ามนำท่อนพันธุ์จากต้นที่เป็นโรคไปขยายพันธุ์หรือส่งต่อให้เพื่อนเกษตรกรเด็ดขาด",
      ],
      biologicalControl: [
        {
          title: "ฉีดพ่นเชื้อราบิวเวอเรียกำจัดแมลงหวี่ขาว",
          agentName: "เชื้อราบิวเวอเรีย บัสเซียน่า (Beauveria bassiana)",
          dosageOrRate: "100 กรัม ต่อน้ำ 20 ลิตร ผสมสารจับใบ",
          bestApplicationTime: "ช่วงเวลาเย็นแดดร่มที่มีความชื้นในอากาศสูง",
          advantage: "ช่วยลดประชากรแมลงหวี่ขาวพาหะนำโรคโดยไม่ทำลายศัตรูธรรมชาติ",
        },
        {
          title: "อนุรักษ์แมลงห้ำตัวเบียนธรรมชาติ",
          agentName: "แมลงช้างปีกใส และด้วงเต่าลาย",
          dosageOrRate: "ปล่อยหรืออนุรักษ์ในระบบนิเวศแปลง",
          bestApplicationTime: "ตลอดฤดูกาลเพาะปลูก",
          advantage: "ช่วยกัดกินตัวอ่อนแมลงหวี่ขาวได้อย่างต่อเนื่อง",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "สตาร์เกิล (Starkle)",
          activeIngredient: "ไดโนทีฟูแรน (dinotefuran 10% WP)",
          iracFracGroup: "IRAC Group 4A (Neonicotinoids)",
          dosagePer20L: "15 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 14,
          targetPestStage: "ตัวอ่อนและตัวเต็มวัยแมลงหวี่ขาวยาสูบ",
          safetyCaution: "ควรสลับกลุ่มกลไกการออกฤทธิ์เพื่อป้องกันแมลงหวี่ขาวสร้างความต้านทาน",
        },
        {
          tradeExample: "โอบารอน (Oberon)",
          activeIngredient: "สไปโรมีซิเฟน (spiromesifen 24% SC)",
          iracFracGroup: "IRAC Group 23 (Inhibitors of lipid synthesis)",
          dosagePer20L: "15-20 มล. ต่อน้ำ 20 ลิตร",
          phiDays: 21,
          targetPestStage: "ไข่และตัวอ่อนแมลงหวี่ขาว",
          safetyCaution: "ฉีดพ่นให้ละอองน้ำยาเคลือบใต้ใบอย่างทั่วถึง",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "อาการขาดธาตุสังกะสี (Zinc Deficiency) หรืออาการพ่นสารปราบวัชพืชละอองปลิว",
      keyDifference:
        "โรคใบด่าง SLCMV ใบจะหงิกบิดเบี้ยวชัดเจน เส้นใบโปร่งแสง ยอดกุด ในขณะที่การขาดธาตุสังกะสีแผ่นใบจะเหลืองระหว่างเส้นใบแต่ใบไม่หงิกงอเบี้ยว และเกิดเท่ากันทั้งแปลง",
      fieldTestTip: "หากพบยอดหงิกและมีตัวแมลงหวี่ขาวบินตอมใต้ใบ ให้สันนิษฐานว่าเป็นโรคใบด่าง SLCMV ทันที",
    },
    koratHotspotDistricts: ["เสิงสาง", "ครบุรี", "ด่านขุนทด", "หนองบุญมาก", "ห้วยแถลง", "สีคิ้ว"],
    localAdvisoryTh:
      "สำนักงานเกษตรจังหวัดนครราชสีมาจัดตั้งจุดเฝ้าระวัง 32 อำเภอ หากเกษตรกรพบแปลงมีต้นใบด่างเกิน 10% ของพื้นที่แปลง ให้แจ้งเกษตรอำเภอทันทีเพื่อรับการสนับสนุนงบประมาณทำลายและขอรับท่อนพันธุ์สะอาดทดแทน",
  },
  {
    id: "cassava_pink_mealybug",
    cropKey: "cassava",
    cropNameTh: "มันสำปะหลัง",
    nameTh: "เพลี้ยแป้งมันสำปะหลังสีชมพู (Pink Cassava Mealybug)",
    nameEn: "Pink Cassava Mealybug",
    scientificName: "Phenacoccus manihoti Matile-Ferrero",
    category: "pest_insect",
    categoryLabelTh: "แมลงศัตรูพืชกลุ่มปากดูด",
    vectorOrCause: "การแพร่ระบาดทางลม ท่อนพันธุ์ติดเชื้อ และมดพาหะ",
    severityLevel: "high",
    estimatedLossRiskPct: 65,
    highlightedIcon: "bug",
    favorableWeatherCondition: "ช่วงฤดูแล้ง อากาศแห้ง ดินขาดน้ำ ฝนทิ้งช่วง พ.ย. - พ.ค.",
    vulnerableStageTh: "ระยะยอดอ่อนและลำต้นกำลังเจริญเติบโต (อายุ 1–8 เดือน)",
    keySymptoms: [
      "เพลี้ยแป้งรวมกลุ่มดูดกินน้ำเลี้ยงบริเวณยอด ลำต้น และใต้ใบอ่อน",
      "ยอดมันหดสั้น ข้อถี่หนาแน่นคล้ายพุ่มไม้กวาด (Bunchy Top)",
      "ใบหงิกม้วนงอ ขอบใบม้วนลง มีคราบผงแป้งสีขาวปกคลุมหนาแน่น",
      "มีสารหวานขับถ่ายออกมา ก่อให้เกิดเชื้อราดำปกคลุมใบ ลดการสังเคราะห์แสง",
    ],
    diagnosticChecklist: [
      "ตรวจดูยอดอ่อนว่ามีผงแป้งสีชมพูอ่อนถึงขาวเกาะเป็นก้อนหรือไม่",
      "ตรวจดูว่ามีมดดำหรือมดคันไฟเดินไต่ตามกิ่งยอดหรือไม่ (มดช่วยพาเพลี้ยแป้งไปขยายพันธุ์)",
      "สังเกตลำต้นว่าปล้องสั้นผิดปกติหรือไม่",
    ],
    preventativeMeasures: {
      varietySelection: [
        "พันธุ์ห้วยบง 80 และเกษตรศาสตร์ 50 มีความแข็งแรงทนทานต่อการเข้าทำลายมากกว่าพันธุ์ระยอง 1",
      ],
      culturalPractices: [
        "กำจัดมดซึ่งเป็นพาหะนำพาตัวอ่อนเพลี้ยแป้งไปยังส่วนยอด",
        "ตัดยอดที่พบเพลี้ยแป้งระบาดใส่ถุงพลาสติกนำไปตากแดดทำลาย",
        "ไถตากดินอย่างน้อย 2 สัปดาห์ก่อนปลูกเพื่อทำลายไข่และตัวอ่อนในดิน",
      ],
      quarantineAndSeedPrep: [
        "แช่ท่อนพันธุ์ก่อนปลูก 10 นาที ด้วยสาร ไทอะมีทอกแซม 25% WG อัตรา 4 กรัม/น้ำ 20 ลิตร หรือ อิมิดาโคลพริด 70% WG อัตรา 4 กรัม/น้ำ 20 ลิตร",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "ตัดยอดที่ถูกทำลายใส่ถุงพลาสติกมัดแน่น นำไปเผาทำลายนอกแปลง",
      ],
      biologicalControl: [
        {
          title: "ปล่อยแตนเบียนไข่และตัวเต็มวัย",
          agentName: "แตนเบียนอนากีรัส (Anagyrus lopezi)",
          dosageOrRate: "ปล่อยอัตรา 50-200 คู่ต่อไร่ เมื่อเริ่มพบเพลี้ยแป้ง",
          bestApplicationTime: "ช่วงเช้าตรู่หรือช่วงเย็น ลมสงบ",
          advantage: "เป็นศัตรูธรรมชาติจำเพาะเจาะจง สามารถควบคุมประชากรเพลี้ยแป้งสีชมพูได้อย่างถาวรและปลอดภัย",
        },
        {
          title: "ฉีดพ่นเชื้อรากำจัดแมลง",
          agentName: "เชื้อราบิวเวอเรีย (Beauveria bassiana)",
          dosageOrRate: "100-150 กรัม ต่อน้ำ 20 ลิตร ผสมสารจับใบ",
          bestApplicationTime: "ช่วงแดดร่มลมตกที่มีความชื้นในอากาศสูง",
          advantage: "ไม่ทำให้แมลงดื้อยาและปลอดภัยต่อผู้ใช้",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "แอคทารา (Actara)",
          activeIngredient: "ไทอะมีทอกแซม (thiamethoxam 25% WG)",
          iracFracGroup: "IRAC Group 4A",
          dosagePer20L: "4 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 21,
          targetPestStage: "ตัวอ่อนและตัวเต็มวัยเพลี้ยแป้ง",
          safetyCaution: "ห้ามพ่นช่วงพืชมีดอก เพื่อป้องกันอันตรายต่อผึ้งและแมลงผสมเกสร",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "เพลี้ยหอยมันสำปะหลัง หรือ ไรขาว",
      keyDifference:
        "เพลี้ยแป้งสีชมพูจะมีผงแป้งสีขาวเคลือบตัวและตัวอ่อนมีสีชมพูชัดเจน ยอดจะหดเป็นพุ่มไม้กวาด ในขณะที่เพลี้ยหอยจะมีเกราะแข็งสีน้ำตาลและไรขาวใบจะหยาบกร้านแต่ไม่เป็นพุ่มแป้ง",
      fieldTestTip: "บี้ตัวเพลี้ยดูของเหลวภายใน หากมีสีชมพูอมแดงชัดเจนคือเพลี้ยแป้งสีชมพู",
    },
    koratHotspotDistricts: ["ด่านขุนทด", "เสิงสาง", "โนนไทย", "ขามทะเลสอ", "พระทองคำ"],
    localAdvisoryTh:
      "ศูนย์วิจัยและพัฒนาการเกษตรนครราชสีมาสนับสนุนแตนเบียน Anagyrus lopezi ฟรีให้แก่เกษตรกรในพื้นที่ระบาด ติดต่อขอรับได้ที่สำนักงานเกษตรอำเภอใกล้บ้าน",
  },
  {
    id: "cassava_root_rot",
    cropKey: "cassava",
    cropNameTh: "มันสำปะหลัง",
    nameTh: "โรครากเน่าโคนเน่ามันสำปะหลัง (Phytophthora Root Rot)",
    nameEn: "Phytophthora Root Rot",
    scientificName: "Phytophthora drechsleri / P. nicotianae",
    category: "disease_fungus",
    categoryLabelTh: "โรคเกิดจากเชื้อราในดินและน้ำขัง",
    vectorOrCause: "เชื้อราในดิน สปอร์เคลื่อนที่ในน้ำ และสภาพดินระบายน้ำแย่",
    severityLevel: "high",
    estimatedLossRiskPct: 70,
    highlightedIcon: "biohazard",
    favorableWeatherCondition: "ฤดูฝนชุก ดินเหนียวอัดแน่น น้ำท่วมขังเกิน 24-48 ชั่วโมง",
    vulnerableStageTh: "ระยะสะสมอาหารลงหัว (อายุ 3–10 เดือน)",
    keySymptoms: [
      "ใบล่างเหลือง ร่วงหล่น ลำต้นเหี่ยวเฉาแห้งตายอย่างรวดเร็ว",
      "โคนต้นใกล้ผิวดินมีรอยแผลช้ำสีน้ำตาลเข้มถึงดำ เปลือกล่อนหลุดง่าย",
      "หัวมันสำปะหลังเน่า ส่งกลิ่นเหม็นเปรี้ยว เนื้อหัวเปลี่ยนเป็นสีน้ำตาลอ่อนถึงดำ",
      "ท่อลำเลียงภายในลำต้นเปลี่ยนเป็นสีน้ำตาล",
    ],
    diagnosticChecklist: [
      "ขุดดูหัวมันในจุดที่ต้นเหี่ยว สังเกตว่าหัวมันนิ่มเน่ามีกลิ่นเหม็นหรือไม่",
      "สังเกตพื้นที่ระบาดว่าเป็นจุดลุ่มต่ำหรือมีน้ำขังหรือไม่",
    ],
    preventativeMeasures: {
      varietySelection: [
        "พันธุ์ห้วยบง 80 มีความทนทานต่อสภาพดินชื้นดีกว่าพันธุ์ระยอง 72",
      ],
      culturalPractices: [
        "ยกร่องปลูกให้สูงอย่างน้อย 40-50 ซม. และจัดทำร่องระบายน้ำรอบแปลงเพื่อป้องกันน้ำท่วมขัง",
        "ใส่ปูนขาวปรับค่าความเป็นกรด-ด่างของดินให้อยู่ระหว่าง pH 6.0–6.5",
        "ใส่ปุ๋ยอินทรีย์ผสมเชื้อราไตรโคเดอร์มา (Trichoderma harzianum) อัตรา 1 กก./ปุ๋ยคอก 100 กก. รองก้นหลุมก่อนปลูก",
      ],
      quarantineAndSeedPrep: [
        "แช่ท่อนพันธุ์ด้วย เมทาแลกซิล (metalaxyl 35% DS) อัตรา 20 กรัม/น้ำ 20 ลิตร นาน 10 นาทีก่อนปลูก",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "ขุดต้นที่เป็นโรคและเก็บหัวมันที่เน่าออกจากแปลงไปเผาทำลายทันที",
        "โรยปูนขาวลงในหลุมที่ขุดและบริเวณโดยรอบเพื่อฆ่าเชื้อในดิน",
      ],
      biologicalControl: [
        {
          title: "ราดโคนต้นด้วยเชื้อราปฏิปักษ์",
          agentName: "เชื้อราไตรโคเดอร์มา (Trichoderma harzianum)",
          dosageOrRate: "เชื้อสด 100 กรัม ต่อน้ำ 20 ลิตร",
          bestApplicationTime: "ราดโคนต้นและร่องแปลงช่วงเย็นในฤดูฝน",
          advantage: "ช่วยยับยั้งการเจริญเติบโตของเชื้อราไฟทอปธอราในดินอย่างเป็นมิตรต่อสิ่งแวดล้อม",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "ฟอสอีทิล (Aliette)",
          activeIngredient: "ฟอสอีทิล-อะลูมินัม (fosetyl-aluminium 80% WP)",
          iracFracGroup: "FRAC Group P07 (Host defence inducers)",
          dosagePer20L: "40-50 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 30,
          targetPestStage: "ราดโคนและฉีดพ่นใบเมื่อเริ่มพบอาการ",
          safetyCaution: "ไม่ควรผสมกับสารกลุ่มคอปเปอร์หรือปุ๋ยทางใบที่มีไนโตรเจนสูง",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "อาการขาดน้ำหรือรากขาดจากไส้เดือนฝอย",
      keyDifference:
        "โรครากเน่า Phytophthora หัวมันจะเน่าเละมีกลิ่นเหม็นและเปลือกโคนต้นล่อนดำ ในขณะที่การขาดน้ำหัวมันจะไม่เน่าเพียงแต่ต้นเหี่ยวเฉา",
      fieldTestTip: "ผ่าดูหัวมัน หากมีเนื้อสีน้ำตาลดำฉ่ำน้ำและส่งกลิ่นเน่าเหม็นคือเชื้อราเน่าชัดเจน",
    },
    koratHotspotDistricts: ["พิมาย", "ชุมพวง", "ห้วยแถลง", "โนนสูง", "เมืองนครราชสีมา"],
    localAdvisoryTh:
      "หลีกเลี่ยงการปลูกมันสำปะหลังในพื้นที่ลุ่มต่ำที่เคยมีประวัติน้ำท่วมขัง แนะนำให้ปรับเปลี่ยนเป็นนาข้าวหรือยกร่องแบบลูกฟูกสูงพิเศษ",
  },

  // ================= SUGARCANE (อ้อยโรงงาน) =================
  {
    id: "sugarcane_white_leaf",
    cropKey: "sugarcane",
    cropNameTh: "อ้อยโรงงาน",
    nameTh: "โรคใบขาวอ้อย (Sugarcane White Leaf Disease)",
    nameEn: "Sugarcane White Leaf Phytoplasma (SCWL)",
    scientificName: "Candidatus Phytoplasma sacchari",
    category: "disease_bacteria",
    categoryLabelTh: "โรคเกิดจากเชื้อไฟโตพลาสมา (Phytoplasma)",
    vectorOrCause: "เพลี้ยจักจั่นหลังขาว (Matsumuratettix hiroglyphicus) และท่อนพันธุ์เป็นโรค",
    severityLevel: "critical",
    estimatedLossRiskPct: 90,
    highlightedIcon: "virus",
    favorableWeatherCondition: "อากาศร้อนชื้น ลมสงบ ปลูกอ้อยตอซ้ำซาก ขาดการตรวจคัดท่อนพันธุ์",
    vulnerableStageTh: "ระยะแตกกอและย่างปล้อง (อายุ 1–5 เดือน)",
    keySymptoms: [
      "ใบยอดเริ่มเปลี่ยนเป็นสีขาวซีดหรือขาวครีมตั้งแต่ปลายใบสู่โคนใบ",
      "เส้นใบและแผ่นใบเปลี่ยนเป็นสีขาวบริสุทธิ์ ไร้คลอโรฟิลล์สังเคราะห์แสง",
      "หน่ออ้อยแตกฝอยเป็นพุ่มหนาแน่นคล้ายกอหญ้า (Grassy Shoot)",
      "ต้นแคระแกร็น ปล้องสั้นลีบ ไม่สร้างลำอ้อย ผลผลิตในแปลงลดลง 80-100% และตออ้อยตายหมด",
    ],
    diagnosticChecklist: [
      "ตรวจดูใบอ่อนช่วงเช้า แผ่นใบยอดต้องเป็นสีขาวหรือแถบขาวตามแนวยาว",
      "สังเกตกออ้อยว่าแตกหน่อฝอยเล็กๆ ถี่ผิดปกติหรือไม่",
      "สำรวจเพลี้ยจักจั่นหลังขาวตามกาบใบและซอกใบ",
    ],
    preventativeMeasures: {
      varietySelection: [
        "ใช้พันธุ์อ้อยที่ผ่านการเพาะเลี้ยงเนื้อเยื่อปลอดโรค (Tissue Culture Cane)",
        "หลีกเลี่ยงการใช้ท่อนพันธุ์จากแปลงที่มีประวัติโรคใบขาวระบาดเกิน 3 ปี",
      ],
      culturalPractices: [
        "ไม่ไว้ตออ้อยในแปลงที่พบโรคใบขาวเกิน 5% ให้ไถกลบตากดินทันที",
        "ปลูกพืชหมุนเวียนตระกูลถั่ว (ถั่วพร้า ถั่วเขียว ปอเทือง) พักดินอย่างน้อย 6-8 เดือน เพื่อตัดวงจรเชื้อและพาหะ",
        "ติดตั้งกับดักแสงไฟล่อจับตัวเต็มวัยเพลี้ยจักจั่นหลังขาวช่วงหัวค่ำ",
      ],
      quarantineAndSeedPrep: [
        "อบท่อนพันธุ์ด้วยน้ำร้อน (Hot Water Treatment) อุณหภูมิ 50°C นาน 2 ชั่วโมง หรือ 52°C นาน 30 นาที ก่อนนำไปปลูกในแปลงขยายพันธุ์",
        "ใช้ท่อนพันธุ์สะอาดจากแปลงขยายพันธุ์ปลอดโรคของโรงงานน้ำตาลที่ผ่านการตรวจ PCR",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "ขุดกออ้อยที่เป็นโรคออกทั้งเหง้าและราก นำไปเผาทำลายนอกแปลงทันที ห้ามตัดเฉพาะลำต้นทิ้งไว้",
        "หยอดสารกำจัดวัชพืชหรือน้ำมันดีเซลทำลายตอที่ขุดไม่หมดเพื่อป้องกันการแตกหน่อขาวใหม่",
      ],
      biologicalControl: [
        {
          title: "ใช้เชื้อรากำจัดตัวอ่อนเพลี้ยจักจั่นในดิน",
          agentName: "เชื้อราเมตาไรเซียม (Metarhizium anisopliae)",
          dosageOrRate: "100 กรัม ต่อน้ำ 20 ลิตร ผสมสารจับใบ",
          bestApplicationTime: "ฉีดพ่นลงดินรอบโคนกออ้อยช่วงเย็นในฤดูฝน",
          advantage: "ทำลายตัวอ่อนเพลี้ยจักจั่นหลังขาวพาหะในดินได้อย่างมีประสิทธิภาพ",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "คอนฟิดอร์ (Confidor)",
          activeIngredient: "อิมิดาโคลพริด (imidacloprid 70% WG)",
          iracFracGroup: "IRAC Group 4A",
          dosagePer20L: "5-10 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 30,
          targetPestStage: "พ่นกำจัดเพลี้ยจักจั่นหลังขาวตัวอ่อนและตัวเต็มวัยช่วงเย็น",
          safetyCaution: "ฉีดพ่นให้ทั่วถึงกาบใบและโคนกออ้อย",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "อาการขาดธาตุเหล็ก (Iron Chlorosis)",
      keyDifference:
        "อาการขาดธาตุเหล็กใบจะซีดเหลืองเฉพาะระหว่างเส้นใบ แต่เส้นใบยังคงมีสีเขียว และมักเกิดในดินด่างจัด ในขณะที่โรคใบขาว SCWL แผ่นใบและเส้นใบจะขาวบริสุทธิ์ทั้งใบและแตกหน่อเป็นพุ่มฝอย",
      fieldTestTip: "หากทดลองฉีดพ่นธาตุเหล็กคีเลตทางใบแล้วใบไม่กลับมาเขียว แสดงว่าเป็นโรคใบขาว Phytoplasma",
    },
    koratHotspotDistricts: ["ด่านขุนทด", "พิมาย", "ครบุรี", "ชุมพวง", "แก้งสนามนาง", "จักราช"],
    localAdvisoryTh:
      "สมาคมชาวไร่อ้อยและโรงงานน้ำตาลในโคราชมีโครงการแลกเปลี่ยนท่อนพันธุ์ปลอดโรคเนื้อเยื่อ สามารถติดต่อสอบถามโควตาท่อนพันธุ์สะอาดได้ที่ฝ่ายส่งเสริมการปลูกอ้อยของโรงงานน้ำตาลในเขตของท่าน",
  },
  {
    id: "sugarcane_stem_borer",
    cropKey: "sugarcane",
    cropNameTh: "อ้อยโรงงาน",
    nameTh: "หนอนกออ้อย / หนอนเจาะลำต้นอ้อย (Sugarcane Stem Borer)",
    nameEn: "Sugarcane Stem Borer",
    scientificName: "Chilo infuscatellus / Sesamia inferens",
    category: "pest_insect",
    categoryLabelTh: "แมลงศัตรูพืชประเภทหนอนผีเสื้อเจาะลำต้น",
    vectorOrCause: "ผีเสื้อกลางคืนวางไข่ใต้ใบ หนอนฟักตัวเจาะเข้ายอดและลำต้น",
    severityLevel: "high",
    estimatedLossRiskPct: 60,
    highlightedIcon: "bug",
    favorableWeatherCondition: "อากาศร้อนแห้งแล้ง อุณหภูมิสูง อ้อยอายุ 1-3 เดือนช่วงฝนทิ้งช่วง",
    vulnerableStageTh: "ระยะแตกกอและย่างปล้อง (อายุ 1–4 เดือน)",
    keySymptoms: [
      "หนอนเจาะเข้าไปกัดกินไส้กลางยอดอ้อย ทำให้ยอดแห้งตาย ดึงหลุดง่าย (อาการยอดเหี่ยวแห้งตาย Dead Heart)",
      "กออ้อยแตกหน่อแขนงข้างมากผิดปกติ ลำต้นแคระแกร็น",
      "ในอ้อยใหญ่ ลำต้นมีรูเจาะ มีมูลหนอนสีน้ำตาลหน้าปากรู ลำต้นหักล้มง่ายเมื่อโดนลมพัด",
      "เนื้ออ้อยภายในเกิดรอยเน่าแดง น้ำหนักลดลง ค่าความหวาน (C.C.S.) ลดลงอย่างรุนแรง",
    ],
    diagnosticChecklist: [
      "ตรวจดูยอดอ้อยที่เหี่ยวแห้ง ดึงยอดขึ้นมาตรวจดูรอยหนอนกัดกินไส้",
      "ตรวจหารอยรูเจาะและขี้หนอนตามข้อลำอ้อย",
      "สุ่มตรวจ 100 ลำ หากพบยอดตายเกิน 10 ลำ (10%) แสดงว่าเข้าเกณฑ์ระบาดรุนแรง",
    ],
    preventativeMeasures: {
      varietySelection: [
        "พันธุ์ขอนแก่น 3 และพันธุ์อู่ทอง 3 มีความทนทานต่อหนอนกอดีกว่าพันธุ์ดั้งเดิม",
      ],
      culturalPractices: [
        "ไม่ควรเผาใบอ้อยก่อนหรือหลังตัด เพราะจะทำลายตัวห้ำตัวเบียนในแปลง เช่น แตนเบียนและแมลงหางหนีบ",
        "ให้น้ำแปลงอ้อยอย่างสม่ำเสมอช่วงแล้ง ดินชื้นจะช่วยลดการระบาดของหนอนกออ้อยได้มากกว่า 50%",
        "ตัดยอดอ้อยที่พบหนอนกอเจาะตายออกนำไปทำลายนอกแปลงเพื่อป้องกันการลุกลาม",
      ],
      quarantineAndSeedPrep: [
        "ตรวจคัดเลือกท่อนพันธุ์ปราศจากรูเจาะของหนอน",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "ตัดยอดแห้งตายชิดผิวดินเพื่อดึงเอาตัวหนอนไปทำลาย",
      ],
      biologicalControl: [
        {
          title: "ปล่อยแตนเบียนไข่ธรรมชาติ",
          agentName: "แตนเบียนไข่ทริคโคแกรมม่า (Trichogramma chilonis)",
          dosageOrRate: "ปล่อยอัตรา 20,000 ตัวต่อไร่ ทุก 15 วัน รวม 4-6 ครั้ง",
          bestApplicationTime: "เริ่มปล่อยเมื่ออ้อยอายุ 1-3 เดือน ในช่วงเช้าหรือเย็น",
          advantage: "ทำลายไข่ของหนอนผีเสื้อก่อนที่หนอนจะฟักตัวออกมากัดกินยอดอ้อยอย่างมีประสิทธิภาพ",
        },
        {
          title: "ปล่อยแมลงหางหนีบตัวห้ำ",
          agentName: "แมลงหางหนีบสีดำ (Chelisoches morio)",
          dosageOrRate: "ปล่อยอัตรา 100-200 ตัวต่อไร่",
          bestApplicationTime: "ปล่อยตามโคนกออ้อยช่วงเย็น",
          advantage: "กินไข่และตัวหนอนกออ้อยได้อย่างต่อเนื่องตลอดฤดูกาล",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "พรีวาธอน (Prevathon)",
          activeIngredient: "คลอแรนทรานิลิโพรล (chlorantraniliprole 5.17% SC)",
          iracFracGroup: "IRAC Group 28 (Ryanodine receptor modulators)",
          dosagePer20L: "20-30 มล. ต่อน้ำ 20 ลิตร",
          phiDays: 30,
          targetPestStage: "พ่นเมื่อพบยอดตายเกิน 10% หรือพบการวางไข่หนาแน่น",
          safetyCaution: "พ่นสารให้เปียกโชกบริเวณกาบใบและยอดอ้อยอย่างทั่วถึง",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "อาการยอดแห้งตายจากภัยแล้งหรือด้วงหนวดยาวกัดราก",
      keyDifference:
        "หนอนกออ้อยเมื่อดึงยอดที่เหี่ยวตายขึ้นมาจะหลุดง่ายและพบรอยหนอนเจาะไส้เน่าเหม็น ส่วนภัยแล้งยอดจะเหี่ยวทั้งกอแต่ดึงไม่หลุดและไม่มีรอยเจาะ",
      fieldTestTip: "ดึงยอดอ้อยขึ้นมาตรงๆ หากหลุดง่ายและโคนยอดมีรอยขาดคือหนอนกอ 100%",
    },
    koratHotspotDistricts: ["ด่านขุนทด", "พิมาย", "ครบุรี", "ชุมพวง", "โนนแดง"],
    localAdvisoryTh:
      "ศูนย์ส่งเสริมเทคโนโลยีการเกษตรด้านอารักขาพืช (ศทอ.) นครราชสีมา มีแตนเบียนไข่ทริคโคแกรมม่าแจกจ่ายให้กลุ่มเกษตรกรแปลงใหญ่อ้อย ติดต่อขอรับได้ผ่านเกษตรอำเภอ",
  },

  // ================= CORN (ข้าวโพดเลี้ยงสัตว์) =================
  {
    id: "corn_fall_armyworm",
    cropKey: "corn",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์",
    nameTh: "หนอนกระทู้ข้าวโพดลายจุด (Fall Armyworm - FAW)",
    nameEn: "Fall Armyworm (FAW)",
    scientificName: "Spodoptera frugiperda (J.E. Smith)",
    category: "pest_insect",
    categoryLabelTh: "แมลงศัตรูพืชสำคัญระดับชาติ (พืชตระกูลหญ้า)",
    vectorOrCause: "ผีเสื้อกลางคืนบินอพยพตามกระแสลม ขยายพันธุ์เร็ว วางไข่เป็นกลุ่ม 100-200 ฟอง",
    severityLevel: "critical",
    estimatedLossRiskPct: 80,
    highlightedIcon: "bug",
    favorableWeatherCondition: "ตลอดทั้งปี ระบาดรุนแรงมากช่วงฝนทิ้งช่วงและช่วงข้าวโพดงอกใหม่ 7-30 วัน",
    vulnerableStageTh: "ตั้งแต่ข้าวโพดงอกจนถึงระยะสร้างฝักและออกดอกตัวผู้ (อายุ 7–60 วัน)",
    keySymptoms: [
      "ตัวหนอนวัย 1-2 แทะผิวใบด้านล่าง ทำให้เห็นเป็นหน้าต่างใส (Window pane)",
      "หนอนวัย 3-6 เจาะเข้าไปอาศัยกัดกินอยู่ภายในกรวยยอด กัดกินยอดจนใบขาดวิ่นพรุนหนาแน่น",
      "มีมูลหนอนลักษณะคล้ายขี้เลื่อยอุดตันอยู่ในกรวยยอดอย่างเด่นชัด",
      "หนอนเจาะทำลายช่อดอกตัวผู้ (Tassel) และเจาะเปลือกหุ้มฝักเข้าไปกินเมล็ดข้าวโพดอ่อน",
    ],
    diagnosticChecklist: [
      "สังเกตหัวหนอนวัยแก่: มีแถบสีขาวรูปตัว Y หัวกลับ (Inverted Y) บนหน้าผากชัดเจน",
      "สังเกตลำตัวปล้องที่ 8 (ก่อนปล้องสุดท้าย): มีตุ่มขนสีดำ 4 จุด เรียงตัวเป็นรูปสี่เหลี่ยมจัตุรัส",
      "สุ่มตรวจ 100 ต้น หากพบรอยทำลายเกิน 20 ต้นในระยะต้นอ่อน ให้เริ่มมาตรการควบคุมทันที",
    ],
    preventativeMeasures: {
      varietySelection: [
        "เลือกใช้พันธุ์ข้าวโพดที่มีกาบหุ้มฝักมิดชิดและต้นแข็งแรง เช่น ซีพี 888, ไพโอเนีย, เดคาล์บ",
      ],
      culturalPractices: [
        "คลุกเมล็ดพันธุ์ก่อนปลูกด้วยสาร ไซแอนทรานิลิโพรล (cyantraniliprole 20% SC) เพื่อคุ้มครองต้นกล้า 14-21 วัน",
        "ติดตั้งกับดักฟีโรโมนล่อผีเสื้อตัวผู้ (อัตรา 2-4 กับดักต่อไร่) เพื่อพยากรณ์และลดการผสมพันธุ์",
        "ไม่ควรปลูกข้าวโพดเหลื่อมเวลากันในพื้นที่ติดกัน เพราะจะเป็นแหล่งสะสมและแพร่ระบาดต่อเนื่อง",
      ],
      quarantineAndSeedPrep: [
        "ไถตากดินลึก 20-30 ซม. อย่างน้อย 1 สัปดาห์ เพื่อทำลายดักแด้หนอนกระทู้ในดิน",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "บี้ทำลายกลุ่มไข่ที่มีขนสีน้ำตาลคลุมและเก็บตัวหนอนในกรวยยอดทำลายด้วยมือในแปลงขนาดเล็ก",
      ],
      biologicalControl: [
        {
          title: "ฉีดพ่นเชื้อแบคทีเรียกำจัดหนอน",
          agentName: "บาซิลลัส ทูริงจิเอนซิส (Bacillus thuringiensis - BT)",
          dosageOrRate: "BT สายพันธุ์ kurstaki หรือ aizawai อัตรา 60-80 กรัม ต่อน้ำ 20 ลิตร",
          bestApplicationTime: "ฉีดพ่นช่วงเย็น แดดอ่อน พ่นให้ละอองยาหยอดลงกรวยยอด",
          advantage: "ปลอดภัยต่อมนุษย์ ศัตรูธรรมชาติ และสิ่งแวดล้อม 100%",
        },
        {
          title: "ฉีดพ่นเชื้อไวรัสเฉพาะเจาะจง",
          agentName: "ไวรัสนิวคลีโอโพลีฮีโดรไวรัส (Spodoptera frugiperda NPV)",
          dosageOrRate: "20-30 มล. ต่อน้ำ 20 ลิตร",
          bestApplicationTime: "พ่นเมื่อหนอนอยู่ในวัยที่ 1-2 (หนอนขนาดเล็ก)",
          advantage: "หนอนตายเกิดการแพร่กระจายของเชื้อไวรัสสู่หนอนตัวอื่นในแปลงต่อเนื่อง",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "เอ็กซอล (Exalt)",
          activeIngredient: "สไปนีโทแรม (spinetoram 12% SC)",
          iracFracGroup: "IRAC Group 5 (Nicotinic acetylcholine receptor allosteric modulators)",
          dosagePer20L: "15-20 มล. ต่อน้ำ 20 ลิตร",
          phiDays: 14,
          targetPestStage: "หนอนกระทู้ทุกวัย โดยเฉพาะวัย 2-4",
          safetyCaution: "ควรพ่นจี้ลงในกรวยยอดข้าวโพด และสลับกลุ่มสารเคมีทุก 30 วัน",
        },
        {
          tradeExample: "โปรเคลม (Proclaim)",
          activeIngredient: "อีมาเมกตินเบนโซเอต (emamectin benzoate 5% SG)",
          iracFracGroup: "IRAC Group 6 (Glutamate-gated chloride channel allosteric modulators)",
          dosagePer20L: "10-15 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 14,
          targetPestStage: "หนอนกระทู้ลายจุดในกรวยยอด",
          safetyCaution: "ห้ามใช้ซ้ำติดต่อกันเกิน 2 ครั้ง เพื่อป้องกันการสร้างความต้านทานยา",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "หนอนเจาะสมอฝ้าย (Helicoverpa armigera) หรือหนอนกระทู้ผัก",
      keyDifference:
        "หนอนกระทู้ข้าวโพดลายจุด FAW จะมีจุดเด่นคือสัญลักษณ์ Y หัวกลับที่หัว และมีตุ่มดำ 4 จุดเป็นสี่เหลี่ยมจัตุรัสที่ปล้องท้าย และกินลึกเข้าไปในกรวยยอดพร้อมขี้เลื่อยอุดตัน",
      fieldTestTip: "จับหนอนมาดูที่ส่วนหัวด้วยแว่นขยาย หากเห็นรูป Y สีขาวชัดเจนคือ FAW แน่นอน",
    },
    koratHotspotDistricts: ["ปากช่อง", "สีคิ้ว", "ด่านขุนทด", "ปักธงชัย", "เสิงสาง", "เทพารักษ์"],
    localAdvisoryTh:
      "เตือนเกษตรกรผู้ปลูกข้าวโพดในโคราช: หลีกเลี่ยงการใช้สารกลุ่มไพรีทรอยด์ (เช่น ไซเพอร์เมทริน) เดี่ยวๆ เนื่องจากหนอนกระทู้ลายจุดในเขตโคราชดื้อยาและจะไปฆ่าศัตรูธรรมชาติ ทำให้หนอนระบาดทวีคูณ",
  },
  {
    id: "corn_downy_mildew",
    cropKey: "corn",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์",
    nameTh: "โรคราน้ำค้างข้าวโพด (Corn Downy Mildew)",
    nameEn: "Corn Downy Mildew",
    scientificName: "Peronosclerospora sorghi (Weston & Uppal) C.G. Shaw",
    category: "disease_fungus",
    categoryLabelTh: "โรคเกิดจากเชื้อราน้ำค้างในดินและอากาศชื้น",
    vectorOrCause: "สปอร์เชื้อราในอากาศ ติดมากับเมล็ดพันธุ์ และโอโอสปอร์ตกค้างในดิน",
    severityLevel: "high",
    estimatedLossRiskPct: 75,
    highlightedIcon: "biohazard",
    favorableWeatherCondition: "ฤดูฝน อากาศเย็นชื้น หมอกลงจัด น้ำค้างเกาะใบนาน อุณหภูมิ 20-26°C",
    vulnerableStageTh: "ระยะต้นกล้าถึงเริ่มสร้างลำต้น (อายุ 7–35 วัน)",
    keySymptoms: [
      "ใบข้าวโพดเริ่มมีแถบสีเหลืองอ่อนหรือเขียวอ่อนเป็นทางยาวขนานกับเส้นใบตั้งแต่โคนใบสู่ปลายใบ",
      "ช่วงเช้าตรู่ที่อากาศชื้น ใต้ใบจะพบผงสปอร์สีขาวคล้ายแป้งหรือปุยฝ้ายเกาะหนาแน่น",
      "ต้นข้าวโพดแคระแกร็น ปล้องสั้น ใบตั้งชัน ยอดแตกเป็นพุ่ม",
      "ต้นไม่ติดฝัก หรือฝักลีบ เมล็ดไม่สมบูรณ์ เสียหายทั้งแปลงหากระบาดตั้งแต่ระยะกล้า",
    ],
    diagnosticChecklist: [
      "พลิกดูใต้ใบที่มีทางเหลืองช่วงเช้ามืด สังเกตผงแป้งสีขาว",
      "สังเกตว่าอาการเป็นทางยาวตามเส้นใบหรือไม่",
    ],
    preventativeMeasures: {
      varietySelection: [
        "เลือกใช้เมล็ดพันธุ์ที่ระบุว่าคลุกสารป้องกันโรคราน้ำค้างและมีความต้านทานสูง",
      ],
      culturalPractices: [
        "ปลูกข้าวโพดให้พร้อมกันในชุมชน หลีกเลี่ยงการปลูกล่าช้ากว่าแปลงข้างเคียง",
        "ทำลายพืชอาศัยของเชื้อรา เช่น หญ้าพง หญ้าคา ข้าวฟ่างผี รอบแปลง",
      ],
      quarantineAndSeedPrep: [
        "คลุกเมล็ดพันธุ์ก่อนปลูกด้วยสาร เมทาแลกซิล (metalaxyl 35% DS) อัตรา 7-10 กรัม ต่อเมล็ดพันธุ์ 1 กิโลกรัม",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "ถอนต้นข้าวโพดที่แสดงอาการเป็นโรคราน้ำค้างนำไปเผาทำลายนอกแปลงทันที อย่าปล่อยทิ้งไว้ในแปลงเด็ดขาด",
      ],
      biologicalControl: [
        {
          title: "ฉีดพ่นเชื้อแบคทีเรียปฏิปักษ์",
          agentName: "บาซิลลัส ซับทิลิส (Bacillus subtilis - BS)",
          dosageOrRate: "50-100 กรัม ต่อน้ำ 20 ลิตร",
          bestApplicationTime: "ฉีดพ่นทางใบช่วงเย็นเพื่อป้องกันสปอร์งอก",
          advantage: "ช่วยสร้างภูมิต้านทานและลดการแพร่กระจายของเชื้อรา",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "เอโครแบท (Acrobat)",
          activeIngredient: "ไดเมโทมอร์ฟ (dimethomorph 50% WG)",
          iracFracGroup: "FRAC Group 40 (Inhibition of phospholipid biosynthesis)",
          dosagePer20L: "10-20 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 14,
          targetPestStage: "พ่นเมื่อเริ่มพบการระบาดในระยะกล้า",
          safetyCaution: "ฉีดพ่นให้ทั่วทั้งบนใบและใต้ใบ",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "อาการขาดธาตุสังกะสีหรืออาการใบแถบจากไวรัสข้าวโพด",
      keyDifference:
        "โรคราน้ำค้างช่วงเช้าตรู่ใต้ใบจะมีผงแป้งสีขาวเกาะหนาแน่นชัดเจน และแถบสีเหลืองจะคมชัดตามแนวเส้นใบ ในขณะที่การขาดธาตุจะไม่มีผงสปอร์ใต้ใบ",
      fieldTestTip: "นำใบต้องสงสัยใส่ถุงพลาสติกชื้นมัดปากทิ้งไว้ 1 คืน หากมีผงสีขาวงอกขึ้นมาคือราน้ำค้างแน่นอน",
    },
    koratHotspotDistricts: ["ปากช่อง", "วังน้ำเขียว", "สีคิ้ว", "ปักธงชัย"],
    localAdvisoryTh:
      "ในแปลงที่มีประวัติโรคราน้ำค้างระบาด ห้ามนำเมล็ดที่เก็บเองมาปลูกเด็ดขาด ต้องใช้เมล็ดพันธุ์คลุกสารเคมีป้องกันจากบริษัทที่ได้รับมาตรฐานเท่านั้น",
  },

  // ================= JASMINE RICE (ข้าวหอมมะลิ 105) =================
  {
    id: "rice_blast",
    cropKey: "rice",
    cropNameTh: "ข้าวหอมมะลิ 105",
    nameTh: "โรคไหม้ข้าวหอมมะลิ (Rice Blast)",
    nameEn: "Rice Blast Disease",
    scientificName: "Pyricularia oryzae Cavara (Magnaporthe oryzae)",
    category: "disease_fungus",
    categoryLabelTh: "โรคเชื้อราทำลายใบและคอรวงข้าว",
    vectorOrCause: "สปอร์เชื้อราแพร่กระจายไปตามลมและติดมากับเมล็ดพันธุ์",
    severityLevel: "critical",
    estimatedLossRiskPct: 85,
    highlightedIcon: "biohazard",
    favorableWeatherCondition: "อากาศเย็น ความชื้นสัมพัทธ์สูง >90% มีหมอก น้ำค้างยาวนาน และใส่ปุ๋ยไนโตรเจนมากเกินไป",
    vulnerableStageTh: "ระยะกล้า-แตกกอ (ไหม้ใบ) และระยะออกรวง-สลัดเกสร (ไหม้คอรวง)",
    keySymptoms: [
      "ระยะกล้าและแตกกอ: แผลที่ใบมีลักษณะคล้ายรูปตาหรือรูปกระสวย (Spindle-shaped lesion)",
      "แผลมีขอบสีน้ำตาลเข้ม ปลายแผลแหลมทั้งสองด้าน กลางแผลมีสีเทาเงินหรือเทาอมขาว",
      "แผลลุกลามขยายติดกันจนใบแห้งไหม้ทั้งใบ กอข้าวฟุบแห้งตายคล้ายรอยไฟไหม้",
      "ระยะออกรวง (โรคไหม้คอรวง Neck Blast): คอรวงมีรอยช้ำสีน้ำตาลดำ คอรวงเน่าหักพับ เมล็ดลีบทั้งรวง ข้าวไม่สุกแก่ เสียหายสิ้นเชิง",
    ],
    diagnosticChecklist: [
      "ตรวจดูแผลบนใบข้าวว่าเป็นรูปกระสวยขอบน้ำตาลกลางเทาหรือไม่",
      "ตรวจดูคอรวงข้าวระยะตั้งท้อง-ออกรวงว่ามีรอยช้ำสีน้ำตาลดำหรือไม่",
      "สังเกตว่าแปลงที่เกิดโรคมีการใส่ปุ๋ยยูเรียสูงหรือหว่านข้าวแน่นเกินไปหรือไม่",
    ],
    preventativeMeasures: {
      varietySelection: [
        "ข้าวพันธุ์ กข 15 มีความต้านทานโรคไหม้ดีกว่าพันธุ์ขาวดอกมะลิ 105 ในบางพื้นที่",
        "คัดเลือกเมล็ดพันธุ์ข้าวสะอาดบริสุทธิ์จากศูนย์เมล็ดพันธุ์ข้าวโคราช",
      ],
      culturalPractices: [
        "ไม่หว่านข้าวหนาแน่นเกินไป อัตราการใช้เมล็ดพันธุ์ไม่เกิน 12-15 กิโลกรัมต่อไร่",
        "ควบคุมการใส่ปุ๋ยไนโตรเจน (ยูเรีย 46-0-0) ไม่เกิน 15-20 กก./ไร่ และแบ่งใส่ 2-3 ครั้ง",
        "เพิ่มปุ๋ยโพแทสเซียม (0-0-60) และปุ๋ยซิลิคอนเพื่อเสริมสร้างความแข็งแรงของผนังเซลล์ใบข้าว",
        "จัดการน้ำแบบเปียกสลับแห้ง แกล้งข้าว เพื่อลดความชื้นสะสมที่โคนกอ",
      ],
      quarantineAndSeedPrep: [
        "แช่เมล็ดพันธุ์ข้าวด้วยสาร ไตรไซคลาโซล (tricyclazole 75% WP) อัตรา 10-20 กรัม/น้ำ 20 ลิตร นาน 12-24 ชั่วโมง ก่อนนำไปหว่าน",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "เมื่อเริ่มพบแผลรูปกระสวยบนใบเกิน 5% ให้งดใส่ปุ๋ยยูเรียหรือปุ๋ยไนโตรเจนทันที",
      ],
      biologicalControl: [
        {
          title: "ฉีดพ่นเชื้อราไตรโคเดอร์มา",
          agentName: "เชื้อราไตรโคเดอร์มา (Trichoderma harzianum)",
          dosageOrRate: "เชื้อสด 1 กก. ต่อน้ำ 200 ลิตร ผสมสารจับใบ",
          bestApplicationTime: "ฉีดพ่นช่วงเย็นที่มีความชื้นสูง ในระยะข้าวแตกกอ",
          advantage: "สร้างสารยับยั้งการงอกของสปอร์เชื้อราก่อโรคไหม้และเป็นมิตรต่อระบบนิเวศน์ในนาข้าว",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "บีม (Beam)",
          activeIngredient: "ไตรไซคลาโซล (tricyclazole 75% WP)",
          iracFracGroup: "FRAC Group 16.1 (Melanin biosynthesis inhibitors)",
          dosagePer20L: "10-15 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 28,
          targetPestStage: "พ่นระยะแตกกอเมื่อพบอาการไหม้ใบ และพ่นป้องกันไหม้คอรวง 2 ครั้ง (ระยะตั้งท้อง 1 ครั้ง และระยะข้าวเริ่มแทงรวง 5% 1 ครั้ง)",
          safetyCaution: "ควรพ่นป้องกันก่อนที่คอรวงจะหักพับ",
        },
        {
          tradeExample: "คาสูมิน (Kasumin)",
          activeIngredient: "คาซูกาไมซิน (kasugamycin 2% SL)",
          iracFracGroup: "FRAC Group 24 (Hexopyranosyl antibiotic)",
          dosagePer20L: "40-60 มล. ต่อน้ำ 20 ลิตร",
          phiDays: 21,
          targetPestStage: "ฉีดพ่นรักษาเมื่อพบแผลไหม้กำลังลุกลาม",
          safetyCaution: "มีคุณสมบัติดูดซึมและแทรกซึมได้เร็ว",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "โรคใบจุดสีน้ำตาล (Brown Spot) หรือ โรคขอบใบแห้ง (BLB)",
      keyDifference:
        "โรคไหม้แผลจะเป็นรูปกระสวย ปลายแหลมสองด้าน กลางแผลสีเทาเงิน ในขณะที่ใบจุดสีน้ำตาลแผลจะกลมรีขอบสีเหลืองกลางแผลสีน้ำตาล และขอบใบแห้งแผลจะเริ่มที่ริมขอบใบเป็นทางยาวเป็นคลื่น",
      fieldTestTip: "สังเกตปลายแผลทั้งสองด้าน หากเป็นมุมแหลมเรียวคล้ายรูปตาคือโรคไหม้ข้าว",
    },
    koratHotspotDistricts: ["พิมาย", "โนนสูง", "บัวใหญ่", "ชุมพวง", "ประทาย", "เมืองนครราชสีมา", "คง"],
    localAdvisoryTh:
      "ศูนย์วิจัยข้าวนครราชสีมาเตือนเกษตรกรผู้ปลูกข้าวหอมมะลิ 105: ในช่วงปลายฝนต้นหนาว (ก.ย. - พ.ย.) ที่มีความชื้นสูงและหมอกลงจัด ให้หมั่นตรวจคอรวง หากพบสภาพอากาศเอื้ออำนวยให้พ่นสารไตรไซคลาโซลป้องกันทันทีในระยะข้าวแทงรวง 5%",
  },
  {
    id: "rice_brown_planthopper",
    cropKey: "rice",
    cropNameTh: "ข้าวหอมมะลิ 105",
    nameTh: "เพลี้ยกระโดดสีน้ำตาล (Brown Planthopper - BPH)",
    nameEn: "Brown Planthopper (BPH)",
    scientificName: "Nilaparvata lugens (Stål)",
    category: "pest_insect",
    categoryLabelTh: "แมลงศัตรูพืชกลุ่มปากดูดทำลายกอข้าว",
    vectorOrCause: "บินอพยพตามกระแสลม และเป็นพาหะนำโรคใบหงิก (Ragged Stunt) และโรคจาวเขียว (Grassy Stunt)",
    severityLevel: "high",
    estimatedLossRiskPct: 80,
    highlightedIcon: "bug",
    favorableWeatherCondition: "สภาพอากาศอบอ้าว ชื้น นาข้าวมีน้ำขังตลอดเวลา หว่านข้าวแน่น ใส่ปุ๋ยยูเรียสูง",
    vulnerableStageTh: "ระยะแตกกอสูงสุดถึงระยะน้ำนม (อายุ 45–85 วัน)",
    keySymptoms: [
      "เพลี้ยกระโดดตัวอ่อนและตัวเต็มวัยรวมกลุ่มกันดูดกินน้ำเลี้ยงที่บริเวณโคนกอข้าวเหนือระดับน้ำ",
      "ต้นข้าวมีอาการเหลืองแห้ง เหี่ยวเฉา และแห้งตายเป็นวงกว้างลักษณะคล้ายรอยน้ำร้อนลวก (อาการไหม้แห้ง Hopperburn)",
      "ใบข้าวมีคราบราดำขึ้นปกคลุมจากน้ำหวานที่เพลี้ยขับถ่ายออกมา",
      "เป็นพาหะนำเชื้อไวรัสโรคใบหงิก ทำให้ข้าวกอเตี้ย แตกกอแน่น ไม่ออกรวง",
    ],
    diagnosticChecklist: [
      "แหวกโคนกอข้าวระดับผิวน้ำ สังเกตตัวแมลงสีน้ำตาลขนาดเล็กกระโดดหนีหรือว่ายน้ำ",
      "สุ่มตรวจ 20 จุดในแปลง หากพบตัวอ่อนหรือตัวเต็มวัยเฉลี่ยเกิน 1-2 ตัวต่อกอ ให้เตรียมการควบคุม",
    ],
    preventativeMeasures: {
      varietySelection: [
        "ปลูกข้าวพันธุ์ต้านทานเพลี้ยกระโดดสีน้ำตาล เช่น กข 31, กข 41 ในพื้นที่ที่มีประวัติการระบาดซ้ำซาก",
      ],
      culturalPractices: [
        "หว่านข้าวบาง อัตรา 12-15 กก./ไร่ เพื่อให้โคนกอโปร่ง แสงแดดส่องถึง ลดความชื้นสะสม",
        "จัดการน้ำในนาแบบ 'เปียกสลับแห้ง แกล้งข้าว' (AWD): ไขน้ำออกจากแปลงปล่อยให้ดินแตกระแหง 5-7 วัน เพื่อให้เพลี้ยกระโดดขาดน้ำและไม่มีที่หลบซ่อน",
        "งดพ่นสารเคมีกลุ่มไพรีทรอยด์ (เช่น ไซเพอร์เมทริน, แลมบ์ดาไซฮาโลทริน) เพราะจะทำลายแมงมุมหมาป่าและมวนเขียวดูดไข่ ทำให้เพลี้ยระบาดรุนแรงขึ้นกว่าเดิม (Resurgence)",
      ],
      quarantineAndSeedPrep: [
        "ไถกลบตอซังหลังเก็บเกี่ยว พักดินอย่างน้อย 1 เดือนเพื่อตัดวงจรชีวิตแมลง",
      ],
    },
    treatmentOptions: {
      emergencySanitation: [
        "ไขน้ำออกจากแปลงทันทีเมื่อพบการระบาด เพื่อลดความชื้นและเปิดให้แดดส่องถึงโคนกอ",
      ],
      biologicalControl: [
        {
          title: "อนุรักษ์ศัตรูธรรมชาติในนาข้าว",
          agentName: "แมงมุมหมาป่า (Pardosa pseudoannulata) และมวนเขียวดูดไข่ (Cyrtorhinus lividipennis)",
          dosageOrRate: "หากพบแมงมุม 1 ตัวต่อ 1-2 กอ สามารถควบคุมเพลี้ยได้ตามธรรมชาติโดยไม่ต้องพ่นยา",
          bestApplicationTime: "ตลอดฤดูกาลทำนา",
          advantage: "ควบคุมประชากรเพลี้ยกระโดดได้อย่างยั่งยืน ต้นทุนศูนย์บาท",
        },
        {
          title: "ฉีดพ่นเชื้อราบิวเวอเรียร่วมกับเมตาไรเซียม",
          agentName: "Beauveria bassiana + Metarhizium anisopliae",
          dosageOrRate: "100 กรัม ต่อน้ำ 20 ลิตร",
          bestApplicationTime: "ฉีดพ่นที่โคนกอข้าวช่วงเย็นที่มีความชื้น",
          advantage: "ปลอดภัยต่อปลา กบ และสิ่งแวดล้อมในนาข้าว",
        },
      ],
      chemicalControl: [
        {
          tradeExample: "เชส (Chess)",
          activeIngredient: "ไพมีโทรซีน (pymetrozine 50% WG)",
          iracFracGroup: "IRAC Group 9B (Chordotonal organ TRPV channel modulators)",
          dosagePer20L: "10 กรัม ต่อน้ำ 20 ลิตร",
          phiDays: 21,
          targetPestStage: "ทำให้ปากของเพลี้ยเป็นอัมพาต หยุดดูดกินน้ำเลี้ยงและอดตายภายใน 24-48 ชั่วโมง",
          safetyCaution: "ปลอดภัยต่อแมงมุมตัวห้ำในนาข้าว",
        },
        {
          tradeExample: "พอนโซ (Ponso)",
          activeIngredient: "ไตรฟลูมีโซไพริม (triflumezopyrim 10% SC)",
          iracFracGroup: "IRAC Group 4E (Mesoionic)",
          dosagePer20L: "5-6 มล. ต่อน้ำ 20 ลิตร",
          phiDays: 28,
          targetPestStage: "ออกฤทธิ์เร็วและคุมได้ยาวนาน 20-25 วันต่อการพ่น 1 ครั้ง",
          safetyCaution: "ฉีดพ่นให้ละอองยาลงถึงระดับโคนกอข้าว",
        },
      ],
    },
    lookAlikeDifferentiator: {
      similarIssueName: "เพลี้ยจักจั่นสีเขียว หรือ โรครากเน่าจากน้ำเสีย",
      keyDifference:
        "เพลี้ยกระโดดสีน้ำตาลลำตัวจะมีสีน้ำตาลปนเทา ขนาด 3-4 มม. อาศัยอยู่ที่โคนกอข้าวระดับผิวน้ำ ส่วนเพลี้ยจักจั่นสีเขียวจะอยู่บนใบยอดและมีสีเขียวตองอ่อน",
      fieldTestTip: "ตบโคนกอข้าวเหนือน้ำ หากพบแมลงสีน้ำตาลร่วงลงผิวน้ำจำนวนมากคือเพลี้ยกระโดดสีน้ำตาล",
    },
    koratHotspotDistricts: ["พิมาย", "โนนสูง", "ชุมพวง", "ประทาย", "บัวใหญ่"],
    localAdvisoryTh:
      "เกษตรจังหวัดนครราชสีมาเน้นย้ำ: งดเว้นการใช้สารเคมีฆ่าแมลงแบบหว่านหรือสารผสมโดยไม่จำเป็น และห้ามใช้สารไซเพอร์เมทรินในนาข้าวเด็ดขาด ให้ยึดหลักการไขน้ำออกแกล้งข้าวร่วมกับสารเลือกทำลาย",
  },
];

// District Outbreak Status across Korat's 32 Districts
export const KORAT_32_DISTRICT_OUTBREAK_STATUS: DistrictPestOutbreakStatus[] = [
  {
    districtId: "mueang-nakhon-ratchasima",
    districtNameTh: "อ.เมืองนครราชสีมา",
    zone: "โซนกลาง-ลุ่มน้ำลำตะคอง",
    cropThreats: [
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 420,
        advisoryNote: "พบจุดประปรายใน ต.โพธิ์กลาง และ ต.หนองบัวศาลา เกษตรอำเภอลงพื้นที่สำรวจแล้ว",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "moderate",
        trend: "increasing",
        affectedAreaEstimatedRai: 850,
        advisoryNote: "ฝนตกสลับแดดจัด เสี่ยงโรคไหม้ใบในนาข้าวรอบเขตเมือง",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "safe",
        trend: "stable",
        affectedAreaEstimatedRai: 120,
        advisoryNote: "ยังไม่พบการระบาดรุนแรง แปลงข้าวโพดหวานมีการจัดการดี",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_white_leaf",
        status: "safe",
        trend: "stable",
        affectedAreaEstimatedRai: 50,
        advisoryNote: "พื้นที่ปลูกน้อย ไม่มีรายงานโรคใบขาว",
      },
    ],
    lastSurveyDate: "14 ต.ค. 2569",
    extensionOfficePhone: "044-242061",
  },
  {
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    zone: "โซนตะวันตก-เหนือ",
    cropThreats: [
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "critical",
        trend: "increasing",
        affectedAreaEstimatedRai: 4200,
        advisoryNote: "พื้นที่สีแดง! พบการระบาดของโรคใบด่าง SLCMV หนาแน่นใน ต.ห้วยบง และ ต.หินดาด",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "high",
        trend: "increasing",
        affectedAreaEstimatedRai: 1850,
        advisoryNote: "พบหนอนกระทู้ลายจุดกัดกินยอดข้าวโพดอายุ 15-30 วัน แนะนำพ่นสไปนีโทแรมจี้กรวยยอด",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_stem_borer",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 1400,
        advisoryNote: "พบยอดตาย Dead Heart เกิน 12% ในเขตปลูกอ้อยส่งโรงงานน้ำตาลด่านขุนทด",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 320,
        advisoryNote: "เฝ้าระวังแปลงนาน้ำฝนช่วงฝนทิ้งช่วง",
      },
    ],
    lastSurveyDate: "13 ต.ค. 2569",
    extensionOfficePhone: "044-389144",
  },
  {
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    zone: "โซนตะวันออกเฉียงใต้",
    cropThreats: [
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "critical",
        trend: "stable",
        affectedAreaEstimatedRai: 5800,
        advisoryNote: "เขตเฝ้าระวังเข้มงวดสูงที่สุด มีการตั้งด่านตรวจท่อนพันธุ์มันสำปะหลังร่วมกับเกษตรอำเภอ",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "moderate",
        trend: "decreasing",
        affectedAreaEstimatedRai: 950,
        advisoryNote: "เกษตรกรปล่อยแมลงหางหนีบและพ่น BT ควบคุมได้ดีขึ้น",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_white_leaf",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 620,
        advisoryNote: "มีการเปลี่ยนมาใช้ท่อนพันธุ์สะอาดบำบัดน้ำร้อน",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "safe",
        trend: "stable",
        affectedAreaEstimatedRai: 180,
        advisoryNote: "ความชื้นเหมาะสม ยังไม่พบไหม้คอรวง",
      },
    ],
    lastSurveyDate: "12 ต.ค. 2569",
    extensionOfficePhone: "044-447185",
  },
  {
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    zone: "โซนใต้-ดงพญาเย็น",
    cropThreats: [
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "critical",
        trend: "increasing",
        affectedAreaEstimatedRai: 4900,
        advisoryNote: "ประกาศเขตพื้นที่ประสบภัยโรคใบด่างมันสำปะหลังใน ต.แชะ และ ต.จระเข้หิน",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_white_leaf",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 2100,
        advisoryNote: "พบโรคใบขาวในแปลงอ้อยตอ 2-3 แนะนำไถกลบปลูกพืชปุ๋ยสด",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_downy_mildew",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 750,
        advisoryNote: "หมอกหนาช่วงเช้า อากาศชื้นใกล้แนวเขาใหญ่",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 400,
        advisoryNote: "เฝ้าระวังนาข้าวริมลำพระเพลิง",
      },
    ],
    lastSurveyDate: "14 ต.ค. 2569",
    extensionOfficePhone: "044-444158",
  },
  {
    districtId: "phimai",
    districtNameTh: "อ.พิมาย",
    zone: "โซนอีสานกลาง-ลุ่มน้ำมูล",
    cropThreats: [
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "critical",
        trend: "increasing",
        affectedAreaEstimatedRai: 6200,
        advisoryNote: "เตือนภัยระดับสีแดง! พบโรคไหม้ข้าวหอมมะลิ 105 ระบาดรุนแรงในทุ่งสัมฤทธิ์และลุ่มน้ำมูล",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_brown_planthopper",
        status: "high",
        trend: "increasing",
        affectedAreaEstimatedRai: 3400,
        advisoryNote: "พบเพลี้ยกระโดดสีน้ำตาลสะสมตัวหนาแน่นในแปลงนาที่หว่านข้าวถี่ แนะนำเร่งไขน้ำออกแกล้งข้าว",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_stem_borer",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 1100,
        advisoryNote: "มีการปล่อยแตนเบียนทริคโคแกรมม่าคุมหนอนกอ",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cassava_root_rot",
        status: "high",
        trend: "increasing",
        affectedAreaEstimatedRai: 1350,
        advisoryNote: "พื้นที่ลุ่มต่ำริมน้ำมูลเสี่ยงหัวมันเน่าหลังฝนตกสะสม",
      },
    ],
    lastSurveyDate: "14 ต.ค. 2569",
    extensionOfficePhone: "044-471170",
  },
  {
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    zone: "โซนที่ราบสูงตะวันตก",
    cropThreats: [
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "critical",
        trend: "increasing",
        affectedAreaEstimatedRai: 3800,
        advisoryNote: "หนอนกระทู้ข้าวโพดลายจุด FAW ระบาดทุกตำบล พบเจาะเข้าทำลายทั้งยอดและฝักอ่อน",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_downy_mildew",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 1900,
        advisoryNote: "สภาพอากาศเย็นชื้นริมอุทยานแห่งชาติเขาใหญ่เอื้อต่อการงอกของสปอร์ราน้ำค้าง",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 450,
        advisoryNote: "พบประปรายใน ต.จันทึก",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "safe",
        trend: "stable",
        affectedAreaEstimatedRai: 80,
        advisoryNote: "พื้นที่ปลูกข้าวน้อย",
      },
    ],
    lastSurveyDate: "13 ต.ค. 2569",
    extensionOfficePhone: "044-311234",
  },
  {
    districtId: "chum-phuang",
    districtNameTh: "อ.ชุมพวง",
    zone: "โซนตะวันออกเฉียงเหนือ",
    cropThreats: [
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "critical",
        trend: "increasing",
        affectedAreaEstimatedRai: 4800,
        advisoryNote: "พบไหม้คอรวงในระยะตั้งท้อง-เริ่มออกรวงในข้าวหอมมะลิ 105 แนะนำพ่นไตรไซคลาโซลทันที",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_brown_planthopper",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 2900,
        advisoryNote: "พบอาการ Hopperburn เป็นหย่อมใน ต.ประสุข และ ต.ชุมพวง",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_white_leaf",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 980,
        advisoryNote: "เฝ้าระวังแปลงอ้อยตอ",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cassava_root_rot",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 1100,
        advisoryNote: "ดินระบายน้ำช้า เสี่ยงหัวมันเน่าเสียหาย",
      },
    ],
    lastSurveyDate: "14 ต.ค. 2569",
    extensionOfficePhone: "044-477123",
  },
  {
    districtId: "non-sung",
    districtNameTh: "อ.โนนสูง",
    zone: "โซนกลาง-ลุ่มน้ำมูล",
    cropThreats: [
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "high",
        trend: "increasing",
        affectedAreaEstimatedRai: 4100,
        advisoryNote: "พบแผลไหม้รูปกระสวยกระจายกว่า 35% ของพื้นที่สำรวจ",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_brown_planthopper",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 1800,
        advisoryNote: "เกษตรกรเริ่มใช้เชื้อราบิวเวอเรียควบคุม",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 620,
        advisoryNote: "พบแมลงหวี่ขาวในแปลงมันสำปะหลังเขตดอน",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "safe",
        trend: "stable",
        affectedAreaEstimatedRai: 200,
        advisoryNote: "สถานการณ์ปกติ",
      },
    ],
    lastSurveyDate: "13 ต.ค. 2569",
    extensionOfficePhone: "044-379155",
  },
  {
    districtId: "bua-yai",
    districtNameTh: "อ.บัวใหญ่",
    zone: "โซนเหนือ",
    cropThreats: [
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 3500,
        advisoryNote: "ระวังโรคไหม้คอรวงในข้าวหอมมะลิระยะสลัดเกสร",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cassava_pink_mealybug",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 820,
        advisoryNote: "พบเพลี้ยแป้งสีชมพูในพื้นที่ดินทรายจัด",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_white_leaf",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 700,
        advisoryNote: "เฝ้าระวังตามแนวเขตติดต่ออำเภอแก้งสนามนาง",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 450,
        advisoryNote: "พบหนอนกระทู้บางแปลง",
      },
    ],
    lastSurveyDate: "12 ต.ค. 2569",
    extensionOfficePhone: "044-461148",
  },
  {
    districtId: "nong-bun-mak",
    districtNameTh: "อ.หนองบุญมาก",
    zone: "โซนตะวันออกเฉียงใต้",
    cropThreats: [
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "critical",
        trend: "stable",
        affectedAreaEstimatedRai: 4100,
        advisoryNote: "พื้นที่ปลูกมันสำปะหลังหนาแน่น พบใบด่าง SLCMV เกือบทุกตำบล สั่งการตัดวงจรแมลงหวี่ขาว",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cassava_pink_mealybug",
        status: "high",
        trend: "increasing",
        affectedAreaEstimatedRai: 1950,
        advisoryNote: "อากาศแห้ง ดินทรายจัด เพลี้ยแป้งขยายพันธุ์เร็ว",
      },
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 620,
        advisoryNote: "มีการใช้กับดักกาวเหนียวช่วยลดตัวเต็มวัย",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "safe",
        trend: "stable",
        affectedAreaEstimatedRai: 110,
        advisoryNote: "พื้นที่นาดอน ปลูกข้าวน้อย",
      },
    ],
    lastSurveyDate: "13 ต.ค. 2569",
    extensionOfficePhone: "044-449120",
  },
  {
    districtId: "sikhio",
    districtNameTh: "อ.สีคิ้ว",
    zone: "โซนตะวันตก",
    cropThreats: [
      {
        cropKey: "corn",
        primaryThreatId: "corn_fall_armyworm",
        status: "critical",
        trend: "increasing",
        affectedAreaEstimatedRai: 3200,
        advisoryNote: "หนอนกระทู้ข้าวโพดลายจุดระบาดหนักในเขต ต.ลาดบัวขาว และ ต.คลองไผ่",
      },
      {
        cropKey: "cassava",
        primaryThreatId: "cmd_slcmv",
        status: "high",
        trend: "stable",
        affectedAreaEstimatedRai: 2400,
        advisoryNote: "ตรวจพบต้นใบด่างตามแนวถนนมิตรภาพสายเก่า",
      },
      {
        cropKey: "sugarcane",
        primaryThreatId: "sugarcane_stem_borer",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 850,
        advisoryNote: "หนอนกออ้อยอยู่ในเกณฑ์เฝ้าระวัง",
      },
      {
        cropKey: "rice",
        primaryThreatId: "rice_blast",
        status: "moderate",
        trend: "stable",
        affectedAreaEstimatedRai: 390,
        advisoryNote: "เฝ้าระวังนาข้าวริมอ่างเก็บน้ำซับประดู่",
      },
    ],
    lastSurveyDate: "14 ต.ค. 2569",
    extensionOfficePhone: "044-411234",
  },
];

// Helper function to get outbreak data for any of the 32 districts (falls back to calculated model based on zone & crops)
export function getDistrictPestOutbreak(
  districtId: string,
  districtNameTh: string,
  zone: string,
  primaryCrops: string[]
): DistrictPestOutbreakStatus {
  const existing = KORAT_32_DISTRICT_OUTBREAK_STATUS.find(
    (d) => d.districtId === districtId
  );
  if (existing) return existing;

  // Generate model data for remaining districts based on primary crops and zone characteristics
  const isSouthOrWest = zone.includes("ใต้") || zone.includes("ดงพญาเย็น") || zone.includes("ตะวันตก");
  const isEastOrNorth = zone.includes("อีสาน") || zone.includes("มูล") || zone.includes("เหนือ");

  const cropThreats: DistrictPestOutbreakStatus["cropThreats"] = [
    {
      cropKey: "cassava",
      primaryThreatId: "cmd_slcmv",
      status: isSouthOrWest ? "high" : "moderate",
      trend: "stable",
      affectedAreaEstimatedRai: isSouthOrWest ? 1800 : 750,
      advisoryNote: `เฝ้าระวังโรคใบด่าง SLCMV ในแปลงมันสำปะหลัง ${districtNameTh}`,
    },
    {
      cropKey: "sugarcane",
      primaryThreatId: "sugarcane_white_leaf",
      status: primaryCrops.includes("อ้อยโรงงาน") ? "moderate" : "safe",
      trend: "stable",
      affectedAreaEstimatedRai: primaryCrops.includes("อ้อยโรงงาน") ? 890 : 120,
      advisoryNote: `ตรวจคัดกรองท่อนพันธุ์อ้อยสะอาดในเขต ${districtNameTh}`,
    },
    {
      cropKey: "corn",
      primaryThreatId: "corn_fall_armyworm",
      status: primaryCrops.includes("ข้าวโพดเลี้ยงสัตว์") ? "high" : "moderate",
      trend: "increasing",
      affectedAreaEstimatedRai: primaryCrops.includes("ข้าวโพดเลี้ยงสัตว์") ? 1450 : 380,
      advisoryNote: `สุ่มตรวจกรวยยอดข้าวโพดอายุ 10-30 วัน ระวังหนอนกระทู้ลายจุด FAW`,
    },
    {
      cropKey: "rice",
      primaryThreatId: "rice_blast",
      status: isEastOrNorth ? "high" : "moderate",
      trend: "stable",
      affectedAreaEstimatedRai: isEastOrNorth ? 2600 : 650,
      advisoryNote: `ระวังโรคไหม้ใบและไหม้คอรวงข้าวหอมมะลิ 105 ช่วงปลายฝน`,
    },
  ];

  return {
    districtId,
    districtNameTh,
    zone,
    cropThreats,
    lastSurveyDate: "14 ต.ค. 2569",
    extensionOfficePhone: "044-242061",
  };
}
