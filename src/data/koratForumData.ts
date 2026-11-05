/**
 * Korat SmartAgri - Community Forum Data Models & Seeded Discussions
 * Covering all 32 districts with real-world agricultural queries:
 * cassava mosaic virus, sugarcane green harvesting, jasmine rice fertilizer,
 * drought management, BAAC 2.5% green credit, and GI fruit care.
 */

export type ForumCategoryKey =
  | "all"
  | "rice"
  | "cassava"
  | "sugarcane"
  | "corn"
  | "fruit"
  | "water_irrigation"
  | "fertilizer_soil"
  | "partnership_credit"
  | "machinery"
  | "general";

export type ForumPostType =
  | "question"
  | "advice"
  | "discussion"
  | "official_notice";

export type AuthorRole =
  | "farmer"
  | "smart_farmer"
  | "coop_leader"
  | "agri_officer"
  | "moderator";

export interface ForumReplyItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: AuthorRole;
  authorDistrict: string;
  content: string;
  likesCount: number;
  likedBy?: string[];
  isExpertAnswer: boolean;
  isFlagged: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPostItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: AuthorRole;
  districtId: string;
  districtNameTh: string;
  category: ForumCategoryKey;
  categoryNameTh: string;
  postType: ForumPostType;
  cropTag: string;
  title: string;
  content: string;
  likesCount: number;
  likedBy?: string[];
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  moderationStatus: "active" | "flagged" | "hidden";
  reportCount: number;
  reportReasons?: string[];
  moderatorNote?: string;
  createdAt: string;
  updatedAt: string;
  replies?: ForumReplyItem[];
}

export interface ForumCategoryMeta {
  key: ForumCategoryKey;
  labelTh: string;
  descriptionTh: string;
  badgeColor: string;
  iconName: string;
}

export const FORUM_CATEGORIES: ForumCategoryMeta[] = [
  {
    key: "all",
    labelTh: "ทั้งหมดทุกหัวข้อ",
    descriptionTh: "กระทู้และคำถามจากเกษตรกรครบทุกกลุ่มพืชและ 32 อำเภอ",
    badgeColor: "bg-slate-800 text-slate-200 border-slate-700",
    iconName: "Layers",
  },
  {
    key: "cassava",
    labelTh: "มันสำปะหลัง & SLCMV",
    descriptionTh: "โรคใบด่าง เพลี้ยแป้ง ท่อนพันธุ์สะอาด และราคาแป้งมัน",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    iconName: "Sparkles",
  },
  {
    key: "sugarcane",
    labelTh: "อ้อยโรงงาน & ตัดอ้อยสด",
    descriptionTh: "โบนัสอ้อยสด +120 บ./ตัน งดเผาแปลง และคิวโรงงาน KBS/พิมาย",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    iconName: "Sprout",
  },
  {
    key: "rice",
    labelTh: "ข้าวหอมมะลิทุ่งสัมฤทธิ์",
    descriptionTh: "ข้าว GI พิมาย/ชุมพวง การจัดการน้ำ และโรคไหม้ข้าว",
    badgeColor: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    iconName: "Wheat",
  },
  {
    key: "corn",
    labelTh: "ข้าวโพดเลี้ยงสัตว์ & FAW",
    descriptionTh: "หนอนกระทู้ลายจุด จังหวะปลูก และจุดคุ้มทุนปากช่อง/ด่านขุนทด",
    badgeColor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    iconName: "Bug",
  },
  {
    key: "fruit",
    labelTh: "ไม้ผลพรีเมียม GI",
    descriptionTh: "ทุเรียนต้นน้ำมูลครบุรี เงาะ มังคุด และเทคนิคให้น้ำ",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    iconName: "Apple",
  },
  {
    key: "water_irrigation",
    labelTh: "บริหารน้ำ & ภัยแล้ง SPI",
    descriptionTh: "คิวสูบน้ำชลประทาน สระประจำไร่นา และดรรชนี SPI-30d",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    iconName: "Droplets",
  },
  {
    key: "fertilizer_soil",
    labelTh: "ปุ๋ยสั่งตัด & ชุดดินโคราช",
    descriptionTh: "สูตรผสมแม่ปุ๋ย 46-0-0/18-46-0/0-0-60 ลดต้นทุนต่อไร่",
    badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    iconName: "FlaskConical",
  },
  {
    key: "partnership_credit",
    labelTh: "พันธมิตร 4P & สินเชื่อ ธ.ก.ส.",
    descriptionTh: "สินเชื่อดอกเบี้ยต่ำ 2.5%, โควตาโรงงาน และสิทธิประโยชน์",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    iconName: "Handshake",
  },
  {
    key: "machinery",
    labelTh: "เครื่องจักร & โดรนเกษตร",
    descriptionTh: "บริการรถตัดอ้อย โดรนพ่นชีวภัณฑ์ และเครื่องหยอดเมล็ด",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    iconName: "Tractor",
  },
  {
    key: "general",
    labelTh: "เสวนาทั่วไป & สหกรณ์",
    descriptionTh: "แลกเปลี่ยนข่าวสาร ราคากลาง และประกาศสำนักงานเกษตร",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    iconName: "MessageCircle",
  },
];

