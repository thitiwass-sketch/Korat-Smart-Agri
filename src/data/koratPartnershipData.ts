/**
 * Korat SmartAgri - Public-Private-People Partnership (4P) Ecosystem Data
 * Modeling real-world partnerships across Nakhon Ratchasima:
 * 1. Financial: ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส. / BAAC) & Green Ag-Credit
 * 2. Sugar Mills: โรงงานน้ำตาลครบุรี (KBS), โรงงานน้ำตาลพิมาย, โรงงานน้ำตาลด่านขุนทด
 * 3. Cassava Starch Mills: สงวนวงษ์อุตสาหกรรม, เอี่ยมบูรพา, เอี่ยมเฮง, โชคชัยสตาร์ช
 * 4. People & Cooperatives: สหกรณ์การเกษตร 32 อำเภอในจังหวัดนครราชสีมา
 */

export type PartnerCategory = "financial_baac" | "sugar_mill" | "cassava_mill" | "cooperative";

export interface PartnerEntity {
  id: string;
  nameTh: string;
  nameEn: string;
  category: PartnerCategory;
  categoryLabelTh: string;
  districtId: string;
  districtNameTh: string;
  contactPerson: string;
  phone: string;
  address: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  supportedCrops: string[];
  keyBenefitsOffered: string[];
  specialProgramTitle: string;
  specialProgramDetail: string;
  minimumComplianceScore: number;
  badgeTagTh: string;
  logoIcon: "landmark" | "factory" | "sprout" | "coins";
}

export interface BenefitOfferItem {
  id: string;
  category: PartnerCategory;
  providerNameTh: string;
  titleTh: string;
  subtitleTh: string;
  targetCropTh: string;
  benefitType: "low_interest_loan" | "price_premium" | "clean_seed" | "smart_queue" | "subsidy";
  benefitTypeValueTh: string;
  summaryValueTh: string;
  standardRateTh: string;
  smartAgriPrivilegeTh: string;
  netSavingsOrBonusEstimateTh: string;
  eligibilityCriteriaTh: string[];
  requiredComplianceScore: number;
  gradeRequired: "A+" | "A" | "B+" | "B";
  callToActionLabelTh: string;
}

export interface ComplianceCheckCriterion {
  id: string;
  pillar: string;
  titleTh: string;
  descriptionTh: string;
  weightScore: number;
  recommendationLinkModule: string;
  verificationEvidenceTh: string;
}

