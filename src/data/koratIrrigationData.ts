export interface KoratIrrigationCanalLine {
  id: string;
  code: string;
  nameTh: string;
  basinNameTh: string;
  sourceDamOrRiverTh: string;
  districtIds: string[];
  districtsCoveredTh: string;
  lengthKm: number;
  maxFlowM3s: number;
  currentFlowM3s: number;
  waterLevelPct: number;
  rotationScheduleTh: string;
  status: "ส่งน้ำตามรอบเวรปกติ" | "จัดสรรน้ำหมุนเวียนเข้มงวด" | "เฝ้าระวังระดับน้ำต่ำ-สูบเสริม";
  colorHex: string;
  coords: [number, number][];
}

export interface KoratWaterSourceNode {
  id: string;
  code: string;
  nameTh: string;
  sourceType: "sluice_gate" | "electric_pump" | "groundwater_solar" | "retention_monkey_cheek";
  sourceTypeLabelTh: string;
  districtId: string;
  districtNameTh: string;
  lat: number;
  lon: number;
  storageOrCapacityText: string;
  usablePct: number;
  dailyQuotaM3PerRai: number;
  rotationSlotText: string;
  userGroupNameTh: string;
  activeFarmersCount: number;
  coordinationStatus: "พร้อมจ่ายน้ำ" | "สลับรอบเวรต้นน้ำ-ปลายน้ำ" | "สงวนน้ำเพื่อพยุงพืชหลัก";
}