export const AUTHOR_ROLE_BADGES: Record<
  AuthorRole,
  { labelTh: string; colorClass: string; iconName?: string }
> = {
  moderator: {
    labelTh: "ผู้ดูแลระบบ SmartAgri",
    colorClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
  agri_officer: {
    labelTh: "นักวิชาการเกษตร / เกษตรอำเภอ",
    colorClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  },
  coop_leader: {
    labelTh: "ผู้นำสหกรณ์ / ประธานแปลงใหญ่",
    colorClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  smart_farmer: {
    labelTh: "Smart Farmer โคราช",
    colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  farmer: {
    labelTh: "เกษตรกรสมาชิก",
    colorClass: "bg-slate-800 text-slate-300 border-slate-700",
  },
};

export type ReputationBadgeKey =
  | "master_agronomist"
  | "expert_farmer"
  | "helpful_member"
  | "active_contributor"
  | "novice";

export interface ReputationBadgeMeta {
  key: ReputationBadgeKey;
  labelTh: string;
  labelEn: string;
  minPoints: number;
  badgeColorClass: string;
  bgLightClass: string;
  iconName: string;
  descriptionTh: string;
}

export const REPUTATION_BADGE_CONFIG: Record<ReputationBadgeKey, ReputationBadgeMeta> = {
  master_agronomist: {
    key: "master_agronomist",
    labelTh: "ปรมาจารย์เกษตรอัจฉริยะ",
    labelEn: "Master Agronomist",
    minPoints: 500,
    badgeColorClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    bgLightClass: "from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/50",
    iconName: "Crown",
    descriptionTh: "ผู้นำองค์ความรู้ระดับสูง ได้รับการรับรองคำตอบและขอบคุณจากสมาชิกอย่างล้นหลาม",
  },
  expert_farmer: {
    key: "expert_farmer",
    labelTh: "ปราชญ์เกษตรกร",
    labelEn: "Expert Farmer",
    minPoints: 250,
    badgeColorClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    bgLightClass: "from-amber-500/20 to-yellow-500/20 text-amber-200 border-amber-500/50",
    iconName: "Award",
    descriptionTh: "เกษตรกรผู้เชี่ยวชาญ มีคำตอบที่ได้รับการรับรองและแบ่งปันเทคนิคจนได้ผลผลิตสูง",
  },
  helpful_member: {
    key: "helpful_member",
    labelTh: "สมาชิกผู้เกื้อกูล",
    labelEn: "Helpful Member",
    minPoints: 120,
    badgeColorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    bgLightClass: "from-emerald-500/20 to-teal-500/20 text-emerald-200 border-emerald-500/50",
    iconName: "HeartHandshake",
    descriptionTh: "สมาชิกผู้มีน้ำใจ ช่วยตอบคำถามเพื่อนเกษตรกรสม่ำเสมอและได้รับคะแนนโหวตสูง",
  },
  active_contributor: {
    key: "active_contributor",
    labelTh: "สมาชิกไฟแรง",
    labelEn: "Active Contributor",
    minPoints: 50,
    badgeColorClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    bgLightClass: "from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-500/50",
    iconName: "Zap",
    descriptionTh: "ผู้ร่วมเสวนาประจำแปลง มีส่วนร่วมตั้งกระทู้และแลกเปลี่ยนข้อมูลอย่างต่อเนื่อง",
  },
  novice: {
    key: "novice",
    labelTh: "เกษตรกรเริ่มต้น",
    labelEn: "Novice Farmer",
    minPoints: 0,
    badgeColorClass: "bg-slate-800 text-slate-300 border-slate-700",
    bgLightClass: "from-slate-800 to-slate-900 text-slate-300 border-slate-700",
    iconName: "Sprout",
    descriptionTh: "สมาชิกเริ่มต้น พร้อมร่วมเรียนรู้และซักถามปัญหาการเกษตรในพื้นที่โคราช",
  },
};

export const REPUTATION_TIER_ORDER: ReputationBadgeKey[] = [
  "master_agronomist",
  "expert_farmer",
  "helpful_member",
  "active_contributor",
  "novice",
];

export interface UserReputationProfile {
  authorId: string;
  authorName: string;
  authorRole: AuthorRole;
  districtNameTh: string;
  reputationPoints: number;
  badge: ReputationBadgeMeta;
  postsCount: number;
  repliesCount: number;
  likesReceived: number;
  expertSolutionsCount: number;
  nextTier: {
    badge?: ReputationBadgeMeta;
    pointsNeeded: number;
    progressPercent: number;
  };
}

/**
 * Calculates dynamic reputation profile for an author based on all current posts and replies in the platform.
 */
export function calculateUserReputation(
  authorIdentifier: string,
  allPosts: ForumPostItem[]
): UserReputationProfile {
  let postsCount = 0;
  let repliesCount = 0;
  let likesReceived = 0;
  let expertSolutionsCount = 0;
  let detectedRole: AuthorRole = "farmer";
  let detectedDistrict = "อ.เมืองนครราชสีมา";
  let resolvedName = authorIdentifier;

  // 1. Scan author posts
  for (const post of allPosts) {
    if (post.authorId === authorIdentifier || post.authorName === authorIdentifier) {
      postsCount++;
      resolvedName = post.authorName;
      detectedRole = post.authorRole;
      detectedDistrict = post.districtNameTh;
      likesReceived += post.likesCount || 0;
    }

    // 2. Scan replies
    if (post.replies) {
      for (const reply of post.replies) {
        if (reply.authorId === authorIdentifier || reply.authorName === authorIdentifier) {
          repliesCount++;
          resolvedName = reply.authorName;
          detectedRole = reply.authorRole;
          detectedDistrict = reply.authorDistrict || detectedDistrict;
          likesReceived += reply.likesCount || 0;
          if (reply.isExpertAnswer) {
            expertSolutionsCount++;
          }
        }
      }
    }
  }

  // Base bonus points from role expertise
  let roleBonus = 0;
  if (detectedRole === "agri_officer" || detectedRole === "moderator") {
    roleBonus = 60;
  } else if (detectedRole === "smart_farmer" || detectedRole === "coop_leader") {
    roleBonus = 40;
  }

  // Point Calculation Formula:
  // Post: +15 pts
  // Reply: +10 pts
  // Like Received: +10 pts
  // Expert Certified Solution: +50 pts
  const reputationPoints =
    postsCount * 15 +
    repliesCount * 10 +
    likesReceived * 10 +
    expertSolutionsCount * 50 +
    roleBonus;

  // Determine Badge Tier (can also level up early with multiple expert answers)
  let badgeKey: ReputationBadgeKey = "novice";
  if (reputationPoints >= 500 || expertSolutionsCount >= 4) {
    badgeKey = "master_agronomist";
  } else if (reputationPoints >= 250 || expertSolutionsCount >= 2) {
    badgeKey = "expert_farmer";
  } else if (reputationPoints >= 120 || expertSolutionsCount >= 1 || repliesCount >= 4) {
    badgeKey = "helpful_member";
  } else if (reputationPoints >= 50 || postsCount + repliesCount >= 2) {
    badgeKey = "active_contributor";
  }

  const badge = REPUTATION_BADGE_CONFIG[badgeKey];

  // Calculate Next Tier Progress
  let nextBadgeKey: ReputationBadgeKey | undefined;
  if (badgeKey === "novice") nextBadgeKey = "active_contributor";
  else if (badgeKey === "active_contributor") nextBadgeKey = "helpful_member";
  else if (badgeKey === "helpful_member") nextBadgeKey = "expert_farmer";
  else if (badgeKey === "expert_farmer") nextBadgeKey = "master_agronomist";

  let nextBadge: ReputationBadgeMeta | undefined;
  let pointsNeeded = 0;
  let progressPercent = 100;

  if (nextBadgeKey) {
    nextBadge = REPUTATION_BADGE_CONFIG[nextBadgeKey];
    const prevMin = badge.minPoints;
    const targetMin = nextBadge.minPoints;
    pointsNeeded = Math.max(0, targetMin - reputationPoints);
    const range = targetMin - prevMin;
    const currentOverPrev = Math.max(0, reputationPoints - prevMin);
    progressPercent = Math.min(100, Math.round((currentOverPrev / range) * 100));
  }

  return {
    authorId: authorIdentifier,
    authorName: resolvedName,
    authorRole: detectedRole,
    districtNameTh: detectedDistrict,
    reputationPoints,
    badge,
    postsCount,
    repliesCount,
    likesReceived,
    expertSolutionsCount,
    nextTier: {
      badge: nextBadge,
      pointsNeeded,
      progressPercent,
    },
  };
}

/**
 * Returns sorted list of all active contributors across the platform.
 */
export function getAllUsersReputations(allPosts: ForumPostItem[]): UserReputationProfile[] {
  const authorNames = new Set<string>();
  for (const post of allPosts) {
    authorNames.add(post.authorName);
    if (post.replies) {
      for (const reply of post.replies) {
        authorNames.add(reply.authorName);
      }
    }
  }

  const list: UserReputationProfile[] = [];
  authorNames.forEach((name) => {
    list.push(calculateUserReputation(name, allPosts));
  });

  return list.sort((a, b) => b.reputationPoints - a.reputationPoints);
}

export const INITIAL_SEEDED_FORUM_POSTS: ForumPostItem[] = [
  {
    id: "post-slcmv-soengsang-01",
    authorId: "usr-farmer-chuchart-01",
    authorName: "ลุงชูชาติ แปลงใหญ่มันสำปะหลังเสิงสาง",
    authorRole: "smart_farmer",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
    category: "cassava",
    categoryNameTh: "มันสำปะหลัง & SLCMV",
    postType: "advice",
    cropTag: "มันสำปะหลัง (กวก. 50 / ระยอง 72)",
    title: "วิธีสังเกตและถอนทำลายต้นมันสำปะหลังที่เป็นโรคใบด่าง (SLCMV) ระยะ 1–2 เดือนแรก ไม่ให้ลามทั้งแปลง",
    content:
      "สวัสดีเพื่อนเกษตรกรชาวไร่มันโคราชครับ จากประสบการณ์ที่แปลงเสิงสางช่วงฝนเริ่มตก สังเกตเห็นแมลงหวี่ขาวยาสูบบินเกาะใต้ใบอ่อน แนะนำให้เดินสำรวจแปลงทุก 5–7 วัน หากพบใบยอดหงิกงอ ด่างเหลือง ให้รีบถอนต้นใส่ถุงดำนำไปตากแดดให้ตาย อย่าเพิ่งตัดกิ่งทิ้งในแปลงเด็ดขาดเพราะแมลงหวี่ขาวจะดูดน้ำเลี้ยงแล้วพาเชื้อไปติดต้นอื่นครับ ตอนนี้โรงงานเอี่ยมบูรพาและเกษตรอำเภอมีชุดตรวจ Strip test ให้ยืมฟรีด้วยนะครับ ใครสงสัยลองติดต่อดูได้ครับ",
    likesCount: 28,
    replyCount: 3,
    isPinned: true,
    isLocked: false,
    isResolved: true,
    moderationStatus: "active",
    reportCount: 0,
    moderatorNote:
      "คำแนะนำสอดคล้องกับระเบียบกรมวิชาการเกษตร: การขุดทำลายในระยะเริ่มต้นช่วยยับยั้งการระบาดได้ผลดีที่สุด",
    createdAt: "2026-10-14T08:30:00Z",
    updatedAt: "2026-10-14T08:30:00Z",
    replies: [
      {
        id: "rep-01-01",
        postId: "post-slcmv-soengsang-01",
        authorId: "usr-officer-nma-04",
        authorName: "นักวิชาการส่งเสริมการเกษตร อ.เสิงสาง",
        authorRole: "agri_officer",
        authorDistrict: "อ.เสิงสาง",
        content:
          "ขอบคุณลุงชูชาติมากครับ ขอเสริมว่าหากพบแมลงหวี่ขาวระบาดหนาแน่น ให้พ่นสารชีวภัณฑ์บิวเวอร์เรีย (Beauveria bassiana) ในช่วงแดดร่มตอนเย็น หรือใช้สารตามคำแนะนำของกรมวิชาการเกษตร เช่น อะซีทามิพริด โดยต้องงดพ่นก่อนเก็บเกี่ยวตามระยะปลอดภัยครับ",
        likesCount: 15,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T09:15:00Z",
        updatedAt: "2026-10-14T09:15:00Z",
      },
      {
        id: "rep-01-02",
        postId: "post-slcmv-soengsang-01",
        authorId: "usr-farmer-sommai-02",
        authorName: "สมหมาย ไร่มันด่านขุนทด",
        authorRole: "farmer",
        authorDistrict: "อ.ด่านขุนทด",
        content:
          "ที่ด่านขุนทดเริ่มพบประปรายเหมือนกันครับ ถอนทิ้งไปแล้ว 12 ต้น ดีที่ตรวจเร็ว ขอบคุณคำแนะนำเรื่องถุงดำตากแดดครับ",
        likesCount: 6,
        isExpertAnswer: false,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T10:40:00Z",
        updatedAt: "2026-10-14T10:40:00Z",
      },
      {
        id: "rep-01-03",
        postId: "post-slcmv-soengsang-01",
        authorId: "usr-mod-system-01",
        authorName: "ฐิติวัสส์ กาญจนพิมาย (ระบบ SmartAgri)",
        authorRole: "moderator",
        authorDistrict: "มรภ.นครราชสีมา",
        content:
          "สามารถใช้กล้องในโมดูล 'คลินิกเกษตร AI' สแกนภาพใบที่มีอาการ เพื่อยืนยันว่าเป็นโรคใบด่าง SLCMV หรือเพลี้ยแป้งสีชมพู พร้อมรับใบสรุปวิธีรักษาได้ทันทีครับ",
        likesCount: 22,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T11:20:00Z",
        updatedAt: "2026-10-14T11:20:00Z",
      },
    ],
  },
  {
    id: "post-baac-credit-khonburi-02",
    authorId: "usr-coop-pratheep-03",
    authorName: "ประทีป ประธานสหกรณ์การเกษตรครบุรี",
    authorRole: "coop_leader",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    category: "partnership_credit",
    categoryNameTh: "พันธมิตร 4P & สินเชื่อ ธ.ก.ส.",
    postType: "discussion",
    cropTag: "อ้อยโรงงาน & มันสำปะหลัง",
    title: "สอบถามผลการยื่นกู้สินเชื่อสีเขียว ธ.ก.ส. ดอกเบี้ย 2.50% ด้วยใบรับรอง SmartAgri มีใครผ่านอนุมัติแล้วบ้าง?",
    content:
      "ทางกลุ่มแปลงใหญ่ครบุรีนำสมาชิก 15 รายไปยื่นขอกู้เงินปรับปรุงระบบน้ำหยดโซลาร์เซลล์ที่ ธ.ก.ส. สาขาครบุรี โดยแนบใบรับรอง SmartAgri Compliance Score (คะแนนเกิน 80 จากการใช้ปุ๋ยสั่งตัดและไม่เผาอ้อย) อยากทราบว่าสาขาอื่นใช้เวลาอนุมัติกี่วันครับ และมีเงื่อนไขเอกสารอะไรเพิ่มเติมที่ต้องเตรียมบ้างครับ?",
    likesCount: 19,
    replyCount: 2,
    isPinned: false,
    isLocked: false,
    isResolved: true,
    moderationStatus: "active",
    reportCount: 0,
    createdAt: "2026-10-14T13:10:00Z",
    updatedAt: "2026-10-14T13:10:00Z",
    replies: [
      {
        id: "rep-02-01",
        postId: "post-baac-credit-khonburi-02",
        authorId: "usr-farmer-boonmee-05",
        authorName: "บุญมี ไร่อ้อยพิมาย",
        authorRole: "smart_farmer",
        authorDistrict: "อ.พิมาย",
        content:
          "ของผมที่พิมายเพิ่งได้รับอนุมัติเมื่อวานครับ ใช้เวลาประมาณ 5 วันทำการ เจ้าหน้าที่ตรวจสอบภาพถ่ายแปลงดาวเทียมว่าไม่มีจุดความร้อน (Hotspot) และคะแนนในระบบเกิน 75 ดอกเบี้ย 2.50% จริงตามที่ระบบแจ้งครับ ประหยัดดอกเบี้ยไปได้ปีละหลายหมื่น",
        likesCount: 14,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T14:25:00Z",
        updatedAt: "2026-10-14T14:25:00Z",
      },
      {
        id: "rep-02-02",
        postId: "post-baac-credit-khonburi-02",
        authorId: "usr-farmer-chuchart-01",
        authorName: "ลุงชูชาติ แปลงใหญ่มันสำปะหลังเสิงสาง",
        authorRole: "smart_farmer",
        authorDistrict: "อ.เสิงสาง",
        content:
          "เตรียมสำเนาสมุดทะเบียนเกษตรกร (ทบก.) แผนผังแปลง และใบรับรองดิจิทัลที่ดาวน์โหลดจากระบบหน้าโมดูลพันธมิตร 4P ไปด้วยครับ เจ้าหน้าที่สแกน QR Code แล้วดึงข้อมูลได้ทันทีเลย",
        likesCount: 9,
        isExpertAnswer: false,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T15:05:00Z",
        updatedAt: "2026-10-14T15:05:00Z",
      },
    ],
  },
  {
    id: "post-sugarcane-zero-burn-03",
    authorId: "usr-officer-kbs-06",
    authorName: "ทีมส่งเสริมชาวไร่อ้อย KBS ครบุรี",
    authorRole: "agri_officer",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
    category: "sugarcane",
    categoryNameTh: "อ้อยโรงงาน & ตัดอ้อยสด",
    postType: "official_notice",
    cropTag: "อ้อยโรงงาน",
    title: "ประกาศ: สิทธิประโยชน์เงินบวกอ้อยสด +120 บาท/ตัน และระบบจองคิวรถบรรทุก Smart Fast-Track",
    content:
      "ทางโรงงานน้ำตาลครบุรี (KBS) ร่วมกับแพลตฟอร์ม Korat SmartAgri เปิดรับลงทะเบียนเกษตรกรตัดอ้อยสด 100% ไม่เผาใบ โดยเกษตรกรจะได้รับ:\n1. เงินบวกเพิ่มตันละ 120 บาท จากราคาประกาศอ้อยหน้าโรงงาน\n2. สิทธิ์ใช้บัตรคิวดิจิทัล Smart Fast-Track เข้าลานชั่งน้ำหนักและเทอ้อยโดยไม่ต้องรอคิวรถบรรทุกยาวหน้าโรงงาน\n3. ท่อนพันธุ์อ้อยผ่านการแช่น้ำร้อน 50°C ปลอดโรคใบขาว (SCWL) ในราคาสวัสดิการลด 50%\nขอความร่วมมือชาวไร่อ้อยทุกคนร่วมกันลดควันและ PM2.5 ในจังหวัดนครราชสีมาครับ",
    likesCount: 34,
    replyCount: 2,
    isPinned: true,
    isLocked: false,
    isResolved: false,
    moderationStatus: "active",
    reportCount: 0,
    moderatorNote:
      "ประกาศทางการจากพันธมิตรภาคเอกชน (Public-Private-People Partnership) ข้อมูลได้รับการตรวจสอบแล้ว",
    createdAt: "2026-10-14T06:00:00Z",
    updatedAt: "2026-10-14T06:00:00Z",
    replies: [
      {
        id: "rep-03-01",
        postId: "post-sugarcane-zero-burn-03",
        authorId: "usr-farmer-samran-07",
        authorName: "สำราญ เกษตรกรหนองบุญมาก",
        authorRole: "farmer",
        authorDistrict: "อ.หนองบุญมาก",
        content:
          "ถ้ามีรถตัดอ้อยของกลุ่มแปลงใหญ่ ต้องการคิวเฉพาะช่วงเช้า สามารถจองผ่านระบบล่วงหน้าได้กี่วันครับ?",
        likesCount: 4,
        isExpertAnswer: false,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T07:30:00Z",
        updatedAt: "2026-10-14T07:30:00Z",
      },
      {
        id: "rep-03-02",
        postId: "post-sugarcane-zero-burn-03",
        authorId: "usr-officer-kbs-06",
        authorName: "ทีมส่งเสริมชาวไร่อ้อย KBS ครบุรี",
        authorRole: "agri_officer",
        authorDistrict: "อ.ครบุรี",
        content:
          "จองล่วงหน้าได้ 48 ชั่วโมงในหน้าโมดูลพันธมิตร 4P ครับ ระบบจะจัดสรรรอบเข้าหีบอ้อยสดเพื่อให้ได้ค่าความหวาน C.C.S. สูงสุดครับ",
        likesCount: 11,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-14T08:10:00Z",
        updatedAt: "2026-10-14T08:10:00Z",
      },
    ],
  },
  {
    id: "post-rice-blast-phimai-04",
    authorId: "usr-farmer-somjit-08",
    authorName: "ป้าสมจิต ทุ่งสัมฤทธิ์พิมาย",
    authorRole: "farmer",
    districtId: "phimai",
    districtNameTh: "อ.พิมาย",
    category: "rice",
    categoryNameTh: "ข้าวหอมมะลิทุ่งสัมฤทธิ์",
    postType: "question",
    cropTag: "ข้าวหอมมะลิ 105",
    title: "ข้าวหอมมะลิเริ่มตั้งท้องแต่ฝนทิ้งช่วง สภาพอากาศร้อนชื้นตอนกลางคืน เสี่ยงโรคไหม้คอรวง ควรฉีดป้องกันอย่างไร?",
    content:
      "ที่ตำบลในเมืองพิมาย ดัชนี SPI อยู่ที่ -1.15 แปลงข้าวเริ่มขาดน้ำและช่วงเช้ามีหมอกลงหนา มีเพื่อนบ้านเตือนว่าช่วงนี้โรคไหม้คอรวง (Neck Blast) มักระบาด อยากถามพี่น้องเกษตรกรว่าควรใช้สารชีวภาพตัวไหนพ่นป้องกันก่อนที่รวงจะโผล่พ้นกาบใบ เพื่อไม่ให้กระทบมาตรฐานข้าวหอมมะลิ GI ครับ?",
    likesCount: 12,
    replyCount: 2,
    isPinned: false,
    isLocked: false,
    isResolved: true,
    moderationStatus: "active",
    reportCount: 0,
    createdAt: "2026-10-13T16:20:00Z",
    updatedAt: "2026-10-13T16:20:00Z",
    replies: [
      {
        id: "rep-04-01",
        postId: "post-rice-blast-phimai-04",
        authorId: "usr-smart-wirote-09",
        authorName: "วิโรจน์ ข้าวหอมมะลิ GI ชุมพวง",
        authorRole: "smart_farmer",
        authorDistrict: "อ.ชุมพวง",
        content:
          "แนะนำใช้เชื้อราไตรโคเดอร์มา (Trichoderma harzianum) ผสมน้ำฉีดพ่นช่วงเย็นตอนแดดหมดครับ ฉีดครั้งแรกตอนข้าวระยะตั้งท้อง และพ่นซ้ำอีกครั้งตอนข้าวเริ่มแทงรวง 5% จะช่วยคุมเชื้อรา Pyricularia oryzae ได้ดีมาก และไม่ทำให้เสียมาตรฐานข้าว GI ครับ",
        likesCount: 18,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-13T17:40:00Z",
        updatedAt: "2026-10-13T17:40:00Z",
      },
      {
        id: "rep-04-02",
        postId: "post-rice-blast-phimai-04",
        authorId: "usr-officer-nma-04",
        authorName: "นักวิชาการส่งเสริมการเกษตร อ.เสิงสาง",
        authorRole: "agri_officer",
        authorDistrict: "อ.พิมาย",
        content:
          "ขอเสริมครับ ในช่วงนี้ควรลดการใส่ปุ๋ยยูเรียหรือปุ๋ยไนโตรเจนสูง เพราะจะทำให้ใบข้าวอวบน้ำและผนังเซลล์บาง เอื้อให้สปอร์เชื้อราเจาะทำลายได้ง่ายขึ้น ให้เน้นปุ๋ยโพแทสเซียมช่วยสร้างความแข็งแรงของกาบใบแทนครับ",
        likesCount: 14,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-13T18:15:00Z",
        updatedAt: "2026-10-13T18:15:00Z",
      },
    ],
  },
  {
    id: "post-fertilizer-tailored-05",
    authorId: "usr-farmer-dankhun-10",
    authorName: "ประสิทธิ์ มันสำปะหลังด่านขุนทด",
    authorRole: "farmer",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    category: "fertilizer_soil",
    categoryNameTh: "ปุ๋ยสั่งตัด & ชุดดินโคราช",
    postType: "advice",
    cropTag: "ชุดดินวาริน (Warint Soil Series) / ดินทราย",
    title: "ทดลองผสมแม่ปุ๋ยสั่งตัดสูตร 46-0-0 + 0-0-60 ช่วงมันสำปะหลัง 7 เดือน ช่วยเร่งแป้งได้ถึง 29.5%",
    content:
      "ที่ด่านขุนทดดินส่วนใหญ่เป็นดินทรายชุดวาริน ปุ๋ยเคมีสำเร็จรูปชอบถูกน้ำฝนชะล้าง ปีนี้เลยใช้โมดูลคำนวณปุ๋ยสั่งตัดในระบบ SmartAgri ช่วง 2 เดือนแรกใส่ 46-0-0 ผสม 18-46-0 พอเข้าเดือนที่ 6–7 เน้นโพแทสเซียม 0-0-60 อัตรา 18 กก./ไร่ ผลปรากฏว่าเมื่อวานนำมันไปขายที่โรงงานโชคชัย วัดเปอร์เซ็นต์แป้งได้ 29.5% ได้เงินบวกเพิ่มโบนัสแป้งสูงตันละ 150 บาท แถมลดต้นทุนปุ๋ยไปไร่ละเกือบ 400 บาท แนะนำให้เพื่อนเกษตรกรลองใช้โมดูลคำนวณดูครับ",
    likesCount: 25,
    replyCount: 1,
    isPinned: false,
    isLocked: false,
    isResolved: true,
    moderationStatus: "active",
    reportCount: 0,
    createdAt: "2026-10-12T11:00:00Z",
    updatedAt: "2026-10-12T11:00:00Z",
    replies: [
      {
        id: "rep-05-01",
        postId: "post-fertilizer-tailored-05",
        authorId: "usr-farmer-sommai-02",
        authorName: "สมหมาย ไร่มันด่านขุนทด",
        authorRole: "farmer",
        authorDistrict: "อ.ด่านขุนทด",
        content:
          "สูตรนี้ยอดเยี่ยมเลยครับพี่ประสิทธิ์ ดินทรายด่านขุนทดขาดโพแทสเซียมเยอะมาก ถ้าใส่ 0-0-60 ช่วงสะสมแป้ง หัวมันจะแน่นและน้ำหนักดีมากครับ",
        likesCount: 8,
        isExpertAnswer: true,
        isFlagged: false,
        isHidden: false,
        createdAt: "2026-10-12T12:30:00Z",
        updatedAt: "2026-10-12T12:30:00Z",
      },
    ],
  },
];