export const COMPLIANCE_CRITERIA_LIST: ComplianceCheckCriterion[] = [
  {
    id: "fert_soil_tailored",
    pillar: "การจัดการดินและปุ๋ยแม่นยำ (Fertilizer Precision)",
    titleTh: "ปฏิบัติตามคำแนะนำปุ๋ยสั่งตัดรายชุดดิน (SmartAgri Soil Recipe)",
    descriptionTh:
      "ลดการใช้ปุ๋ยเคมีส่วนเกิน ใช้สูตรผสมแม่ปุ๋ย N-P-K ตามผลวิเคราะห์ดินและคำแนะนำของระบบ ลดต้นทุนและลดไนเตรตตกค้างในดิน",
    weightScore: 25,
    recommendationLinkModule: "module-cost",
    verificationEvidenceTh: "ประวัติการคำนวณและบันทึกสูตรปุ๋ยสั่งตัดในระบบ SmartAgri",
  },
  {
    id: "zero_burn_cane",
    pillar: "นโยบายไม่เผาแปลงและเกษตรคาร์บอนต่ำ (Zero Burn & Low Carbon)",
    titleTh: "งดเว้นการเผาอ้อยและตอซังพืชทุกชนิด (100% Fresh Harvest)",
    descriptionTh:
      "ตัดอ้อยสดส่งโรงงาน ไม่เผาใบ ไม่เผาตอซังข้าวและซังข้าวโพด ช่วยลด PM2.5 และอนุรักษ์จุลินทรีย์หน้าดิน",
    weightScore: 25,
    recommendationLinkModule: "module-pest-alerts",
    verificationEvidenceTh: "ภาพถ่ายแปลงดาวเทียม GISTDA ไม่มีจุดความร้อน (Hotspot) ในรอบ 12 เดือน",
  },
  {
    id: "clean_seed_slcmv_free",
    pillar: "ความปลอดภัยทางชีวภาพและพันธุ์สะอาด (Biosecurity & Certified Seed)",
    titleTh: "ใช้ท่อนพันธุ์สะอาดต้านทานโรคและเฝ้าระวังโรคพืช (SLCMV/SCWL Free)",
    descriptionTh:
      "ใช้ท่อนพันธุ์มันสำปะหลังต้านทานโรคใบด่าง (กวก. 50, ห้วยบง 80, อิทธิ 1/2) หรือท่อนพันธุ์อ้อยผ่านน้ำร้อน ไม่นำเข้าท่อนพันธุ์นอกเขตควบคุม",
    weightScore: 25,
    recommendationLinkModule: "module-pest-alerts",
    verificationEvidenceTh: "บันทึกแหล่งที่มาท่อนพันธุ์และการตรวจประเมินโรคพืชผ่านคลินิกเกษตร AI",
  },
  {
    id: "spi_water_management",
    pillar: "การบริหารจัดการน้ำตามสภาพภูมิอากาศ (Climate & SPI Adaptation)",
    titleTh: "วางแผนการเพาะปลูกและระบบน้ำตามดรรชนีภัยแล้ง SPI (SPI-Guided Water)",
    descriptionTh:
      "ปรับวันหว่านปลูกตามปฏิทินอัจฉริยะ สำรองน้ำในสระประจำไร่นา และจัดสรรคิวสูบน้ำตามเกณฑ์ชลประทาน",
    weightScore: 25,
    recommendationLinkModule: "module-weather",
    verificationEvidenceTh: "การติดตามสถานีตรวจวัดอากาศและบันทึกปริมาณการใช้น้ำในแปลง",
  },
];