export const KORAT_IRRIGATION_CANALS: KoratIrrigationCanalLine[] = [
  {
    id: "canal-lam-takhong-lmc",
    code: "LMC-LTK-01",
    nameTh: "คลองส่งน้ำสายใหญ่ฝั่งซ้าย ลำตะคอง–สีคิ้ว–สูงเนิน–เมืองโคราช",
    basinNameTh: "โครงการส่งน้ำและบำรุงรักษาลำตะคอง",
    sourceDamOrRiverTh: "เขื่อนลำตะคอง",
    districtIds: [
      "pak-chong",
      "sikhio",
      "sung-noen",
      "kham-thale-so",
      "mueang-korat",
      "chaloem-phra-kiat",
    ],
    districtsCoveredTh: "สีคิ้ว · สูงเนิน · ขามทะเลสอ · เมืองนครราชสีมา · เฉลิมพระเกียรติ",
    lengthKm: 64.5,
    maxFlowM3s: 16.0,
    currentFlowM3s: 9.8,
    waterLevelPct: 62,
    rotationScheduleTh: "จันทร์–พุธ (โซนต้นน้ำ สีคิ้ว-สูงเนิน) / พฤหัส–เสาร์ (โซนปลายน้ำ เมือง-เฉลิมพระเกียรติ)",
    status: "จัดสรรน้ำหมุนเวียนเข้มงวด",
    colorHex: "#38BDF8",
    coords: [
      [14.865, 101.565],
      [14.895, 101.725],
      [14.902, 101.835],
      [14.958, 101.965],
      [14.982, 102.115],
      [15.012, 102.275],
    ],
  },
  {
    id: "canal-thung-samrit-phimai",
    code: "RMC-PMY-02",
    nameTh: "คลองส่งน้ำสายใหญ่ทุ่งสัมฤทธิ์ (เขื่อนพิมาย–ชุมพวง)",
    basinNameTh: "โครงการส่งน้ำและบำรุงรักษาทุ่งสัมฤทธิ์",
    sourceDamOrRiverTh: "เขื่อนระบายน้ำพิมาย & แม่น้ำมูล",
    districtIds: ["non-sung", "phimai", "chumphuang", "chakkarat", "mueang-yang"],
    districtsCoveredTh: "โนนสูง · พิมาย · ชุมพวง · จักราช · เมืองยาง",
    lengthKm: 72.0,
    maxFlowM3s: 22.5,
    currentFlowM3s: 15.4,
    waterLevelPct: 71,
    rotationScheduleTh: "ส่งน้ำต่อเนื่องสำหรับนาข้าวหอมมะลิ GI (สลับคลองซอย 1–12 รอบละ 4 วัน)",
    status: "ส่งน้ำตามรอบเวรปกติ",
    colorHex: "#2DD4BF",
    coords: [
      [15.165, 102.245],
      [15.222, 102.492],
      [15.285, 102.625],
      [15.348, 102.742],
      [15.415, 102.865],
    ],
  },
  {
    id: "canal-lam-phra-phloeng",
    code: "LMC-LPP-03",
    nameTh: "คลองส่งน้ำสายใหญ่ลำพระเพลิง (ปักธงชัย–โชคชัย)",
    basinNameTh: "โครงการส่งน้ำและบำรุงรักษาลำพระเพลิง",
    sourceDamOrRiverTh: "เขื่อนลำพระเพลิง",
    districtIds: ["wang-nam-khiao", "pak-thong-chai", "chok-chai", "chakkarat"],
    districtsCoveredTh: "วังน้ำเขียว · ปักธงชัย · โชคชัย · จักราช",
    lengthKm: 58.2,
    maxFlowM3s: 14.5,
    currentFlowM3s: 10.6,
    waterLevelPct: 74,
    rotationScheduleTh: "อังคาร–ศุกร์ (คลองสายใหญ่ฝั่งซ้าย ปักธงชัย) / เสาร์–จันทร์ (ฝั่งขวา โชคชัย)",
    status: "ส่งน้ำตามรอบเวรปกติ",
    colorHex: "#10B981",
    coords: [
      [14.588, 101.842],
      [14.685, 101.985],
      [14.728, 102.165],
      [14.845, 102.285],
    ],
  },
  {
    id: "canal-mun-bon-lam-chae",
    code: "LMC-MBLC-04",
    nameTh: "โครงข่ายคลองส่งน้ำมูลบน–ลำแชะ–ลำปลายมาศ (โซนใต้)",
    basinNameTh: "โครงการส่งน้ำและบำรุงรักษามูลบน–ลำแชะ",
    sourceDamOrRiverTh: "เขื่อนมูลบน & เขื่อนลำแชะ",
    districtIds: ["khon-buri", "soeng-sang", "nong-bun-mak", "chok-chai", "huai-แถลง"],
    districtsCoveredTh: "ครบุรี · เสิงสาง · หนองบุญมาก · โชคชัย",
    lengthKm: 69.0,
    maxFlowM3s: 18.0,
    currentFlowM3s: 13.8,
    waterLevelPct: 78,
    rotationScheduleTh: "ส่งน้ำเสริมสวนผลไม้ GI และแปลงมันสำปะหลัง-อ้อย (ทุกวันจันทร์, พุธ, ศุกร์)",
    status: "ส่งน้ำตามรอบเวรปกติ",
    colorHex: "#34D399",
    coords: [
      [14.455, 102.185],
      [14.525, 102.255],
      [14.645, 102.315],
      [14.735, 102.375],
      [14.435, 102.455],
    ],
  },
  {
    id: "canal-lam-chiang-krai-drought",
    code: "DRT-LCK-05",
    nameTh: "คลองผันน้ำลำเชียงไกร–ด่านขุนทด–โนนไทย–คง–บัวใหญ่ (เขตเฝ้าระวังแล้ง)",
    basinNameTh: "โครงการชลประทานลุ่มน้ำลำเชียงไกร & สูบน้ำพลังงานแสงอาทิตย์",
    sourceDamOrRiverTh: "อ่างเก็บน้ำลำเชียงไกร (ตอนบน/ตอนล่าง) & บ่อบาดาลแปลงใหญ่",
    districtIds: [
      "dan-khun-thot",
      "thepharak",
      "non-thai",
      "phra-thong-kham",
      "khong",
      "bua-yai",
      "ban-lueam",
      "แก้งสนามนาง",
    ],
    districtsCoveredTh: "ด่านขุนทด · โนนไทย · พระทองคำ · คง · บัวใหญ่ · บ้านเหลื่อม",
    lengthKm: 84.0,
    maxFlowM3s: 9.5,
    currentFlowM3s: 3.9,
    waterLevelPct: 39,
    rotationScheduleTh: "หมุนเวียนสูบน้ำเคร่งครัด: โซน A (จ.–อ.) / โซน B (พ.–พฤ.) / โซน C (ศ.–ส.) งดปล่อยน้ำท่วมแปลง",
    status: "เฝ้าระวังระดับน้ำต่ำ-สูบเสริม",
    colorHex: "#F59E0B",
    coords: [
      [15.208, 101.768],
      [15.185, 101.985],
      [15.198, 102.165],
      [15.365, 102.285],
      [15.582, 102.425],
    ],
  },
];