export const KORAT_4P_PARTNERS: PartnerEntity[] = [
  // ================= FINANCIAL: BAAC (ธ.ก.ส.) =================
  {
    id: "baac_nakhon_ratchasima",
    nameTh: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.) สำนักงานจังหวัดนครราชสีมา",
    nameEn: "BAAC Nakhon Ratchasima Provincial Office & 32 District Branches",
    category: "financial_baac",
    categoryLabelTh: "สถาบันการเงินภาครัฐ (Financial Partner)",
    districtId: "mueang-nakhon-ratchasima",
    districtNameTh: "อ.เมืองนครราชสีมา (ครอบคลุม 32 อำเภอ)",
    contactPerson: "ฝ่ายพัฒนาลูกค้าและสินเชื่อเกษตรแม่นยำ ธ.ก.ส. โคราช",
    phone: "044-243881 ต่อ 21-25 หรือ Call Center 02-555-0555",
    address: "ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000",
    coordinates: { lat: 14.9785, lon: 102.0954 },
    supportedCrops: ["มันสำปะหลัง", "อ้อยโรงงาน", "ข้าวโพดเลี้ยงสัตว์", "ข้าวหอมมะลิ 105", "ทุเรียน GI โคราช"],
    keyBenefitsOffered: [
      "สินเชื่อ SmartAgri Green Credit ดอกเบี้ยพิเศษ 2.50% - 3.25% ต่อปี (จากปกติ MRR 6.875%)",
      "วงเงินกู้เพื่อปรับปรุงระบบน้ำหยด/พลังงานแสงอาทิตย์ โซลาร์เซลล์ สูงสุด 500,000 บาทต่อราย",
      "ยกเว้นค่าธรรมเนียมวิเคราะห์โครงการสินเชื่อและอนุมัติ Fast-Track ภายใน 7 วันทำการ",
      "ส่วนลดเบี้ยประกันภัยพืชผลคุ้มครองภัยแล้งและน้ำท่วม 30%",
    ],
    specialProgramTitle: "สินเชื่อส่งเสริมเกษตรแม่นยำและเกษตรยั่งยืนโคราช (SmartAgri Credit)",
    specialProgramDetail:
      "เกษตรกรที่มีคะแนน SmartAgri Compliance Score ตั้งแต่ 75 คะแนนขึ้นไป สามารถนำใบรับรองดิจิทัลยื่นกู้ที่สาขา ธ.ก.ส. ทุกสาขาใน 32 อำเภอของโคราชได้ทันที",
    minimumComplianceScore: 75,
    badgeTagTh: "สินเชื่อดอกเบี้ยต่ำพิเศษ 2.5%",
    logoIcon: "landmark",
  },

  // ================= SUGAR MILLS (โรงงานน้ำตาล) =================
  {
    id: "mill_kbs_khonburi",
    nameTh: "บริษัท น้ำตาลครบุรี จำกัด (มหาชน) - KBS Sugar",
    nameEn: "Khonburi Sugar Public Company Limited (KBS)",
    category: "sugar_mill",
    categoryLabelTh: "โรงงานน้ำตาลทราย (Sugar Industry Partner)",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    contactPerson: "ฝ่ายส่งเสริมและพัฒนาไร่อ้อย KBS ครบุรี",
    phone: "044-444455 ต่อ 120-125",
    address: "หมู่ 10 ต.จระเข้หิน อ.ครบุรี จ.นครราชสีมา 30250",
    coordinates: { lat: 14.4821, lon: 102.2644 },
    supportedCrops: ["อ้อยโรงงาน"],
    keyBenefitsOffered: [
      "เงินเพิ่มค่าอ้อยสดไม่เผา +120 บาท/ตัน จากราคารับซื้อปกติ",
      "สินเชื่อเงินเกี๊ยวและปัจจัยการผลิต (ปุ๋ยสั่งตัด/สารกำจัดวัชพืช) อัตราดอกเบี้ย 0% วงเงิน 6,000 บาท/ไร่",
      "สนับสนุนท่อนพันธุ์อ้อยสะอาดผ่านการบำบัดน้ำร้อน 50°C ปลอดโรคใบขาว ลดราคา 50%",
      "บัตรคิวส่งอ้อยเข้าโรงงาน Smart Fast-Track Queue จองเวลาผ่านระบบ ลดเวลารถติด",
    ],
    specialProgramTitle: "โครงการอ้อยสดสร้างมูลค่า ไร้ควัน ไร้ PM2.5 (KBS Green Cane)",
    specialProgramDetail:
      "เชื่อมโยงข้อมูลแปลงอ้อยใน SmartAgri เพื่อออกใบรับรองอ้อยสดคุณภาพสูงและการตรวจวัดค่าความหวาน C.C.S. แบบเรียลไทม์",
    minimumComplianceScore: 70,
    badgeTagTh: "โบนัสอ้อยสด +120 บาท/ตัน",
    logoIcon: "factory",
  },
  {
    id: "mill_phimai_sugar",
    nameTh: "บริษัท โรงงานน้ำตาลพิมาย จำกัด (กลุ่มน้ำตาลไทย)",
    nameEn: "Phimai Sugar Mill (Thai Sugar Group)",
    category: "sugar_mill",
    categoryLabelTh: "โรงงานน้ำตาลทราย (Sugar Industry Partner)",
    districtId: "phimai",
    districtNameTh: "อ.พิมาย",
    contactPerson: "แผนกสนับสนุนชาวไร่และวิชาการอ้อยพิมาย",
    phone: "044-471555",
    address: "ต.รังกาใหญ่ อ.พิมาย จ.นครราชสีมา 30110",
    coordinates: { lat: 15.2214, lon: 102.4922 },
    supportedCrops: ["อ้อยโรงงาน"],
    keyBenefitsOffered: [
      "โบนัสอ้อยสดตัดสะอาดไม่เผา +120 บาท/ตัน",
      "โบนัสค่าความหวานพิเศษ C.C.S. สูงกว่า 12 เพิ่มตันละ 85 บาท ต่อ 1 หน่วย C.C.S.",
      "แจกแตนเบียนทริคโคแกรมม่าคุมหนอนกออ้อยฟรีตลอดฤดูกาล",
      "บริการรถตัดอ้อยสดอัตราค่าบริการพิเศษสำหรับสมาชิก SmartAgri",
    ],
    specialProgramTitle: "พิมายโมเดล: อ้อยยั่งยืนทุ่งสัมฤทธิ์",
    specialProgramDetail:
      "สนับสนุนเครื่องจักรกลเกษตรและคิวหีบอัจฉริยะสำหรับเกษตรกรในลุ่มน้ำมูล-ทุ่งสัมฤทธิ์",
    minimumComplianceScore: 70,
    badgeTagTh: "โบนัสอ้อยสด + รถตัดอ้อยคิวพิเศษ",
    logoIcon: "factory",
  },
  {
    id: "mill_dankhunthot_sugar",
    nameTh: "บริษัท อุตสาหกรรมน้ำตาลโคราช จำกัด (โรงงานด่านขุนทด)",
    nameEn: "Korat Sugar Industry Mill (Dan Khun Thot)",
    category: "sugar_mill",
    categoryLabelTh: "โรงงานน้ำตาลทราย (Sugar Industry Partner)",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    contactPerson: "ฝ่ายไร่อ้อยสัมพันธ์และสินเชื่อส่งเสริม",
    phone: "044-389333",
    address: "ต.หินดาด อ.ด่านขุนทด จ.นครราชสีมา 30210",
    coordinates: { lat: 15.2012, lon: 101.7645 },
    supportedCrops: ["อ้อยโรงงาน"],
    keyBenefitsOffered: [
      "เงินชดเชยค่าตัดอ้อยสด +120 บาท/ตัน",
      "สินเชื่อปลอดดอกเบี้ยจัดซื้อท่อนพันธุ์สะอาดบำบัดน้ำร้อนและปรับปรุงดินด้วยกากตะกอนหม้อกรอง (Filter Cake)",
      "แอปพลิเคชันแจ้งเตือนคิวส่งอ้อยหน้าโรงงาน",
    ],
    specialProgramTitle: "อ้อยรักษ์โลกด่านขุนทด (Clean Energy Cane)",
    specialProgramDetail:
      "บูรณาการข้อมูลภัยแล้ง SPI เพื่อวางแผนส่งน้ำเสริมจากสระเก็บน้ำของโรงงานสู่แปลงอ้อยสมาชิก",
    minimumComplianceScore: 70,
    badgeTagTh: "สินเชื่อปรับปรุงดิน 0% + โบนัสอ้อยสด",
    logoIcon: "factory",
  },

  // ================= CASSAVA STARCH MILLS (โรงงานแป้งมันสำปะหลัง) =================
  {
    id: "mill_sanguanwongse_swi",
    nameTh: "บริษัท สงวนวงษ์อุตสาหกรรม จำกัด (SWI Starch) - โรงงานแป้งมันใหญ่ที่สุดในเอเชีย",
    nameEn: "Sanguan Wongse Industries Co., Ltd. (SWI)",
    category: "cassava_mill",
    categoryLabelTh: "โรงงานแป้งมันสำปะหลัง (Cassava Starch Partner)",
    districtId: "mueang-nakhon-ratchasima",
    districtNameTh: "อ.เมืองนครราชสีมา",
    contactPerson: "ฝ่ายรับซื้อมันสำปะหลังและส่งเสริมเกษตรกรแปลงใหญ่ SWI",
    phone: "044-245455",
    address: "ถ.มิตรภาพ ต.หนองบัวศาลา อ.เมือง จ.นครราชสีมา 30000",
    coordinates: { lat: 14.9355, lon: 102.1388 },
    supportedCrops: ["มันสำปะหลัง"],
    keyBenefitsOffered: [
      "รับประกันราคาบวกเพิ่มสำหรับมันสำปะหลังแป้งสูง (Starch Premium): แป้ง 28-29% +0.15 บาท/กก. (+150 บ./ตัน), แป้ง ≥ 30% +0.30 บาท/กก. (+300 บ./ตัน)",
      "เครื่องวัดเปอร์เซ็นต์แป้งระบบดิจิทัลอ่านค่าโปร่งใส บันทึกผลเข้าสมาร์ทโฟนเกษตรกรทันที",
      "โครงการกระจายท่อนพันธุ์ต้านทานโรคใบด่าง SLCMV (กวก. 50 / อิทธิ 1/2) ราคาสวัสดิการสมาชิก",
      "คิวเทมันสำปะหลังด่วนพิเศษ Fast-Track Lane สำหรับรถบรรทุกที่ติดบัตร SmartAgri",
    ],
    specialProgramTitle: "SWI Premium Starch & SLCMV Resilience Network",
    specialProgramDetail:
      "ให้โบนัสพิเศษและจัดสรรท่อนพันธุ์สะอาดต้านทานโรคใบด่างแก่มันสำปะหลังที่จัดการแปลงตามปุ๋ยสั่งตัด SmartAgri",
    minimumComplianceScore: 75,
    badgeTagTh: "โบนัสแป้งสูง +300 บาท/ตัน",
    logoIcon: "factory",
  },
  {
    id: "mill_eiamburapa_soengsang",
    nameTh: "บริษัท เอี่ยมบูรพา จำกัด (กลุ่มบริษัท อุบลเอี่ยม / เครือเอี่ยมเฮง)",
    nameEn: "Eiam Burapa Cassava Starch (Eiam Heng Group)",
    category: "cassava_mill",
    categoryLabelTh: "โรงงานแป้งมันสำปะหลัง (Cassava Starch Partner)",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    contactPerson: "ศูนย์วิจัยและพัฒนาวัตถุดิบมันสำปะหลังเอี่ยมบูรพา",
    phone: "044-447555",
    address: "ต.กุดโบสถ์ อ.เสิงสาง จ.นครราชสีมา 30130",
    coordinates: { lat: 14.4125, lon: 102.4588 },
    supportedCrops: ["มันสำปะหลัง"],
    keyBenefitsOffered: [
      "โบนัสเปอร์เซ็นต์แป้งสูง +150 ถึง +300 บาท/ตัน",
      "แจกจ่ายแตนเบียน Anagyrus lopezi กำจัดเพลี้ยแป้งสีชมพูฟรี",
      "สนับสนุนเงินล่วงหน้าเพื่อจัดซื้อแม่ปุ๋ย 46-0-0, 18-46-0, 0-0-60 ผสมปุ๋ยสั่งตัด",
      "จุดตรวจสอบท่อนพันธุ์ปลอดโรค SLCMV ด้วยชุดทดสอบ Strip Test รวดเร็ว 15 นาที",
    ],
    specialProgramTitle: "เสิงสางโมเดล: มันสำปะหลังคุณภาพและปลอดภัยจากใบด่าง",
    specialProgramDetail:
      "ร่วมมือกับกลุ่มแปลงใหญ่มันสำปะหลังเสิงสางและครบุรี สร้างแปลงพันธุ์สะอาดต้านทานโรค 10,000 ไร่",
    minimumComplianceScore: 75,
    badgeTagTh: "สนับสนุนแม่ปุ๋ย 0% + โบนัสแป้ง",
    logoIcon: "factory",
  },
  {
    id: "mill_chokchai_starch",
    nameTh: "บริษัท โคราชแป้งมัน จำกัด (โรงงานโชคชัย)",
    nameEn: "Korat Starch Mill (Chok Chai)",
    category: "cassava_mill",
    categoryLabelTh: "โรงงานแป้งมันสำปะหลัง (Cassava Starch Partner)",
    districtId: "chok-chai",
    districtNameTh: "อ.โชคชัย",
    contactPerson: "ฝ่ายจัดซื้อวัตถุดิบและเกษตรสัมพันธ์โชคชัย",
    phone: "044-491222",
    address: "ต.ท่าเยี่ยม อ.โชคชัย จ.นครราชสีมา 30190",
    coordinates: { lat: 14.7355, lon: 102.1644 },
    supportedCrops: ["มันสำปะหลัง"],
    keyBenefitsOffered: [
      "โบนัสราคาหัวมันสดตามเกรดความสะอาดและสิ่งเจือปนต่ำ (<3%) บวกเพิ่ม +50 บาท/ตัน",
      "โบนัสเปอร์เซ็นต์แป้งสูง ≥ 28% บวกเพิ่ม +200 บาท/ตัน",
      "สิทธิประโยชน์ชั่งน้ำหนักรถบรรทุกระบบดิจิทัลอัตโนมัติ ไม่ต้องลงจากรถ",
    ],
    specialProgramTitle: "โชคชัยโมเดล: มันสะอาด แป้งสูง ดินยั่งยืน",
    specialProgramDetail:
      "ส่งเสริมการปรับปรุงดินด้วยกากแป้งมันสำปะหลังหมักปรับปรุงโครงสร้างดินทรายโคราช",
    minimumComplianceScore: 70,
    badgeTagTh: "โบนัสสิ่งเจือปนต่ำ + แป้งสูง",
    logoIcon: "factory",
  },
];

export const KORAT_4P_BENEFIT_OFFERS: BenefitOfferItem[] = [
  {
    id: "offer_baac_green_credit",
    category: "financial_baac",
    providerNameTh: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)",
    titleTh: "สินเชื่อเกษตรอัจฉริยะสีเขียว (SmartAgri Green Credit)",
    subtitleTh: "อัตราดอกเบี้ยต่ำพิเศษ 2.50% ต่อปี สนับสนุนเกษตรกรผู้ปฏิบัติตามเกณฑ์ SmartAgri",
    targetCropTh: "ครอบคลุมพืชเศรษฐกิจทุกชนิด (มันสำปะหลัง, อ้อย, ข้าวโพด, ข้าวหอมมะลิ, ไม้ผล)",
    benefitType: "low_interest_loan",
    benefitTypeValueTh: "สินเชื่อดอกเบี้ยต่ำ 2.50% ต่อปี",
    summaryValueTh: "ดอกเบี้ย 2.50% (ประหยัดได้ 43,750 บ./ปี ต่อยอดกู้ 1 ล้านบาท)",
    standardRateTh: "อัตราปกติ MRR = 6.875% ต่อปี",
    smartAgriPrivilegeTh: "อัตราพิเศษ SmartAgri = 2.50% ต่อปี (ลดลง 4.375%)",
    netSavingsOrBonusEstimateTh: "ประหยัดดอกเบี้ยเฉลี่ย 13,125 – 43,750 บาท/ปี",
    eligibilityCriteriaTh: [
      "มีคะแนน SmartAgri Compliance Score ≥ 75 คะแนน (เกรด A ขึ้นไป)",
      "มีประวัติการใช้ปุ๋ยสั่งตัดหรือวางแผนการเพาะปลูกตามดรรชนีภัยแล้ง SPI ในระบบ SmartAgri",
      "ไม่มีประวัติการเผาแปลงในรอบ 12 เดือนที่ผ่านมา (ผ่านการตรวจ Hotspot)",
    ],
    requiredComplianceScore: 75,
    gradeRequired: "A",
    callToActionLabelTh: "ยื่นขอรับสิทธิ์สินเชื่อ ธ.ก.ส. 2.5%",
  },
  {
    id: "offer_sugar_green_cane",
    category: "sugar_mill",
    providerNameTh: "กลุ่มพันธมิตรโรงงานน้ำตาลโคราช (KBS, พิมาย, ด่านขุนทด)",
    titleTh: "สิทธิประโยชน์อ้อยสดคุณภาพสูง & ท่อนพันธุ์ปลอดโรค (Fresh Cane Premium)",
    subtitleTh: "โบนัสเงินเพิ่ม +120 บาท/ตัน + คิวส่งอ้อยด่วนพิเศษ + ท่อนพันธุ์บำบัดน้ำร้อน",
    targetCropTh: "อ้อยโรงงาน (Sugarcane)",
    benefitType: "price_premium",
    benefitTypeValueTh: "โบนัสเงินสด +120 บาท/ตัน",
    summaryValueTh: "+120 บ./ตัน (เฉลี่ยเพิ่มรายได้ 1,440 บ./ไร่ ที่ผลผลิต 12 ตัน/ไร่)",
    standardRateTh: "ราคาอ้อยปกติ (หักค่าปรับอ้อยไฟไหม้ 30 บาท/ตัน)",
    smartAgriPrivilegeTh: "โบนัสอ้อยสด +120 บาท/ตัน + สิทธิยืมเงินเกี๊ยวดอกเบี้ย 0% 6,000 บ./ไร่",
    netSavingsOrBonusEstimateTh: "เพิ่มรายได้สุทธิ 28,800 บาท ต่อแปลง 20 ไร่",
    eligibilityCriteriaTh: [
      "ไม่เผาอ้อยก่อนตัด (100% Green Cane)",
      "มีคะแนน SmartAgri Compliance Score ≥ 70 คะแนน",
      "ลงทะเบียนแปลงและจองคิวส่งอ้อยล่วงหน้าในระบบ Smart Fast-Track",
    ],
    requiredComplianceScore: 70,
    gradeRequired: "B+",
    callToActionLabelTh: "ลงทะเบียนโควตาอ้อยสด +120 บ./ตัน",
  },
  {
    id: "offer_cassava_starch_bonus",
    category: "cassava_mill",
    providerNameTh: "กลุ่มพันธมิตรโรงงานแป้งมันสำปะหลังโคราช (SWI สงวนวงษ์, เอี่ยมบูรพา, โชคชัย)",
    titleTh: "สิทธิประโยชน์หัวมันแป้งสูง & ท่อนพันธุ์ต้านทาน SLCMV (High-Starch Premium)",
    subtitleTh: "โบนัสเปอร์เซ็นต์แป้งสูงสุด +300 บาท/ตัน + แจกจ่ายท่อนพันธุ์ต้านทานโรคใบด่าง",
    targetCropTh: "มันสำปะหลัง (Cassava)",
    benefitType: "price_premium",
    benefitTypeValueTh: "โบนัสแป้งสูง +150 ถึง +300 บาท/ตัน",
    summaryValueTh: "+300 บ./ตัน (เพิ่มรายได้เฉลี่ย 1,200 บ./ไร่ ที่ผลผลิต 4 ตัน/ไร่)",
    standardRateTh: "ราคารับซื้อทั่วไป (แป้งเฉลี่ย 25%)",
    smartAgriPrivilegeTh: "แป้ง ≥ 28% +150 บ./ตัน, แป้ง ≥ 30% +300 บ./ตัน + รับสิทธิ์ท่อนพันธุ์ กวก.50 สะอาด",
    netSavingsOrBonusEstimateTh: "เพิ่มรายได้สุทธิ 24,000 บาท ต่อแปลง 20 ไร่",
    eligibilityCriteriaTh: [
      "ปฏิบัติตามคำแนะนำปุ๋ยสั่งตัด SmartAgri สูตรเร่งแป้ง (เน้นโพแทสเซียม 0-0-60 ช่วง 6-8 เดือน)",
      "มีคะแนน SmartAgri Compliance Score ≥ 75 คะแนน",
      "ผ่านการตรวจประเมินโรคใบด่าง SLCMV ในแปลง",
    ],
    requiredComplianceScore: 75,
    gradeRequired: "A",
    callToActionLabelTh: "ลงทะเบียนรับโบนัสแป้งมันสำปะหลัง",
  },
];