export const KORAT_WATER_SOURCE_NODES: KoratWaterSourceNode[] = [
  {
    id: "ws-dkt-solar-01",
    code: "WUG-DKT01",
    nameTh: "สถานีสูบน้ำด้วยไฟฟ้าและโซลาร์เซลล์แปลงใหญ่ ต.หนองบัวตะเกียด",
    sourceType: "groundwater_solar",
    sourceTypeLabelTh: "บ่อบาดาลโซลาร์เซลล์ & แก้มลิง",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    lat: 15.235,
    lon: 101.812,
    storageOrCapacityText: "กำลังสูบ 450 ลบ.ม./วัน · ถังสูงสำรอง 1,200 ลบ.ม.",
    usablePct: 48,
    dailyQuotaM3PerRai: 12,
    rotationSlotText: "รอบเช้า 06:00–10:00 น. (หมู่ 1-4) / รอบบ่าย 15:00–18:30 น. (หมู่ 5-8)",
    userGroupNameTh: "กลุ่มผู้ใช้น้ำมันสำปะหลัง-ข้าวโพดระบบน้ำหยด ด่านขุนทด",
    activeFarmersCount: 142,
    coordinationStatus: "สลับรอบเวรต้นน้ำ-ปลายน้ำ",
  },
  {
    id: "ws-sikhio-gate-02",
    code: "WUG-SKO02",
    nameTh: "ประตูระบายน้ำคลองส่งน้ำสายใหญ่ลำตะคอง กม.18 (สีคิ้ว–สูงเนิน)",
    sourceType: "sluice_gate",
    sourceTypeLabelTh: "ประตูระบายน้ำชลประทาน",
    districtId: "sikhio",
    districtNameTh: "อ.สีคิ้ว",
    lat: 14.912,
    lon: 101.695,
    storageOrCapacityText: "อัตราการไหลผ่านบานประตู 6.8 ลบ.ม./วินาที",
    usablePct: 63,
    dailyQuotaM3PerRai: 18,
    rotationSlotText: "เปิดบานประตู จันทร์ 06:00 น. – พุธ 18:00 น. ของทุกสัปดาห์",
    userGroupNameTh: "สหพันธ์กลุ่มผู้ใช้น้ำคลองซอย 1L–6L ลำตะคอง",
    activeFarmersCount: 310,
    coordinationStatus: "พร้อมจ่ายน้ำ",
  },
  {
    id: "ws-phimai-barrage-03",
    code: "WUG-PMY03",
    nameTh: "เขื่อนระบายน้ำพิมาย & สถานีสูบน้ำคลองสายใหญ่ทุ่งสัมฤทธิ์",
    sourceType: "sluice_gate",
    sourceTypeLabelTh: "เขื่อนระบายน้ำและคลองส่งน้ำหลัก",
    districtId: "phimai",
    districtNameTh: "อ.พิมาย",
    lat: 15.215,
    lon: 102.485,
    storageOrCapacityText: "ระดับน้ำเหนือเขื่อน 74% · ส่งน้ำเข้าคลองสายใหญ่ 14.2 ลบ.ม./วิ",
    usablePct: 74,
    dailyQuotaM3PerRai: 24,
    rotationSlotText: "ส่งน้ำหมุนเวียนคลองซอยโซนเหนือ (จ.–พฤ.) และโซนใต้ (ศ.–อา.)",
    userGroupNameTh: "กลุ่มผู้ใช้น้ำนาแปลงใหญ่ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI",
    activeFarmersCount: 520,
    coordinationStatus: "พร้อมจ่ายน้ำ",
  },
  {
    id: "ws-khonburi-pump-04",
    code: "WUG-KBR04",
    nameTh: "สถานีสูบน้ำและท่อส่งน้ำแรงดันสูง เขื่อนลำแชะ–โคกกระชาย",
    sourceType: "electric_pump",
    sourceTypeLabelTh: "สถานีสูบน้ำไฟฟ้าแรงดันสูง",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    lat: 14.465,
    lon: 102.215,
    storageOrCapacityText: "น้ำใช้การได้ 78% · ท่อส่งน้ำหลักสำหรับสวนทุเรียน-เงาะและไร่อ้อย",
    usablePct: 78,
    dailyQuotaM3PerRai: 22,
    rotationSlotText: "จ่ายน้ำทุกวัน อังคาร, พฤหัสบดี, เสาร์ และอาทิตย์ (05:30–19:00 น.)",
    userGroupNameTh: "กลุ่มผู้ใช้น้ำไม้ผลเศรษฐกิจและพืชไร่ อ.ครบุรี",
    activeFarmersCount: 245,
    coordinationStatus: "พร้อมจ่ายน้ำ",
  },
  {
    id: "ws-pakchong-cheek-05",
    code: "WUG-PCK05",
    nameTh: "อ่างเก็บน้ำแก้มลิงและระบบกระจายน้ำหยด คลองม่วง–ปากช่อง",
    sourceType: "retention_monkey_cheek",
    sourceTypeLabelTh: "แก้มลิงชุมชน & ท่อส่งน้ำสวนผลไม้ GI",
    districtId: "pak-chong",
    districtNameTh: "อ.ปากช่อง",
    lat: 14.642,
    lon: 101.498,
    storageOrCapacityText: "ความจุแก้มลิง 3.8 ล้าน ลบ.ม. (ระดับน้ำปัจจุบัน 76%)",
    usablePct: 76,
    dailyQuotaM3PerRai: 20,
    rotationSlotText: "จ่ายน้ำผ่านมิเตอร์กลุ่มผู้ใช้น้ำสวนทุเรียน GI (รอบเช้า 06:00–11:00 น.)",
    userGroupNameTh: "วิสาหกิจผู้ใช้น้ำสวนทุเรียน-มังคุด ปากช่อง-เขาใหญ่",
    activeFarmersCount: 168,
    coordinationStatus: "พร้อมจ่ายน้ำ",
  },
  {
    id: "ws-buayai-solar-06",
    code: "WUG-BYI06",
    nameTh: "ธนาคารน้ำใต้ดินและสถานีสูบน้ำพลังงานแสงอาทิตย์ บัวใหญ่–คง",
    sourceType: "groundwater_solar",
    sourceTypeLabelTh: "ธนาคารน้ำใต้ดิน & บาดาลโซลาร์เซลล์",
    districtId: "bua-yai",
    districtNameTh: "อ.บัวใหญ่",
    lat: 15.575,
    lon: 102.418,
    storageOrCapacityText: "บ่อบาดาลความลึก 85 ม. จำนวน 6 บ่อพ่วง · สำรองน้ำหอสูง 900 ลบ.ม.",
    usablePct: 44,
    dailyQuotaM3PerRai: 10,
    rotationSlotText: "จำกัดโควตาใช้น้ำเฉพาะระบบน้ำหยด/มินิสปริงเกลอร์ (จองคิวล่วงหน้า 24 ชม.)",
    userGroupNameTh: "กลุ่มบริหารจัดการน้ำภัยแล้ง โซนเหนือ บัวใหญ่–คง",
    activeFarmersCount: 195,
    coordinationStatus: "สงวนน้ำเพื่อพยุงพืชหลัก",
  },
];
